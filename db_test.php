<?php
$host = '127.0.0.1'; // Try IP instead of localhost
$dbname = 'd0457ad0';
$username = 'd0457ad0';
$password = '01528797Mb##';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    echo "Connection successful!";
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}
?>
