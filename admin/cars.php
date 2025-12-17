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

<div class="admin-container" style="padding: 2rem; color: #fff;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <h1 class="title-lg" style="color: #fff;">Fahrzeugverwaltung</h1>
        <a href="car_form.php" class="btn btn-primary"><i class="fas fa-plus"></i> Neues Fahrzeug</a>
    </div>

    <div class="glass" style="border-radius: 15px; overflow: hidden;">
        <table style="width: 100%; border-collapse: collapse; color: #fff;">
            <thead>
                <tr style="background: rgba(255,255,255,0.1); text-align: left;">
                    <th style="padding: 1rem;">Bild</th>
                    <th style="padding: 1rem;">Marke & Modell</th>
                    <th style="padding: 1rem;">Preis/Tag</th>
                    <th style="padding: 1rem;">Status</th>
                    <th style="padding: 1rem; text-align: right;">Aktionen</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($cars as $car): ?>
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td style="padding: 1rem;">
                        <img src="<?php echo $car['image_url']; ?>" style="width: 60px; height: 40px; object-fit: cover; border-radius: 5px;">
                    </td>
                    <td style="padding: 1rem;">
                        <strong><?php echo $car['brand']; ?></strong> <?php echo $car['model']; ?>
                        <div style="font-size: 0.8rem; color: #888;"><?php echo $car['year']; ?></div>
                    </td>
                    <td style="padding: 1rem;"><?php echo number_format($car['price_per_day'], 0, ',', '.'); ?> ₺</td>
                    <td style="padding: 1rem;">
                        <span style="background: <?php echo $car['status'] == 'available' ? 'var(--success)' : 'var(--danger)'; ?>; padding: 0.2rem 0.6rem; border-radius: 10px; font-size: 0.8rem;">
                            <?php echo $car['status']; ?>
                        </span>
                    </td>
                    <td style="padding: 1rem; text-align: right;">
                        <a href="car_form.php?id=<?php echo $car['id']; ?>" class="btn btn-outline" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;"><i class="fas fa-edit"></i></a>
                        <a href="?delete=<?php echo $car['id']; ?>" class="btn btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; background: var(--danger); border: none;" onclick="return confirm('Wirklich löschen?');"><i class="fas fa-trash"></i></a>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>

<?php include 'footer.php'; ?>
