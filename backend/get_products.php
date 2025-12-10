<?php
header("Content-Type: application/json");

require "config.php";

$sql = "SELECT id, name, price, category, image_url FROM products";
$result = $conn->query($sql);

$products = [];

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $row['price'] = (float)$row['price']; // convert to number
        $products[] = $row;
    }
}

echo json_encode($products);

$conn->close();
?>
