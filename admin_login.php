<?php
session_start();

// If already logged in, go directly to admin
if (isset($_SESSION["admin_logged_in"]) && $_SESSION["admin_logged_in"] === true) {
    header("Location: admin_products.php");
    exit;
}

$error = "";

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // 🔐 Hardcoded admin credentials
    $USERNAME = "admin";
    $PASSWORD = "admin123"; // change this to whatever you like

    $user = $_POST["username"] ?? "";
    $pass = $_POST["password"] ?? "";

    if ($user === $USERNAME && $pass === $PASSWORD) {
        $_SESSION["admin_logged_in"] = true;
        header("Location: admin_products.php");
        exit;
    } else {
        $error = "Invalid username or password";
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Admin Login</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen flex items-center justify-center">
  <div class="bg-white shadow-lg rounded-lg p-6 w-full max-w-sm">
    <h1 class="text-2xl font-bold mb-4 text-center">Admin Login</h1>

    <?php if ($error): ?>
      <p class="mb-3 text-red-600 text-sm text-center">
        <?php echo htmlspecialchars($error, ENT_QUOTES, 'UTF-8'); ?>
      </p>
    <?php endif; ?>

    <form method="POST" class="space-y-3">
      <input type="text" name="username" placeholder="Username"
             class="w-full border p-2 rounded" required>
      <input type="password" name="password" placeholder="Password"
             class="w-full border p-2 rounded" required>
      <button type="submit"
              class="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 font-semibold">
        Login
      </button>
    </form>
  </div>
</body>
</html>
