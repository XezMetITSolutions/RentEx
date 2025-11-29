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

// Calculate Total Distance for view
$total_distance = 0;
foreach ($entries as $entry) {
    $total_distance += ($entry['end_km'] - $entry['start_km']);
}
?>

<div class="page-title" style="display:flex; justify-content:space-between; align-items:center;">
    <div>
        <div style="display:flex; align-items:center; gap:1rem;">
            <div style="background:#10b981; color:white; width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1.2rem;">
                <i class="fas fa-book"></i>
            </div>
            <h1 style="margin:0; color:#10b981;">Fahrtenbuch</h1>
        </div>
        <p style="margin-left: 3.5rem; margin-top: 0.2rem;">Fahrten protokollieren für das Finanzamt</p>
    </div>
    <button onclick="document.getElementById('addEntryModal').style.display='flex'" class="btn btn-primary" style="background-color: #10b981; border-color: #10b981;">
        <i class="fas fa-plus"></i> Neue Fahrt
    </button>
</div>

<!-- Filter Bar -->
<div class="filter-bar">
    <div class="filter-select">
        <i class="fas fa-car"></i>
        <select onchange="window.location.href='?car_id='+this.value+'&month=<?php echo $filter_month; ?>'">
            <option value="">Alle Fahrzeuge</option>
            <?php foreach ($cars as $car): ?>
                <option value="<?php echo $car['id']; ?>" <?php echo $filter_car == $car['id'] ? 'selected' : ''; ?>>
                    <?php echo htmlspecialchars($car['brand'] . ' ' . $car['model'] . ' (' . $car['license_plate'] . ')'); ?>
                </option>
            <?php endforeach; ?>
        </select>
    </div>
    <div class="filter-select">
        <i class="fas fa-calendar"></i>
        <input type="month" value="<?php echo $filter_month; ?>" onchange="window.location.href='?month='+this.value+'&car_id=<?php echo $filter_car; ?>'" style="border:none; background:transparent; outline:none; font-family:inherit;">
    </div>
    <div style="margin-left:auto; font-weight:600; color:#64748b;">
        Gesamtstrecke: <span style="color:#10b981;"><?php echo number_format($total_distance, 0, ',', '.'); ?> km</span>
    </div>
</div>

<!-- Entries Table -->
<div style="background:white; border-radius:var(--radius); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow:hidden;">
    <div class="cars-table-header" style="grid-template-columns: 1fr 1.5fr 1fr 1.5fr 1fr 1fr 1.5fr 0.5fr;">
        <div>Datum</div>
        <div>Fahrzeug</div>
        <div>Fahrer</div>
        <div>Route (Start -> Ziel)</div>
        <div>KM Stand</div>
        <div>Distanz</div>
        <div>Grund</div>
        <div></div>
    </div>
    
    <?php if (count($entries) > 0): ?>
        <?php foreach ($entries as $entry): ?>
        <div class="cars-table-row" style="grid-template-columns: 1fr 1.5fr 1fr 1.5fr 1fr 1fr 1.5fr 0.5fr;">
            <div>
                <div style="font-weight:600;"><?php echo date('d.m.Y', strtotime($entry['trip_date'])); ?></div>
                <div style="font-size:0.8rem; color:#64748b;"><?php echo substr($entry['start_time'], 0, 5); ?> - <?php echo substr($entry['end_time'], 0, 5); ?></div>
            </div>
            <div>
                <div style="font-weight:600;"><?php echo htmlspecialchars($entry['brand'] . ' ' . $entry['model']); ?></div>
                <span class="license-plate" style="font-size:0.75rem;"><?php echo htmlspecialchars($entry['license_plate']); ?></span>
            </div>
            <div><?php echo htmlspecialchars($entry['driver_name']); ?></div>
            <div>
                <div style="font-size:0.9rem;"><i class="fas fa-map-marker-alt text-green" style="color:#10b981;"></i> <?php echo htmlspecialchars($entry['start_location']); ?></div>
                <div style="font-size:0.9rem;"><i class="fas fa-flag-checkered text-red" style="color:#ef4444;"></i> <?php echo htmlspecialchars($entry['end_location']); ?></div>
            </div>
            <div>
                <div style="font-size:0.85rem;">Start: <?php echo number_format($entry['start_km'], 0, ',', '.'); ?></div>
                <div style="font-size:0.85rem;">Ende: <?php echo number_format($entry['end_km'], 0, ',', '.'); ?></div>
            </div>
            <div style="font-weight:700; color:#10b981;">
                <?php echo number_format($entry['end_km'] - $entry['start_km'], 0, ',', '.'); ?> km
            </div>
            <div style="font-size:0.9rem; color:#475569;"><?php echo htmlspecialchars($entry['purpose']); ?></div>
            <div style="display:flex; justify-content:flex-end;">
                <a href="?delete=<?php echo $entry['id']; ?>" onclick="return confirm('Eintrag wirklich löschen?')" class="action-btn btn-red"><i class="fas fa-trash"></i></a>
            </div>
        </div>
        <?php endforeach; ?>
    <?php else: ?>
        <div style="padding: 2rem; text-align: center; color: #64748b;">
            Keine Einträge für diesen Zeitraum gefunden.
        </div>
    <?php endif; ?>
