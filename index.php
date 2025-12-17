<?php
require_once 'includes/db.php';
include 'includes/header.php';

// Featured cars holen
$cars = [];
try {
    $stmt = $pdo->query("SELECT * FROM cars WHERE status = 'available' LIMIT 3");
    $cars = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) {
    // Fallback
}

if (empty($cars)) {
    $cars = [
        ['id' => 1, 'brand' => 'Mercedes-Benz', 'model' => 'S-Class', 'year' => 2024, 'price_per_day' => 250, 'fuel_type' => 'Diesel', 'transmission' => 'Automatik', 'image_url' => 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'],
        ['id' => 2, 'brand' => 'BMW', 'model' => 'M4 Competition', 'year' => 2023, 'price_per_day' => 180, 'fuel_type' => 'Benzin', 'transmission' => 'Automatik', 'image_url' => 'https://images.unsplash.com/photo-1617788138017-80ad40651399?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'],
        ['id' => 3, 'brand' => 'Audi', 'model' => 'RS7', 'year' => 2024, 'price_per_day' => 220, 'fuel_type' => 'Benzin', 'transmission' => 'Automatik', 'image_url' => 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80']
    ];
}
?>

<style>
:root {
    --primary-gradient: linear-gradient(135deg, #E31E24 0%, #8B0000 100%);
    --dark-bg: #0a0a0a;
    --glass-bg: rgba(255, 255, 255, 0.03);
    --glass-border: rgba(255, 255, 255, 0.1);
}

@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(40px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes float {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(2deg); }
}

@keyframes pulse-red {
    0% { box-shadow: 0 0 0 0 rgba(227, 30, 36, 0.4); }
    70% { box-shadow: 0 0 0 20px rgba(227, 30, 36, 0); }
    100% { box-shadow: 0 0 0 0 rgba(227, 30, 36, 0); }
}

.hero-modern {
    min-height: 100vh;
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    position: relative;
    padding: 120px 20px;
    overflow: hidden;
}

.hero-bg-media {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
}

.hero-bg-media img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.5;
    filter: brightness(0.7) contrast(1.1);
}

.hero-bg-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.9) 100%);
    z-index: 2;
}

.floating-shape {
    position: absolute;
    background: var(--primary-gradient);
    filter: blur(80px);
    opacity: 0.15;
    border-radius: 50%;
    z-index: 2;
    animation: float 10s ease-in-out infinite;
}

.hero-content {
    max-width: 1100px;
    text-align: center;
    z-index: 3;
    position: relative;
}

