<?php
require_once 'header.php';
require_once '../includes/db.php';

// Handle Add Entry
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['add_entry'])) {
    $car_id = $_POST['car_id'];
    $driver_name = $_POST['driver_name'];
    $trip_date = $_POST['trip_date'];
    $start_time = $_POST['start_time'];
    $end_time = $_POST['end_time'];
    $start_location = $_POST['start_location'];
    $end_location = $_POST['end_location'];
    $start_km = $_POST['start_km'];
    $end_km = $_POST['end_km'];
    $purpose = $_POST['purpose'];

    $stmt = $pdo->prepare("INSERT INTO fahrtenbuch (car_id, driver_name, trip_date, start_time, end_time, start_location, end_location, start_km, end_km, purpose) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$car_id, $driver_name, $trip_date, $start_time, $end_time, $start_location, $end_location, $start_km, $end_km, $purpose]);
    header("Location: fahrtenbuch.php");
    exit;
}

// Handle Delete
if (isset($_GET['delete'])) {
    $id = $_GET['delete'];
    $stmt = $pdo->prepare("DELETE FROM fahrtenbuch WHERE id = ?");
    $stmt->execute([$id]);
    header("Location: fahrtenbuch.php");
    exit;
}

// Fetch Cars for Dropdown
$cars_stmt = $pdo->query("SELECT id, brand, model, license_plate FROM cars ORDER BY brand, model");
$cars = $cars_stmt->fetchAll();

// Fetch Entries
$filter_car = $_GET['car_id'] ?? '';
$filter_month = $_GET['month'] ?? date('Y-m');

$query = "SELECT f.*, c.brand, c.model, c.license_plate 
          FROM fahrtenbuch f 
          JOIN cars c ON f.car_id = c.id 
          WHERE 1=1";
$params = [];

if ($filter_car) {
    $query .= " AND f.car_id = ?";
    $params[] = $filter_car;
}

if ($filter_month) {
    $query .= " AND DATE_FORMAT(f.trip_date, '%Y-%m') = ?";
    $params[] = $filter_month;
}

$query .= " ORDER BY f.trip_date DESC, f.start_time DESC";
$stmt = $pdo->prepare($query);
$stmt->execute($params);
$entries = $stmt->fetchAll();

// Calculate Total Distance
$total_distance = 0;
foreach ($entries as $entry) {
    $total_distance += ($entry['end_km'] - $entry['start_km']);
}
?>

<div style="display: flex; gap: 2rem; margin-bottom: 2rem; align-items: center; background: white; padding: 1.5rem; border-radius: var(--radius); box-shadow: var(--shadow);">
    <div style="flex: 1; display: flex; gap: 1rem;">
        <select onchange="window.location.href='?car_id='+this.value+'&month=<?php echo $filter_month; ?>'" style="padding: 10px; border-radius: 10px; border: 1px solid var(--border); background: #f8fafc; outline: none; font-weight: 600;">
            <option value="">Alle Fahrzeuge</option>
            <?php foreach ($cars as $car): ?>
                <option value="<?php echo $car['id']; ?>" <?php echo $filter_car == $car['id'] ? 'selected' : ''; ?>>
                    <?php echo htmlspecialchars($car['brand'] . ' ' . $car['model'] . ' (' . $car['license_plate'] . ')'); ?>
                </option>
            <?php endforeach; ?>
        </select>
        <input type="month" value="<?php echo $filter_month; ?>" onchange="window.location.href='?month='+this.value+'&car_id=<?php echo $filter_car; ?>'" style="padding: 10px; border-radius: 10px; border: 1px solid var(--border); background: #f8fafc; outline: none; font-weight: 600;">
    </div>
    
    <div style="text-align: right; margin-right: 2rem;">
        <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px;">Gesamtstrecke</div>
        <div style="font-size: 1.5rem; font-weight: 800; color: #10b981;"><?php echo number_format($total_distance, 0, ',', '.'); ?> km</div>
    </div>

    <button onclick="document.getElementById('addEntryModal').style.display='flex'" class="btn btn-primary">
        <i class="fas fa-plus"></i> Neue Fahrt
    </button>
</div>

<div class="table-container">
    <table class="data-table">
        <thead>
            <tr>
                <th>Datum & Zeit</th>
                <th>Fahrzeug</th>
                <th>Fahrer</th>
                <th>Route</th>
                <th>Distanz</th>
                <th>Zweck</th>
                <th style="text-align: right;"></th>
            </tr>
        </thead>
        <tbody>
            <?php if (count($entries) > 0): ?>
                <?php foreach ($entries as $entry): ?>
                <tr>
                    <td>
                        <div style="font-weight: 700;"><?php echo date('d.m.Y', strtotime($entry['trip_date'])); ?></div>
                        <div style="font-size: 0.8rem; color: var(--text-muted);"><?php echo substr($entry['start_time'], 0, 5); ?> - <?php echo substr($entry['end_time'], 0, 5); ?></div>
                    </td>
                    <td>
                        <div style="font-weight: 600;"><?php echo htmlspecialchars($entry['brand'] . ' ' . $entry['model']); ?></div>
                        <div style="font-family: monospace; font-size: 0.75rem; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; display: inline-block; margin-top: 4px;"><?php echo htmlspecialchars($entry['license_plate']); ?></div>
                    </td>
                    <td style="font-weight: 600;"><?php echo htmlspecialchars($entry['driver_name']); ?></td>
                    <td>
                        <div style="font-size: 0.85rem;"><i class="fas fa-map-marker-alt" style="color: #10b981; width: 15px;"></i> <?php echo htmlspecialchars($entry['start_location']); ?></div>
                        <div style="font-size: 0.85rem;"><i class="fas fa-flag-checkered" style="color: #ef4444; width: 15px;"></i> <?php echo htmlspecialchars($entry['end_location']); ?></div>
                    </td>
                    <td>
                        <div style="font-weight: 800; color: #10b981;"><?php echo number_format($entry['end_km'] - $entry['start_km'], 0, ',', '.'); ?> km</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted);"><?php echo number_format($entry['start_km'], 0, ',', '.'); ?> → <?php echo number_format($entry['end_km'], 0, ',', '.'); ?></div>
                    </td>
                    <td style="font-size: 0.85rem; color: #475569; max-width: 200px;"><?php echo htmlspecialchars($entry['purpose']); ?></td>
                    <td style="text-align: right;">
                        <a href="?delete=<?php echo $entry['id']; ?>" onclick="return confirm('Eintrag wirklich löschen?')" class="btn" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 10px;"><i class="fas fa-trash"></i></a>
                    </td>
                </tr>
                <?php endforeach; ?>
            <?php else: ?>
                <tr>
                    <td colspan="7" style="text-align: center; padding: 3rem; color: var(--text-muted);">Keine Einträge für diesen Zeitraum gefunden.</td>
                </tr>
            <?php endif; ?>
        </tbody>
    </table>
