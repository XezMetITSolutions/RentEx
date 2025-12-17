<?php
session_start();
if (!isset($_SESSION['admin_logged_in'])) {
    header('Location: login.php');
    exit;
}
require_once '../includes/db.php';
include 'header.php';

$car = null;
if (isset($_GET['id'])) {
    $stmt = $pdo->prepare("SELECT * FROM cars WHERE id = ?");
    $stmt->execute([$_GET['id']]);
    $car = $stmt->fetch(PDO::FETCH_ASSOC);
}

// Handle Post
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $brand = $_POST['brand'];
    $model = $_POST['model'];
    $year = $_POST['year'];
    $price = $_POST['price_per_day'];
    $fuel = $_POST['fuel_type'];
    $transmission = $_POST['transmission'];
    $image = $_POST['image_url'];
    $status = $_POST['status'];

    if (isset($_POST['id']) && $_POST['id']) {
        // Update
        $sql = "UPDATE cars SET brand=?, model=?, year=?, price_per_day=?, fuel_type=?, transmission=?, image_url=?, status=? WHERE id=?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$brand, $model, $year, $price, $fuel, $transmission, $image, $status, $_POST['id']]);
    } else {
        // Insert
        $sql = "INSERT INTO cars (brand, model, year, price_per_day, fuel_type, transmission, image_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$brand, $model, $year, $price, $fuel, $transmission, $image, $status]);
    }
    header('Location: cars.php');
    exit;
}
?>

<div class="table-container" style="max-width: 900px; margin: 0 auto;">
    <div class="table-header">
        <h2><?php echo $car ? 'Fahrzeug bearbeiten' : 'Neues Fahrzeug anlegen'; ?></h2>
        <a href="cars.php" class="btn" style="background: #f1f5f9; color: #475569;"><i class="fas fa-arrow-left"></i> Abbrechen</a>
    </div>

    <form method="POST" style="padding: 10px 0;">
        <?php if ($car): ?><input type="hidden" name="id" value="<?php echo $car['id']; ?>"><?php endif; ?>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
            <div class="form-group-modern">
                <label>Marke</label>
                <input type="text" name="brand" value="<?php echo $car ? htmlspecialchars($car['brand']) : ''; ?>" required placeholder="z.B. Mercedes-Benz">
            </div>
            <div class="form-group-modern">
                <label>Modell</label>
                <input type="text" name="model" value="<?php echo $car ? htmlspecialchars($car['model']) : ''; ?>" required placeholder="z.B. S-Class">
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
            <div class="form-group-modern">
                <label>Baujahr</label>
                <input type="number" name="year" value="<?php echo $car ? $car['year'] : date('Y'); ?>" required>
            </div>
            <div class="form-group-modern">
                <label>Mietpreis pro Tag (€)</label>
                <input type="number" name="price_per_day" value="<?php echo $car ? $car['price_per_day'] : ''; ?>" required placeholder="0.00">
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
            <div class="form-group-modern">
                <label>Kraftstoffart</label>
                <select name="fuel_type">
                    <option value="Benzin" <?php if($car && $car['fuel_type'] == 'Benzin') echo 'selected'; ?>>Benzin</option>
                    <option value="Diesel" <?php if($car && $car['fuel_type'] == 'Diesel') echo 'selected'; ?>>Diesel</option>
                    <option value="Hybrid" <?php if($car && $car['fuel_type'] == 'Hybrid') echo 'selected'; ?>>Hybrid</option>
                    <option value="Elektro" <?php if($car && $car['fuel_type'] == 'Elektro') echo 'selected'; ?>>Elektro</option>
                </select>
            </div>
            <div class="form-group-modern">
                <label>Getriebe</label>
                <select name="transmission">
                    <option value="Automatik" <?php if($car && $car['transmission'] == 'Automatik') echo 'selected'; ?>>Automatik</option>
                    <option value="Manuell" <?php if($car && $car['transmission'] == 'Manuell') echo 'selected'; ?>>Manuell</option>
                </select>
            </div>
        </div>

        <div class="form-group-modern">
            <label>Bild-URL (Vorschaubild)</label>
            <input type="text" name="image_url" value="<?php echo $car ? htmlspecialchars($car['image_url']) : ''; ?>" required placeholder="https://images.unsplash.com/...">
        </div>

        <div class="form-group-modern">
            <label>Fahrzeugstatus</label>
            <select name="status">
                <option value="available" <?php if($car && $car['status'] == 'available') echo 'selected'; ?>>Verfügbar</option>
                <option value="rented" <?php if($car && $car['status'] == 'rented') echo 'selected'; ?>>Vermietet</option>
                <option value="maintenance" <?php if($car && $car['status'] == 'maintenance') echo 'selected'; ?>>In Wartung</option>
            </select>
        </div>

        <div style="margin-top: 3rem; padding-top: 2rem; border-top: 1px solid #f0f0f0;">
            <button type="submit" class="btn btn-primary" style="width: 100%; padding: 18px; font-size: 1rem;">
                <i class="fas fa-save"></i> Fahrzeug speichern
            </button>
        </div>
    </form>
</div>

<?php include 'footer.php'; ?>