.hero-badge {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid var(--glass-border);
    color: #fff;
    padding: 12px 30px;
    border-radius: 100px;
    font-weight: 600;
    font-size: 0.85rem;
    letter-spacing: 3px;
    text-transform: uppercase;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 35px;
    animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.hero-badge i {
    color: #E31E24;
    font-size: 0.7rem;
}

.hero-title {
    font-size: clamp(3rem, 10vw, 7rem);
    font-weight: 950;
    line-height: 0.95;
    margin-bottom: 30px;
    letter-spacing: -4px;
    text-transform: uppercase;
    animation: fadeInUp 1s cubic-bezier(0.2, 0.8, 0.2, 1) 0.1s backwards;
}

.hero-title span {
    display: block;
    background: linear-gradient(to bottom, #fff 30%, rgba(255,255,255,0.5) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.hero-title .accent-text {
    background: var(--primary-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-style: italic;
}

.hero-subtitle {
    font-size: 1.3rem;
    color: rgba(255,255,255,0.6);
    max-width: 600px;
    margin: 0 auto 50px;
    line-height: 1.6;
    animation: fadeInUp 1s cubic-bezier(0.2, 0.8, 0.2, 1) 0.2s backwards;
}

.search-container {
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(30px);
    padding: 15px;
    border-radius: 40px;
    border: 1px solid var(--glass-border);
    box-shadow: 0 40px 100px rgba(0,0,0,0.5);
    animation: fadeInUp 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) 0.3s backwards;
    width: 100%;
}

.search-form-inner {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    padding: 10px;
}

.search-input-group {
    flex: 1;
    min-width: 160px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--glass-border);
    border-radius: 25px;
    padding: 12px 20px;
    text-align: left;
    transition: all 0.3s ease;
}

.search-input-group:hover, .search-input-group:focus-within {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(227, 30, 36, 0.5);
}

.search-input-group label {
    display: block;
    font-size: 0.65rem;
    font-weight: 700;
    color: #E31E24;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin-bottom: 5px;
}

.search-input-group input, .search-input-group select {
    width: 100%;
    background: transparent;
    border: none;
    color: #fff;
    font-size: 0.95rem;
    font-weight: 600;
    outline: none;
}

.search-input-group input[type="date"]::-webkit-calendar-picker-indicator,
.search-input-group input[type="time"]::-webkit-calendar-picker-indicator {
    filter: invert(1);
}

.btn-search-modern {
    background: var(--primary-gradient);
    color: #fff;
    border: none;
    border-radius: 25px;
    padding: 0 40px;
    font-weight: 800;
    font-size: 0.9rem;
    letter-spacing: 1px;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    height: 70px;
}

.btn-search-modern:hover {
    transform: scale(1.05);
    box-shadow: 0 15px 30px rgba(227, 30, 36, 0.4);
}

.location-tag {
    margin-top: 20px;
    font-size: 0.8rem;
    color: rgba(255,255,255,0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.location-tag i {
    color: #E31E24;
    animation: pulse-red 2s infinite;
    border-radius: 50%;
}

/* Rest of the sections styling */
.stats-section {
    padding: 100px 0;
    background: var(--dark-bg);
}

.stat-item {
    text-align: center;
    color: #fff;
}

.stat-number {
    font-size: 4.5rem;
    font-weight: 900;
    background: var(--primary-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    display: block;
    margin-bottom: 10px;
    letter-spacing: -2px;
}

.stat-label {
    color: rgba(255,255,255,0.4);
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 3px;
    font-weight: 700;
}

.fleet-section {
    padding: 120px 0;
    background: #fcfcfc;
}

.section-header {
    text-align: center;
    margin-bottom: 80px;
}

.section-badge {
    color: #E31E24;
    font-weight: 800;
    letter-spacing: 4px;
    text-transform: uppercase;
    margin-bottom: 20px;
    display: block;
    font-size: 0.8rem;
}

.section-title {
    font-size: clamp(2.5rem, 5vw, 4rem);
    font-weight: 900;
    color: #000;
    margin-bottom: 25px;
    letter-spacing: -2px;
}

.car-card-modern {
    background: #fff;
    border-radius: 35px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0,0,0,0.04);
    transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
    position: relative;
    height: 100%;
    border: 1px solid rgba(0,0,0,0.03);
}

.car-card-modern:hover {
    transform: translateY(-20px);
    box-shadow: 0 40px 80px rgba(0,0,0,0.1);
}

.car-image-container {
    height: 280px;
    overflow: hidden;
    position: relative;
    background: #f8f8f8;
}

.car-image-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 1s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.car-card-modern:hover .car-image-container img {
    transform: scale(1.1);
}

.car-info {
    padding: 35px;
}

.car-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.brand-badge {
    color: #E31E24;
    font-weight: 800;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.year-badge {
    background: #f0f0f0;
    padding: 6px 15px;
    border-radius: 50px;
    font-size: 0.75rem;
    font-weight: 700;
}

.car-name {
    font-size: 2rem;
    font-weight: 900;
    margin-bottom: 25px;
    color: #000;
    letter-spacing: -1px;
}

.specs-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    padding-top: 25px;
    border-top: 1px solid #f0f0f0;
    margin-bottom: 30px;
}

.spec-item {
    display: flex;
    align-items: center;
    gap: 12px;
    color: #666;
    font-size: 0.95rem;
    font-weight: 500;
}

.spec-item i {
    color: #E31E24;
    font-size: 1rem;
}

.price-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.price-tag {
    font-size: 1.8rem;
    font-weight: 950;
    color: #000;
    letter-spacing: -1px;
}

.price-tag span {
    font-size: 1rem;
    color: #aaa;
    font-weight: 600;
    margin-left: 5px;
}

.btn-rent-circle {
    width: 65px;
    height: 65px;
    background: #000;
    color: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    font-size: 1.2rem;
}

.car-card-modern:hover .btn-rent-circle {
    background: #E31E24;
    transform: rotate(-45deg);
}

.features-section {
    padding: 120px 0;
    background: #fff;
}

.feature-box {
    text-align: center;
    padding: 60px 40px;
    border-radius: 40px;
    transition: all 0.4s ease;
    background: #fff;
    border: 1px solid #f5f5f5;
}

.feature-box:hover {
    box-shadow: 0 30px 60px rgba(0,0,0,0.05);
    border-color: #E31E24;
    transform: translateY(-10px);
}

.feature-icon {
    width: 90px;
    height: 90px;
    background: rgba(227,30,36,0.05);
    border-radius: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 30px;
    color: #E31E24;
    font-size: 2.2rem;
    transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.feature-box:hover .feature-icon {
    background: #E31E24;
    color: #fff;
    transform: rotateY(180deg);
}

.feature-title {
    font-size: 1.6rem;
    font-weight: 900;
    margin-bottom: 18px;
    color: #000;
}

.feature-desc {
    color: #777;
    line-height: 1.7;
    font-size: 1.05rem;
}

@media (max-width: 991px) {
    .btn-search-modern {
        width: 100%;
        height: 60px;
    }
}

@media (max-width: 768px) {
    .hero-title { font-size: 3.5rem; letter-spacing: -2px; }
    .hero-subtitle { font-size: 1.1rem; }
    .search-container { border-radius: 30px; padding: 10px; }
    .stat-number { font-size: 3.5rem; }
}
</style>

<!-- Hero Section -->
<section class="hero-modern">
    <!-- Animated background elements -->
    <div class="floating-shape" style="width: 600px; height: 600px; top: -10%; right: -5%;"></div>
    <div class="floating-shape" style="width: 400px; height: 400px; bottom: 5%; left: -5%; animation-delay: -2s;"></div>
    
    <div class="hero-bg-media">
        <img src="https://images.unsplash.com/photo-1503376763036-066120622c74?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80" alt="Premium Car">
    </div>
    <div class="hero-bg-overlay"></div>

    <div class="container">
        <div class="hero-content">
            <div class="hero-badge">
                <i class="fas fa-circle"></i> EXKLUSIVE AUTOVERMIETUNG <i class="fas fa-circle"></i>
            </div>
            <h1 class="hero-title">
                <span>FAHREN SIE DAS</span>
                <span class="accent-text">BESONDERE</span>
            </h1>
            <p class="hero-subtitle">
                Erleben Sie Luxus auf einem neuen Level. Unsere handverlesene Premium-Flotte wartet auf Sie.
            </p>

            <div class="search-container">
                <form action="search.php" method="GET" class="search-form-inner">
                    <div class="search-input-group">
                        <label><i class="far fa-calendar-alt"></i> Abholdatum</label>
                        <input type="date" name="pickup_date" required>
                    </div>
                    <div class="search-input-group">
                        <label><i class="far fa-clock"></i> Zeit</label>
                        <input type="time" name="pickup_time" required>
                    </div>
                    <div class="search-input-group">
                        <label><i class="far fa-calendar-check"></i> Rückgabe</label>
                        <input type="date" name="return_date" required>
                    </div>
                    <div class="search-input-group">
                        <label><i class="fas fa-layer-group"></i> Kategorie</label>
                        <select name="category">
                            <option value="all">Alle Klassen</option>
                            <option value="luxus">Premium</option>
                            <option value="sport">Sport</option>
                            <option value="suv">SUV</option>
                        </select>
                    </div>
                    <button type="submit" class="btn-search-modern">
                        VERFÜGBARKEIT PRÜFEN
                    </button>
                </form>
            </div>
            
            <div class="location-tag">
                <i class="fas fa-map-marker-alt"></i> <span>STATION: <strong>FELDKIRCH, ÖSTERREICH</strong></span>
            </div>
        </div>
    </div>
</section>

<!-- Stats Section -->
<section class="stats-section">
    <div class="container">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 50px;">
            <div class="stat-item">
                <span class="stat-number">1200+</span>
                <span class="stat-label">Kunden</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">45+</span>
                <span class="stat-label">Fahrzeuge</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">12</span>
                <span class="stat-label">Jahre</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">24/7</span>
                <span class="stat-label">Support</span>
            </div>
        </div>
    </div>
</section>

<!-- Our Fleet -->
<section class="fleet-section">
    <div class="container">
        <div class="section-header">
            <span class="section-badge">UNSERE KOLLEKTION</span>
            <h2 class="section-title">Bereit für die Straße</h2>
            <p style="color: #888; max-width: 600px; margin: 0 auto; font-size: 1.1rem;">Wählen Sie aus den exklusivsten Modellen der Welt.</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 40px;">
            <?php foreach ($cars as $car): ?>
            <div class="car-card-modern">
                <div class="car-image-container">
                    <img src="<?php echo $car['image_url']; ?>" alt="<?php echo $car['brand'] . ' ' . $car['model']; ?>">
                </div>
                <div class="car-info">
                    <div class="car-meta">
                        <span class="brand-badge"><?php echo $car['brand']; ?></span>
                        <span class="year-badge"><?php echo $car['year']; ?></span>
                    </div>
                    <h3 class="car-name"><?php echo $car['model']; ?></h3>
                    
                    <div class="specs-grid">
                        <div class="spec-item">
                            <i class="fas fa-gas-pump"></i>
                            <span><?php echo $car['fuel_type']; ?></span>
                        </div>
                        <div class="spec-item">
                            <i class="fas fa-cog"></i>
                            <span><?php echo $car['transmission']; ?></span>
                        </div>
                    </div>

                    <div class="price-container">
                        <div class="price-tag">
                            € <?php echo number_format($car['price_per_day'], 0, ',', '.'); ?> <span>/Tag</span>
                        </div>
                        <a href="rent.php?id=<?php echo $car['id']; ?>" class="btn-rent-circle">
                            <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            </div>
            <?php endforeach; ?>
        </div>

        <div style="text-align: center; margin-top: 80px;">
            <a href="fleet.php" class="btn btn-primary" style="padding: 20px 50px; font-size: 1rem; border-radius: 100px;">GESAMTE FLOTTE ENTDECKEN</a>
        </div>
    </div>
</section>

<!-- Features Section -->
<section class="features-section">
    <div class="container">
        <div class="section-header">
            <span class="section-badge">DER RENTEX VORTEIL</span>
            <h2 class="section-title">Warum Kunden uns wählen</h2>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px;">
            <div class="feature-box">
                <div class="feature-icon">
                    <i class="fas fa-shield-alt"></i>
                </div>
                <h3 class="feature-title">Sicherheit</h3>
                <p class="feature-desc">Vollkaskoschutz und modernste Sicherheitssysteme für jede Fahrt.</p>
            </div>

            <div class="feature-box">
                <div class="feature-icon">
                    <i class="fas fa-headset"></i>
                </div>
                <h3 class="feature-title">Exzellenz</h3>
                <p class="feature-desc">Persönlicher 24/7 Concierge-Service für all Ihre Wünsche.</p>
            </div>

            <div class="feature-box">
                <div class="feature-icon">
                    <i class="fas fa-car"></i>
                </div>
                <h3 class="feature-title">Zustand</h3>
                <p class="feature-desc">Unsere Fahrzeuge sind in tadellosem Zustand – wie am ersten Tag.</p>
            </div>
        </div>
    </div>
</section>

<!-- Call to Action -->
<section style="padding: 120px 0; background: var(--dark-bg); position: relative; overflow: hidden;">
    <div class="floating-shape" style="width: 500px; height: 500px; top: -20%; left: -10%; opacity: 0.1;"></div>
    <div class="container">
        <div style="text-align: center; color: #fff; position: relative; z-index: 2;">
            <h2 style="font-size: clamp(2.5rem, 6vw, 4rem); font-weight: 950; margin-bottom: 30px; letter-spacing: -2px;">BEREIT FÜR DIE FAHRT IHRES LEBENS?</h2>
            <p style="font-size: 1.25rem; color: rgba(255,255,255,0.5); max-width: 650px; margin: 0 auto 50px;">Reservieren Sie jetzt online und sichern Sie sich Ihren exklusiven Mietwagen in nur wenigen Minuten.</p>
            <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
                <a href="search.php" class="btn btn-primary" style="padding: 22px 60px; border-radius: 100px;">JETZT BUCHEN</a>
                <a href="contact.php" class="btn btn-outline" style="padding: 22px 60px; border-radius: 100px; border-color: #fff; color: #fff;">KONTAKT AUFNEHMEN</a>
            </div>
        </div>
    </div>
</section>

<?php include 'includes/footer.php'; ?>
