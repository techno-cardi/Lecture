import * as pdfjsLib from "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.6.205/build/pdf.min.mjs";

const CONFIG = window.READER_CONFIG || {};
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${CONFIG.pdfJsVersion || "5.6.205"}/build/pdf.worker.min.mjs`;

const FONT_CLASSES = ["font-small", "font-medium", "font-large", "font-xlarge"];
const SESSION_KEY = "readerSession_v2";
const LS_EMAIL_KEY = "rememberedEmail";
const LS_PROGRESS_BAR_KEY = "showProgressBar";
const LS_PROGRESS_MODE_KEY = "progressMode";
const LS_FONT_KEY = "fontIndex";
const LS_THEME_KEY = "readerTheme";
const LS_INSTALL_KEY = "installBannerDismissed";
const LS_IOS_INSTALL_KEY = "iosInstallDismissed";
const LS_CURRENT_BOOK_KEY = "currentBookState_v1";

// ════════════════════════════════════════
// DOM REFS
// ════════════════════════════════════════
const dom = {
  gate: document.getElementById("gate"),
  loginForm: document.getElementById("loginForm"),
  emailInput: document.getElementById("emailInput"),
  rememberMeInput: document.getElementById("rememberMeInput"),
  loginBtn: document.getElementById("loginBtn"),
  gateMessage: document.getElementById("gateMessage"),
  gateBusy: document.getElementById("gateBusy"),
  gateBusyText: document.getElementById("gateBusyText"),

  installBanner: document.getElementById("installBanner"),
  installBannerText: document.getElementById("installBannerText"),
  installBannerBtn: document.getElementById("installBannerBtn"),
  installBannerDismiss: document.getElementById("installBannerDismiss"),

  library: document.getElementById("library"),
  libraryMeta: document.getElementById("libraryMeta"),
  bookList: document.getElementById("bookList"),
  refreshBooksBtn: document.getElementById("refreshBooksBtn"),
  logoutBtn: document.getElementById("logoutBtn"),

  adminPanel: document.getElementById("adminPanel"),
  adminCodeInput: document.getElementById("adminCodeInput"),
  unlockAdminBtn: document.getElementById("unlockAdminBtn"),
  githubTestRow: document.getElementById("githubTestRow"),
  testGithubBtn: document.getElementById("testGithubBtn"),
  githubTestStatus: document.getElementById("githubTestStatus"),
  publishForm: document.getElementById("publishForm"),
  bookTitleInput: document.getElementById("bookTitleInput"),
  bookIdInput: document.getElementById("bookIdInput"),
  bookAuthorInput: document.getElementById("bookAuthorInput"),
  bookPdfInput: document.getElementById("bookPdfInput"),
  bookCoverInput: document.getElementById("bookCoverInput"),
  publishNowInput: document.getElementById("publishNowInput"),
  publishBtn: document.getElementById("publishBtn"),
  publishStatus: document.getElementById("publishStatus"),
  publishProgress: document.getElementById("publishProgress"),
  publishSizeWarning: document.getElementById("publishSizeWarning"),
  reloadAdminBooksBtn: document.getElementById("reloadAdminBooksBtn"),
  adminBooksList: document.getElementById("adminBooksList"),

  bookLoadingOverlay: document.getElementById("bookLoadingOverlay"),

  addUsersSection: document.getElementById("addUsersSection"),
  addUsersTextarea: document.getElementById("addUsersTextarea"),
  addUsersBtn: document.getElementById("addUsersBtn"),
  addUsersStatus: document.getElementById("addUsersStatus"),

  editBookModal: document.getElementById("editBookModal"),
  editBookTitle: document.getElementById("editBookTitle"),
  editBookAuthor: document.getElementById("editBookAuthor"),
  editBookDescription: document.getElementById("editBookDescription"),
  editBookId: document.getElementById("editBookId"),
  editBookSaveBtn: document.getElementById("editBookSaveBtn"),
  editBookCancelBtn: document.getElementById("editBookCancelBtn"),
  editBookStatus: document.getElementById("editBookStatus"),

  reader: document.getElementById("reader"),
  topProgressBar: document.getElementById("topProgressBar"),
  topProgressFill: document.getElementById("topProgressFill"),
  topProgressLabel: document.getElementById("topProgressLabel"),
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
  fontSizeBtn: document.getElementById("fontSizeBtn"),
  progressBarToggleBtn: document.getElementById("progressBarToggleBtn"),
  bookmarkBtn: document.getElementById("bookmarkBtn"),
  saveBtn: document.getElementById("saveBtn"),
  themeBtn: document.getElementById("themeBtn"),
  bookmarkList: document.getElementById("bookmarkList"),
  noteInput: document.getElementById("pageNoteInput"),
  saveNoteBtn: document.getElementById("saveNoteBtn"),
  newNoteBtn: document.getElementById("newNoteBtn"),
  notesList: document.getElementById("notesList"),
  noteStatus: document.getElementById("noteStatus"),
  saveStatus: document.getElementById("saveStatus"),
  viewerShell: document.getElementById("viewerShell"),
  readingSurface: document.getElementById("readingSurface"),
  textViewer: document.getElementById("textViewer"),
  pdfViewer: document.getElementById("pdfViewer"),
  pdfCanvas: document.getElementById("pdfCanvas"),
  readerNav: document.getElementById("readerNav"),
  navPrevBtn: document.getElementById("navPrevBtn"),
  navPageBtn: document.getElementById("navPageBtn"),
  navPageText: document.getElementById("navPageText"),
  navNextBtn: document.getElementById("navNextBtn"),
  fontModal: document.getElementById("fontModal"),
  fontModalMinus: document.getElementById("fontModalMinus"),
  fontModalPlus: document.getElementById("fontModalPlus"),
  fontModalClose: document.getElementById("fontModalClose"),
  toast: document.getElementById("toast"),
};

// ════════════════════════════════════════
// STATE
// ════════════════════════════════════════
const state = {
  email: "",
  isAdminCandidate: false,
  adminUnlocked: false,
  adminCode: "",
  books: [],
  currentBook: null,
  pdfDoc: null,
  textDoc: null,
  totalPages: 0,
  currentPage: 1,
  mode: CONFIG.defaultReaderMode || "text",
  theme: localStorage.getItem(LS_THEME_KEY) || "paper",
  fontIndex: Number(localStorage.getItem(LS_FONT_KEY)) || 1,
  pdfZoomMultiplier: 1,
  renderToken: 0,
  saveTimer: null,
  lastSaveSignature: "",
  toastTimer: null,
  bookmarks: [],
  notes: [],
  editingNoteId: "",
  fallbackNoticeShownForPage: 0,
  showProgressBar: JSON.parse(localStorage.getItem(LS_PROGRESS_BAR_KEY) || "false"),
  progressMode: localStorage.getItem(LS_PROGRESS_MODE_KEY) || "percent",
  pinchActive: false,
  isBookmarkSaving: false,
  lastOpenedBookmarkPage: 0,
  pageAnimationTimer: null,
  pageFlashTimer: null,
  bookmarkPulseTimer: null,
};

// ════════════════════════════════════════
// UTILITAIRES
// ════════════════════════════════════════
function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getTouchDistance(touches) {
  if (!touches || touches.length < 2) return 0;
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.hypot(dx, dy);
}

function showToast(message) {
  if (!message) return;
  dom.toast.textContent = message;
  dom.toast.hidden = false;
  if (state.toastTimer) window.clearTimeout(state.toastTimer);
  state.toastTimer = window.setTimeout(() => { dom.toast.hidden = true; }, 2600);
}

function setGateMessage(message, kind = "") {
  dom.gateMessage.textContent = message || "";
  dom.gateMessage.className = `gate-message${kind ? ` ${kind}` : ""}`;
}

function setGateBusy(isBusy, message = "") {
  dom.loginBtn.disabled = !!isBusy;
  dom.gateBusy.hidden = !isBusy;
  if (message) dom.gateBusyText.textContent = message;
}

function setSaveStatus(message, kind = "") {
  dom.saveStatus.textContent = message || "";
  dom.saveStatus.className = `save-status${kind ? ` status-${kind}` : ""}`;
}

function setNoteStatus(message, kind = "") {
  dom.noteStatus.textContent = message || "";
  dom.noteStatus.className = `save-status${kind ? ` status-${kind}` : ""}`;
}

function setPublishStatus(message, success = false) {
  dom.publishStatus.textContent = message || "";
  dom.publishStatus.className = success ? "save-status status-success" : "save-status";
}

function switchScreen(name) {
  dom.gate.hidden = name !== "gate";
  dom.library.hidden = name !== "library";
  dom.reader.hidden = name !== "reader";
  dom.readerNav.hidden = name !== "reader";
  dom.topProgressBar.hidden = name !== "reader" || !state.showProgressBar;
}

function toggleMenu(force) {
  const shouldOpen = typeof force === "boolean" ? force : dom.controlPanel.hidden;
  dom.controlPanel.hidden = !shouldOpen;
  dom.menuBackdrop.hidden = !shouldOpen;
  dom.menuToggle.setAttribute("aria-expanded", String(shouldOpen));
}

function pulseElement(node, className, duration = 520) {
  if (!node) return;
  node.classList.remove(className);
  void node.offsetWidth;
  node.classList.add(className);
  window.setTimeout(() => node.classList.remove(className), duration);
}

function animatePageFeedback(direction = "next", options = {}) {
  const { fromBookmark = false } = options;
  const animationClass = direction === "prev" ? "page-turn-prev" : "page-turn-next";
  dom.readingSurface.classList.remove("page-turn-next", "page-turn-prev", "bookmark-jump");
  void dom.readingSurface.offsetWidth;
  dom.readingSurface.classList.add(animationClass);
  if (state.pageAnimationTimer) window.clearTimeout(state.pageAnimationTimer);
  state.pageAnimationTimer = window.setTimeout(() => {
    dom.readingSurface.classList.remove(animationClass);
  }, 260);

  pulseElement(dom.navPageBtn, "page-indicator-flash", 480);
  pulseElement(dom.topProgressLabel, "page-indicator-flash", 480);

  if (fromBookmark) {
    dom.readingSurface.classList.add("bookmark-jump");
    if (state.bookmarkPulseTimer) window.clearTimeout(state.bookmarkPulseTimer);
    state.bookmarkPulseTimer = window.setTimeout(() => {
      dom.readingSurface.classList.remove("bookmark-jump");
      state.lastOpenedBookmarkPage = 0;
      renderBookmarks();
    }, 900);
  }
}

function markBookmarkArrival(pageNumber) {
  state.lastOpenedBookmarkPage = Number(pageNumber) || 0;
  renderBookmarks();
}

// ════════════════════════════════════════
// SESSION — PERSIST / RESTORE
// ════════════════════════════════════════
function saveSession() {
  if (!state.email) return;
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      email: state.email,
      isAdminCandidate: state.isAdminCandidate,
      adminUnlocked: state.adminUnlocked,
      adminCode: state.adminCode,
    }));
  } catch (_) { /* localStorage peut être désactivé */ }
}

function clearSession() {
  try { localStorage.removeItem(SESSION_KEY); } catch (_) {}
  try { localStorage.removeItem(LS_CURRENT_BOOK_KEY); } catch (_) {}
}

function restoreSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (!data?.email) return false;
    state.email = data.email;
    state.isAdminCandidate = !!data.isAdminCandidate;
    state.adminUnlocked = !!data.adminUnlocked;
    state.adminCode = data.adminCode || "";
    return true;
  } catch (_) {
    return false;
  }
}

// Change 8: Save/restore current book and page across reloads
function saveCurrentBookState() {
  if (!state.currentBook) return;
  try {
    localStorage.setItem(LS_CURRENT_BOOK_KEY, JSON.stringify({
      bookId: state.currentBook.bookId,
      page: state.currentPage,
    }));
  } catch (_) {}
}

function clearCurrentBookState() {
  try { localStorage.removeItem(LS_CURRENT_BOOK_KEY); } catch (_) {}
}

// ════════════════════════════════════════
// JSONP — appels GET vers Apps Script
// ════════════════════════════════════════
function jsonp(action, params = {}) {
  return new Promise((resolve, reject) => {
    const baseUrl = CONFIG.appsScriptUrl;
    if (!baseUrl) { reject(new Error("URL Apps Script absente.")); return; }

    const callbackName = `jsonp_cb_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const url = new URL(baseUrl);
    url.searchParams.set("action", action);
    url.searchParams.set("prefix", callbackName);
    url.searchParams.set("_ts", String(Date.now()));

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });

    const script = document.createElement("script");
    const cleanup = () => { delete window[callbackName]; script.remove(); };

    const timeoutId = window.setTimeout(() => {
      cleanup();
      reject(new Error("Délai dépassé lors de la connexion au service."));
    }, 22000);

    window[callbackName] = (payload) => {
      window.clearTimeout(timeoutId);
      cleanup();
      resolve(payload);
    };

    script.onerror = () => {
      window.clearTimeout(timeoutId);
      cleanup();
      reject(new Error("Impossible de joindre le service."));
    };

    script.src = url.toString();
    document.body.appendChild(script);
  });
}

