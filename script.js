/* final script.js for GitHub Pages + Supabase backend */

// =========== CONFIG ===========
const SUPABASE_URL = "https://ujwwiuhmylcrgpofgxly.supabase.co"; // replace
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqd3dpdWhteWxjcmdwb2ZneGx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNzMwNjksImV4cCI6MjA4MDk0OTA2OX0.UFPKwGN585SrFZ3Tk8YmC2AYvKMWMRhfthAa_-5QeNY";                 // replace
const API_PRODUCTS = `${SUPABASE_URL}/rest/v1/products?select=id,name,price,category,image_url&order=id.desc`;

// helper to call supabase REST
async function supabaseFetch(url) {
  const res = await fetch(url, {
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return res.json();
}

// =========== TOAST ===========
function showToast(message, isError = false) {
  const toast = document.getElementById("toast");
  const msg = document.getElementById("toastMessage");
  if (!toast || !msg) return;
  toast.classList.remove("error");
  if (isError) toast.classList.add("error");
  msg.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

// =========== CART HELPERS ===========
function getCart() {
  const cart = localStorage.getItem("cart");
  return cart ? JSON.parse(cart) : [];
}
function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// =========== PRODUCTS (global) ===========
let products = [];
let filteredProducts = [];
let currentSearchTerm = "";
let currentCategory = "";

// =========== LOAD PRODUCTS ===========
async function loadProducts() {
  try {
    const data = await supabaseFetch(API_PRODUCTS);
    // supabase returns an array of rows
    products = Array.isArray(data) ? data : [];
    applyFilters();
  } catch (err) {
    console.error("Error loading products:", err);
    const container = document.getElementById("productsContainer");
    if (container) container.innerHTML = `<p class="text-red-600">Failed to load products. Check console.</p>`;
  }
}

// =========== FILTER & RENDER ===========
function applyFilters() {
  const term = currentSearchTerm.trim().toLowerCase();
  const category = currentCategory.trim().toLowerCase();

  filteredProducts = products.filter(p => {
    const name = (p.name || "").toLowerCase();
    const cat = (p.category || "").toLowerCase();
    const matchesSearch = !term || name.includes(term);
    const matchesCategory = !category || cat === category;
    return matchesSearch && matchesCategory;
  });

  renderProducts();
}

function renderProducts() {
  const container = document.getElementById("productsContainer");
  if (!container) return;
  container.innerHTML = "";

  const list = filteredProducts.length ? filteredProducts : [];
  if (!list.length) {
    container.innerHTML = `<p class="text-gray-500">No products found.</p>`;
    return;
  }

  list.forEach(p => {
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

// =========== CART UI ===========
function addToCart(productId) {
  let cart = getCart();
  const prod = products.find(p => p.id === productId || p.id == productId);
  if (!prod) { showToast("Product not found", true); return; }
  const existing = cart.find(i => i.id == productId);
  if (existing) existing.qty += 1;
  else cart.push({ id: prod.id, name: prod.name, price: prod.price, qty: 1 });
  saveCart(cart);
  showToast("Added to cart");
}

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
    const row = document.createElement("div");
    row.className = "flex justify-between items-center bg-white p-3 rounded shadow";
    const lineTotal = item.price * item.qty;
    total += lineTotal;
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

  cartItemsDiv.querySelectorAll(".qty-input").forEach(input => {
    input.addEventListener("change", e => {
      let cart = getCart();
      const idx = parseInt(e.target.dataset.index);
      let newQty = parseInt(e.target.value);
      if (newQty < 1 || isNaN(newQty)) newQty = 1;
      cart[idx].qty = newQty;
      saveCart(cart);
      renderCart();
    });
  });

  cartItemsDiv.querySelectorAll("[data-remove]").forEach(btn => {
    btn.addEventListener("click", e => {
      let cart = getCart();
      const idx = parseInt(e.target.dataset.remove);
      cart.splice(idx, 1);
      saveCart(cart);
      renderCart();
    });
  });
}

// =========== CHECKOUT FORM ===========
function setupCheckoutForm() {
  const form = document.getElementById("checkoutForm");
  const msg = document.getElementById("orderMsg");
  if (!form) return;

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const cart = getCart();
    if (cart.length === 0) { showToast("Your cart is empty.", true); return; }
    const name = form.querySelector('input[placeholder="Your Name"]').value.trim();
    const mobile = form.querySelector('input[placeholder="Mobile Number"]').value.trim();
    const address = form.querySelector('textarea').value.trim();

    // For demo: store orders in localStorage (or you can create orders table in Supabase)
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    const orderId = Date.now();
    orders.push({ orderId, name, mobile, address, cart, total: cart.reduce((s,i)=>s + i.price * i.qty,0) });
    localStorage.setItem("orders", JSON.stringify(orders));

    localStorage.removeItem("cart");
    renderCart();
    form.reset();
    if (msg) { msg.textContent = `✅ Order placed successfully! Your order ID is ${orderId}.`; msg.classList.remove("hidden"); }
  });
}

// =========== INIT ===========
document.addEventListener("DOMContentLoaded", () => {
  const productsContainer = document.getElementById("productsContainer");
  if (productsContainer) {
    loadProducts();
    const searchInput = document.getElementById("searchInput");
    if (searchInput) searchInput.addEventListener("input", e => { currentSearchTerm = e.target.value; applyFilters(); });
    const categorySelect = document.getElementById("categoryFilter");
    if (categorySelect) categorySelect.addEventListener("change", e => { currentCategory = e.target.value; applyFilters(); });
  }
  renderCart();
  setupCheckoutForm();
});
