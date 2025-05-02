<?php
header('Content-Type: application/json');
// InfinityFree DB config
$host = "sql312.infinityfree.com"; 
$dbname = "if0_38700771_date"; 
$username = "if0_38700771";       
$password = "DomskaLiga";       

// Get user data


// Get the JSON data from the request
$jsonData = file_get_contents('php://input');
$userData = json_decode($jsonData, true);

// Validate required fields
if (!isset($userData['ime']) || !isset($userData['prezime']) || 
    !isset($userData['nickname']) || !isset($userData['club'])) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

// Sanitize input
$ime = htmlspecialchars($userData['ime']);
$prezime = htmlspecialchars($userData['prezime']);
$nickname = htmlspecialchars($userData['nickname']);
$club = htmlspecialchars($userData['club']);
$email = isset($userData['email']) ? htmlspecialchars($userData['email']) : '';

try {
    // Create PDO connection
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Check for duplicates (nickname)
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE LOWER(nickname) = LOWER(?)");
    $stmt->execute([strtolower($nickname)]);
    $nicknameExists = $stmt->fetchColumn() > 0;
    
    if ($nicknameExists) {
        echo json_encode(['success' => false, 'message' => 'Nickname već postoji']);
        exit;
    }
    
    // Check for duplicates (club)
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE LOWER(club) = LOWER(?)");
    $stmt->execute([strtolower($club)]);
    $clubExists = $stmt->fetchColumn() > 0;
    
    if ($clubExists) {
        echo json_encode(['success' => false, 'message' => 'Klub je već odabran']);
        exit;
    }
    
    // Prepare SQL statement based on whether email is provided
    if (!empty($email)) {
        $stmt = $pdo->prepare("INSERT INTO users (ime, prezime, nickname, club, email, timestamp) VALUES (?, ?, ?, ?, ?, NOW())");
        $stmt->execute([$ime, $prezime, $nickname, $club, $email]);
    } else {
        $stmt = $pdo->prepare("INSERT INTO users (ime, prezime, nickname, club, timestamp) VALUES (?, ?, ?, ?, NOW())");
        $stmt->execute([$ime, $prezime, $nickname, $club]);
    }
    
    echo json_encode(['success' => true, 'message' => 'User registered successfully']);
    
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>