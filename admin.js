import { APP_CONFIG } from "./firebase-config.js?v=20260825-1";

const CATEGORY_LABELS = {
  curriculo: "Currículo",
  repaso: "Repaso",
  programacion: "Programación",
  utilidades: "Utilidades"
};

const state = {
  resources: [],
  originalResources: [],
  firebase: null,
  user: null,
  isFirebase: APP_CONFIG.mode === "firebase"
};

const elements = {
  login: document.querySelector("#adminLogin"),
  loginForm: document.querySelector("#adminLoginForm"),
  loginEmail: document.querySelector("#adminEmail"),
  loginPassword: document.querySelector("#adminPassword"),
  loginMessage: document.querySelector("#adminLoginMessage"),
  app: document.querySelector("#adminApp"),
  modeBadge: document.querySelector("#adminModeBadge"),
  userName: document.querySelector("#adminUserName"),
  logout: document.querySelector("#adminLogout"),
  localNotice: document.querySelector("#localNotice"),
  firebaseNotice: document.querySelector("#firebaseNotice"),
  usersTabButton: document.querySelector("#usersTabButton"),
  resourcesPanel: document.querySelector("#resourcesPanel"),
  usersPanel: document.querySelector("#usersPanel"),
  resourceList: document.querySelector("#adminResourceList"),
  userList: document.querySelector("#adminUserList"),
  resourceCount: document.querySelector("#adminResourceCount"),
  newResource: document.querySelector("#newResource"),
  seedCatalog: document.querySelector("#seedCatalog"),
  resetCatalog: document.querySelector("#resetCatalog"),
  exportCatalog: document.querySelector("#exportCatalog"),
  reloadUsers: document.querySelector("#reloadUsers"),
  studentRegistrationForm: document.querySelector("#studentRegistrationForm"),
  singleEmailField: document.querySelector("#singleEmailField"),
  bulkEmailField: document.querySelector("#bulkEmailField"),
  studentEmail: document.querySelector("#studentEmail"),
  studentEmails: document.querySelector("#studentEmails"),
  studentCommonPassword: document.querySelector("#studentCommonPassword"),
  showStudentPassword: document.querySelector("#showStudentPassword"),
  registerStudents: document.querySelector("#registerStudents"),
  studentRegistrationResults: document.querySelector("#studentRegistrationResults"),
  dialog: document.querySelector("#resourceDialog"),
  dialogTitle: document.querySelector("#dialogTitle"),
  closeDialog: document.querySelector("#closeDialog"),
  cancelDialog: document.querySelector("#cancelDialog"),
  form: document.querySelector("#resourceForm"),
  originalId: document.querySelector("#resourceOriginalId"),
  id: document.querySelector("#resourceId"),
  title: document.querySelector("#resourceTitle"),
  description: document.querySelector("#resourceDescription"),
  category: document.querySelector("#resourceCategory"),
  icon: document.querySelector("#resourceIcon"),
  url: document.querySelector("#resourceUrl"),
  order: document.querySelector("#resourceOrder"),
  active: document.querySelector("#resourceActive"),
  toast: document.querySelector("#adminToast")
};

function sorted(resources) {
  return [...resources].sort((a, b) => Number(a.order || 0) - Number(b.order || 0) || a.title.localeCompare(b.title, "es"));
}

async function readOriginalCatalog() {
  const response = await fetch("./resources.json", { cache: "no-store" });
  if (!response.ok) throw new Error("No se pudo leer resources.json");
  state.originalResources = sorted(await response.json());
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.hidden = false;
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => { elements.toast.hidden = true; }, 3200);
}

function saveLocalCatalog() {
  localStorage.setItem("premir_admin_catalog_v2", JSON.stringify(state.resources));
}

function loadLocalCatalog() {
  try {
    const saved = JSON.parse(localStorage.getItem("premir_admin_catalog_v2") || "null");
    state.resources = sorted(Array.isArray(saved) ? saved : state.originalResources);
  } catch {
    state.resources = sorted(state.originalResources);
  }
}

