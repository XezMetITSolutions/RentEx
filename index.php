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
    <h1>Hayalinizdeki Aracı Kiralayın</h1>
    <p>Premium araç filomuzla konforlu ve güvenli yolculuğun tadını çıkarın.</p>
    
    <div class="search-box">
        <div class="form-group">
            <label>Alış Yeri</label>
            <select>
                <option>İstanbul Havalimanı</option>
                <option>Sabiha Gökçen Havalimanı</option>
                <option>Şehir Merkezi</option>
            </select>
        </div>
        <div class="form-group">
            <label>Alış Tarihi</label>
            <input type="date">
        </div>
        <div class="form-group">
            <label>Dönüş Tarihi</label>
            <input type="date">
        </div>
        <div class="form-group" style="justify-content: flex-end;">
            <button class="btn btn-primary" style="width: 100%;">Araç Bul</button>
        </div>
    </div>
</section>

<section id="fleet" class="fleet">
    <div class="section-title">
        <h2>Öne Çıkan <span>Araçlarımız</span></h2>
        <p>Her ihtiyaca uygun lüks ve konforlu araç seçenekleri</p>
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
                    <span class="price"><?php echo number_format($car['price_per_day'], 0, ',', '.'); ?> ₺/gün</span>
                </div>
                <div class="car-specs">
                    <div class="spec-item"><i class="fas fa-calendar"></i> <?php echo $car['year']; ?></div>
                    <div class="spec-item"><i class="fas fa-gas-pump"></i> <?php echo $car['fuel_type']; ?></div>
                    <div class="spec-item"><i class="fas fa-cogs"></i> <?php echo $car['transmission']; ?></div>
                </div>
                <button class="btn btn-outline" style="width: 100%;">Hemen Kirala</button>
            </div>
        </div>
        <?php endforeach; ?>
    </div>
</section>

<section id="services" style="padding: 5rem 5%; background: var(--card-bg);">
    <div class="section-title">
        <h2>Neden <span>Biz?</span></h2>
    </div>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; text-align: center;">
        <div>
            <i class="fas fa-shield-alt" style="font-size: 3rem; color: var(--primary-color); margin-bottom: 1rem;"></i>
            <h3>Güvenli Kiralama</h3>
            <p style="color: var(--text-muted);">Tüm araçlarımız kaskolu ve düzenli bakımlıdır.</p>
        </div>
        <div>
            <i class="fas fa-clock" style="font-size: 3rem; color: var(--primary-color); margin-bottom: 1rem;"></i>
            <h3>7/24 Destek</h3>
            <p style="color: var(--text-muted);">Yol yardım ve müşteri hizmetleri desteği.</p>
        </div>
        <div>
            <i class="fas fa-tag" style="font-size: 3rem; color: var(--primary-color); margin-bottom: 1rem;"></i>
            <h3>En İyi Fiyat</h3>
            <p style="color: var(--text-muted);">Gizli ücret yok, şeffaf fiyatlandırma.</p>
        </div>
    </div>
</section>

<?php include 'includes/footer.php'; ?>
