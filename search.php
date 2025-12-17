<?php
require_once 'includes/db.php';
include 'includes/header.php';

// Arama Mantığı (Örnek)
$cars = [];
// Gerçek bir uygulamada $_GET'den gelen filtreler burada SQL sorgusuna uygulanır
$cars = [
    ['id' => 1, 'brand' => 'Mercedes-Benz', 'model' => 'S-Class', 'year' => 2024, 'price_per_day' => 5000, 'fuel_type' => 'Dizel', 'transmission' => 'Otomatik', 'image_url' => 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'],
    ['id' => 2, 'brand' => 'BMW', 'model' => 'M4 Competition', 'year' => 2023, 'price_per_day' => 4500, 'fuel_type' => 'Benzin', 'transmission' => 'Otomatik', 'image_url' => 'https://images.unsplash.com/photo-1617788138017-80ad40651399?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'],
];
?>

<style>
.page-header {
    padding: 100px 0 60px;
    background: #0a0a0a;
    color: #fff;
    text-align: center;
}

.search-results-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 30px;
    padding: 80px 0;
}

.car-card-modern {
    background: #fff;
    border-radius: 25px;
    overflow: hidden;
    box-shadow: 0 15px 40px rgba(0,0,0,0.05);
    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
    height: 100%;
}

.car-card-modern:hover {
    transform: translateY(-15px);
    box-shadow: 0 30px 60px rgba(0,0,0,0.1);
}

.car-image-container {
    height: 250px;
    overflow: hidden;
}

.car-image-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.car-info {
    padding: 30px;
}

.car-name {
    font-size: 1.8rem;
    font-weight: 800;
    margin-bottom: 20px;
    color: #000;
}

.price-tag {
    font-size: 1.5rem;
    font-weight: 900;
}
</style>

<div class="page-header">
    <div class="container">
        <h1 style="font-size: 3.5rem; font-weight: 900;">Arama <span style="color: #E31E24;">Sonuçları</span></h1>
        <p style="color: rgba(255,255,255,0.6);">Seçtiğiniz tarihler için uygun araçlar listeleniyor.</p>
    </div>
</div>

<div class="container">
    <?php if (empty($cars)): ?>
        <div style="text-align: center; padding: 100px 0;">
            <i class="fas fa-search" style="font-size: 4rem; color: #eee; margin-bottom: 20px;"></i>
            <h3>Üzgünüz, kriterlerinize uygun araç bulunamadı.</h3>
            <p style="color: #666;">Lütfen farklı tarihler veya filtreler deneyin.</p>
            <a href="index.php" class="btn btn-primary" style="margin-top: 20px;">ANA SAYFAYA DÖN</a>
        </div>
    <?php else: ?>
        <div class="search-results-grid">
            <?php foreach ($cars as $car): ?>
            <div class="car-card-modern">
                <div class="car-image-container">
                    <img src="<?php echo $car['image_url']; ?>" alt="<?php echo $car['brand'] . ' ' . $car['model']; ?>">
                </div>
                <div class="car-info">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                        <span style="color: #E31E24; font-weight: 700; text-transform: uppercase;"><?php echo $car['brand']; ?></span>
                        <span style="background: #f1f1f1; padding: 4px 12px; border-radius: 50px; font-size: 0.8rem;"><?php echo $car['year']; ?></span>
                    </div>
                    <h3 class="car-name"><?php echo $car['model']; ?></h3>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; padding-top: 20px; border-top: 1px solid #eee; margin-bottom: 25px;">
                        <div style="display: flex; align-items: center; gap: 10px; color: #666;"><i class="fas fa-gas-pump" style="color: #E31E24;"></i> <?php echo $car['fuel_type']; ?></div>
                        <div style="display: flex; align-items: center; gap: 10px; color: #666;"><i class="fas fa-cog" style="color: #E31E24;"></i> <?php echo $car['transmission']; ?></div>
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div class="price-tag"><?php echo number_format($car['price_per_day'], 0, ',', '.'); ?> TL <span style="font-size: 0.9rem; color: #999;">/gün</span></div>
                        <a href="rent.php?id=<?php echo $car['id']; ?>" class="btn btn-primary" style="border-radius: 12px; padding: 10px 20px;">ŞİMDİ KİRALA</a>
                    </div>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>
</div>

<?php include 'includes/footer.php'; ?>
