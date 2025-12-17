<?php
session_start();
if (!isset($_SESSION['admin_logged_in'])) {
    header('Location: login.php');
    exit;
}
include 'header.php';

// Mock Bookings Data
$bookings = [
    ['id' => 101, 'car' => 'Mercedes S-Class', 'user' => 'Ahmet Yilmaz', 'dates' => '20.12 - 25.12', 'status' => 'pending'],
    ['id' => 102, 'car' => 'BMW M4', 'user' => 'Klaus Müller', 'dates' => '10.01 - 12.01', 'status' => 'confirmed']
];
?>

<div class="table-container">
    <div class="table-header">
        <h2>Aktuelle Buchungen</h2>
    </div>

    <table class="data-table">
        <thead>
            <tr>
                <th>ID</th>
                <th>Fahrzeug</th>
                <th>Kunde</th>
                <th>Zeitraum</th>
                <th>Status</th>
                <th style="text-align: right;">Aktionen</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($bookings as $booking): ?>
            <tr>
                <td style="color: var(--text-muted); font-weight: 700;">#<?php echo $booking['id']; ?></td>
                <td>
                    <div style="font-weight: 700;"><?php echo $booking['car']; ?></div>
                </td>
                <td>
                    <div style="font-weight: 600;"><?php echo $booking['user']; ?></div>
                </td>
                <td>
                    <div style="font-size: 0.9rem; color: var(--text-muted);"><?php echo $booking['dates']; ?></div>
                </td>
                <td>
                    <span class="status-pill <?php echo $booking['status'] == 'confirmed' ? 'status-active' : 'status-rented'; ?>" style="background: <?php echo $booking['status'] == 'confirmed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)'; ?>; color: <?php echo $booking['status'] == 'confirmed' ? '#10b981' : '#f59e0b'; ?>;">
                        <?php echo ucfirst($booking['status']); ?>
                    </span>
                </td>
                <td style="text-align: right;">
                    <div style="display: flex; gap: 8px; justify-content: flex-end;">
                        <?php if($booking['status'] == 'pending'): ?>
                        <button class="btn" style="background: #10b981; color: white; padding: 8px 12px; font-size: 0.8rem;"><i class="fas fa-check"></i></button>
                        <button class="btn" style="background: #ef4444; color: white; padding: 8px 12px; font-size: 0.8rem;"><i class="fas fa-times"></i></button>
                        <?php endif; ?>
                        <button class="btn" style="background: #f1f5f9; color: #475569; padding: 8px 12px; font-size: 0.8rem;"><i class="fas fa-eye"></i></button>
                    </div>
                </td>
            </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
</div>

<?php include 'footer.php'; ?>
