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

    // Additional fields (General)
    $license_plate = $_POST['license_plate'] ?? '';
    $category = $_POST['category'] ?? '';
    $engine_power = $_POST['engine_power'] ?? '';
    $displacement = $_POST['displacement'] ?? '';
    $drive_type = $_POST['drive_type'] ?? '';
    $seats = (int)($_POST['seats'] ?? 5);
    $doors = (int)($_POST['doors'] ?? 5);
    $fuel_consumption = $_POST['fuel_consumption'] ?? '';
    $min_age = (int)($_POST['min_age'] ?? 18);
    $deposit = (float)($_POST['deposit'] ?? 500.00);
    $description = $_POST['description'] ?? '';
    $features = $_POST['features'] ?? '';
    $location = $_POST['location'] ?? 'Feldkirch';
    $vin = $_POST['vin'] ?? '';

    // Maintenance fields
    $vignette_until = !empty($_POST['vignette_until']) ? $_POST['vignette_until'] : null;
    $last_oil_service = !empty($_POST['last_oil_service']) ? $_POST['last_oil_service'] : null;
    $last_tire_service = !empty($_POST['last_tire_service']) ? $_POST['last_tire_service'] : null;
    $tire_type = $_POST['tire_type'] ?? '';
    $internal_notes = $_POST['internal_notes'] ?? '';

    // Pricing fields
    $longterm_price = !empty($_POST['longterm_price']) ? (float)$_POST['longterm_price'] : null;
    $longterm_threshold = (int)($_POST['longterm_threshold'] ?? 7);
    $promo_price = !empty($_POST['promo_price']) ? (float)$_POST['promo_price'] : null;
    $promo_start = !empty($_POST['promo_start']) ? $_POST['promo_start'] : null;
    $promo_end = !empty($_POST['promo_end']) ? $_POST['promo_end'] : null;

    if (isset($_POST['id']) && $_POST['id']) {
        // Update
        $sql = "UPDATE cars SET 
                brand=?, model=?, year=?, price_per_day=?, fuel_type=?, transmission=?, image_url=?, status=?,
                license_plate=?, category=?, engine_power=?, displacement=?, drive_type=?, seats=?, doors=?,
                fuel_consumption=?, min_age=?, deposit=?, description=?, features=?, location=?, vin=?,
                vignette_until=?, last_oil_service=?, last_tire_service=?, tire_type=?, internal_notes=?,
                longterm_price=?, longterm_threshold=?, promo_price=?, promo_start=?, promo_end=?
                WHERE id=?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $brand, $model, $year, $price, $fuel, $transmission, $image, $status,
            $license_plate, $category, $engine_power, $displacement, $drive_type, $seats, $doors,
            $fuel_consumption, $min_age, $deposit, $description, $features, $location, $vin,
            $vignette_until, $last_oil_service, $last_tire_service, $tire_type, $internal_notes,
            $longterm_price, $longterm_threshold, $promo_price, $promo_start, $promo_end,
            $_POST['id']
        ]);
    } else {
        // Insert
        $sql = "INSERT INTO cars (
                brand, model, year, price_per_day, fuel_type, transmission, image_url, status,
                license_plate, category, engine_power, displacement, drive_type, seats, doors,
                fuel_consumption, min_age, deposit, description, features, location, vin,
                vignette_until, last_oil_service, last_tire_service, tire_type, internal_notes,
                longterm_price, longterm_threshold, promo_price, promo_start, promo_end
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $brand, $model, $year, $price, $fuel, $transmission, $image, $status,
            $license_plate, $category, $engine_power, $displacement, $drive_type, $seats, $doors,
            $fuel_consumption, $min_age, $deposit, $description, $features, $location, $vin,
            $vignette_until, $last_oil_service, $last_tire_service, $tire_type, $internal_notes,
            $longterm_price, $longterm_threshold, $promo_price, $promo_start, $promo_end
        ]);
    }
    header('Location: cars.php');
    exit;
}
?>

