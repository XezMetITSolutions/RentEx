<?php
require_once 'includes/db.php';
include 'includes/header.php';

// Mock Search Logic
$cars = [];
// In a real app, filters from $_GET would apply to SQL query here
// For demo, we just show filtered mock data
$cars = [
    ['id' => 1, 'brand' => 'Mercedes-Benz', 'model' => 'S-Class', 'year' => 2024, 'price_per_day' => 5000, 'fuel_type' => 'Dizel', 'transmission' => 'Otomatik', 'image_url' => 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'],
    ['id' => 2, 'brand' => 'BMW', 'model' => 'M4 Competition', 'year' => 2023, 'price_per_day' => 4500, 'fuel_type' => 'Benzin', 'transmission' => 'Otomatik', 'image_url' => 'https://images.unsplash.com/photo-1617788138017-80ad40651399?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'],
];
?>

<section class="section-premium" style="padding-top: 15rem;">
    <div class="container">
        <h1 class="title-lg" style="margin-bottom: 2rem;">Suchergebnisse</h1>
        <p style="color: #888; margin-bottom: 3rem;">Verfügbare Fahrzeuge für Ihre Auswahl.</p>
        
        <div class="showcase-grid">
            <?php foreach ($cars as $car): ?>
            <div class="premium-card">
                <div class="card-media">
                    <img src="<?php echo $car['image_url']; ?>" alt="<?php echo $car['brand']; ?>">
                    <div class="card-overlay">
                        <div style="display:flex; gap:10px;">
                            <a href="details.php?id=<?php echo $car['id']; ?>" class="btn-premium" style="background:#000; color:#fff; border:1px solid #fff;">DETAILS</a>
                            <a href="rent.php?id=<?php echo $car['id']; ?>" class="btn-premium">JETZT MIETEN</a>
                        </div>
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

<?php include 'includes/footer.php'; ?>
