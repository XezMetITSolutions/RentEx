<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit;
}
require_once '../includes/db.php';

// Handle Add Car
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['add_car'])) {
    $brand = $_POST['brand'];
    $model = $_POST['model'];
    $year = $_POST['year'];
    $price = $_POST['price'];
    $fuel = $_POST['fuel'];
    $transmission = $_POST['transmission'];
    $image_url = $_POST['image_url'];

    $stmt = $pdo->prepare("INSERT INTO cars (brand, model, year, price_per_day, fuel_type, transmission, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$brand, $model, $year, $price, $fuel, $transmission, $image_url]);
    header("Location: cars.php");
    exit;
}

// Fetch Cars
$cars = $pdo->query("SELECT * FROM cars ORDER BY created_at DESC")->fetchAll();
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <title>Araç Yönetimi</title>
    <link rel="stylesheet" href="../assets/css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <div class="admin-container">
        <?php include 'sidebar.php'; ?>
        
        <div class="main-content">
            <div class="dashboard-header">
                <h2>Araç Yönetimi</h2>
                <button onclick="document.getElementById('addCarModal').style.display='block'" class="btn btn-primary">Yeni Araç Ekle</button>
            </div>

            <div style="overflow-x: auto;">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Resim</th>
                            <th>Marka/Model</th>
                            <th>Yıl</th>
                            <th>Fiyat/Gün</th>
                            <th>Durum</th>
                            <th>İşlem</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($cars as $car): ?>
                        <tr>
                            <td><img src="<?php echo $car['image_url']; ?>" style="width: 50px; height: 30px; object-fit: cover;"></td>
                            <td><?php echo htmlspecialchars($car['brand'] . ' ' . $car['model']); ?></td>
                            <td><?php echo $car['year']; ?></td>
                            <td><?php echo number_format($car['price_per_day'], 0); ?> ₺</td>
                            <td><span class="status-badge status-<?php echo $car['status'] == 'available' ? 'available' : 'rented'; ?>"><?php echo $car['status']; ?></span></td>
                            <td>
                                <a href="#" style="color: var(--primary-color);"><i class="fas fa-edit"></i></a>
                                <a href="#" style="color: var(--danger); margin-left: 10px;"><i class="fas fa-trash"></i></a>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Modal -->
    <div id="addCarModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:2000;">
        <div style="background:var(--card-bg); width:500px; margin: 100px auto; padding:2rem; border-radius:10px; border:1px solid #333;">
            <h3 style="margin-bottom:1rem;">Yeni Araç Ekle</h3>
            <form method="POST">
                <div class="form-group" style="margin-bottom:1rem;">
                    <label>Marka</label>
                    <input type="text" name="brand" required style="width:100%;">
                </div>
                <div class="form-group" style="margin-bottom:1rem;">
                    <label>Model</label>
                    <input type="text" name="model" required style="width:100%;">
                </div>
                <div style="display:flex; gap:1rem;">
                    <div class="form-group" style="margin-bottom:1rem; flex:1;">
                        <label>Yıl</label>
                        <input type="number" name="year" required style="width:100%;">
                    </div>
                    <div class="form-group" style="margin-bottom:1rem; flex:1;">
                        <label>Fiyat (Günlük)</label>
                        <input type="number" name="price" required style="width:100%;">
                    </div>
                </div>
                <div style="display:flex; gap:1rem;">
                    <div class="form-group" style="margin-bottom:1rem; flex:1;">
                        <label>Yakıt</label>
                        <select name="fuel" style="width:100%;">
                            <option>Benzin</option>
                            <option>Dizel</option>
                            <option>Elektrik</option>
                            <option>Hibrit</option>
                        </select>
                    </div>
                    <div class="form-group" style="margin-bottom:1rem; flex:1;">
                        <label>Vites</label>
                        <select name="transmission" style="width:100%;">
                            <option>Otomatik</option>
                            <option>Manuel</option>
                        </select>
                    </div>
                </div>
                <div class="form-group" style="margin-bottom:2rem;">
                    <label>Resim URL</label>
                    <input type="text" name="image_url" required style="width:100%;">
                </div>
                <div style="display:flex; justify-content:flex-end; gap:1rem;">
                    <button type="button" onclick="document.getElementById('addCarModal').style.display='none'" class="btn btn-outline">İptal</button>
                    <button type="submit" name="add_car" class="btn btn-primary">Kaydet</button>
                </div>
            </form>
        </div>
    </div>
</body>
</html>
