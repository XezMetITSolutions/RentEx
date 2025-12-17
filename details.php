<?php
require_once 'includes/db.php';
include 'includes/header.php';

$car_id = isset($_GET['id']) ? (int)$_GET['id'] : 1;
// Mock fetch logic
if ($car_id == 2) {
    $car = ['id' => 2, 'brand' => 'BMW', 'model' => 'M4 Competition', 'year' => 2023, 'price_per_day' => 4500, 'fuel_type' => 'Benzin', 'transmission' => 'Otomatik', 'image_url' => 'https://images.unsplash.com/photo-1617788138017-80ad40651399?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'];
} else {
    $car = ['id' => 1, 'brand' => 'Mercedes-Benz', 'model' => 'S-Class', 'year' => 2024, 'price_per_day' => 5000, 'fuel_type' => 'Dizel', 'transmission' => 'Otomatik', 'image_url' => 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'];
}
?>

<section class="section-premium" style="padding-top: 15rem;">
    <div class="container">
        <div class="glass" style="padding: 3rem; border-radius: 20px;">
            <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 4rem;">
                
                <!-- Gallery Section -->
                <div>
                    <div style="height: 500px; border-radius: 15px; overflow: hidden; margin-bottom: 2rem; border: 1px solid var(--glass-border);">
                        <img src="<?php echo $car['image_url']; ?>" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    <!-- Small Thumbnails (Mockup) -->
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
                        <div style="height: 100px; background: #222; border-radius: 10px;"></div>
                        <div style="height: 100px; background: #222; border-radius: 10px;"></div>
                        <div style="height: 100px; background: #222; border-radius: 10px;"></div>
                    </div>
                </div>

                <!-- Info Section -->
                <div>
                    <h1 class="title-lg" style="font-size: 3rem; margin-bottom: 1rem;"><?php echo $car['brand']; ?> <span class="text-primary"><?php echo $car['model']; ?></span></h1>
                    <div class="price" style="font-size: 2.5rem; margin-bottom: 2rem; display: inline-block;">
                        <?php echo number_format($car['price_per_day'], 0, ',', '.'); ?> ₺ <span style="font-size: 1rem; color: #888;">/ Tag</span>
                    </div>

                    <p style="color: #ccc; line-height: 1.8; margin-bottom: 3rem;">
                        Erleben Sie absolute Spitzenklasse. Dieses Fahrzeug bietet Ihnen nicht nur außergewöhnlichen Komfort, sondern auch eine Leistung, die ihresgleichen sucht. Perfekt für Geschäftsanlässe oder den besonderen Ausflug.
                    </p>

                    <h3 style="margin-bottom: 1.5rem; border-bottom: 1px solid #333; padding-bottom: 0.5rem;">Technische Daten</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 3rem;">
                        <div style="display:flex; align-items:center; gap:1rem;">
                            <i class="fas fa-calendar text-primary" style="font-size: 1.5rem;"></i>
                            <div>
                                <small style="color:#888;">Baujahr</small>
                                <div style="font-weight:700;"><?php echo $car['year']; ?></div>
                            </div>
                        </div>
                        <div style="display:flex; align-items:center; gap:1rem;">
                            <i class="fas fa-gas-pump text-primary" style="font-size: 1.5rem;"></i>
                            <div>
                                <small style="color:#888;">Kraftstoff</small>
                                <div style="font-weight:700;"><?php echo $car['fuel_type']; ?></div>
                            </div>
                        </div>
                        <div style="display:flex; align-items:center; gap:1rem;">
                            <i class="fas fa-cogs text-primary" style="font-size: 1.5rem;"></i>
                            <div>
                                <small style="color:#888;">Getriebe</small>
                                <div style="font-weight:700;"><?php echo $car['transmission']; ?></div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Customer Reviews -->
                    <div style="margin-bottom: 3rem; background: rgba(255,255,255,0.02); padding: 1.5rem; border-radius: 10px;">
                        <h4 style="margin-bottom: 1rem;">Kundenbewertungen</h4>
                        <div style="margin-bottom: 1rem;">
                            <div style="color: #f59e0b; font-size: 0.8rem; margin-bottom: 0.2rem;">
                                <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
                            </div>
                            <p style="font-style: italic; color: #ccc;">"Ein unglaubliches Fahrzeug! Der Service war erstklassig."</p>
                            <small style="color: #666;">- Michael S.</small>
                        </div>
                        <div>
                            <div style="color: #f59e0b; font-size: 0.8rem; margin-bottom: 0.2rem;">
                                <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
                            </div>
                            <p style="font-style: italic; color: #ccc;">"Sauber, schnell und unkompliziert. Gerne wieder."</p>
                            <small style="color: #666;">- Sarah K.</small>
                        </div>
                    </div>

                    <a href="rent.php?id=<?php echo $car['id']; ?>" class="btn btn-primary" style="width: 100%; padding: 1.5rem; text-align: center; font-size: 1.2rem;">
                        JETZT RESERVIEREN <i class="fas fa-arrow-right" style="margin-left: 1rem;"></i>
                    </a>
                </div>

            </div>
        </div>
    </div>
</section>

<?php include 'includes/footer.php'; ?>
