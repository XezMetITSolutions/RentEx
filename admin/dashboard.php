<?php
session_start();
if (!isset($_SESSION['admin_logged_in'])) {
    header('Location: login.php');
    exit;
}
require_once '../includes/db.php';
include 'header.php';

// Stats abrufen
$stats = [
    'cars' => 0,
    'bookings' => 0,
    'customers' => 0,
    'revenue' => 0
];

try {
    $stats['cars'] = $pdo->query("SELECT COUNT(*) FROM cars")->fetchColumn();
    $stats['bookings'] = $pdo->query("SELECT COUNT(*) FROM bookings")->fetchColumn();
    $stats['customers'] = $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'customer'")->fetchColumn();
    $stats['revenue'] = 12450; // Mock oder echte Berechnung
} catch (Exception $e) {
    // Fehlerbehandlung
}
?>

<div class="stats-grid">
    <div class="stat-card">
        <div class="stat-content">
            <h3>Fahrzeuge</h3>
            <div class="value"><?php echo $stats['cars']; ?></div>
        </div>
        <div class="stat-icon-wrap icon-red">
            <i class="fas fa-car"></i>
        </div>
    </div>
    
    <div class="stat-card">
        <div class="stat-content">
            <h3>Reservierungen</h3>
            <div class="value"><?php echo $stats['bookings']; ?></div>
        </div>
        <div class="stat-icon-wrap icon-blue">
            <i class="fas fa-calendar-check"></i>
        </div>
    </div>

    <div class="stat-card">
        <div class="stat-content">
            <h3>Kunden</h3>
            <div class="value"><?php echo $stats['customers']; ?></div>
        </div>
        <div class="stat-icon-wrap icon-green">
            <i class="fas fa-users"></i>
        </div>
    </div>

    <div class="stat-card">
        <div class="stat-content">
            <h3>Umsatz (Mt.)</h3>
            <div class="value">€ <?php echo number_format($stats['revenue'], 0, ',', '.'); ?></div>
        </div>
        <div class="stat-icon-wrap icon-red" style="background: rgba(16, 185, 129, 0.1); color: #10b981;">
            <i class="fas fa-euro-sign"></i>
        </div>
    </div>
</div>

<div class="dashboard-sections" style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem;">
    <div class="table-container">
        <div class="table-header">
            <h2>Letzte Reservierungen</h2>
            <a href="bookings.php" class="btn btn-primary" style="padding: 8px 15px; font-size: 0.8rem;">Alle ansehen</a>
        </div>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Kunde</th>
                    <th>Fahrzeug</th>
                    <th>Datum</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                <!-- Mock Data -->
                <tr>
                    <td>Max Mustermann</td>
                    <td>Mercedes S-Class</td>
                    <td>17.12.2025</td>
                    <td><span class="status-pill status-active">Aktiv</span></td>
                </tr>
                <tr>
                    <td>Anna Schmidt</td>
                    <td>BMW M4</td>
                    <td>16.12.2025</td>
                    <td><span class="status-pill status-rented">Beendet</span></td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="table-container">
        <div class="table-header">
            <h2>Status Übersicht</h2>
        </div>
        <div style="padding: 10px 0;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                <span>Verfügbar</span>
                <span style="font-weight: 800; color: #10b981;">12</span>
            </div>
            <div style="height: 8px; background: #f0f0f0; border-radius: 10px; margin-bottom: 25px;">
                <div style="width: 75%; height: 100%; background: #10b981; border-radius: 10px;"></div>
            </div>

            <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                <span>Vermietet</span>
                <span style="font-weight: 800; color: #E31E24;">4</span>
            </div>
            <div style="height: 8px; background: #f0f0f0; border-radius: 10px; margin-bottom: 25px;">
                <div style="width: 25%; height: 100%; background: #E31E24; border-radius: 10px;"></div>
            </div>
        </div>
    </div>
</div>

<?php include 'footer.php'; ?>
