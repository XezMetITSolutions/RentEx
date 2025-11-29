<?php
require_once 'header.php';
require_once '../includes/db.php';

// Handle Add Car
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['add_car'])) {
    $brand = $_POST['brand'];
    $model = $_POST['model'];
    $license_plate = $_POST['license_plate'];
    $category = $_POST['category'];
    $year = $_POST['year'];
    $price = $_POST['price'];
    $fuel = $_POST['fuel'];
    $transmission = $_POST['transmission'];
    $image_url = $_POST['image_url'];

    $stmt = $pdo->prepare("INSERT INTO cars (brand, model, license_plate, category, year, price_per_day, fuel_type, transmission, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$brand, $model, $license_plate, $category, $year, $price, $fuel, $transmission, $image_url]);
    header("Location: cars.php");
    exit;
}

// Fetch Cars with Search/Filter (Basic implementation)
$search = $_GET['search'] ?? '';
$status_filter = $_GET['status'] ?? '';

$query = "SELECT * FROM cars WHERE (brand LIKE ? OR model LIKE ? OR license_plate LIKE ?)";
$params = ["%$search%", "%$search%", "%$search%"];

if ($status_filter) {
    $query .= " AND status = ?";
    $params[] = $status_filter;
}

$query .= " ORDER BY created_at DESC";
$stmt = $pdo->prepare($query);
$stmt->execute($params);
$cars = $stmt->fetchAll();

// Calculate Summary Stats
$stats = [
    'available' => 0,
    'rented' => 0,
    'maintenance' => 0
];
foreach ($cars as $car) {
    if (isset($stats[$car['status']])) {
        $stats[$car['status']]++;
    }
}
?>

<div class="page-title" style="display:flex; justify-content:space-between; align-items:center;">
    <div>
        <div style="display:flex; align-items:center; gap:1rem;">
            <div style="background:#3b82f6; color:white; width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1.2rem;">
                <i class="fas fa-car"></i>
            </div>
            <h1 style="margin:0; color:#3b82f6;">Fahrzeugverwaltung</h1>
        </div>
        <p style="margin-left: 3.5rem; margin-top: 0.2rem;">Alle Fahrzeuge verwalten und bearbeiten</p>
    </div>
    <button onclick="document.getElementById('addCarModal').style.display='flex'" class="btn btn-primary">
        <i class="fas fa-plus"></i> Fahrzeug hinzufügen
    </button>
</div>

<!-- Search & Filter -->
<div class="filter-bar">
    <div class="search-input">
        <i class="fas fa-search"></i>
        <input type="text" placeholder="Suche nach Marke, Modell oder Kennzeichen..." value="<?php echo htmlspecialchars($search); ?>">
    </div>
    <div class="filter-select">
        <i class="fas fa-filter"></i>
        <select onchange="window.location.href='?status='+this.value">
            <option value="">Alle Status</option>
            <option value="available" <?php echo $status_filter == 'available' ? 'selected' : ''; ?>>Verfügbar</option>
            <option value="rented" <?php echo $status_filter == 'rented' ? 'selected' : ''; ?>>Vermietet</option>
            <option value="maintenance" <?php echo $status_filter == 'maintenance' ? 'selected' : ''; ?>>Wartung</option>
        </select>
    </div>
</div>

<!-- Cars Table -->
<div style="background:white; border-radius:var(--radius); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow:hidden;">
    <div class="cars-table-header">
        <div>Fahrzeug</div>
        <div>Kennzeichen</div>
        <div>Typ</div>
        <div>Status</div>
        <div>Tagespreis</div>
        <div>Aktionen</div>
    </div>
    
    <?php foreach ($cars as $car): ?>
    <div class="cars-table-row">
        <div style="font-weight:700;"><?php echo htmlspecialchars($car['brand'] . ' ' . $car['model']); ?></div>
        <div><span class="license-plate"><?php echo htmlspecialchars($car['license_plate'] ?? 'N/A'); ?></span></div>
        <div style="color:#64748b;"><?php echo htmlspecialchars($car['category'] ?? 'PKW'); ?></div>
        <div>
            <?php if ($car['status'] == 'available'): ?>
                <span class="badge badge-available"><i class="fas fa-check-circle"></i> Verfügbar</span>
            <?php elseif ($car['status'] == 'rented'): ?>
                <span class="badge badge-rented"><i class="fas fa-times-circle"></i> Vermietet</span>
            <?php else: ?>
                <span class="badge badge-maintenance"><i class="fas fa-exclamation-circle"></i> Wartung</span>
            <?php endif; ?>
        </div>
        <div class="price-tag">€<?php echo number_format($car['price_per_day'], 0); ?></div>
        <div style="display:flex; gap:0.5rem;">
            <button class="action-btn btn-purple"><i class="fas fa-book-open"></i></button>
            <button class="action-btn btn-blue"><i class="fas fa-edit"></i></button>
            <button class="action-btn btn-red"><i class="fas fa-trash"></i></button>
        </div>
    </div>
    <?php endforeach; ?>
    <div class="summary-card maintenance">
        <div class="summary-label">Wartung</div>
        <div class="summary-value text-orange"><?php echo $stats['maintenance']; ?></div>
    </div>
</div>

<!-- Modal -->
<div id="addCarModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:2000; align-items: center; justify-content: center;">
    <div style="background:var(--card-bg); width:500px; padding:2rem; border-radius:12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
        <h3 style="margin-bottom:1.5rem; border-bottom: 1px solid var(--border); padding-bottom: 1rem;">Neues Fahrzeug hinzufügen</h3>
        <form method="POST">
            <div style="display:flex; gap:1rem;">
                <div style="margin-bottom:1rem; flex:1;">
                    <label style="display: block; margin-bottom: 0.5rem; font-size: 0.9rem; font-weight:500;">Marke</label>
                    <input type="text" name="brand" required style="width:100%; padding: 0.6rem; border: 1px solid var(--border); border-radius: 6px;">
                </div>
                <div style="margin-bottom:1rem; flex:1;">
                    <label style="display: block; margin-bottom: 0.5rem; font-size: 0.9rem; font-weight:500;">Modell</label>
                    <input type="text" name="model" required style="width:100%; padding: 0.6rem; border: 1px solid var(--border); border-radius: 6px;">
                </div>
            </div>
            <div style="display:flex; gap:1rem;">
                <div style="margin-bottom:1rem; flex:1;">
                    <label style="display: block; margin-bottom: 0.5rem; font-size: 0.9rem; font-weight:500;">Kennzeichen</label>
                    <input type="text" name="license_plate" required style="width:100%; padding: 0.6rem; border: 1px solid var(--border); border-radius: 6px;">
                </div>
                <div style="margin-bottom:1rem; flex:1;">
                    <label style="display: block; margin-bottom: 0.5rem; font-size: 0.9rem; font-weight:500;">Kategorie</label>
                    <select name="category" style="width:100%; padding: 0.6rem; border: 1px solid var(--border); border-radius: 6px;">
                        <option>Kleinwagen</option>
                        <option>Kombi</option>
                        <option>SUV</option>
                        <option>Transporter</option>
                        <option>Van</option>
                        <option>Elektro</option>
                    </select>
                </div>
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
