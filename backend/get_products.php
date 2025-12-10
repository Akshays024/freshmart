<?php
// === DO NOT ADD ANYTHING ABOVE THIS LINE ===
// CORS HEADERS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

// Preflight response
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require __DIR__ . "/config.php";

// Fetch products
$sql = "SELECT id, name, price, category, image_url FROM products";
$res = $conn->query($sql);

$products = [];
while ($row = $res->fetch_assoc()) {
    $products[] = $row;
}

echo json_encode([
    "success" => true,
    "products" => $products
]);
?>