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

<div class="admin-container" style="padding: 2rem; color: #fff;">
    <h1 class="title-lg" style="color: #fff; margin-bottom: 2rem;">Buchungsverwaltung</h1>

    <div class="glass" style="border-radius: 15px; overflow: hidden;">
        <table style="width: 100%; border-collapse: collapse; color: #fff;">
            <thead>
                <tr style="background: rgba(255,255,255,0.1); text-align: left;">
                    <th style="padding: 1rem;">ID</th>
                    <th style="padding: 1rem;">Fahrzeug</th>
                    <th style="padding: 1rem;">Kunde</th>
                    <th style="padding: 1rem;">Datum</th>
                    <th style="padding: 1rem;">Status</th>
                    <th style="padding: 1rem; text-align: right;">Aktionen</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($bookings as $booking): ?>
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td style="padding: 1rem;">#<?php echo $booking['id']; ?></td>
                    <td style="padding: 1rem;"><?php echo $booking['car']; ?></td>
                    <td style="padding: 1rem;"><?php echo $booking['user']; ?></td>
                    <td style="padding: 1rem;"><?php echo $booking['dates']; ?></td>
                    <td style="padding: 1rem;">
                        <span style="background: <?php echo $booking['status'] == 'confirmed' ? 'var(--success)' : '#f59e0b'; ?>; padding: 0.2rem 0.6rem; border-radius: 10px; font-size: 0.8rem; text-transform: capitalize;">
                            <?php echo $booking['status']; ?>
                        </span>
                    </td>
                    <td style="padding: 1rem; text-align: right;">
                        <?php if($booking['status'] == 'pending'): ?>
                        <button class="btn btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; background: var(--success); border:none;"><i class="fas fa-check"></i></button>
                        <button class="btn btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; background: var(--danger); border:none;"><i class="fas fa-times"></i></button>
                        <?php endif; ?>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>

<?php include 'footer.php'; ?>
