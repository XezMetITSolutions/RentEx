<?php
session_start();
if (!isset($_SESSION['admin_logged_in'])) {
    header('Location: login.php');
    exit;
}
require_once '../includes/db.php';
include 'header.php';

// Handle Delete
if (isset($_GET['delete'])) {
    $stmt = $pdo->prepare("DELETE FROM cars WHERE id = ?");
    $stmt->execute([$_GET['delete']]);
    header('Location: cars.php');
    exit;
}

$cars = $pdo->query("SELECT * FROM cars")->fetchAll(PDO::FETCH_ASSOC);
?>

<div class="table-container">
    <div class="table-header">
        <h2>Fahrzeugliste</h2>
        <a href="car_form.php" class="btn btn-primary"><i class="fas fa-plus"></i> Neues Fahrzeug</a>
    </div>

    <table class="data-table">
        <thead>
            <tr>
                <th>Bild</th>
                <th>Marke & Modell</th>
                <th>Preis/Tag</th>
                <th>Status</th>
                <th style="text-align: right;">Aktionen</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($cars as $car): ?>
            <tr>
                <td>
                    <img src="<?php echo $car['image_url']; ?>" style="width: 80px; height: 50px; object-fit: cover; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
                </td>
                <td>
                    <div style="font-weight: 800; font-size: 1rem; color: var(--secondary);"><?php echo $car['brand']; ?> <?php echo $car['model']; ?></div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);"><?php echo $car['year']; ?> • <?php echo $car['fuel_type']; ?></div>
                </td>
                <td>
                    <div style="font-weight: 800; color: var(--primary);">€ <?php echo number_format($car['price_per_day'], 0, ',', '.'); ?></div>
                </td>
                <td>
                    <span class="status-pill <?php echo $car['status'] == 'available' ? 'status-active' : 'status-rented'; ?>">
                        <?php echo $car['status'] == 'available' ? 'Verfügbar' : 'Vermietet'; ?>
                    </span>
                </td>
                <td style="text-align: right;">
                    <div style="display: flex; gap: 10px; justify-content: flex-end;">
                        <a href="car_form.php?id=<?php echo $car['id']; ?>" class="btn" style="background: #f1f5f9; color: #475569; padding: 10px;"><i class="fas fa-edit"></i></a>
                        <a href="?delete=<?php echo $car['id']; ?>" class="btn" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 10px;" onclick="return confirm('Wirklich löschen?');"><i class="fas fa-trash"></i></a>
                    </div>
                </td>
            </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
</div>

<?php include 'footer.php'; ?>
