/* FINAL script.js - use this file on GitHub Pages
   IMPORTANT: set API_BASE to your live backend
*/
const API_BASE = "https://freshmart2.42web.io/backend/";

// ---------- UI toast ----------
function showToast(message, isError = false) {
  const toast = document.getElementById("toast");
  const msg = document.getElementById("toastMessage");
  if (!toast || !msg) {
    // fallback console
    if (isError) console.error(message);
    else console.log(message);
    return;
  }

  toast.classList.remove("error");
  if (isError) toast.classList.add("error");

  msg.textContent = message;
  toast.classList.add("show");

  setTimeout(() => toast.classList.remove("show"), 2500);
}

// ---------- CART helpers ----------
function getCart() {
  const cart = localStorage.getItem("cart");
  return cart ? JSON.parse(cart) : [];
}
function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// ---------- Global state ----------
let products = [];
let filteredProducts = [];
let currentSearchTerm = "";
let currentCategory = "";

// ---------- Load products from backend ----------
async function loadProducts() {
  try {
    const res = await fetch(API_BASE + "get_products.php");
    if (!res.ok) throw new Error("Network response not ok: " + res.status);

    const data = await res.json();
    products = data.products || [];
    applyFilters();
  } catch (err) {
    console.error("Error loading products:", err);
  }
}

// ---------- Filtering ----------
function applyFilters() {
  const term = currentSearchTerm.trim().toLowerCase();
  const cat = (currentCategory || "").trim().toLowerCase();

  filteredProducts = products.filter(p => {
    const nameOk = !term || (p.name && p.name.toLowerCase().includes(term));
    const catOk = !cat || (p.category && p.category.toLowerCase() === cat);
    return nameOk && catOk;
  });

  renderProducts();
}

// ---------- Render Products ----------
function renderProducts() {
  const container = document.getElementById("productsContainer");
  if (!container) return;
  container.innerHTML = "";

  const list = filteredProducts.length ? filteredProducts : [];

  if (!list || list.length === 0) {
    container.innerHTML = `<p class="text-gray-500">No products found.</p>`;
    return;
  }

  list.forEach((p) => {
    const card = document.createElement("div");
    card.className = "bg-white shadow rounded-lg p-4 flex flex-col justify-between";

    const imgHtml = p.image_url
      ? `<img src="${p.image_url}" alt="${p.name}" class="w-full h-32 object-cover mb-2 rounded" />`
      : "";

    card.innerHTML = `
      <div>
        ${imgHtml}
        <h3 class="font-semibold text-lg mb-1">${p.name}</h3>
        <p class="text-gray-600 mb-1">Price: ₹ ${p.price}</p>
        ${p.category ? `<p class="text-xs text-gray-400 mb-2">${p.category}</p>` : ""}
      </div>
      <button class="mt-2 bg-green-600 text-white py-1 rounded hover:bg-green-700"
              onclick="addToCart(${p.id})">
        Add to Cart
      </button>
    `;
    container.appendChild(card);
  });
}

// ---------- Add to cart ----------
function addToCart(productId) {
  let cart = getCart();
  const prod = products.find((p) => p.id == productId);
  if (!prod) {
    showToast("Product not found", true);
    return;
  }
  const existing = cart.find((item) => item.id == productId);
  if (existing) existing.qty += 1;
  else cart.push({ id: prod.id, name: prod.name, price: prod.price, qty: 1 });
  saveCart(cart);
  showToast("Added to cart");
  renderCart();
}

// ---------- Render cart ----------
function renderCart() {
  const cartItemsDiv = document.getElementById("cartItems");
  const totalSpan = document.getElementById("cartTotal");
  const emptyMsg = document.getElementById("emptyMsg");
  if (!cartItemsDiv || !totalSpan) return;

  let cart = getCart();
  cartItemsDiv.innerHTML = "";
  if (cart.length === 0) {
    if (emptyMsg) emptyMsg.classList.remove("hidden");
    totalSpan.textContent = "0";
    return;
  } else {
    if (emptyMsg) emptyMsg.classList.add("hidden");
  }

  let total = 0;
  cart.forEach((item, index) => {
    const lineTotal = item.price * item.qty;
    total += lineTotal;

    const row = document.createElement("div");
    row.className = "flex justify-between items-center bg-white p-3 rounded shadow";
    row.innerHTML = `
      <div>
        <p class="font-semibold">${item.name}</p>
        <p class="text-sm text-gray-600">₹ ${item.price} x 
          <input type="number" min="1" value="${item.qty}"
                 class="w-14 border rounded px-1 qty-input" data-index="${index}">
        </p>
      </div>
      <div class="text-right">
        <p class="font-semibold mb-1">₹ ${lineTotal}</p>
        <button class="text-red-600 text-sm" data-remove="${index}">Remove</button>
      </div>
    `;
    cartItemsDiv.appendChild(row);
  });

  totalSpan.textContent = total;

  // handlers
  cartItemsDiv.querySelectorAll(".qty-input").forEach((input) => {
    input.addEventListener("change", (e) => {
      let cart = getCart();
      const idx = parseInt(e.target.dataset.index);
      let newQty = parseInt(e.target.value);
      if (newQty < 1 || isNaN(newQty)) newQty = 1;
      cart[idx].qty = newQty;
      saveCart(cart);
      renderCart();
    });
  });

  cartItemsDiv.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      let cart = getCart();
      const idx = parseInt(e.target.dataset.remove);
      cart.splice(idx, 1);
      saveCart(cart);
      renderCart();
    });
  });
}

// ---------- Checkout form ----------
function setupCheckoutForm() {
  const form = document.getElementById("checkoutForm");
  const msg = document.getElementById("orderMsg");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const cart = getCart();
    if (cart.length === 0) { showToast("Your cart is empty."); return; }

    const name = form.querySelector('input[placeholder="Your Name"]').value.trim();
    const mobile = form.querySelector('input[placeholder="Mobile Number"]').value.trim();
    const address = form.querySelector("textarea").value.trim();

    try {
      const res = await fetch(API_BASE + "place_order.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, mobile, address, cart })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.removeItem("cart");
        renderCart();
        form.reset();
        if (msg) { msg.textContent = `✅ Order placed! ID ${data.order_id}`; msg.classList.remove("hidden"); }
      } else {
        showToast(data.message || "Failed to place order", true);
      }
    } catch (err) {
      console.error(err);
      showToast("Error placing order", true);
    }
  });
}

// ---------- Init ----------
document.addEventListener("DOMContentLoaded", () => {
  // load products if products container exists
  if (document.getElementById("productsContainer")) loadProducts();

  // search
  const searchInput = document.getElementById("searchInput");
  if (searchInput) searchInput.addEventListener("input", (e) => {
    currentSearchTerm = e.target.value;
    applyFilters();
  });

  // category
  const categorySelect = document.getElementById("categoryFilter");
  if (categorySelect) categorySelect.addEventListener("change", (e) => {
    currentCategory = e.target.value;
    applyFilters();
  });

  renderCart();
  setupCheckoutForm();
});
