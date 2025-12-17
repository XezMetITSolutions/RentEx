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

<!-- MODERN HERO SECTION -->
<section style="position: relative; padding: 10rem 0 5rem; overflow: hidden; background: #fff;">
    <!-- Decorative Circle -->
    <div style="position: absolute; top: -20%; right: -10%; width: 50vw; height: 50vw; background: radial-gradient(circle, rgba(227,30,36,0.03) 0%, transparent 70%); border-radius: 50%; pointer-events: none;"></div>

    <div class="container">
        <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 2rem; align-items: center;">
            
            <!-- Text Content -->
            <div style="z-index: 2;">
                <span style="display: inline-block; padding: 0.5rem 1rem; background: #f0f0f0; color: #111; font-weight: 600; font-size: 0.8rem; border-radius: 50px; letter-spacing: 1px; margin-bottom: 2rem;">
                    FELDKIRCH • VORARLBERG
                </span>
                <h1 style="font-size: 5rem; font-weight: 800; line-height: 1.05; letter-spacing: -2px; color: #000; margin-bottom: 2rem;">
                    PREMIUM <br><span style="color: var(--primary-color);">DRIVING</span>.<br>REDEFINED.
                </h1>
                <p style="font-size: 1.2rem; color: #666; max-width: 500px; margin-bottom: 3rem; line-height: 1.6;">
                    Erleben Sie Mobilität auf höchstem Niveau. Keine Kompromisse, nur pure Fahrfreude mit den exklusivsten Fahrzeugen der Region.
                </p>

                <!-- Search Form (Minimalist Strip) -->
                <div style="background: #fff; padding: 1rem; border-radius: 15px; box-shadow: 0 20px 60px rgba(0,0,0,0.08); display: inline-block; border: 1px solid rgba(0,0,0,0.05);">
                    <form action="search.php" method="GET" style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                        
                        <div style="padding: 0.5rem 1rem; border-right: 1px solid #eee;">
                            <label style="display: block; font-size: 0.7rem; font-weight: 700; color: #aaa; margin-bottom: 0.3rem;">STANDORT</label>
                            <select name="location" style="border: none; background: transparent; font-weight: 600; color: #000; outline: none; cursor: pointer; font-size: 1rem;">
                                <option>Feldkirch</option>
                                <option>Dornbirn</option>
                                <option>Bregenz</option>
                            </select>
                        </div>
                        
                        <div style="padding: 0.5rem 1rem; border-right: 1px solid #eee;">
                            <label style="display: block; font-size: 0.7rem; font-weight: 700; color: #aaa; margin-bottom: 0.3rem;">ABHOLUNG</label>
                            <input type="date" name="pickup_date" style="border: none; background: transparent; font-weight: 600; color: #000; outline: none; font-family: var(--font-heading);">
                        </div>

                        <div style="padding: 0.5rem 1rem;">
                            <label style="display: block; font-size: 0.7rem; font-weight: 700; color: #aaa; margin-bottom: 0.3rem;">RÜCKGABE</label>
                            <input type="date" name="return_date" style="border: none; background: transparent; font-weight: 600; color: #000; outline: none; font-family: var(--font-heading);">
                        </div>

                        <button type="submit" style="background: #000; color: #fff; width: 60px; height: 60px; border: none; border-radius: 10px; cursor: pointer; transition: transform 0.2s; margin-left: 1rem;">
                            <i class="fas fa-arrow-right" style="font-size: 1.2rem;"></i>
                        </button>
                    </form>
                </div>
            </div>

            <!-- Hero Image (Floating Car) -->
            <div style="position: relative; z-index: 1;">
                <img src="https://freepngimg.com/thumb/audi/35-audi-png-car-image.png" alt="Premium Car" style="width: 140%; margin-right: -40%; filter: drop-shadow(0 30px 40px rgba(0,0,0,0.15)); transform: translateX(50px);">
            </div>
        </div>
    </div>
</section>