<div class="table-container" style="max-width: 1200px; margin: 0 auto; background: white; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.05);">
    <div class="table-header" style="border-bottom: 1px solid #f1f5f9; padding-bottom: 2rem;">
        <div>
            <h2 style="font-size: 1.8rem; font-weight: 900; color: #1e293b;"><?php echo $car ? 'Fahrzeug verwalten' : 'Neuzugang erfassen'; ?></h2>
            <p style="color: #64748b; font-size: 0.9rem;">Detaillierte Verwaltung der Flotte inklusive interner Wartungsdaten.</p>
        </div>
        <a href="cars.php" class="btn" style="background: #f1f5f9; color: #475569; border-radius: 12px;"><i class="fas fa-arrow-left"></i> Abbrechen</a>
    </div>

    <form method="POST" style="padding-top: 2rem;">
        <?php if ($car): ?><input type="hidden" name="id" value="<?php echo $car['id']; ?>"><?php endif; ?>
        
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 3rem;">
            <!-- Left Column: Public & Technical Info -->
            <div>
                <!-- SECTION: STAMMDATEN -->
                <div style="margin-bottom: 3rem;">
                    <h3 style="font-size: 0.9rem; color: var(--primary); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-car-side"></i> Basis & Design
                    </h3>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                        <div class="form-group-modern">
                            <label>Marke</label>
                            <input type="text" name="brand" value="<?php echo $car ? htmlspecialchars($car['brand'] ?? '') : ''; ?>" required>
                        </div>
                        <div class="form-group-modern">
                            <label>Modell</label>
                            <input type="text" name="model" value="<?php echo $car ? htmlspecialchars($car['model'] ?? '') : ''; ?>" required>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1.5rem; margin-top: 1.5rem;">
                        <div class="form-group-modern">
                            <label>Baujahr</label>
                            <input type="number" name="year" value="<?php echo $car ? $car['year'] : date('Y'); ?>" required>
                        </div>
                        <div class="form-group-modern">
                            <label>Kategorie</label>
                            <select name="category">
                                <option value="Kleinwagen" <?php echo ($car && ($car['category'] ?? '') == 'Kleinwagen') ? 'selected' : ''; ?>>Kleinwagen</option>
                                <option value="Limousine" <?php echo ($car && ($car['category'] ?? '') == 'Limousine') ? 'selected' : ''; ?>>Limousine</option>
                                <option value="Kombi" <?php echo ($car && ($car['category'] ?? '') == 'Kombi') ? 'selected' : ''; ?>>Kombi</option>
                                <option value="SUV" <?php echo ($car && ($car['category'] ?? '') == 'SUV') ? 'selected' : ''; ?>>SUV</option>
                                <option value="Luxus" <?php echo ($car && ($car['category'] ?? '') == 'Luxus') ? 'selected' : ''; ?>>Luxus</option>
                                <option value="Sportwagen" <?php echo ($car && ($car['category'] ?? '') == 'Sportwagen') ? 'selected' : ''; ?>>Sportwagen</option>
                                <option value="Transporter" <?php echo ($car && ($car['category'] ?? '') == 'Transporter') ? 'selected' : ''; ?>>Transporter</option>
                            </select>
                        </div>
                        <div class="form-group-modern">
                            <label>Getriebe</label>
                            <select name="transmission">
                                <option value="Automatik" <?php echo ($car && $car['transmission'] == 'Automatik') ? 'selected' : ''; ?>>Automatik</option>
                                <option value="Manuell" <?php echo ($car && $car['transmission'] == 'Manuell') ? 'selected' : ''; ?>>Manuell</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- SECTION: PREISGESTALTUNG & KAMPAGNEN -->
                <div style="margin-bottom: 3rem; background: #fff8f8; padding: 2rem; border-radius: 20px; border: 1px solid #ffebeb;">
                    <h3 style="font-size: 0.9rem; color: #E31E24; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-tags"></i> Preise & Aktionen
                    </h3>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1.5rem;">
                        <div class="form-group-modern">
                            <label>Standard / Tag (€)</label>
                            <input type="number" name="price_per_day" value="<?php echo $car ? $car['price_per_day'] : ''; ?>" required step="0.01">
                        </div>
                        <div class="form-group-modern">
                            <label>Langzeit / Tag (€)</label>
                            <input type="number" name="longterm_price" value="<?php echo $car ? ($car['longterm_price'] ?? '') : ''; ?>" step="0.01" placeholder="z.B. 99.00">
                        </div>
                        <div class="form-group-modern">
                            <label>Ab (Tage)</label>
                            <input type="number" name="longterm_threshold" value="<?php echo $car ? ($car['longterm_threshold'] ?? 7) : 7; ?>">
                        </div>
                    </div>

                    <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px dashed #ffdcdc;">
                        <p style="font-size: 0.8rem; font-weight: 800; color: #E31E24; margin-bottom: 1rem;">AKTIONSZEITRAUM (SEASONAL PROMO)</p>
                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1.5rem;">
                            <div class="form-group-modern">
                                <label>Promo Preis / Tag</label>
                                <input type="number" name="promo_price" value="<?php echo $car ? ($car['promo_price'] ?? '') : ''; ?>" step="0.01">
                            </div>
                            <div class="form-group-modern">
                                <label>Gültig von</label>
                                <input type="date" name="promo_start" value="<?php echo $car ? ($car['promo_start'] ?? '') : ''; ?>">
                            </div>
                            <div class="form-group-modern">
                                <label>Gültig bis</label>
                                <input type="date" name="promo_end" value="<?php echo $car ? ($car['promo_end'] ?? '') : ''; ?>">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- SECTION: CONTENT -->
                <div style="margin-bottom: 3rem;">
                    <h3 style="font-size: 0.9rem; color: var(--primary); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-file-alt"></i> Beschreibung & Merkmale
                    </h3>
                    <div class="form-group-modern" style="margin-top: 1rem;">
                        <label>Öffentliche Beschreibung</label>
                        <textarea name="description" rows="5" placeholder="Highlight-Features, Fahrgefühl..."><?php echo $car ? htmlspecialchars($car['description'] ?? '') : ''; ?></textarea>
                    </div>
                    <div class="form-group-modern" style="margin-top: 1.5rem;">
                        <label>Ausstattung (z.B. GPS, Bluetooth, Klima, Sitzheizung)</label>
                        <input type="text" name="features" value="<?php echo $car ? htmlspecialchars($car['features'] ?? '') : ''; ?>" placeholder="Kommasepariert eingeben">
                    </div>
                </div>
            </div>

            <!-- Right Column: Internal & Operational -->
            <div style="background: #f8fafc; padding: 2rem; border-radius: 20px; border: 1px solid #eef2f6;">
                <h3 style="font-size: 0.9rem; color: #1e293b; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-lock"></i> Interne Verwaltung
                </h3>

                <div class="form-group-modern">
                    <label>Fahrzeugstatus</label>
                    <select name="status">
                        <option value="available" <?php echo ($car && $car['status'] == 'available') ? 'selected' : ''; ?>>Verfügbar</option>
                        <option value="rented" <?php echo ($car && $car['status'] == 'rented') ? 'selected' : ''; ?>>Vermietet</option>
                        <option value="maintenance" <?php echo ($car && $car['status'] == 'maintenance') ? 'selected' : ''; ?>>In Wartung</option>
                    </select>
                </div>

                <div class="form-group-modern" style="margin-top: 1.5rem;">
                    <label>Amtliches Kennzeichen</label>
                    <input type="text" name="license_plate" value="<?php echo $car ? htmlspecialchars($car['license_plate'] ?? '') : ''; ?>" placeholder="z.B. FK-777-RX">
                </div>

                <div class="form-group-modern" style="margin-top: 1.5rem;">
                    <label>VIN (Fahrgestellnummer)</label>
                    <input type="text" name="vin" value="<?php echo $car ? htmlspecialchars($car['vin'] ?? '') : ''; ?>" placeholder="17-stellig">
                </div>

                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 2rem 0;">
                
                <p style="font-size: 0.75rem; font-weight: 800; color: #64748b; margin-bottom: 1.2rem; text-transform: uppercase;">Wartung & Services</p>
                
                <div class="form-group-modern">
                    <label>Vignette gültig bis</label>
                    <input type="date" name="vignette_until" value="<?php echo $car ? ($car['vignette_until'] ?? '') : ''; ?>">
                </div>

                <div class="form-group-modern" style="margin-top: 1.2rem;">
                    <label>Letzter Ölwechsel</label>
                    <input type="date" name="last_oil_service" value="<?php echo $car ? ($car['last_oil_service'] ?? '') : ''; ?>">
                </div>

                <div class="form-group-modern" style="margin-top: 1.2rem;">
                    <label>Letzter Reifenwechsel</label>
                    <input type="date" name="last_tire_service" value="<?php echo $car ? ($car['last_tire_service'] ?? '') : ''; ?>">
                </div>

                <div class="form-group-modern" style="margin-top: 1.2rem;">
                    <label>Bereifungstyp</label>
                    <select name="tire_type">
                        <option value="Sommer" <?php echo ($car && ($car['tire_type'] ?? '') == 'Sommer') ? 'selected' : ''; ?>>Sommerreifen</option>
                        <option value="Winter" <?php echo ($car && ($car['tire_type'] ?? '') == 'Winter') ? 'selected' : ''; ?>>Winterreifen</option>
                        <option value="Ganzjahr" <?php echo ($car && ($car['tire_type'] ?? '') == 'Ganzjahr') ? 'selected' : ''; ?>>Ganzjahresreifen</option>
                    </select>
                </div>

                <div class="form-group-modern" style="margin-top: 2rem;">
                    <label>Interne Notizen</label>
                    <textarea name="internal_notes" rows="4" placeholder="Schäden, Besonderheiten, nächste Termine..."><?php echo $car ? htmlspecialchars($car['internal_notes'] ?? '') : ''; ?></textarea>
                </div>
            </div>
        </div>

        <div style="margin-top: 3rem; padding-top: 2.5rem; border-top: 1px solid #f1f5f9;">
            <button type="submit" class="btn btn-primary" style="width: 100%; padding: 20px; font-size: 1.2rem; border-radius: 15px; display: flex; align-items: center; justify-content: center; gap: 15px;">
                <i class="fas fa-save"></i> Fahrzeugdaten & Wartung speichern
            </button>
        </div>
    </form>
</div>

<?php include 'footer.php'; ?>

<?php include 'footer.php'; ?>
