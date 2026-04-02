import * as pdfjsLib from "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.6.205/build/pdf.min.mjs";

const CONFIG = window.READER_CONFIG || {};
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${CONFIG.pdfJsVersion || "5.6.205"}/build/pdf.worker.min.mjs`;

const FONT_CLASSES = ["font-small", "font-medium", "font-large", "font-xlarge"];

const dom = {
  gate: document.getElementById("gate"),
  library: document.getElementById("library"),
  reader: document.getElementById("reader"),
  loginForm: document.getElementById("loginForm"),
  emailInput: document.getElementById("emailInput"),
  loginBtn: document.getElementById("loginBtn"),
  gateMessage: document.getElementById("gateMessage"),
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
  fontMinusBtn: document.getElementById("fontMinusBtn"),
  fontPlusBtn: document.getElementById("fontPlusBtn"),
  bookmarkBtn: document.getElementById("bookmarkBtn"),
  bookmarkList: document.getElementById("bookmarkList"),
  saveBtn: document.getElementById("saveBtn"),
  themeBtn: document.getElementById("themeBtn"),
  switchUserBtn: document.getElementById("switchUserBtn"),
  saveStatus: document.getElementById("saveStatus"),
  noteInput: document.getElementById("pageNoteInput"),
  saveNoteBtn: document.getElementById("saveNoteBtn"),
  noteStatus: document.getElementById("noteStatus"),
  viewerShell: document.getElementById("viewerShell"),
  readingSurface: document.getElementById("readingSurface"),
  textViewer: document.getElementById("textViewer"),
  pdfViewer: document.getElementById("pdfViewer"),
  pdfCanvas: document.getElementById("pdfCanvas"),
  toast: document.getElementById("toast")
};

const state = {
  email: "",
  isAdminCandidate: false,
  adminUnlocked: false,
  adminCode: "",
  books: [],
  currentBook: null,
  currentPage: 1,
  totalPages: 0,
  pdfDoc: null,
  textDoc: null,
  pdfUrl: "",
  jsonUrl: "",
  mode: CONFIG.defaultReaderMode || "text",
  fontIndex: 1,
  theme: "paper",
  renderToken: 0,
  saveTimer: null,
  lastSaveSignature: "",
  toastTimer: null
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

function showToast(message) {
  if (!message) return;
  dom.toast.textContent = message;
  dom.toast.hidden = false;
  if (state.toastTimer) window.clearTimeout(state.toastTimer);
  state.toastTimer = window.setTimeout(() => {
    dom.toast.hidden = true;
  }, 2200);
}

function setGateMessage(message, type = "") {
  dom.gateMessage.textContent = message || "";
  dom.gateMessage.className = "gate-message" + (type ? ` ${type}` : "");
}

function setSaveStatus(message, positive = false) {
  dom.saveStatus.textContent = message;
  dom.saveStatus.style.color = positive ? "var(--success)" : "";
}

function setPublishStatus(message, positive = false) {
  dom.publishStatus.textContent = message;
  dom.publishStatus.style.color = positive ? "var(--success)" : "";
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

function rebuildReadingSurfaceClasses() {
  dom.readingSurface.classList.remove("theme-paper", "theme-night", ...FONT_CLASSES);
  dom.readingSurface.classList.add(`theme-${state.theme}`, FONT_CLASSES[state.fontIndex]);
}

function buildJsonpUrl(action, params = {}) {
  const url = new URL(CONFIG.appsScriptUrl);
  const prefix = `cb_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  url.searchParams.set("action", action);
  url.searchParams.set("prefix", prefix);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
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

async function listBooks() {
  const response = await jsonp("listBooks", {
    email: state.email,
    adminCode: state.adminUnlocked ? state.adminCode : ""
  });
  if (!response?.ok) throw new Error(response?.message || "Impossible de charger la bibliothèque.");
  state.books = response.books || [];
  return state.books;
}

async function fetchProgress(bookId) {
  const response = await jsonp("getProgress", { email: state.email, bookId });
  return response?.ok ? response.progress || null : null;
}

function localKey(prefix) {
  const bookId = state.currentBook?.bookId || "";
  return `${prefix}:${state.email}:${bookId}`;
}

function getBookmarks() {
  try {
    return JSON.parse(localStorage.getItem(localKey("bookmarks")) || "[]");
  } catch {
    return [];
  }
}

function saveBookmarks(bookmarks) {
  localStorage.setItem(localKey("bookmarks"), JSON.stringify(bookmarks));
}

function getNotes() {
  try {
    return JSON.parse(localStorage.getItem(localKey("notes")) || "{}");
  } catch {
    return {};
  }
}

