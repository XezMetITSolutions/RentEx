<?php
session_start();
require_once '../includes/db.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $username = $_POST['username'];
    $password = $_POST['password'];

    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['role'] = $user['role'];
        header("Location: index.php");
        exit;
    } else {
        $error = "Ungültiger Benutzername oder Passwort";
    }
}
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>Admin Login</title>
    <link rel="stylesheet" href="../assets/css/style.css">
    <style>
        .login-container {
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background: var(--background-color);
        }
        .login-box {
            background: var(--card-bg);
            padding: 3rem;
            border-radius: 10px;
            width: 100%;
            max-width: 400px;
            border: 1px solid #333;
        }
        .login-box h2 {
            text-align: center;
            margin-bottom: 2rem;
            color: var(--primary-color);
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="login-box">
            <h2>Admin Login</h2>
            <?php if (isset($error)) echo "<p style='color:red; text-align:center; margin-bottom:1rem;'>$error</p>"; ?>
            <form method="POST">
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label>Benutzername</label>
                    <input type="text" name="username" required style="width: 100%;">
                </div>
                <div class="form-group" style="margin-bottom: 2rem;">
                    <label>Passwort</label>
                    <input type="password" name="password" required style="width: 100%;">
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%;">Anmelden</button>
            </form>
        </div>
    </div>
</body>
</html>
