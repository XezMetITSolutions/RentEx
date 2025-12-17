<!DOCTYPE html>
<html>
<head>
    <title>Database Migration - Rentex</title>
    <style>
        body { font-family: sans-serif; padding: 50px; background: #f8fafc; color: #1e293b; }
        .log { background: #fff; border: 1px solid #e2e8f0; padding: 20px; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
        .success { color: green; font-weight: bold; }
        .error { color: red; font-weight: bold; }
        .info { color: #64748b; margin-bottom: 5px; }
    </style>
</head>
<body>
    <h1>Database Migration: Car Expansion</h1>
    <div class="log">
<?php
require_once __DIR__ . '/../includes/db.php';

try {
    $columns_to_add = [
        'license_plate' => "VARCHAR(20) AFTER model",
        'category' => "VARCHAR(50) AFTER license_plate",
        'engine_power' => "VARCHAR(50) AFTER year",
        'displacement' => "VARCHAR(50) AFTER engine_power",
        'drive_type' => "VARCHAR(50) AFTER displacement",
        'seats' => "INT DEFAULT 5 AFTER transmission",
        'doors' => "INT DEFAULT 5 AFTER seats",
        'fuel_consumption' => "VARCHAR(50) AFTER doors",
        'min_age' => "INT DEFAULT 18",
        'deposit' => "DECIMAL(10,2) DEFAULT 500.00",
        'description' => "TEXT",
        'features' => "TEXT", // Comma-separated or JSON
        'location' => "VARCHAR(100) DEFAULT 'Feldkirch'",
        'vin' => "VARCHAR(50)"
    ];

    $existing_columns = $pdo->query("SHOW COLUMNS FROM cars")->fetchAll(PDO::FETCH_COLUMN);

    foreach ($columns_to_add as $column => $definition) {
        if (!in_array($column, $existing_columns)) {
            $pdo->exec("ALTER TABLE cars ADD COLUMN $column $definition");
            echo "<div class='info'>Added column: <b>$column</b></div>";
        } else {
            echo "<div class='info'>Column already exists: $column</div>";
        }
    }

    echo "<p class='success'>Migration completed successfully!</p>";
} catch (PDOException $e) {
    echo "<p class='error'>Error: " . $e->getMessage() . "</p>";
}
?>
    <a href="car_form.php" style="display:inline-block; margin-top:20px; color: #E31E24; text-decoration: none; font-weight: bold;">&larr; Zurück zum Formular</a>
    </div>
</body>
</html>
