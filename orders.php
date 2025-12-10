
<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-type, Authorization,X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
if($_SERVER["REQUEST_METHOD"]==="OPTIONS"){
    http_response_code(200);
    exit;
}
session_start();

if (!isset($_SESSION["admin_logged_in"]) || $_SESSION["admin_logged_in"] !== true) {
    header("Location: admin_login.php");
    exit;
}

require "backend/config.php";

$result = $conn->query("SELECT * FROM orders ORDER BY created_at DESC");
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Orders - Admin</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen p-6">
  <div class="flex justify-between items-center mb-4">
  <h1 class="text-3xl font-bold">Orders</h1>
  <a href="logout.php" class="text-sm text-red-600 hover:underline">Logout</a>
</div>


  <table class="min-w-full bg-white shadow rounded">
    <thead>
      <tr class="bg-gray-200">
        <th class="px-4 py-2 text-left">ID</th>
        <th class="px-4 py-2 text-left">Customer</th>
        <th class="px-4 py-2 text-left">Mobile</th>
        <th class="px-4 py-2 text-left">Total</th>
        <th class="px-4 py-2 text-left">Date</th>
      </tr>
    </thead>
    <tbody>
      <?php if ($result && $result->num_rows > 0): ?>
        <?php while ($row = $result->fetch_assoc()): ?>
          <tr class="border-t">
            <td class="px-4 py-2"><?php echo $row["id"]; ?></td>
            <td class="px-4 py-2"><?php echo htmlspecialchars($row["customer_name"]); ?></td>
            <td class="px-4 py-2"><?php echo htmlspecialchars($row["mobile"]); ?></td>
            <td class="px-4 py-2">₹ <?php echo $row["total_amount"]; ?></td>
            <td class="px-4 py-2"><?php echo $row["created_at"]; ?></td>
          </tr>
        <?php endwhile; ?>
      <?php else: ?>
        <tr>
          <td colspan="5" class="px-4 py-2 text-center text-gray-500">
            No orders yet.
          </td>
        </tr>
      <?php endif; ?>
    </tbody>
  </table>
</body>
</html>
<?php
$conn->close();
?>
