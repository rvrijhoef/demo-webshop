const PRODUCTS = {
  apple: { name: "Apple", emoji: "🍏", unitPrice: 0.45 },
  banana: { name: "Banana", emoji: "🍌", unitPrice: 0.65 },
  lemon: { name: "Lemon", emoji: "🍋", unitPrice: 0.25 },
  cucumber: { name: "Cucumber", emoji: "🥒", unitPrice: 0.30 },
  avocado: { name: "Avocado", emoji: "🥑", unitPrice: 1.50 },
  tomato: { name: "Tomato", emoji: "🍅", unitPrice: 0.40 },
  potato: { name: "Potato", emoji: "🥔", unitPrice: 0.35 },
};

function getBasket() {
  try {
    const basket = localStorage.getItem("basket");
    if (!basket) return {};
    const parsed = JSON.parse(basket);
    return typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch (error) {
    console.warn("Error parsing basket from localStorage:", error);
    return {};
  }
}

function addToBasket(product) {
  const basket = getBasket();
  if (!PRODUCTS[product]) return;
  
  if (basket[product]) {
    basket[product].quantity += 1;
  } else {
    basket[product] = {
      quantity: 1,
      unitPrice: PRODUCTS[product].unitPrice,
    };
  }
  localStorage.setItem("basket", JSON.stringify(basket));
}

function removeFromBasket(product) {
  const basket = getBasket();
  delete basket[product];
  localStorage.setItem("basket", JSON.stringify(basket));
}

function updateQuantity(product, quantity) {
  const basket = getBasket();
  if (quantity <= 0) {
    removeFromBasket(product);
  } else if (basket[product]) {
    basket[product].quantity = quantity;
    localStorage.setItem("basket", JSON.stringify(basket));
  }
}

function increaseQuantity(product) {
  const basket = getBasket();
  if (basket[product]) {
    basket[product].quantity += 1;
    localStorage.setItem("basket", JSON.stringify(basket));
  }
}

function decreaseQuantity(product) {
  const basket = getBasket();
  if (basket[product]) {
    if (basket[product].quantity > 1) {
      basket[product].quantity -= 1;
      localStorage.setItem("basket", JSON.stringify(basket));
    } else {
      removeFromBasket(product);
    }
  }
}

function getCartTotal() {
  const basket = getBasket();
  let total = 0;
  for (const product in basket) {
    const item = basket[product];
    total += item.unitPrice * item.quantity;
  }
  return Math.round(total * 100) / 100;
}

function formatPrice(price) {
  return "€" + price.toFixed(2);
}

function clearBasket() {
  localStorage.removeItem("basket");
}

function renderBasket() {
  const basket = getBasket();
  const basketList = document.getElementById("basketList");
  const cartButtonsRow = document.querySelector(".cart-buttons-row");
  const totalPriceElement = document.getElementById("totalPrice");
  if (!basketList) return;
  basketList.innerHTML = "";
  
  const basketItems = Object.keys(basket);
  if (basketItems.length === 0) {
    basketList.innerHTML = "<li class='empty-cart'>No products in basket.</li>";
    if (cartButtonsRow) cartButtonsRow.style.display = "none";
    if (totalPriceElement) totalPriceElement.style.display = "none";
    return;
  }
  
  basketItems.forEach((productKey) => {
    const item = basket[productKey];
    const product = PRODUCTS[productKey];
    if (product) {
      const subtotal = Math.round(item.unitPrice * item.quantity * 100) / 100;
      const li = document.createElement("li");
      li.className = "cart-item";
      li.innerHTML = `
        <div class="cart-item-info">
          <span class='basket-emoji'>${product.emoji}</span>
          <div class="cart-item-details">
            <div class="cart-item-name">${product.name}</div>
            <div class="cart-item-price">${formatPrice(product.unitPrice)}</div>
          </div>
        </div>
        <div class="cart-item-controls">
          <button class="qty-btn qty-decrease" onclick="decreaseQuantity('${productKey}'); renderBasket(); renderBasketIndicator();">−</button>
          <input type="number" class="qty-input" value="${item.quantity}" min="1" data-product="${productKey}" />
          <button class="qty-btn qty-increase" onclick="increaseQuantity('${productKey}'); renderBasket(); renderBasketIndicator();">+</button>
        </div>
        <div class="cart-item-subtotal">
          <div class="subtotal-label">Subtotal</div>
          <div class="subtotal-amount">${formatPrice(subtotal)}</div>
        </div>
        <button class="remove-btn" onclick="removeFromBasket('${productKey}'); renderBasket(); renderBasketIndicator();">Remove</button>
      `;
      basketList.appendChild(li);
    }
  });
  
  if (cartButtonsRow) cartButtonsRow.style.display = "flex";
  if (totalPriceElement) {
    totalPriceElement.innerHTML = `<div class="total-label">Total:</div><div class="total-amount">${formatPrice(getCartTotal())}</div>`;
    totalPriceElement.style.display = "flex";
  }
  
  // Add event listeners for quantity inputs
  document.querySelectorAll(".qty-input").forEach((input) => {
    input.addEventListener("change", function () {
      const product = this.getAttribute("data-product");
      const newQuantity = parseInt(this.value) || 0;
      updateQuantity(product, newQuantity);
      renderBasket();
      renderBasketIndicator();
    });
  });
}

function renderBasketIndicator() {
  const basket = getBasket();
  let indicator = document.querySelector(".basket-indicator");
  if (!indicator) {
    const basketLink = document.querySelector(".basket-link");
    if (!basketLink) return;
    indicator = document.createElement("span");
    indicator.className = "basket-indicator";
    basketLink.appendChild(indicator);
  }
  const itemCount = Object.keys(basket).reduce((sum, product) => sum + basket[product].quantity, 0);
  if (itemCount > 0) {
    indicator.textContent = itemCount;
    indicator.style.display = "flex";
  } else {
    indicator.style.display = "none";
  }
}

// Call this on page load and after basket changes
if (document.readyState !== "loading") {
  renderBasketIndicator();
} else {
  document.addEventListener("DOMContentLoaded", renderBasketIndicator);
}

// Patch basket functions to update indicator
const origAddToBasket = window.addToBasket;
window.addToBasket = function (product) {
  origAddToBasket(product);
  renderBasketIndicator();
};
const origClearBasket = window.clearBasket;
window.clearBasket = function () {
  origClearBasket();
  renderBasketIndicator();
};

// Initialize on page load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function () {
    renderBasket();
  });
}
