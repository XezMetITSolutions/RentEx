<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit;
}
require_once '../includes/db.php';

$bookings = $pdo->query("SELECT b.*, c.brand, c.model FROM bookings b JOIN cars c ON b.car_id = c.id ORDER BY b.created_at DESC")->fetchAll();
?>
<?php
require_once 'header.php';
require_once '../includes/db.php';

$bookings = $pdo->query("SELECT b.*, c.brand, c.model FROM bookings b JOIN cars c ON b.car_id = c.id ORDER BY b.created_at DESC")->fetchAll();
?>

<div class="page-title">
    <h1>Reservierungen</h1>
    <p>Übersicht aller Buchungen und deren Status.</p>
</div>

<div class="table-card">
    <div class="table-header">
        <h3>Alle Buchungen</h3>
    </div>
    <div class="table-responsive">
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
                        <div style="font-weight: 600;"><?php echo htmlspecialchars($booking['customer_name']); ?></div>
                        <div style="font-size: 0.85rem; color: var(--text-muted);"><?php echo htmlspecialchars($booking['customer_phone']); ?></div>
                    </td>
                    <td><?php echo htmlspecialchars($booking['brand'] . ' ' . $booking['model']); ?></td>
                    <td>
                        <div><?php echo date('d.m.Y', strtotime($booking['start_date'])); ?></div>
                        <div style="font-size: 0.8rem; color: var(--text-muted);">bis <?php echo date('d.m.Y', strtotime($booking['end_date'])); ?></div>
                    </td>
                    <td style="font-weight: 600;"><?php echo number_format($booking['total_price'], 2); ?> ₺</td>
                    <td>
                        <?php
                            $statusClass = 'status-rented'; // Default orange
                            if ($booking['status'] == 'confirmed') $statusClass = 'status-available'; // Green
                            if ($booking['status'] == 'completed') $statusClass = 'status-available';
                            if ($booking['status'] == 'cancelled') $statusClass = 'status-rented'; // Red/Orange
                        ?>
                        <span class="status-badge <?php echo $statusClass; ?>">
                            <?php echo ucfirst($booking['status']); ?>
                        </span>
                    </td>
                    <td>
                        <a href="#" class="btn btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;">Details</a>
                    </td>
                </tr>
                <?php endforeach; ?>
                <?php if (empty($bookings)) echo "<tr><td colspan='7' style='text-align:center; padding: 2rem;'>Keine Buchungen gefunden.</td></tr>"; ?>
            </tbody>
        </table>
    </div>
</div>

<?php require_once 'footer.php'; ?>
