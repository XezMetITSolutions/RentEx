<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit;
}
require_once '../includes/db.php';

// Fetch stats
$total_cars = $pdo->query("SELECT COUNT(*) FROM cars")->fetchColumn();
$active_bookings = $pdo->query("SELECT COUNT(*) FROM bookings WHERE status = 'confirmed'")->fetchColumn();
$total_revenue = $pdo->query("SELECT SUM(total_price) FROM bookings WHERE status = 'completed'")->fetchColumn();
$recent_bookings = $pdo->query("SELECT b.*, c.brand, c.model FROM bookings b JOIN cars c ON b.car_id = c.id ORDER BY b.created_at DESC LIMIT 5")->fetchAll();
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <title>Admin Dashboard</title>
    <link rel="stylesheet" href="../assets/css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <div class="admin-container">
        <?php include 'sidebar.php'; ?>
        
        <div class="main-content">
            <div class="dashboard-header">
                <h2>Genel Bakış</h2>
                <div class="user-info">Merhaba, Admin</div>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <h3>Toplam Araç</h3>
                    <div class="value"><?php echo $total_cars; ?></div>
                </div>
                <div class="stat-card">
                    <h3>Aktif Rezervasyon</h3>
                    <div class="value"><?php echo $active_bookings; ?></div>
                </div>
                <div class="stat-card">
                    <h3>Toplam Gelir</h3>
                    <div class="value"><?php echo number_format($total_revenue ?? 0, 0, ',', '.'); ?> ₺</div>
                </div>
            </div>

            <div class="section-title" style="text-align: left; margin-bottom: 1rem;">
                <h3>Son Rezervasyonlar</h3>
            </div>
            
            <div style="overflow-x: auto;">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Müşteri</th>
                            <th>Araç</th>
                            <th>Tarih</th>
                            <th>Tutar</th>
                            <th>Durum</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($recent_bookings as $booking): ?>
                        <tr>
                            <td><?php echo htmlspecialchars($booking['customer_name']); ?></td>
                            <td><?php echo htmlspecialchars($booking['brand'] . ' ' . $booking['model']); ?></td>
                            <td><?php echo $booking['start_date'] . ' / ' . $booking['end_date']; ?></td>
                            <td><?php echo number_format($booking['total_price'], 2); ?> ₺</td>
                            <td><span class="status-badge status-<?php echo $booking['status'] == 'confirmed' ? 'available' : 'rented'; ?>"><?php echo $booking['status']; ?></span></td>
                        </tr>
                        <?php endforeach; ?>
                        <?php if (empty($recent_bookings)) echo "<tr><td colspan='5'>Henüz rezervasyon yok.</td></tr>"; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</body>
</html>