function resourceRow(resource) {
  const row = document.createElement("article");
  row.className = "admin-row";

  const info = document.createElement("div");
  const title = document.createElement("h3");
  title.textContent = `${resource.icon || "📄"} ${resource.title}`;
  const meta = document.createElement("p");
  meta.textContent = `${CATEGORY_LABELS[resource.category] || resource.category} · ${resource.url}`;
  info.append(title, meta);

  const actions = document.createElement("div");
  actions.className = "row-actions";
  const chip = document.createElement("span");
  chip.className = `status-chip ${resource.active ? "on" : "off"}`;
  chip.textContent = resource.active ? "Visible" : "Oculto";

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "button secondary small";
  toggle.textContent = resource.active ? "Desactivar" : "Activar";
  toggle.setAttribute("aria-label", `${toggle.textContent} ${resource.title}`);
  toggle.addEventListener("click", () => toggleResource(resource));

  const edit = document.createElement("button");
  edit.type = "button";
  edit.className = "button secondary small";
  edit.textContent = "Editar";
  edit.addEventListener("click", () => openDialog(resource));
  actions.append(chip, toggle, edit);
  row.append(info, actions);
  return row;
}

function renderResources() {
  state.resources = sorted(state.resources);
  elements.resourceCount.textContent = String(state.resources.length);
  elements.resourceList.replaceChildren(...state.resources.map(resourceRow));
  elements.seedCatalog.hidden = !state.isFirebase || state.resources.length > 0;
}

function openDialog(resource = null) {
  elements.form.reset();
  elements.dialogTitle.textContent = resource ? "Editar recurso" : "Añadir recurso";
  elements.originalId.value = resource?.id || "";
  elements.id.value = resource?.id || "";
  elements.id.disabled = Boolean(resource);
  elements.title.value = resource?.title || "";
  elements.description.value = resource?.description || "";
  elements.category.value = resource?.category || "repaso";
  elements.icon.value = resource?.icon || "📄";
  elements.url.value = resource?.url || "";
  elements.order.value = Number(resource?.order ?? (state.resources.length + 1) * 10);
  elements.active.checked = resource?.active ?? true;
  elements.dialog.showModal();
}

function closeDialog() {
  elements.dialog.close();
  elements.id.disabled = false;
}

function formResource() {
  return {
    id: elements.originalId.value || elements.id.value.trim(),
    title: elements.title.value.trim(),
    description: elements.description.value.trim(),
    category: elements.category.value,
    icon: elements.icon.value.trim() || "📄",
    url: elements.url.value.trim(),
    active: elements.active.checked,
    order: Number(elements.order.value || 0)
  };
}

async function saveResource(resource) {
  if (state.isFirebase) {
    const { doc, setDoc, serverTimestamp } = state.firebase.store;
    const existing = state.resources.some((item) => item.id === resource.id);
    const payload = { ...resource, updatedAt: serverTimestamp() };
    delete payload.id;
    if (!existing) payload.createdAt = serverTimestamp();
    await setDoc(doc(state.firebase.db, "resources", resource.id), payload, { merge: true });
    await loadFirebaseResources();
  } else {
    const index = state.resources.findIndex((item) => item.id === resource.id);
    if (index >= 0) state.resources[index] = resource;
    else state.resources.push(resource);
    saveLocalCatalog();
    renderResources();
  }
  showToast("Recurso guardado");
}

async function toggleResource(resource) {
  const nextActive = !resource.active;
  if (state.isFirebase) {
    const { doc, updateDoc, serverTimestamp } = state.firebase.store;
    await updateDoc(doc(state.firebase.db, "resources", resource.id), {
      active: nextActive,
      updatedAt: serverTimestamp()
    });
    await loadFirebaseResources();
  } else {
    resource.active = nextActive;
    saveLocalCatalog();
    renderResources();
  }
  showToast(nextActive ? "Recurso activado" : "Recurso desactivado");
}

