<?php
// TEMP debug — remove after fixing
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// rest of file follows...
?>

<?php
session_start();

if (!isset($_SESSION["admin_logged_in"]) || $_SESSION["admin_logged_in"] !== true) {
    header("Location: admin_login.php");
    exit;
}

require "backend/config.php";


// Fetch all products
$result = $conn->query("SELECT * FROM products ORDER BY id DESC");
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Admin - Products</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen p-6">
  <div class="flex justify-between items-center mb-4">
  <h1 class="text-3xl font-bold">Admin - Products</h1>
  <a href="logout.php" class="text-sm text-red-600 hover:underline">Logout</a>
</div>


  <!-- Add Product Form -->
  <div class="bg-white shadow rounded p-4 mb-6 max-w-xl">
    <h2 class="text-xl font-semibold mb-3">Add New Product</h2>
    <form action="backend/add_product.php" method="POST" class="space-y-3">
      <input type="text" name="name" placeholder="Product Name" class="w-full border p-2 rounded" required />
      <input type="number" step="0.01" name="price" placeholder="Price" class="w-full border p-2 rounded" required />
      <input type="text" name="category" placeholder="Category (e.g. Vegetables)" class="w-full border p-2 rounded" />
      <input type="text" name="image_url" placeholder="Image URL (optional)" class="w-full border p-2 rounded" />
      <button type="submit" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
        Add Product
      </button>
    </form>
  </div>

  <!-- Products Table -->
  <div class="bg-white shadow rounded p-4">
    <h2 class="text-xl font-semibold mb-3">All Products</h2>
    <table class="min-w-full text-sm">
      <thead>
        <tr class="bg-gray-200 text-left">
          <th class="px-3 py-2">ID</th>
          <th class="px-3 py-2">Name</th>
          <th class="px-3 py-2">Price</th>
          <th class="px-3 py-2">Category</th>
          <th class="px-3 py-2">Image URL</th>
          <th class="px-3 py-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        <?php if ($result && $result->num_rows > 0): ?>
          <?php while ($row = $result->fetch_assoc()): ?>
            <tr class="border-t">
              <form action="backend/update_product.php" method="POST">
                <td class="px-3 py-2">
                  <?php echo $row["id"]; ?>
                  <input type="hidden" name="id" value="<?php echo $row["id"]; ?>">
                </td>
                <td class="px-3 py-2">
                  <input type="text" name="name" value="<?php echo htmlspecialchars($row["name"]); ?>"
                         class="border p-1 rounded w-full">
                </td>
                <td class="px-3 py-2">
                  <input type="number" step="0.01" name="price" value="<?php echo $row["price"]; ?>"
                         class="border p-1 rounded w-24">
                </td>
                <td class="px-3 py-2">
                  <input type="text" name="category"
       value="<?php echo htmlspecialchars($row['category'] ?? '', ENT_QUOTES, 'UTF-8'); ?>"
       class="border p-1 rounded w-32">

                </td>
                <td class="px-3 py-2">
                 <input type="text" name="image_url"
       value="<?php echo htmlspecialchars($row['image_url'] ?? '', ENT_QUOTES, 'UTF-8'); ?>"
       class="border p-1 rounded w-full">

                </td>
                <td class="px-3 py-2 flex gap-2">
                  <button type="submit"
                          class="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700">
                    Save
                  </button>
              </form>
              <form action="backend/delete_product.php" method="POST"
                    onsubmit="return confirm('Delete this product?');">
                <input type="hidden" name="id" value="<?php echo $row["id"]; ?>">
                <button type="submit"
                        class="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700">
                  Delete
                </button>
              </form>
                </td>
            </tr>
          <?php endwhile; ?>
        <?php else: ?>
          <tr>
            <td colspan="6" class="px-3 py-2 text-center text-gray-500">No products found.</td>
          </tr>
        <?php endif; ?>
      </tbody>
    </table>
  </div>
</body>
</html>
<?php
$conn->close();
?>
