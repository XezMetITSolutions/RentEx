<?php
require_once 'header.php';
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

<div class="page-title" style="display:flex; justify-content:space-between; align-items:center;">
    <div>
        <h1>Fahrzeuge</h1>
        <p>Verwalten Sie hier Ihren Fuhrpark.</p>
    </div>
    <button onclick="document.getElementById('addCarModal').style.display='flex'" class="btn btn-primary">
        <i class="fas fa-plus"></i> Neues Fahrzeug
    </button>
</div>

<div class="table-card">
    <div class="table-header">
        <h3>Fahrzeugliste</h3>
    </div>
    <div class="table-responsive">
        <table class="data-table">
            <thead>
                <tr>
                    <th>Bild</th>
                    <th>Marke/Modell</th>
                    <th>Jahr</th>
                    <th>Preis/Tag</th>
                    <th>Status</th>
                    <th>Aktion</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($cars as $car): ?>
                <tr>
                    <td><img src="<?php echo $car['image_url']; ?>" style="width: 60px; height: 40px; object-fit: cover; border-radius: 6px;"></td>
                    <td>
                        <div style="font-weight: 600;"><?php echo htmlspecialchars($car['brand']); ?></div>
                        <div style="font-size: 0.85rem; color: var(--text-muted);"><?php echo htmlspecialchars($car['model']); ?></div>
                    </td>
                    <td><?php echo $car['year']; ?></td>
                    <td><?php echo number_format($car['price_per_day'], 0); ?> ₺</td>
                    <td>
                        <span class="status-badge status-<?php echo $car['status'] == 'available' ? 'available' : 'rented'; ?>">
                            <?php echo ucfirst($car['status']); ?>
                        </span>
                    </td>
                    <td>
                        <a href="#" style="color: var(--accent); margin-right: 10px;"><i class="fas fa-edit"></i></a>
                        <a href="#" style="color: var(--danger);"><i class="fas fa-trash"></i></a>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>

<!-- Modal -->
<div id="addCarModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:2000; align-items: center; justify-content: center;">
    <div style="background:var(--card-bg); width:500px; padding:2rem; border-radius:12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
        <h3 style="margin-bottom:1.5rem; border-bottom: 1px solid var(--border); padding-bottom: 1rem;">Neues Fahrzeug hinzufügen</h3>
        <form method="POST">
            <div style="margin-bottom:1rem;">
                <label style="display: block; margin-bottom: 0.5rem; font-size: 0.9rem; font-weight:500;">Marke</label>
                <input type="text" name="brand" required style="width:100%; padding: 0.6rem; border: 1px solid var(--border); border-radius: 6px;">
            </div>
            <div style="margin-bottom:1rem;">
                <label style="display: block; margin-bottom: 0.5rem; font-size: 0.9rem; font-weight:500;">Modell</label>
                <input type="text" name="model" required style="width:100%; padding: 0.6rem; border: 1px solid var(--border); border-radius: 6px;">
            </div>
            <div style="display:flex; gap:1rem;">
                <div style="margin-bottom:1rem; flex:1;">
                    <label style="display: block; margin-bottom: 0.5rem; font-size: 0.9rem; font-weight:500;">Jahr</label>
                    <input type="number" name="year" required style="width:100%; padding: 0.6rem; border: 1px solid var(--border); border-radius: 6px;">
                </div>
                <div style="margin-bottom:1rem; flex:1;">
                    <label style="display: block; margin-bottom: 0.5rem; font-size: 0.9rem; font-weight:500;">Preis (Täglich)</label>
                    <input type="number" name="price" required style="width:100%; padding: 0.6rem; border: 1px solid var(--border); border-radius: 6px;">
                </div>
            </div>
            <div style="display:flex; gap:1rem;">
                <div style="margin-bottom:1rem; flex:1;">
                    <label style="display: block; margin-bottom: 0.5rem; font-size: 0.9rem; font-weight:500;">Kraftstoff</label>
                    <select name="fuel" style="width:100%; padding: 0.6rem; border: 1px solid var(--border); border-radius: 6px;">
                        <option>Benzin</option>
                        <option>Diesel</option>
                        <option>Elektro</option>
                        <option>Hybrid</option>
                    </select>
                </div>
                <div style="margin-bottom:1rem; flex:1;">
                    <label style="display: block; margin-bottom: 0.5rem; font-size: 0.9rem; font-weight:500;">Getriebe</label>
                    <select name="transmission" style="width:100%; padding: 0.6rem; border: 1px solid var(--border); border-radius: 6px;">
                        <option>Automatik</option>
                        <option>Manuell</option>
                    </select>
                </div>
            </div>
            <div style="margin-bottom:2rem;">
                <label style="display: block; margin-bottom: 0.5rem; font-size: 0.9rem; font-weight:500;">Bild URL</label>
                <input type="text" name="image_url" required style="width:100%; padding: 0.6rem; border: 1px solid var(--border); border-radius: 6px;">
            </div>
            <div style="display:flex; justify-content:flex-end; gap:1rem;">
                <button type="button" onclick="document.getElementById('addCarModal').style.display='none'" style="padding: 0.6rem 1.2rem; border: 1px solid var(--border); background: transparent; border-radius: 6px; cursor: pointer;">Abbrechen</button>
                <button type="submit" name="add_car" class="btn btn-primary">Speichern</button>
            </div>
        </form>
    </div>
</div>

<script>
    document.getElementById('addCarModal').style.display = 'none';
</script>

<?php require_once 'footer.php'; ?>
