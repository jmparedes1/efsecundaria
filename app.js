import { APP_CONFIG } from "./firebase-config.js";

const CATEGORY_LABELS = {
  curriculo: "Currículo",
  repaso: "Repaso",
  programacion: "Programación",
  utilidades: "Utilidades"
};

const state = {
  resources: [],
  favorites: new Set(),
  filter: "all",
  query: "",
  selectedId: null,
  firebase: null,
  user: null,
  isAdmin: false
};

const elements = {
  app: document.querySelector("#app"),
  authScreen: document.querySelector("#authScreen"),
  statusScreen: document.querySelector("#statusScreen"),
  statusTitle: document.querySelector("#statusTitle"),
  statusMessage: document.querySelector("#statusMessage"),
  loginForm: document.querySelector("#loginForm"),
  loginEmail: document.querySelector("#loginEmail"),
  loginPassword: document.querySelector("#loginPassword"),
  loginMessage: document.querySelector("#loginMessage"),
  resetPassword: document.querySelector("#resetPassword"),
  pendingLogout: document.querySelector("#pendingLogout"),
  logoutButton: document.querySelector("#logoutButton"),
  adminLink: document.querySelector("#adminLink"),
  modeBadge: document.querySelector("#modeBadge"),
  userName: document.querySelector("#userName"),
  search: document.querySelector("#search"),
  filters: document.querySelector("#filters"),
  resourceList: document.querySelector("#resourceList"),
  emptyState: document.querySelector("#emptyState"),
  visibleCount: document.querySelector("#visibleCount"),
  resourceCount: document.querySelector("#resourceCount"),
  favoriteCount: document.querySelector("#favoriteCount"),
  viewer: document.querySelector("#viewer"),
  viewerPlaceholder: document.querySelector("#viewerPlaceholder"),
  viewerTitle: document.querySelector("#viewerTitle"),
  viewerDescription: document.querySelector("#viewerDescription"),
  viewerCategory: document.querySelector("#viewerCategory"),
  openNewTab: document.querySelector("#openNewTab"),
  toast: document.querySelector("#toast")
};

