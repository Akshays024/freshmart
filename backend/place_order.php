<?php
header("Content-Type: application/json");

require "config.php";

$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

if (!$data) {
    echo json_encode(["success" => false, "message" => "Invalid JSON"]);
    exit;
}

$name    = $data["name"]    ?? "";
$mobile  = $data["mobile"]  ?? "";
$address = $data["address"] ?? "";
$cart    = $data["cart"]    ?? [];

if ($name === "" || $mobile === "" || $address === "" || !is_array($cart) || count($cart) === 0) {
    echo json_encode(["success" => false, "message" => "Missing fields or empty cart"]);
    exit;
}

$total = 0;
foreach ($cart as $item) {
    $total += $item["price"] * $item["qty"];
}

// Insert into orders table
$stmt = $conn->prepare("INSERT INTO orders (customer_name, mobile, address, total_amount) VALUES (?, ?, ?, ?)");
$stmt->bind_param("sssd", $name, $mobile, $address, $total);

if (!$stmt->execute()) {
    echo json_encode(["success" => false, "message" => "Order insert failed"]);
    exit;
}

$orderId = $stmt->insert_id;
$stmt->close();

// Insert order items
$itemStmt = $conn->prepare(
    "INSERT INTO order_items (order_id, product_id, product_name, price, quantity, line_total)
     VALUES (?, ?, ?, ?, ?, ?)"
);

foreach ($cart as $item) {
    $pid       = $item["id"];
    $pname     = $item["name"];
    $price     = $item["price"];
    $qty       = $item["qty"];
    $lineTotal = $price * $qty;

    $itemStmt->bind_param("iisdis", $orderId, $pid, $pname, $price, $qty, $lineTotal);
    $itemStmt->execute();
}

$itemStmt->close();
$conn->close();

echo json_encode(["success" => true, "order_id" => $orderId]);
?>
