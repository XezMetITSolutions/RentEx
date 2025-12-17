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

<div class="admin-container" style="padding: 2rem; color: #fff; max-width: 800px; margin: 0 auto;">
    <h1 class="title-lg" style="color: #fff; margin-bottom: 2rem;"><?php echo $car ? 'Fahrzeug bearbeiten' : 'Neues Fahrzeug'; ?></h1>

    <div class="glass" style="padding: 2rem; border-radius: 15px;">
        <form method="POST">
            <?php if ($car): ?><input type="hidden" name="id" value="<?php echo $car['id']; ?>"><?php endif; ?>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                <div class="form-group">
                    <label style="color: #aaa; margin-bottom: 0.5rem; display: block;">Marke</label>
                    <input type="text" name="brand" value="<?php echo $car ? $car['brand'] : ''; ?>" required style="width: 100%; padding: 0.8rem; background: rgba(0,0,0,0.3); border: 1px solid #444; color: #fff; border-radius: 5px;">
                </div>
                <div class="form-group">
                    <label style="color: #aaa; margin-bottom: 0.5rem; display: block;">Modell</label>
                    <input type="text" name="model" value="<?php echo $car ? $car['model'] : ''; ?>" required style="width: 100%; padding: 0.8rem; background: rgba(0,0,0,0.3); border: 1px solid #444; color: #fff; border-radius: 5px;">
                </div>
                
                <div class="form-group">
                    <label style="color: #aaa; margin-bottom: 0.5rem; display: block;">Jahr</label>
                    <input type="number" name="year" value="<?php echo $car ? $car['year'] : '2024'; ?>" required style="width: 100%; padding: 0.8rem; background: rgba(0,0,0,0.3); border: 1px solid #444; color: #fff; border-radius: 5px;">
                </div>
                <div class="form-group">
                    <label style="color: #aaa; margin-bottom: 0.5rem; display: block;">Preis pro Tag (₺)</label>
                    <input type="number" name="price_per_day" value="<?php echo $car ? $car['price_per_day'] : ''; ?>" required style="width: 100%; padding: 0.8rem; background: rgba(0,0,0,0.3); border: 1px solid #444; color: #fff; border-radius: 5px;">
                </div>

                <div class="form-group">
                    <label style="color: #aaa; margin-bottom: 0.5rem; display: block;">Kraftstoff</label>
                    <select name="fuel_type" style="width: 100%; padding: 0.8rem; background: rgba(0,0,0,0.3); border: 1px solid #444; color: #fff; border-radius: 5px;">
                        <option value="Benzin" <?php if($car && $car['fuel_type'] == 'Benzin') echo 'selected'; ?>>Benzin</option>
                        <option value="Dizel" <?php if($car && $car['fuel_type'] == 'Dizel') echo 'selected'; ?>>Dizel</option>
                        <option value="Hybrid" <?php if($car && $car['fuel_type'] == 'Hybrid') echo 'selected'; ?>>Hybrid</option>
                        <option value="Elektro" <?php if($car && $car['fuel_type'] == 'Elektro') echo 'selected'; ?>>Elektro</option>
                    </select>
                </div>
                <div class="form-group">
                    <label style="color: #aaa; margin-bottom: 0.5rem; display: block;">Getriebe</label>
                    <select name="transmission" style="width: 100%; padding: 0.8rem; background: rgba(0,0,0,0.3); border: 1px solid #444; color: #fff; border-radius: 5px;">
                        <option value="Otomatik" <?php if($car && $car['transmission'] == 'Otomatik') echo 'selected'; ?>>Otomatik</option>
                        <option value="Manuel" <?php if($car && $car['transmission'] == 'Manuel') echo 'selected'; ?>>Manuel</option>
                    </select>
                </div>
            </div>

            <div class="form-group" style="margin-top: 1.5rem;">
                <label style="color: #aaa; margin-bottom: 0.5rem; display: block;">Bild URL</label>
                <input type="text" name="image_url" value="<?php echo $car ? $car['image_url'] : ''; ?>" required style="width: 100%; padding: 0.8rem; background: rgba(0,0,0,0.3); border: 1px solid #444; color: #fff; border-radius: 5px;">
            </div>

            <div class="form-group" style="margin-top: 1.5rem;">
                <label style="color: #aaa; margin-bottom: 0.5rem; display: block;">Status</label>
                <select name="status" style="width: 100%; padding: 0.8rem; background: rgba(0,0,0,0.3); border: 1px solid #444; color: #fff; border-radius: 5px;">
                    <option value="available" <?php if($car && $car['status'] == 'available') echo 'selected'; ?>>Verfügbar</option>
                    <option value="rented" <?php if($car && $car['status'] == 'rented') echo 'selected'; ?>>Vermietet</option>
                    <option value="maintenance" <?php if($car && $car['status'] == 'maintenance') echo 'selected'; ?>>Wartung</option>
                </select>
            </div>

            <button type="submit" class="btn btn-primary" style="margin-top: 2rem; width: 100%;">Speichern</button>
        </form>
    </div>
</div>

<?php include 'footer.php'; ?>
