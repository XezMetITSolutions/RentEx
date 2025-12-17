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

if (empty($cars)) {
    $cars = [
        ['id' => 1, 'brand' => 'Mercedes-Benz', 'model' => 'S-Class', 'year' => 2024, 'price_per_day' => 5000, 'fuel_type' => 'Dizel', 'transmission' => 'Otomatik', 'image_url' => 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'],
        ['id' => 2, 'brand' => 'BMW', 'model' => 'M4 Competition', 'year' => 2023, 'price_per_day' => 4500, 'fuel_type' => 'Benzin', 'transmission' => 'Otomatik', 'image_url' => 'https://images.unsplash.com/photo-1617788138017-80ad40651399?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'],
        ['id' => 3, 'brand' => 'Audi', 'model' => 'RS7', 'year' => 2024, 'price_per_day' => 4800, 'fuel_type' => 'Benzin', 'transmission' => 'Otomatik', 'image_url' => 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80']
    ];
}
?>

<style>
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
}

.hero-section {
    animation: fadeIn 0.8s ease-out;
}

.fade-in-up {
    animation: fadeInUp 0.8s ease-out forwards;
    opacity: 0;
}

.delay-1 { animation-delay: 0.2s; }
.delay-2 { animation-delay: 0.4s; }
.delay-3 { animation-delay: 0.6s; }

.car-card {
    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.car-card:hover {
    transform: translateY(-15px);
    box-shadow: 0 30px 60px rgba(0,0,0,0.15);
}

.car-card:hover img {
    transform: scale(1.1);
}

.car-card img {
    transition: transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.btn-primary-modern {
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
}

.btn-primary-modern::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s ease;
}

.btn-primary-modern:hover::before {
    left: 100%;
}

.gradient-text {
    background: linear-gradient(135deg, #E31E24 0%, #8B0000 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}
</style>

<!-- HERO SECTION -->
<section class="hero-section" style="min-height: 100vh; display: flex; align-items: center; position: relative; overflow: hidden; background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);">
    
    <!-- Animated Background Elements -->
    <div style="position: absolute; top: 10%; right: 5%; width: 500px; height: 500px; background: radial-gradient(circle, rgba(227,30,36,0.05) 0%, transparent 70%); border-radius: 50%; animation: float 6s ease-in-out infinite;"></div>
    <div style="position: absolute; bottom: 10%; left: 5%; width: 400px; height: 400px; background: radial-gradient(circle, rgba(0,0,0,0.02) 0%, transparent 70%); border-radius: 50%; animation: float 8s ease-in-out infinite;"></div>

    <div class="container" style="position: relative; z-index: 2;">
        <div style="max-width: 1200px; margin: 0 auto; text-align: center; padding: 2rem 0;">
            
            <div class="fade-in-up" style="margin-bottom: 2rem;">
                <span style="display: inline-block; padding: 0.7rem 2rem; background: rgba(227,30,36,0.1); color: var(--primary-color); font-weight: 700; font-size: 0.9rem; border-radius: 50px; letter-spacing: 2px;">
                    PREMIUM CAR RENTAL • FELDKIRCH
                </span>
            </div>

            <h1 class="fade-in-up delay-1" style="font-size: clamp(3rem, 8vw, 6rem); font-weight: 900; line-height: 1.1; margin-bottom: 2rem; letter-spacing: -3px;">
                Fahre das<br>
                <span class="gradient-text">Außergewöhnliche</span>
            </h1>

            <p class="fade-in-up delay-2" style="font-size: 1.3rem; color: #666; max-width: 700px; margin: 0 auto 4rem; line-height: 1.8;">
                Erleben Sie Luxus auf Rädern. Premium Fahrzeuge. Erstklassiger Service. Unvergessliche Momente.
            </p>

            <!-- Search Bar -->
            <div class="fade-in-up delay-3" style="background: #fff; max-width: 900px; margin: 0 auto; padding: 2rem; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.1); backdrop-filter: blur(10px);">
                <form action="search.php" method="GET" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; align-items: end;">
                    
                    <div style="text-align: left;">
                        <label style="display: block; font-size: 0.75rem; font-weight: 700; color: #999; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 1px;">Standort</label>
                        <select name="location" style="width: 100%; padding: 0.8rem; border: 2px solid #f0f0f0; border-radius: 10px; font-size: 1rem; font-weight: 600; color: #000; outline: none; transition: all 0.3s;">
                            <option>Feldkirch (Illstraße 75a)</option>
                            <option>Dornbirn</option>
                            <option>Bregenz</option>
                        </select>
                    </div>

                    <div style="text-align: left;">
                        <label style="display: block; font-size: 0.75rem; font-weight: 700; color: #999; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 1px;">Abholung</label>
                        <input type="date" name="pickup_date" style="width: 100%; padding: 0.8rem; border: 2px solid #f0f0f0; border-radius: 10px; font-size: 1rem; font-weight: 600; color: #000; outline: none; transition: all 0.3s;">
                    </div>

                    <div style="text-align: left;">
                        <label style="display: block; font-size: 0.75rem; font-weight: 700; color: #999; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 1px;">Rückgabe</label>
                        <input type="date" name="return_date" style="width: 100%; padding: 0.8rem; border: 2px solid #f0f0f0; border-radius: 10px; font-size: 1rem; font-weight: 600; color: #000; outline: none; transition: all 0.3s;">
                    </div>

                    <button type="submit" class="btn-primary-modern" style="padding: 1rem 2.5rem; background: linear-gradient(135deg, #E31E24 0%, #b91c1c 100%); color: #fff; border: none; border-radius: 10px; font-weight: 700; font-size: 1rem; cursor: pointer; box-shadow: 0 10px 25px rgba(227,30,36,0.3);">
                        SUCHEN <i class="fas fa-arrow-right" style="margin-left: 0.5rem;"></i>
                    </button>
                </form>
            </div>

        </div>
    </div>
</section>

<!-- STATS SECTION -->
<section style="padding: 6rem 0; background: #000; color: #fff;">
    <div class="container">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 4rem; text-align: center;">
            <div>
                <h3 style="font-size: 4rem; font-weight: 900; margin-bottom: 0.5rem; background: linear-gradient(135deg, #E31E24 0%, #ff4d4d 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">500+</h3>
                <p style="color: #888; font-size: 1.1rem;">Zufriedene Kunden</p>
            </div>
            <div>
                <h3 style="font-size: 4rem; font-weight: 900; margin-bottom: 0.5rem; background: linear-gradient(135deg, #E31E24 0%, #ff4d4d 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">50+</h3>
                <p style="color: #888; font-size: 1.1rem;">Premium Fahrzeuge</p>
            </div>
            <div>
                <h3 style="font-size: 4rem; font-weight: 900; margin-bottom: 0.5rem; background: linear-gradient(135deg, #E31E24 0%, #ff4d4d 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">24/7</h3>
                <p style="color: #888; font-size: 1.1rem;">Kundenservice</p>
            </div>
        </div>
    </div>
</section>

<!-- CAR SHOWCASE -->
<section style="padding: 8rem 0; background: #fafafa;">
    <div class="container">
        
        <div style="max-width: 800px; margin-bottom: 6rem;">
            <span style="display: inline-block; padding: 0.5rem 1.5rem; background: rgba(227,30,36,0.1); color: var(--primary-color); font-weight: 700; font-size: 0.85rem; border-radius: 50px; margin-bottom: 1.5rem;">
                UNSERE KOLLEKTION
            </span>
            <h2 style="font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 900; color: #000; line-height: 1.2; margin-bottom: 1.5rem; letter-spacing: -2px;">
                Exklusive Fahrzeuge für besondere Momente
            </h2>
            <p style="font-size: 1.2rem; color: #666; line-height: 1.8;">
                Jedes Fahrzeug in unserer Flotte wurde sorgfältig ausgewählt, um Ihnen ein unvergessliches Fahrerlebnis zu bieten.
            </p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)); gap: 3rem;">
            <?php foreach ($cars as $index => $car): ?>
            <div class="car-card" style="background: #fff; border-radius: 24px; overflow: hidden; box-shadow: 0 15px 40px rgba(0,0,0,0.08);">
                
                <div style="height: 280px; overflow: hidden; position: relative; background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);">
                    <img src="<?php echo $car['image_url']; ?>" style="width: 100%; height: 100%; object-fit: cover;">
                    <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.3) 100%);"></div>
                    
                    <div style="position: absolute; top: 1.5rem; right: 1.5rem; background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); padding: 0.5rem 1rem; border-radius: 50px; font-weight: 700; font-size: 0.9rem; color: #000;">
                        <?php echo $car['year']; ?>
                    </div>
                </div>

                <div style="padding: 2.5rem;">
                    
                    <div style="margin-bottom: 2rem;">
                        <span style="font-size: 0.85rem; font-weight: 700; color: var(--primary-color); text-transform: uppercase; letter-spacing: 1px;">
                            <?php echo $car['brand']; ?>
                        </span>
                        <h3 style="font-size: 2rem; font-weight: 800; color: #000; margin-top: 0.5rem;">
                            <?php echo $car['model']; ?>
                        </h3>
                    </div>

                    <div style="display: flex; gap: 2rem; padding: 1.5rem 0; border-top: 2px solid #f5f5f5; border-bottom: 2px solid #f5f5f5; margin-bottom: 2rem;">
                        <div style="display: flex; align-items: center; gap: 0.6rem;">
                            <i class="fas fa-gas-pump" style="color: #ccc; font-size: 1rem;"></i>
                            <span style="color: #666; font-weight: 600; font-size: 0.95rem;"><?php echo $car['fuel_type']; ?></span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 0.6rem;">
                            <i class="fas fa-cogs" style="color: #ccc; font-size: 1rem;"></i>
                            <span style="color: #666; font-weight: 600; font-size: 0.95rem;"><?php echo $car['transmission']; ?></span>
                        </div>
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <span style="display: block; font-size: 0.75rem; color: #999; font-weight: 600; margin-bottom: 0.3rem;">AB</span>
                            <span style="font-size: 2rem; font-weight: 900; color: #000;">
                                <?php echo number_format($car['price_per_day'], 0, ',', '.'); ?> €
                            </span>
                            <span style="font-size: 0.9rem; color: #999; font-weight: 500;">/Tag</span>
                        </div>
                        <a href="rent.php?id=<?php echo $car['id']; ?>" style="width: 60px; height: 60px; background: #000; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.3s; box-shadow: 0 8px 20px rgba(0,0,0,0.15);" onmouseover="this.style.background='var(--primary-color)'; this.style.transform='scale(1.1)'" onmouseout="this.style.background='#000'; this.style.transform='scale(1)'">
                            <i class="fas fa-arrow-right" style="font-size: 1.2rem;"></i>
                        </a>
                    </div>

                </div>
            </div>
            <?php endforeach; ?>
        </div>

        <div style="text-align: center; margin-top: 5rem;">
            <a href="fleet.php" style="display: inline-block; padding: 1.2rem 3rem; background: #000; color: #fff; border-radius: 12px; font-weight: 700; font-size: 1.1rem; transition: all 0.3s; box-shadow: 0 10px 30px rgba(0,0,0,0.15);" onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 15px 40px rgba(0,0,0,0.2)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 10px 30px rgba(0,0,0,0.15)'">
                ALLE FAHRZEUGE ANSEHEN <i class="fas fa-arrow-right" style="margin-left: 0.8rem;"></i>
            </a>
        </div>

    </div>
