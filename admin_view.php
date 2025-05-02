<?php
// Simple password protection
$password = "DomskaLiga"; 
$authenticated = false;

if (isset($_POST['password']) && $_POST['password'] === $password) {
    $authenticated = true;
} elseif (isset($_GET['key']) && $_GET['key'] === hash('sha256', $password)) {
    $authenticated = true;
}

if (!$authenticated && !isset($_POST['password'])) {
    // Show login form
    ?>
    <!DOCTYPE html>
    <html lang="hr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Dom Liga Admin</title>
        <style>
            body {
                font-family: 'Roboto', sans-serif;
                background-color: #2c3e50;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
            }
            .login-form {
                background-color: #ecf0f1;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                text-align: center;
            }
            input[type="password"] {
                padding: 10px;
                margin: 10px 0;
                width: 250px;
                border-radius: 5px;
                border: 1px solid #ccc;
            }
            button {
                background-color: #1abc9c;
                border: none;
                color: white;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
            }
            button:hover {
                background-color: #16a085;
            }
        </style>
    </head>
    <body>
        <div class="login-form">
            <h2>Dom Liga Admin</h2>
            <form method="post">
                <input type="password" name="password" placeholder="Lozinka" required>
                <br>
                <button type="submit">Prijava</button>
            </form>
        </div>
    </body>
    </html>
    <?php
    exit;
} elseif (!$authenticated) {
    echo "Pogrešna lozinka!";
    exit;
}

// Read the data file
$dataFile = 'domliga_users.json';
$players = [];

if (file_exists($dataFile)) {
    $jsonData = file_get_contents($dataFile);
    if ($jsonData) {
        $players = json_decode($jsonData, true) ?: [];
    }
}

// Generate direct access link
$directLink = 'admin_view.php?key=' . hash('sha256', $password);
?>

<!DOCTYPE html>
<html lang="hr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dom Liga - Pregled Igrača</title>
    <style>
        body {
            font-family: 'Roboto', sans-serif;
            background-color: #f5f5f5;
            color: #333;
            line-height: 1.6;
            padding: 20px;
        }
        .container {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        h1 {
            color: #1abc9c;
            text-align: center;
            margin-bottom: 30px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #1abc9c;
            color: white;
        }
        tr:hover {
            background-color: #f9f9f9;
        }
        .info {
            background-color: #e7f4f0;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .copy-link {
            background-color: #3498db;
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }
        .copy-link:hover {
            background-color: #2980b9;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Dom Liga - Pregled registriranih igrača</h1>
        
        <div class="info">
            <p>Direktni link za pristup (kliknite za kopiranje): 
                <input type="text" id="directLink" value="<?php echo $directLink; ?>" readonly style="width: 60%; padding: 5px;">
                <button class="copy-link" onclick="copyLink()">Kopiraj</button>
            </p>
            <p>Ukupno registriranih igrača: <strong><?php echo count($players); ?></strong></p>
        </div>
        
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Ime</th>
                    <th>Prezime</th>
                    <th>Nickname</th>
                    <th>Klub</th>
                    <th>Datum prijave</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($players as $index => $player): ?>
                <tr>
                    <td><?php echo $index + 1; ?></td>
                    <td><?php echo htmlspecialchars($player['ime']); ?></td>
                    <td><?php echo htmlspecialchars($player['prezime']); ?></td>
                    <td><?php echo htmlspecialchars($player['nickname']); ?></td>
                    <td><?php echo htmlspecialchars($player['club']); ?></td>
                    <td><?php echo htmlspecialchars($player['timestamp']); ?></td>
                </tr>
                <?php endforeach; ?>
                <?php if (empty($players)): ?>
                <tr>
                    <td colspan="6" style="text-align: center;">Nema registriranih igrača</td>
                </tr>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
    
    <script>
        function copyLink() {
            const copyText = document.getElementById("directLink");
            copyText.select();
            document.execCommand("copy");
            alert("Link kopiran!");
        }
    </script>
</body>
</html>