</div>

<!-- Modal remains mostly same but styled -->
<div id="addEntryModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); backdrop-filter: blur(5px); z-index:2000; align-items: center; justify-content: center;">
    <div style="background:white; width:650px; padding:3rem; border-radius:30px; box-shadow: 0 30px 60px rgba(0,0,0,0.2); max-height: 90vh; overflow-y: auto;">
        <h2 style="margin-bottom:2rem; font-weight: 800; letter-spacing: -1px;">Neue Fahrt protokollieren</h2>
        <form method="POST">
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1.5rem; margin-bottom: 1.5rem;">
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-size: 0.8rem; font-weight:700; color: var(--primary); text-transform: uppercase;">Fahrzeug</label>
                    <select name="car_id" required style="width:100%; padding: 15px; border: 1px solid var(--border); border-radius: 15px; background: #f8fafc; font-weight: 600;">
                        <?php foreach ($cars as $car): ?>
                            <option value="<?php echo $car['id']; ?>">
                                <?php echo htmlspecialchars($car['brand'] . ' ' . $car['model'] . ' (' . $car['license_plate'] . ')'); ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-size: 0.8rem; font-weight:700; color: var(--primary); text-transform: uppercase;">Fahrer</label>
                    <input type="text" name="driver_name" required placeholder="Name des Fahrers" style="width:100%; padding: 15px; border: 1px solid var(--border); border-radius: 15px; background: #f8fafc; font-weight: 600;">
                </div>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 0.5fr 0.5fr; gap:1.5rem; margin-bottom: 1.5rem;">
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-size: 0.8rem; font-weight:700; color: var(--primary); text-transform: uppercase;">Datum</label>
                    <input type="date" name="trip_date" required value="<?php echo date('Y-m-d'); ?>" style="width:100%; padding: 15px; border: 1px solid var(--border); border-radius: 15px; background: #f8fafc; font-weight: 600;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-size: 0.8rem; font-weight:700; color: var(--primary); text-transform: uppercase;">Start</label>
                    <input type="time" name="start_time" required value="08:00" style="width:100%; padding: 15px; border: 1px solid var(--border); border-radius: 15px; background: #f8fafc; font-weight: 600;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-size: 0.8rem; font-weight:700; color: var(--primary); text-transform: uppercase;">Ende</label>
                    <input type="time" name="end_time" required value="17:00" style="width:100%; padding: 15px; border: 1px solid var(--border); border-radius: 15px; background: #f8fafc; font-weight: 600;">
                </div>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1.5rem; margin-bottom: 1.5rem;">
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-size: 0.8rem; font-weight:700; color: var(--primary); text-transform: uppercase;">Startort</label>
                    <input type="text" name="start_location" required placeholder="z.B. Büro Feldkirch" style="width:100%; padding: 15px; border: 1px solid var(--border); border-radius: 15px; background: #f8fafc; font-weight: 600;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-size: 0.8rem; font-weight:700; color: var(--primary); text-transform: uppercase;">Zielort</label>
                    <input type="text" name="end_location" required placeholder="z.B. Kunde Dornbirn" style="width:100%; padding: 15px; border: 1px solid var(--border); border-radius: 15px; background: #f8fafc; font-weight: 600;">
                </div>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1.5rem; margin-bottom: 1.5rem;">
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-size: 0.8rem; font-weight:700; color: var(--primary); text-transform: uppercase;">KM Stand Start</label>
                    <input type="number" name="start_km" required placeholder="0" style="width:100%; padding: 15px; border: 1px solid var(--border); border-radius: 15px; background: #f8fafc; font-weight: 600;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-size: 0.8rem; font-weight:700; color: var(--primary); text-transform: uppercase;">KM Stand Ende</label>
                    <input type="number" name="end_km" required placeholder="0" style="width:100%; padding: 15px; border: 1px solid var(--border); border-radius: 15px; background: #f8fafc; font-weight: 600;">
                </div>
            </div>

            <div style="margin-bottom:2.5rem;">
                <label style="display: block; margin-bottom: 0.5rem; font-size: 0.8rem; font-weight:700; color: var(--primary); text-transform: uppercase;">Grund der Fahrt</label>
                <textarea name="purpose" required rows="3" placeholder="Grund für die Fahrt..." style="width:100%; padding: 15px; border: 1px solid var(--border); border-radius: 15px; background: #f8fafc; font-weight: 600; font-family: inherit;"></textarea>
            </div>

            <div style="display:flex; justify-content:flex-end; gap:1rem;">
                <button type="button" onclick="document.getElementById('addEntryModal').style.display='none'" class="btn" style="background: #f1f5f9; color: #475569;">Abbrechen</button>
                <button type="submit" name="add_entry" class="btn btn-primary" style="background: #10b981; box-shadow: 0 10px 20px rgba(16, 185, 129, 0.2);">Eintrag speichern</button>
            </div>
        </form>
    </div>
</div>

<?php require_once 'footer.php'; ?>
