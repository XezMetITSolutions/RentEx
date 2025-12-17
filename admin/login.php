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
        $_SESSION['admin_logged_in'] = true;
        header("Location: dashboard.php");
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
    <title>Rentex Admin Portal</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #E31E24;
            --primary-dark: #8B0000;
            --dark-bg: #0a0a0a;
            --glass: rgba(255, 255, 255, 0.05);
            --glass-border: rgba(255, 255, 255, 0.1);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Outfit', sans-serif;
        }

        body {
            background: var(--dark-bg);
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            position: relative;
        }

        /* Background Media */
        .bg-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.9) 100%);
            z-index: 1;
        }

        .bg-img {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            opacity: 0.4;
            filter: grayscale(1);
            z-index: 0;
        }

        /* Animations */
        @keyframes fadeInDown {
            from { opacity: 0; transform: translateY(-30px); }
            to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* Login Card */
        .login-card {
            position: relative;
            z-index: 10;
            width: 100%;
            max-width: 450px;
            padding: 60px 50px;
            background: rgba(20, 20, 20, 0.6);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid var(--glass-border);
            border-radius: 40px;
            box-shadow: 0 40px 100px rgba(0,0,0,0.8);
            animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        .login-header {
            text-align: center;
            margin-bottom: 45px;
        }

        .logo-text {
            font-size: 2.5rem;
            font-weight: 800;
            color: #fff;
            text-transform: uppercase;
            letter-spacing: -1px;
            margin-bottom: 10px;
            display: block;
        }

        .logo-text span {
            color: var(--primary);
        }

        .login-header p {
            color: rgba(255, 255, 255, 0.4);
            font-size: 0.95rem;
            letter-spacing: 1px;
            text-transform: uppercase;
            font-weight: 600;
        }

        /* Form Styling */
        .form-group {
            margin-bottom: 25px;
            position: relative;
        }

        .form-group i {
            position: absolute;
            left: 20px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--primary);
            font-size: 1.1rem;
            transition: all 0.3s ease;
        }

        .form-control {
            width: 100%;
            padding: 18px 20px 18px 55px;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid var(--glass-border);
            border-radius: 20px;
            color: #fff;
            font-size: 1rem;
            outline: none;
            transition: all 0.3s ease;
        }

        .form-control:focus {
            background: rgba(255, 255, 255, 0.08);
            border-color: var(--primary);
            box-shadow: 0 0 20px rgba(227, 30, 36, 0.1);
        }

        .form-control:focus + i {
            color: #fff;
            text-shadow: 0 0 10px var(--primary);
        }

        .btn-login {
            width: 100%;
            padding: 18px;
            background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
            color: #fff;
            border: none;
            border-radius: 20px;
            font-size: 1rem;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 2px;
            cursor: pointer;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            margin-top: 20px;
            box-shadow: 0 10px 25px rgba(227, 30, 36, 0.3);
        }

        .btn-login:hover {
            transform: translateY(-5px) scale(1.02);
            box-shadow: 0 20px 40px rgba(227, 30, 36, 0.5);
        }

        .btn-login:active {
            transform: translateY(0);
        }

        .error-msg {
            background: rgba(227, 30, 36, 0.1);
            border: 1px solid rgba(227, 30, 36, 0.2);
            color: #ff4d4d;
            padding: 15px;
            border-radius: 15px;
            margin-bottom: 25px;
            font-size: 0.9rem;
            text-align: center;
            font-weight: 600;
            animation: fadeInDown 0.4s ease;
        }

        .footer-links {
            text-align: center;
            margin-top: 35px;
        }

        .footer-links a {
            color: rgba(255, 255, 255, 0.3);
            text-decoration: none;
            font-size: 0.85rem;
            transition: color 0.3s ease;
        }

        .footer-links a:hover {
            color: #fff;
        }

        /* Abstract Glow */
        .glow {
            position: absolute;
            width: 500px;
            height: 500px;
            background: radial-gradient(circle, rgba(227, 30, 36, 0.15) 0%, transparent 70%);
            border-radius: 50%;
            z-index: 2;
        }
    </style>
</head>
<body>
    <img src="https://images.unsplash.com/photo-1542362567-b07e54358753?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80" class="bg-img" alt="Luxury Car">
    <div class="bg-overlay"></div>
    
    <div class="glow" style="top: -10%; right: -5%;"></div>
    <div class="glow" style="bottom: -10%; left: -5%;"></div>

    <div class="login-card">
        <div class="login-header">
            <span class="logo-text">RENT<span>EX</span></span>
            <p>Admin Portal Access</p>
        </div>

        <?php if (isset($error)): ?>
            <div class="error-msg">
                <i class="fas fa-exclamation-circle" style="margin-right: 8px;"></i>
                <?php echo $error; ?>
            </div>
        <?php endif; ?>

        <form method="POST">
            <div class="form-group">
                <input type="text" name="username" class="form-control" placeholder="Benutzername" required autofocus>
                <i class="fas fa-user-shield"></i>
            </div>
            <div class="form-group">
                <input type="password" name="password" class="form-control" placeholder="Passwort" required>
                <i class="fas fa-lock"></i>
            </div>
            
            <button type="submit" class="btn-login">
                Anmelden <i class="fas fa-arrow-right" style="margin-left: 10px; font-size: 0.8rem;"></i>
            </button>
        </form>

        <div class="footer-links">
            <a href="../index.php"><i class="fas fa-chevron-left" style="margin-right: 8px;"></i> Zurück zur Website</a>
        </div>
    </div>
</body>
</html>
