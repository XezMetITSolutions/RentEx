<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
if (!isset($_SESSION['admin_logged_in'])) {
    header("Location: login.php");
    exit;
}
$current_page = basename($_SERVER['PHP_SELF']);
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rentex Admin Portal</title>
    <link rel="stylesheet" href="../assets/css/admin.css?v=<?php echo time(); ?>">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        /* Fallback Styles to prevent layout collapse */
        .admin-layout { display: flex; min-height: 100vh; background: #f8fafc; }
        .sidebar { width: 280px; background: #1e293b; color: white; height: 100vh; position: fixed; left: 0; top: 0; z-index: 1000; padding: 2rem; box-sizing: border-box; }
        .main-area { margin-left: 280px; flex: 1; min-height: 100vh; }
        .top-bar { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 3rem; background: white; position: sticky; top: 0; border-bottom: 1px solid #e2e8f0; }
        .sidebar-logo { font-size: 1.8rem; font-weight: 800; margin-bottom: 3rem; text-transform: uppercase; }
        .sidebar-nav a { display: flex; align-items: center; gap: 15px; padding: 12px; color: rgba(255,255,255,0.6); text-decoration: none; border-radius: 12px; margin-bottom: 8px; }
        @media (max-width: 1024px) {
            .sidebar { width: 80px; padding: 1rem; }
            .sidebar span, .sidebar-logo span:not(:first-child) { display: none; }
            .main-area { margin-left: 80px; }
        }
    </style>
</head>
<body>
    <div class="admin-layout">
        <aside class="sidebar">
            <div class="sidebar-logo">
                RENT<span>EX</span>
            </div>
            
            <nav class="sidebar-nav">
                <a href="index.php" class="<?php echo $current_page == 'index.php' ? 'active' : ''; ?>">
                    <i class="fas fa-th-large"></i> <span>Dashboard</span>
                </a>
                <a href="cars.php" class="<?php echo $current_page == 'cars.php' ? 'active' : ''; ?>">
                    <i class="fas fa-car"></i> <span>Fahrzeuge</span>
                </a>
                <a href="bookings.php" class="<?php echo $current_page == 'bookings.php' ? 'active' : ''; ?>">
                    <i class="fas fa-calendar-check"></i> <span>Reservierungen</span>
                </a>
                <a href="fahrtenbuch.php" class="<?php echo $current_page == 'fahrtenbuch.php' ? 'active' : ''; ?>">
                    <i class="fas fa-route"></i> <span>Fahrtenbuch</span>
                </a>
                <a href="pos.php" class="<?php echo $current_page == 'pos.php' ? 'active' : ''; ?>">
                    <i class="fas fa-cash-register"></i> <span>Kasse (POS)</span>
                </a>
                <a href="customers.php" class="<?php echo $current_page == 'customers.php' ? 'active' : ''; ?>">
                    <i class="fas fa-users"></i> <span>Kunden</span>
                </a>
                <a href="finances.php" class="<?php echo $current_page == 'finances.php' ? 'active' : ''; ?>">
                    <i class="fas fa-chart-pie"></i> <span>Finanzen</span>
                </a>
                <a href="settings.php" class="<?php echo $current_page == 'settings.php' ? 'active' : ''; ?>">
                    <i class="fas fa-sliders-h"></i> <span>Einstellungen</span>
                </a>
            </nav>

            <div class="sidebar-footer">
                <a href="logout.php" class="logout-btn">
                    <i class="fas fa-sign-out-alt"></i> <span>Abmelden</span>
                </a>
            </div>
        </aside>

        <main class="main-area">
            <header class="top-bar" id="adminTopBar">
                <div class="page-info">
                    <h1><?php 
                        switch($current_page) {
                            case 'dashboard.php': case 'index.php': echo 'Dashboard Overview'; break;
                            case 'cars.php': case 'car_form.php': echo 'Fahrzeugverwaltung'; break;
                            case 'bookings.php': echo 'Reservierungen'; break;
                            case 'fahrtenbuch.php': echo 'Fahrtenbuch'; break;
                            case 'pos.php': echo 'Kassen-System'; break;
                            case 'customers.php': echo 'Kundenverwaltung'; break;
                            case 'finances.php': echo 'Finanzen & Statistik'; break;
                            case 'settings.php': echo 'Systemeinstellungen'; break;
                            default: echo 'Admin Portal';
                        }
                    ?></h1>
                    <p>Willkommen zurück, Administrator</p>
                </div>
                
                <div class="user-profile">
                    <div class="user-avatar">A</div>
                    <span class="user-name">Admin User</span>
                </div>
            </header>

            <div class="content-wrapper">

            <script>
                window.onscroll = function() {
                    const topBar = document.getElementById('adminTopBar');
                    if (window.pageYOffset > 20) {
                        topBar.classList.add('scrolled');
                    } else {
                        topBar.classList.remove('scrolled');
                    }
                };
            </script>