function normalize(value = "") {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function sortedResources(resources) {
  return [...resources].sort((a, b) => Number(a.order || 0) - Number(b.order || 0) || a.title.localeCompare(b.title, "es"));
}

async function loadLocalCatalog() {
  const response = await fetch("./resources.json", { cache: "no-store" });
  if (!response.ok) throw new Error("No se pudo leer resources.json");
  return sortedResources(await response.json());
}

function loadLocalFavorites() {
  try {
    const saved = JSON.parse(localStorage.getItem("premir_favorites_v2") || "[]");
    state.favorites = new Set(Array.isArray(saved) ? saved : []);
  } catch {
    state.favorites = new Set();
  }
}

async function saveFavorites() {
  localStorage.setItem("premir_favorites_v2", JSON.stringify([...state.favorites]));
  elements.favoriteCount.textContent = String(state.favorites.size);
  if (!state.firebase || !state.user) return;

  const { doc, setDoc, serverTimestamp } = state.firebase.store;
  await setDoc(doc(state.firebase.db, "progress", state.user.uid), {
    favorites: [...state.favorites],
    updatedAt: serverTimestamp()
  }, { merge: true });
}

async function loadCloudFavorites() {
  if (!state.firebase || !state.user) return;
  const { doc, getDoc } = state.firebase.store;
  const snap = await getDoc(doc(state.firebase.db, "progress", state.user.uid));
  if (snap.exists() && Array.isArray(snap.data().favorites)) {
    state.favorites = new Set(snap.data().favorites);
    localStorage.setItem("premir_favorites_v2", JSON.stringify([...state.favorites]));
  }
}

function filteredResources() {
  return state.resources.filter((resource) => {
    if (!resource.active) return false;
    if (state.filter === "favorites" && !state.favorites.has(resource.id)) return false;
    if (state.filter !== "all" && state.filter !== "favorites" && resource.category !== state.filter) return false;
    if (!state.query) return true;
    return normalize(`${resource.title} ${resource.description} ${CATEGORY_LABELS[resource.category] || resource.category}`).includes(state.query);
  });
}

function resourceCard(resource) {
  const card = document.createElement("article");
  card.className = `resource-card${state.selectedId === resource.id ? " active" : ""}`;

  const openButton = document.createElement("button");
  openButton.type = "button";
  openButton.className = "resource-open";
  openButton.setAttribute("aria-label", `Abrir ${resource.title}`);
  openButton.addEventListener("click", () => openResource(resource));

  const icon = document.createElement("span");
  icon.className = "resource-icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = resource.icon || "📄";

  const copy = document.createElement("span");
  copy.className = "resource-copy";
  const title = document.createElement("strong");
  title.textContent = resource.title;
  const meta = document.createElement("small");
  meta.textContent = CATEGORY_LABELS[resource.category] || resource.category;
  copy.append(title, meta);

  const favorite = document.createElement("button");
  const isFavorite = state.favorites.has(resource.id);
  favorite.type = "button";
  favorite.className = "favorite-button";
  favorite.setAttribute("aria-label", `${isFavorite ? "Quitar" : "Añadir"} ${resource.title} ${isFavorite ? "de" : "a"} favoritos`);
  favorite.setAttribute("aria-pressed", String(isFavorite));
  favorite.textContent = isFavorite ? "★" : "☆";
  favorite.addEventListener("click", async (event) => {
    event.stopPropagation();
    if (isFavorite) state.favorites.delete(resource.id);
    else state.favorites.add(resource.id);
    await saveFavorites();
    renderCatalog();
  });

  openButton.append(icon, copy);
  card.append(openButton, favorite);
  return card;
}

function renderCatalog() {
  const resources = filteredResources();
  elements.resourceList.replaceChildren(...resources.map(resourceCard));
  elements.visibleCount.textContent = String(resources.length);
  elements.resourceCount.textContent = String(state.resources.filter((item) => item.active).length);
  elements.favoriteCount.textContent = String(state.favorites.size);
  elements.emptyState.hidden = resources.length > 0;
}

function openResource(resource) {
  state.selectedId = resource.id;
  elements.viewerTitle.textContent = resource.title;
  elements.viewerDescription.textContent = resource.description || "Recurso PREMIR";
  elements.viewerCategory.textContent = CATEGORY_LABELS[resource.category] || resource.category;
  elements.viewer.src = resource.url;
  elements.viewer.hidden = false;
  elements.viewerPlaceholder.hidden = true;
  elements.openNewTab.href = resource.url;
  elements.openNewTab.hidden = false;
  window.history.replaceState(null, "", `#${encodeURIComponent(resource.id)}`);
  renderCatalog();
  if (window.innerWidth < 980) elements.viewerTitle.scrollIntoView({ behavior: "smooth", block: "start" });
}

function openResourceFromHash() {
  const id = decodeURIComponent(location.hash.replace(/^#/, ""));
  const resource = state.resources.find((item) => item.id === id && item.active);
  if (resource) openResource(resource);
}

function bindCatalogEvents() {
  elements.search.addEventListener("input", () => {
    state.query = normalize(elements.search.value);
    renderCatalog();
  });

  elements.filters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter]");
    if (!button) return;
    state.filter = button.dataset.filter;
    elements.filters.querySelectorAll("[data-filter]").forEach((item) => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    renderCatalog();
  });
}

function showApp() {
  elements.authScreen.hidden = true;
  elements.statusScreen.hidden = true;
  elements.app.hidden = false;
  renderCatalog();
  openResourceFromHash();
}

function showPending(title, message) {
  elements.app.hidden = true;
  elements.authScreen.hidden = true;
  elements.statusTitle.textContent = title;
  elements.statusMessage.textContent = message;
  elements.statusScreen.hidden = false;
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.hidden = false;
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => { elements.toast.hidden = true; }, 3200);
}

function firebaseConfigReady() {
  const values = APP_CONFIG.firebase || {};
  return [values.apiKey, values.authDomain, values.projectId, values.appId].every(Boolean);
}