// ════════════════════════════════════════
// POST vers Apps Script
// CORRECTION CRITIQUE : URLSearchParams au lieu de FormData
// → e.parameter dans Apps Script reçoit tous les champs correctement
// ════════════════════════════════════════
async function postAdminAction(params) {
  const baseUrl = CONFIG.appsScriptUrl;
  if (!baseUrl) throw new Error("URL Apps Script absente.");

  const body = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== null) {
      body.append(key, String(val));
    }
  }

  // On tente d'abord sans no-cors pour lire la réponse.
  // Si CORS bloque (peu probable sur Apps Script deployed as Anyone),
  // on retombe sur no-cors en fallback silencieux.
  try {
    const response = await fetch(baseUrl, { method: "POST", body });
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (_) {
      return { ok: false, message: "Réponse non JSON du service." };
    }
  } catch (_) {
    // Fallback no-cors si CORS non disponible — response opaque mais la requête passe
    await fetch(baseUrl, { method: "POST", mode: "no-cors", body });
    return { ok: true, opaque: true, message: "Requête envoyée." };
  }
}

// ════════════════════════════════════════
// AUTH & LIVRES
// ════════════════════════════════════════
async function auth(email) {
  return jsonp("auth", { email });
}

async function refreshBooks() {
  if (!state.email) return;
  const response = await jsonp("listBooks", {
    email: state.email,
    adminCode: state.adminUnlocked ? state.adminCode : "",
  });
  if (!response?.ok) throw new Error(response?.message || "Impossible de charger les livres.");
  state.books = Array.isArray(response.books) ? response.books : [];
  renderBookList();
  renderAdminBooks();
}

// ════════════════════════════════════════
// PROGRESSION
// ════════════════════════════════════════
async function fetchProgress(bookId) {
  const response = await jsonp("getProgress", { email: state.email, bookId });
  if (!response?.ok) return null;
  return response.progress || null;
}

function buildProgressPayload() {
  const progressPercent = state.totalPages
    ? Math.round((state.currentPage / state.totalPages) * 1000) / 10
    : 0;
  return {
    email: state.email,
    bookId: state.currentBook?.bookId,
    title: state.currentBook?.title,
    currentPage: state.currentPage,
    totalPages: state.totalPages,
    progressPercent,
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
    setSaveStatus("Progression enregistrée", "success");
  } catch (error) {
    console.error(error);
    setSaveStatus("Sauvegarde impossible", "error");
    showToast("Sauvegarde impossible");
  }
}

function scheduleSave() {
  if (state.saveTimer) window.clearTimeout(state.saveTimer);
  state.saveTimer = window.setTimeout(() => saveProgress(), CONFIG.autoSaveDelayMs || 450);
}

// ════════════════════════════════════════
// SIGNETS
// ════════════════════════════════════════
async function loadBookmarks() {
  if (!state.currentBook) return;
  const response = await jsonp("listBookmarks", {
    email: state.email, bookId: state.currentBook.bookId,
  });
  state.bookmarks = response?.ok && Array.isArray(response.bookmarks) ? response.bookmarks : [];
  renderBookmarks();
}

async function addBookmark() {
  if (!state.currentBook || state.isBookmarkSaving) return;
  if (state.bookmarks.some((b) => Number(b.page) === state.currentPage)) {
    showToast(`Signet déjà présent à la page ${state.currentPage}`);
    return;
  }
  state.isBookmarkSaving = true;
  dom.bookmarkBtn.disabled = true;
  setSaveStatus("Sauvegarde du signet en cours, veuillez patienter…", "pending");
  try {
    const response = await jsonp("addBookmark", {
      email: state.email, bookId: state.currentBook.bookId, page: state.currentPage,
    });
    if (!response?.ok) throw new Error(response?.message);
    await loadBookmarks();
    markBookmarkArrival(state.currentPage);
    setSaveStatus(`Signet enregistré à la page ${state.currentPage}`, "success");
    showToast(`Signet ajouté - page ${state.currentPage}`);
  } catch (error) {
    console.error(error);
    setSaveStatus("Impossible d'enregistrer le signet", "error");
    showToast("Impossible d'ajouter le signet");
  } finally {
    state.isBookmarkSaving = false;
    dom.bookmarkBtn.disabled = false;
  }
}

async function removeBookmark(page) {
  if (!state.currentBook) return;
  try {
    const response = await jsonp("removeBookmark", {
      email: state.email, bookId: state.currentBook.bookId, page,
    });
    if (!response?.ok) throw new Error(response?.message);
    await loadBookmarks();
    showToast("Signet supprimé");
  } catch (error) {
    console.error(error);
    showToast("Impossible de supprimer le signet");
  }
}

