const API_BASE_URL = window.APP_CONFIG?.API_BASE_URL || "http://localhost:3000/api/v1";
const PRODUCT_ID = "iqlifar";

const quantityOutput = document.querySelector("[data-quantity]");
const decreaseButton = document.querySelector('[data-quantity-change="-1"]');
const increaseButton = document.querySelector('[data-quantity-change="1"]');
const confirmButton = document.querySelector("[data-confirm-selection]");
const confirmation = document.querySelector("[data-confirmation]");
const statusMessage = document.querySelector("[data-product-status]");
const stage = document.querySelector("[data-bottle-stage]");
let product = null;
let selectedVariant = null;
let selectedSize = null;
let quantity = 1;

function formatPrice(amount, currency = "IDR") {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

function currentOption() {
  return product?.variants.find((variant) => variant.name === selectedVariant && variant.attributes.sizeMl === selectedSize) || null;
}

function updateSummary() {
  const option = currentOption();
  const unitPrice = option?.price?.amount ?? product?.price.amount ?? 0;
  const stock = option?.stock ?? 0;
  document.querySelector("[data-summary-variant]").textContent = selectedVariant || "Belum dipilih";
  document.querySelector("[data-summary-size]").textContent = selectedSize ? `${selectedSize} ml` : "Belum dipilih";
  document.querySelector("[data-summary-quantity]").textContent = quantity;
  document.querySelector("[data-summary-total]").textContent = formatPrice(unitPrice * quantity, product?.price.currency || "IDR");
  confirmButton.disabled = !option || stock < 1;
  decreaseButton.disabled = quantity <= 1;
  increaseButton.disabled = !option || quantity >= stock;
  if (option) document.querySelector("[data-stock-note]").textContent = stock > 0 ? `Stok tersedia: ${stock} botol untuk ${option.name}, ${option.attributes.sizeMl} ml.` : "Stok varian ini sedang habis.";
}

function clearConfirmation() {
  confirmation.hidden = true;
  confirmation.textContent = "";
}

function showVariant(variantName) {
  selectedVariant = variantName;
  const variants = product.variants.filter((variant) => variant.name === variantName);
  const first = variants[0];
  if (!variants.some((variant) => variant.attributes.sizeMl === selectedSize && variant.stock > 0)) {
    selectedSize = variants.find((variant) => variant.stock > 0)?.attributes.sizeMl ?? first?.attributes.sizeMl ?? null;
  }
  quantity = 1;
  quantityOutput.value = quantity;
  quantityOutput.textContent = quantity;
  document.querySelectorAll("[data-variant-choice]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.variantChoice === variantName)));
  const audience = variantName === "Iqlima" ? "Untuk perempuan" : "Untuk lelaki";
  document.querySelector("[data-variant-hint]").textContent = audience;
  document.querySelector("[data-variant-description]").textContent = first.description || product.description;
  document.querySelector("[data-art-name]").textContent = variantName;
  document.querySelector("[data-art-gender]").textContent = audience;
  document.querySelector("[data-art-collection]").textContent = variantName === "Iqlima" ? "THE FEMININE EDIT" : "THE MASCULINE EDIT";
  document.querySelector("[data-bottle-name]").textContent = variantName.toUpperCase();
  stage.dataset.variant = variantName.toLowerCase();
  stage.setAttribute("aria-label", `Mockup konsep botol ${variantName}`);
  document.querySelector("[data-notes-variant]").textContent = variantName;
  const notes = first.notes || {};
  document.querySelector("[data-notes-top]").textContent = (notes.top || []).join(", ") || "Belum tersedia";
  document.querySelector("[data-notes-heart]").textContent = (notes.heart || []).join(", ") || "Belum tersedia";
  document.querySelector("[data-notes-base]").textContent = (notes.base || []).join(", ") || "Belum tersedia";
  document.querySelectorAll("[data-size-choice]").forEach((button) => button.setAttribute("aria-pressed", String(Number(button.dataset.sizeChoice) === selectedSize)));
  document.querySelector("[data-size-hint]").textContent = selectedSize ? `${selectedSize} ml dipilih` : "Ukuran tidak tersedia";
  clearConfirmation();
  updateSummary();
}

function renderProduct(data) {
  product = data;
  document.querySelector("#product-title").textContent = data.name;
  document.querySelector(".price").textContent = formatPrice(data.price.amount, data.price.currency);
  document.querySelector(".price-note").textContent = "harga dari katalog API";
  document.querySelector("[data-variant-options]").replaceChildren();
  document.querySelector("[data-size-options]").replaceChildren();

  const names = [...new Set(data.variants.map((variant) => variant.name))];
  for (const name of names) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "variant-option";
    button.dataset.variantChoice = name;
    button.setAttribute("aria-pressed", "false");
    const swatch = document.createElement("span");
    swatch.className = `variant-swatch ${name.toLowerCase() === "fariz" ? "swatch-fariz" : "swatch-iqlima"}`;
    swatch.setAttribute("aria-hidden", "true");
    const label = document.createElement("span");
    const strong = document.createElement("strong");
    strong.textContent = name;
    const small = document.createElement("small");
    small.textContent = name.toLowerCase() === "fariz" ? "Untuk lelaki" : "Untuk perempuan";
    label.append(strong, small);
    const check = document.createElement("span");
    check.className = "choice-check";
    check.setAttribute("aria-hidden", "true");
    check.textContent = "✓";
    button.append(swatch, label, check);
    button.addEventListener("click", () => showVariant(name));
    document.querySelector("[data-variant-options]").append(button);
  }

  const sizes = [...new Set(data.variants.map((variant) => variant.attributes.sizeMl))].sort((a, b) => a - b);
  for (const size of sizes) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "size-option";
    button.dataset.sizeChoice = size;
    button.setAttribute("aria-pressed", "false");
    button.textContent = `${size} ml`;
    button.addEventListener("click", () => {
      selectedSize = size;
      quantity = 1;
      quantityOutput.value = quantity;
      quantityOutput.textContent = quantity;
      document.querySelectorAll("[data-size-choice]").forEach((option) => option.setAttribute("aria-pressed", String(Number(option.dataset.sizeChoice) === size)));
      document.querySelector("[data-size-hint]").textContent = `${size} ml dipilih`;
      clearConfirmation();
      updateSummary();
    });
    document.querySelector("[data-size-options]").append(button);
  }

  const image = data.images.find((item) => item.isPrimary && item.url) || data.images.find((item) => item.url);
  if (image) {
    const img = document.createElement("img");
    img.className = "main-product-image";
    img.src = image.url;
    img.alt = image.alt || data.name;
    stage.replaceChildren(img);
    stage.classList.remove("bottle-stage");
  }
  const firstAvailable = data.variants.find((variant) => variant.stock > 0) || data.variants[0];
  statusMessage.textContent = "";
  if (!firstAvailable) {
    statusMessage.textContent = "Produk ini belum memiliki varian.";
    confirmButton.disabled = true;
    return;
  }
  showVariant(firstAvailable.name);
}

