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
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login - LuxeAdmin</title>
    <link rel="stylesheet" href="../assets/css/admin.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            background-color: var(--secondary-color);
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
        }
        .login-box {
            background: var(--card-bg);
            padding: 2.5rem;
            border-radius: 8px;
            width: 100%;
            max-width: 400px;
            box-shadow: var(--shadow-md);
            border-top: 4px solid var(--primary-color);
        }
        .login-header {
            text-align: center;
            margin-bottom: 2rem;
        }
        .login-header h2 {
            color: var(--secondary-color);
            font-weight: 700;
            margin-bottom: 0.5rem;
        }
        .login-header span {
            color: var(--primary-color);
        }
        .form-control {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid var(--border-color);
            border-radius: 4px;
            margin-bottom: 1rem;
            font-family: var(--font-main);
        }
        .form-control:focus {
            outline: none;
            border-color: var(--primary-color);
        }
        .btn-login {
            width: 100%;
            padding: 0.75rem;
            background-color: var(--primary-color);
            color: white;
            border: none;
            border-radius: 4px;
            font-weight: 600;
            cursor: pointer;
            transition: var(--transition);
        }
        .btn-login:hover {
            background-color: var(--primary-dark);
        }
    </style>
</head>
<body>
    <div class="login-box">
        <div class="login-header">
            <h2>Luxe<span>Admin</span></h2>
            <p style="color: var(--text-muted); font-size: 0.9rem;">Bitte melden Sie sich an</p>
        </div>
        <?php if (isset($error)) echo "<div style='background: rgba(220, 53, 69, 0.1); color: var(--danger); padding: 0.75rem; border-radius: 4px; margin-bottom: 1.5rem; font-size: 0.9rem; text-align: center;'>$error</div>"; ?>
        <form method="POST">
            <div class="form-group">
                <label style="display: block; margin-bottom: 0.5rem; font-size: 0.9rem; font-weight: 500;">Benutzername</label>
                <input type="text" name="username" class="form-control" required>
            </div>
            <div class="form-group" style="margin-bottom: 1.5rem;">
                <label style="display: block; margin-bottom: 0.5rem; font-size: 0.9rem; font-weight: 500;">Passwort</label>
                <input type="password" name="password" class="form-control" required>
            </div>
            <button type="submit" class="btn-login">Anmelden</button>
        </form>
    </div>
</body>
</html>
