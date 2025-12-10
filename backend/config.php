<?php
$host = "sql100.infinityfree.com";        // from InfinityFree panel
$user = "if0_40629719";                   // your MySQL username
$pass = "JGyaoAvFnZuK";        // paste the password exactly
$db   = "if0_40629719_grocery_store2";    // your DB name

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    die("Database connection failed: " . $conn->connect_error);
}
?>

