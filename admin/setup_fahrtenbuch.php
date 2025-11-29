<?php
require_once '../includes/db.php';

try {
    $sql = "CREATE TABLE IF NOT EXISTS fahrtenbuch (
        id INT AUTO_INCREMENT PRIMARY KEY,
        car_id INT NOT NULL,
        driver_name VARCHAR(100) NOT NULL,
        trip_date DATE NOT NULL,
        start_time TIME,
        end_time TIME,
        start_km INT NOT NULL,
        end_km INT NOT NULL,
        start_location VARCHAR(255) NOT NULL,
        end_location VARCHAR(255) NOT NULL,
        purpose TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
    )";

    $pdo->exec($sql);
    echo "Table 'fahrtenbuch' created successfully.";

} catch (PDOException $e) {
    echo "Error creating table: " . $e->getMessage();
}
?>
