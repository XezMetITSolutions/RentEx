<?php
$host = 'localhost';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $pdo->exec("CREATE DATABASE IF NOT EXISTS d0457ad0");
    $pdo->exec("USE d0457ad0");

    // Read schema.sql
    $schema = file_get_contents('../database/schema.sql');
    $pdo->exec($schema);
    
    echo "Database and tables created successfully.\n";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