function renderBookmarks() {
  if (!state.bookmarks.length) {
    dom.bookmarkList.innerHTML = `<div class="empty-state">Aucun signet pour ce livre.</div>`;
    return;
  }
  const sorted = [...state.bookmarks].sort((a, b) => Number(a.page) - Number(b.page));
  dom.bookmarkList.innerHTML = sorted.map((b) => {
    const page = Number(b.page) || 0;
    const isCurrent = page === state.currentPage;
    const isPulsed = page === state.lastOpenedBookmarkPage;
    const classes = ["bookmark-chip"];
    if (isCurrent) classes.push("active");
    if (isPulsed) classes.push("bookmark-pulse");
    return `
      <div class="${classes.join(" ")}">
        <button type="button" data-bookmark-page="${page}">Page ${page}</button>
        <button type="button" data-remove-bookmark="${page}">Retirer</button>
      </div>
    `;
  }).join("");
}

// ════════════════════════════════════════
// NOTES
// ════════════════════════════════════════
async function loadNotes() {
  if (!state.currentBook) return;
  const response = await jsonp("listNotes", {
    email: state.email, bookId: state.currentBook.bookId,
  });
  state.notes = response?.ok && Array.isArray(response.notes) ? response.notes : [];
  renderNotes();
}

function getCurrentPageNotes() {
  return state.notes.filter((n) => Number(n.page) === state.currentPage);
}

function renderNotes() {
  const pageNotes = getCurrentPageNotes();
  if (!pageNotes.length) {
    dom.notesList.innerHTML = `<div class="empty-state">Aucune note pour cette page.</div>`;
    return;
  }
  dom.notesList.innerHTML = pageNotes
    .sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")))
    .map((note) => `
      <div class="note-card">
        <div>
          <div class="note-card-meta">${escapeHtml(formatDateTime(note.updatedAt || note.createdAt))}</div>
          <div class="note-card-text">${escapeHtml(note.noteText)}</div>
        </div>
        <div class="note-card-actions">
          <button type="button" data-edit-note="${escapeHtml(note.noteId)}">Modifier</button>
          <button type="button" data-delete-note="${escapeHtml(note.noteId)}">Supprimer</button>
        </div>
      </div>
    `).join("");
}

