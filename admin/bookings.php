<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit;
}
require_once '../includes/db.php';

$bookings = $pdo->query("SELECT b.*, c.brand, c.model FROM bookings b JOIN cars c ON b.car_id = c.id ORDER BY b.created_at DESC")->fetchAll();
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>Buchungsverwaltung</title>
    <link rel="stylesheet" href="../assets/css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <div class="admin-container">
        <?php include 'sidebar.php'; ?>
        
        <div class="main-content">
            <div class="dashboard-header">
                <h2>Buchungsverwaltung</h2>
            </div>

            <div style="overflow-x: auto;">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Kunde</th>
                            <th>Fahrzeug</th>
                            <th>Zeitraum</th>
                            <th>Gesamtbetrag</th>
                            <th>Status</th>
                            <th>Aktion</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($bookings as $booking): ?>
                        <tr>
                            <td>#<?php echo $booking['id']; ?></td>
                            <td>
                                <?php echo htmlspecialchars($booking['customer_name']); ?><br>
                                <small style="color:var(--text-muted);"><?php echo $booking['customer_phone']; ?></small>
                            </td>
                            <td><?php echo htmlspecialchars($booking['brand'] . ' ' . $booking['model']); ?></td>
                            <td><?php echo $booking['start_date'] . ' <br> ' . $booking['end_date']; ?></td>
                            <td><?php echo number_format($booking['total_price'], 2); ?> ₺</td>
                            <td><span class="status-badge status-<?php echo $booking['status'] == 'confirmed' ? 'available' : 'rented'; ?>"><?php echo $booking['status']; ?></span></td>
                            <td>
                                <a href="#" class="btn btn-primary" style="padding: 0.3rem 0.8rem; font-size: 0.8rem;">Details</a>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                        <?php if (empty($bookings)) echo "<tr><td colspan='7'>Keine Buchungen gefunden.</td></tr>"; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</body>
</html>
