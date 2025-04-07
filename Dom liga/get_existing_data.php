<?php
// Set proper content type header
header('Content-Type: application/json');

// Get the data from the POST request
$userData = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (!isset($userData['ime']) || !isset($userData['prezime']) || !isset($userData['nickname']) || !isset($userData['club'])) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

// Sanitize input
$ime = htmlspecialchars($userData['ime']);
$prezime = htmlspecialchars($userData['prezime']);
$nickname = htmlspecialchars($userData['nickname']);
$club = htmlspecialchars($userData['club']);
$timestamp = date('Y-m-d H:i:s');

// Path to data file
$dataFile = 'domliga_users.json';

// Read existing data
$existingData = [];
if (file_exists($dataFile)) {
    $jsonData = file_get_contents($dataFile);
    if ($jsonData) {
        $existingData = json_decode($jsonData, true) ?: [];
    }
}

// Check for duplicate nickname
foreach ($existingData as $user) {
    if (strtolower($user['nickname']) === strtolower($nickname)) {
        echo json_encode(['success' => false, 'message' => 'Nickname already exists']);
        exit;
    }
}

// Check for duplicate club
foreach ($existingData as $user) {
    if ($user['club'] === $club) {
        echo json_encode(['success' => false, 'message' => 'Club already taken']);
        exit;
    }
}

// Add new user
$newUser = [
    'ime' => $ime,
    'prezime' => $prezime,
    'nickname' => $nickname,
    'club' => $club,
    'timestamp' => $timestamp
];
$existingData[] = $newUser;

// Save data back to file
$success = file_put_contents($dataFile, json_encode($existingData, JSON_PRETTY_PRINT));

if ($success) {
    // Also append to text file for easy viewing
    $textFile = 'domliga_players.txt';
    $playerData = "[$timestamp] $ime $prezime ($nickname) - $club\n";
    file_put_contents($textFile, $playerData, FILE_APPEND);
    
    echo json_encode(['success' => true, 'message' => 'User registered successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to save data']);
}