async function initializeFirebase() {
  if (!firebaseConfigReady()) {
    elements.authScreen.hidden = false;
    elements.loginMessage.textContent = "Falta copiar la configuración de Firebase en firebase-config.js.";
    elements.loginForm.querySelector("button").disabled = true;
    return;
  }

  const version = APP_CONFIG.firebaseSdkVersion || "12.17.1";
  const [appModule, authModule, storeModule] = await Promise.all([
    import(`https://www.gstatic.com/firebasejs/${version}/firebase-app.js`),
    import(`https://www.gstatic.com/firebasejs/${version}/firebase-auth.js`),
    import(`https://www.gstatic.com/firebasejs/${version}/firebase-firestore.js`)
  ]);

  const firebaseApp = appModule.initializeApp(APP_CONFIG.firebase);
  state.firebase = {
    auth: authModule.getAuth(firebaseApp),
    db: storeModule.getFirestore(firebaseApp),
    authApi: authModule,
    store: storeModule
  };

  elements.modeBadge.textContent = "Cuentas activadas";
  elements.loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    elements.loginMessage.textContent = "Entrando…";
    try {
      await authModule.signInWithEmailAndPassword(state.firebase.auth, elements.loginEmail.value.trim(), elements.loginPassword.value);
      elements.loginForm.reset();
    } catch {
      elements.loginMessage.textContent = "No se ha podido entrar. Revisa el correo y la contraseña.";
    }
  });

  elements.resetPassword.addEventListener("click", async () => {
    const email = elements.loginEmail.value.trim();
    if (!email) {
      elements.loginMessage.textContent = "Primero escribe tu correo.";
      elements.loginEmail.focus();
      return;
    }
    try {
      await authModule.sendPasswordResetEmail(state.firebase.auth, email);
      elements.loginMessage.textContent = "Te hemos enviado un correo para cambiar la contraseña.";
    } catch {
      elements.loginMessage.textContent = "No se ha podido enviar el correo. Comprueba la dirección.";
    }
  });

  const logOut = () => authModule.signOut(state.firebase.auth);
  elements.logoutButton.addEventListener("click", logOut);
  elements.pendingLogout.addEventListener("click", logOut);

  authModule.onAuthStateChanged(state.firebase.auth, handleAuthState);
}

async function handleAuthState(user) {
  state.user = user;
  if (!user) {
    state.resources = [];
    state.isAdmin = false;
    elements.app.hidden = true;
    elements.statusScreen.hidden = true;
    elements.authScreen.hidden = false;
    elements.loginMessage.textContent = "";
    return;
  }

  const { doc, getDoc, setDoc, collection, getDocs, query, where, serverTimestamp } = state.firebase.store;
  const adminSnap = await getDoc(doc(state.firebase.db, "admins", user.uid));
  state.isAdmin = adminSnap.exists();

  const userRef = doc(state.firebase.db, "users", user.uid);
  let userSnap = await getDoc(userRef);
  if (!userSnap.exists() && !state.isAdmin) {
    await setDoc(userRef, {
      email: user.email || "",
      displayName: user.displayName || user.email?.split("@")[0] || "Alumno/a",
      active: false,
      role: "student",
      createdAt: serverTimestamp()
    });
    userSnap = await getDoc(userRef);
  }

  if (!state.isAdmin && (!userSnap.exists() || userSnap.data().active !== true)) {
    showPending("Tu acceso está pendiente", "Ya tienes una cuenta. Ahora el profesor debe activarla desde el panel de administración.");
    return;
  }

  const resourceQuery = state.isAdmin
    ? collection(state.firebase.db, "resources")
    : query(collection(state.firebase.db, "resources"), where("active", "==", true));
  const resourceSnap = await getDocs(resourceQuery);
  state.resources = sortedResources(resourceSnap.docs.map((item) => ({ id: item.id, ...item.data() })));
  if (state.isAdmin && state.resources.length === 0) state.resources = await loadLocalCatalog();

  await loadCloudFavorites();
  elements.userName.textContent = user.email || "Usuario";
  elements.logoutButton.hidden = false;
  elements.adminLink.hidden = !state.isAdmin;
  showApp();
}

async function startLocalMode() {
  state.resources = (await loadLocalCatalog()).filter((item) => item.active);
  elements.modeBadge.textContent = "Modo gratuito local";
  elements.adminLink.hidden = false;
  showApp();
}

async function start() {
  bindCatalogEvents();
  loadLocalFavorites();
  try {
    if (APP_CONFIG.mode === "firebase") await initializeFirebase();
    else await startLocalMode();
  } catch (error) {
    console.error(error);
    showPending("No se ha podido cargar la web", "Revisa la conexión y los archivos de configuración.");
  }
}

start();