</div>

<!-- Add Entry Modal -->
<div id="addEntryModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:2000; align-items: center; justify-content: center;">
    <div style="background:var(--card-bg); width:600px; padding:2rem; border-radius:12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); max-height: 90vh; overflow-y: auto;">
        <h3 style="margin-bottom:1.5rem; border-bottom: 1px solid var(--border); padding-bottom: 1rem;">Neue Fahrt protokollieren</h3>
        <form method="POST">
            <div style="display:flex; gap:1rem;">
                <div style="margin-bottom:1rem; flex:1;">
                    <label style="display: block; margin-bottom: 0.5rem; font-size: 0.9rem; font-weight:500;">Fahrzeug</label>
                    <select name="car_id" required style="width:100%; padding: 0.6rem; border: 1px solid var(--border); border-radius: 6px;">
                        <?php foreach ($cars as $car): ?>
                            <option value="<?php echo $car['id']; ?>">
                                <?php echo htmlspecialchars($car['brand'] . ' ' . $car['model'] . ' (' . $car['license_plate'] . ')'); ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div style="margin-bottom:1rem; flex:1;">
                    <label style="display: block; margin-bottom: 0.5rem; font-size: 0.9rem; font-weight:500;">Fahrer</label>
                    <input type="text" name="driver_name" required placeholder="Name des Fahrers" style="width:100%; padding: 0.6rem; border: 1px solid var(--border); border-radius: 6px;">
                </div>
            </div>

            <div style="display:flex; gap:1rem;">
                <div style="margin-bottom:1rem; flex:1;">
                    <label style="display: block; margin-bottom: 0.5rem; font-size: 0.9rem; font-weight:500;">Datum</label>
                    <input type="date" name="trip_date" required value="<?php echo date('Y-m-d'); ?>" style="width:100%; padding: 0.6rem; border: 1px solid var(--border); border-radius: 6px;">
                </div>
                <div style="margin-bottom:1rem; flex:0.5;">
                    <label style="display: block; margin-bottom: 0.5rem; font-size: 0.9rem; font-weight:500;">Startzeit</label>
                    <input type="time" name="start_time" required value="08:00" style="width:100%; padding: 0.6rem; border: 1px solid var(--border); border-radius: 6px;">
                </div>
                <div style="margin-bottom:1rem; flex:0.5;">
                    <label style="display: block; margin-bottom: 0.5rem; font-size: 0.9rem; font-weight:500;">Endzeit</label>
                    <input type="time" name="end_time" required value="17:00" style="width:100%; padding: 0.6rem; border: 1px solid var(--border); border-radius: 6px;">
                </div>
            </div>

            <div style="display:flex; gap:1rem;">
                <div style="margin-bottom:1rem; flex:1;">
                    <label style="display: block; margin-bottom: 0.5rem; font-size: 0.9rem; font-weight:500;">Startort</label>
                    <input type="text" name="start_location" required placeholder="z.B. Büro" style="width:100%; padding: 0.6rem; border: 1px solid var(--border); border-radius: 6px;">
                </div>
                <div style="margin-bottom:1rem; flex:1;">
                    <label style="display: block; margin-bottom: 0.5rem; font-size: 0.9rem; font-weight:500;">Zielort</label>
                    <input type="text" name="end_location" required placeholder="z.B. Kunde X" style="width:100%; padding: 0.6rem; border: 1px solid var(--border); border-radius: 6px;">
                </div>
            </div>

            <div style="display:flex; gap:1rem;">
                <div style="margin-bottom:1rem; flex:1;">
                    <label style="display: block; margin-bottom: 0.5rem; font-size: 0.9rem; font-weight:500;">KM Start</label>
                    <input type="number" name="start_km" required placeholder="0" style="width:100%; padding: 0.6rem; border: 1px solid var(--border); border-radius: 6px;">
                </div>
                <div style="margin-bottom:1rem; flex:1;">
                    <label style="display: block; margin-bottom: 0.5rem; font-size: 0.9rem; font-weight:500;">KM Ende</label>
                    <input type="number" name="end_km" required placeholder="0" style="width:100%; padding: 0.6rem; border: 1px solid var(--border); border-radius: 6px;">
                </div>
            </div>

            <div style="margin-bottom:2rem;">
                <label style="display: block; margin-bottom: 0.5rem; font-size: 0.9rem; font-weight:500;">Grund der Fahrt</label>
                <textarea name="purpose" required rows="3" placeholder="z.B. Kundenbesuch, Materialbeschaffung..." style="width:100%; padding: 0.6rem; border: 1px solid var(--border); border-radius: 6px; font-family: inherit;"></textarea>
            </div>

            <div style="display:flex; justify-content:flex-end; gap:1rem;">
                <button type="button" onclick="document.getElementById('addEntryModal').style.display='none'" style="padding: 0.6rem 1.2rem; border: 1px solid var(--border); background: transparent; border-radius: 6px; cursor: pointer;">Abbrechen</button>
                <button type="submit" name="add_entry" class="btn btn-primary" style="background-color: #10b981; border-color: #10b981;">Speichern</button>
            </div>
        </form>
    </div>
</div>

<?php require_once 'footer.php'; ?>
