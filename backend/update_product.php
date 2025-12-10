<?php
require "config.php";

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $id       = $_POST["id"] ?? "";
    $name     = $_POST["name"] ?? "";
    $price    = $_POST["price"] ?? "";
    $category = $_POST["category"] ?? null;
    $imageUrl = $_POST["image_url"] ?? null;

    if ($id !== "" && $name !== "" && $price !== "") {
        $stmt = $conn->prepare(
            "UPDATE products SET name = ?, price = ?, category = ?, image_url = ? WHERE id = ?"
        );
        $stmt->bind_param("sdssi", $name, $price, $category, $imageUrl, $id);
        if ($stmt->execute()) {
            header("Location: ../admin_products.php");
            exit;
        } else {
            echo "Error updating product: " . $conn->error;
        }
        $stmt->close();
    } else {
        echo "ID, name and price are required.";
    }
}

$conn->close();
?>
