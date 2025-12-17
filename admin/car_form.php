<?php
session_start();
if (!isset($_SESSION['admin_logged_in'])) {
    header('Location: login.php');
    exit;
}
require_once '../includes/db.php';
include 'header.php';

// New expansion fields list for dynamic handling
$new_fields = [
    'license_plate', 'category', 'engine_power', 'displacement', 
    'drive_type', 'seats', 'doors', 'fuel_consumption', 
    'min_age', 'deposit', 'description', 'features', 'location', 'vin'
];

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

    // Additional fields
    $license_plate = $_POST['license_plate'] ?? '';
    $category = $_POST['category'] ?? '';
    $engine_power = $_POST['engine_power'] ?? '';
    $displacement = $_POST['displacement'] ?? '';
    $drive_type = $_POST['drive_type'] ?? '';
    $seats = $_POST['seats'] ?? 5;
    $doors = $_POST['doors'] ?? 5;
    $fuel_consumption = $_POST['fuel_consumption'] ?? '';
    $min_age = $_POST['min_age'] ?? 18;
    $deposit = $_POST['deposit'] ?? 500.00;
    $description = $_POST['description'] ?? '';
    $features = $_POST['features'] ?? '';
    $location = $_POST['location'] ?? 'Feldkirch';
    $vin = $_POST['vin'] ?? '';

    if (isset($_POST['id']) && $_POST['id']) {
        // Update
        $sql = "UPDATE cars SET 
                brand=?, model=?, year=?, price_per_day=?, fuel_type=?, transmission=?, image_url=?, status=?,
                license_plate=?, category=?, engine_power=?, displacement=?, drive_type=?, seats=?, doors=?,
                fuel_consumption=?, min_age=?, deposit=?, description=?, features=?, location=?, vin=?
                WHERE id=?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $brand, $model, $year, $price, $fuel, $transmission, $image, $status,
            $license_plate, $category, $engine_power, $displacement, $drive_type, $seats, $doors,
            $fuel_consumption, $min_age, $deposit, $description, $features, $location, $vin,
            $_POST['id']
        ]);
    } else {
        // Insert
        $sql = "INSERT INTO cars (
                brand, model, year, price_per_day, fuel_type, transmission, image_url, status,
                license_plate, category, engine_power, displacement, drive_type, seats, doors,
                fuel_consumption, min_age, deposit, description, features, location, vin
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $brand, $model, $year, $price, $fuel, $transmission, $image, $status,
            $license_plate, $category, $engine_power, $displacement, $drive_type, $seats, $doors,
            $fuel_consumption, $min_age, $deposit, $description, $features, $location, $vin
        ]);
    }
    header('Location: cars.php');
    exit;
}
?>