async function loadProduct() {
  statusMessage.textContent = "Memuat produk dari API...";
  confirmButton.disabled = true;
  try {
    const response = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(PRODUCT_ID)}`, { headers: { Accept: "application/json" } });
    const body = await response.json();
    if (!response.ok) throw new Error(body.detail || body.message || `Request gagal (${response.status}).`);
    if (!body.success || !body.data) throw new Error("Format respons API tidak sesuai.");
    renderProduct(body.data);
  } catch (error) {
    statusMessage.textContent = `Produk belum dapat dimuat: ${error.message}. Pastikan API aktif, lalu coba muat ulang halaman.`;
    document.querySelector("[data-stock-note]").textContent = "Stok belum dapat diperiksa.";
  }
}

document.querySelectorAll("[data-quantity-change]").forEach((button) => button.addEventListener("click", () => {
  const option = currentOption();
  if (!option) return;
  quantity = Math.min(option.stock, Math.max(1, quantity + Number(button.dataset.quantityChange)));
  quantityOutput.value = quantity;
  quantityOutput.textContent = quantity;
  clearConfirmation();
  updateSummary();
}));

confirmButton.addEventListener("click", () => {
  const option = currentOption();
  if (!option || option.stock < 1) return;
  confirmation.textContent = `Pilihan dikonfirmasi: ${option.name}, ${option.attributes.sizeMl} ml, ${quantity} botol. Total ${document.querySelector("[data-summary-total]").textContent}. Ini hanya konfirmasi pilihan, belum termasuk checkout.`;
  confirmation.hidden = false;
});

loadProduct();
