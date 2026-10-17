(function () {
  const adminContent = document.querySelector("#adminContent");
  if (!adminContent) return;

  const screenDefinitions = [
    { id: "dashboard", title: "Dashboard", section: "dashboardSection", primary: true },
    { id: "orders", title: "Orders", section: "ordersSection", primary: true },
    { id: "products", title: "Products", section: "productsSection", primary: true },
    { id: "categories", title: "Categories", section: "categoriesSection", primary: true },
    { id: "menu", title: "Menu", primary: true },
    { id: "shipping", title: "Shipping options", section: "shippingFeesSection" },
    { id: "payments", title: "Payment methods", section: "paymentMethodsSection" },
    { id: "settings", title: "Shop settings", section: "shopSettingsSection" },
    { id: "security", title: "Password & Security", section: "securitySection" },
    { id: "storefront-menu", title: "Storefront menu", sections: ["menuSection", "addMenuSection"] },
    { id: "product-form", title: "Product details", section: "addProductSection" },
  ];
  const screens = new Map();
  let activeScreen = "dashboard";

  const app = document.createElement("div");
  app.className = "admin-app-shell";
  app.innerHTML = `
    <header class="admin-app-header">
      <span class="admin-header-side-spacer" aria-hidden="true"></span>
      <a class="admin-app-brand" href="admin.html" aria-label="VialXBeauty admin">VialXBeauty</a>
      <a class="admin-app-store-link" href="index.html">View Shop <span aria-hidden="true">↗</span></a>
    </header>
    <main class="admin-app-main">
      <div class="admin-screen-heading">
        <button class="admin-screen-back" type="button" data-screen-back hidden aria-label="Back to menu">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6M9 12h11"></path></svg>
        </button>
        <div>
          <h1 data-screen-title>Dashboard</h1>
        </div>
      </div>
      <div class="admin-screen-stack"></div>
    </main>
    <nav class="admin-app-bottom-nav" aria-label="Admin navigation">
      <button type="button" data-screen-target="dashboard" aria-current="page">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"></path></svg><span>Dashboard</span>
      </button>
      <button type="button" data-screen-target="orders">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h10l4 4v14H3V3zM7 3v6h10V3M7 13h10M7 17h7"></path></svg><span>Orders</span>
      </button>
      <button type="button" data-screen-target="products">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14l-1 14H6L5 7ZM9 7a3 3 0 0 1 6 0M4 4h16"></path></svg><span>Products</span>
      </button>
      <button type="button" data-screen-target="categories">
        <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="8" height="8" rx="2"></rect><rect x="13" y="3" width="8" height="8" rx="2"></rect><rect x="3" y="13" width="8" height="8" rx="2"></rect><rect x="13" y="13" width="8" height="8" rx="2"></rect></svg><span>Categories</span>
      </button>
      <button type="button" data-screen-target="menu">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"></path></svg><span>Menu</span>
      </button>
    </nav>
  `;

  const screenStack = app.querySelector(".admin-screen-stack");
  const modalElements = [
    ...adminContent.querySelectorAll("dialog"),
  ];
  const oldLayout = adminContent.querySelector(".admin-layout");
  const oldNavigation = adminContent.querySelector("#mobileAdminNav");
  const sectionIds = screenDefinitions.flatMap((screen) =>
    screen.section ? [screen.section] : screen.sections || []
  );

  screenDefinitions.forEach((definition) => {
    const screen = document.createElement("section");
    screen.className = "admin-app-screen";
    screen.dataset.appScreen = definition.id;
    screen.hidden = true;
    screenStack.append(screen);
    screens.set(definition.id, screen);
  });

  const menuScreen = screens.get("menu");
  menuScreen.innerHTML = `
    <section class="admin-menu-hub" aria-label="More admin options">
      <div class="admin-menu-options">
        <button type="button" data-screen-target="storefront-menu"><span class="admin-menu-option-icon">☷</span><strong>Storefront Menu</strong><span aria-hidden="true">›</span></button>
        <button type="button" data-screen-target="shipping"><span class="admin-menu-option-icon">↗</span><strong>Shipping Options</strong><span aria-hidden="true">›</span></button>
        <button id="adminMenuPaymentsOption" type="button" data-screen-target="payments"><span class="admin-menu-option-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="M3 9h18M16 14h2"></path></svg></span><strong>Payment Methods</strong><span aria-hidden="true">›</span></button>
        <button type="button" data-screen-target="settings"><span class="admin-menu-option-icon">⚙</span><strong>Shop Settings</strong><span aria-hidden="true">›</span></button>
        <button type="button" data-screen-target="security"><span class="admin-menu-option-icon">⌑</span><strong>Password &amp; Security</strong><span aria-hidden="true">›</span></button>
      </div>
    </section>
  `;

  adminContent.append(app);
  sectionIds.forEach((id) => {
    const section = document.getElementById(id);
    if (!section) {
      console.error(`Admin screen section "${id}" was not found.`);
      return;
    }
    const destination = screenDefinitions.find((screen) =>
      screen.section === id || screen.sections?.includes(id)
    );
    screens.get(destination.id).append(section);
  });
  const logoutButton = document.getElementById("sidebarLogoutButton");
  if (logoutButton) menuScreen.querySelector(".admin-menu-options").append(logoutButton);
  modalElements.forEach((dialog) => {
    (dialog.id === "paymentMethodModal" ? document.body : app).append(dialog);
  });

  oldNavigation?.remove();
  oldLayout?.remove();

  const primaryTarget = (screenId) => {
    const definition = screenDefinitions.find((screen) => screen.id === screenId);
    return definition?.primary ? screenId : "menu";
  };

  function showScreen(screenId, options = {}) {
    if (!screens.has(screenId)) return;
    activeScreen = screenId;
    screens.forEach((screen, id) => {
      screen.hidden = id !== screenId;
    });

    const definition = screenDefinitions.find((screen) => screen.id === screenId);
    app.querySelector("[data-screen-title]").textContent = definition.title;
    const isPrimary = Boolean(definition.primary);
    const backButton = app.querySelector("[data-screen-back]");
    backButton.hidden = isPrimary;
    backButton.setAttribute("aria-label", screenId === "product-form" ? "Back to products" : "Back to menu");
    app.querySelectorAll(".admin-app-bottom-nav [data-screen-target]").forEach((button) => {
      const isActive = button.dataset.screenTarget === primaryTarget(screenId);
      button.classList.toggle("active", isActive);
      if (isActive) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });

    if (!options.keepScroll) {
      window.scrollTo({ top: 0, behavior: "auto" });
      app.querySelector(".admin-app-main").scrollTop = 0;
    }
    if (options.updateHistory !== false) {
      history.replaceState(null, "", `${location.pathname}${location.search}#${screenId}`);
    }
  }

  function navigateFromLegacyHash(hash) {
    const target = hash.replace(/^#/, "");
    const screen = screenDefinitions.find((definition) =>
      definition.section === target || definition.sections?.includes(target)
    );
    if (screen) showScreen(screen.id);
  }

  app.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const screenButton = target?.closest("[data-screen-target]");
    if (screenButton) {
      event.preventDefault();
      showScreen(screenButton.dataset.screenTarget);
      return;
    }

    if (target?.closest("[data-screen-back]")) {
      showScreen(activeScreen === "product-form" ? "products" : "menu");
      return;
    }

    const legacyLink = target?.closest('a[href^="#"]');
    if (legacyLink) {
      const targetId = legacyLink.getAttribute("href");
      const mapped = screenDefinitions.find((definition) =>
        `#${definition.section}` === targetId || definition.sections?.some((id) => `#${id}` === targetId)
      );
      if (mapped) {
        event.preventDefault();
        showScreen(mapped.id);
      }
    }
  });

  app.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest("#addProductBtn")) showScreen("product-form");
    if (target?.closest("#cancelEdit")) showScreen("products");
    if (target?.closest("#cancelMenuEdit")) showScreen("storefront-menu");
    if (target?.closest("#cancelCategoryEdit")) showScreen("categories");
    if (target?.closest("[data-category-add]")) {
      resetCategoryForm();
      const editor = document.querySelector("#categoryEditor");
      if (editor) editor.open = true;
      showScreen("categories");
      document.querySelector("#categoryForm")?.scrollIntoView({ behavior: "smooth", block: "start" });
      document.querySelector('#categoryForm input[name="categoryName"]')?.focus({ preventScroll: true });
    }
    if (target?.closest("[data-menu-add]")) {
      document.querySelector("#cancelMenuEdit")?.click();
      const editor = document.querySelector("#menuItemEditor");
      if (editor) editor.open = true;
      showScreen("storefront-menu");
      document.querySelector("#addMenuSection")?.scrollIntoView({ behavior: "smooth", block: "start" });
      document.querySelector('#menuForm input[name="label"]')?.focus({ preventScroll: true });
    }
  }, true);

  app.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest("#productsTableContainer [data-edit]")) showScreen("product-form");
    if (target?.closest("[data-edit-category-product]")) showScreen("product-form");
  }, true);

  app.querySelectorAll("[data-settings-tab]").forEach((button) => {
    button.setAttribute("aria-controls", "settingsForm");
  });

  showScreen("dashboard", { updateHistory: false });
  const initialScreen = location.hash.slice(1);
  if (screens.has(initialScreen)) {
    showScreen(initialScreen, { updateHistory: false });
  } else if (initialScreen) {
    navigateFromLegacyHash(`#${initialScreen}`);
  }

  window.VialXAdminNavigation = {
    showScreen,
    getActiveScreen: () => activeScreen,
  };
})();