function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("fr-CA", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function resetNoteEditor() {
  state.editingNoteId = "";
  dom.noteInput.value = "";
  setNoteStatus("");
}

function startEditingNote(noteId) {
  const note = state.notes.find((n) => n.noteId === noteId);
  if (!note) return;
  state.editingNoteId = note.noteId;
  dom.noteInput.value = note.noteText || "";
  dom.noteInput.focus();
  setNoteStatus("Modification en cours");
}

async function saveCurrentNote() {
  if (!state.currentBook) return;
  const noteText = dom.noteInput.value.trim();
  if (!noteText) { setNoteStatus("La note est vide", "error"); return; }
  if (noteText.length > 1200) { setNoteStatus("La note est trop longue", "error"); return; }
  try {
    const response = await jsonp("saveNote", {
      email: state.email, bookId: state.currentBook.bookId,
      page: state.currentPage, noteId: state.editingNoteId, noteText,
    });
    if (!response?.ok) throw new Error(response?.message);
    await loadNotes();
    resetNoteEditor();
    setNoteStatus("Note enregistrée", "success");
  } catch (error) {
    console.error(error);
    setNoteStatus("Sauvegarde impossible", "error");
  }
}

async function deleteNote(noteId) {
  if (!state.currentBook) return;
  try {
    const response = await jsonp("deleteNote", {
      email: state.email, bookId: state.currentBook.bookId, noteId,
    });
    if (!response?.ok) throw new Error(response?.message);
    if (state.editingNoteId === noteId) resetNoteEditor();
    await loadNotes();
    setNoteStatus("Note supprimée", "success");
  } catch (error) {
    console.error(error);
    setNoteStatus("Suppression impossible", "error");
  }
}

// ════════════════════════════════════════
// RENDU BIBLIOTHÈQUE
// ════════════════════════════════════════
function computePublicAssetUrl(path) {
  if (!path) return "";
  return `./${String(path).replace(/^\.\//, "").replace(/^\//, "")}`;
}

function coverHtml(book, className = "book-cover") {
  if (book.coverPath) {
    return `<div class="${className}"><img src="${escapeHtml(computePublicAssetUrl(book.coverPath))}" alt="Couverture de ${escapeHtml(book.title)}" loading="lazy"></div>`;
  }
  return `<div class="cover-placeholder">${escapeHtml((book.title || "?").trim().slice(0, 1).toUpperCase())}</div>`;
}

function renderBookList() {
  dom.libraryMeta.textContent = state.isAdminCandidate
    ? `${state.email} — mode administrateur disponible`
    : state.email;
  const books = state.books.filter((b) => b.published || state.adminUnlocked);
  if (!books.length) {
    dom.bookList.innerHTML = `<div class="empty-state">Aucun livre publié pour le moment.</div>`;
    return;
  }
  dom.bookList.innerHTML = books.map((book) => `
    <article class="book-card">
      ${coverHtml(book)}
      <div>
        <div class="badge ${book.published ? "published" : "hidden"}">${book.published ? "Publié" : "Non publié"}</div>
        <h3>${escapeHtml(book.title)}</h3>
        <p class="book-meta">${book.author ? escapeHtml(book.author) : "Auteur non indiqué"}</p>
        <p class="book-meta">${book.totalPages ? `${book.totalPages} pages` : "Nombre de pages inconnu"}</p>
        <div class="book-actions">
          <button class="nav-btn" type="button" data-open-book="${escapeHtml(book.bookId)}">Ouvrir</button>
        </div>
      </div>
    </article>
  `).join("");
}

function renderAdminBooks() {
  if (!state.isAdminCandidate) return;
  if (!state.adminUnlocked) {
    dom.adminBooksList.innerHTML = `<div class="empty-state">Déverrouille le module administrateur pour voir la gestion complète.</div>`;
    return;
  }
  if (!state.books.length) {
    dom.adminBooksList.innerHTML = `<div class="empty-state">Aucun livre enregistré.</div>`;
    return;
  }
  dom.adminBooksList.innerHTML = state.books.map((book) => `
    <article class="admin-book-card">
      ${coverHtml(book, "admin-book-cover")}
      <div>
        <div class="badge ${book.published ? "published" : "hidden"}">${book.published ? "Publié" : "Masqué"}</div>
        <h4>${escapeHtml(book.title)}</h4>
        <p>${book.author ? escapeHtml(book.author) : "Auteur non indiqué"}</p>
        <p>${book.totalPages ? `${book.totalPages} pages` : "Pages inconnues"}</p>
        <div class="admin-book-actions">
          <button class="secondary-btn" type="button" data-open-book="${escapeHtml(book.bookId)}">Ouvrir</button>
          <button class="ghost-btn" type="button" data-toggle-book="${escapeHtml(book.bookId)}">${book.published ? "Masquer" : "Publier"}</button>
          <button class="ghost-btn" type="button" data-toggle-pdf="${escapeHtml(book.bookId)}">${book.pdfAllowed ? "PDF : OUI" : "PDF : NON"}</button>
          <button class="ghost-btn" type="button" data-edit-book="${escapeHtml(book.bookId)}">Modifier</button>
        </div>
      </div>
    </article>
  `).join("");
}

// ════════════════════════════════════════
// LECTEUR — CHARGEMENT
// ════════════════════════════════════════
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

// ════════════════════════════════════════
// LECTEUR — RENDU
// ════════════════════════════════════════
function rebuildReadingSurfaceClasses() {
  dom.readingSurface.classList.remove("mode-text", "mode-pdf", "theme-paper", "theme-night", ...FONT_CLASSES);
  dom.readingSurface.classList.add(state.mode === "text" ? "mode-text" : "mode-pdf");
  dom.readingSurface.classList.add(state.theme === "night" ? "theme-night" : "theme-paper");
  dom.readingSurface.classList.add(FONT_CLASSES[state.fontIndex] || FONT_CLASSES[1]);
}

function updateUiLabels() {
  const total = state.totalPages || 0;
  dom.pageLabel.textContent = `Page ${state.currentPage} / ${total}`;
  dom.pageInput.value = String(state.currentPage || 1);

  const pct = total ? Math.round((state.currentPage / total) * 1000) / 10 : 0;
  dom.progressText.textContent = `${pct} %`;
  dom.progressBar.style.width = `${Math.max(0, Math.min(100, pct))}%`;

  // Barre de progression supérieure
  dom.topProgressFill.style.width = `${Math.max(0, Math.min(100, pct))}%`;
  if (state.progressMode === "percent") {
    dom.topProgressLabel.textContent = `${pct} %`;
  } else {
    dom.topProgressLabel.textContent = `${state.currentPage} / ${total} pages`;
  }
  dom.topProgressBar.hidden = !state.showProgressBar || dom.reader.hidden;

  // Navigation inférieure
  dom.navPageText.textContent = `${state.currentPage} / ${total}`;
  dom.navPrevBtn.disabled = state.currentPage <= 1;
  dom.navNextBtn.disabled = state.currentPage >= total;

  // Boutons menu
  dom.modeToggleBtn.textContent = state.mode === "text" ? "Mode PDF" : "Mode texte";
  dom.themeBtn.textContent = state.theme === "paper" ? "Mode nuit" : "Mode clair";
  dom.progressBarToggleBtn.textContent = state.showProgressBar ? "Masquer progression" : "Barre de progression";
  dom.docLabel.textContent = state.currentBook?.title || "Document";
  dom.prevBtn.disabled = state.currentPage <= 1;
  dom.nextBtn.disabled = state.currentPage >= total;

  // PDF controls visibility
  const pdfAllowed = !!state.currentBook?.pdfAllowed;
  dom.modeToggleBtn.hidden = !pdfAllowed;
  dom.fitBtn.hidden = !pdfAllowed || state.mode === "text";
  dom.fontSizeBtn.hidden = state.mode === "pdf";

  renderBookmarks();
  renderNotes();
}

function normalizeLineText(parts) {
  return parts.join(" ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/([«(])\s+/g, "$1")
    .replace(/\s+([»)])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function buildStructuredPageFromPlainText(rawText = "") {
  const source = String(rawText || "")
    .replace(/\r/g, "").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  if (!source || source.replace(/\s+/g, "").length < 18) {
    return { html: "", text: "", charCount: 0, renderMode: "pdf" };
  }
  const lines = source.split(/\n/).map((l) => l.trim()).filter(Boolean);
  const blocks = [];
  let buffer = [];
  const pushBuffer = () => {
    if (!buffer.length) return;
    blocks.push({ type: "paragraph", text: buffer.join(" ").replace(/\s+([,.;:!?])/g, "$1").trim() });
    buffer = [];
  };
  for (const line of lines) {
    const isDialogue = /^[-–—]\s*/.test(line);
    const isCentered = /^[A-ZÉÈÀÂÊÎÔÛÇ][A-ZÉÈÀÂÊÎÔÛÇ''\s]{4,}$/.test(line) && line.length <= 60;
    if (isDialogue) { pushBuffer(); blocks.push({ type: "dialogue", text: line.replace(/^[-–—]\s*/, "- ") }); continue; }
    if (isCentered) { pushBuffer(); blocks.push({ type: "centered", text: line }); continue; }
    if (buffer.length) {
      const prev = buffer[buffer.length - 1];
      const prevEnds = /[.!?…:]$/.test(prev);
      if (/^[«"A-ZÉÈÀÂÊÎÔÛÇ]/.test(line) && prevEnds && line.length > 30) pushBuffer();
    }
    buffer.push(line);
  }
  pushBuffer();
  if (!blocks.length) return { html: "", text: source, charCount: source.length, renderMode: "pdf" };
  const html = blocks.map((b) => {
    if (b.type === "dialogue") return `<p class="dialogue">${escapeHtml(b.text)}</p>`;
    if (b.type === "centered") return `<p class="centered">${escapeHtml(b.text)}</p>`;
    return `<p>${escapeHtml(b.text)}</p>`;
  }).join("");
  return { html, text: blocks.map((b) => b.text).join("\n\n"), charCount: source.replace(/\s+/g, "").length, renderMode: "text" };
}

function getRenderableTextPage(pageNumber) {
  const page = state.textDoc?.pages?.[pageNumber - 1];
  if (!page) return null;
  if (page.renderMode === "pdf") return { renderMode: "pdf" };
  if (page.html) return { renderMode: "text", html: page.html, text: page.text || "" };
  return buildStructuredPageFromPlainText(page.text || "");
}

async function renderTextPage(pageNumber) {
  const page = getRenderableTextPage(pageNumber);
  if (!page || page.renderMode === "pdf" || !page.html) {
    if (!state.pdfDoc) await loadPdfDocument(state.currentBook);
    dom.textViewer.hidden = true;
    dom.pdfViewer.hidden = false;
    await renderPdfPage(pageNumber, { forceFit: true });
    if (state.fallbackNoticeShownForPage !== pageNumber) {
      state.fallbackNoticeShownForPage = pageNumber;
      showToast("Cette page s'affiche en mode PDF pour conserver sa mise en page.");
    }
    return;
  }
  state.fallbackNoticeShownForPage = 0;
  dom.textViewer.hidden = false;
  dom.pdfViewer.hidden = true;
  dom.textViewer.innerHTML = `
    <article class="text-page">
      <h2>Page ${pageNumber}</h2>
      <div class="text-content">${page.html}</div>
    </article>
  `;
}

function computeFitScale(page) {
  const shellWidth = Math.max(280, dom.viewerShell.clientWidth - 20);
  const viewport = page.getViewport({ scale: 1 });
  return shellWidth / viewport.width;
}

async function renderPdfPage(pageNumber, { forceFit = false } = {}) {
  if (!state.pdfDoc) await loadPdfDocument(state.currentBook);
  const renderToken = ++state.renderToken;
  const page = await state.pdfDoc.getPage(pageNumber);
  if (forceFit) state.pdfZoomMultiplier = 1;
  const scale = computeFitScale(page) * state.pdfZoomMultiplier;
  const viewport = page.getViewport({ scale });
  const outputScale = window.devicePixelRatio || 1;
  const context = dom.pdfCanvas.getContext("2d", { alpha: false });
  dom.pdfCanvas.width = Math.floor(viewport.width * outputScale);
  dom.pdfCanvas.height = Math.floor(viewport.height * outputScale);
  dom.pdfCanvas.style.width = `${Math.round(viewport.width)}px`;
  dom.pdfCanvas.style.height = `${Math.round(viewport.height)}px`;
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, dom.pdfCanvas.width, dom.pdfCanvas.height);
  const renderContext = {
    canvasContext: context,
    viewport,
    transform: outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null,
  };
  await page.render(renderContext).promise;
  if (renderToken !== state.renderToken) return;
  dom.viewerShell.scrollTop = 0;
  dom.viewerShell.scrollTo({ top: 0, behavior: "instant" });
}

async function renderCurrentPage({ forceFit = false } = {}) {
  if (!state.currentBook) return;
  updateUiLabels();
  rebuildReadingSurfaceClasses();
  if (state.mode === "text") {
    await renderTextPage(state.currentPage);
  } else {
    dom.textViewer.hidden = true;
    dom.pdfViewer.hidden = false;
    await renderPdfPage(state.currentPage, { forceFit });
  }
  // Change 5: always scroll to top after any page render
  dom.viewerShell.scrollTop = 0;
  dom.viewerShell.scrollTo({ top: 0, behavior: "instant" });
  window.scrollTo(0, 0);
}

async function goToPage(pageNumber, { save = true, reason = "nav" } = {}) {
  if (!state.totalPages) return;
  const next = Math.max(1, Math.min(state.totalPages, Number(pageNumber) || 1));
  if (next === state.currentPage && save) return;
  const previous = state.currentPage;
  if (reason === "bookmark") {
    markBookmarkArrival(next);
  } else {
    state.lastOpenedBookmarkPage = 0;
  }
  state.currentPage = next;
  await renderCurrentPage();
  const direction = next < previous ? "prev" : "next";
  animatePageFeedback(direction, { fromBookmark: reason === "bookmark" });
  dom.viewerShell.scrollTop = 0;
  window.scrollTo(0, 0);
  if (save) {
    scheduleSave();
    saveCurrentBookState();
  }
}

async function openBook(book) {
  state.currentBook = book;
  state.currentPage = 1;
  state.totalPages = Number(book.totalPages) || 0;
  state.pdfDoc = null;
  state.textDoc = null;
  state.lastSaveSignature = "";
  state.bookmarks = [];
  state.notes = [];
  state.editingNoteId = "";
  state.pdfZoomMultiplier = 1;
  state.fallbackNoticeShownForPage = 0;

  setSaveStatus("Chargement...");
  switchScreen("reader");
  toggleMenu(false);

  // Change 3: show loading overlay
  dom.bookLoadingOverlay.hidden = false;

  try {
    const [progress, bookmarksResult, notesResult, textDoc] = await Promise.all([
      fetchProgress(book.bookId),
      jsonp("listBookmarks", { email: state.email, bookId: book.bookId }).catch(() => ({ ok: false })),
      jsonp("listNotes", { email: state.email, bookId: book.bookId }).catch(() => ({ ok: false })),
      loadTextJson(book).catch(() => null),
    ]);

    state.bookmarks = bookmarksResult?.ok && Array.isArray(bookmarksResult.bookmarks) ? bookmarksResult.bookmarks : [];
    state.notes = notesResult?.ok && Array.isArray(notesResult.notes) ? notesResult.notes : [];
    state.textDoc = textDoc;

    if (textDoc?.totalPages) state.totalPages = Number(textDoc.totalPages) || state.totalPages;
    if (!state.totalPages || !textDoc) {
      const pdfDoc = await loadPdfDocument(book);
      state.totalPages = pdfDoc.numPages;
    }

    // PDF mode uniquement si pdfAllowed ET pas de JSON
    const pdfAllowed = !!book.pdfAllowed;
    state.mode = textDoc ? (CONFIG.defaultReaderMode || "text") : (pdfAllowed ? "pdf" : "text");
    const restoredPage = progress?.currentPage ? Number(progress.currentPage) : 1;
    state.currentPage = Math.max(1, Math.min(state.totalPages, restoredPage));
    resetNoteEditor();
    await renderCurrentPage({ forceFit: true });
    setSaveStatus("Prêt");
    // Change 8: persist current book state
    saveCurrentBookState();
  } finally {
    // Change 3: hide loading overlay
    dom.bookLoadingOverlay.hidden = true;
  }
}

function getBookById(bookId) {
  return state.books.find((b) => b.bookId === bookId) || null;
}

function roundTo(value, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round((Number(value) || 0) * factor) / factor;
}

function updateFontOrZoom(delta) {
  if (state.mode === "text") {
    state.fontIndex = Math.max(0, Math.min(FONT_CLASSES.length - 1, state.fontIndex + delta));
    localStorage.setItem(LS_FONT_KEY, String(state.fontIndex));
    void renderCurrentPage();
    return;
  }
  const step = CONFIG.pdfZoomStep || 0.15;
  const minZoom = CONFIG.minPdfZoom || 0.85;
  const maxZoom = CONFIG.maxPdfZoom || 2.4;
  state.pdfZoomMultiplier = roundTo(Math.max(minZoom, Math.min(maxZoom, state.pdfZoomMultiplier + delta * step)), 2);
  void renderCurrentPage();
}

function fitCurrentView() {
  state.pdfZoomMultiplier = 1;
  void renderCurrentPage({ forceFit: true });
}

// ════════════════════════════════════════
// ADMIN
// ════════════════════════════════════════
function rebuildAdminBookIdFromTitle() {
  if (!dom.bookIdInput.dataset.lockedManual) {
    dom.bookIdInput.value = slugify(dom.bookTitleInput.value);
  }
}

async function unlockAdmin() {
  const code = dom.adminCodeInput.value.trim();
  if (!code) { showToast("Entre le code administrateur"); return; }

  dom.unlockAdminBtn.disabled = true;
  dom.unlockAdminBtn.textContent = "Vérification…";

  try {
    const response = await jsonp("listBooks", { email: state.email, adminCode: code });
    if (!response?.ok) throw new Error(response?.message || "Code invalide.");
    state.adminUnlocked = true;
    state.adminCode = code;
    dom.publishForm.hidden = false;
    dom.githubTestRow.hidden = false;
    dom.addUsersSection.hidden = false;
    setPublishStatus("Module administrateur déverrouillé", true);
    saveSession();
    await refreshBooks();
  } catch (error) {
    console.error(error);
    showToast("Code administrateur invalide");
  } finally {
    dom.unlockAdminBtn.disabled = false;
    dom.unlockAdminBtn.textContent = "Déverrouiller";
  }
}

async function testGithubConnection() {
  dom.testGithubBtn.disabled = true;
  dom.githubTestStatus.textContent = "Test en cours…";
  dom.githubTestStatus.className = "save-status";
  try {
    const response = await jsonp("testGithubToken", {
      email: state.email, adminCode: state.adminCode,
    });
    if (response?.ok) {
      dom.githubTestStatus.textContent = "✓ " + (response.message || "Connexion GitHub réussie");
      dom.githubTestStatus.className = "save-status status-success";
    } else {
      dom.githubTestStatus.textContent = "✗ " + (response?.message || "Échec");
      dom.githubTestStatus.className = "save-status status-error";
    }
  } catch (error) {
    dom.githubTestStatus.textContent = "✗ " + error.message;
    dom.githubTestStatus.className = "save-status status-error";
  } finally {
    dom.testGithubBtn.disabled = false;
  }
}

async function toggleBookPublished(bookId) {
  if (!state.adminUnlocked) return;
  try {
    const book = getBookById(bookId);
    const response = await jsonp("toggleBookPublished", {
      email: state.email, adminCode: state.adminCode,
      bookId, published: book && book.published ? "false" : "true",
    });
    if (!response?.ok) throw new Error(response?.message || "Impossible de changer le statut.");
    await refreshBooks();
    showToast("Statut mis à jour");
  } catch (error) {
    console.error(error);
    showToast("Impossible de changer le statut");
  }
}

async function toggleBookPdfAllowed(bookId) {
  if (!state.adminUnlocked) return;
  try {
    const book = getBookById(bookId);
    const response = await jsonp("setPdfAllowed", {
      email: state.email, adminCode: state.adminCode,
      bookId, pdfAllowed: book && book.pdfAllowed ? "false" : "true",
    });
    if (!response?.ok) throw new Error(response?.message || "Impossible de changer l'autorisation PDF.");
    await refreshBooks();
    showToast("Autorisation PDF mise à jour");
  } catch (error) {
    console.error(error);
    showToast("Impossible de modifier l'autorisation PDF");
  }
}

// Change 6: Edit book metadata
function openEditBookModal(bookId) {
  const book = getBookById(bookId);
  if (!book) return;
  dom.editBookId.value = book.bookId;
  dom.editBookTitle.value = book.title || "";
  dom.editBookAuthor.value = book.author || "";
  dom.editBookDescription.value = book.description || "";
  dom.editBookStatus.textContent = "";
  dom.editBookModal.hidden = false;
}

async function saveEditBook() {
  const bookId = dom.editBookId.value.trim();
  const title = dom.editBookTitle.value.trim();
  const author = dom.editBookAuthor.value.trim();
  const description = dom.editBookDescription.value.trim();
  if (!title) { dom.editBookStatus.textContent = "Le titre est requis."; return; }
  dom.editBookSaveBtn.disabled = true;
  dom.editBookStatus.textContent = "Enregistrement…";
  try {
    const response = await jsonp("updateBook", {
      email: state.email, adminCode: state.adminCode,
      bookId, title, author, description,
    });
    if (!response?.ok) throw new Error(response?.message || "Impossible de modifier le livre.");
    dom.editBookModal.hidden = true;
    await refreshBooks();
    showToast("Livre modifié");
  } catch (error) {
    console.error(error);
    dom.editBookStatus.textContent = error.message || "Erreur lors de la modification.";
  } finally {
    dom.editBookSaveBtn.disabled = false;
  }
}

// Change 7: Add users in bulk
async function addUsersInBulk() {
  const raw = dom.addUsersTextarea.value.trim();
  if (!raw) { dom.addUsersStatus.textContent = "Aucune adresse saisie."; return; }
  const emails = raw.split(/[\n,;]+/).map((e) => normalizeEmail(e)).filter((e) => isValidEmail(e));
  if (!emails.length) { dom.addUsersStatus.textContent = "Aucune adresse valide trouvée."; return; }
  if (emails.length > 100) { dom.addUsersStatus.textContent = "Maximum 100 adresses à la fois."; return; }
  dom.addUsersBtn.disabled = true;
  dom.addUsersStatus.textContent = `Ajout de ${emails.length} utilisateur(s)…`;
  try {
    const response = await jsonp("addUsers", {
      email: state.email, adminCode: state.adminCode,
      emails: emails.join(","),
    });
    if (!response?.ok) throw new Error(response?.message || "Impossible d'ajouter les utilisateurs.");
    dom.addUsersTextarea.value = "";
    dom.addUsersStatus.textContent = `✓ ${emails.length} utilisateur(s) ajouté(s)`;
    showToast(`${emails.length} utilisateur(s) ajouté(s)`);
  } catch (error) {
    console.error(error);
    dom.addUsersStatus.textContent = error.message || "Erreur lors de l'ajout.";
  } finally {
    dom.addUsersBtn.disabled = false;
  }
}

// ════════════════════════════════════════
// PUBLICATION
// ════════════════════════════════════════
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

function detectCoverExtension(file) {
  const name = String(file?.name || "").toLowerCase();
  if (name.endsWith(".png")) return "png";
  if (name.endsWith(".webp")) return "webp";
  return "jpg";
}

function buildLineFromWords(words) {
  const parts = [];
  let prevRight = null;
  for (const word of words) {
    const text = String(word.text || "").trim();
    if (!text) continue;
    const left = Number(word.x) || 0;
    if (!parts.length) { parts.push(text); }
    else {
      const gap = prevRight === null ? 0 : left - prevRight;
      const noLeadSpace = /^[,.;:!?%)\]»]/.test(text);
      const noTrailSpace = /[(\[«]$/.test(parts[parts.length - 1]);
      if (noLeadSpace || noTrailSpace || gap < 1.5) parts[parts.length - 1] += text;
      else parts.push(text);
    }
    prevRight = (Number(word.x) || 0) + (Number(word.width) || 0);
  }
  return normalizeLineText(parts);
}

function extractStructuredPage(items) {
  if (!Array.isArray(items) || !items.length) return { html: "", text: "", charCount: 0, renderMode: "pdf" };
  const entries = items
    .map((item) => ({
      text: String(item.str || ""),
      x: Number(item.transform?.[4] || 0), y: Number(item.transform?.[5] || 0),
      width: Number(item.width || 0), height: Number(item.height || 0),
    }))
    .filter((item) => item.text && item.text.trim());
  if (!entries.length) return { html: "", text: "", charCount: 0, renderMode: "pdf" };

  const sorted = entries.sort((a, b) => Math.abs(b.y - a.y) > 3 ? b.y - a.y : a.x - b.x);
  const lines = [];
  let currentWords = [], currentY = null, currentHeight = 0;
  for (const entry of sorted) {
    if (currentY === null) { currentWords = [entry]; currentY = entry.y; currentHeight = entry.height || 10; continue; }
    const threshold = Math.max(2.8, (currentHeight || 10) * 0.45);
    if (Math.abs(entry.y - currentY) <= threshold) {
      currentWords.push(entry); currentHeight = Math.max(currentHeight, entry.height || 10);
    } else {
      const ordered = currentWords.sort((a, b) => a.x - b.x);
      lines.push({ text: buildLineFromWords(ordered), y: currentY, height: currentHeight, left: ordered[0]?.x || 0 });
      currentWords = [entry]; currentY = entry.y; currentHeight = entry.height || 10;
    }
  }
  if (currentWords.length) {
    const ordered = currentWords.sort((a, b) => a.x - b.x);
    lines.push({ text: buildLineFromWords(ordered), y: currentY, height: currentHeight, left: ordered[0]?.x || 0 });
  }

  const filteredLines = lines.map((l) => ({ ...l, text: String(l.text || "").trim() })).filter((l) => l.text);
  const avgH = filteredLines.reduce((s, l) => s + (l.height || 0), 0) / Math.max(1, filteredLines.length);
  const leftVals = filteredLines.map((l) => l.left).sort((a, b) => a - b);
  const baseLeft = leftVals[Math.floor(leftVals.length * 0.2)] || 0;

  const blocks = [];
  let paragraph = [], prevLine = null;
  const pushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push({ type: "paragraph", text: paragraph.join(" ").replace(/\s+([,.;:!?])/g, "$1").trim() });
    paragraph = [];
  };
  for (const line of filteredLines) {
    const text = line.text;
    const isDialogue = /^[-–—]\s*/.test(text);
    const isCentered = /^[A-ZÉÈÀÂÊÎÔÛÇ][A-ZÉÈÀÂÊÎÔÛÇ''\s]{4,}$/.test(text) && text.length <= 60;
    const indent = line.left - baseLeft;
    const gap = prevLine ? Math.abs(prevLine.y - line.y) : 0;
    const strongBreak = prevLine && gap > Math.max(avgH * 1.45, 14);
    const indentBreak = indent > Math.max(avgH * 1.2, 16);
    if (isDialogue) { pushParagraph(); blocks.push({ type: "dialogue", text: text.replace(/^[-–—]\s*/, "- ") }); }
    else if (isCentered) { pushParagraph(); blocks.push({ type: "centered", text }); }
    else { if (strongBreak || indentBreak) pushParagraph(); paragraph.push(text); }
    prevLine = line;
  }
  pushParagraph();

  const plainText = blocks.map((b) => b.text).join("\n\n").trim();
  const charCount = plainText.replace(/\s+/g, "").length;
  if (!blocks.length || charCount < 18) return { html: "", text: plainText, charCount, renderMode: "pdf" };

  const html = blocks.map((b) => {
    if (b.type === "dialogue") return `<p class="dialogue">${escapeHtml(b.text)}</p>`;
    if (b.type === "centered") return `<p class="centered">${escapeHtml(b.text)}</p>`;
    return `<p>${escapeHtml(b.text)}</p>`;
  }).join("");
  return { html, text: plainText, charCount, renderMode: "text" };
}

async function convertPdfFileToJson(file, metadata) {
  const arrayBuffer = await file.arrayBuffer();
  const pdfData = new Uint8Array(arrayBuffer);
  const loadingTask = pdfjsLib.getDocument({ data: pdfData });
  const pdf = await loadingTask.promise;
  const pages = [];
  for (let n = 1; n <= pdf.numPages; n++) {
    dom.publishProgress.textContent = `Extraction du texte — page ${n} / ${pdf.numPages}`;
    const page = await pdf.getPage(n);
    const textContent = await page.getTextContent();
    const structured = extractStructuredPage(textContent.items);
    pages.push({ page: n, text: structured.text, html: structured.html, charCount: structured.charCount, renderMode: structured.renderMode });
  }
  return {
    bookId: metadata.bookId, title: metadata.title, author: metadata.author || "",
    sourceFileName: file.name, generatedAt: new Date().toISOString(),
    totalPages: pdf.numPages, pages,
  };
}

async function publishBook(event) {
  event.preventDefault();
  if (!state.adminUnlocked) { showToast("Déverrouille d'abord le module administrateur"); return; }

  const pdfFile = dom.bookPdfInput.files?.[0];
  if (!pdfFile) { showToast("Choisis un PDF"); return; }

  const title = dom.bookTitleInput.value.trim();
  const bookId = slugify(dom.bookIdInput.value.trim() || title || pdfFile.name.replace(/\.pdf$/i, ""));
  const author = dom.bookAuthorInput.value.trim();
  const coverFile = dom.bookCoverInput.files?.[0] || null;

  if (!title || !bookId) { showToast("Titre ou identifiant manquant"); return; }

  // Avertissement si fichier volumineux
  const warnMB = CONFIG.pdfWarnSizeMB || 10;
  dom.publishSizeWarning.hidden = pdfFile.size < warnMB * 1024 * 1024;

  dom.publishBtn.disabled = true;
  setPublishStatus("Préparation...");
  dom.publishProgress.textContent = "Lecture du PDF local…";

  try {
    const jsonDoc = await convertPdfFileToJson(pdfFile, { title, bookId, author });
    dom.publishProgress.textContent = "Encodage du PDF en base64…";
    const pdfBase64 = arrayBufferToBase64(await pdfFile.arrayBuffer());
    const jsonBase64 = utf8ToBase64(JSON.stringify(jsonDoc, null, 2));

    let coverBase64 = "";
    let coverExt = "";
    if (coverFile) {
      dom.publishProgress.textContent = "Préparation de la couverture…";
      coverBase64 = arrayBufferToBase64(await coverFile.arrayBuffer());
      coverExt = detectCoverExtension(coverFile);
    }

    dom.publishProgress.textContent = "Envoi au service de publication GitHub…";
    setPublishStatus("Publication en cours…");

    const params = {
      action: "publishBook",
      email: state.email,
      adminCode: state.adminCode,
      bookId,
      title,
      author,
      publishNow: dom.publishNowInput.checked ? "true" : "false",
      sourceFileName: pdfFile.name,
      totalPages: String(jsonDoc.totalPages),
      pdfBase64,
      jsonBase64,
      repoOwner: CONFIG.githubRepoOwner || "",
      repoName: CONFIG.githubRepoName || "",
      repoBranch: CONFIG.githubRepoBranch || "main",
      assetsBasePath: CONFIG.githubAssetsBasePath || "assets/books",
    };
    if (coverBase64) {
      params.coverBase64 = coverBase64;
      params.coverExt = coverExt;
    }

    const postResult = await postAdminAction(params);

    // Si on a pu lire la réponse (pas opaque), on la traite directement
    if (!postResult?.opaque) {
      if (postResult?.ok) {
        setPublishStatus("Livre publié avec succès", true);
        dom.publishProgress.textContent = "Le PDF, le JSON et la couverture sont publiés dans GitHub.";
        dom.publishForm.reset();
        dom.bookIdInput.dataset.lockedManual = "";
        dom.publishSizeWarning.hidden = true;
        await refreshBooks();
        return;
      } else {
        throw new Error(postResult?.message || "Échec de publication côté serveur.");
      }
    }

    // Réponse opaque (CORS fallback) — polling
    dom.publishProgress.textContent = "Vérification de la publication dans GitHub…";
    let published = false;
    const maxAttempts = CONFIG.maxPublishPollAttempts || 6;
    const delay = CONFIG.publishPollDelayMs || 6000;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await new Promise((res) => window.setTimeout(res, delay));
      dom.publishProgress.textContent = `Vérification ${attempt}/${maxAttempts}…`;
      await refreshBooks();
      const book = getBookById(bookId);
      if (book && book.jsonPath && book.pdfPath) { published = true; break; }
    }

    if (published) {
      setPublishStatus("Livre publié", true);
      dom.publishProgress.textContent = "PDF, JSON et couverture publiés dans le dépôt GitHub.";
      dom.publishForm.reset();
      dom.bookIdInput.dataset.lockedManual = "";
      dom.publishSizeWarning.hidden = true;
    } else {
      setPublishStatus("Publication envoyée");
      dom.publishProgress.textContent = "⚠️ Non détecté après le délai. Utilisez « Tester la connexion GitHub » puis rechargez la liste. Si le token est absent ou expiré, reconfigure-le dans Apps Script → Propriétés du projet.";
    }
  } catch (error) {
    console.error(error);
    setPublishStatus("Échec de publication");
    dom.publishProgress.textContent = error.message || "Impossible de publier. Vérifiez le token GitHub dans Apps Script.";
    showToast("Échec de publication");
  } finally {
    dom.publishBtn.disabled = false;
  }
}

// ════════════════════════════════════════
// LOGOUT
// ════════════════════════════════════════
function logoutToGate() {
  state.email = "";
  state.isAdminCandidate = false;
  state.adminUnlocked = false;
  state.adminCode = "";
  state.books = [];
  state.currentBook = null;
  state.pdfDoc = null;
  state.textDoc = null;
  state.totalPages = 0;
  state.currentPage = 1;
  state.bookmarks = [];
  state.notes = [];
  state.editingNoteId = "";
  state.lastSaveSignature = "";
  state.pdfZoomMultiplier = 1;
  dom.adminCodeInput.value = "";
  dom.publishForm.hidden = true;
  dom.githubTestRow.hidden = true;
  dom.addUsersSection.hidden = true;
  dom.editBookModal.hidden = true;
  dom.githubTestStatus.textContent = "";
  dom.emailInput.value = localStorage.getItem(LS_EMAIL_KEY) || "";
  setGateMessage("");
  setGateBusy(false);
  clearSession();
  switchScreen("gate");
}

// ════════════════════════════════════════
// LOGIN
// ════════════════════════════════════════
async function handleLogin(event) {
  event.preventDefault();
  const email = normalizeEmail(dom.emailInput.value);

  if (!isValidEmail(email)) {
    setGateMessage("Courriel invalide.", "error");
    return;
  }

  setGateMessage("");
  setGateBusy(true, "Validation en cours, veuillez patienter…");

  try {
    const response = await auth(email);
    if (!response?.ok) throw new Error(response?.message || "Accès refusé.");
    state.email = email;
    state.isAdminCandidate = !!response.isAdminCandidate;

    // Remember me
    if (dom.rememberMeInput.checked) {
      localStorage.setItem(LS_EMAIL_KEY, email);
    } else {
      localStorage.removeItem(LS_EMAIL_KEY);
    }

    dom.adminPanel.hidden = !state.isAdminCandidate;
    saveSession();
    switchScreen("library");
    await refreshBooks();
  } catch (error) {
    console.error(error);
    setGateMessage(error.message || "Accès refusé.", "error");
  } finally {
    setGateBusy(false);
  }
}

// ════════════════════════════════════════
// SWIPE NAVIGATION
// ════════════════════════════════════════
function attachSwipeEvents() {
  let startX = 0;
  let startY = 0;
  let startTime = 0;
  let swipeCandidate = false;
  let pinchStartDistance = 0;

  dom.viewerShell.addEventListener("touchstart", (e) => {
    if (!dom.controlPanel.hidden) return;
    if (e.touches.length === 2) {
      state.pinchActive = true;
      pinchStartDistance = getTouchDistance(e.touches);
      swipeCandidate = false;
      return;
    }
    if (e.touches.length !== 1 || state.pinchActive) return;
    swipeCandidate = true;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    startTime = Date.now();
  }, { passive: true });

  dom.viewerShell.addEventListener("touchmove", (e) => {
    if (!dom.controlPanel.hidden) return;
    if (e.touches.length === 2) {
      const currentDistance = getTouchDistance(e.touches);
      if (!pinchStartDistance) {
        pinchStartDistance = currentDistance;
        state.pinchActive = true;
        swipeCandidate = false;
        return;
      }
      const ratio = currentDistance / pinchStartDistance;
      if (ratio > 1.12) {
        state.pinchActive = true;
        swipeCandidate = false;
        pinchStartDistance = currentDistance;
        updateFontOrZoom(1);
      } else if (ratio < 0.88) {
        state.pinchActive = true;
        swipeCandidate = false;
        pinchStartDistance = currentDistance;
        updateFontOrZoom(-1);
      }
      return;
    }
    if (state.pinchActive) {
      swipeCandidate = false;
    }
  }, { passive: true });

  dom.viewerShell.addEventListener("touchend", (e) => {
    if (state.pinchActive) {
      if (!e.touches.length) {
        pinchStartDistance = 0;
        window.setTimeout(() => { state.pinchActive = false; }, 90);
      }
      return;
    }
    if (!swipeCandidate || !e.changedTouches.length) return;
    if (!dom.controlPanel.hidden) return;

    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    const dt = Date.now() - startTime;

    swipeCandidate = false;

    if (Math.abs(dx) < 78) return;
    if (Math.abs(dy) > Math.min(54, Math.abs(dx) * 0.55)) return;
    if (dt > 480) return;
    if (Math.abs(dx) < Math.abs(dy) * 1.9) return;

    if (dx < 0) goToPage(state.currentPage + 1);
    else goToPage(state.currentPage - 1);
  }, { passive: true });
}

// ════════════════════════════════════════
// PWA INSTALL BANNER
// ════════════════════════════════════════
function initInstallBanner() {
  let deferredPrompt = null;

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (!localStorage.getItem(LS_INSTALL_KEY)) {
      dom.installBanner.hidden = false;
    }
  });

  dom.installBannerBtn.addEventListener("click", async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
    }
    dom.installBanner.hidden = true;
    localStorage.setItem(LS_INSTALL_KEY, "1");
  });

  dom.installBannerDismiss.addEventListener("click", () => {
    dom.installBanner.hidden = true;
    localStorage.setItem(LS_INSTALL_KEY, "1");
  });

  // iOS: pas de beforeinstallprompt, on affiche des instructions
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
  const isStandalone = window.navigator.standalone === true;
  if (isIOS && !isStandalone && !localStorage.getItem(LS_IOS_INSTALL_KEY)) {
    dom.installBannerText.textContent = 'Pour installer : appuyez sur le bouton Partager ↑ puis "Sur l\'écran d\'accueil"';
    dom.installBannerBtn.hidden = true;
    dom.installBanner.hidden = false;
  }

  if (dom.installBannerBtn.hidden === false || !isIOS) {
    // bouton standard visible ou Android — on le réaffiche si caché
    dom.installBannerBtn.hidden = false;
  }

  // Dismiss iOS
  dom.installBannerDismiss.addEventListener("click", () => {
    if (isIOS) localStorage.setItem(LS_IOS_INSTALL_KEY, "1");
  });
}

