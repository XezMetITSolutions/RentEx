<?php
session_start();
if (!isset($_SESSION['admin_logged_in'])) {
    header('Location: login.php');
    exit;
}
require_once '../includes/db.php';
include 'header.php'; // Admin header

// Stats
$stats = [
    'cars' => $pdo->query("SELECT COUNT(*) FROM cars")->fetchColumn(),
    'bookings' => 0, // Mock for now or table lookup
    'revenue' => 0
];
?>

<div class="admin-container" style="padding: 2rem; color: #fff;">
    <h1 class="title-lg" style="color: #fff; margin-bottom: 2rem;">Dashboard</h1>
    
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; margin-bottom: 4rem;">
        <div class="glass" style="padding: 2rem; border-radius: 15px; text-align: center;">
            <i class="fas fa-car" style="font-size: 3rem; color: var(--primary); margin-bottom: 1rem;"></i>
            <h3>Fahrzeuge</h3>
            <p style="font-size: 2rem; font-weight: 700;"><?php echo $stats['cars']; ?></p>
        </div>
        <div class="glass" style="padding: 2rem; border-radius: 15px; text-align: center;">
            <i class="fas fa-calendar-check" style="font-size: 3rem; color: var(--success); margin-bottom: 1rem;"></i>
            <h3>Buchungen</h3>
            <p style="font-size: 2rem; font-weight: 700;">12</p> <!-- Mock -->
        </div>
        <div class="glass" style="padding: 2rem; border-radius: 15px; text-align: center;">
            <i class="fas fa-euro-sign" style="font-size: 3rem; color: var(--accent); margin-bottom: 1rem;"></i>
            <h3>Umsatz (Mtl.)</h3>
            <p style="font-size: 2rem; font-weight: 700;">45.000 ₺</p> <!-- Mock -->
        </div>
    </div>

    <div class="glass" style="padding: 2rem; border-radius: 15px;">
        <h2 style="margin-bottom: 1rem; color: #fff;">Schnellzugriff</h2>
        <div style="display: flex; gap: 1rem;">
            <a href="cars.php" class="btn btn-primary">Fahrzeuge verwalten</a>
            <a href="bookings.php" class="btn btn-outline" style="color: #fff; border-color: #fff;">Buchungen prüfen</a>
        </div>
    </div>
</div>

<?php include 'footer.php'; ?>
