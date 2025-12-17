<?php
require_once 'includes/db.php';
include 'includes/header.php';

// Fetch featured cars
$cars = [];
try {
    $stmt = $pdo->query("SELECT * FROM cars WHERE status = 'available' LIMIT 6");
    $cars = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) {
    // Fallback if DB not setup
}

// Dummy data if no cars found (for template preview)
if (empty($cars)) {
    $cars = [
        [
            'brand' => 'Mercedes-Benz', 'model' => 'S-Class', 'year' => 2024, 
            'price_per_day' => 5000, 'fuel_type' => 'Dizel', 'transmission' => 'Otomatik',
            'image_url' => 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
        ],
        [
            'brand' => 'BMW', 'model' => 'M4 Competition', 'year' => 2023, 
            'price_per_day' => 4500, 'fuel_type' => 'Benzin', 'transmission' => 'Otomatik',
            'image_url' => 'https://images.unsplash.com/photo-1617788138017-80ad40651399?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
        ],
        [
            'brand' => 'Audi', 'model' => 'RS7', 'year' => 2024, 
            'price_per_day' => 4800, 'fuel_type' => 'Benzin', 'transmission' => 'Otomatik',
            'image_url' => 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
        ]
    ];
}
?>

<section class="hero">
    <h1>Mieten Sie Ihr Traumauto</h1>
    <p>Genießen Sie eine komfortable und sichere Reise mit unserer Premium-Fahrzeugflotte.</p>
    
    <div class="search-box">
        <div class="form-group">
            <label>Abholort</label>
            <select>
                <option>Flughafen Istanbul</option>
                <option>Flughafen Sabiha Gökçen</option>
                <option>Stadtzentrum</option>
            </select>
        </div>
        <div class="form-group">
            <label>Abholdatum</label>
            <input type="date">
        </div>
        <div class="form-group">
            <label>Rückgabedatum</label>
            <input type="date">
        </div>
        <div class="form-group" style="justify-content: flex-end;">
            <button class="btn btn-primary" style="width: 100%;">Fahrzeug finden</button>
        </div>
    </div>
</section>

<section id="fleet" class="fleet">
    <div class="section-title">
        <h2>Unsere <span>Fahrzeuge</span></h2>
        <p>Luxuriöse und komfortable Fahrzeugoptionen für jeden Bedarf</p>
    </div>

    <div class="car-grid">
        <?php foreach ($cars as $car): ?>
        <div class="car-card">
            <div class="car-image">
                <img src="<?php echo $car['image_url']; ?>" alt="<?php echo $car['brand'] . ' ' . $car['model']; ?>">
            </div>
            <div class="car-details">
                <div class="car-title">
                    <h3><?php echo $car['brand'] . ' ' . $car['model']; ?></h3>
                    <span class="price"><?php echo number_format($car['price_per_day'], 0, ',', '.'); ?> ₺/Tag</span>
                </div>
                <div class="car-specs">
                    <div class="spec-item"><i class="fas fa-calendar"></i> <?php echo $car['year']; ?></div>
                    <div class="spec-item"><i class="fas fa-gas-pump"></i> <?php echo $car['fuel_type']; ?></div>
                    <div class="spec-item"><i class="fas fa-cogs"></i> <?php echo $car['transmission']; ?></div>
                </div>
                <a href="rent.php?id=<?php echo isset($car['id']) ? $car['id'] : 1; ?>" class="btn btn-outline" style="width: 100%; text-align: center;">Jetzt mieten</a>
            </div>
        </div>
        <?php endforeach; ?>
    </div>
</section>

<section id="services" class="services">
    <div class="section-title">
        <h2>Warum <span>Wir?</span></h2>
    </div>
    <div class="services-grid">
        <div class="service-card">
            <i class="fas fa-shield-alt"></i>
            <h3>Sichere Vermietung</h3>
            <p>Alle unsere Fahrzeuge sind versichert und regelmäßig gewartet.</p>
        </div>
        <div class="service-card">
            <i class="fas fa-clock"></i>
            <h3>24/7 Support</h3>
            <p>Pannenhilfe und Kundenservice-Unterstützung.</p>
        </div>
        <div class="service-card">
            <i class="fas fa-tag"></i>
            <h3>Bester Preis</h3>
            <p>Keine versteckten Gebühren, transparente Preisgestaltung.</p>
        </div>
    </div>
</section>

<?php include 'includes/footer.php'; ?>
