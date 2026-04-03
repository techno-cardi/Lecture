import * as pdfjsLib from "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.6.205/build/pdf.min.mjs";

const CONFIG = window.READER_CONFIG || {};
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${CONFIG.pdfJsVersion || "5.6.205"}/build/pdf.worker.min.mjs`;

const FONT_CLASSES = ["font-small", "font-medium", "font-large", "font-xlarge"];
const DEFAULT_PREFS = {
  fontIndex: 1,
  theme: "paper",
  preferredMode: CONFIG.defaultReaderMode || "text",
  showTopProgress: false,
  progressDisplayMode: "percent"
};
const ADMIN_UPLOAD_CHUNK_SIZE = Number(CONFIG.adminUploadChunkSize) > 0 ? Number(CONFIG.adminUploadChunkSize) : 90000;

const STORAGE_KEYS = {
  rememberedEmail: `${CONFIG.appName || "reader"}:remembered-email`,
  rememberedFlag: `${CONFIG.appName || "reader"}:remember-flag`,
  session: `${CONFIG.appName || "reader"}:session`,
  persistentSession: `${CONFIG.appName || "reader"}:persistent-session`
};

const ADMIN_EMAIL = normalizeEmail(CONFIG.adminEmail || "tremblay.kevin@cscapitale.qc.ca");

const dom = {
  gate: document.getElementById("gate"),
  library: document.getElementById("library"),
  reader: document.getElementById("reader"),
  loginForm: document.getElementById("loginForm"),
  emailInput: document.getElementById("emailInput"),
  rememberMeInput: document.getElementById("rememberMeInput"),
  loginBtn: document.getElementById("loginBtn"),
  gateMessage: document.getElementById("gateMessage"),
  gateLoading: document.getElementById("gateLoading"),
  gateLoadingText: document.getElementById("gateLoadingText"),
  libraryMeta: document.getElementById("libraryMeta"),
  bookList: document.getElementById("bookList"),
  refreshBooksBtn: document.getElementById("refreshBooksBtn"),
  logoutBtn: document.getElementById("logoutBtn"),
  adminPanel: document.getElementById("adminPanel"),
  adminLockRow: document.querySelector("#adminPanel .admin-lock-row"),
  adminCodeInput: document.getElementById("adminCodeInput"),
  unlockAdminBtn: document.getElementById("unlockAdminBtn"),
  publishForm: document.getElementById("publishForm"),
  bookTitleInput: document.getElementById("bookTitleInput"),
  bookIdInput: document.getElementById("bookIdInput"),
  bookAuthorInput: document.getElementById("bookAuthorInput"),
  bookPdfInput: document.getElementById("bookPdfInput"),
  bookCoverInput: document.getElementById("bookCoverInput"),
  allowPdfModeInput: document.getElementById("allowPdfModeInput"),
  publishNowInput: document.getElementById("publishNowInput"),
  publishBtn: document.getElementById("publishBtn"),
  publishStatus: document.getElementById("publishStatus"),
  publishProgress: document.getElementById("publishProgress"),
  adminBooksList: document.getElementById("adminBooksList"),
  reloadAdminBooksBtn: document.getElementById("reloadAdminBooksBtn"),
  backToLibraryBtn: document.getElementById("backToLibraryBtn"),
  menuToggle: document.getElementById("menuToggle"),
  menuBackdrop: document.getElementById("menuBackdrop"),
  controlPanel: document.getElementById("controlPanel"),
  closeMenuBtn: document.getElementById("closeMenuBtn"),
  docLabel: document.getElementById("docLabel"),
  pageLabel: document.getElementById("pageLabel"),
  progressText: document.getElementById("progressText"),
  progressBar: document.getElementById("progressBar"),
  prevBtn: document.getElementById("prevBtn"),
  nextBtn: document.getElementById("nextBtn"),
  pageInput: document.getElementById("pageInput"),
  goBtn: document.getElementById("goBtn"),
  modeToggleBtn: document.getElementById("modeToggleBtn"),
  fitBtn: document.getElementById("fitBtn"),
  textSizeBtn: document.getElementById("textSizeBtn"),
  bookmarkBtn: document.getElementById("bookmarkBtn"),
  bookmarkList: document.getElementById("bookmarkList"),
  saveBtn: document.getElementById("saveBtn"),
  themeBtn: document.getElementById("themeBtn"),
  saveStatus: document.getElementById("saveStatus"),
  noteInput: document.getElementById("pageNoteInput"),
  saveNoteBtn: document.getElementById("saveNoteBtn"),
  noteStatus: document.getElementById("noteStatus"),
  showTopProgressInput: document.getElementById("showTopProgressInput"),
  installAppBtn: document.getElementById("installAppBtn"),
  viewerShell: document.getElementById("viewerShell"),
  readingSurface: document.getElementById("readingSurface"),
  textViewer: document.getElementById("textViewer"),
  pdfViewer: document.getElementById("pdfViewer"),
  pdfCanvas: document.getElementById("pdfCanvas"),
  bottomNav: document.getElementById("bottomNav"),
  bottomPrevBtn: document.getElementById("bottomPrevBtn"),
  bottomNextBtn: document.getElementById("bottomNextBtn"),
  bottomPageBtn: document.getElementById("bottomPageBtn"),
  topProgressWrap: document.getElementById("topProgressWrap"),
  topProgressBar: document.getElementById("topProgressBar"),
  topProgressText: document.getElementById("topProgressText"),
  loadingOverlay: document.getElementById("loadingOverlay"),
  loadingOverlayText: document.getElementById("loadingOverlayText"),
  modalBackdrop: document.getElementById("modalBackdrop"),
  textSizeModal: document.getElementById("textSizeModal"),
  textSizeModalTitle: document.getElementById("textSizeModalTitle"),
  textSizeModalDesc: document.getElementById("textSizeModalDesc"),
  closeTextSizeModalBtn: document.getElementById("closeTextSizeModalBtn"),
  decreaseTextBtn: document.getElementById("decreaseTextBtn"),
  increaseTextBtn: document.getElementById("increaseTextBtn"),
  installModal: document.getElementById("installModal"),
  installModalContent: document.getElementById("installModalContent"),
  closeInstallModalBtn: document.getElementById("closeInstallModalBtn"),
  toast: document.getElementById("toast")
};

const state = {
  email: "",
  rememberMe: CONFIG.rememberEmail !== false,
  isAdminCandidate: false,
  adminUnlocked: false,
  adminCode: "",
  books: [],
  currentBook: null,
  currentPage: 1,
  totalPages: 0,
  pdfDoc: null,
  textDoc: null,
  mode: DEFAULT_PREFS.preferredMode,
  prefs: { ...DEFAULT_PREFS },
  bookmarks: [],
  notesMap: {},
  pdfZoom: 1,
  fitPdfScale: 1,
  renderToken: 0,
  saveTimer: null,
  prefsTimer: null,
  noteTimer: null,
  lastSaveSignature: "",
  toastTimer: null,
  swipeStart: null,
  deferredInstallPrompt: null,
  localPdfPageFallbacks: new Set()
};

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function showToast(message, duration = 2200) {
  if (!message) return;
  dom.toast.textContent = message;
  dom.toast.hidden = false;
  if (state.toastTimer) window.clearTimeout(state.toastTimer);
  state.toastTimer = window.setTimeout(() => {
    dom.toast.hidden = true;
  }, duration);
}

function setGateMessage(message, type = "") {
  dom.gateMessage.textContent = message || "";
  dom.gateMessage.className = "gate-message" + (type ? ` ${type}` : "");
}

function setGateLoading(visible, message = "") {
  dom.gateLoading.hidden = !visible;
  if (message) dom.gateLoadingText.textContent = message;
}

function setReaderLoading(visible, message = "") {
  dom.loadingOverlay.hidden = !visible;
  if (message) dom.loadingOverlayText.textContent = message;
}

function setSaveStatus(message, positive = false) {
  dom.saveStatus.textContent = message;
  dom.saveStatus.style.color = positive ? "var(--success)" : "";
}

function setPublishStatus(message, positive = false) {
  dom.publishStatus.textContent = message;
  dom.publishStatus.style.color = positive ? "var(--success)" : "";
}

function ensurePublishProgressUi() {
  if (dom.publishProgressBarWrap) return;

  if (!document.getElementById("publishProgressUiStyle")) {
    const style = document.createElement("style");
    style.id = "publishProgressUiStyle";
    style.textContent = `
      .publish-progress-wrap { margin: 0.45rem 0 0.6rem; }
      .publish-progress-track { width: 100%; height: 12px; border-radius: 999px; background: rgba(15, 23, 42, 0.08); overflow: hidden; }
      .publish-progress-fill { height: 100%; width: 0%; border-radius: inherit; background: linear-gradient(90deg, #2952d1 0%, #5b7cff 100%); transition: width 0.18s ease; }
      .publish-progress-meta { display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; margin-top: 0.35rem; font-size: 0.95rem; color: #40516f; }
      .publish-progress-stage { font-weight: 600; }
      .publish-progress-percent { font-variant-numeric: tabular-nums; white-space: nowrap; }
    `;
    document.head.appendChild(style);
  }

  const wrap = document.createElement("div");
  wrap.className = "publish-progress-wrap";
  wrap.hidden = true;
  wrap.innerHTML = `
    <div class="publish-progress-track" aria-hidden="true">
      <div class="publish-progress-fill"></div>
    </div>
    <div class="publish-progress-meta">
      <span class="publish-progress-stage"></span>
      <span class="publish-progress-percent">0 %</span>
    </div>
  `;

  dom.publishProgress.insertAdjacentElement("beforebegin", wrap);
  dom.publishProgressBarWrap = wrap;
  dom.publishProgressFill = wrap.querySelector(".publish-progress-fill");
  dom.publishProgressStage = wrap.querySelector(".publish-progress-stage");
  dom.publishProgressPercent = wrap.querySelector(".publish-progress-percent");
}

function setPublishProgressUi({ visible = true, percent = 0, stage = "", detail = undefined } = {}) {
  ensurePublishProgressUi();
  const boundedPercent = Math.max(0, Math.min(100, Number(percent) || 0));
  dom.publishProgressBarWrap.hidden = !visible;
  dom.publishProgressFill.style.width = `${boundedPercent}%`;
  dom.publishProgressPercent.textContent = `${boundedPercent.toFixed(boundedPercent >= 10 ? 0 : 1)} %`;
  dom.publishProgressStage.textContent = stage || "";
  if (detail !== undefined) dom.publishProgress.textContent = detail || "";
}

function hidePublishProgressUi(detail = "") {
  ensurePublishProgressUi();
  dom.publishProgressBarWrap.hidden = true;
  dom.publishProgressFill.style.width = "0%";
  dom.publishProgressPercent.textContent = "0 %";
  dom.publishProgressStage.textContent = "";
  dom.publishProgress.textContent = detail;
}

function switchScreen(screen) {
  dom.gate.hidden = screen !== "gate";
  dom.library.hidden = screen !== "library";
  dom.reader.hidden = screen !== "reader";
}

function toggleMenu(open) {
  const shouldOpen = typeof open === "boolean" ? open : dom.controlPanel.hidden;
  dom.controlPanel.hidden = !shouldOpen;
  dom.menuBackdrop.hidden = !shouldOpen;
  dom.menuToggle.setAttribute("aria-expanded", String(shouldOpen));
}

function updateAdminLockUi(message = "") {
  if (dom.adminLockRow) dom.adminLockRow.hidden = !!state.adminUnlocked;
  dom.publishForm.hidden = !state.adminUnlocked;
  dom.adminCodeInput.readOnly = !!state.adminUnlocked;
  if (state.adminUnlocked) dom.adminCodeInput.blur();
  if (message) setPublishStatus(message, state.adminUnlocked);
}

function renderAdminLoading(message = "Chargement de la liste des livres...") {
  dom.adminBooksList.innerHTML = `<div class="empty-state">${escapeHtml(message)}</div>`;
}

function inferAdminCandidateFromEmail(email) {
  return normalizeEmail(email) === ADMIN_EMAIL;
}

function ensureBlocksArray(value) {
  if (Array.isArray(value)) {
    return value
      .filter(Boolean)
      .map((block) => {
        if (typeof block === "string") return { type: "paragraph", text: String(block).trim() };
        if (block && typeof block === "object") {
          return {
            type: String(block.type || "paragraph"),
            text: String(block.text || "").trim()
          };
        }
        return null;
      })
      .filter((block) => block && block.text);
  }
  if (!value) return [];
  if (typeof value === "string") return extractPageTextFromRawString(value);
  if (value && typeof value === "object") {
    if (Array.isArray(value.blocks)) return ensureBlocksArray(value.blocks);
    if (typeof value.text === "string") return extractPageTextFromRawString(value.text);
  }
  return [];
}

function openModal(modal) {
  dom.modalBackdrop.hidden = false;
  modal.hidden = false;
}

function closeModal(modal) {
  modal.hidden = true;
  if (dom.textSizeModal.hidden && dom.installModal.hidden) {
    dom.modalBackdrop.hidden = true;
  }
}

function rebuildReadingSurfaceClasses() {
  dom.readingSurface.classList.remove("theme-paper", "theme-night", ...FONT_CLASSES);
  dom.readingSurface.classList.add(`theme-${state.prefs.theme}`, FONT_CLASSES[state.prefs.fontIndex]);
}

function buildJsonpUrl(action, params = {}) {
  const url = new URL(CONFIG.appsScriptUrl);
  const prefix = `cb_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  url.searchParams.set("action", action);
  url.searchParams.set("prefix", prefix);
  url.searchParams.set("_ts", String(Date.now()));
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  return { url: url.toString(), prefix };
}

function jsonp(action, params = {}) {
  return new Promise((resolve, reject) => {
    const { url, prefix } = buildJsonpUrl(action, params);
    const script = document.createElement("script");
    let settled = false;

    function cleanup() {
      delete window[prefix];
      script.remove();
    }

    window[prefix] = (payload) => {
      settled = true;
      cleanup();
      resolve(payload);
    };

    script.onerror = () => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error("Erreur réseau Apps Script."));
    };

    script.src = url;
    document.body.appendChild(script);

    window.setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error("Délai dépassé."));
    }, 20000);
  });
}

