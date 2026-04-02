import * as pdfjsLib from "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.6.205/build/pdf.min.mjs";

const CONFIG = window.READER_CONFIG || {};
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${CONFIG.pdfJsVersion || "5.6.205"}/build/pdf.worker.min.mjs`;

const FONT_CLASSES = ["font-small", "font-medium", "font-large", "font-xlarge"];

const dom = {
  gate: document.getElementById("gate"),
  loginForm: document.getElementById("loginForm"),
  emailInput: document.getElementById("emailInput"),
  loginBtn: document.getElementById("loginBtn"),
  gateMessage: document.getElementById("gateMessage"),
  gateBusy: document.getElementById("gateBusy"),
  gateBusyText: document.getElementById("gateBusyText"),

  library: document.getElementById("library"),
  libraryMeta: document.getElementById("libraryMeta"),
  bookList: document.getElementById("bookList"),
  refreshBooksBtn: document.getElementById("refreshBooksBtn"),
  logoutBtn: document.getElementById("logoutBtn"),

  adminPanel: document.getElementById("adminPanel"),
  adminCodeInput: document.getElementById("adminCodeInput"),
  unlockAdminBtn: document.getElementById("unlockAdminBtn"),
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
  reloadAdminBooksBtn: document.getElementById("reloadAdminBooksBtn"),
  adminBooksList: document.getElementById("adminBooksList"),

  reader: document.getElementById("reader"),
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
  fontMinusBtn: document.getElementById("fontMinusBtn"),
  fontPlusBtn: document.getElementById("fontPlusBtn"),
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
  toast: document.getElementById("toast"),
};

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
  theme: "paper",
  fontIndex: 1,
  pdfZoomMultiplier: 1,
  renderToken: 0,
  saveTimer: null,
  lastSaveSignature: "",
  toastTimer: null,
  bookmarks: [],
  notes: [],
  editingNoteId: "",
  fallbackNoticeShownForPage: 0,
};

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

function showToast(message) {
  if (!message) return;
  dom.toast.textContent = message;
  dom.toast.hidden = false;
  if (state.toastTimer) window.clearTimeout(state.toastTimer);
  state.toastTimer = window.setTimeout(() => {
    dom.toast.hidden = true;
  }, 2300);
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
}

function toggleMenu(force) {
  const shouldOpen = typeof force === "boolean" ? force : dom.controlPanel.hidden;
  dom.controlPanel.hidden = !shouldOpen;
  dom.menuBackdrop.hidden = !shouldOpen;
  dom.menuToggle.setAttribute("aria-expanded", String(shouldOpen));
}

function blockEasyActions() {
  const shouldBlock = (event) => {
    if (dom.reader.hidden) return false;
    const target = event.target;
    if (target && target.closest && target.closest("#controlPanel")) return false;
    if (target && /^(INPUT|TEXTAREA)$/.test(target.tagName)) return false;
    return true;
  };

  const block = (event) => {
    if (shouldBlock(event)) event.preventDefault();
  };

  document.addEventListener("contextmenu", block);
  document.addEventListener("dragstart", block);
  document.addEventListener("selectstart", block);
  document.addEventListener("copy", block);
  document.addEventListener("cut", block);
  document.addEventListener("paste", (event) => {
    if (shouldBlock(event)) event.preventDefault();
  });
}

function jsonp(action, params = {}) {
  return new Promise((resolve, reject) => {
    const baseUrl = CONFIG.appsScriptUrl;
    if (!baseUrl) {
      reject(new Error("URL Apps Script absente."));
      return;
    }

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
    const cleanup = () => {
      delete window[callbackName];
      script.remove();
    };

    const timeoutId = window.setTimeout(() => {
      cleanup();
      reject(new Error("Délai dépassé lors de la connexion au service."));
    }, 20000);

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

async function postAdminAction(formData) {
  await fetch(CONFIG.appsScriptUrl, {
    method: "POST",
    mode: "no-cors",
    body: formData,
  });
}

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

async function fetchProgress(bookId) {
  const response = await jsonp("getProgress", { email: state.email, bookId });
  if (!response?.ok) return null;
  return response.progress || null;
}

function buildProgressPayload() {
  const progressPercent = state.totalPages ? Math.round((state.currentPage / state.totalPages) * 1000) / 10 : 0;
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
  state.saveTimer = window.setTimeout(() => {
    saveProgress();
  }, CONFIG.autoSaveDelayMs || 450);
}

async function loadBookmarks() {
  if (!state.currentBook) return;
  const response = await jsonp("listBookmarks", {
    email: state.email,
    bookId: state.currentBook.bookId,
  });
  state.bookmarks = response?.ok && Array.isArray(response.bookmarks) ? response.bookmarks : [];
  renderBookmarks();
}

async function addBookmark() {
  if (!state.currentBook) return;
  const existing = state.bookmarks.some((bookmark) => Number(bookmark.page) === state.currentPage);
  if (existing) {
    showToast(`Un signet existe déjà à la page ${state.currentPage}`);
    return;
  }
  try {
    const response = await jsonp("addBookmark", {
      email: state.email,
      bookId: state.currentBook.bookId,
      page: state.currentPage,
    });
    if (!response?.ok) throw new Error(response?.message || "Impossible d'ajouter le signet.");
    await loadBookmarks();
    showToast(`Signet ajouté à la page ${state.currentPage}`);
  } catch (error) {
    console.error(error);
    showToast("Impossible d'ajouter le signet");
  }
}

async function removeBookmark(page) {
  if (!state.currentBook) return;
  try {
    const response = await jsonp("removeBookmark", {
      email: state.email,
      bookId: state.currentBook.bookId,
      page,
    });
    if (!response?.ok) throw new Error(response?.message || "Impossible de supprimer le signet.");
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
  dom.bookmarkList.innerHTML = sorted.map((bookmark) => `
    <div class="bookmark-chip">
      <button type="button" data-bookmark-page="${bookmark.page}">Page ${bookmark.page}</button>
      <button type="button" data-remove-bookmark="${bookmark.page}">Retirer</button>
    </div>
  `).join("");
}

async function loadNotes() {
  if (!state.currentBook) return;
  const response = await jsonp("listNotes", {
    email: state.email,
    bookId: state.currentBook.bookId,
  });
  state.notes = response?.ok && Array.isArray(response.notes) ? response.notes : [];
  renderNotes();
}

function getCurrentPageNotes() {
  return state.notes.filter((note) => Number(note.page) === state.currentPage);
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
  return date.toLocaleString("fr-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function resetNoteEditor() {
  state.editingNoteId = "";
  dom.noteInput.value = "";
  setNoteStatus("");
}

function startEditingNote(noteId) {
  const note = state.notes.find((item) => item.noteId === noteId);
  if (!note) return;
  state.editingNoteId = note.noteId;
  dom.noteInput.value = note.noteText || "";
  dom.noteInput.focus();
  setNoteStatus("Modification en cours");
}

async function saveCurrentNote() {
  if (!state.currentBook) return;
  const noteText = dom.noteInput.value.trim();
  if (!noteText) {
    setNoteStatus("La note est vide", "error");
    return;
  }
  if (noteText.length > 1200) {
    setNoteStatus("La note est trop longue", "error");
    return;
  }

  try {
    const response = await jsonp("saveNote", {
      email: state.email,
      bookId: state.currentBook.bookId,
      page: state.currentPage,
      noteId: state.editingNoteId,
      noteText,
    });
    if (!response?.ok) throw new Error(response?.message || "Impossible d'enregistrer la note.");
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
      email: state.email,
      bookId: state.currentBook.bookId,
      noteId,
    });
    if (!response?.ok) throw new Error(response?.message || "Impossible de supprimer la note.");
    if (state.editingNoteId === noteId) resetNoteEditor();
    await loadNotes();
    setNoteStatus("Note supprimée", "success");
  } catch (error) {
    console.error(error);
    setNoteStatus("Suppression impossible", "error");
  }
}

function computePublicAssetUrl(path) {
  if (!path) return "";
  return `./${String(path).replace(/^\.\//, "").replace(/^\//, "")}`;
}

function coverHtml(book, className = "book-cover") {
  if (book.coverPath) {
    return `<div class="${className}"><img src="${escapeHtml(computePublicAssetUrl(book.coverPath))}" alt="Couverture de ${escapeHtml(book.title)}" loading="lazy"></div>`;
  }
  return `<div class="cover-placeholder">${escapeHtml((book.title || "?").trim().slice(0, 1).toUpperCase() || "?")}</div>`;
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
        <p>${book.totalPages ? `${book.totalPages} pages` : "Nombre de pages inconnu"}</p>
        <p>PDF: ${escapeHtml(book.pdfPath || "")}</p>
        <p>JSON: ${escapeHtml(book.jsonPath || "")}</p>
        <div class="admin-book-actions">
          <button class="secondary-btn" type="button" data-open-book="${escapeHtml(book.bookId)}">Ouvrir</button>
          <button class="ghost-btn" type="button" data-toggle-book="${escapeHtml(book.bookId)}">${book.published ? "Masquer" : "Publier"}</button>
        </div>
      </div>
    </article>
  `).join("");
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

function rebuildReadingSurfaceClasses() {
  dom.readingSurface.classList.remove("mode-text", "mode-pdf", "theme-paper", "theme-night", ...FONT_CLASSES);
  dom.readingSurface.classList.add(state.mode === "text" ? "mode-text" : "mode-pdf");
  dom.readingSurface.classList.add(state.theme === "night" ? "theme-night" : "theme-paper");
  dom.readingSurface.classList.add(FONT_CLASSES[state.fontIndex] || FONT_CLASSES[1]);
}

function updateUiLabels() {
  const totalPages = state.totalPages || 0;
  dom.pageLabel.textContent = `Page ${state.currentPage} / ${totalPages}`;
  dom.pageInput.value = String(state.currentPage || 1);
  const progressPercent = totalPages ? Math.round((state.currentPage / totalPages) * 1000) / 10 : 0;
  dom.progressText.textContent = `${progressPercent} %`;
  dom.progressBar.style.width = `${Math.max(0, Math.min(100, progressPercent))}%`;
  dom.modeToggleBtn.textContent = state.mode === "text" ? "Mode PDF" : "Mode texte";
  dom.themeBtn.textContent = state.theme === "paper" ? "Mode nuit" : "Mode clair";
  dom.docLabel.textContent = state.currentBook?.title || "Document";
  dom.prevBtn.disabled = state.currentPage <= 1;
  dom.nextBtn.disabled = state.currentPage >= totalPages;
  dom.fontMinusBtn.textContent = state.mode === "text" ? "Police -" : "Zoom -";
  dom.fontPlusBtn.textContent = state.mode === "text" ? "Police +" : "Zoom +";
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
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!source || source.replace(/\s+/g, "").length < 18) {
    return { html: "", text: "", charCount: 0, renderMode: "pdf" };
  }

  const lines = source.split(/\n/).map((line) => line.trim()).filter(Boolean);
  const blocks = [];
  let buffer = [];

  const pushBuffer = () => {
    if (!buffer.length) return;
    blocks.push({ type: "paragraph", text: buffer.join(" ").replace(/\s+([,.;:!?])/g, "$1").trim() });
    buffer = [];
  };

  for (const line of lines) {
    const isDialogue = /^[-–—]\s*/.test(line);
    const isCentered = /^[A-ZÉÈÀÂÊÎÔÛÇ][A-ZÉÈÀÂÊÎÔÛÇ'’\s]{4,}$/.test(line) && line.length <= 60;
    if (isDialogue) {
      pushBuffer();
      blocks.push({ type: "dialogue", text: line.replace(/^[-–—]\s*/, "- ") });
      continue;
    }
    if (isCentered) {
      pushBuffer();
      blocks.push({ type: "centered", text: line });
      continue;
    }
    if (buffer.length) {
      const previous = buffer[buffer.length - 1];
      const previousEndsSentence = /[.!?…:]$/.test(previous);
      const startsParagraph = /^[«"A-ZÉÈÀÂÊÎÔÛÇ]/.test(line) && previousEndsSentence && line.length > 30;
      if (startsParagraph) {
        pushBuffer();
      }
    }
    buffer.push(line);
  }
  pushBuffer();

  if (!blocks.length) {
    return { html: "", text: source, charCount: source.length, renderMode: "pdf" };
  }

  const html = blocks.map((block) => {
    if (block.type === "dialogue") return `<p class="dialogue">${escapeHtml(block.text)}</p>`;
    if (block.type === "centered") return `<p class="centered">${escapeHtml(block.text)}</p>`;
    return `<p>${escapeHtml(block.text)}</p>`;
  }).join("");

  return {
    html,
    text: blocks.map((block) => block.text).join("\n\n"),
    charCount: source.replace(/\s+/g, "").length,
    renderMode: "text",
  };
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
      showToast("Cette page est affichée en mode PDF pour conserver une mise en page propre.");
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

  dom.viewerShell.scrollTo({ top: 0, behavior: "instant" });
}

async function goToPage(pageNumber, { save = true } = {}) {
  if (!state.totalPages) return;
  const nextPage = Math.max(1, Math.min(state.totalPages, Number(pageNumber) || 1));
  state.currentPage = nextPage;
  await renderCurrentPage();
  if (save) scheduleSave();
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

  state.mode = textDoc ? (CONFIG.defaultReaderMode || "text") : "pdf";
  const restoredPage = progress?.currentPage ? Number(progress.currentPage) : 1;
  state.currentPage = Math.max(1, Math.min(state.totalPages, restoredPage));
  resetNoteEditor();
  await renderCurrentPage({ forceFit: true });
  setSaveStatus("Prêt");
}

function getBookById(bookId) {
  return state.books.find((book) => book.bookId === bookId) || null;
}

function roundTo(value, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round((Number(value) || 0) * factor) / factor;
}

function updateFontOrZoom(delta) {
  if (state.mode === "text") {
    state.fontIndex = Math.max(0, Math.min(FONT_CLASSES.length - 1, state.fontIndex + delta));
    void renderCurrentPage();
    return;
  }

  const step = CONFIG.pdfZoomStep || 0.15;
  const minZoom = CONFIG.minPdfZoom || 0.85;
  const maxZoom = CONFIG.maxPdfZoom || 2.4;
  state.pdfZoomMultiplier = roundTo(Math.max(minZoom, Math.min(maxZoom, state.pdfZoomMultiplier + (delta * step))), 2);
  void renderCurrentPage();
}

function fitCurrentView() {
  state.pdfZoomMultiplier = 1;
  void renderCurrentPage({ forceFit: true });
}

function rebuildAdminBookIdFromTitle() {
  if (!dom.bookIdInput.dataset.lockedManual) {
    dom.bookIdInput.value = slugify(dom.bookTitleInput.value);
  }
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode.apply(null, bytes.subarray(index, index + chunkSize));
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
  let previousRight = null;
  for (const word of words) {
    const text = String(word.text || "").trim();
    if (!text) continue;
    const left = Number(word.x) || 0;
    if (parts.length === 0) {
      parts.push(text);
    } else {
      const gap = previousRight === null ? 0 : left - previousRight;
      const noLeadingSpace = /^[,.;:!?%)\]»]/.test(text);
      const noTrailingSpace = /[(\[«]$/.test(parts[parts.length - 1]);
      if (noLeadingSpace || noTrailingSpace || gap < 1.5) {
        parts[parts.length - 1] += text;
      } else {
        parts.push(text);
      }
    }
    previousRight = (Number(word.x) || 0) + (Number(word.width) || 0);
  }
  return normalizeLineText(parts);
}

function extractStructuredPage(items) {
  if (!Array.isArray(items) || !items.length) {
    return { html: "", text: "", charCount: 0, renderMode: "pdf" };
  }

  const entries = items
    .map((item) => ({
      text: String(item.str || ""),
      x: Number(item.transform?.[4] || 0),
      y: Number(item.transform?.[5] || 0),
      width: Number(item.width || 0),
      height: Number(item.height || 0),
    }))
    .filter((item) => item.text && item.text.trim());

  if (!entries.length) return { html: "", text: "", charCount: 0, renderMode: "pdf" };

  const sorted = entries.sort((a, b) => {
    if (Math.abs(b.y - a.y) > 3) return b.y - a.y;
    return a.x - b.x;
  });

  const lines = [];
  let currentWords = [];
  let currentY = null;
  let currentHeight = 0;

  for (const entry of sorted) {
    if (currentY === null) {
      currentWords = [entry];
      currentY = entry.y;
      currentHeight = entry.height || 10;
      continue;
    }
    const threshold = Math.max(2.8, (currentHeight || 10) * 0.45);
    if (Math.abs(entry.y - currentY) <= threshold) {
      currentWords.push(entry);
      currentHeight = Math.max(currentHeight, entry.height || 10);
    } else {
      const ordered = currentWords.sort((a, b) => a.x - b.x);
      lines.push({
        text: buildLineFromWords(ordered),
        y: currentY,
        height: currentHeight,
        left: ordered[0]?.x || 0,
      });
      currentWords = [entry];
      currentY = entry.y;
      currentHeight = entry.height || 10;
    }
  }

  if (currentWords.length) {
    const ordered = currentWords.sort((a, b) => a.x - b.x);
    lines.push({
      text: buildLineFromWords(ordered),
      y: currentY,
      height: currentHeight,
      left: ordered[0]?.x || 0,
    });
  }

  const filteredLines = lines
    .map((line) => ({ ...line, text: String(line.text || "").trim() }))
    .filter((line) => line.text);

  const averageHeight = filteredLines.reduce((sum, line) => sum + (line.height || 0), 0) / Math.max(1, filteredLines.length);
  const leftValues = filteredLines.map((line) => line.left).sort((a, b) => a - b);
  const baselineLeft = leftValues[Math.floor(leftValues.length * 0.2)] || 0;

  const blocks = [];
  let paragraph = [];
  let previousLine = null;

  const pushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push({ type: "paragraph", text: paragraph.join(" ").replace(/\s+([,.;:!?])/g, "$1").trim() });
    paragraph = [];
  };

  for (const line of filteredLines) {
    const text = line.text;
    const isDialogue = /^[-–—]\s*/.test(text);
    const isCentered = /^[A-ZÉÈÀÂÊÎÔÛÇ][A-ZÉÈÀÂÊÎÔÛÇ'’\s]{4,}$/.test(text) && text.length <= 60;
    const indent = line.left - baselineLeft;
    const gap = previousLine ? Math.abs(previousLine.y - line.y) : 0;
    const strongBreak = previousLine && gap > Math.max(averageHeight * 1.45, 14);
    const indentBreak = indent > Math.max(averageHeight * 1.2, 16);

    if (isDialogue) {
      pushParagraph();
      blocks.push({ type: "dialogue", text: text.replace(/^[-–—]\s*/, "- ") });
    } else if (isCentered) {
      pushParagraph();
      blocks.push({ type: "centered", text });
    } else {
      if (strongBreak || indentBreak) pushParagraph();
      paragraph.push(text);
    }

    previousLine = line;
  }
  pushParagraph();

  const plainText = blocks.map((block) => block.text).join("\n\n").trim();
  const charCount = plainText.replace(/\s+/g, "").length;
  if (!blocks.length || charCount < 18) {
    return { html: "", text: plainText, charCount, renderMode: "pdf" };
  }

  const html = blocks.map((block) => {
    if (block.type === "dialogue") return `<p class="dialogue">${escapeHtml(block.text)}</p>`;
    if (block.type === "centered") return `<p class="centered">${escapeHtml(block.text)}</p>`;
    return `<p>${escapeHtml(block.text)}</p>`;
  }).join("");

  return { html, text: plainText, charCount, renderMode: "text" };
}

async function convertPdfFileToJson(file, metadata) {
  const arrayBuffer = await file.arrayBuffer();
  const pdfData = new Uint8Array(arrayBuffer);
  const loadingTask = pdfjsLib.getDocument({ data: pdfData });
  const pdf = await loadingTask.promise;
  const pages = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    dom.publishProgress.textContent = `Extraction du texte - page ${pageNumber} / ${pdf.numPages}`;
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const structured = extractStructuredPage(textContent.items);
    pages.push({
      page: pageNumber,
      text: structured.text,
      html: structured.html,
      charCount: structured.charCount,
      renderMode: structured.renderMode,
    });
  }

  return {
    bookId: metadata.bookId,
    title: metadata.title,
    author: metadata.author || "",
    sourceFileName: file.name,
    generatedAt: new Date().toISOString(),
    totalPages: pdf.numPages,
    pages,
  };
}

async function publishBook(event) {
  event.preventDefault();
  if (!state.adminUnlocked) {
    showToast("Déverrouille d’abord le module administrateur");
    return;
  }

  const pdfFile = dom.bookPdfInput.files?.[0];
  if (!pdfFile) {
    showToast("Choisis un PDF");
    return;
  }

  const title = dom.bookTitleInput.value.trim();
  const bookId = slugify(dom.bookIdInput.value.trim() || title || pdfFile.name.replace(/\.pdf$/i, ""));
  const author = dom.bookAuthorInput.value.trim();
  const coverFile = dom.bookCoverInput.files?.[0] || null;

  if (!title || !bookId) {
    showToast("Titre ou identifiant manquant");
    return;
  }

  dom.publishBtn.disabled = true;
  setPublishStatus("Préparation...");
  dom.publishProgress.textContent = "Lecture du PDF local...";

  try {
    const jsonDoc = await convertPdfFileToJson(pdfFile, { title, bookId, author });
    const pdfBase64 = arrayBufferToBase64(await pdfFile.arrayBuffer());
    const jsonBase64 = utf8ToBase64(JSON.stringify(jsonDoc, null, 2));

    let coverBase64 = "";
    let coverExt = "";
    if (coverFile) {
      dom.publishProgress.textContent = "Préparation de l’image de couverture...";
      coverBase64 = arrayBufferToBase64(await coverFile.arrayBuffer());
      coverExt = detectCoverExtension(coverFile);
    }

    dom.publishProgress.textContent = "Envoi au service de publication...";
    const formData = new FormData();
    formData.append("action", "publishBook");
    formData.append("email", state.email);
    formData.append("adminCode", state.adminCode);
    formData.append("bookId", bookId);
    formData.append("title", title);
    formData.append("author", author);
    formData.append("publishNow", dom.publishNowInput.checked ? "true" : "false");
    formData.append("sourceFileName", pdfFile.name);
    formData.append("totalPages", String(jsonDoc.totalPages));
    formData.append("pdfBase64", pdfBase64);
    formData.append("jsonBase64", jsonBase64);
    if (coverBase64) {
      formData.append("coverBase64", coverBase64);
      formData.append("coverExt", coverExt);
    }
    formData.append("repoOwner", CONFIG.githubRepoOwner || "");
    formData.append("repoName", CONFIG.githubRepoName || "");
    formData.append("repoBranch", CONFIG.githubRepoBranch || "main");
    formData.append("assetsBasePath", CONFIG.githubAssetsBasePath || "assets/books");

    await postAdminAction(formData);

    setPublishStatus("Publication envoyée...");
    dom.publishProgress.textContent = "Vérification de la publication dans GitHub...";

    let published = false;
    for (let attempt = 1; attempt <= (CONFIG.maxPublishPollAttempts || 8); attempt += 1) {
      await new Promise((resolve) => window.setTimeout(resolve, CONFIG.publishPollDelayMs || 4000));
      await refreshBooks();
      const book = getBookById(bookId);
      if (book && book.jsonPath && book.pdfPath) {
        published = true;
        break;
      }
    }

    if (published) {
      setPublishStatus("Livre publié", true);
      dom.publishProgress.textContent = "Le PDF, le JSON et la couverture sont publiés dans le dépôt GitHub.";
      dom.publishForm.reset();
      dom.bookIdInput.dataset.lockedManual = "";
    } else {
      setPublishStatus("Publication envoyée. Vérifie GitHub ou le journal Apps Script.");
      dom.publishProgress.textContent = "La publication peut prendre un peu de temps. Recharge la liste des livres.";
    }
  } catch (error) {
    console.error(error);
    setPublishStatus("Échec de publication");
    dom.publishProgress.textContent = error.message || "Impossible de convertir ou publier le fichier.";
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
      published: book && book.published ? "false" : "true",
    });
    if (!response?.ok) throw new Error(response?.message || "Impossible de changer le statut.");
    await refreshBooks();
    showToast("Statut mis à jour");
  } catch (error) {
    console.error(error);
    showToast("Impossible de changer le statut");
  }
}

async function unlockAdmin() {
  const code = dom.adminCodeInput.value.trim();
  if (!code) {
    showToast("Entre le code administrateur");
    return;
  }
  try {
    const response = await jsonp("listBooks", { email: state.email, adminCode: code });
    if (!response?.ok) throw new Error(response?.message || "Code invalide.");
    state.adminUnlocked = true;
    state.adminCode = code;
    dom.publishForm.hidden = false;
    setPublishStatus("Module administrateur déverrouillé", true);
    await refreshBooks();
  } catch (error) {
    console.error(error);
    showToast("Code administrateur invalide");
  }
}

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
  dom.emailInput.value = "";
  setGateMessage("");
  setGateBusy(false);
  switchScreen("gate");
}

async function handleLogin(event) {
  event.preventDefault();
  const email = normalizeEmail(dom.emailInput.value);
  const suffixes = CONFIG.allowedDomainSuffixes || [];
  const domainOk = suffixes.length === 0 || suffixes.some((suffix) => email.endsWith(`@${suffix}`));

  if (!isValidEmail(email) || !domainOk) {
    setGateMessage("Courriel scolaire invalide.", "error");
    return;
  }

  setGateMessage("");
  setGateBusy(true, "Validation de votre identité, veuillez patienter quelques instants. Le chargement est en cours.");

  try {
    const response = await auth(email);
    if (!response?.ok) throw new Error(response?.message || "Accès refusé.");
    state.email = email;
    state.isAdminCandidate = !!response.isAdminCandidate;
    dom.adminPanel.hidden = !state.isAdminCandidate;
    switchScreen("library");
    await refreshBooks();
  } catch (error) {
    console.error(error);
    setGateMessage(error.message || "Accès refusé.", "error");
  } finally {
    setGateBusy(false);
  }
}

function attachEvents() {
  dom.loginForm.addEventListener("submit", handleLogin);
  dom.refreshBooksBtn.addEventListener("click", async () => {
    try {
      await refreshBooks();
      showToast("Bibliothèque actualisée");
    } catch (error) {
      console.error(error);
      showToast("Impossible d’actualiser");
    }
  });
  dom.logoutBtn.addEventListener("click", logoutToGate);
  dom.backToLibraryBtn.addEventListener("click", async () => {
    await saveProgress({ immediate: true });
    switchScreen("library");
  });
  dom.menuToggle.addEventListener("click", () => toggleMenu());
  dom.menuBackdrop.addEventListener("click", () => toggleMenu(false));
  dom.closeMenuBtn.addEventListener("click", () => toggleMenu(false));
  dom.prevBtn.addEventListener("click", () => goToPage(state.currentPage - 1));
  dom.nextBtn.addEventListener("click", () => goToPage(state.currentPage + 1));
  dom.goBtn.addEventListener("click", () => goToPage(Number(dom.pageInput.value)));
  dom.pageInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      goToPage(Number(dom.pageInput.value));
    }
  });
  dom.fitBtn.addEventListener("click", fitCurrentView);
  dom.modeToggleBtn.addEventListener("click", async () => {
    if (state.mode === "text") {
      if (!state.pdfDoc) await loadPdfDocument(state.currentBook);
      state.mode = "pdf";
    } else {
      if (state.textDoc) state.mode = "text";
      else showToast("Aucune version texte disponible");
    }
    await renderCurrentPage({ forceFit: state.mode === "pdf" });
  });
  dom.fontMinusBtn.addEventListener("click", () => updateFontOrZoom(-1));
  dom.fontPlusBtn.addEventListener("click", () => updateFontOrZoom(1));
  dom.themeBtn.addEventListener("click", async () => {
    state.theme = state.theme === "paper" ? "night" : "paper";
    await renderCurrentPage();
  });
  dom.bookmarkBtn.addEventListener("click", addBookmark);
  dom.saveBtn.addEventListener("click", () => saveProgress({ immediate: true }));
  dom.saveNoteBtn.addEventListener("click", saveCurrentNote);
  dom.newNoteBtn.addEventListener("click", resetNoteEditor);
  dom.unlockAdminBtn.addEventListener("click", unlockAdmin);
  dom.publishForm.addEventListener("submit", publishBook);
  dom.reloadAdminBooksBtn.addEventListener("click", refreshBooks);
  dom.bookTitleInput.addEventListener("input", rebuildAdminBookIdFromTitle);
  dom.bookIdInput.addEventListener("input", () => {
    dom.bookIdInput.dataset.lockedManual = dom.bookIdInput.value.trim() ? "1" : "";
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
    if (openButton) {
      const book = getBookById(openButton.dataset.openBook);
      if (book) await openBook(book);
      return;
    }
    if (toggleButton) {
      await toggleBookPublished(toggleButton.dataset.toggleBook);
    }
  });

  dom.bookmarkList.addEventListener("click", async (event) => {
    const jumpButton = event.target.closest("[data-bookmark-page]");
    const removeButton = event.target.closest("[data-remove-bookmark]");
    if (jumpButton) {
      await goToPage(Number(jumpButton.dataset.bookmarkPage), { save: false });
      return;
    }
    if (removeButton) {
      await removeBookmark(Number(removeButton.dataset.removeBookmark));
    }
  });

  dom.notesList.addEventListener("click", async (event) => {
    const editButton = event.target.closest("[data-edit-note]");
    const deleteButton = event.target.closest("[data-delete-note]");
    if (editButton) {
      startEditingNote(editButton.dataset.editNote);
      return;
    }
    if (deleteButton) {
      await deleteNote(deleteButton.dataset.deleteNote);
    }
  });

  window.addEventListener("resize", () => {
    if (!state.currentBook || state.mode !== "pdf") return;
    window.clearTimeout(window.__readerResizeTimer);
    window.__readerResizeTimer = window.setTimeout(() => renderCurrentPage({ forceFit: true }), 120);
  });
  window.addEventListener("orientationchange", () => window.setTimeout(() => renderCurrentPage({ forceFit: true }), 180));
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) saveProgress({ immediate: true });
  });
  window.addEventListener("beforeunload", () => {
    if (state.currentBook) saveProgress({ immediate: true });
  });
}

function init() {
  blockEasyActions();
  attachEvents();
  switchScreen("gate");
  toggleMenu(false);
  rebuildReadingSurfaceClasses();
  setSaveStatus("En attente");
}

init();