function saveNotesMap(notes) {
  localStorage.setItem(localKey("notes"), JSON.stringify(notes));
}

function renderBookmarks() {
  const bookmarks = getBookmarks();
  if (!bookmarks.length) {
    dom.bookmarkList.innerHTML = `<div class="empty-state">Aucun signet pour ce livre.</div>`;
    return;
  }
  dom.bookmarkList.innerHTML = bookmarks
    .sort((a, b) => a.page - b.page)
    .map((bookmark) => `
      <div class="bookmark-chip">
        <button type="button" data-bookmark-page="${bookmark.page}">Page ${bookmark.page}</button>
        <button type="button" data-remove-bookmark="${bookmark.page}">Retirer</button>
      </div>
    `)
    .join("");
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
  const notes = getNotes();
  dom.noteInput.value = notes[String(state.currentPage)] || "";
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

function computePublicAssetUrl(path) {
  if (!path) return "";
  return `./${String(path).replace(/^\.\//, "").replace(/^\//, "")}`;
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
  state.pdfUrl = pdfUrl;
  const loadingTask = pdfjsLib.getDocument({ url: pdfUrl, disableAutoFetch: false, disableStream: false });
  state.pdfDoc = await loadingTask.promise;
  return state.pdfDoc;
}

function paragraphizeText(rawText) {
  return String(rawText || "")
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join("");
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function renderTextPage(pageNumber) {
  const page = state.textDoc?.pages?.[pageNumber - 1];
  const text = page?.text || "";
  dom.textViewer.innerHTML = `
    <article class="text-page">
      <h2>Page ${pageNumber}</h2>
      <div class="text-content">${text ? paragraphizeText(text) : '<p class="empty-text">Aucun texte exploitable pour cette page.</p>'}</div>
    </article>
  `;
}

function computeFitScale(page) {
  const shellWidth = Math.max(280, dom.viewerShell.clientWidth - 20);
  const viewport = page.getViewport({ scale: 1 });
  return shellWidth / viewport.width;
}

async function renderPdfPage(pageNumber) {
  const renderToken = ++state.renderToken;
  const page = await state.pdfDoc.getPage(pageNumber);
  const scale = computeFitScale(page);
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
  } else {
    dom.textViewer.hidden = true;
    dom.pdfViewer.hidden = false;
    await renderPdfPage(state.currentPage);
  }

  dom.viewerShell.scrollTo({ top: 0, behavior: "instant" });
}

async function goToPage(pageNumber, { save = true } = {}) {
  if (!state.totalPages) return;
  const nextPage = Math.max(1, Math.min(state.totalPages, Number(pageNumber) || 1));
  if (nextPage === state.currentPage && !save) return;
  state.currentPage = nextPage;
  await renderCurrentPage();
  if (save) scheduleSave();
}

async function openBook(book) {
  state.currentBook = book;
  state.currentPage = 1;
  state.totalPages = 0;
  state.lastSaveSignature = "";
  state.pdfDoc = null;
  state.textDoc = null;

  setSaveStatus("Chargement...");
  switchScreen("reader");
  toggleMenu(false);

  const progress = await fetchProgress(book.bookId);
  const jsonDoc = await loadTextJson(book).catch(() => null);
  state.textDoc = jsonDoc;

  if (jsonDoc?.totalPages) {
    state.totalPages = Number(jsonDoc.totalPages) || 0;
  }

  if (!state.totalPages || state.mode === "pdf" || !jsonDoc) {
    const pdfDoc = await loadPdfDocument(book);
    state.totalPages = pdfDoc.numPages;
  }

  if (jsonDoc && !state.textDoc) state.textDoc = jsonDoc;
  if (!jsonDoc) state.mode = "pdf";
  else if ((CONFIG.defaultReaderMode || "text") === "text") state.mode = "text";

  const restoredPage = progress?.currentPage ? Number(progress.currentPage) : 1;
  state.currentPage = Math.max(1, Math.min(state.totalPages, restoredPage));
  await renderCurrentPage();
  setSaveStatus("Prêt");
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
      <div class="badge ${book.published ? 'published' : 'hidden'}">${book.published ? 'Publié' : 'Non publié'}</div>
      <h3>${escapeHtml(book.title)}</h3>
      <p>${book.author ? escapeHtml(book.author) : 'Auteur non indiqué'}</p>
      <p>${book.totalPages ? `${book.totalPages} pages` : 'Nombre de pages inconnu'}</p>
      <div class="book-actions">
        <button class="nav-btn" type="button" data-open-book="${escapeHtml(book.bookId)}">Ouvrir</button>
      </div>
    </article>
  `).join("");
}

function renderAdminBooks() {
  if (!state.adminUnlocked) {
    dom.adminBooksList.innerHTML = `<div class="empty-state">Déverrouille le module administrateur pour gérer les livres.</div>`;
    return;
  }

  if (!state.books.length) {
    dom.adminBooksList.innerHTML = `<div class="empty-state">Aucun livre enregistré.</div>`;
    return;
  }

  dom.adminBooksList.innerHTML = state.books.map((book) => `
    <article class="admin-book-card">
      <div class="badge ${book.published ? 'published' : 'hidden'}">${book.published ? 'Publié' : 'Masqué'}</div>
      <h4>${escapeHtml(book.title)}</h4>
      <p><strong>ID:</strong> ${escapeHtml(book.bookId)}</p>
      <p><strong>JSON:</strong> ${book.jsonPath ? 'Oui' : 'Non'}</p>
      <p><strong>Dernière publication:</strong> ${escapeHtml(book.lastPublishedAt || 'N/A')}</p>
      <div class="admin-book-actions">
        <button class="secondary-btn" type="button" data-open-book="${escapeHtml(book.bookId)}">Ouvrir</button>
        <button class="ghost-btn" type="button" data-toggle-book="${escapeHtml(book.bookId)}">${book.published ? 'Retirer' : 'Publier'}</button>
      </div>
    </article>
  `).join("");
}

async function refreshBooks() {
  await listBooks();
  renderBookList();
  renderAdminBooks();
  if (state.books.length === 1 && state.books[0].published && !state.adminUnlocked) {
    await openBook(state.books[0]);
  }
}

function getBookById(bookId) {
  return state.books.find((book) => book.bookId === bookId) || null;
}

function readNotes() {
  const notes = getNotes();
  dom.noteInput.value = notes[String(state.currentPage)] || "";
}

function saveCurrentNote() {
  const notes = getNotes();
  const value = dom.noteInput.value.trim();
  if (value) notes[String(state.currentPage)] = value;
  else delete notes[String(state.currentPage)];
  saveNotesMap(notes);
  dom.noteStatus.textContent = "Note enregistrée";
  window.setTimeout(() => { dom.noteStatus.textContent = ""; }, 1800);
}

function addBookmark() {
  const bookmarks = getBookmarks();
  if (!bookmarks.some((bookmark) => bookmark.page === state.currentPage)) {
    bookmarks.push({ page: state.currentPage, createdAt: new Date().toISOString() });
    saveBookmarks(bookmarks);
  }
  renderBookmarks();
  showToast(`Signet ajouté à la page ${state.currentPage}`);
}

function removeBookmark(page) {
  const bookmarks = getBookmarks().filter((bookmark) => bookmark.page !== page);
  saveBookmarks(bookmarks);
  renderBookmarks();
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

function normalizeLineText(parts) {
  return parts.join(" ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/([«(])\s+/g, "$1")
    .replace(/\s+([»)])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function extractPageText(items) {
  if (!items?.length) return "";
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

  for (const item of sorted) {
    const text = String(item.str || "").trim();
    if (!text) continue;
    const y = item.transform?.[5] || 0;
    if (currentY === null || Math.abs(y - currentY) <= 3.5) {
      currentLine.push(text);
      currentY = currentY === null ? y : currentY;
    } else {
      lines.push(normalizeLineText(currentLine));
      currentLine = [text];
      currentY = y;
    }
  }

  if (currentLine.length) lines.push(normalizeLineText(currentLine));

  const paragraphs = [];
  let buffer = [];
  for (const line of lines) {
    if (!line) continue;
    const isLikelyParagraphBreak = /^[-•]/.test(line) || /^[A-ZÉÈÀÂÊÎÔÛÇ][A-ZÉÈÀÂÊÎÔÛÇ\s]{5,}$/.test(line);
    if (isLikelyParagraphBreak && buffer.length) {
      paragraphs.push(buffer.join(" ").replace(/-\s+$/g, "-"));
      buffer = [];
    }
    buffer.push(line);
  }
  if (buffer.length) paragraphs.push(buffer.join(" "));

  return paragraphs.join("\n\n").replace(/\s+([,.;:!?])/g, "$1").trim();
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
    const text = extractPageText(textContent.items);
    pages.push({ page: pageNumber, text, charCount: text.length });
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

async function postAdminAction(formData) {
  await fetch(CONFIG.appsScriptUrl, {
    method: "POST",
    mode: "no-cors",
    body: formData
  });
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
  dom.publishProgress.textContent = "Lecture du PDF local...";

  try {
    const jsonDoc = await convertPdfFileToJson(file, { title, bookId, author });
    const arrayBuffer = await file.arrayBuffer();
    const pdfBase64 = arrayBufferToBase64(arrayBuffer);
    const jsonString = JSON.stringify(jsonDoc, null, 2);
    const jsonBase64 = utf8ToBase64(jsonString);

    dom.publishProgress.textContent = "Envoi au service de publication...";
    const formData = new FormData();
    formData.append("action", "publishBook");
    formData.append("email", state.email);
    formData.append("adminCode", state.adminCode);
    formData.append("bookId", bookId);
    formData.append("title", title);
    formData.append("author", author);
    formData.append("publishNow", dom.publishNowInput.checked ? "true" : "false");
    formData.append("sourceFileName", file.name);
    formData.append("totalPages", String(jsonDoc.totalPages));
    formData.append("pdfBase64", pdfBase64);
    formData.append("jsonBase64", jsonBase64);
    formData.append("repoOwner", CONFIG.githubRepoOwner || "");
    formData.append("repoName", CONFIG.githubRepoName || "");
    formData.append("repoBranch", CONFIG.githubRepoBranch || "main");
    formData.append("assetsBasePath", CONFIG.githubAssetsBasePath || "assets/books");

    await postAdminAction(formData);

    setPublishStatus("Publication envoyée...");
    showToast("Publication envoyée. Vérification en cours...");

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
      dom.publishProgress.textContent = "Le PDF et le JSON sont maintenant dans le dépôt GitHub.";
      dom.publishForm.reset();
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
  state.lastSaveSignature = "";
  dom.adminCodeInput.value = "";
  dom.publishForm.hidden = true;
  dom.emailInput.value = "";
  switchScreen("gate");
}

async function handleLogin(event) {
  event.preventDefault();
  const email = normalizeEmail(dom.emailInput.value);
  const suffixes = CONFIG.allowedDomainSuffixes || [];
  if (!email || (suffixes.length && !suffixes.some((suffix) => email.endsWith(`@${suffix}`)))) {
    setGateMessage("Courriel scolaire invalide.", "error");
    return;
  }

  dom.loginBtn.disabled = true;
  setGateMessage("Validation...", "");
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
    dom.loginBtn.disabled = false;
  }
}

function attachEvents() {
  dom.loginForm.addEventListener("submit", handleLogin);
  dom.refreshBooksBtn.addEventListener("click", refreshBooks);
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
  dom.fitBtn.addEventListener("click", () => renderCurrentPage());
  dom.modeToggleBtn.addEventListener("click", async () => {
    if (state.mode === "text") {
      if (!state.pdfDoc) await loadPdfDocument(state.currentBook);
      state.mode = "pdf";
    } else {
      if (state.textDoc) state.mode = "text";
      else showToast("Aucune version texte disponible");
    }
    await renderCurrentPage();
  });
  dom.fontMinusBtn.addEventListener("click", async () => {
    state.fontIndex = Math.max(0, state.fontIndex - 1);
    await renderCurrentPage();
  });
  dom.fontPlusBtn.addEventListener("click", async () => {
    state.fontIndex = Math.min(FONT_CLASSES.length - 1, state.fontIndex + 1);
    await renderCurrentPage();
  });
  dom.themeBtn.addEventListener("click", async () => {
    state.theme = state.theme === "paper" ? "night" : "paper";
    await renderCurrentPage();
  });
  dom.bookmarkBtn.addEventListener("click", addBookmark);
  dom.saveBtn.addEventListener("click", () => saveProgress({ immediate: true }));
  dom.switchUserBtn.addEventListener("click", logoutToGate);
  dom.saveNoteBtn.addEventListener("click", saveCurrentNote);
  dom.unlockAdminBtn.addEventListener("click", unlockAdmin);
  dom.publishForm.addEventListener("submit", publishBook);
  dom.reloadAdminBooksBtn.addEventListener("click", refreshBooks);
  dom.bookTitleInput.addEventListener("input", () => {
    if (!dom.bookIdInput.value.trim()) {
      dom.bookIdInput.value = slugify(dom.bookTitleInput.value);
    }
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
      removeBookmark(Number(removeButton.dataset.removeBookmark));
    }
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
  window.addEventListener("beforeunload", () => {
    if (state.currentBook) saveProgress({ immediate: true });
  });
}

function init() {
  attachEvents();
  switchScreen("gate");
  toggleMenu(false);
  rebuildReadingSurfaceClasses();
}

init();