// ════════════════════════════════════════
// PROTECTION CONTENU
// ════════════════════════════════════════
function blockEasyActions() {
  const shouldBlock = (event) => {
    if (dom.reader.hidden) return false;
    const target = event.target;
    if (target?.closest?.("#controlPanel")) return false;
    if (/^(INPUT|TEXTAREA)$/.test(target?.tagName)) return false;
    return true;
  };
  const block = (e) => { if (shouldBlock(e)) e.preventDefault(); };
  document.addEventListener("contextmenu", block);
  document.addEventListener("dragstart", block);
  document.addEventListener("selectstart", block);
  document.addEventListener("copy", block);
  document.addEventListener("cut", block);
  document.addEventListener("paste", (e) => { if (shouldBlock(e)) e.preventDefault(); });
}

// ════════════════════════════════════════
// ATTACHEMENT DES ÉVÉNEMENTS
// ════════════════════════════════════════
function attachEvents() {
  // Connexion
  dom.loginForm.addEventListener("submit", handleLogin);
  dom.logoutBtn.addEventListener("click", logoutToGate);

  // Bibliothèque
  dom.refreshBooksBtn.addEventListener("click", async () => {
    try { await refreshBooks(); showToast("Bibliothèque actualisée"); }
    catch (e) { console.error(e); showToast("Impossible d'actualiser"); }
  });

  // Lecteur — retour
  dom.backToLibraryBtn.addEventListener("click", async () => {
    await saveProgress({ immediate: true });
    switchScreen("library");
  });

  // Menu
  dom.menuToggle.addEventListener("click", () => toggleMenu());
  dom.menuBackdrop.addEventListener("click", () => toggleMenu(false));
  dom.closeMenuBtn.addEventListener("click", () => toggleMenu(false));

  // Navigation principale (menu)
  dom.prevBtn.addEventListener("click", () => goToPage(state.currentPage - 1));
  dom.nextBtn.addEventListener("click", () => goToPage(state.currentPage + 1));
  dom.goBtn.addEventListener("click", () => goToPage(Number(dom.pageInput.value)));
  dom.pageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); goToPage(Number(dom.pageInput.value)); }
  });

  // Navigation inférieure fixe
  dom.navPrevBtn.addEventListener("click", () => goToPage(state.currentPage - 1));
  dom.navNextBtn.addEventListener("click", () => goToPage(state.currentPage + 1));
  dom.navPageBtn.addEventListener("click", () => {
    // Basculer l'affichage progression / pages
    state.progressMode = state.progressMode === "percent" ? "pages" : "percent";
    localStorage.setItem(LS_PROGRESS_MODE_KEY, state.progressMode);
    updateUiLabels();
  });

  // Barre de progression supérieure
  dom.topProgressLabel.addEventListener("click", () => {
    state.progressMode = state.progressMode === "percent" ? "pages" : "percent";
    localStorage.setItem(LS_PROGRESS_MODE_KEY, state.progressMode);
    updateUiLabels();
  });

  // Ajustements
  dom.fitBtn.addEventListener("click", fitCurrentView);
  dom.modeToggleBtn.addEventListener("click", async () => {
    if (!state.currentBook?.pdfAllowed) { showToast("Le mode PDF n'est pas autorisé pour ce livre."); return; }
    if (state.mode === "text") {
      if (!state.pdfDoc) await loadPdfDocument(state.currentBook);
      state.mode = "pdf";
    } else {
      if (state.textDoc) state.mode = "text";
      else showToast("Aucune version texte disponible");
    }
    await renderCurrentPage({ forceFit: state.mode === "pdf" });
  });

  // Thème
  dom.themeBtn.addEventListener("click", async () => {
    state.theme = state.theme === "paper" ? "night" : "paper";
    localStorage.setItem(LS_THEME_KEY, state.theme);
    await renderCurrentPage();
  });

  // Progression — toggle barre
  dom.progressBarToggleBtn.addEventListener("click", () => {
    state.showProgressBar = !state.showProgressBar;
    localStorage.setItem(LS_PROGRESS_BAR_KEY, String(state.showProgressBar));
    updateUiLabels();
    showToast(state.showProgressBar ? "Barre de progression affichée" : "Barre de progression masquée");
  });

  // Modal taille du texte
  dom.fontSizeBtn.addEventListener("click", () => {
    if (state.mode === "pdf") { showToast("La taille du texte s'applique au mode texte uniquement."); return; }
    dom.fontModal.hidden = false;
  });
  dom.fontModalMinus.addEventListener("click", () => updateFontOrZoom(-1));
  dom.fontModalPlus.addEventListener("click", () => updateFontOrZoom(1));
  dom.fontModalClose.addEventListener("click", () => { dom.fontModal.hidden = true; });
  dom.fontModal.addEventListener("click", (e) => {
    if (e.target === dom.fontModal) dom.fontModal.hidden = true;
  });

  // Signets / notes / sauvegarde
  dom.bookmarkBtn.addEventListener("click", addBookmark);
  dom.saveBtn.addEventListener("click", () => saveProgress({ immediate: true }));
  dom.saveNoteBtn.addEventListener("click", saveCurrentNote);
  dom.newNoteBtn.addEventListener("click", resetNoteEditor);

  // Admin
  dom.adminCodeInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); unlockAdmin(); }
  });
  dom.unlockAdminBtn.addEventListener("click", unlockAdmin);
  dom.testGithubBtn.addEventListener("click", testGithubConnection);
  dom.publishForm.addEventListener("submit", publishBook);
  dom.reloadAdminBooksBtn.addEventListener("click", refreshBooks);
  dom.addUsersBtn.addEventListener("click", addUsersInBulk);
  dom.editBookSaveBtn.addEventListener("click", saveEditBook);
  dom.editBookCancelBtn.addEventListener("click", () => { dom.editBookModal.hidden = true; dom.editBookStatus.textContent = ""; });
  dom.editBookModal.addEventListener("click", (e) => {
    if (e.target === dom.editBookModal) {
      dom.editBookModal.hidden = true;
      dom.editBookStatus.textContent = "";
    }
  });
  dom.bookTitleInput.addEventListener("input", rebuildAdminBookIdFromTitle);
  dom.bookIdInput.addEventListener("input", () => {
    dom.bookIdInput.dataset.lockedManual = dom.bookIdInput.value.trim() ? "1" : "";
  });

  // Délégations — bibliothèque
  dom.bookList.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-open-book]");
    if (!btn) return;
    const book = getBookById(btn.dataset.openBook);
    if (book) await openBook(book);
  });

  // Délégations — admin livres
  dom.adminBooksList.addEventListener("click", async (e) => {
    const openBtn = e.target.closest("[data-open-book]");
    const toggleBtn = e.target.closest("[data-toggle-book]");
    const pdfBtn = e.target.closest("[data-toggle-pdf]");
    const editBtn = e.target.closest("[data-edit-book]");
    if (openBtn) { const b = getBookById(openBtn.dataset.openBook); if (b) await openBook(b); return; }
    if (toggleBtn) { await toggleBookPublished(toggleBtn.dataset.toggleBook); return; }
    if (pdfBtn) { await toggleBookPdfAllowed(pdfBtn.dataset.togglePdf); return; }
    if (editBtn) { openEditBookModal(editBtn.dataset.editBook); }
  });

  // Délégations — signets
  dom.bookmarkList.addEventListener("click", async (e) => {
    const jumpBtn = e.target.closest("[data-bookmark-page]");
    const removeBtn = e.target.closest("[data-remove-bookmark]");
    if (jumpBtn) { await goToPage(Number(jumpBtn.dataset.bookmarkPage), { save: false, reason: "bookmark" }); return; }
    if (removeBtn) await removeBookmark(Number(removeBtn.dataset.removeBookmark));
  });

  // Délégations — notes
  dom.notesList.addEventListener("click", async (e) => {
    const editBtn = e.target.closest("[data-edit-note]");
    const delBtn = e.target.closest("[data-delete-note]");
    if (editBtn) { startEditingNote(editBtn.dataset.editNote); return; }
    if (delBtn) await deleteNote(delBtn.dataset.deleteNote);
  });

  // Swipe navigation
  attachSwipeEvents();

  // Resize / orientation
  window.addEventListener("resize", () => {
    if (!state.currentBook || state.mode !== "pdf") return;
    window.clearTimeout(window.__readerResizeTimer);
    window.__readerResizeTimer = window.setTimeout(() => renderCurrentPage({ forceFit: true }), 120);
  });
  window.addEventListener("orientationchange", () => {
    window.setTimeout(() => renderCurrentPage({ forceFit: true }), 180);
  });

  // Sauvegarde automatique
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) saveProgress({ immediate: true });
  });
  window.addEventListener("beforeunload", () => {
    if (state.currentBook) saveProgress({ immediate: true });
  });

  // Keyboard navigation dans le lecteur
  document.addEventListener("keydown", (e) => {
    if (dom.reader.hidden) return;
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); goToPage(state.currentPage + 1); }
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); goToPage(state.currentPage - 1); }
    if (e.key === "Escape") { if (!dom.fontModal.hidden) { dom.fontModal.hidden = true; return; } toggleMenu(false); }
  });
}

// ════════════════════════════════════════
// INIT
// ════════════════════════════════════════
async function init() {
  blockEasyActions();
  attachEvents();
  initInstallBanner();

  // Pré-remplir l'email mémorisé
  const rememberedEmail = localStorage.getItem(LS_EMAIL_KEY);
  if (rememberedEmail) {
    dom.emailInput.value = rememberedEmail;
    dom.rememberMeInput.checked = true;
  }

  // Tenter de restaurer la session
  const sessionOk = restoreSession();
  if (sessionOk && state.email) {
    dom.adminPanel.hidden = !state.isAdminCandidate;
    if (state.adminUnlocked) {
      dom.publishForm.hidden = false;
      dom.githubTestRow.hidden = false;
      dom.addUsersSection.hidden = false;
      setPublishStatus("Module administrateur déverrouillé", true);
    }
    switchScreen("library");
    try {
      await refreshBooks();
    } catch (_) {
      // Si le refresh échoue (session expirée côté Apps Script), retour au gate
      clearSession();
      switchScreen("gate");
    }
    return;
  }

  switchScreen("gate");
  toggleMenu(false);
  rebuildReadingSurfaceClasses();
  setSaveStatus("En attente");
}

init();