<div class="table-container" style="max-width: 1000px; margin: 0 auto; background: white; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.05);">
    <div class="table-header" style="border-bottom: 1px solid #f1f5f9; padding-bottom: 2rem;">
        <div>
            <h2 style="font-size: 1.8rem; font-weight: 900; color: #1e293b;"><?php echo $car ? 'Fahrzeug bearbeiten' : 'Neues Fahrzeug anlegen'; ?></h2>
            <p style="color: #64748b; font-size: 0.9rem;">Erfassen Sie alle relevanten Details für Ihre Kunden.</p>
        </div>
        <a href="cars.php" class="btn" style="background: #f1f5f9; color: #475569; border-radius: 12px;"><i class="fas fa-arrow-left"></i> Abbrechen</a>
    </div>

    <form method="POST" style="padding-top: 2rem;">
        <?php if ($car): ?><input type="hidden" name="id" value="<?php echo $car['id']; ?>"><?php endif; ?>
        
        <!-- SECTION: STAMMDATEN -->
        <div style="margin-bottom: 3rem;">
            <h3 style="font-size: 1rem; color: var(--primary); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-info-circle"></i> Stammdaten
            </h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                <div class="form-group-modern">
                    <label>Marke</label>
                    <input type="text" name="brand" value="<?php echo $car ? htmlspecialchars($car['brand'] ?? '') : ''; ?>" required placeholder="z.B. Mercedes-Benz">
                </div>
                <div class="form-group-modern">
                    <label>Modell</label>
                    <input type="text" name="model" value="<?php echo $car ? htmlspecialchars($car['model'] ?? '') : ''; ?>" required placeholder="z.B. S-Class">
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 2rem; margin-top: 1.5rem;">
                <div class="form-group-modern">
                    <label>Amtliches Kennzeichen</label>
                    <input type="text" name="license_plate" value="<?php echo $car ? htmlspecialchars($car['license_plate'] ?? '') : ''; ?>" placeholder="FK-123-EX">
                </div>
                <div class="form-group-modern">
                    <label>Kategorie</label>
                    <select name="category">
                        <option value="Kleinwagen" <?php echo ($car && ($car['category'] ?? '') == 'Kleinwagen') ? 'selected' : ''; ?>>Kleinwagen</option>
                        <option value="Kombi" <?php echo ($car && ($car['category'] ?? '') == 'Kombi') ? 'selected' : ''; ?>>Kombi</option>
                        <option value="Limousine" <?php echo ($car && ($car['category'] ?? '') == 'Limousine') ? 'selected' : ''; ?>>Limousine</option>
                        <option value="SUV" <?php echo ($car && ($car['category'] ?? '') == 'SUV') ? 'selected' : ''; ?>>SUV</option>
                        <option value="Sportwagen" <?php echo ($car && ($car['category'] ?? '') == 'Sportwagen') ? 'selected' : ''; ?>>Sportwagen</option>
                        <option value="Luxus" <?php echo ($car && ($car['category'] ?? '') == 'Luxus') ? 'selected' : ''; ?>>Luxus</option>
                        <option value="Transporter" <?php echo ($car && ($car['category'] ?? '') == 'Transporter') ? 'selected' : ''; ?>>Transporter</option>
                        <option value="Van" <?php echo ($car && ($car['category'] ?? '') == 'Van') ? 'selected' : ''; ?>>Van</option>
                    </select>
                </div>
                <div class="form-group-modern">
                    <label>Standort</label>
                    <select name="location">
                        <option value="Feldkirch" <?php echo ($car && ($car['location'] ?? '') == 'Feldkirch') ? 'selected' : ''; ?>>Feldkirch</option>
                        <option value="Dornbirn" <?php echo ($car && ($car['location'] ?? '') == 'Dornbirn') ? 'selected' : ''; ?>>Dornbirn</option>
                        <option value="Bregenz" <?php echo ($car && ($car['location'] ?? '') == 'Bregenz') ? 'selected' : ''; ?>>Bregenz</option>
                    </select>
                </div>
            </div>
        </div>

        <!-- SECTION: TECHNISCHE DATEN -->
        <div style="margin-bottom: 3rem;">
            <h3 style="font-size: 1rem; color: var(--primary); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-cogs"></i> Technische Details
            </h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 2rem;">
                <div class="form-group-modern">
                    <label>Baujahr</label>
                    <input type="number" name="year" value="<?php echo $car ? $car['year'] : date('Y'); ?>" required>
                </div>
                <div class="form-group-modern">
                    <label>Motorleistung (PS)</label>
                    <input type="text" name="engine_power" value="<?php echo $car ? htmlspecialchars($car['engine_power'] ?? '') : ''; ?>" placeholder="z.B. 190 PS">
                </div>
                <div class="form-group-modern">
                    <label>Hubraum (ccm)</label>
                    <input type="text" name="displacement" value="<?php echo $car ? htmlspecialchars($car['displacement'] ?? '') : ''; ?>" placeholder="z.B. 1998 ccm">
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 1.5rem; margin-top: 1.5rem;">
                <div class="form-group-modern">
                    <label>Kraftstoff</label>
                    <select name="fuel_type">
                        <option value="Benzin" <?php echo ($car && $car['fuel_type'] == 'Benzin') ? 'selected' : ''; ?>>Benzin</option>
                        <option value="Diesel" <?php echo ($car && $car['fuel_type'] == 'Diesel') ? 'selected' : ''; ?>>Diesel</option>
                        <option value="Hybrid" <?php echo ($car && $car['fuel_type'] == 'Hybrid') ? 'selected' : ''; ?>>Hybrid</option>
                        <option value="Elektro" <?php echo ($car && $car['fuel_type'] == 'Elektro') ? 'selected' : ''; ?>>Elektro</option>
                    </select>
                </div>
                <div class="form-group-modern">
                    <label>Getriebe</label>
                    <select name="transmission">
                        <option value="Automatik" <?php echo ($car && $car['transmission'] == 'Automatik') ? 'selected' : ''; ?>>Automatik</option>
                        <option value="Manuell" <?php echo ($car && $car['transmission'] == 'Manuell') ? 'selected' : ''; ?>>Manuell</option>
                    </select>
                </div>
                <div class="form-group-modern">
                    <label>Antrieb</label>
                    <input type="text" name="drive_type" value="<?php echo $car ? htmlspecialchars($car['drive_type'] ?? '') : ''; ?>" placeholder="z.B. Allrad / AWD">
                </div>
                <div class="form-group-modern">
                    <label>Verbrauch</label>
                    <input type="text" name="fuel_consumption" value="<?php echo $car ? htmlspecialchars($car['fuel_consumption'] ?? '') : ''; ?>" placeholder="6.5 l/100km">
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 1.5rem;">
                <div class="form-group-modern">
                    <label>Sitzplätze</label>
                    <input type="number" name="seats" value="<?php echo $car ? ($car['seats'] ?? 5) : 5; ?>">
                </div>
                <div class="form-group-modern">
                    <label>Türen</label>
                    <input type="number" name="doors" value="<?php echo $car ? ($car['doors'] ?? 5) : 5; ?>">
                </div>
            </div>
        </div>

        <!-- SECTION: MIET-KONDITIONEN -->
        <div style="margin-bottom: 3rem;">
            <h3 style="font-size: 1rem; color: var(--primary); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-euro-sign"></i> Konditionen & Status
            </h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 2rem;">
                <div class="form-group-modern">
                    <label>Preis / Tag (€)</label>
                    <input type="number" name="price_per_day" value="<?php echo $car ? $car['price_per_day'] : ''; ?>" required placeholder="0.00">
                </div>
                <div class="form-group-modern">
                    <label>Kaution (€)</label>
                    <input type="number" name="deposit" value="<?php echo $car ? ($car['deposit'] ?? 500) : 500; ?>" step="0.01">
                </div>
                <div class="form-group-modern">
                    <label>Mindestalter</label>
                    <input type="number" name="min_age" value="<?php echo $car ? ($car['min_age'] ?? 18) : 18; ?>">
                </div>
            </div>

            <div class="form-group-modern" style="margin-top: 1.5rem;">
                <label>Fahrzeugstatus</label>
                <select name="status">
                    <option value="available" <?php echo ($car && $car['status'] == 'available') ? 'selected' : ''; ?>>Verfügbar</option>
                    <option value="rented" <?php echo ($car && $car['status'] == 'rented') ? 'selected' : ''; ?>>Vermietet</option>
                    <option value="maintenance" <?php echo ($car && $car['status'] == 'maintenance') ? 'selected' : ''; ?>>In Wartung</option>
                </select>
            </div>
        </div>

        <!-- SECTION: CONTENT & MEDIA -->
        <div style="margin-bottom: 3rem;">
            <h3 style="font-size: 1rem; color: var(--primary); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-camera"></i> Medien & Details
            </h3>
            
            <div class="form-group-modern">
                <label>Bild-URL</label>
                <input type="text" name="image_url" value="<?php echo $car ? htmlspecialchars($car['image_url'] ?? '') : ''; ?>" required placeholder="https://images.unsplash.com/...">
            </div>

            <div class="form-group-modern" style="margin-top: 1.5rem;">
                <label>Beschreibung</label>
                <textarea name="description" rows="4" placeholder="Beschreiben Sie das Fahrzeug und seine Besonderheiten..."><?php echo $car ? htmlspecialchars($car['description'] ?? '') : ''; ?></textarea>
            </div>

            <div class="form-group-modern" style="margin-top: 1.5rem;">
                <label>Ausstattungsmerkmale (Komma-getrennt)</label>
                <input type="text" name="features" value="<?php echo $car ? htmlspecialchars($car['features'] ?? '') : ''; ?>" placeholder="z.B. GPS, Bluetooth, Sitzheizung, Klimaautomatik">
            </div>

            <div class="form-group-modern" style="margin-top: 1.5rem;">
                <label>Fahrgestellnummer (VIN)</label>
                <input type="text" name="vin" value="<?php echo $car ? htmlspecialchars($car['vin'] ?? '') : ''; ?>" placeholder="WBA... (nur intern sichtbar)">
            </div>
        </div>

        <div style="margin-top: 3rem; padding-top: 2rem; border-top: 1px solid #f1f5f9;">
            <button type="submit" class="btn btn-primary" style="width: 100%; padding: 20px; font-size: 1.1rem; border-radius: 15px;">
                <i class="fas fa-save"></i> Fahrzeug speichern
            </button>
        </div>
    </form>
</div>

<?php include 'footer.php'; ?>

<?php include 'footer.php'; ?>
