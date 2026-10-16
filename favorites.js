/* -------------------------
   FAVORITES
------------------------- */

const FAVORITES_STORAGE_KEY = "vialXBeautyFavorites";

let favorites = loadSavedFavorites();

function loadSavedFavorites() {
  try {
    const savedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);

    if (!savedFavorites) {
      return [];
    }

    const parsedFavorites = JSON.parse(savedFavorites);

    return Array.isArray(parsedFavorites)
      ? parsedFavorites
      : [];
  } catch (error) {
    console.error("Unable to load saved favorites:", error);
    return [];
  }
}

function saveFavorites() {
  try {
    localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify(favorites)
    );
  } catch (error) {
    console.error("Unable to save favorites:", error);
  }
}

function clearSavedFavorites() {
  favorites = [];
  localStorage.removeItem(FAVORITES_STORAGE_KEY);
}

function isFavorite(productId) {
  return favorites.some(
    item => String(item.productId) === String(productId)
  );
}

function addFavorite(productId) {
  if (isFavorite(productId)) {
    return false;
  }

  favorites.push({
    productId
  });

  saveFavorites();
  updateFavoritesBadge();
  return true;
}

function removeFavorite(productId) {
  favorites = favorites.filter(
    item => String(item.productId) !== String(productId)
  );

  saveFavorites();
  updateFavoritesBadge();
  return true;
}

function toggleFavorite(productId) {
  const productName = getFavoriteProductName(productId);

  if (isFavorite(productId)) {
    removeFavorite(productId);

    renderFavoritesDrawer();

    showFavoritesToast(`${productName} removed from favorites`);

    return false;
  }

  addFavorite(productId);

  renderFavoritesDrawer();

  showFavoritesToast(`${productName} added to favorites`);

  return true;
}

function getFavorites() {
  return favorites.map(item => String(item.productId));
}

function getFavoriteProducts() {
  const getProductById = window.VialXStorefront?.getProductById;
  if (typeof getProductById !== "function") {
    return [];
  }

  return favorites
    .map(item => getProductById(item.productId))
    .filter(Boolean);
}

function getFavoriteCount() {
  return favorites.length;
}

function pruneMissingFavorites(existingProducts = []) {
  const existingProductIds = new Set(
    existingProducts.map((product) => String(product.id))
  );
  const cleanedFavorites = favorites.filter((item) =>
    existingProductIds.has(String(item.productId))
  );

  if (cleanedFavorites.length !== favorites.length) {
    favorites = cleanedFavorites;
    saveFavorites();
  }

  return favorites;
}

function getFavoriteProductName(productId) {
  const getProductById = window.VialXStorefront?.getProductById;
  if (typeof getProductById !== "function") {
    return "Product";
  }

  return getProductById(productId)?.name || "Product";
}

function showFavoritesToast(message) {
  window.VialXStorefront?.notify?.(message);
}

function updateFavoritesBadge() {
    const badge = document.getElementById("favoritesCount");

    if (!badge) {
        return;
    }

    const count = getFavoriteCount();

    badge.textContent = count;

    badge.hidden = count === 0;

    const button = document.getElementById("favoritesButton");

    if (button) {
        button.setAttribute(
            "aria-label",
            count
                ? `Open favorites, ${count} item${count === 1 ? "" : "s"}`
                : "Open favorites"
        );
    }
}
document.addEventListener("DOMContentLoaded", () => {
    updateFavoritesBadge();
    renderFavoritesDrawer();
});
function renderFavoritesDrawer() {
    const container = document.getElementById("favoritesItems");

    if (!container) {
        return;
    }

    const favoriteProducts = getFavoriteProducts();
    const formatCurrency = window.VialXStorefront?.formatCurrency;
    if (!favoriteProducts.length) {
        container.innerHTML = `
          <p class="favorites-empty">No favorites yet. Save a product with the heart button and it will appear here.</p>
        `;
        return;
    }

    const escapeHtml = window.VialXStorefront?.escapeHtml || ((value) => String(value ?? ""));
    container.innerHTML = favoriteProducts.map((product) => `
        <article class="favorite-item">
          ${
            product.image_url
              ? `<img class="favorite-thumb" src="${escapeHtml(product.image_url)}" alt="${escapeHtml(product.name)}" loading="lazy">`
              : `<div class="favorite-thumb favorite-thumb-placeholder" aria-hidden="true">♡</div>`
          }
          <div class="favorite-details">
            <strong>${escapeHtml(product.name)}</strong>
            <span>${typeof formatCurrency === "function" ? formatCurrency(product.price) : ""}</span>
          </div>
          <div class="favorite-actions">
            <button class="favorite-add" type="button" data-favorite-add="${escapeHtml(String(product.id))}">Add to cart</button>
            <button class="favorite-remove" type="button" data-favorite-remove="${escapeHtml(String(product.id))}" aria-label="Remove ${escapeHtml(product.name)} from favorites">Remove</button>
          </div>
        </article>
    `).join("");
}

document.getElementById("favoritesItems")?.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const button = target?.closest("button");
    if (!button) return;

    if (button.dataset.favoriteRemove) {
        const productId = button.dataset.favoriteRemove;
        const productName = getFavoriteProductName(productId);
        removeFavorite(productId);
        renderFavoritesDrawer();
        updateFavoritesBadge();
        window.VialXStorefront?.renderProducts?.();
        showFavoritesToast(`${productName} removed from favorites`);
    } else if (button.dataset.favoriteAdd) {
        window.VialXStorefront?.addProductToCart?.(button.dataset.favoriteAdd);
    }
});
