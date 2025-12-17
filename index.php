<?php
require_once 'includes/db.php';
include 'includes/header.php';

// Fetch featured cars
$cars = [];
try {
    $stmt = $pdo->query("SELECT * FROM cars WHERE status = 'available' LIMIT 6");
    $cars = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) {
    // Fallback
}

if (empty($cars)) {
    $cars = [
        [
            'id' => 1, 'brand' => 'Mercedes-Benz', 'model' => 'S-Class', 'year' => 2024, 
            'price_per_day' => 5000, 'fuel_type' => 'Dizel', 'transmission' => 'Otomatik',
            'image_url' => 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
        ],
        [
            'id' => 2, 'brand' => 'BMW', 'model' => 'M4 Competition', 'year' => 2023, 
            'price_per_day' => 4500, 'fuel_type' => 'Benzin', 'transmission' => 'Otomatik',
            'image_url' => 'https://images.unsplash.com/photo-1617788138017-80ad40651399?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
        ],
        [
            'id' => 3, 'brand' => 'Audi', 'model' => 'RS7', 'year' => 2024, 
            'price_per_day' => 4800, 'fuel_type' => 'Benzin', 'transmission' => 'Otomatik',
            'image_url' => 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
        ]
    ];
}
?>

<!-- Hero Section -->
<section class="hero-premium">
    <div class="hero-content">
        <h1 class="hero-title">RENT<span class="text-primary">-EX</span></h1>
        <p class="hero-subtitle">Erleben Sie die Perfektion in Bewegung.</p>
        
        <div class="search-glass-container">
            <form class="search-form-premium">
                <div class="input-group">
                    <i class="fas fa-map-marker-alt"></i>
                    <select>
                        <option>Istanbul Flughafen</option>
                        <option>Sabiha Gökçen</option>
                        <option>Stadtzentrum</option>
                    </select>
                </div>
                <div class="divider"></div>
                <div class="input-group">
                    <i class="fas fa-calendar-alt"></i>
                    <input type="date" placeholder="Abholung">
                </div>
                <div class="divider"></div>
                <div class="input-group">
                    <i class="fas fa-calendar-check"></i>
                    <input type="date" placeholder="Rückgabe">
                </div>
                <button class="btn-search-premium">
                    <i class="fas fa-arrow-right"></i>
                </button>
            </form>
        </div>
    </div>
    
    <!-- Abstract Background Elements -->
    <div class="bg-shape shape-1"></div>
    <div class="bg-shape shape-2"></div>
</section>

<!-- Featured Cars (Showcase) -->
<section id="fleet" class="section-premium">
    <div class="container">
        <div class="section-header">
            <h2 class="title-lg">Exklusive <span class="text-primary">Flotte</span></h2>
            <p class="text-muted">Wählen Sie aus unserer Premium-Kollektion</p>
        </div>
        
        <div class="showcase-grid">
            <?php foreach ($cars as $car): ?>
            <div class="premium-card">
                <div class="card-media">
                    <img src="<?php echo $car['image_url']; ?>" alt="<?php echo $car['brand']; ?>">
                    <div class="card-overlay">
                        <a href="rent.php?id=<?php echo isset($car['id']) ? $car['id'] : 1; ?>" class="btn-premium">JETZT MIETEN</a>
                    </div>
                    <div class="price-tag">
                        <?php echo number_format($car['price_per_day'], 0, ',', '.'); ?> ₺
                    </div>
                </div>
                <div class="card-info">
                    <h3><?php echo $car['brand']; ?> <span class="text-lighter"><?php echo $car['model']; ?></span></h3>
                    <div class="specs-row">
                        <span><i class="fas fa-calendar"></i> <?php echo $car['year']; ?></span>
                        <span><i class="fas fa-gas-pump"></i> <?php echo $car['fuel_type']; ?></span>
                        <span><i class="fas fa-cogs"></i> <?php echo $car['transmission']; ?></span>
                    </div>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<!-- Why Us Premium -->
<section id="services" class="section-premium bg-darker">
    <div class="container">
        <div class="section-header text-left">
            <h2 class="title-lg">Warum <span class="text-primary">Rent-Ex?</span></h2>
        </div>
        
        <div class="features-row">
            <div class="feature-box">
                <div class="icon-box">
                    <i class="fas fa-shield-alt"></i>
                </div>
                <h3>Maximaler Schutz</h3>
                <p>Vollkasko und 24/7 Support für Ihre Sicherheit auf jeder Straße.</p>
            </div>
            <div class="feature-box">
                <div class="icon-box">
                    <i class="fas fa-star"></i>
                </div>
                <h3>Premium Service</h3>
                <p>VIP-Behandlung von der Buchung bis zur Rückgabe des Fahrzeugs.</p>
            </div>
            <div class="feature-box">
                <div class="icon-box">
                    <i class="fas fa-bolt"></i>
                </div>
                <h3>Sofortige Bestätigung</h3>
                <p>Keine Wartezeiten. Buchen Sie online und fahren Sie sofort los.</p>
            </div>
        </div>
    </div>
</section>

<!-- Call to Action -->
<section class="cta-section">
    <div class="cta-content">
        <h2>Bereit für die Fahrt?</h2>
        <a href="#fleet" class="btn btn-primary btn-lg">Fahrzeug Wählen</a>
    </div>
</section>

<?php include 'includes/footer.php'; ?>
