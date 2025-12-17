<?php
require_once 'includes/db.php';
include 'includes/header.php';

// Fetch featured cars
$cars = [];
try {
    $stmt = $pdo->query("SELECT * FROM cars WHERE status = 'available' LIMIT 3");
    $cars = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) {
    // Fallback
}

// Fallback Data
if (empty($cars)) {
    $cars = [
        ['id' => 1, 'brand' => 'Mercedes-Benz', 'model' => 'S-Class', 'year' => 2024, 'price_per_day' => 5000, 'fuel_type' => 'Dizel', 'transmission' => 'Otomatik', 'image_url' => 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'],
        ['id' => 2, 'brand' => 'BMW', 'model' => 'M4 Competition', 'year' => 2023, 'price_per_day' => 4500, 'fuel_type' => 'Benzin', 'transmission' => 'Otomatik', 'image_url' => 'https://images.unsplash.com/photo-1617788138017-80ad40651399?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'],
        ['id' => 3, 'brand' => 'Audi', 'model' => 'RS7', 'year' => 2024, 'price_per_day' => 4800, 'fuel_type' => 'Benzin', 'transmission' => 'Otomatik', 'image_url' => 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80']
    ];
}
?>

<!-- NEW HERO SECTION -->
<section style="position: relative; height: 100vh; min-height: 700px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
    <!-- Background Image -->
    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: -2;">
        <img src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80" style="width: 100%; height: 100%; object-fit: cover; filter: grayscale(100%) contrast(1.2) brightness(0.4);">
    </div>
    
    <!-- Red Overlay/Gradient -->
    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(45deg, rgba(0,0,0,0.9) 0%, rgba(227,30,36,0.1) 100%); z-index: -1;"></div>

    <div class="container" style="text-align: center; position: relative;">
        <!-- Badge -->
        <span style="display: inline-block; background: var(--primary-color); color: #fff; padding: 0.5rem 1.5rem; border-radius: 50px; font-weight: 700; letter-spacing: 2px; font-size: 0.9rem; margin-bottom: 2rem; box-shadow: 0 0 20px rgba(227,30,36,0.5);">
            FELDKIRCH'S #1 PREMIUM RENTAL
        </span>

        <!-- Main Title -->
        <h1 style="font-size: 5rem; font-weight: 800; line-height: 1.1; margin-bottom: 2rem; text-transform: uppercase;">
            Drive The <br> <span style="color: transparent; -webkit-text-stroke: 2px #fff;">Extraordinary</span>
        </h1>

        <!-- Search Form (Glass) -->
        <div style="background: rgba(255,255,255,0.05); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1); padding: 2rem; border-radius: 20px; max-width: 900px; margin: 0 auto; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
            <form action="search.php" method="GET" style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 200px; text-align: left;">
                    <label style="color: #888; font-size: 0.8rem; margin-bottom: 5px; display: block; padding-left: 10px;">ABHOLORT</label>
                    <div style="position: relative; background: rgba(0,0,0,0.5); border-radius: 10px; border: 1px solid #333;">
                        <i class="fas fa-map-marker-alt" style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: var(--primary-color);"></i>
                        <select name="location" style="width: 100%; padding: 1rem 1rem 1rem 3rem; background: transparent; border: none; color: #fff; outline: none; appearance: none; cursor: pointer;">
                            <option>Feldkirch (Illstraße 75a)</option>
                            <option>Dornbirn</option>
                            <option>Bregenz</option>
                        </select>
                    </div>
                </div>

                <div style="flex: 1; min-width: 150px; text-align: left;">
                    <label style="color: #888; font-size: 0.8rem; margin-bottom: 5px; display: block; padding-left: 10px;">DATUM</label>
                    <div style="position: relative; background: rgba(0,0,0,0.5); border-radius: 10px; border: 1px solid #333;">
                        <i class="fas fa-calendar" style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: var(--primary-color);"></i>
                        <input type="date" name="pickup_date" style="width: 100%; padding: 1rem 1rem 1rem 3rem; background: transparent; border: none; color: #fff; outline: none;">
                    </div>
                </div>

                <div style="flex: 1; min-width: 150px; text-align: left;">
                    <label style="color: #888; font-size: 0.8rem; margin-bottom: 5px; display: block; padding-left: 10px;">RÜCKGABE</label>
                    <div style="position: relative; background: rgba(0,0,0,0.5); border-radius: 10px; border: 1px solid #333;">
                        <i class="fas fa-undo" style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: var(--primary-color);"></i>
                        <input type="date" name="return_date" style="width: 100%; padding: 1rem 1rem 1rem 3rem; background: transparent; border: none; color: #fff; outline: none;">
                    </div>
                </div>

                <div style="flex-basis: 100%; text-align: center; margin-top: 1rem;">
                    <button type="submit" style="width: 100%; background: var(--primary-color); color: #fff; padding: 1rem; border: none; border-radius: 10px; font-weight: 700; font-size: 1.1rem; cursor: pointer; transition: all 0.3s; box-shadow: 0 10px 20px rgba(227,30,36,0.3);">
                        FAHRZEUG FINDEN <i class="fas fa-arrow-right" style="margin-left: 10px;"></i>
                    </button>
                </div>
            </form>
        </div>
    </div>
</section>

<!-- FLEET PREVIEW -->
<section style="padding: 8rem 0; background: #fff;">
    <div class="container">
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 4rem;">
            <div>
                <h2 style="font-size: 3rem; font-weight: 700; margin-bottom: 0.5rem; color: #000;">Unsere <span class="text-primary">Flotte</span></h2>
                <p style="color: #666; font-size: 1.2rem;">Wir bieten nur das Beste.</p>
            </div>
            <a href="fleet.php" style="color: #000; border-bottom: 2px solid var(--primary-color); padding-bottom: 5px; font-weight: 700;">ALLE ANZEIGEN</a>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2.5rem;">
            <?php foreach ($cars as $car): ?>
            <div style="background: #fff; border-radius: 20px; overflow: hidden; transition: all 0.3s; box-shadow: 0 10px 40px rgba(0,0,0,0.08); border: 1px solid rgba(0,0,0,0.05);">
                <div style="height: 250px; overflow: hidden; position: relative;">
                    <img src="<?php echo $car['image_url']; ?>" style="width: 100%; height: 100%; object-fit: cover;">
                    <span style="position: absolute; top: 15px; right: 15px; background: #fff; color: #000; padding: 5px 15px; border-radius: 20px; font-weight: 700; font-size: 0.9rem; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
                        <?php echo $car['year']; ?>
                    </span>
                </div>
                <div style="padding: 2rem;">
                    <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem; color: #000; font-weight: 700;"><?php echo $car['brand']; ?> <span style="font-weight: 400;"><?php echo $car['model']; ?></span></h3>
                    
                    <div style="display: flex; gap: 1rem; color: #666; font-size: 0.9rem; margin-bottom: 1.5rem;">
                        <span><i class="fas fa-gas-pump" style="color: var(--primary-color);"></i> <?php echo $car['fuel_type']; ?></span>
                        <span><i class="fas fa-cogs" style="color: var(--primary-color);"></i> <?php echo $car['transmission']; ?></span>
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 1.5rem; font-weight: 700; color: #000;">
                            <?php echo number_format($car['price_per_day'], 0, ',', '.'); ?> ₺ <span style="font-size: 0.9rem; color: #888; font-weight: 400;">/Tag</span>
                        </span>
                        <a href="rent.php?id=<?php echo $car['id']; ?>" style="background: #000; color: #fff; width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: transform 0.2s;">
                            <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<!-- FEATURES -->
<section style="padding: 6rem 0; background-color: #f8f9fa;">
    <div class="container">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 3rem;">
            <div style="text-align: center; padding: 2rem; background: #fff; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.03);">
                <i class="fas fa-shield-alt" style="font-size: 3rem; color: var(--primary-color); margin-bottom: 1.5rem;"></i>
                <h3 style="margin-bottom: 1rem; color: #000;">100% Sicher</h3>
                <p style="color: #666;">Vollkasko Versicherung und 24/7 Support für Ihre Sicherheit.</p>
            </div>
            <div style="text-align: center; padding: 2rem; background: #fff; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.03);">
                <i class="fas fa-stopwatch" style="font-size: 3rem; color: var(--primary-color); margin-bottom: 1.5rem;"></i>
                <h3 style="margin-bottom: 1rem; color: #000;">Schnelle Abwicklung</h3>
                <p style="color: #666;">Keine Wartezeiten. Buchen Sie online und fahren Sie los.</p>
            </div>
            <div style="text-align: center; padding: 2rem; background: #fff; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.03);">
                <i class="fas fa-star" style="font-size: 3rem; color: var(--primary-color); margin-bottom: 1.5rem;"></i>
                <h3 style="margin-bottom: 1rem; color: #000;">Premium Service</h3>
                <p style="color: #666;">Feldkirch's exklusivste Fahrzeugflotte zu Ihren Diensten.</p>
            </div>
        </div>
    </div>
</section>

<!-- CTA -->
<section style="padding: 8rem 0; background: url('https://images.unsplash.com/photo-1503376763036-066120622c74?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80') center/cover fixed; position: relative;">
    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8);"></div>
    <div class="container" style="position: relative; text-align: center;">
        <h2 style="font-size: 3.5rem; margin-bottom: 1.5rem;">Bereit für das Besondere?</h2>
        <p style="font-size: 1.2rem; color: #ccc; margin-bottom: 3rem; max-width: 600px; margin-left: auto; margin-right: auto;">
            Erleben Sie Fahrspaß auf einem neuen Level. Registrieren Sie sich jetzt und erhalten Sie exklusive Angebote.
        </p>
        <a href="register.php" class="btn btn-primary" style="padding: 1rem 3rem; font-size: 1.2rem;">Konto Erstellen</a>
    </div>
</section>

<?php include 'includes/footer.php'; ?>
