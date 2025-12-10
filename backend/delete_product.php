<?php
require "config.php";

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $id = $_POST["id"] ?? "";

    if ($id !== "") {
        $stmt = $conn->prepare("DELETE FROM products WHERE id = ?");
        $stmt->bind_param("i", $id);
        if ($stmt->execute()) {
            header("Location: ../admin_products.php");
            exit;
        } else {
            echo "Error deleting product: " . $conn->error;
        }
        $stmt->close();
    } else {
        echo "Product ID is required.";
    }
}

$conn->close();
?>