</section>

<!-- FEATURES SECTION -->
<section style="padding: 8rem 0; background: #fff;">
    <div class="container">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 4rem;">
            
            <div style="text-align: center;">
                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, rgba(227,30,36,0.1) 0%, rgba(227,30,36,0.05) 100%); border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 2rem;">
                    <i class="fas fa-shield-alt" style="font-size: 2rem; color: var(--primary-color);"></i>
                </div>
                <h3 style="font-size: 1.5rem; font-weight: 800; color: #000; margin-bottom: 1rem;">Vollkasko inklusive</h3>
                <p style="color: #666; font-size: 1.05rem; line-height: 1.7;">Fahren Sie sorgenfrei mit unserer umfassenden Versicherung.</p>
            </div>

            <div style="text-align: center;">
                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, rgba(227,30,36,0.1) 0%, rgba(227,30,36,0.05) 100%); border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 2rem;">
                    <i class="fas fa-clock" style="font-size: 2rem; color: var(--primary-color);"></i>
                </div>
                <h3 style="font-size: 1.5rem; font-weight: 800; color: #000; margin-bottom: 1rem;">Flexible Zeiten</h3>
                <p style="color: #666; font-size: 1.05rem; line-height: 1.7;">Buchen Sie tageweise, wochenweise oder langfristig.</p>
            </div>

            <div style="text-align: center;">
                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, rgba(227,30,36,0.1) 0%, rgba(227,30,36,0.05) 100%); border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 2rem;">
                    <i class="fas fa-star" style="font-size: 2rem; color: var(--primary-color);"></i>
                </div>
                <h3 style="font-size: 1.5rem; font-weight: 800; color: #000; margin-bottom: 1rem;">Premium Service</h3>
                <p style="color: #666; font-size: 1.05rem; line-height: 1.7;">Persönliche Beratung und erstklassiger Kundenservice.</p>
            </div>

        </div>
    </div>
</section>

<?php include 'includes/footer.php'; ?>