async function auth(email) {
  return jsonp("auth", { email });
}

async function listBooks(adminMode = state.adminUnlocked) {
  return jsonp("listBooks", {
    email: state.email,
    adminCode: adminMode ? state.adminCode : ""
  }).then((response) => {
    if (!response?.ok) throw new Error(response?.message || "Impossible de charger la bibliothèque.");
    if (adminMode && response.adminAuthorized !== true) {
      state.adminUnlocked = false;
      state.adminCode = "";
      dom.adminCodeInput.value = "";
      updateAdminLockUi("Le mode administrateur a été reverrouillé.");
      persistSession();
    }
    state.books = Array.isArray(response?.books) ? response.books : [];
    cacheBooks(state.books, adminMode);
    return state.books;
  });
}

async function fetchProgress(bookId) {
  const response = await jsonp("getProgress", { email: state.email, bookId });
  return response?.ok ? response.progress || null : null;
}

async function fetchPreferences(bookId) {
  const response = await jsonp("getPreferences", { email: state.email, bookId });
  return response?.ok ? response.preferences || null : null;
}

async function fetchBookmarks(bookId) {
  const response = await jsonp("listBookmarks", { email: state.email, bookId });
  return response?.ok ? response.bookmarks || [] : [];
}

async function fetchNotes(bookId) {
  const response = await jsonp("listNotes", { email: state.email, bookId });
  return response?.ok ? response.notes || [] : [];
}

function localKey(prefix, bookId = state.currentBook?.bookId || "") {
  return `${CONFIG.appName || "reader"}:${prefix}:${state.email}:${bookId}`;
}

function saveLocalJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(error);
  }
}

function loadLocalJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function persistSession() {
  const payload = {
    email: state.email,
    rememberMe: !!state.rememberMe,
    currentBookId: state.currentBook?.bookId || "",
    currentPage: state.currentPage,
    mode: state.mode,
    adminUnlocked: !!state.adminUnlocked,
    adminCode: state.adminUnlocked ? state.adminCode : ""
  };
  try {
    sessionStorage.setItem(STORAGE_KEYS.session, JSON.stringify(payload));
    if (state.rememberMe) localStorage.setItem(STORAGE_KEYS.persistentSession, JSON.stringify(payload));
    else localStorage.removeItem(STORAGE_KEYS.persistentSession);
  } catch (error) {
    console.warn(error);
  }
}

function clearSessionStorage() {
  try {
    sessionStorage.removeItem(STORAGE_KEYS.session);
    localStorage.removeItem(STORAGE_KEYS.persistentSession);
  } catch (error) {
    console.warn(error);
  }
}

function readSavedSession() {
  try {
    const sessionValue = sessionStorage.getItem(STORAGE_KEYS.session);
    if (sessionValue) return JSON.parse(sessionValue);
    const persistentValue = localStorage.getItem(STORAGE_KEYS.persistentSession);
    return persistentValue ? JSON.parse(persistentValue) : null;
  } catch {
    return null;
  }
}

function rememberEmail(email) {
  try {
    if (state.rememberMe) {
      localStorage.setItem(STORAGE_KEYS.rememberedEmail, email);
      localStorage.setItem(STORAGE_KEYS.rememberedFlag, "true");
    } else {
      localStorage.removeItem(STORAGE_KEYS.rememberedEmail);
      localStorage.setItem(STORAGE_KEYS.rememberedFlag, "false");
    }
  } catch (error) {
    console.warn(error);
  }
}

function loadRememberedEmail() {
  try {
    return localStorage.getItem(STORAGE_KEYS.rememberedEmail) || "";
  } catch {
    return "";
  }
}

function loadRememberedFlag() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.rememberedFlag);
    return raw === null ? state.rememberMe : raw === "true";
  } catch {
    return state.rememberMe;
  }
}

function clearRememberedIdentity() {
  try {
    localStorage.removeItem(STORAGE_KEYS.rememberedEmail);
  } catch (error) {
    console.warn(error);
  }
}

function booksCacheKey(adminMode = state.adminUnlocked) {
  return `${CONFIG.appName || "reader"}:books-cache:${state.email}:${adminMode ? "admin" : "public"}`;
}

function readCachedBooks(adminMode = state.adminUnlocked) {
  const payload = loadLocalJson(booksCacheKey(adminMode), null);
  if (!payload || !Array.isArray(payload.books)) return [];
  return payload.books;
}

function cacheBooks(books = state.books, adminMode = state.adminUnlocked) {
  if (!state.email || !Array.isArray(books)) return;
  saveLocalJson(booksCacheKey(adminMode), { savedAt: Date.now(), books });
  const publicBooks = books.filter((book) => book && book.published);
  saveLocalJson(booksCacheKey(false), { savedAt: Date.now(), books: publicBooks });
}