function exportCatalog() {
  const clean = sorted(state.resources).map(({ id, title, description, category, icon, url, active, order }) => ({
    id, title, description, category, icon, url, active, order
  }));
  const blob = new Blob([`${JSON.stringify(clean, null, 2)}\n`], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "resources.json";
  link.click();
  URL.revokeObjectURL(link.href);
  showToast("Catálogo descargado");
}

async function writeOriginalCatalogToFirebase() {
  const { doc, setDoc, serverTimestamp } = state.firebase.store;
  await Promise.all(state.originalResources.map((resource) => {
    const payload = { ...resource, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
    delete payload.id;
    return setDoc(doc(state.firebase.db, "resources", resource.id), payload, { merge: true });
  }));
  await loadFirebaseResources();
  showToast("Los 32 recursos ya están en Firebase");
}

async function resetCatalog() {
  if (state.isFirebase) {
    await writeOriginalCatalogToFirebase();
  } else {
    state.resources = structuredClone(state.originalResources);
    saveLocalCatalog();
    renderResources();
    showToast("Catálogo original recuperado");
  }
}

function userRow(user) {
  const row = document.createElement("article");
  row.className = "admin-row";
  const info = document.createElement("div");
  const title = document.createElement("h3");
  title.textContent = user.displayName || user.email || "Usuario";
  const meta = document.createElement("p");
  meta.textContent = `${user.email || "Sin correo"} · ${user.id}`;
  info.append(title, meta);

  const actions = document.createElement("div");
  actions.className = "row-actions";
  const chip = document.createElement("span");
  chip.className = `status-chip ${user.active ? "on" : "off"}`;
  chip.textContent = user.active ? "Activo" : "Pendiente";
  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "button secondary small";
  toggle.textContent = user.active ? "Quitar acceso" : "Dar acceso";
  toggle.addEventListener("click", () => toggleUser(user));
  actions.append(chip, toggle);
  row.append(info, actions);
  return row;
}

async function loadUsers() {
  if (!state.isFirebase) return;
  const { collection, getDocs } = state.firebase.store;
  const snapshot = await getDocs(collection(state.firebase.db, "users"));
  const users = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
    .sort((a, b) => String(a.email || "").localeCompare(String(b.email || ""), "es"));
  elements.userList.replaceChildren(...users.map(userRow));
  if (!users.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "Todavía no hay alumnado pendiente o activo.";
    elements.userList.replaceChildren(empty);
  }
}

function selectedRegistrationMode() {
  return document.querySelector('input[name="studentMode"]:checked')?.value || "single";
}

function updateRegistrationMode() {
  const bulk = selectedRegistrationMode() === "bulk";
  elements.singleEmailField.hidden = bulk;
  elements.bulkEmailField.hidden = !bulk;
  elements.studentEmail.required = !bulk;
  elements.studentEmails.required = bulk;
  elements.studentRegistrationResults.hidden = true;
}

function parseStudentEmails() {
  const source = selectedRegistrationMode() === "bulk"
    ? elements.studentEmails.value
    : elements.studentEmail.value;
  return [...new Set(source
    .split(/[\s,;]+/)
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean))];
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function registrationErrorMessage(error) {
  const messages = {
    "auth/email-already-in-use": "ya existe y no usa la contraseña común",
    "auth/invalid-credential": "ya existe y no usa la contraseña común",
    "auth/wrong-password": "ya existe y no usa la contraseña común",
    "auth/invalid-email": "el correo no es válido",
    "auth/weak-password": "la contraseña común es demasiado corta",
    "auth/too-many-requests": "Firebase ha pedido esperar un poco antes de continuar",
    "auth/operation-not-allowed": "el acceso por correo no está activado"
  };
  return messages[error?.code] || "no se ha podido registrar";
}

function showRegistrationResults(results) {
  const errors = results.filter((item) => !item.ok);
  elements.studentRegistrationResults.classList.toggle("has-errors", errors.length > 0);
  elements.studentRegistrationResults.textContent = results
    .map((item) => `${item.ok ? "✓" : "✗"} ${item.email} — ${item.message}`)
    .join("\n");
  elements.studentRegistrationResults.hidden = false;
}

async function registerStudents(event) {
  event.preventDefault();
  if (!state.isFirebase || !state.firebase) return;

  const emails = parseStudentEmails();
  const invalidEmails = emails.filter((email) => !validEmail(email));
  if (!emails.length || invalidEmails.length) {
    showRegistrationResults((invalidEmails.length ? invalidEmails : ["Escribe al menos un correo"])
      .map((email) => ({ email, ok: false, message: invalidEmails.length ? "el correo no es válido" : "falta el correo" })));
    return;
  }

  const password = elements.studentCommonPassword.value;
  if (password.length < 6) {
    showRegistrationResults([{ email: "Contraseña", ok: false, message: "debe tener al menos 6 caracteres" }]);
    return;
  }

  elements.registerStudents.disabled = true;
  elements.registerStudents.textContent = `Registrando 0 de ${emails.length}…`;
  elements.studentRegistrationResults.hidden = true;

  const secondaryName = `student-registration-${Date.now()}`;
  const secondaryApp = state.firebase.appApi.initializeApp(APP_CONFIG.firebase, secondaryName);
  const secondaryAuth = state.firebase.authApi.getAuth(secondaryApp);
  const { doc, setDoc, serverTimestamp } = state.firebase.store;
  const results = [];

  try {
    for (const [index, email] of emails.entries()) {
      elements.registerStudents.textContent = `Registrando ${index + 1} de ${emails.length}…`;
      let credential;
      let created = true;

      try {
        try {
          credential = await state.firebase.authApi.createUserWithEmailAndPassword(secondaryAuth, email, password);
        } catch (error) {
          if (error?.code !== "auth/email-already-in-use") throw error;
          created = false;
          credential = await state.firebase.authApi.signInWithEmailAndPassword(secondaryAuth, email, password);
        }
        const payload = {
          email,
          displayName: email.split("@")[0],
          active: true,
          role: "student",
          updatedAt: serverTimestamp()
        };
        if (created) payload.createdAt = serverTimestamp();
        await setDoc(doc(state.firebase.db, "users", credential.user.uid), payload, { merge: true });
        results.push({ email, ok: true, message: created ? "registrado y con acceso" : "ya existía; acceso activado" });
      } catch (error) {
        results.push({ email, ok: false, message: registrationErrorMessage(error) });
      } finally {
        await state.firebase.authApi.signOut(secondaryAuth).catch(() => {});
      }
    }
  } finally {
    await state.firebase.appApi.deleteApp(secondaryApp).catch(() => {});
    elements.studentCommonPassword.value = "";
    elements.showStudentPassword.checked = false;
    elements.studentCommonPassword.type = "password";
    elements.registerStudents.disabled = false;
    elements.registerStudents.textContent = "Registrar alumnado";
  }

  showRegistrationResults(results);
  if (results.every((item) => item.ok)) {
    elements.studentEmail.value = "";
    elements.studentEmails.value = "";
  }
  await loadUsers();
}

async function toggleUser(user) {
  const nextActive = !user.active;
  const { doc, updateDoc, serverTimestamp } = state.firebase.store;
  await updateDoc(doc(state.firebase.db, "users", user.id), {
    active: nextActive,
    updatedAt: serverTimestamp()
  });
  await loadUsers();
  showToast(nextActive ? "Acceso concedido" : "Acceso retirado");
}

async function loadFirebaseResources() {
  const { collection, getDocs } = state.firebase.store;
  const snapshot = await getDocs(collection(state.firebase.db, "resources"));
  state.resources = sorted(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
  renderResources();
}

function firebaseConfigReady() {
  const values = APP_CONFIG.firebase || {};
  return [values.apiKey, values.authDomain, values.projectId, values.appId].every(Boolean);
}

async function startFirebase() {
  if (!firebaseConfigReady()) {
    elements.login.hidden = false;
    elements.loginMessage.textContent = "Falta copiar la configuración en firebase-config.js.";
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
    appApi: appModule,
    authApi: authModule,
    store: storeModule
  };

  elements.loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    elements.loginMessage.textContent = "Entrando…";
    try {
      await authModule.signInWithEmailAndPassword(state.firebase.auth, elements.loginEmail.value.trim(), elements.loginPassword.value);
    } catch {
      elements.loginMessage.textContent = "No se ha podido entrar. Revisa el correo y la contraseña.";
    }
  });
  elements.logout.addEventListener("click", () => authModule.signOut(state.firebase.auth));

  authModule.onAuthStateChanged(state.firebase.auth, async (user) => {
    state.user = user;
    if (!user) {
      elements.app.hidden = true;
      elements.login.hidden = false;
      return;
    }

    const { doc, getDoc } = state.firebase.store;
    const adminSnap = await getDoc(doc(state.firebase.db, "admins", user.uid));
    if (!adminSnap.exists()) {
      elements.login.hidden = false;
      elements.loginMessage.textContent = "Esta cuenta no es administradora.";
      await authModule.signOut(state.firebase.auth);
      return;
    }

    elements.login.hidden = true;
    elements.app.hidden = false;
    elements.localNotice.hidden = true;
    elements.firebaseNotice.hidden = false;
    elements.modeBadge.textContent = "Firebase gratuito";
    elements.userName.textContent = user.email || "Administrador";
    elements.logout.hidden = false;
    elements.usersTabButton.hidden = false;
    elements.exportCatalog.hidden = false;
    await loadFirebaseResources();
  });
}

function bindEvents() {
  elements.newResource.addEventListener("click", () => openDialog());
  elements.closeDialog.addEventListener("click", closeDialog);
  elements.cancelDialog.addEventListener("click", closeDialog);
  elements.form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const resource = formResource();
    if (!resource.id || !resource.title || !resource.url) return;
    await saveResource(resource);
    closeDialog();
  });
  elements.exportCatalog.addEventListener("click", exportCatalog);
  elements.resetCatalog.addEventListener("click", resetCatalog);
  elements.seedCatalog.addEventListener("click", writeOriginalCatalogToFirebase);
  elements.reloadUsers.addEventListener("click", loadUsers);
  elements.studentRegistrationForm.addEventListener("submit", registerStudents);
  document.querySelectorAll('input[name="studentMode"]').forEach((input) => {
    input.addEventListener("change", updateRegistrationMode);
  });
  elements.showStudentPassword.addEventListener("change", () => {
    elements.studentCommonPassword.type = elements.showStudentPassword.checked ? "text" : "password";
  });
  updateRegistrationMode();

  document.querySelector(".admin-tabs").addEventListener("click", async (event) => {
    const button = event.target.closest("[data-admin-tab]");
    if (!button) return;
    const tab = button.dataset.adminTab;
    document.querySelectorAll("[data-admin-tab]").forEach((item) => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    elements.resourcesPanel.hidden = tab !== "resources";
    elements.usersPanel.hidden = tab !== "users";
    if (tab === "users") await loadUsers();
  });
}

async function start() {
  bindEvents();
  try {
    await readOriginalCatalog();
    if (state.isFirebase) await startFirebase();
    else {
      loadLocalCatalog();
      elements.app.hidden = false;
      renderResources();
    }
  } catch (error) {
    console.error(error);
    elements.login.hidden = false;
    elements.loginMessage.textContent = "No se ha podido cargar el panel.";
  }
}

start();
