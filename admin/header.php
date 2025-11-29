<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit;
}
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rent-Ex Admin</title>
    <link rel="stylesheet" href="../assets/css/admin.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <header class="main-header">
        <div class="header-container">
            <div class="logo-area">
                <div class="logo-text">RENT-EX</div>
                <div class="logo-sub">VERMIETUNG & TRANSPORT</div>
            </div>
            
            <nav class="main-nav">
                <a href="index.php" class="<?php echo basename($_SERVER['PHP_SELF']) == 'index.php' ? 'active' : ''; ?>">
                    <i class="fas fa-chart-bar"></i> Dashboard
                </a>
                <a href="cars.php" class="<?php echo basename($_SERVER['PHP_SELF']) == 'cars.php' ? 'active' : ''; ?>">
                    <i class="fas fa-car"></i> Fahrzeuge
                </a>
                <a href="bookings.php" class="<?php echo basename($_SERVER['PHP_SELF']) == 'bookings.php' ? 'active' : ''; ?>">
                    <i class="fas fa-calendar-alt"></i> Reservierungen
                </a>
                <a href="fahrtenbuch.php" class="<?php echo basename($_SERVER['PHP_SELF']) == 'fahrtenbuch.php' ? 'active' : ''; ?>">
                    <i class="fas fa-book"></i> Fahrtenbuch
                </a>
                <a href="#" class="">
                    <i class="fas fa-users"></i> Kunden
                </a>
                <a href="#" class="">
                    <i class="fas fa-file-invoice-dollar"></i> Finanzen
                </a>
            </nav>

            <div class="user-area">
                <div class="user-avatar">A</div>
                <div class="user-details">
                    <span class="user-name">Admin User</span>
                    <span class="user-role">Administrator</span>
                </div>
            </div>
        </div>
    </header>
    <main class="main-content">