function mergeBookInState(book) {
  if (!book?.bookId) return;
  const next = state.books.filter((item) => item.bookId !== book.bookId);
  next.push(book);
  state.books = next.sort((a, b) => String(a.title || '').localeCompare(String(b.title || '')));
  cacheBooks(state.books, state.adminUnlocked);
}

function getBookById(bookId) {
  return state.books.find((book) => book.bookId === bookId) || null;
}

function computePublicAssetUrl(path) {
  if (!path) return "";
  return `./${String(path).replace(/^\.\//, "").replace(/^\//, "")}`;
}

function bookCoverMarkup(book, className = "book-cover") {
  if (book.coverPath) {
    return `<div class="${className}"><img src="${escapeHtml(computePublicAssetUrl(book.coverPath))}" alt="Couverture de ${escapeHtml(book.title)}"></div>`;
  }
  return `<div class="cover-placeholder" aria-hidden="true">📘</div>`;
}

function renderBookList() {
  dom.libraryMeta.textContent = state.isAdminCandidate ? `${state.email} - mode administrateur disponible` : state.email;
  const books = state.books.filter((book) => book.published || state.adminUnlocked);
  if (!books.length) {
    dom.bookList.innerHTML = `<div class="empty-state">Aucun livre publié pour le moment.</div>`;
    return;
  }

  dom.bookList.innerHTML = books.map((book) => `
    <article class="book-card">
      ${bookCoverMarkup(book, "book-cover")}
      <div>
        <div class="badge ${book.published ? "published" : "hidden"}">${book.published ? "Publié" : "Non publié"}</div>
        <h3>${escapeHtml(book.title)}</h3>
        <p>${book.author ? escapeHtml(book.author) : "Auteur non indiqué"}</p>
        <p>${book.totalPages ? `${book.totalPages} pages` : "Nombre de pages inconnu"}</p>
        <p>${book.allowPdfMode ? '<span class="badge pdf-badge">Mode PDF autorisé</span>' : '<span class="badge">Lecture texte</span>'}</p>
        <div class="book-actions">
          <button class="nav-btn" type="button" data-open-book="${escapeHtml(book.bookId)}">Ouvrir</button>
        </div>
      </div>
    </article>
  `).join("");
}

function renderAdminBooks() {
  if (!state.adminUnlocked) {
    dom.adminBooksList.innerHTML = `<div class="empty-state">Entre le code administrateur pour gérer les livres.</div>`;
    return;
  }
  if (!state.books.length) {
    dom.adminBooksList.innerHTML = `<div class="empty-state">Aucun livre enregistré.</div>`;
    return;
  }

  dom.adminBooksList.innerHTML = state.books.map((book) => `
    <article class="admin-book-card">
      ${bookCoverMarkup(book, "admin-book-cover")}
      <div>
        <div class="badge ${book.published ? "published" : "hidden"}">${book.published ? "Publié" : "Masqué"}</div>
        <h4>${escapeHtml(book.title)}</h4>
        <p><strong>ID:</strong> ${escapeHtml(book.bookId)}</p>
        <p><strong>JSON:</strong> ${book.jsonPath ? "Oui" : "Non"}</p>
        <p><strong>PDF élèves:</strong> ${book.allowPdfMode ? "Autorisé" : "Désactivé"}</p>
        <p><strong>Dernière publication:</strong> ${escapeHtml(book.lastPublishedAt || "N/A")}</p>
        <div class="admin-book-actions">
          <button class="secondary-btn" type="button" data-open-book="${escapeHtml(book.bookId)}">Ouvrir</button>
          <button class="ghost-btn" type="button" data-toggle-book="${escapeHtml(book.bookId)}">${book.published ? "Retirer" : "Publier"}</button>
          <button class="ghost-btn" type="button" data-toggle-pdf="${escapeHtml(book.bookId)}">${book.allowPdfMode ? "Désactiver PDF" : "Activer PDF"}</button>
          <button class="ghost-btn" type="button" data-delete-book="${escapeHtml(book.bookId)}">Supprimer</button>
        </div>
      </div>
    </article>
  `).join("");
}

function normalizeNoteRows(rows) {
  const notesMap = {};
  rows.forEach((row) => {
    if (!row) return;
    notesMap[String(row.page)] = row.noteText || "";
  });
  return notesMap;
}

function cacheCurrentBookData() {
  if (!state.currentBook) return;
  saveLocalJson(localKey("prefs"), state.prefs);
  saveLocalJson(localKey("bookmarks"), state.bookmarks);
  saveLocalJson(localKey("notes"), state.notesMap);
}

function readCachedPrefs(bookId) {
  return loadLocalJson(localKey("prefs", bookId), null);
}

function readCachedBookmarks(bookId) {
  return loadLocalJson(localKey("bookmarks", bookId), []);
}

function readCachedNotes(bookId) {
  return loadLocalJson(localKey("notes", bookId), {});
}

function updateUiLabels() {
  const totalPages = state.totalPages || 0;
  dom.pageLabel.textContent = `Page ${state.currentPage} / ${totalPages}`;
  dom.pageInput.value = String(state.currentPage || 1);
  const progressPercent = totalPages ? Math.round((state.currentPage / totalPages) * 1000) / 10 : 0;
  const progressText = state.prefs.progressDisplayMode === "pages"
    ? `${state.currentPage} / ${totalPages} pages`
    : `${progressPercent} %`;
  dom.progressText.textContent = progressText;
  dom.topProgressText.textContent = progressText;
  dom.progressBar.style.width = `${Math.max(0, Math.min(100, progressPercent))}%`;
  dom.topProgressBar.style.width = `${Math.max(0, Math.min(100, progressPercent))}%`;
  dom.bottomPageBtn.textContent = `${state.currentPage} / ${totalPages}`;
  dom.docLabel.textContent = state.currentBook?.title || "Document";
  dom.prevBtn.disabled = state.currentPage <= 1;
  dom.nextBtn.disabled = state.currentPage >= totalPages;
  dom.bottomPrevBtn.disabled = state.currentPage <= 1;
  dom.bottomNextBtn.disabled = state.currentPage >= totalPages;
  dom.bottomNav.hidden = !state.currentBook;
  dom.topProgressWrap.hidden = !state.prefs.showTopProgress;
  dom.showTopProgressInput.checked = !!state.prefs.showTopProgress;
  const allowPdf = !!state.currentBook?.allowPdfMode;
  const hasText = !!state.textDoc;
  dom.modeToggleBtn.hidden = !allowPdf || !hasText;
  dom.modeToggleBtn.textContent = state.mode === "text" ? "Afficher le PDF" : "Afficher le texte";
  dom.themeBtn.textContent = state.prefs.theme === "paper" ? "Mode nuit" : "Mode clair";
  dom.noteInput.value = state.notesMap[String(state.currentPage)] || "";
  renderBookmarks();
}

function buildProgressPayload() {
  const progressPercent = state.totalPages ? Math.round((state.currentPage / state.totalPages) * 1000) / 10 : 0;
  return {
    email: state.email,
    bookId: state.currentBook?.bookId,
    title: state.currentBook?.title,
    currentPage: state.currentPage,
    totalPages: state.totalPages,
    progressPercent
  };
}

async function saveProgress({ immediate = false } = {}) {
  if (!state.email || !state.currentBook) return;
  const payload = buildProgressPayload();
  const signature = JSON.stringify(payload);
  if (!immediate && signature === state.lastSaveSignature) return;

  try {
    setSaveStatus("Enregistrement...");
    const response = await jsonp("saveProgress", payload);
    if (!response?.ok) throw new Error(response?.message || "Erreur d'enregistrement.");
    state.lastSaveSignature = signature;
    setSaveStatus("Progression enregistrée", true);
  } catch (error) {
    console.error(error);
    setSaveStatus("Sauvegarde impossible");
    showToast("Sauvegarde impossible");
  }
}

function scheduleSave() {
  if (state.saveTimer) window.clearTimeout(state.saveTimer);
  state.saveTimer = window.setTimeout(() => saveProgress(), CONFIG.autoSaveDelayMs || 450);
}

function schedulePreferencesSave() {
  if (!state.currentBook || !state.email) return;
  if (state.prefsTimer) window.clearTimeout(state.prefsTimer);
  state.prefsTimer = window.setTimeout(async () => {
    try {
      await jsonp("savePreferences", {
        email: state.email,
        bookId: state.currentBook.bookId,
        fontIndex: state.prefs.fontIndex,
        theme: state.prefs.theme,
        preferredMode: state.mode,
        showTopProgress: state.prefs.showTopProgress ? "true" : "false",
        progressDisplayMode: state.prefs.progressDisplayMode
      });
    } catch (error) {
      console.warn("Préférences non synchronisées", error);
    }
  }, 350);
}

function renderBookmarks() {
  if (!state.bookmarks.length) {
    dom.bookmarkList.innerHTML = `<div class="empty-state">Aucun signet pour ce livre.</div>`;
    return;
  }
  dom.bookmarkList.innerHTML = [...state.bookmarks]
    .sort((a, b) => a.page - b.page)
    .map((bookmark) => `
      <div class="bookmark-chip">
        <button type="button" data-bookmark-page="${bookmark.page}">Page ${bookmark.page}</button>
        <button type="button" data-remove-bookmark="${bookmark.page}">Retirer</button>
      </div>
    `)
    .join("");
}

