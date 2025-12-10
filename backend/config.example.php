<?php
// COPY THIS to backend/config.php and fill real values locally.
// This file is safe to commit (no real credentials).

$host = "sql100.infinityfree.com";
$user = "if0_40629719";
$pass = "YOUR_DB_PASSWORD_HERE";
$db   = "if0_40629719_grocery_store";

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    die("Database connection failed: " . $conn->connect_error);
}
?>
