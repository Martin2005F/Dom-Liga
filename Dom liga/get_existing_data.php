<?php
header('Content-Type: application/json');

// InfinityFree DB config
$host = "sql312.infinityfree.com";
$dbname = "if0_38700771_date";
$username = "if0_38700771";
$password = "DomskaLiga";

header('Content-Type: application/json');

try {
    // Create PDO connection
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Get existing nicknames and clubs
    $stmt = $pdo->query("SELECT nickname, club FROM users");
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $nicknames = [];
    $clubs = [];
    
    foreach ($result as $row) {
        $nicknames[] = $row['nickname'];
        $clubs[] = $row['club'];
    }
    
    echo json_encode([
        'success' => true,
        'nicknames' => $nicknames,
        'clubs' => $clubs
    ]);
    
} catch (PDOException $e) {
    // Return error message
    echo json_encode([
        'success' => false, 
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>