<!-- VALUES SECTION -->
<section style="padding: 4rem 0; border-bottom: 1px solid #f0f0f0;">
    <div class="container">
        <div style="display: flex; justify-content: space-around; flex-wrap: wrap; gap: 2rem;">
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="width: 50px; height: 50px; background: rgba(227,30,36,0.1); color: var(--primary-color); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-check"></i>
                </div>
                <div>
                    <h4 style="font-size: 1rem; font-weight: 700;">Alles Inklusive</h4>
                    <span style="font-size: 0.9rem; color: #888;">Keine versteckten Kosten</span>
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="width: 50px; height: 50px; background: rgba(227,30,36,0.1); color: var(--primary-color); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-undo"></i>
                </div>
                <div>
                    <h4 style="font-size: 1rem; font-weight: 700;">Flexibel Stornieren</h4>
                    <span style="font-size: 0.9rem; color: #888;">Bis 24h vor Abholung</span>
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="width: 50px; height: 50px; background: rgba(227,30,36,0.1); color: var(--primary-color); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-headset"></i>
                </div>
                <div>
                    <h4 style="font-size: 1rem; font-weight: 700;">24/7 Support</h4>
                    <span style="font-size: 0.9rem; color: #888;">Immer für Sie da</span>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- FLEET SHOWCASE -->
<section style="padding: 8rem 0; background: #fafafa;">
    <div class="container">
        
        <div style="margin-bottom: 4rem; max-width: 600px;">
            <h2 style="font-size: 3rem; font-weight: 800; color: #000; line-height: 1.1; margin-bottom: 1rem;">
                UNSERE <span style="color: var(--primary-color);">KOLLEKTION</span>
            </h2>
            <p style="color: #666; font-size: 1.1rem;">
                Vom sportlichen Coupé bis zum luxuriösen SUV. Entdecken Sie Fahrzeuge, die begeistern.
            </p>
        </div>

        <!-- Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 3rem;">
            <?php foreach ($cars as $car): ?>
            <div style="background: #fff; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.05); overflow: hidden; transition: transform 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);" onmouseover="this.style.transform='translateY(-10px)'" onmouseout="this.style.transform='translateY(0)'">
                
                <div style="padding: 2.5rem 2.5rem 0;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                        <div>
                            <span style="font-size: 0.8rem; font-weight: 700; color: #aaa; text-transform: uppercase;"><?php echo $car['brand']; ?></span>
                            <h3 style="font-size: 1.8rem; font-weight: 800; color: #000;"><?php echo $car['model']; ?></h3>
                        </div>
                        <span style="background: #000; color: #fff; padding: 0.3rem 0.8rem; border-radius: 50px; font-size: 0.8rem; font-weight: 600;">
                            <?php echo $car['year']; ?>
                        </span>
                    </div>
                </div>

                <div style="height: 220px; width: 100%; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                    <img src="<?php echo $car['image_url']; ?>" style="width: 100%; height: 100%; object-fit: cover;">
                </div>

                <div style="padding: 0 2.5rem 2.5rem;">
                    <div style="display: flex; gap: 1.5rem; margin-bottom: 2rem; border-bottom: 1px solid #f5f5f5; padding-bottom: 1.5rem;">
                        <span style="color: #666; font-size: 0.9rem; display: flex; align-items: center; gap: 0.5rem;"><i class="fas fa-gas-pump" style="color: #aaa;"></i> <?php echo $car['fuel_type']; ?></span>
                        <span style="color: #666; font-size: 0.9rem; display: flex; align-items: center; gap: 0.5rem;"><i class="fas fa-cogs" style="color: #aaa;"></i> <?php echo $car['transmission']; ?></span>
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <span style="display: block; font-size: 0.8rem; color: #aaa; font-weight: 600;">PREIS PRO TAG</span>
                            <span style="font-size: 1.5rem; font-weight: 800; color: #000;"><?php echo number_format($car['price_per_day'], 0, ',', '.'); ?> ₺</span>
                        </div>
                        <a href="rent.php?id=<?php echo $car['id']; ?>" style="width: 50px; height: 50px; background: var(--primary-color); color: #fff; border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 5px 15px rgba(227,30,36,0.3); transition: all 0.2s;">
                            <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </div>

            </div>
            <?php endforeach; ?>
        </div>
        
        <div style="text-align: center; margin-top: 4rem;">
            <a href="fleet.php" class="btn btn-outline" style="border: 2px solid #000; color: #000; background: transparent; padding: 1rem 2.5rem; font-weight: 700; border-radius: 10px;">GESAMTE FLOTTE ANSEHEN</a>
        </div>

    </div>
</section>

<?php include 'includes/footer.php'; ?>
