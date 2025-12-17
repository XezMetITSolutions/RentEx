<?php
require_once 'includes/db.php';
include 'includes/header.php';

// Fahrzeuge holen
$cars = [];
try {
    $stmt = $pdo->query("SELECT * FROM cars WHERE status = 'available'");
    $cars = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) {
    // Fallback
}

if (empty($cars)) {
    $cars = [
        ['id' => 1, 'brand' => 'Mercedes-Benz', 'model' => 'S-Class', 'year' => 2024, 'price_per_day' => 250, 'fuel_type' => 'Diesel', 'transmission' => 'Automatik', 'image_url' => 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'],
        ['id' => 2, 'brand' => 'BMW', 'model' => 'M4 Competition', 'year' => 2023, 'price_per_day' => 180, 'fuel_type' => 'Benzin', 'transmission' => 'Automatik', 'image_url' => 'https://images.unsplash.com/photo-1617788138017-80ad40651399?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'],
        ['id' => 3, 'brand' => 'Audi', 'model' => 'RS7', 'year' => 2024, 'price_per_day' => 220, 'fuel_type' => 'Benzin', 'transmission' => 'Automatik', 'image_url' => 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'],
        ['id' => 4, 'brand' => 'Porsche', 'model' => '911 Carrera', 'year' => 2023, 'price_per_day' => 300, 'fuel_type' => 'Benzin', 'transmission' => 'PDK', 'image_url' => 'https://images.unsplash.com/photo-1503376763036-066120622c74?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'],
        ['id' => 5, 'brand' => 'Range Rover', 'model' => 'Autobiography', 'year' => 2024, 'price_per_day' => 280, 'fuel_type' => 'Hybrid', 'transmission' => 'Automatik', 'image_url' => 'https://images.unsplash.com/photo-1605218457224-6aa16dc5517a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80']
    ];
}
?>

<style>
.page-header {
    padding: 100px 0 60px;
    background: #000;
    color: #fff;
    text-align: center;
}

.fleet-grid {
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
    margin-bottom: 15px;
}

.brand-badge {
    color: #E31E24;
    font-weight: 700;
    text-transform: uppercase;
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
}
</style>

<div class="page-header">
    <div class="container">
        <h1 style="font-size: 3.5rem; font-weight: 900;">Unsere <span style="color: #E31E24;">Fahrzeugflotte</span></h1>
        <p style="color: rgba(255,255,255,0.6);">Entdecken Sie unsere Auswahl an Premium-Fahrzeugen für jeden Bedarf.</p>
    </div>
</div>

<div class="container">
    <div class="fleet-grid">
        <?php foreach ($cars as $car): ?>
        <div class="car-card-modern">
            <div class="car-image-container">
                <img src="<?php echo $car['image_url']; ?>" alt="<?php echo $car['brand'] . ' ' . $car['model']; ?>">
            </div>
            <div class="car-info">
                <div class="car-meta">
                    <span class="brand-badge"><?php echo $car['brand']; ?></span>
                    <span style="background: #f1f1f1; padding: 4px 12px; border-radius: 50px; font-size: 0.8rem;"><?php echo $car['year']; ?></span>
                </div>
                <h3 class="car-name"><?php echo $car['model']; ?></h3>
                
                <div class="specs-grid">
                    <div class="spec-item"><i class="fas fa-gas-pump"></i> <?php echo $car['fuel_type']; ?></div>
                    <div class="spec-item"><i class="fas fa-cog"></i> <?php echo $car['transmission']; ?></div>
                </div>

                <div class="price-container">
                    <div class="price-tag">€ <?php echo number_format($car['price_per_day'], 0, ',', '.'); ?> <span style="font-size: 0.9rem; color: #999;">/Tag</span></div>
                    <a href="rent.php?id=<?php echo $car['id']; ?>" class="btn btn-primary" style="border-radius: 12px; padding: 10px 20px;">MIETEN</a>
                </div>
            </div>
        </div>
        <?php endforeach; ?>
    </div>
</div>

<?php include 'includes/footer.php'; ?>
