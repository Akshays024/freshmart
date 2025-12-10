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
