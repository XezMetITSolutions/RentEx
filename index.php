<?php
require_once 'includes/db.php';
include 'includes/header.php';

// Öne çıkan araçları getir
$cars = [];
try {
    $stmt = $pdo->query("SELECT * FROM cars WHERE status = 'available' LIMIT 3");
    $cars = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) {
    // Hata durumunda boş dizi
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
:root {
    --primary-gradient: linear-gradient(135deg, #E31E24 0%, #8B0000 100%);
    --dark-bg: #0a0a0a;
}

@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes scaleIn {
    from { transform: scale(0.9); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
}

.hero-modern {
    min-height: 100vh;
    background: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80');
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    position: relative;
    padding: 100px 20px;
}

.hero-content {
    max-width: 1000px;
    text-align: center;
    z-index: 2;
}

.hero-badge {
    background: rgba(227,30,36,0.2);
    color: #E31E24;
    padding: 10px 25px;
    border-radius: 50px;
    font-weight: 700;
    font-size: 0.9rem;
    letter-spacing: 2px;
    text-transform: uppercase;
    display: inline-block;
    margin-bottom: 25px;
    border: 1px solid rgba(227,30,36,0.3);
    backdrop-filter: blur(10px);
    animation: fadeInUp 0.8s ease-out;
}

.hero-title {
    font-size: clamp(2.5rem, 8vw, 5.5rem);
    font-weight: 900;
    line-height: 1.1;
    margin-bottom: 25px;
    letter-spacing: -2px;
    animation: fadeInUp 0.8s ease-out 0.2s backwards;
}

.hero-title span {
    background: var(--primary-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.hero-subtitle {
    font-size: 1.2rem;
    color: rgba(255,255,255,0.8);
    max-width: 700px;
    margin: 0 auto 40px;
    line-height: 1.7;
    animation: fadeInUp 0.8s ease-out 0.4s backwards;
}

/* Modern Search Bar */
.search-container {
    background: rgba(255,255,255,0.05);
    backdrop-filter: blur(20px);
    padding: 30px;
    border-radius: 30px;
    border: 1px solid rgba(255,255,255,0.1);
    box-shadow: 0 25px 50px rgba(0,0,0,0.3);
    animation: fadeInUp 0.8s ease-out 0.6s backwards;
}

.search-form {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
}

.input-group-modern {
    text-align: left;
}

.input-group-modern label {
    display: block;
    font-size: 0.75rem;
    font-weight: 700;
    color: #E31E24;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.input-group-modern select,
.input-group-modern input {
    width: 100%;
    padding: 15px;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 15px;
    color: #fff;
    font-size: 1rem;
    outline: none;
    transition: all 0.3s;
}

.input-group-modern select:focus,
.input-group-modern input:focus {
    background: rgba(255,255,255,0.15);
    border-color: #E31E24;
}

.btn-search {
    background: var(--primary-gradient);
    color: #fff;
    border: none;
    border-radius: 15px;
    padding: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
}

.btn-search:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(227,30,36,0.3);
}

/* Stats Section */
.stats-section {
    padding: 80px 0;
    background: var(--dark-bg);
}

.stat-item {
    text-align: center;
    color: #fff;
}

.stat-number {
    font-size: 3.5rem;
    font-weight: 900;
    background: var(--primary-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    display: block;
    margin-bottom: 10px;
}

.stat-label {
    color: rgba(255,255,255,0.5);
    font-size: 1rem;
    text-transform: uppercase;
    letter-spacing: 2px;
}

/* Fleet Section */
.fleet-section {
    padding: 100px 0;
    background: #f8f9fa;
}

.section-header {
    text-align: center;
    margin-bottom: 60px;
}

.section-badge {
    color: #E31E24;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 15px;
    display: block;
}

.section-title {
    font-size: 3rem;
    font-weight: 900;
    color: #000;
    margin-bottom: 20px;
}

.car-card-modern {
    background: #fff;
    border-radius: 25px;
    overflow: hidden;
    box-shadow: 0 15px 40px rgba(0,0,0,0.05);
    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
    position: relative;
    height: 100%;
}

.car-card-modern:hover {
    transform: translateY(-15px);
    box-shadow: 0 30px 60px rgba(0,0,0,0.1);
}

.car-image-container {
    height: 250px;
    overflow: hidden;
    position: relative;
}

.car-image-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s;
}

.car-card-modern:hover .car-image-container img {
    transform: scale(1.1);
}

.car-info {
    padding: 30px;
}

.car-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.brand-badge {
    color: #E31E24;
    font-weight: 700;
    font-size: 0.8rem;
    text-transform: uppercase;
}

.year-badge {
    background: #f1f1f1;
    padding: 4px 12px;
    border-radius: 50px;
    font-size: 0.8rem;
    font-weight: 600;
}

.car-name {
    font-size: 1.8rem;
    font-weight: 800;
    margin-bottom: 20px;
    color: #000;
}

.specs-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    padding-top: 20px;
    border-top: 1px solid #eee;
    margin-bottom: 25px;
}

.spec-item {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #666;
    font-size: 0.9rem;
}

.spec-item i {
    color: #E31E24;
}

.price-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.price-tag {
    font-size: 1.5rem;
    font-weight: 900;
    color: #000;
}

.price-tag span {
    font-size: 0.9rem;
    color: #999;
    font-weight: 500;
}

.btn-rent {
    width: 50px;
    height: 50px;
    background: #000;
    color: #fff;
    border-radius: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
}

.car-card-modern:hover .btn-rent {
    background: #E31E24;
}

/* Features Section */
.features-section {
    padding: 100px 0;
    background: #fff;
}

.feature-box {
    text-align: center;
    padding: 40px;
    border-radius: 30px;
    transition: all 0.3s;
    background: #fff;
    border: 1px solid #f0f0f0;
}

.feature-box:hover {
    box-shadow: 0 20px 40px rgba(0,0,0,0.05);
    border-color: #E31E24;
    transform: translateY(-5px);
}

.feature-icon {
    width: 80px;
    height: 80px;
    background: rgba(227,30,36,0.05);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 25px;
    color: #E31E24;
    font-size: 2rem;
    transition: all 0.3s;
}

.feature-box:hover .feature-icon {
    background: #E31E24;
    color: #fff;
    transform: rotateY(180deg);
}

.feature-title {
    font-size: 1.4rem;
    font-weight: 800;
    margin-bottom: 15px;
    color: #000;
}

.feature-desc {
    color: #666;
    line-height: 1.6;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .hero-title { font-size: 3.5rem; }
    .section-title { font-size: 2.2rem; }
    .search-container { padding: 20px; border-radius: 20px; }
}
</style>

<!-- Hero Section -->
<section class="hero-modern">
    <div class="container">
        <div class="hero-content">
            <span class="hero-badge">Ayrıcalıklı Araç Kiralama</span>
            <h1 class="hero-title">Özel Anlar İçin<br><span>Eşsiz Sürüş Deneyimi</span></h1>
            <p class="hero-subtitle">
                Rentex ile lüksü keşfedin. Premium araç filomuz ve kusursuz hizmet anlayışımızla yolculuklarınızı unutulmaz kılıyoruz.
            </p>

            <div class="search-container">
                <form action="search.php" method="GET" class="search-form">
                    <div class="input-group-modern">
                        <label>Teslim Alış Noktası</label>
                        <select name="location">
                            <option>Merkez Ofis (İstanbul)</option>
                            <option>Havalimanı</option>
                            <option>Kadıköy</option>
                            <option>Beşiktaş</option>
                        </select>
                    </div>
                    <div class="input-group-modern">
                        <label>Alış Tarihi</label>
                        <input type="date" name="pickup_date" required>
                    </div>
                    <div class="input-group-modern">
                        <label>Dönüş Tarihi</label>
                        <input type="date" name="return_date" required>
                    </div>
                    <div class="input-group-modern">
                        <label>&nbsp;</label>
                        <button type="submit" class="btn-search">
                            <span>ARA</span>
                            <i class="fas fa-search"></i>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</section>

<!-- Stats Section -->
<section class="stats-section">
    <div class="container">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 40px;">
            <div class="stat-item">
                <span class="stat-number">1200+</span>
                <span class="stat-label">Mutlu Müşteri</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">45+</span>
                <span class="stat-label">Lüks Araç</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">12</span>
                <span class="stat-label">Yıllık Tecrübe</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">7/24</span>
                <span class="stat-label">Destek</span>
            </div>
        </div>
    </div>
</section>

<!-- Our Fleet -->
<section class="fleet-section">
    <div class="container">
        <div class="section-header">
            <span class="section-badge">Araç Filomuz</span>
            <h2 class="section-title">Size Özel Seçenekler</h2>
            <p style="color: #666; max-width: 600px; margin: 0 auto;">En yeni modeller ve en iyi markalarla konforlu bir sürüşe hazır olun.</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 30px;">
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
                            <?php echo number_format($car['price_per_day'], 0, ',', '.'); ?> TL <span>/gün</span>
                        </div>
                        <a href="rent.php?id=<?php echo $car['id']; ?>" class="btn-rent">
                            <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            </div>
            <?php endforeach; ?>
        </div>

        <div style="text-align: center; margin-top: 60px;">
            <a href="fleet.php" class="btn btn-primary" style="padding: 15px 40px; font-size: 1rem;">TÜM ARAÇLARI GÖR</a>
        </div>
    </div>
</section>

<!-- Features Section -->
<section class="features-section">
    <div class="container">
        <div class="section-header">
            <span class="section-badge">Neden Biz?</span>
            <h2 class="section-title">Kaliteli Hizmetin Adresi</h2>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px;">
            <div class="feature-box">
                <div class="feature-icon">
                    <i class="fas fa-shield-alt"></i>
                </div>
                <h3 class="feature-title">Tam Sigorta</h3>
                <p class="feature-desc">Tüm araçlarımız kapsamlı kasko ve sigorta ile güvence altındadır. Güvenle sürün.</p>
            </div>

            <div class="feature-box">
                <div class="feature-icon">
                    <i class="fas fa-headset"></i>
                </div>
                <h3 class="feature-title">7/24 Destek</h3>
                <p class="feature-desc">Yolculuğunuzun her anında yanınızdayız. Canlı destek hattımız her zaman açık.</p>
            </div>

            <div class="feature-box">
                <div class="feature-icon">
                    <i class="fas fa-car"></i>
                </div>
                <h3 class="feature-title">Yeni Filo</h3>
                <p class="feature-desc">Araçlarımızın tamamı düşük kilometreli ve en son modellerden oluşmaktadır.</p>
            </div>
        </div>
    </div>
</section>

<!-- Call to Action -->
<section style="padding: 100px 0; background: var(--dark-bg); position: relative; overflow: hidden;">
    <div style="position: absolute; top: -50%; left: -10%; width: 500px; height: 500px; background: rgba(227,30,36,0.1); filter: blur(100px); border-radius: 50%;"></div>
    <div class="container">
        <div style="text-align: center; color: #fff; position: relative; z-index: 2;">
            <h2 style="font-size: 3.5rem; font-weight: 900; margin-bottom: 30px;">Yola Çıkmaya Hazır Mısınız?</h2>
            <p style="font-size: 1.2rem; color: rgba(255,255,255,0.7); max-width: 600px; margin: 0 auto 40px;">Hemen rezervasyon yapın, hayalinizdeki araca en uygun fiyatlarla sahip olun.</p>
            <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
                <a href="search.php" class="btn btn-primary" style="padding: 18px 45px;">ŞİMDİ REZERVE ET</a>
                <a href="contact.php" class="btn btn-outline" style="padding: 18px 45px; border-color: #fff; color: #fff;">BİZE ULAŞIN</a>
            </div>
        </div>
    </div>
</section>

<?php include 'includes/footer.php'; ?>