function normalizeLineText(parts) {
  return parts.join(" ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/([«(])\s+/g, "$1")
    .replace(/\s+([»)])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function extractPageText(items) {
  if (!items?.length) return [];
  const sorted = [...items].sort((a, b) => {
    const ay = a.transform?.[5] || 0;
    const by = b.transform?.[5] || 0;
    if (Math.abs(by - ay) > 2) return by - ay;
    const ax = a.transform?.[4] || 0;
    const bx = b.transform?.[4] || 0;
    return ax - bx;
  });

  const lines = [];
  let currentLine = [];
  let currentY = null;
  let previousY = null;

  for (const item of sorted) {
    const text = String(item.str || "").trim();
    if (!text) continue;
    const y = item.transform?.[5] || 0;
    if (currentY === null || Math.abs(y - currentY) <= 3.5) {
      currentLine.push(text);
      currentY = currentY === null ? y : currentY;
    } else {
      const normalized = normalizeLineText(currentLine);
      lines.push({ text: normalized, gap: previousY === null ? 0 : Math.abs(previousY - currentY) });
      previousY = currentY;
      currentLine = [text];
      currentY = y;
    }
  }
  if (currentLine.length) {
    const normalized = normalizeLineText(currentLine);
    lines.push({ text: normalized, gap: previousY === null ? 0 : Math.abs(previousY - currentY) });
  }

  const blocks = [];
  let buffer = [];
  let gapRef = 0;

  for (const lineInfo of lines) {
    const line = lineInfo.text;
    const isDialogue = /^[\-—]/.test(line);
    const isHeading = /^[A-ZÉÈÀÂÊÎÔÛÇ0-9\s]{5,}$/.test(line) && line.length < 70;
    const largeGap = lineInfo.gap > 12 && gapRef !== 0;

    if (isDialogue || isHeading || largeGap) {
      if (buffer.length) {
        blocks.push({ type: "paragraph", text: buffer.join(" ") });
        buffer = [];
      }
      blocks.push({ type: isHeading ? "centered" : isDialogue ? "dialogue" : "paragraph", text: line });
      gapRef = lineInfo.gap;
      continue;
    }

    buffer.push(line);
    gapRef = lineInfo.gap;
  }
  if (buffer.length) blocks.push({ type: "paragraph", text: buffer.join(" ") });

  return ensureBlocksArray(blocks)
    .map((block) => ({
      type: block.type,
      text: String(block.text || "")
        .replace(/\s+([,.;:!?])/g, "$1")
        .replace(/\s{2,}/g, " ")
        .trim()
    }))
    .filter((block) => block.text)
    .map((block) => ({
      type: block.type,
      text: block.type === "paragraph" ? block.text : block.text.replace(/^[-—]\s*/, (m) => m.trim() + " ")
    }));
}

function blocksToHtml(blocks) {
  return ensureBlocksArray(blocks).map((block) => {
    const cls = block.type === "dialogue" ? "dialogue" : block.type === "centered" ? "centered" : "";
    return `<p${cls ? ` class="${cls}"` : ""}>${escapeHtml(block.text)}</p>`;
  }).join("");
}

function normalizeJsonPage(page) {
  if (!page) return { html: "", hasUsableText: false };
  if (page.html) return { html: String(page.html), hasUsableText: !!String(page.html).trim() };
  const blocks = ensureBlocksArray(Array.isArray(page?.blocks) ? page.blocks : page?.text || "");
  const html = blocksToHtml(blocks);
  return { html, hasUsableText: blocks.length > 0 };
}

function extractPageTextFromRawString(rawText) {
  const lines = String(rawText || "")
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const blocks = [];
  let paragraphBuffer = [];
  for (const line of lines) {
    const isDialogue = /^[\-—]/.test(line);
    const isHeading = /^[A-ZÉÈÀÂÊÎÔÛÇ0-9\s]{5,}$/.test(line) && line.length < 70;
    if (isDialogue || isHeading) {
      if (paragraphBuffer.length) {
        blocks.push({ type: "paragraph", text: paragraphBuffer.join(" ") });
        paragraphBuffer = [];
      }
      blocks.push({ type: isHeading ? "centered" : "dialogue", text: line });
    } else {
      paragraphBuffer.push(line);
    }
  }
  if (paragraphBuffer.length) blocks.push({ type: "paragraph", text: paragraphBuffer.join(" ") });
  return blocks;
}

async function loadTextJson(book) {
  if (!book.jsonPath) return null;
  const response = await fetch(computePublicAssetUrl(book.jsonPath), { cache: "no-store" });
  if (!response.ok) return null;
  return response.json();
}

async function loadPdfDocument(book) {
  if (state.pdfDoc && state.currentBook?.bookId === book.bookId) return state.pdfDoc;
  const pdfUrl = computePublicAssetUrl(book.pdfPath);
  const loadingTask = pdfjsLib.getDocument({ url: pdfUrl, disableAutoFetch: false, disableStream: false });
  state.pdfDoc = await loadingTask.promise;
  return state.pdfDoc;
}

async function renderTextPage(pageNumber) {
  const page = state.textDoc?.pages?.[pageNumber - 1];
  const normalized = normalizeJsonPage(page);
  if (!normalized.hasUsableText) {
    if (state.currentBook?.allowPdfMode) {
      state.localPdfPageFallbacks.add(pageNumber);
      return renderPdfPage(pageNumber);
    }
    dom.textViewer.innerHTML = `
      <article class="text-page">
        <h2>Page ${pageNumber}</h2>
        <div class="text-content"><p class="empty-text">Le texte n'est pas disponible proprement pour cette page.</p></div>
      </article>
    `;
    return;
  }
  state.localPdfPageFallbacks.delete(pageNumber);
  dom.textViewer.innerHTML = `
    <article class="text-page">
      <h2>Page ${pageNumber}</h2>
      <div class="text-content">${normalized.html}</div>
    </article>
  `;
}

function computeFitScale(page) {
  const shellWidth = Math.max(280, dom.viewerShell.clientWidth - 20);
  const viewport = page.getViewport({ scale: 1 });
  return shellWidth / viewport.width;
}

async function renderPdfPage(pageNumber) {
  if (!state.pdfDoc) await loadPdfDocument(state.currentBook);
  const renderToken = ++state.renderToken;
  const page = await state.pdfDoc.getPage(pageNumber);
  state.fitPdfScale = computeFitScale(page);
  const scale = state.fitPdfScale * state.pdfZoom;
  const viewport = page.getViewport({ scale });
  const outputScale = window.devicePixelRatio || 1;
  const context = dom.pdfCanvas.getContext("2d", { alpha: false });

  dom.pdfCanvas.width = Math.floor(viewport.width * outputScale);
  dom.pdfCanvas.height = Math.floor(viewport.height * outputScale);
  dom.pdfCanvas.style.width = `${viewport.width}px`;
  dom.pdfCanvas.style.height = `${viewport.height}px`;

  const renderContext = {
    canvasContext: context,
    viewport,
    transform: outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null
  };

  context.setTransform(1, 0, 0, 1, 0, 0);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, dom.pdfCanvas.width, dom.pdfCanvas.height);

  await page.render(renderContext).promise;
  if (renderToken !== state.renderToken) return;
}

async function renderCurrentPage() {
  if (!state.currentBook) return;
  updateUiLabels();
  rebuildReadingSurfaceClasses();

  if (state.mode === "text" && state.textDoc) {
    dom.textViewer.hidden = false;
    dom.pdfViewer.hidden = true;
    await renderTextPage(state.currentPage);
    if (state.localPdfPageFallbacks.has(state.currentPage)) {
      dom.textViewer.hidden = true;
      dom.pdfViewer.hidden = false;
    }
  } else {
    dom.textViewer.hidden = true;
    dom.pdfViewer.hidden = false;
    await renderPdfPage(state.currentPage);
  }

  dom.viewerShell.scrollTo({ top: 0, behavior: "instant" });
  persistSession();
}

async function goToPage(pageNumber, { save = true, animate = "" } = {}) {
  if (!state.totalPages) return;
  const nextPage = Math.max(1, Math.min(state.totalPages, Number(pageNumber) || 1));
  if (nextPage === state.currentPage && !save) return;
  state.currentPage = nextPage;
  if (animate) {
    dom.readingSurface.classList.remove("turn-next", "turn-prev");
    dom.readingSurface.classList.add(animate === "next" ? "turn-next" : "turn-prev");
    window.setTimeout(() => dom.readingSurface.classList.remove("turn-next", "turn-prev"), 240);
  }
  await renderCurrentPage();
  if (save) scheduleSave();
}

function toggleProgressDisplayMode() {
  state.prefs.progressDisplayMode = state.prefs.progressDisplayMode === "percent" ? "pages" : "percent";
  updateUiLabels();
  cacheCurrentBookData();
  schedulePreferencesSave();
}

function updateTextSize(direction) {
  if (state.mode === "pdf") {
    const delta = direction === "up" ? (CONFIG.pdfZoomStep || 0.12) : -(CONFIG.pdfZoomStep || 0.12);
    const nextZoom = Math.max(CONFIG.minPdfZoom || 0.7, Math.min(CONFIG.maxPdfZoom || 2.4, Number((state.pdfZoom + delta).toFixed(2))));
    if (nextZoom === state.pdfZoom) return;
    state.pdfZoom = nextZoom;
    renderCurrentPage();
    return;
  }
  const delta = direction === "up" ? 1 : -1;
  state.prefs.fontIndex = Math.max(0, Math.min(FONT_CLASSES.length - 1, state.prefs.fontIndex + delta));
  rebuildReadingSurfaceClasses();
  cacheCurrentBookData();
  schedulePreferencesSave();
}

function openTextSizeModal() {
  if (state.mode === "pdf") {
    dom.textSizeModalTitle.textContent = "Zoom du PDF";
    dom.textSizeModalDesc.textContent = "Ajuste le niveau de zoom du PDF en temps réel.";
    dom.decreaseTextBtn.textContent = "Dézoomer";
    dom.increaseTextBtn.textContent = "Zoomer";
  } else {
    dom.textSizeModalTitle.textContent = "Changer la taille du texte";
    dom.textSizeModalDesc.textContent = "Les changements s’appliquent immédiatement.";
    dom.decreaseTextBtn.textContent = "Réduire le texte";
    dom.increaseTextBtn.textContent = "Agrandir le texte";
  }
  openModal(dom.textSizeModal);
}

function renderInstallInstructions() {
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;

  if (isStandalone) {
    dom.installModalContent.innerHTML = `<p>L’application semble déjà installée sur cet appareil.</p>`;
    return;
  }

  if (state.deferredInstallPrompt) {
    dom.installModalContent.innerHTML = `<p>Appuie sur le bouton ci-dessous pour ajouter rapidement le lecteur à l’écran d’accueil.</p><div class="book-actions"><button id="confirmInstallBtn" class="nav-btn" type="button">Installer</button></div>`;
    openModal(dom.installModal);
    const confirmBtn = document.getElementById("confirmInstallBtn");
    confirmBtn?.addEventListener("click", async () => {
      const promptEvent = state.deferredInstallPrompt;
      state.deferredInstallPrompt = null;
      closeModal(dom.installModal);
      if (!promptEvent) return;
      await promptEvent.prompt();
      await promptEvent.userChoice.catch(() => null);
    }, { once: true });
    return;
  }

  if (isIOS) {
    dom.installModalContent.innerHTML = `
      <p>Sur iPhone et iPad, ouvre le menu de partage du navigateur puis choisis <strong>Ajouter à l’écran d’accueil</strong>.</p>
      <p>Une fois ajouté, le lecteur s’ouvrira plus vite comme une application.</p>
    `;
  } else {
    dom.installModalContent.innerHTML = `
      <p>Si l’installation n’est pas proposée automatiquement, utilise le menu du navigateur puis choisis <strong>Installer l’application</strong> ou <strong>Ajouter à l’écran d’accueil</strong>.</p>
    `;
  }
}

function currentProgressLabel() {
  const totalPages = state.totalPages || 0;
  const progressPercent = totalPages ? Math.round((state.currentPage / totalPages) * 1000) / 10 : 0;
  return state.prefs.progressDisplayMode === "pages" ? `${state.currentPage} / ${totalPages} pages` : `${progressPercent} %`;
}

async function addBookmark() {
  if (!state.currentBook) return;
  const existing = state.bookmarks.some((bookmark) => bookmark.page === state.currentPage);
  if (existing) {
    showToast("Ce signet existe déjà");
    return;
  }

  const optimisticBookmark = { page: state.currentPage, createdAt: new Date().toISOString() };
  state.bookmarks = [...state.bookmarks, optimisticBookmark];
  cacheCurrentBookData();
  renderBookmarks();
  showToast(`Signet ajouté à la page ${state.currentPage}`);

  try {
    const response = await jsonp("saveBookmark", {
      email: state.email,
      bookId: state.currentBook.bookId,
      page: state.currentPage
    });
    if (!response?.ok) throw new Error(response?.message || "Impossible d'enregistrer le signet.");
  } catch (error) {
    console.error(error);
    state.bookmarks = state.bookmarks.filter((bookmark) => bookmark.page !== state.currentPage);
    cacheCurrentBookData();
    renderBookmarks();
    showToast("Échec de l'ajout du signet");
  }
}

async function removeBookmark(page) {
  const previous = [...state.bookmarks];
  state.bookmarks = state.bookmarks.filter((bookmark) => bookmark.page !== page);
  cacheCurrentBookData();
  renderBookmarks();
  try {
    const response = await jsonp("deleteBookmark", {
      email: state.email,
      bookId: state.currentBook.bookId,
      page
    });
    if (!response?.ok) throw new Error(response?.message || "Impossible de retirer le signet.");
    showToast("Signet retiré");
  } catch (error) {
    console.error(error);
    state.bookmarks = previous;
    cacheCurrentBookData();
    renderBookmarks();
    showToast("Impossible de retirer le signet");
  }
}

async function saveCurrentNote() {
  if (!state.currentBook) return;
  const pageKey = String(state.currentPage);
  const value = dom.noteInput.value.trim();
  const previous = { ...state.notesMap };
  if (value) state.notesMap[pageKey] = value;
  else delete state.notesMap[pageKey];
  cacheCurrentBookData();
  dom.noteStatus.textContent = "Enregistrement...";
  try {
    const response = await jsonp(value ? "saveNote" : "deleteNote", {
      email: state.email,
      bookId: state.currentBook.bookId,
      page: pageKey,
      noteText: value
    });
    if (!response?.ok) throw new Error(response?.message || "Impossible d'enregistrer la note.");
    dom.noteStatus.textContent = "Note enregistrée";
    window.setTimeout(() => { dom.noteStatus.textContent = ""; }, 1600);
  } catch (error) {
    console.error(error);
    state.notesMap = previous;
    cacheCurrentBookData();
    dom.noteStatus.textContent = "Échec de l'enregistrement";
    window.setTimeout(() => { dom.noteStatus.textContent = ""; }, 2000);
  }
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function utf8ToBase64(text) {
  return btoa(unescape(encodeURIComponent(text)));
}

async function convertPdfFileToJson(file, metadata) {
  const arrayBuffer = await file.arrayBuffer();
  const pdfData = new Uint8Array(arrayBuffer);
  const loadingTask = pdfjsLib.getDocument({ data: pdfData });
  const pdf = await loadingTask.promise;
  const pages = [];

  setPublishProgressUi({ visible: true, percent: 0, stage: "Analyse du PDF", detail: "Préparation de la conversion du livre..." });

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const extractPercent = pdf.numPages ? (pageNumber / pdf.numPages) * 8 : 0;
    setPublishProgressUi({
      visible: true,
      percent: extractPercent,
      stage: "Analyse du PDF",
      detail: `Extraction du texte - page ${pageNumber} / ${pdf.numPages}`
    });
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const blocks = ensureBlocksArray(extractPageText(textContent.items));
    const charCount = blocks.reduce((total, block) => total + String(block?.text || "").replace(/\s+/g, "").length, 0);
    pages.push({
      page: pageNumber,
      blocks,
      hasUsableText: blocks.length > 0,
      charCount
    });
  }

  return {
    bookId: metadata.bookId,
    title: metadata.title,
    author: metadata.author || "",
    sourceFileName: file.name,
    generatedAt: new Date().toISOString(),
    totalPages: pdf.numPages,
    pages
  };
}

async function postAdminAction(formData, options = {}) {
  const timeoutMs = Number(options.timeoutMs) > 0 ? Number(options.timeoutMs) : 240000;
  const timeoutMessage = options.timeoutMessage || "Délai dépassé lors de la publication.";
  return new Promise((resolve, reject) => {
    const requestId = `admin_post_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const iframe = document.createElement("iframe");
    const form = document.createElement("form");
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error(timeoutMessage));
    }, timeoutMs);

    function cleanup() {
      window.clearTimeout(timeout);
      window.removeEventListener("message", onMessage);
      iframe.remove();
      form.remove();
    }

    function onMessage(event) {
      const data = event && event.data;
      if (!data || data.requestId !== requestId) return;
      cleanup();
      resolve(data.payload || { ok: false, message: "Réponse vide du service." });
    }

    iframe.name = requestId;
    iframe.hidden = true;
    form.hidden = true;
    form.method = "POST";
    form.action = CONFIG.appsScriptUrl;
    form.target = requestId;

    const entries = Array.from(formData.entries());
    entries.push(["transport", "iframe"]);
    entries.push(["requestId", requestId]);
    entries.push(["origin", window.location.origin || "*"]);

    entries.forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = String(value ?? "");
      form.appendChild(input);
    });

    window.addEventListener("message", onMessage);
    document.body.appendChild(iframe);
    document.body.appendChild(form);
    form.submit();
  });
}

function buildAdminFormData(action, payload = {}) {
  const formData = new FormData();
  formData.append("action", action);
  formData.append("email", state.email);
  formData.append("adminCode", state.adminCode);
  formData.append("repoOwner", CONFIG.githubRepoOwner || "");
  formData.append("repoName", CONFIG.githubRepoName || "");
  formData.append("repoBranch", CONFIG.githubRepoBranch || "main");
  formData.append("assetsBasePath", CONFIG.githubAssetsBasePath || "assets/books");
  Object.entries(payload || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) formData.append(key, String(value));
  });
  return formData;
}

async function adminPost(action, payload = {}, options = {}) {
  return postAdminAction(buildAdminFormData(action, payload), options);
}

function splitIntoUploadChunks(value, chunkSize = ADMIN_UPLOAD_CHUNK_SIZE) {
  const text = String(value || "");
  if (!text) return [];
  const parts = [];
  for (let index = 0; index < text.length; index += chunkSize) {
    parts.push(text.slice(index, index + chunkSize));
  }
  return parts;
}

function buildUploadId(bookId) {
  return `${bookId}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function computeUploadPercent(confirmedBytes, totalBytes) {
  if (!totalBytes) return 0;
  return (confirmedBytes / totalBytes) * 100;
}

async function uploadFileInChunks({ uploadId, fileType, content, label, totalBytes, confirmedBytes }) {
  const chunks = splitIntoUploadChunks(content);
  if (!chunks.length) return confirmedBytes;

  for (let index = 0; index < chunks.length; index += 1) {
    const chunk = chunks[index];
    setPublishProgressUi({
      visible: true,
      percent: computeUploadPercent(confirmedBytes, totalBytes),
      stage: `Téléversement du ${label}`,
      detail: `${label} - envoi du bloc ${index + 1} / ${chunks.length}...`
    });

    const response = await adminPost("uploadBookChunk", {
      uploadId,
      fileType,
      chunkIndex: index,
      totalChunks: chunks.length,
      dataChunk: chunk
    }, {
      timeoutMs: 90000,
      timeoutMessage: `Délai dépassé pendant l’envoi du bloc ${index + 1} / ${chunks.length} du ${label}.`
    });

    if (!response?.ok) {
      throw new Error(response?.details || response?.message || `Échec de l’envoi du bloc ${index + 1} du ${label}.`);
    }

    confirmedBytes += chunk.length;
    setPublishProgressUi({
      visible: true,
      percent: computeUploadPercent(confirmedBytes, totalBytes),
      stage: `Téléversement du ${label}`,
      detail: `${label} - ${index + 1} / ${chunks.length} blocs confirmés`
    });
  }

  return confirmedBytes;
}

async function commitUploadedFile({ uploadId, fileType, label, percent }) {
  setPublishStatus(`Publication de ${label}...`);
  setPublishProgressUi({
    visible: true,
    percent,
    stage: `Publication de ${label}`,
    detail: `Assemblage et envoi de ${label} vers GitHub...`
  });

  const response = await adminPost("commitUploadedBookFile", {
    uploadId,
    fileType
  }, {
    timeoutMs: 180000,
    timeoutMessage: `Délai dépassé pendant la publication de ${label} vers GitHub.`
  });

  if (!response?.ok) {
    throw new Error(response?.details || response?.message || `Échec de la publication de ${label}.`);
  }

  return response;
}

async function abortChunkedPublish(uploadId) {
  if (!uploadId) return;
  try {
    await adminPost("abortChunkedPublish", { uploadId }, { timeoutMs: 45000, timeoutMessage: "" });
  } catch (error) {
    console.warn("Nettoyage de publication impossible", error);
  }
}

async function publishBook(event) {
  event.preventDefault();
  if (!state.adminUnlocked) {
    showToast("Déverrouille d’abord le module administrateur");
    return;
  }

  const file = dom.bookPdfInput.files?.[0];
  if (!file) {
    showToast("Choisis un PDF");
    return;
  }

  const title = dom.bookTitleInput.value.trim();
  const bookId = slugify(dom.bookIdInput.value.trim() || title || file.name.replace(/\.pdf$/i, ""));
  const author = dom.bookAuthorInput.value.trim();
  if (!title || !bookId) {
    showToast("Titre ou identifiant manquant");
    return;
  }

  dom.publishBtn.disabled = true;
  setPublishStatus("Préparation...");
  setPublishProgressUi({ visible: true, percent: 0, stage: "Préparation", detail: "Lecture du PDF local..." });

  let uploadId = "";

  try {
    const jsonDoc = await convertPdfFileToJson(file, { title, bookId, author });
    const arrayBuffer = await file.arrayBuffer();
    const pdfBase64 = arrayBufferToBase64(arrayBuffer);
    const jsonBase64 = utf8ToBase64(JSON.stringify(jsonDoc));

    let coverBase64 = "";
    let coverExtension = "";
    const coverFile = dom.bookCoverInput.files?.[0];
    if (coverFile) {
      setPublishProgressUi({ visible: true, percent: 8, stage: "Préparation", detail: "Préparation de l’image de couverture..." });
      coverBase64 = arrayBufferToBase64(await coverFile.arrayBuffer());
      coverExtension = (coverFile.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    }

    uploadId = buildUploadId(bookId);
    const totalUploadBytes = jsonBase64.length + pdfBase64.length + coverBase64.length;
    let confirmedBytes = 0;

    const initResponse = await adminPost("initChunkedPublish", {
      uploadId,
      bookId,
      title,
      author,
      publishNow: dom.publishNowInput.checked ? "true" : "false",
      allowPdfMode: dom.allowPdfModeInput.checked ? "true" : "false",
      sourceFileName: file.name,
      totalPages: String(jsonDoc.totalPages),
      coverExtension
    }, {
      timeoutMs: 60000,
      timeoutMessage: "Délai dépassé pendant l’initialisation de la publication."
    });

    if (!initResponse?.ok) throw new Error(initResponse?.details || initResponse?.message || "Impossible d’initialiser la publication.");

    confirmedBytes = await uploadFileInChunks({ uploadId, fileType: "json", content: jsonBase64, label: "la version texte", totalBytes: totalUploadBytes, confirmedBytes });
    const jsonUpload = await commitUploadedFile({ uploadId, fileType: "json", label: "la version texte", percent: computeUploadPercent(confirmedBytes, totalUploadBytes) });

    confirmedBytes = await uploadFileInChunks({ uploadId, fileType: "pdf", content: pdfBase64, label: "le PDF", totalBytes: totalUploadBytes, confirmedBytes });
    const pdfUpload = await commitUploadedFile({ uploadId, fileType: "pdf", label: "le PDF", percent: computeUploadPercent(confirmedBytes, totalUploadBytes) });

    let coverUpload = null;
    if (coverBase64) {
      confirmedBytes = await uploadFileInChunks({ uploadId, fileType: "cover", content: coverBase64, label: "la couverture", totalBytes: totalUploadBytes, confirmedBytes });
      coverUpload = await commitUploadedFile({ uploadId, fileType: "cover", label: "la couverture", percent: computeUploadPercent(confirmedBytes, totalUploadBytes) });
    }

    setPublishStatus("Enregistrement du livre...");
    setPublishProgressUi({
      visible: true,
      percent: 100,
      stage: "Finalisation",
      detail: "Enregistrement du livre dans la bibliothèque..."
    });

    const finalizeResponse = await adminPost("finalizeChunkedPublish", { uploadId }, {
      timeoutMs: 120000,
      timeoutMessage: "Délai dépassé pendant l’enregistrement du livre."
    });

    if (!finalizeResponse?.ok) throw new Error(finalizeResponse?.details || finalizeResponse?.message || "Impossible d’enregistrer le livre.");

    if (finalizeResponse.book) mergeBookInState(finalizeResponse.book);
    renderBookList();
    renderAdminBooks();
    dom.publishForm.reset();
    setPublishStatus("Livre publié", true);
    const sentLabels = [jsonUpload?.path ? "JSON" : "", pdfUpload?.path ? "PDF" : "", coverUpload?.path ? "couverture" : ""].filter(Boolean).join(", ");
    setPublishProgressUi({ visible: true, percent: 100, stage: "Terminé", detail: `Livre publié. Fichiers envoyés : ${sentLabels || "bibliothèque mise à jour"}.` });
    showToast("Livre publié");
    refreshBooks({ useCache: true, silentError: true }).catch(() => {});
  } catch (error) {
    console.error(error);
    setPublishStatus("Échec de publication");
    setPublishProgressUi({ visible: true, percent: 0, stage: "Échec", detail: error.message || "Impossible de convertir ou publier le fichier." });
    if (uploadId) abortChunkedPublish(uploadId).catch(() => {});
    showToast("Échec de publication");
  } finally {
    dom.publishBtn.disabled = false;
  }
}

async function toggleBookPublished(bookId) {
  if (!state.adminUnlocked) return;
  try {
    const book = getBookById(bookId);
    const response = await jsonp("toggleBookPublished", {
      email: state.email,
      adminCode: state.adminCode,
      bookId,
      published: book && book.published ? "false" : "true"
    });
    if (!response?.ok) throw new Error(response?.message || "Impossible de changer le statut.");
    await refreshBooks();
    showToast("Statut mis à jour");
  } catch (error) {
    console.error(error);
    showToast("Impossible de changer le statut");
  }
}

async function toggleBookPdf(bookId) {
  if (!state.adminUnlocked) return;
  try {
    const book = getBookById(bookId);
    const response = await jsonp("toggleBookPdfMode", {
      email: state.email,
      adminCode: state.adminCode,
      bookId,
      allowPdfMode: book && book.allowPdfMode ? "false" : "true"
    });
    if (!response?.ok) throw new Error(response?.message || "Impossible de changer l’option PDF.");
    await refreshBooks();
    showToast("Option PDF mise à jour");
  } catch (error) {
    console.error(error);
    showToast("Impossible de changer l’option PDF");
  }
}

async function deleteBook(bookId) {
  if (!state.adminUnlocked) return;
  const book = getBookById(bookId);
  if (!book) return;
  const confirmed = window.confirm(`Supprimer définitivement « ${book.title} » de la bibliothèque ?`);
  if (!confirmed) return;

  const previousBooks = [...state.books];
  state.books = state.books.filter((item) => item.bookId !== bookId);
  cacheBooks(state.books, state.adminUnlocked);
  renderBookList();
  renderAdminBooks();

  try {
    const response = await jsonp("deleteBook", {
      email: state.email,
      adminCode: state.adminCode,
      bookId
    });
    if (!response?.ok) throw new Error(response?.message || "Impossible de supprimer le livre.");
    if (state.currentBook?.bookId === bookId) {
      await saveProgress({ immediate: true });
      state.currentBook = null;
      switchScreen("library");
    }
    showToast(response.message || "Livre supprimé");
    refreshBooks({ useCache: true, silentError: true }).catch(() => {});
  } catch (error) {
    console.error(error);
    state.books = previousBooks;
    cacheBooks(state.books, state.adminUnlocked);
    renderBookList();
    renderAdminBooks();
    showToast("Impossible de supprimer le livre");
  }
}

async function unlockAdmin() {
  if (state.adminUnlocked) return;
  const code = dom.adminCodeInput.value.trim();
  if (!code) {
    showToast("Entre le code administrateur");
    return;
  }

  const previousLabel = dom.unlockAdminBtn.textContent;
  dom.unlockAdminBtn.disabled = true;
  dom.adminCodeInput.disabled = true;
  dom.unlockAdminBtn.textContent = "Vérification...";
  setPublishStatus("Connexion en cours. Bienvenue Kevin Tremblay, administrateur.");

  try {
    const response = await jsonp("verifyAdmin", { email: state.email, adminCode: code });
    if (!response?.ok || response.adminAuthorized !== true) {
      throw new Error(response?.message || "Code invalide.");
    }
    state.adminUnlocked = true;
    state.adminCode = code;
    dom.adminCodeInput.value = code;
    updateAdminLockUi("Connexion en cours. Bienvenue Kevin Tremblay, administrateur.");
    persistSession();
    state.books = readCachedBooks(true);
    renderBookList();
    renderAdminLoading();
    await refreshBooks({ useCache: true, silentError: false, scope: "admin" });
    setPublishStatus("Mode administrateur déverrouillé.", true);
    showToast("Mode administrateur déverrouillé");
  } catch (error) {
    console.error(error);
    state.adminUnlocked = false;
    state.adminCode = "";
    dom.adminCodeInput.value = "";
    updateAdminLockUi("Code administrateur invalide.");
    persistSession();
    showToast(error?.message || "Code administrateur invalide");
  } finally {
    dom.unlockAdminBtn.disabled = false;
    dom.adminCodeInput.disabled = false;
    dom.unlockAdminBtn.textContent = previousLabel;
  }
}

async function refreshBooks({ useCache = true, silentError = false, scope = "auto" } = {}) {
  const adminScope = scope === "admin" ? true : scope === "public" ? false : state.adminUnlocked;

  if (scope === "auto" && state.isAdminCandidate && !state.adminUnlocked) {
    state.books = [];
    renderBookList();
    renderAdminBooks();
    return [];
  }

  const cached = useCache ? readCachedBooks(adminScope) : [];
  if (cached.length) {
    state.books = cached;
    renderBookList();
    renderAdminBooks();
  } else if (adminScope) {
    renderAdminLoading();
  }

  try {
    const books = await listBooks(adminScope);
    renderBookList();
    renderAdminBooks();
    return books;
  } catch (error) {
    if (!cached.length && !silentError) throw error;
    if (!silentError) console.warn("Bibliothèque chargée depuis le cache local", error);
    return cached;
  }
}


async function openBook(book, options = {}) {
  state.currentBook = book;
  state.currentPage = 1;
  state.totalPages = Number(book.totalPages) || 0;
  state.lastSaveSignature = "";
  state.pdfDoc = null;
  state.textDoc = null;
  state.localPdfPageFallbacks = new Set();
  state.pdfZoom = 1;

  setReaderLoading(true, "Livre en cours de chargement, veuillez patienter.");
  setSaveStatus("Chargement...");
  switchScreen("reader");
  toggleMenu(false);

  try {
    const cachedPrefs = readCachedPrefs(book.bookId);
    const cachedBookmarks = readCachedBookmarks(book.bookId);
    const cachedNotes = readCachedNotes(book.bookId);
    if (cachedPrefs) state.prefs = { ...DEFAULT_PREFS, ...cachedPrefs };
    else state.prefs = { ...DEFAULT_PREFS };
    state.bookmarks = Array.isArray(cachedBookmarks) ? cachedBookmarks : [];
    state.notesMap = cachedNotes && typeof cachedNotes === "object" ? cachedNotes : {};
    updateUiLabels();

    const [progress, prefs, bookmarks, notes, jsonDoc] = await Promise.all([
      fetchProgress(book.bookId).catch(() => null),
      fetchPreferences(book.bookId).catch(() => null),
      fetchBookmarks(book.bookId).catch(() => []),
      fetchNotes(book.bookId).catch(() => []),
      loadTextJson(book).catch(() => null)
    ]);

    state.textDoc = jsonDoc;
    if (prefs) state.prefs = { ...DEFAULT_PREFS, ...state.prefs, ...prefs };
    state.bookmarks = bookmarks.length ? bookmarks : state.bookmarks;
    state.notesMap = notes.length ? normalizeNoteRows(notes) : state.notesMap;

    if (jsonDoc?.totalPages) state.totalPages = Number(jsonDoc.totalPages) || state.totalPages;

    const desiredMode = options.mode || prefs?.preferredMode || state.prefs.preferredMode || "text";
    if (!jsonDoc) state.mode = book.allowPdfMode ? "pdf" : "text";
    else if (desiredMode === "pdf" && book.allowPdfMode) state.mode = "pdf";
    else state.mode = "text";

    if (!state.totalPages || state.mode === "pdf") {
      if (book.allowPdfMode && book.pdfPath) {
        await loadPdfDocument(book);
        state.totalPages = state.pdfDoc?.numPages || state.totalPages;
      }
    }

    if (!state.totalPages) throw new Error("Le livre ne peut pas être chargé pour le moment.");

    const restoredPage = options.page || progress?.currentPage || 1;
    state.currentPage = Math.max(1, Math.min(state.totalPages || 1, Number(restoredPage) || 1));
    persistSession();
    cacheCurrentBookData();
    await renderCurrentPage();
    setSaveStatus("Prêt");
  } catch (error) {
    console.error(error);
    state.currentBook = null;
    switchScreen("library");
    setSaveStatus("Impossible de charger le livre");
    showToast(error.message || "Impossible de charger le livre");
  } finally {
    setReaderLoading(false);
  }
}

function logoutToGate({ clearRemember = false } = {}) {
  state.email = "";
  state.isAdminCandidate = false;
  state.adminUnlocked = false;
  state.adminCode = "";
  state.books = [];
  state.currentBook = null;
  state.pdfDoc = null;
  state.textDoc = null;
  state.bookmarks = [];
  state.notesMap = {};
  state.lastSaveSignature = "";
  dom.adminCodeInput.value = "";
  updateAdminLockUi("");
  dom.controlPanel.hidden = true;
  dom.menuBackdrop.hidden = true;
  dom.adminPanel.hidden = true;
  setGateMessage("");
  setGateLoading(false);
  switchScreen("gate");
  clearSessionStorage();
  if (clearRemember) clearRememberedIdentity();
}


async function handleLogin(event) {
  if (event) event.preventDefault();
  const email = normalizeEmail(dom.emailInput.value);
  const suffixes = CONFIG.allowedDomainSuffixes || [];
  state.rememberMe = !!dom.rememberMeInput.checked;

  if (!email || (suffixes.length && !suffixes.some((suffix) => email.endsWith(`@${suffix}`)))) {
    setGateMessage("Courriel scolaire invalide.", "error");
    return;
  }

  dom.loginBtn.disabled = true;
  setGateMessage("");
  setGateLoading(true, "Validation de votre identité, veuillez patienter quelques instants.");

  try {
    const response = await auth(email);
    if (!response?.ok) throw new Error(response?.message || "Accès refusé.");
    state.email = email;
    state.isAdminCandidate = !!response.isAdminCandidate;
    state.adminUnlocked = false;
    state.adminCode = "";
    rememberEmail(email);
    persistSession();
    dom.adminPanel.hidden = !state.isAdminCandidate;
    switchScreen("library");

    if (state.isAdminCandidate) {
      state.books = [];
      updateAdminLockUi("Entre le code administrateur pour continuer.");
      renderBookList();
      renderAdminBooks();
    } else {
      renderBookList();
      renderAdminBooks();
      setGateLoading(true, "Livre en cours de chargement, veuillez patienter.");
      await refreshBooks({ useCache: true, silentError: true, scope: "public" });
    }
  } catch (error) {
    console.error(error);
    setGateMessage(error.message || "Accès refusé.", "error");
    switchScreen("gate");
  } finally {
    setGateLoading(false);
    dom.loginBtn.disabled = false;
  }
}

async function restoreSessionIfPossible() {
  const rememberedEmail = loadRememberedEmail();
  const rememberedFlag = loadRememberedFlag();
  dom.emailInput.value = rememberedEmail;
  dom.rememberMeInput.checked = rememberedFlag;
  state.rememberMe = rememberedFlag;

  const saved = readSavedSession();
  if (!saved?.email) return;

  state.email = normalizeEmail(saved.email);
  state.rememberMe = saved.rememberMe !== false;
  dom.emailInput.value = state.email;
  dom.rememberMeInput.checked = state.rememberMe;
  state.isAdminCandidate = inferAdminCandidateFromEmail(state.email);
  state.adminUnlocked = !!saved.adminUnlocked && !!state.isAdminCandidate && !!saved.adminCode;
  state.adminCode = state.adminUnlocked ? String(saved.adminCode || "") : "";
  dom.adminPanel.hidden = !state.isAdminCandidate;
  dom.adminCodeInput.value = state.adminCode;
  updateAdminLockUi(state.adminUnlocked ? "Connexion en cours. Bienvenue Kevin Tremblay, administrateur." : "Entre le code administrateur pour continuer.");
  switchScreen("library");

  if (state.isAdminCandidate) {
    state.books = readCachedBooks(state.adminUnlocked);
    renderBookList();
    renderAdminBooks();
    if (state.adminUnlocked) {
      refreshBooks({ useCache: true, silentError: true, scope: "admin" }).then(async () => {
        if (saved.currentBookId) {
          const book = getBookById(saved.currentBookId);
          if (book) await openBook(book, { page: saved.currentPage, mode: saved.mode });
        }
      }).catch(() => {});
    }
    return;
  }

  state.books = readCachedBooks(false);
  renderBookList();
  renderAdminBooks();
  refreshBooks({ useCache: true, silentError: true, scope: "public" }).then(async () => {
    if (saved.currentBookId) {
      const book = getBookById(saved.currentBookId);
      if (book) await openBook(book, { page: saved.currentPage, mode: saved.mode });
    }
  }).catch(() => {});
}

function setupInstallPrompt() {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    state.deferredInstallPrompt = event;
  });

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch((error) => {
      console.warn("Service worker non enregistré", error);
    });
  }
}

function setupZoomBlocking() {
  document.addEventListener("wheel", (event) => {
    if (event.ctrlKey || event.metaKey) event.preventDefault();
  }, { passive: false });

  document.addEventListener("keydown", (event) => {
    const ctrlOrMeta = event.ctrlKey || event.metaKey;
    if (!ctrlOrMeta) return;
    if (["+", "-", "=", "0"].includes(event.key)) event.preventDefault();
  });

  document.addEventListener("touchstart", (event) => {
    if (event.touches && event.touches.length > 1) event.preventDefault();
  }, { passive: false });

  document.addEventListener("touchmove", (event) => {
    if (event.touches && event.touches.length > 1) event.preventDefault();
  }, { passive: false });
}

function setupSwipeNavigation() {
  dom.viewerShell.addEventListener("touchstart", (event) => {
    if (event.touches.length !== 1) {
      state.swipeStart = null;
      return;
    }
    const touch = event.touches[0];
    state.swipeStart = { x: touch.clientX, y: touch.clientY, time: Date.now() };
  }, { passive: true });

  dom.viewerShell.addEventListener("touchend", async (event) => {
    if (!state.swipeStart || event.changedTouches.length !== 1 || dom.controlPanel.hidden === false) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - state.swipeStart.x;
    const dy = touch.clientY - state.swipeStart.y;
    const elapsed = Date.now() - state.swipeStart.time;
    state.swipeStart = null;

    if (elapsed > 450) return;
    if (Math.abs(dx) < 70 || Math.abs(dy) > 50) return;

    if (dx < 0 && state.currentPage < state.totalPages) {
      await goToPage(state.currentPage + 1, { animate: "next" });
    } else if (dx > 0 && state.currentPage > 1) {
      await goToPage(state.currentPage - 1, { animate: "prev" });
    }
  }, { passive: true });
}

function attachEvents() {
  dom.loginForm.addEventListener("submit", handleLogin);
  dom.refreshBooksBtn.addEventListener("click", refreshBooks);
  dom.logoutBtn.addEventListener("click", () => logoutToGate({ clearRemember: false }));
  dom.backToLibraryBtn.addEventListener("click", async () => {
    await saveProgress({ immediate: true });
    switchScreen("library");
  });
  dom.menuToggle.addEventListener("click", () => toggleMenu());
  dom.menuBackdrop.addEventListener("click", () => toggleMenu(false));
  dom.closeMenuBtn.addEventListener("click", () => toggleMenu(false));
  dom.prevBtn.addEventListener("click", () => goToPage(state.currentPage - 1, { animate: "prev" }));
  dom.nextBtn.addEventListener("click", () => goToPage(state.currentPage + 1, { animate: "next" }));
  dom.bottomPrevBtn.addEventListener("click", () => goToPage(state.currentPage - 1, { animate: "prev" }));
  dom.bottomNextBtn.addEventListener("click", () => goToPage(state.currentPage + 1, { animate: "next" }));
  dom.goBtn.addEventListener("click", () => goToPage(Number(dom.pageInput.value)));
  dom.fitBtn.addEventListener("click", async () => {
    if (state.mode === "pdf") state.pdfZoom = 1;
    await renderCurrentPage();
  });
  dom.modeToggleBtn.addEventListener("click", async () => {
    if (!state.currentBook?.allowPdfMode) return;
    if (state.mode === "text") {
      await loadPdfDocument(state.currentBook);
      state.mode = "pdf";
    } else {
      state.mode = state.textDoc ? "text" : "pdf";
    }
    state.prefs.preferredMode = state.mode;
    cacheCurrentBookData();
    schedulePreferencesSave();
    await renderCurrentPage();
  });
  dom.textSizeBtn.addEventListener("click", openTextSizeModal);
  dom.closeTextSizeModalBtn.addEventListener("click", () => closeModal(dom.textSizeModal));
  dom.decreaseTextBtn.addEventListener("click", () => updateTextSize("down"));
  dom.increaseTextBtn.addEventListener("click", () => updateTextSize("up"));
  dom.themeBtn.addEventListener("click", async () => {
    state.prefs.theme = state.prefs.theme === "paper" ? "night" : "paper";
    cacheCurrentBookData();
    schedulePreferencesSave();
    await renderCurrentPage();
  });
  dom.bookmarkBtn.addEventListener("click", addBookmark);
  dom.saveBtn.addEventListener("click", () => saveProgress({ immediate: true }));
  dom.saveNoteBtn.addEventListener("click", saveCurrentNote);
  dom.showTopProgressInput.addEventListener("change", async () => {
    state.prefs.showTopProgress = dom.showTopProgressInput.checked;
    updateUiLabels();
    cacheCurrentBookData();
    schedulePreferencesSave();
    await renderCurrentPage();
  });
  dom.progressText.addEventListener("click", toggleProgressDisplayMode);
  dom.topProgressText.addEventListener("click", toggleProgressDisplayMode);
  dom.installAppBtn.addEventListener("click", () => {
    renderInstallInstructions();
    openModal(dom.installModal);
  });
  dom.closeInstallModalBtn.addEventListener("click", () => closeModal(dom.installModal));
  dom.modalBackdrop.addEventListener("click", () => {
    closeModal(dom.textSizeModal);
    closeModal(dom.installModal);
  });
  dom.unlockAdminBtn.addEventListener("click", unlockAdmin);
  dom.adminCodeInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      unlockAdmin();
    }
  });
  dom.publishForm.addEventListener("submit", publishBook);
  dom.reloadAdminBooksBtn.addEventListener("click", refreshBooks);
  dom.bookTitleInput.addEventListener("input", () => {
    if (!dom.bookIdInput.value.trim()) dom.bookIdInput.value = slugify(dom.bookTitleInput.value);
  });

  dom.bookList.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-open-book]");
    if (!button) return;
    const book = getBookById(button.dataset.openBook);
    if (book) await openBook(book);
  });

  dom.adminBooksList.addEventListener("click", async (event) => {
    const openButton = event.target.closest("[data-open-book]");
    const toggleButton = event.target.closest("[data-toggle-book]");
    const togglePdfButton = event.target.closest("[data-toggle-pdf]");
    const deleteButton = event.target.closest("[data-delete-book]");
    if (openButton) {
      const book = getBookById(openButton.dataset.openBook);
      if (book) await openBook(book);
      return;
    }
    if (toggleButton) return toggleBookPublished(toggleButton.dataset.toggleBook);
    if (togglePdfButton) return toggleBookPdf(togglePdfButton.dataset.togglePdf);
    if (deleteButton) return deleteBook(deleteButton.dataset.deleteBook);
  });

  dom.bookmarkList.addEventListener("click", async (event) => {
    const jumpButton = event.target.closest("[data-bookmark-page]");
    const removeButton = event.target.closest("[data-remove-bookmark]");
    if (jumpButton) return goToPage(Number(jumpButton.dataset.bookmarkPage), { save: false });
    if (removeButton) return removeBookmark(Number(removeButton.dataset.removeBookmark));
  });

  window.addEventListener("resize", () => {
    if (!state.currentBook || state.mode !== "pdf") return;
    window.clearTimeout(window.__readerResizeTimer);
    window.__readerResizeTimer = window.setTimeout(() => renderCurrentPage(), 120);
  });
  window.addEventListener("orientationchange", () => window.setTimeout(() => renderCurrentPage(), 180));
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) saveProgress({ immediate: true });
  });
  window.addEventListener("pagehide", () => {
    if (state.currentBook) saveProgress({ immediate: true });
  });

  setupSwipeNavigation();
}

function init() {
  attachEvents();
  setupInstallPrompt();
  setupZoomBlocking();
  ensurePublishProgressUi();
  hidePublishProgressUi();
  switchScreen("gate");
  toggleMenu(false);
  rebuildReadingSurfaceClasses();
  setSaveStatus("En attente");
  restoreSessionIfPossible();
}

init();
