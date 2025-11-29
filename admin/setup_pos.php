<?php
require_once '../includes/db.php';

try {
    $sql = "CREATE TABLE IF NOT EXISTS cash_register (
        id INT AUTO_INCREMENT PRIMARY KEY,
        receipt_number VARCHAR(50) NOT NULL UNIQUE,
        transaction_type ENUM('income', 'expense') NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        tax_rate INT DEFAULT 20,
        category VARCHAR(100) NOT NULL,
        description TEXT,
        payment_method ENUM('cash', 'card', 'transfer') DEFAULT 'cash',
        booking_id INT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by VARCHAR(100) DEFAULT 'Admin'
    )";

    $pdo->exec($sql);
    echo "Table 'cash_register' created successfully.";

} catch (PDOException $e) {
    echo "Error creating table: " . $e->getMessage();
}
?>
