<!DOCTYPE html>
<html>
<head>
    <title>Advanced Migration - Rentex</title>
    <style>
        body { font-family: sans-serif; padding: 50px; background: #f8fafc; color: #1e293b; }
        .log { background: #fff; border: 1px solid #e2e8f0; padding: 20px; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
        .success { color: green; font-weight: bold; }
        .info { color: #64748b; margin-bottom: 5px; }
    </style>
</head>
<body>
    <h1>Database Migration: Maintenance & Pricing</h1>
    <div class="log">
<?php
require_once __DIR__ . '/../includes/db.php';

try {
    $columns_to_add = [
        'vignette_until'    => "DATE AFTER vin",
        'last_oil_service'  => "DATE",
        'last_tire_service' => "DATE",
        'tire_type'         => "VARCHAR(50)",
        'internal_notes'    => "TEXT",
        'longterm_price'    => "DECIMAL(10,2)",
        'longterm_threshold'=> "INT DEFAULT 7",
        'promo_price'       => "DECIMAL(10,2)",
        'promo_start'       => "DATE",
        'promo_end'         => "DATE"
    ];

    $existing_columns = $pdo->query("SHOW COLUMNS FROM cars")->fetchAll(PDO::FETCH_COLUMN);

    foreach ($columns_to_add as $column => $definition) {
        if (!in_array($column, $existing_columns)) {
            $pdo->exec("ALTER TABLE cars ADD COLUMN $column $definition");
            echo "<div class='info'>Added: <b>$column</b></div>";
        } else {
            echo "<div class='info'>Exists: $column</div>";
        }
    }

    echo "<p class='success'>Advanced Migration completed successfully!</p>";
} catch (PDOException $e) {
    echo "<p class='error'>Error: " . $e->getMessage() . "</p>";
}
?>
    <a href="car_form.php" style="display:inline-block; margin-top:20px; color: #E31E24; text-decoration: none; font-weight: bold;">&larr; Zurück zum Formular</a>
    </div>
</body>
</html>
