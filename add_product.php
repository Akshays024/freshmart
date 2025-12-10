<?php
require "config.php";

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $name     = $_POST["name"] ?? "";
    $price    = $_POST["price"] ?? "";
    $category = $_POST["category"] ?? null;
    $imageUrl = $_POST["image_url"] ?? null;

    if ($name !== "" && $price !== "") {
        $stmt = $conn->prepare("INSERT INTO products (name, price, category, image_url) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("sdss", $name, $price, $category, $imageUrl);
        if ($stmt->execute()) {
            header("Location: ../admin_products.php");
            exit;
        } else {
            echo "Error adding product: " . $conn->error;
        }
        $stmt->close();
    } else {
        echo "Name and price are required.";
    }
}

$conn->close();
?>
