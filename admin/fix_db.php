<?php
$db_path = __DIR__ . '/../includes/db.php';
if (!file_exists($db_path)) {
    die("Error: db.php not found at $db_path");
}
require_once $db_path;

try {
    // 1. Add new columns if they don't exist
    $columns = $pdo->query("SHOW COLUMNS FROM cars")->fetchAll(PDO::FETCH_COLUMN);
    
    if (!in_array('license_plate', $columns)) {
        $pdo->exec("ALTER TABLE cars ADD COLUMN license_plate VARCHAR(20) AFTER model");
        echo "Added license_plate column.\n";
    }
    
    if (!in_array('category', $columns)) {
        $pdo->exec("ALTER TABLE cars ADD COLUMN category VARCHAR(50) AFTER license_plate");
        echo "Added category column.\n";
    }

    // 2. Insert/Update Data from Image
    $cars_data = [
        [
            'brand' => 'VW', 'model' => 'Polo', 'license_plate' => 'FK-EX 1385', 
            'category' => 'Kleinwagen', 'price' => 119, 'status' => 'available',
            'image_url' => 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=100&q=80'
        ],
        [
            'brand' => 'VW', 'model' => 'Golf Kombi', 'license_plate' => 'FK-EX 2468', 
            'category' => 'Kombi', 'price' => 144, 'status' => 'rented',
            'image_url' => 'https://images.unsplash.com/photo-1503376763036-066120622c74?auto=format&fit=crop&w=100&q=80'
        ],
        [
            'brand' => 'Hyundai', 'model' => 'Ioniq Elektro', 'license_plate' => 'FK-EX 3579', 
            'category' => 'Elektro', 'price' => 150, 'status' => 'available',
            'image_url' => 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=100&q=80'
        ],
        [
            'brand' => 'Fiat', 'model' => 'Ducato L3H2', 'license_plate' => 'FK-EX 4680', 
            'category' => 'Transporter', 'price' => 210, 'status' => 'available',
            'image_url' => 'https://images.unsplash.com/photo-1616455579100-2ceaa4eb2d37?auto=format&fit=crop&w=100&q=80'
        ],
        [
            'brand' => 'Fiat', 'model' => 'Ducato L4H2', 'license_plate' => 'FK-EX 5791', 
            'category' => 'Transporter', 'price' => 210, 'status' => 'maintenance',
            'image_url' => 'https://images.unsplash.com/photo-1616455579100-2ceaa4eb2d37?auto=format&fit=crop&w=100&q=80'
        ],
        [
            'brand' => 'Fiat', 'model' => 'Ducato L3H2 Plus', 'license_plate' => 'FK-EX 6802', 
            'category' => 'Transporter', 'price' => 220, 'status' => 'available',
            'image_url' => 'https://images.unsplash.com/photo-1616455579100-2ceaa4eb2d37?auto=format&fit=crop&w=100&q=80'
        ],
        [
            'brand' => 'Skoda', 'model' => 'Superb Kombi', 'license_plate' => 'FK-EX 7913', 
            'category' => 'Kombi', 'price' => 225, 'status' => 'available',
            'image_url' => 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=100&q=80'
        ],
        [
            'brand' => 'Ford', 'model' => 'Mustang Mach-E GT', 'license_plate' => 'FK-EX 8024', 
            'category' => 'SUV', 'price' => 249, 'status' => 'rented',
            'image_url' => 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=100&q=80'
        ],
        [
            'brand' => 'Peugeot', 'model' => 'Traveller Automatic', 'license_plate' => 'FK-EX 9135', 
            'category' => 'Van', 'price' => 270, 'status' => 'available',
            'image_url' => 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=100&q=80'
        ],
        [
            'brand' => 'Ford', 'model' => 'Transit Custom', 'license_plate' => 'FK-EX 0246', 
            'category' => 'Transporter', 'price' => 313, 'status' => 'available',
            'image_url' => 'https://images.unsplash.com/photo-1616455579100-2ceaa4eb2d37?auto=format&fit=crop&w=100&q=80'
        ]
    ];

    $stmt = $pdo->prepare("INSERT INTO cars (brand, model, license_plate, category, price_per_day, status, image_url, year, fuel_type, transmission) VALUES (?, ?, ?, ?, ?, ?, ?, 2024, 'Diesel', 'Automatik') ON DUPLICATE KEY UPDATE category=?, price_per_day=?, status=?, image_url=?");
    
    foreach ($cars_data as $car) {
        $check = $pdo->prepare("SELECT id FROM cars WHERE license_plate = ?");
        $check->execute([$car['license_plate']]);
        if ($check->rowCount() > 0) {
            $update = $pdo->prepare("UPDATE cars SET category=?, price_per_day=?, status=?, image_url=? WHERE license_plate=?");
            $update->execute([$car['category'], $car['price'], $car['status'], $car['image_url'], $car['license_plate']]);
            echo "Updated {$car['brand']} {$car['model']}\n";
        } else {
            $insert = $pdo->prepare("INSERT INTO cars (brand, model, license_plate, category, price_per_day, status, image_url, year, fuel_type, transmission) VALUES (?, ?, ?, ?, ?, ?, ?, 2024, 'Diesel', 'Automatik')");
            $insert->execute([$car['brand'], $car['model'], $car['license_plate'], $car['category'], $car['price'], $car['status'], $car['image_url']]);
            echo "Inserted {$car['brand']} {$car['model']}\n";
        }
    }

    echo "Migration completed successfully.\n";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
