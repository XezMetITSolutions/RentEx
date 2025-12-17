<?php
require_once 'includes/db.php';
include 'includes/header.php';

$car_id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$car = null;

// Fetch car details
if ($car_id > 0) {
    try {
        $stmt = $pdo->prepare("SELECT * FROM cars WHERE id = ?");
        $stmt->execute([$car_id]);
        $car = $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        // Handle error silently or log
    }
}

// Dummy data fallback
if (!$car) {
    // Determine dummy car based on ID to simulate variety or default to S-Class
    if ($car_id == 2) {
        $car = [
            'id' => 2,
            'brand' => 'BMW', 'model' => 'M4 Competition', 'year' => 2023, 
            'price_per_day' => 4500, 'fuel_type' => 'Benzin', 'transmission' => 'Otomatik',
            'image_url' => 'https://images.unsplash.com/photo-1617788138017-80ad40651399?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
        ];
    } else {
        $car = [
            'id' => 1,
            'brand' => 'Mercedes-Benz', 'model' => 'S-Class', 'year' => 2024, 
            'price_per_day' => 5000, 'fuel_type' => 'Dizel', 'transmission' => 'Otomatik',
            'image_url' => 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
        ];
    }
}
?>

<div class="rent-page-container" style="padding: 8rem 5%; min-height: 80vh;">
    <div class="glass" style="max-width: 1200px; margin: 0 auto; padding: 3rem; border-radius: 20px; display: flex; flex-wrap: wrap; gap: 4rem;">
        
        <!-- Car Details Side -->
        <div style="flex: 1; min-width: 300px;">
            <div style="height: 300px; border-radius: 15px; overflow: hidden; margin-bottom: 2rem; border: 1px solid var(--glass-border);">
                <img src="<?php echo $car['image_url']; ?>" alt="<?php echo $car['brand']; ?>" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            
            <h1 style="font-family: var(--font-heading); font-size: 2.5rem; margin-bottom: 0.5rem; text-transform: uppercase;">
                <?php echo $car['brand']; ?> <span style="color: var(--primary-color);"><?php echo $car['model']; ?></span>
            </h1>
            
            <p style="font-size: 1.5rem; font-weight: 700; color: var(--primary-color); margin-bottom: 2rem;">
                <?php echo number_format($car['price_per_day'], 0, ',', '.'); ?> ₺ <span style="font-size: 1rem; color: var(--text-muted); font-weight: 400;">/ Tag</span>
            </p>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem;">
                <div class="spec-item" style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 10px; align-items: flex-start;">
                    <i class="fas fa-calendar"></i>
                    <span style="color: var(--text-muted); font-size: 0.9rem;">Jahr</span>
                    <strong><?php echo $car['year']; ?></strong>
                </div>
                <div class="spec-item" style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 10px; align-items: flex-start;">
                    <i class="fas fa-gas-pump"></i>
                    <span style="color: var(--text-muted); font-size: 0.9rem;">Kraftstoff</span>
                    <strong><?php echo $car['fuel_type']; ?></strong>
                </div>
                <div class="spec-item" style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 10px; align-items: flex-start;">
                    <i class="fas fa-cogs"></i>
                    <span style="color: var(--text-muted); font-size: 0.9rem;">Getriebe</span>
                    <strong><?php echo $car['transmission']; ?></strong>
                </div>
            </div>
        </div>

        <!-- Booking Form Side -->
        <div style="flex: 1; min-width: 300px; background: rgba(0,0,0,0.3); padding: 2.5rem; border-radius: 15px; border: 1px solid var(--glass-border);">
            <h2 style="font-family: var(--font-heading); margin-bottom: 2rem; font-size: 1.8rem;">
                Jetzt <span style="color: var(--primary-color);">Reservieren</span>
            </h2>

            <form action="process_booking.php" method="POST">
                <input type="hidden" name="car_id" value="<?php echo $car['id']; ?>">
                
                <div class="form-group" style="margin-bottom: 1.5rem;">
                    <label>Vollständiger Name</label>
                    <input type="text" name="fullname" required placeholder="Ihr Name">
                </div>

                <div class="form-group" style="margin-bottom: 1.5rem;">
                    <label>Telefonnummer</label>
                    <input type="tel" name="phone" required placeholder="+49 ...">
                </div>

                <div class="form-group" style="margin-bottom: 1.5rem;">
                    <label>E-Mail Adresse</label>
                    <input type="email" name="email" required placeholder="example@email.com">
                </div>

                <div style="display: flex; gap: 1rem; margin-bottom: 2rem;">
                    <div class="form-group">
                        <label>Abholdatum</label>
                        <input type="date" name="start_date" required>
                    </div>
                    <div class="form-group">
                        <label>Rückgabedatum</label>
                        <input type="date" name="end_date" required>
                    </div>
                </div>

                <button type="submit" class="btn btn-primary" style="width: 100%; padding: 1.2rem;">
                    Reservierung Bestätigen <i class="fas fa-arrow-right"></i>
                </button>
            </form>
        </div>

    </div>
</div>

<?php include 'includes/footer.php'; ?>
