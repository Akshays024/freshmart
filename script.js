/* Updated script.js with Supabase order placement */

// *** Add Supabase Client initialization (Recommended for future realtime features) ***
// To use the realtime features (like the admin page refresh suggestion), 
// you should use the Supabase client library. Assuming you link it in your HTML:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
// const { createClient } = supabase;

// =========== CONFIG ===========
const SUPABASE_URL = "https://ujwwiuhmylcrgpofgxly.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqd3dpdWhteWxjcmdwb2ZneGx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNzMwNjksImV4cCI6MjA4MDk0OTA2OX0.UFPKwGN5855SrFZ3Tk8YmC2AYvKMWMRhfthAa_-5QeNY";

const API_PRODUCTS = `${SUPABASE_URL}/rest/v1/products?select=id,name,price,category,image_url&order=id.desc`;

// Helper to call supabase REST
async function supabaseFetch(url, options = {}) {
    const defaultHeaders = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
    };
    
    const res = await fetch(url, {
        ...options,
        headers: { ...defaultHeaders, ...options.headers }
    });
    
    if (!res.ok) {
        const errorText = await res.text();
        console.error("Supabase Fetch Error Details:", errorText);
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }
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
    if (!prod) { 
        showToast("Product not found", true); 
        return; 
    }
    
    const existing = cart.find(i => i.id == productId);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ 
            id: prod.id, 
            name: prod.name, 
            price: prod.price, 
            qty: 1 
        });
    }
    
    saveCart(cart);
    showToast("Added to cart");
}

function renderCart() {
    const cartItemsDiv = document.getElementById("cartItems");
    const totalSpans = document.querySelectorAll(".cartTotal"); // Changed to class for better selection
    const emptyMsg = document.getElementById("emptyMsg");
    const checkoutButton = document.getElementById("checkoutButton");
    
    if (!cartItemsDiv) return;

    let cart = getCart();
    cartItemsDiv.innerHTML = "";
    
    if (cart.length === 0) {
        if (emptyMsg) emptyMsg.classList.remove("hidden");
        if (checkoutButton) checkoutButton.disabled = true;
        totalSpans.forEach(span => span.textContent = "0");
        return;
    } else {
        if (emptyMsg) emptyMsg.classList.add("hidden");
        if (checkoutButton) checkoutButton.disabled = false;
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

    totalSpans.forEach(span => span.textContent = total);

    // Quantity change handlers
    cartItemsDiv.querySelectorAll(".qty-input").forEach(input => {
        input.addEventListener("change", e => {
            let cart = getCart();
            const idx = parseInt(e.target.dataset.index);
            let newQty = parseInt(e.target.value);
            if (newQty < 1 || isNaN(newQty)) newQty = 1;
            
            // Update cart and persist
            cart[idx].qty = newQty;
            saveCart(cart);
            // Re-render to update line totals and grand total
            renderCart(); 
        });
    });

    // Remove button handlers
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
    const submitButton = form ? form.querySelector('button[type="submit"]') : null;

    if (!form) return;

    form.addEventListener("submit", async e => {
        e.preventDefault();
        
        if (msg) {
            msg.textContent = "";
            msg.classList.add("hidden");
        }

        const cart = getCart();
        if (cart.length === 0) { 
            showToast("Your cart is empty.", true); 
            if (msg) {
                msg.textContent = "Your cart is empty. Add products to place an order.";
                msg.classList.remove("hidden");
            }
            return; 
        }

        const name = form.querySelector('input[placeholder="Your Name"]').value.trim();
        const mobile = form.querySelector('input[placeholder="Mobile Number"]').value.trim();
        const address = form.querySelector('textarea').value.trim();

        if (!name || !mobile || !address) {
            showToast("Please fill all fields", true);
            return;
        }

        // Calculate total
        const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        
        let orderId = null;

        if (submitButton) submitButton.disabled = true; // Disable button to prevent double click

        try {
            // 1. Create order in orders table
            const orderResponse = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation' // This makes it return the created row
                },
                body: JSON.stringify({
                    customer_name: name,
                    mobile: mobile,
                    address: address,
                    total_amount: total
                })
            });

            if (!orderResponse.ok) {
                throw new Error('Failed to create order in orders table.');
            }

            const orderData = await orderResponse.json();
            orderId = orderData[0].id; // Get the ID of the newly created order

            // 2. Prepare and create order items
            const orderItems = cart.map(item => ({
                order_id: orderId,
                product_id: item.id,
                product_name: item.name,
                price: item.price,
                quantity: item.qty,
                line_total: item.price * item.qty
            }));

            const itemsResponse = await fetch(`${SUPABASE_URL}/rest/v1/order_items`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal' // Minimal return for bulk insert
                },
                body: JSON.stringify(orderItems)
            });

            if (!itemsResponse.ok) {
                // IMPORTANT: In a real app, you might want to delete the order here
                // if order items insertion fails, but for this context, we just log it.
                throw new Error('Failed to create order items.');
            }

            // Success!
            localStorage.removeItem("cart"); // Clear the local cart
            form.reset(); // Reset the form fields
            renderCart(); // Update the UI cart display
            
            
            if (msg) { 
                msg.textContent = `✅ Order #${orderId} placed successfully! Thank you. Total: ₹${total}`;
                msg.classList.remove("hidden");
                msg.classList.remove("text-red-600");
                msg.classList.add("text-green-600");
            }
            
            showToast(`Order placed successfully! Order ID: #${orderId}`);

        } catch (error) {
            console.error('Order placement error:', error);
            showToast('Failed to place order. Please check the console for details.', true);

            if (msg) {
                msg.textContent = `❌ Order failed. ${error.message || 'Please try again.'}`;
                msg.classList.remove("hidden");
                msg.classList.add("text-red-600");
                msg.classList.remove("text-green-600");
            }

        } finally {
            if (submitButton) submitButton.disabled = false; // Re-enable button
        }
    });
}

// =========== INIT ===========
document.addEventListener("DOMContentLoaded", () => {
    const productsContainer = document.getElementById("productsContainer");
    
    if (productsContainer) {
        loadProducts();
        
        const searchInput = document.getElementById("searchInput");
        if (searchInput) {
            searchInput.addEventListener("input", e => { 
                currentSearchTerm = e.target.value; 
                applyFilters(); 
            });
        }
        
        const categorySelect = document.getElementById("categoryFilter");
        if (categorySelect) {
            categorySelect.addEventListener("change", e => { 
                currentCategory = e.target.value; 
                applyFilters(); 
            });
        }
    }
    
    renderCart();
    setupCheckoutForm();
});