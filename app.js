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
const LS_BOOKS_CACHE_KEY = "booksCache_v1";

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
  libraryGreeting: document.getElementById("libraryGreeting"),
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
  publishHiddenPagesInput: document.getElementById("publishHiddenPagesInput"),
  publishHiddenPagesSummary: document.getElementById("publishHiddenPagesSummary"),
  publishNowInput: document.getElementById("publishNowInput"),
  publishRestrictedAccessInput: document.getElementById("publishRestrictedAccessInput"),
  publishAssignWrap: document.getElementById("publishAssignWrap"),
  publishAssignedSearchInput: document.getElementById("publishAssignedSearchInput"),
  publishAssignedSummary: document.getElementById("publishAssignedSummary"),
  publishAssignedList: document.getElementById("publishAssignedList"),
  publishBtn: document.getElementById("publishBtn"),
  publishStatus: document.getElementById("publishStatus"),
  publishProgress: document.getElementById("publishProgress"),
  publishSizeWarning: document.getElementById("publishSizeWarning"),
  reloadAdminBooksBtn: document.getElementById("reloadAdminBooksBtn"),
  adminBooksList: document.getElementById("adminBooksList"),

  bookLoadingOverlay: document.getElementById("bookLoadingOverlay"),
  bookLoadingMessage: document.getElementById("bookLoadingMessage"),

  addUsersSection: document.getElementById("addUsersSection"),
  addUsersTextarea: document.getElementById("addUsersTextarea"),
  addUsersBtn: document.getElementById("addUsersBtn"),
  addUsersStatus: document.getElementById("addUsersStatus"),

  editBookModal: document.getElementById("editBookModal"),
  editBookTitle: document.getElementById("editBookTitle"),
  editBookAuthor: document.getElementById("editBookAuthor"),
  editBookDescription: document.getElementById("editBookDescription"),
  editBookHiddenPages: document.getElementById("editBookHiddenPages"),
  editHiddenPagesSummary: document.getElementById("editHiddenPagesSummary"),
  editRestrictedAccessInput: document.getElementById("editRestrictedAccessInput"),
  editAssignWrap: document.getElementById("editAssignWrap"),
  editAssignedSearchInput: document.getElementById("editAssignedSearchInput"),
  editAssignedSummary: document.getElementById("editAssignedSummary"),
  editAssignedList: document.getElementById("editAssignedList"),
  editBookId: document.getElementById("editBookId"),
  editBookSaveBtn: document.getElementById("editBookSaveBtn"),
  editBookCancelBtn: document.getElementById("editBookCancelBtn"),
  editBookStatus: document.getElementById("editBookStatus"),

  profileModal: document.getElementById("profileModal"),
  profileFirstNameInput: document.getElementById("profileFirstNameInput"),
  profileLastNameInput: document.getElementById("profileLastNameInput"),
  profileSaveBtn: document.getElementById("profileSaveBtn"),
  profileStatus: document.getElementById("profileStatus"),

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
  bookmarkStatus: document.getElementById("bookmarkStatus"),
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
  pageJumpModal: document.getElementById("pageJumpModal"),
  pageJumpInput: document.getElementById("pageJumpInput"),
  pageJumpTotal: document.getElementById("pageJumpTotal"),
  pageJumpGoBtn: document.getElementById("pageJumpGoBtn"),
  pageJumpStayBtn: document.getElementById("pageJumpStayBtn"),
  toast: document.getElementById("toast"),
};

// ════════════════════════════════════════
// STATE
// ════════════════════════════════════════
const state = {
  email: "",
  userProfile: { firstName: "", lastName: "" },
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
  sourceTotalPages: 0,
  visiblePages: [],
  authVerified: false,
  bookmarkActionBusy: false,
  currentPdfRenderTask: null,
  assignableUsers: [],
  publishAssignedEmails: [],
  editAssignedEmails: [],
  openingBookId: "",
  editBusyBookId: "",
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

function normalizePersonName(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/(^|[\s\-'])\p{L}/gu, (match) => match.toUpperCase());
}

function getUserFirstName() {
  return normalizePersonName(state.userProfile?.firstName || "");
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

function setBookmarkStatus(message, kind = "", busy = false) {
  if (!dom.bookmarkStatus) return;
  dom.bookmarkStatus.className = `save-status${kind ? ` status-${kind}` : ""}`;
  if (!message) {
    dom.bookmarkStatus.innerHTML = "";
    return;
  }
  dom.bookmarkStatus.innerHTML = busy
    ? `<span class="inline-spinner" aria-hidden="true"></span><span>${escapeHtml(message)}</span>`
    : escapeHtml(message);
}

function setBookLoading(isVisible, message = "Chargement du livre en cours. Veuillez patienter.") {
  if (!dom.bookLoadingOverlay) return;
  dom.bookLoadingOverlay.hidden = !isVisible;
  if (dom.bookLoadingMessage) dom.bookLoadingMessage.textContent = message || "Chargement du livre en cours…";
}

function canSeeAdminPanel() {
  const configAdminEmail = normalizeEmail(CONFIG.adminEmail || "");
  return !!state.isAdminCandidate && (!configAdminEmail || normalizeEmail(state.email) === configAdminEmail);
}

function applyAdminVisibility() {
  const showPanel = canSeeAdminPanel();
  dom.adminPanel.hidden = !showPanel;
  const showUnlocked = showPanel && !!state.adminUnlocked;
  dom.publishForm.hidden = !showUnlocked;
  dom.githubTestRow.hidden = !showUnlocked;
  dom.addUsersSection.hidden = !showUnlocked;
}

function resetAdminState() {
  state.isAdminCandidate = false;
  state.adminUnlocked = false;
  state.adminCode = "";
  state.assignableUsers = [];
  state.publishAssignedEmails = [];
  state.editAssignedEmails = [];
  dom.adminCodeInput.value = "";
  applyAdminVisibility();
  setPublishStatus("En attente");
}

function readCurrentBookState() {
  try {
    const raw = localStorage.getItem(LS_CURRENT_BOOK_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data?.bookId) return null;
    if (data.email && normalizeEmail(data.email) !== normalizeEmail(state.email)) return null;
    return data;
  } catch (_) {
    return null;
  }
}

function buildBookSnapshot(book) {
  if (!book?.bookId) return null;
  return {
    bookId: book.bookId,
    title: book.title || "",
    author: book.author || "",
    published: !!book.published,
    pdfPath: book.pdfPath || "",
    jsonPath: book.jsonPath || "",
    coverPath: book.coverPath || "",
    totalPages: Number(book.totalPages) || 0,
    sourceFileName: book.sourceFileName || "",
    description: book.description || "",
    lastPublishedAt: book.lastPublishedAt || "",
    lastUpdatedBy: book.lastUpdatedBy || "",
    pdfAllowed: !!book.pdfAllowed,
    hiddenPageRanges: book.hiddenPageRanges || "",
    restrictedAccess: !!book.restrictedAccess,
    assignedEmails: Array.isArray(book.assignedEmails) ? [...book.assignedEmails] : [],
    visiblePageCount: Number(book.visiblePageCount) || 0,
    hiddenPagesCount: Number(book.hiddenPagesCount) || 0,
    hiddenPagesList: Array.isArray(book.hiddenPagesList) ? [...book.hiddenPagesList] : [],
  };
}

function saveBooksCache() {
  if (!state.email) return;
  try {
    localStorage.setItem(LS_BOOKS_CACHE_KEY, JSON.stringify({
      email: state.email,
      books: Array.isArray(state.books) ? state.books.map(buildBookSnapshot).filter(Boolean) : [],
      savedAt: Date.now(),
    }));
  } catch (_) {}
}

function readBooksCache() {
  try {
    const raw = localStorage.getItem(LS_BOOKS_CACHE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data?.email || normalizeEmail(data.email) !== normalizeEmail(state.email)) return null;
    if (!Array.isArray(data.books)) return null;
    return data;
  } catch (_) {
    return null;
  }
}

function clearBooksCache() {
  try { localStorage.removeItem(LS_BOOKS_CACHE_KEY); } catch (_) {}
}

function getVisibleBookPageCount(book) {
  const total = Number(book?.totalPages) || 0;
  if (!total) return 0;
  return buildVisiblePages(total, book?.hiddenPageRanges || "").length;
}

function normalizeAssignedEmailList(value) {
  if (Array.isArray(value)) {
    return [...new Set(value.map((item) => normalizeEmail(item)).filter((item) => isValidEmail(item)))];
  }
  return String(value || "")
    .split(/[\n,;]+/)
    .map((item) => normalizeEmail(item))
    .filter((item, index, array) => item && isValidEmail(item) && array.indexOf(item) === index);
}

function expandPageRanges(ranges, totalPages = 0) {
  const total = Math.max(0, Number(totalPages) || 0);
  const pages = [];
  const seen = new Set();
  String(ranges || "")
    .split(/[;,]+/)
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .forEach((part) => {
      const match = part.match(/^(\d+)\s*-\s*(\d+)$/);
      if (match) {
        let start = Number(match[1]);
        let end = Number(match[2]);
        if (start > end) [start, end] = [end, start];
        for (let page = start; page <= end; page += 1) {
          if (page < 1) continue;
          if (total && page > total) break;
          if (!seen.has(page)) {
            seen.add(page);
            pages.push(page);
          }
        }
        return;
      }
      const page = Number(part);
      if (!Number.isFinite(page) || page < 1) return;
      if (total && page > total) return;
      if (!seen.has(page)) {
        seen.add(page);
        pages.push(page);
      }
    });
  return pages.sort((a, b) => a - b);
}

function compressPageList(pageList = []) {
  const pages = [...new Set((Array.isArray(pageList) ? pageList : []).map((item) => Number(item)).filter((item) => Number.isFinite(item) && item >= 1))].sort((a, b) => a - b);
  if (!pages.length) return "";
  const ranges = [];
  let start = pages[0];
  let previous = pages[0];
  for (let index = 1; index < pages.length; index += 1) {
    const current = pages[index];
    if (current === previous + 1) {
      previous = current;
      continue;
    }
    ranges.push(start === previous ? String(start) : `${start}-${previous}`);
    start = current;
    previous = current;
  }
  ranges.push(start === previous ? String(start) : `${start}-${previous}`);
  return ranges.join(", ");
}

function renderHiddenPagesSummary(totalPages, hiddenPageRanges, target = dom.editHiddenPagesSummary) {
  if (!target) return;
  const total = Math.max(0, Number(totalPages) || 0);
  const hiddenPages = expandPageRanges(hiddenPageRanges, total);
  const visibleCount = Math.max(0, total - hiddenPages.length);
  if (!hiddenPages.length) {
    target.innerHTML = total
      ? `<div class="hidden-pages-stats">Pages affichées aux élèves: <strong>${visibleCount}</strong> / ${total}</div><div class="hidden-pages-empty">Aucune page masquée actuellement.</div>`
      : `<div class="hidden-pages-empty">Aucune page masquée actuellement.</div>`;
    return;
  }
  const preview = hiddenPages.length <= 24
    ? hiddenPages.map((page) => `<span class="hidden-page-chip">${page}</span>`).join("")
    : `<div class="hidden-pages-range-text">${escapeHtml(compressPageList(hiddenPages))}</div>`;
  target.innerHTML = `
    <div class="hidden-pages-stats">Pages affichées aux élèves: <strong>${visibleCount}</strong> / ${total}</div>
    <div class="hidden-pages-stats">Pages masquées: <strong>${hiddenPages.length}</strong></div>
    <div class="hidden-pages-preview">${preview}</div>
  `;
}

function getAssignableUserDisplay(user) {
  const fullName = [user?.firstName, user?.lastName].map((item) => String(item || "").trim()).filter(Boolean).join(" ");
  return fullName || String(user?.email || "");
}

function renderAssignableUsers(kind) {
  const isEdit = kind === "edit";
  const wrap = isEdit ? dom.editAssignWrap : dom.publishAssignWrap;
  const enabled = isEdit ? !!dom.editRestrictedAccessInput?.checked : !!dom.publishRestrictedAccessInput?.checked;
  if (wrap) wrap.hidden = !enabled;
  const listEl = isEdit ? dom.editAssignedList : dom.publishAssignedList;
  const summaryEl = isEdit ? dom.editAssignedSummary : dom.publishAssignedSummary;
  const searchEl = isEdit ? dom.editAssignedSearchInput : dom.publishAssignedSearchInput;
  const selected = isEdit ? state.editAssignedEmails : state.publishAssignedEmails;
  if (!listEl || !summaryEl || !searchEl) return;

  const normalizedSelected = normalizeAssignedEmailList(selected);
  if (isEdit) state.editAssignedEmails = normalizedSelected;
  else state.publishAssignedEmails = normalizedSelected;

  const selectedCount = normalizedSelected.length;
  summaryEl.textContent = selectedCount
    ? `${selectedCount} utilisateur(s) sélectionné(s).`
    : "Aucun utilisateur sélectionné.";

  if (!enabled) {
    listEl.innerHTML = "";
    return;
  }

  const query = String(searchEl.value || "").trim().toLowerCase();
  const users = state.assignableUsers.filter((user) => {
    if (!query) return true;
    const hay = `${getAssignableUserDisplay(user)} ${user.email || ""}`.toLowerCase();
    return hay.includes(query);
  });

  if (!users.length) {
    listEl.innerHTML = `<div class="assign-users-empty">Aucun utilisateur trouvé.</div>`;
    return;
  }

  listEl.innerHTML = users.map((user) => {
    const checked = normalizedSelected.includes(user.email);
    const fullName = getAssignableUserDisplay(user);
    const same = fullName === user.email;
    return `
      <label class="assign-user-row">
        <input type="checkbox" data-assignment-kind="${isEdit ? "edit" : "publish"}" data-assignment-email="${escapeHtml(user.email)}" ${checked ? "checked" : ""}>
        <span class="assign-user-text">
          <span class="assign-user-name">${escapeHtml(fullName)}</span>
          ${same ? "" : `<span class="assign-user-email">${escapeHtml(user.email)}</span>`}
        </span>
      </label>
    `;
  }).join("");
}

async function loadAssignableUsers(force = false) {
  if (!canSeeAdminPanel() || !state.adminUnlocked) return;
  if (!force && state.assignableUsers.length) {
    renderAssignableUsers("publish");
    renderAssignableUsers("edit");
    return;
  }
  try {
    const response = await jsonp("listAssignableUsers", {
      email: state.email,
      adminCode: state.adminCode,
    });
    if (!response?.ok) throw new Error(response?.message || "Impossible de charger les utilisateurs.");
    state.assignableUsers = Array.isArray(response.users) ? response.users.map((user) => ({
      email: normalizeEmail(user.email || ""),
      firstName: normalizePersonName(user.firstName || ""),
      lastName: normalizePersonName(user.lastName || ""),
    })).filter((user) => user.email) : [];
    renderAssignableUsers("publish");
    renderAssignableUsers("edit");
  } catch (error) {
    console.error(error);
  }
}

function handleAssignmentToggle(kind, enabled) {
  if (kind === "edit") {
    if (!enabled) dom.editAssignedSearchInput.value = "";
    renderAssignableUsers("edit");
    return;
  }
  if (!enabled) dom.publishAssignedSearchInput.value = "";
  renderAssignableUsers("publish");
}

function updateAssignmentSelection(kind, email, checked) {
  const key = kind === "edit" ? "editAssignedEmails" : "publishAssignedEmails";
  const next = new Set(normalizeAssignedEmailList(state[key]));
  if (checked) next.add(normalizeEmail(email));
  else next.delete(normalizeEmail(email));
  state[key] = [...next];
  renderAssignableUsers(kind);
}

function normalizeRestoredDisplayPage(pageNumber) {
  const target = Math.max(1, Number(pageNumber) || 1);
  if (!state.visiblePages?.length) return target;

  if (state.currentBook?.hiddenPageRanges) {
    if (target <= state.visiblePages.length) {
      return target;
    }
    const sourceIndex = state.visiblePages.indexOf(target);
    if (sourceIndex >= 0) return sourceIndex + 1;

    const nextVisibleIndex = state.visiblePages.findIndex((sourcePage) => sourcePage >= target);
    if (nextVisibleIndex >= 0) return nextVisibleIndex + 1;
    return state.visiblePages.length;
  }

  return Math.max(1, Math.min(state.visiblePages.length, target));
}

function cancelActivePdfRender() {
  if (!state.currentPdfRenderTask) return;
  try {
    state.currentPdfRenderTask.cancel();
  } catch (_) {}
  state.currentPdfRenderTask = null;
}

function buildVisiblePages(totalPages, hiddenPageRanges = "") {
  const total = Math.max(0, Number(totalPages) || 0);
  const pages = [];
  if (!hiddenPageRanges || !String(hiddenPageRanges).trim()) {
    for (let i = 1; i <= total; i++) pages.push(i);
    return pages;
  }
  const hidden = new Set();
  String(hiddenPageRanges)
    .split(/[;,]+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .forEach((part) => {
      const m = part.match(/^(\d+)\s*-\s*(\d+)$/);
      if (m) {
        let a = Number(m[1]);
        let b = Number(m[2]);
        if (a > b) [a, b] = [b, a];
        for (let n = a; n <= b; n++) {
          if (n >= 1 && n <= total) hidden.add(n);
        }
        return;
      }
      const num = Number(part);
      if (Number.isFinite(num) && num >= 1 && num <= total) hidden.add(num);
    });
  for (let i = 1; i <= total; i++) {
    if (!hidden.has(i)) pages.push(i);
  }
  return pages;
}

function getSourcePageNumber(displayPageNumber) {
  if (!state.visiblePages?.length) return displayPageNumber;
  return state.visiblePages[Math.max(0, (Number(displayPageNumber) || 1) - 1)] || displayPageNumber;
}

async function resolveBookForOpening(book) {
  const fallbackBook = buildBookSnapshot(book) || book;
  if (!fallbackBook?.bookId || !state.authVerified) return fallbackBook;
  try {
    const response = await jsonp("listBooks", {
      email: state.email,
      adminCode: state.adminUnlocked ? state.adminCode : "",
    });
    if (!response?.ok) return fallbackBook;
    const books = Array.isArray(response.books) ? response.books.map(buildBookSnapshot).filter(Boolean) : [];
    if (books.length) {
      state.books = books;
      saveBooksCache();
      if (!dom.library.hidden) {
        renderBookList();
        renderAdminBooks();
      }
      const latest = books.find((item) => item.bookId === fallbackBook.bookId);
      if (latest) return latest;
    }
  } catch (_) {
    // on retombe sur les métadonnées déjà connues
  }
  return fallbackBook;
}

function openPageJumpModal() {
  if (!dom.pageJumpModal || !state.totalPages) return;
  dom.pageJumpTotal.textContent = String(state.totalPages);
  dom.pageJumpInput.max = String(state.totalPages);
  dom.pageJumpInput.value = String(state.currentPage || 1);
  dom.pageJumpModal.hidden = false;
  window.setTimeout(() => {
    dom.pageJumpInput.focus();
    dom.pageJumpInput.select();
  }, 30);
}

function closePageJumpModal() {
  if (!dom.pageJumpModal) return;
  dom.pageJumpModal.hidden = true;
}

async function submitPageJump() {
  const targetPage = Math.max(1, Math.min(state.totalPages || 1, Number(dom.pageJumpInput.value) || state.currentPage || 1));
  closePageJumpModal();
  await goToPage(targetPage, { reason: "jump" });
}

function updateLibraryGreeting() {
  const firstName = getUserFirstName();
  if (dom.libraryGreeting) {
    dom.libraryGreeting.innerHTML = firstName
      ? `Bonjour ${escapeHtml(firstName)}<br>Qu'est-ce qu'on lit aujourd'hui?`
      : "Qu'est-ce qu'on lit aujourd'hui?";
  }
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

function cleanLoginQueryFromUrl() {
  try {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("email")) return;
    url.search = "";
    window.history.replaceState({}, "", url.toString());
  } catch (_) {}
}


function on(node, eventName, handler, options) {
  if (!node || !node.addEventListener) return;
  node.addEventListener(eventName, handler, options);
}

function bindSafeLoginEvents() {
  const runLogin = (event) => {
    if (event) event.preventDefault();
    void handleLogin(event || { preventDefault() {} });
  };
  on(dom.loginForm, "submit", runLogin);
  on(dom.loginBtn, "click", runLogin);
  on(dom.emailInput, "keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      runLogin(e);
    }
  });
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

function setBookmarkControlsDisabled(disabled) {
  const shouldDisable = !!disabled;
  if (dom.bookmarkBtn) dom.bookmarkBtn.disabled = shouldDisable;
  if (!dom.bookmarkList) return;
  dom.bookmarkList.querySelectorAll("button").forEach((btn) => {
    btn.disabled = shouldDisable;
  });
}

function resetSensitiveUiState() {
  cancelActivePdfRender();
  state.userProfile = { firstName: "", lastName: "" };
  state.books = [];
  state.currentBook = null;
  state.pdfDoc = null;
  state.textDoc = null;
  state.totalPages = 0;
  state.sourceTotalPages = 0;
  state.visiblePages = [];
  state.currentPage = 1;
  state.bookmarks = [];
  state.notes = [];
  state.editingNoteId = "";
  state.lastSaveSignature = "";
  state.pdfZoomMultiplier = 1;
  state.authVerified = false;
  state.bookmarkActionBusy = false;
  state.isBookmarkSaving = false;
  if (dom.bookList) dom.bookList.innerHTML = "";
  if (dom.libraryGreeting) dom.libraryGreeting.textContent = "";
  if (dom.libraryMeta) dom.libraryMeta.textContent = "";
  setBookmarkStatus("");
  setSaveStatus("");
}

function renderLibraryLoadingState(message) {
  updateLibraryGreeting();
  dom.libraryMeta.textContent = canSeeAdminPanel()
    ? `${state.email} - mode administrateur disponible`
    : state.email;
  dom.bookList.innerHTML = `<div class="empty-state loading-state"><span class="inline-spinner" aria-hidden="true"></span><span>${escapeHtml(message)}</span></div>`;
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
      userProfile: {
        firstName: state.userProfile?.firstName || "",
        lastName: state.userProfile?.lastName || "",
      },
    }));
  } catch (_) { /* localStorage peut être désactivé */ }
}

function clearSession() {
  try { localStorage.removeItem(SESSION_KEY); } catch (_) {}
  try { localStorage.removeItem(LS_CURRENT_BOOK_KEY); } catch (_) {}
  clearBooksCache();
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
    state.userProfile = {
      firstName: normalizePersonName(data.userProfile?.firstName || ""),
      lastName: normalizePersonName(data.userProfile?.lastName || ""),
    };
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
      email: state.email,
      bookId: state.currentBook.bookId,
      page: state.currentPage,
      book: buildBookSnapshot(state.currentBook),
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
  if (!state.email || !state.authVerified) {
    throw new Error("Session invalide.");
  }
  const response = await jsonp("listBooks", {
    email: state.email,
    adminCode: state.adminUnlocked ? state.adminCode : "",
  });
  if (!response?.ok) throw new Error(response?.message || "Impossible de charger les livres.");
  state.books = Array.isArray(response.books) ? response.books.map(buildBookSnapshot).filter(Boolean) : [];
  saveBooksCache();
  renderBookList();
  renderAdminBooks();
  if (state.adminUnlocked) {
    renderAssignableUsers("publish");
    renderAssignableUsers("edit");
  }
}

// ════════════════════════════════════════
// PROGRESSION
// ════════════════════════════════════════
async function fetchProgress(bookId) {
  if (!state.authVerified) return null;
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

async function saveProgress({ immediate = false, showSuccess = false, showError = false } = {}) {
  if (!state.email || !state.currentBook || !state.authVerified) return;
  const payload = buildProgressPayload();
  const signature = JSON.stringify(payload);
  if (!immediate && signature === state.lastSaveSignature) return;
  try {
    setSaveStatus("Enregistrement...");
    const response = await jsonp("saveProgress", payload);
    if (!response?.ok) throw new Error(response?.message || "Erreur d'enregistrement.");
    state.lastSaveSignature = signature;
    setSaveStatus("Progression enregistrée", "success");
    if (showSuccess) showToast("Progression enregistrée");
  } catch (error) {
    console.error(error);
    setSaveStatus("Sauvegarde impossible", "error");
    if (showError) showToast("Sauvegarde impossible");
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
  if (!state.currentBook || !state.authVerified) return;
  const response = await jsonp("listBookmarks", {
    email: state.email, bookId: state.currentBook.bookId,
  });
  state.bookmarks = response?.ok && Array.isArray(response.bookmarks) ? response.bookmarks : [];
  renderBookmarks();
}

async function addBookmark() {
  if (!state.currentBook || state.bookmarkActionBusy || !state.authVerified) return;
  if (state.bookmarks.some((b) => Number(b.page) === state.currentPage)) {
    setBookmarkStatus(`Un signet existe déjà pour la page ${state.currentPage}.`, "pending");
    showToast(`Signet déjà présent à la page ${state.currentPage}`);
    return;
  }
  state.bookmarkActionBusy = true;
  setBookmarkControlsDisabled(true);
  setBookmarkStatus("Sauvegarde du signet en cours, veuillez patienter…", "pending", true);
  try {
    const response = await jsonp("addBookmark", {
      email: state.email, bookId: state.currentBook.bookId, page: state.currentPage,
    });
    if (!response?.ok) throw new Error(response?.message || "Impossible d'ajouter le signet.");
    state.bookmarks.push({
      email: state.email,
      bookId: state.currentBook.bookId,
      page: state.currentPage,
      createdAt: new Date().toISOString(),
      label: "",
    });
    state.bookmarks.sort((a, b) => Number(a.page) - Number(b.page));
    markBookmarkArrival(state.currentPage);
    renderBookmarks();
    setBookmarkStatus(`Signet enregistré à la page ${state.currentPage}.`, "success");
    showToast(`Signet ajouté - page ${state.currentPage}`);
  } catch (error) {
    console.error(error);
    setBookmarkStatus(error.message || "Impossible d'enregistrer le signet.", "error");
    showToast("Impossible d'ajouter le signet");
  } finally {
    state.bookmarkActionBusy = false;
    setBookmarkControlsDisabled(false);
  }
}

async function removeBookmark(page) {
  if (!state.currentBook || state.bookmarkActionBusy || !state.authVerified) return;
  state.bookmarkActionBusy = true;
  setBookmarkControlsDisabled(true);
  setBookmarkStatus("Suppression du signet en cours, veuillez patienter…", "pending", true);
  try {
    const response = await jsonp("removeBookmark", {
      email: state.email, bookId: state.currentBook.bookId, page,
    });
    if (!response?.ok) throw new Error(response?.message || "Impossible de supprimer le signet.");
    state.bookmarks = state.bookmarks.filter((item) => Number(item.page) !== Number(page));
    if (state.lastOpenedBookmarkPage === Number(page)) state.lastOpenedBookmarkPage = 0;
    renderBookmarks();
    setBookmarkStatus("Signet supprimé.", "success");
    showToast("Signet supprimé");
  } catch (error) {
    console.error(error);
    setBookmarkStatus(error.message || "Impossible de supprimer le signet.", "error");
    showToast("Impossible de supprimer le signet");
  } finally {
    state.bookmarkActionBusy = false;
    setBookmarkControlsDisabled(false);
  }
}

async function renameBookmark(page) {
  if (!state.currentBook || state.bookmarkActionBusy || !state.authVerified) return;
  const bookmark = state.bookmarks.find((item) => Number(item.page) === Number(page));
  if (!bookmark) return;
  const currentLabel = String(bookmark.label || "");
  const nextLabel = window.prompt(`Renommer le signet de la page ${page}`, currentLabel);
  if (nextLabel === null) return;
  state.bookmarkActionBusy = true;
  setBookmarkControlsDisabled(true);
  setBookmarkStatus("Enregistrement du nom du signet en cours…", "pending", true);
  try {
    const response = await jsonp("renameBookmark", {
      email: state.email,
      bookId: state.currentBook.bookId,
      page,
      label: nextLabel.trim(),
    });
    if (!response?.ok) throw new Error(response?.message || "Impossible de renommer le signet.");
    bookmark.label = nextLabel.trim();
    renderBookmarks();
    markBookmarkArrival(page);
    setBookmarkStatus("Nom du signet enregistré.", "success");
    showToast("Nom du signet enregistré");
  } catch (error) {
    console.error(error);
    setBookmarkStatus(error.message || "Impossible de renommer le signet.", "error");
    showToast("Impossible de renommer le signet");
  } finally {
    state.bookmarkActionBusy = false;
    setBookmarkControlsDisabled(false);
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
    const label = String(b.label || "").trim();
    const isCurrent = page === state.currentPage;
    const isPulsed = page === state.lastOpenedBookmarkPage;
    const classes = ["bookmark-chip"];
    if (isCurrent) classes.push("active");
    if (isPulsed) classes.push("bookmark-pulse");
    const title = label ? `${escapeHtml(label)} (page ${page})` : `Page ${page}`;
    const subline = label ? `Page ${page}` : "Signet";
    return `
      <div class="${classes.join(" ")}">
        <div class="bookmark-chip-main">
          <button type="button" data-bookmark-page="${page}">${title}</button>
          <span class="bookmark-chip-label">${escapeHtml(subline)}</span>
        </div>
        <div class="bookmark-chip-actions">
          <button type="button" data-rename-bookmark="${page}">Renommer</button>
          <button type="button" data-remove-bookmark="${page}">Retirer</button>
        </div>
      </div>
    `;
  }).join("");
}

// ════════════════════════════════════════
// NOTES
// ════════════════════════════════════════
async function loadNotes() {
  if (!state.currentBook || !state.authVerified) return;
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

function renderOpenBookButton(bookId, label = "Ouvrir", className = "nav-btn") {
  const isOpening = state.openingBookId && state.openingBookId === bookId;
  return `
    <button class="${className} book-open-btn${isOpening ? " is-loading" : ""}" type="button" data-open-book="${escapeHtml(bookId)}"${isOpening ? " disabled aria-busy=\"true\"" : ""}>
      ${isOpening
        ? `<span class="inline-spinner" aria-hidden="true"></span><span>Chargement…</span>`
        : escapeHtml(label)}
    </button>
  `;
}

function renderBookList() {
  if (!state.authVerified) {
    dom.bookList.innerHTML = "";
    return;
  }
  updateLibraryGreeting();
  dom.libraryMeta.textContent = canSeeAdminPanel()
    ? `${state.email} - mode administrateur disponible`
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
        <p class="book-meta">${getVisibleBookPageCount(book) ? `${getVisibleBookPageCount(book)} pages` : "Nombre de pages inconnu"}</p>
        <div class="book-actions">
          ${renderOpenBookButton(book.bookId, "Ouvrir", "nav-btn")}
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
  dom.adminBooksList.innerHTML = state.books.map((book) => {
    const realPages = Number(book.totalPages) || 0;
    const visiblePages = Number(book.visiblePageCount) || getVisibleBookPageCount(book);
    const hiddenPagesCount = Math.max(0, realPages - visiblePages);
    const isEditBusy = state.editBusyBookId && state.editBusyBookId === book.bookId;
    return `
      <article class="admin-book-card">
        ${coverHtml(book, "admin-book-cover")}
        <div>
          <div class="badge ${book.published ? "published" : "hidden"}">${book.published ? "Publié" : "Masqué"}</div>
          <h4>${escapeHtml(book.title)}</h4>
          <p>${book.author ? escapeHtml(book.author) : "Auteur non indiqué"}</p>
          <p>${realPages ? `${realPages} pages réelles` : "Pages inconnues"}</p>
          <p>${visiblePages ? `${visiblePages} pages affichées aux élèves` : "Pages visibles inconnues"}</p>
          ${hiddenPagesCount ? `<p class="book-meta">${hiddenPagesCount} page(s) masquée(s)${book.hiddenPageRanges ? ` - ${escapeHtml(book.hiddenPageRanges)}` : ""}</p>` : ""}
          <div class="admin-book-actions">
            ${renderOpenBookButton(book.bookId, "Ouvrir", "secondary-btn")}
            <button class="ghost-btn" type="button" data-toggle-book="${escapeHtml(book.bookId)}">${book.published ? "Masquer" : "Publier"}</button>
            <button class="ghost-btn" type="button" data-toggle-pdf="${escapeHtml(book.bookId)}">${book.pdfAllowed ? "PDF : OUI" : "PDF : NON"}</button>
            <button class="ghost-btn admin-edit-btn${isEditBusy ? " is-loading" : ""}" type="button" data-edit-book="${escapeHtml(book.bookId)}"${isEditBusy ? " disabled aria-busy=\"true\"" : ""}>
              ${isEditBusy ? `<span class="inline-spinner" aria-hidden="true"></span><span>Chargement…</span>` : "Modifier"}
            </button>
          </div>
        </div>
      </article>
    `;
  }).join("");
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
  const sourcePageNumber = getSourcePageNumber(pageNumber);
  const page = state.textDoc?.pages?.[sourcePageNumber - 1];
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
    state.fallbackNoticeShownForPage = pageNumber;
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
  cancelActivePdfRender();
  const renderToken = ++state.renderToken;
  const sourcePageNumber = getSourcePageNumber(pageNumber);
  const page = await state.pdfDoc.getPage(sourcePageNumber);
  if (renderToken !== state.renderToken) return;
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
  const renderTask = page.render(renderContext);
  state.currentPdfRenderTask = renderTask;
  try {
    await renderTask.promise;
  } catch (error) {
    if (error?.name === "RenderingCancelledException") return;
    throw error;
  } finally {
    if (state.currentPdfRenderTask === renderTask) {
      state.currentPdfRenderTask = null;
    }
  }
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

async function openBook(book, options = {}) {
  if (!state.authVerified || !book) throw new Error("Session invalide.");
  const resolvedBook = await resolveBookForOpening(book);
  const firstName = getUserFirstName();
  const defaultLoadingMessage = firstName
    ? `Chargement du livre en cours. Veuillez patienter, ${firstName}.`
    : "Chargement du livre en cours. Veuillez patienter.";
  const { preferredPage = 0, loadingMessage = defaultLoadingMessage } = options;
  cancelActivePdfRender();
  state.currentBook = resolvedBook;
  state.currentPage = 1;
  state.totalPages = Number(resolvedBook.totalPages) || 0;
  state.sourceTotalPages = Number(resolvedBook.totalPages) || 0;
  state.visiblePages = [];
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
  setBookLoading(true, loadingMessage);

  try {
    const [progress, bookmarksResult, notesResult, textDoc] = await Promise.all([
      fetchProgress(resolvedBook.bookId).catch(() => null),
      jsonp("listBookmarks", { email: state.email, bookId: resolvedBook.bookId }).catch(() => ({ ok: false })),
      jsonp("listNotes", { email: state.email, bookId: resolvedBook.bookId }).catch(() => ({ ok: false })),
      loadTextJson(resolvedBook).catch(() => null),
    ]);

    state.bookmarks = bookmarksResult?.ok && Array.isArray(bookmarksResult.bookmarks) ? bookmarksResult.bookmarks : [];
    state.notes = notesResult?.ok && Array.isArray(notesResult.notes) ? notesResult.notes : [];
    state.textDoc = textDoc;

    let sourceTotalPages = textDoc?.totalPages ? Number(textDoc.totalPages) || 0 : (Number(resolvedBook.totalPages) || 0);
    if (!sourceTotalPages || !textDoc) {
      const pdfDoc = await loadPdfDocument(resolvedBook);
      sourceTotalPages = pdfDoc.numPages;
    }

    state.sourceTotalPages = sourceTotalPages;
    state.visiblePages = buildVisiblePages(sourceTotalPages, resolvedBook.hiddenPageRanges || "");
    if (!state.visiblePages.length) {
      throw new Error("Toutes les pages de ce livre sont actuellement masquées.");
    }
    state.totalPages = state.visiblePages.length;

    const pdfAllowed = !!resolvedBook.pdfAllowed;
    state.mode = textDoc ? (CONFIG.defaultReaderMode || "text") : (pdfAllowed ? "pdf" : "text");
    const serverPage = progress?.currentPage ? Number(progress.currentPage) : 1;
    const restoredPage = Number(preferredPage) || serverPage || 1;
    state.currentPage = Math.max(1, Math.min(state.totalPages, normalizeRestoredDisplayPage(restoredPage)));
    resetNoteEditor();
    await renderCurrentPage({ forceFit: true });
    setSaveStatus("Prêt");
    saveCurrentBookState();
  } finally {
    setBookLoading(false);
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
  if (!canSeeAdminPanel()) {
    showToast("Accès administrateur refusé");
    resetAdminState();
    return;
  }
  const code = dom.adminCodeInput.value.trim();
  if (!code) { showToast("Entre le code administrateur"); return; }

  dom.unlockAdminBtn.disabled = true;
  dom.unlockAdminBtn.textContent = "Vérification…";

  try {
    const response = await jsonp("listBooks", { email: state.email, adminCode: code });
    if (!response?.ok) throw new Error(response?.message || "Code invalide.");
    state.adminUnlocked = true;
    state.adminCode = code;
    applyAdminVisibility();
    setPublishStatus("Module administrateur déverrouillé", true);
    saveSession();
    await refreshBooks();
    await loadAssignableUsers(true);
  } catch (error) {
    console.error(error);
    showToast("Code administrateur invalide");
  } finally {
    dom.unlockAdminBtn.disabled = false;
    dom.unlockAdminBtn.textContent = "Déverrouiller";
  }
}

async function testGithubConnection() {
  if (!canSeeAdminPanel() || !state.adminUnlocked) return;
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
  if (!canSeeAdminPanel() || !state.adminUnlocked) return;
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
  if (!canSeeAdminPanel() || !state.adminUnlocked) return;
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
async function openEditBookModal(bookId) {
  if (!canSeeAdminPanel() || !state.adminUnlocked) return;
  state.editBusyBookId = bookId;
  renderAdminBooks();
  try {
    await loadAssignableUsers();
    const book = getBookById(bookId);
    if (!book) return;
    dom.editBookId.value = book.bookId;
    dom.editBookTitle.value = book.title || "";
    dom.editBookAuthor.value = book.author || "";
    dom.editBookDescription.value = book.description || "";
    dom.editBookHiddenPages.value = book.hiddenPageRanges || "";
    dom.editRestrictedAccessInput.checked = !!book.restrictedAccess;
    state.editAssignedEmails = normalizeAssignedEmailList(book.assignedEmails || []);
    dom.editAssignedSearchInput.value = "";
    dom.editBookStatus.textContent = "";
    renderAssignableUsers("edit");
    renderHiddenPagesSummary(Number(book.totalPages) || 0, book.hiddenPageRanges || "");
    dom.editBookModal.hidden = false;
  } finally {
    state.editBusyBookId = "";
    if (canSeeAdminPanel()) renderAdminBooks();
  }
}

async function saveEditBook() {
  if (!canSeeAdminPanel() || !state.adminUnlocked) {
    dom.editBookStatus.textContent = "Accès administrateur requis.";
    return;
  }
  const bookId = dom.editBookId.value.trim();
  const title = dom.editBookTitle.value.trim();
  const author = dom.editBookAuthor.value.trim();
  const description = dom.editBookDescription.value.trim();
  const hiddenPageRanges = dom.editBookHiddenPages.value.trim();
  const restrictedAccess = !!dom.editRestrictedAccessInput.checked;
  const assignedEmails = normalizeAssignedEmailList(state.editAssignedEmails);
  const currentBook = getBookById(bookId);
  const totalPages = Number(currentBook?.totalPages) || 0;
  if (!title) { dom.editBookStatus.textContent = "Le titre est requis."; return; }
  if (restrictedAccess && !assignedEmails.length) { dom.editBookStatus.textContent = "Choisis au moins un utilisateur."; return; }
  dom.editBookSaveBtn.disabled = true;
  dom.editBookStatus.textContent = "Enregistrement…";
  renderHiddenPagesSummary(totalPages, hiddenPageRanges);
  try {
    const response = await jsonp("updateBook", {
      email: state.email, adminCode: state.adminCode,
      bookId, title, author, description, hiddenPageRanges,
      restrictedAccess: restrictedAccess ? "true" : "false",
      assignedEmails: assignedEmails.join(","),
    });
    if (!response?.ok) throw new Error(response?.message || "Impossible de modifier le livre.");
    if (response.book?.bookId) {
      const nextBook = buildBookSnapshot(response.book);
      state.books = state.books.map((book) => (book.bookId === nextBook.bookId ? nextBook : book));
      saveBooksCache();
      renderBookList();
      renderAdminBooks();
      renderHiddenPagesSummary(Number(nextBook.totalPages) || totalPages, nextBook.hiddenPageRanges || hiddenPageRanges);
    }
    dom.editBookStatus.textContent = "Livre modifié.";
    window.setTimeout(() => {
      dom.editBookModal.hidden = true;
      dom.editBookStatus.textContent = "";
      if (dom.editHiddenPagesSummary) dom.editHiddenPagesSummary.innerHTML = "";
    }, 450);
    showToast("Livre modifié");
    await refreshBooks().catch((error) => { console.error(error); });
  } catch (error) {
    console.error(error);
    dom.editBookStatus.textContent = error.message || "Erreur lors de la modification.";
  } finally {
    dom.editBookSaveBtn.disabled = false;
  }
}

// Change 7: Add users in bulk
async function addUsersInBulk() {
  if (!canSeeAdminPanel() || !state.adminUnlocked) {
    dom.addUsersStatus.textContent = "Accès administrateur requis.";
    return;
  }
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
    await loadAssignableUsers(true);
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
  if (!canSeeAdminPanel() || !state.adminUnlocked) { showToast("Déverrouille d'abord le module administrateur"); return; }

  const pdfFile = dom.bookPdfInput.files?.[0];
  if (!pdfFile) { showToast("Choisis un PDF"); return; }

  const title = dom.bookTitleInput.value.trim();
  const bookId = slugify(dom.bookIdInput.value.trim() || title || pdfFile.name.replace(/\.pdf$/i, ""));
  const author = dom.bookAuthorInput.value.trim();
  const coverFile = dom.bookCoverInput.files?.[0] || null;
  const hiddenPageRanges = dom.publishHiddenPagesInput?.value.trim() || "";
  const restrictedAccess = !!dom.publishRestrictedAccessInput.checked;
  const assignedEmails = normalizeAssignedEmailList(state.publishAssignedEmails);

  if (!title || !bookId) { showToast("Titre ou identifiant manquant"); return; }
  if (restrictedAccess && !assignedEmails.length) { showToast("Choisis au moins un utilisateur"); return; }

  // Avertissement si fichier volumineux
  const warnMB = CONFIG.pdfWarnSizeMB || 10;
  dom.publishSizeWarning.hidden = pdfFile.size < warnMB * 1024 * 1024;

  dom.publishBtn.disabled = true;
  setPublishStatus("Préparation...");
  dom.publishProgress.textContent = "Lecture du PDF local…";

  try {
    const jsonDoc = await convertPdfFileToJson(pdfFile, { title, bookId, author });
    renderHiddenPagesSummary(Number(jsonDoc.totalPages) || 0, hiddenPageRanges, dom.publishHiddenPagesSummary);
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
      restrictedAccess: restrictedAccess ? "true" : "false",
      assignedEmails: assignedEmails.join(","),
      hiddenPageRanges,
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
        state.publishAssignedEmails = [];
        dom.publishRestrictedAccessInput.checked = false;
        dom.publishAssignedSearchInput.value = "";
        renderAssignableUsers("publish");
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
      state.publishAssignedEmails = [];
      dom.publishRestrictedAccessInput.checked = false;
      dom.publishAssignedSearchInput.value = "";
      renderAssignableUsers("publish");
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
  state.authVerified = false;
  state.userProfile = { firstName: "", lastName: "" };
  resetAdminState();
  state.books = [];
  state.currentBook = null;
  state.pdfDoc = null;
  state.textDoc = null;
  state.totalPages = 0;
  state.sourceTotalPages = 0;
  state.visiblePages = [];
  state.currentPage = 1;
  state.bookmarks = [];
  state.notes = [];
  state.editingNoteId = "";
  state.lastSaveSignature = "";
  state.pdfZoomMultiplier = 1;
  dom.editBookModal.hidden = true;
  dom.profileModal.hidden = true;
  if (dom.pageJumpModal) dom.pageJumpModal.hidden = true;
  dom.githubTestStatus.textContent = "";
  dom.profileStatus.textContent = "";
  dom.emailInput.value = localStorage.getItem(LS_EMAIL_KEY) || "";
  setGateMessage("");
  setGateBusy(false);
  setBookmarkStatus("");
  clearSession();
  switchScreen("gate");
}

async function maybeRestoreCurrentBook(savedState = null) {
  if (!state.authVerified || !state.email) return false;
  const saved = savedState || readCurrentBookState();
  if (!saved?.bookId) return false;
  const book = getBookById(saved.bookId) || buildBookSnapshot(saved.book);
  if (!book) return false;
  const firstName = getUserFirstName();
  const loadingMessage = firstName
    ? `Chargement du livre en cours. Veuillez patienter, ${firstName}.`
    : "Chargement du livre en cours. Veuillez patienter.";
  await openBook(book, {
    preferredPage: Number(saved.page) || 1,
    loadingMessage,
  });
  return true;
}

async function finishLoginFlow(options = {}) {
  const { attemptRestore = true, fromRestore = false } = options;
  if (!state.authVerified || !state.email) {
    logoutToGate();
    return;
  }

  applyAdminVisibility();
  saveSession();

  const firstName = getUserFirstName();
  const savedBookState = attemptRestore ? readCurrentBookState() : null;
  const wantsDirectRestore = !!savedBookState?.bookId;
  const libraryLoadingMessage = firstName
    ? `Bienvenue ${firstName}! Chargement de la bibliothèque en cours. Merci de patienter.`
    : "Chargement de la bibliothèque en cours. Merci de patienter.";
  const readerLoadingMessage = firstName
    ? `Chargement du livre en cours. Veuillez patienter, ${firstName}.`
    : "Chargement du livre en cours. Veuillez patienter.";

  if (wantsDirectRestore) {
    switchScreen("reader");
    toggleMenu(false);
    setBookLoading(true, readerLoadingMessage);
    setSaveStatus("Chargement...");
  } else {
    switchScreen("library");
    renderLibraryLoadingState(libraryLoadingMessage);
  }

  let loadedFromCache = false;
  try {
    await refreshBooks();
  } catch (error) {
    const cached = readBooksCache();
    const savedBook = buildBookSnapshot(savedBookState?.book);
    if (!fromRestore && !wantsDirectRestore) {
      throw error;
    }
    if (cached?.books?.length) {
      state.books = cached.books;
    } else if (savedBook) {
      state.books = [savedBook];
    } else {
      throw error;
    }
    renderBookList();
    renderAdminBooks();
    loadedFromCache = true;
    if (!wantsDirectRestore) {
      showToast("Bibliothèque restaurée à partir de la dernière session");
    }
  }

  if (wantsDirectRestore) {
    try {
      const restored = await maybeRestoreCurrentBook(savedBookState);
      if (restored) return;
    } catch (error) {
      if (!fromRestore) throw error;
      showToast("Impossible de rouvrir le dernier livre");
    } finally {
      if (!state.currentBook) setBookLoading(false);
    }
    switchScreen("library");
    renderBookList();
    renderAdminBooks();
    return;
  }

  if (!fromRestore && !loadedFromCache) showToast("Bibliothèque chargée");
}

function openProfileModal() {
  if (!dom.profileModal || !dom.profileFirstNameInput || !dom.profileLastNameInput) return;
  dom.profileFirstNameInput.value = normalizePersonName(state.userProfile?.firstName || "");
  dom.profileLastNameInput.value = normalizePersonName(state.userProfile?.lastName || "");
  if (dom.profileStatus) dom.profileStatus.textContent = "";
  dom.profileModal.hidden = false;
  window.setTimeout(() => dom.profileFirstNameInput.focus(), 30);
}

async function saveUserProfileAndContinue() {
  const firstName = normalizePersonName(dom.profileFirstNameInput.value);
  const lastName = normalizePersonName(dom.profileLastNameInput.value);
  if (!firstName || !lastName) {
    dom.profileStatus.textContent = "Le prénom et le nom sont requis.";
    return;
  }
  dom.profileFirstNameInput.value = firstName;
  dom.profileLastNameInput.value = lastName;
  dom.profileSaveBtn.disabled = true;
  dom.profileStatus.textContent = "Enregistrement…";
  try {
    const response = await jsonp("saveUserProfile", {
      email: state.email,
      firstName,
      lastName,
    });
    if (!response?.ok) throw new Error(response?.message || "Impossible d'enregistrer le profil.");
    state.userProfile = {
      firstName: normalizePersonName(response.profile?.firstName || firstName),
      lastName: normalizePersonName(response.profile?.lastName || lastName),
    };
    dom.profileModal.hidden = true;
    await finishLoginFlow({ attemptRestore: true });
  } catch (error) {
    console.error(error);
    dom.profileStatus.textContent = error.message || "Erreur lors de l'enregistrement.";
  } finally {
    dom.profileSaveBtn.disabled = false;
  }
}

async function revalidateSessionInBackground() {
  if (!state.email) return;
  try {
    const expectedEmail = normalizeEmail(state.email);
    const response = await auth(expectedEmail);
    if (!response?.ok) return;
    if (normalizeEmail(response.email) !== expectedEmail) return;
    state.isAdminCandidate = !!response.isAdminCandidate;
    state.userProfile = {
      firstName: normalizePersonName(response.profile?.firstName || state.userProfile?.firstName || ""),
      lastName: normalizePersonName(response.profile?.lastName || state.userProfile?.lastName || ""),
    };
    if (!canSeeAdminPanel()) {
      state.adminUnlocked = false;
      state.adminCode = "";
    }
    applyAdminVisibility();
    updateLibraryGreeting();
    saveSession();
  } catch (_) {
    // On conserve la session locale de l'appareil même si la validation distante échoue temporairement.
  }
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

  resetAdminState();
  resetSensitiveUiState();
  state.email = "";
  setGateMessage("");
  setGateBusy(true, "Validation en cours, veuillez patienter…");

  try {
    const response = await auth(email);
    if (!response?.ok) throw new Error(response?.message || "Accès refusé.");
    if (normalizeEmail(response.email) !== email) {
      throw new Error("Réponse d'authentification invalide.");
    }
    state.email = email;
    state.authVerified = true;
    state.isAdminCandidate = !!response.isAdminCandidate;
    state.userProfile = {
      firstName: normalizePersonName(response.profile?.firstName || ""),
      lastName: normalizePersonName(response.profile?.lastName || ""),
    };

    if (dom.rememberMeInput.checked) {
      localStorage.setItem(LS_EMAIL_KEY, email);
    } else {
      localStorage.removeItem(LS_EMAIL_KEY);
    }

    const firstName = getUserFirstName();
    setGateBusy(true, firstName ? `Chargement de la bibliothèque en cours. Veuillez patienter, ${firstName}.` : "Chargement de la bibliothèque en cours. Veuillez patienter.");

    saveSession();

    const needsProfile = response.profileComplete === false;
    if (needsProfile && dom.profileModal && dom.profileFirstNameInput && dom.profileLastNameInput && dom.profileSaveBtn) {
      setGateBusy(false);
      openProfileModal();
      return;
    }

    await finishLoginFlow({ attemptRestore: true });
  } catch (error) {
    console.error(error);
    resetSensitiveUiState();
    state.email = "";
    setGateMessage(error.message || "Accès refusé.", "error");
    switchScreen("gate");
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
  let startScrollTop = 0;
  let swipeCandidate = false;
  let pinchStartDistance = 0;
  let horizontalSwipeLock = false;

  on(dom.viewerShell, "touchstart", (e) => {
    if (!dom.controlPanel.hidden) return;
    if (e.touches.length === 2) {
      state.pinchActive = true;
      pinchStartDistance = getTouchDistance(e.touches);
      swipeCandidate = false;
      horizontalSwipeLock = false;
      return;
    }
    if (e.touches.length !== 1 || state.pinchActive) return;
    swipeCandidate = true;
    horizontalSwipeLock = false;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    startTime = Date.now();
    startScrollTop = dom.viewerShell.scrollTop;
  }, { passive: true });

  on(dom.viewerShell, "touchmove", (e) => {
    if (!dom.controlPanel.hidden) return;
    if (e.touches.length === 2) {
      const currentDistance = getTouchDistance(e.touches);
      if (!pinchStartDistance) {
        pinchStartDistance = currentDistance;
        state.pinchActive = true;
        swipeCandidate = false;
        horizontalSwipeLock = false;
        return;
      }
      const ratio = currentDistance / pinchStartDistance;
      if (ratio > 1.12) {
        state.pinchActive = true;
        swipeCandidate = false;
        horizontalSwipeLock = false;
        pinchStartDistance = currentDistance;
        updateFontOrZoom(1);
      } else if (ratio < 0.88) {
        state.pinchActive = true;
        swipeCandidate = false;
        horizontalSwipeLock = false;
        pinchStartDistance = currentDistance;
        updateFontOrZoom(-1);
      }
      return;
    }
    if (state.pinchActive) {
      swipeCandidate = false;
      horizontalSwipeLock = false;
      return;
    }
    if (!swipeCandidate || e.touches.length !== 1) return;

    const dx = e.touches[0].clientX - startX;
    const dy = e.touches[0].clientY - startY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (!horizontalSwipeLock && absDy > 18 && absDy > absDx * 0.9) {
      swipeCandidate = false;
      return;
    }

    if (absDx > 18 && absDx > absDy * 1.4) {
      horizontalSwipeLock = true;
      dom.viewerShell.scrollTop = startScrollTop;
      e.preventDefault();
      return;
    }

    if (horizontalSwipeLock) {
      dom.viewerShell.scrollTop = startScrollTop;
      e.preventDefault();
    }
  }, { passive: false });

  on(dom.viewerShell, "touchend", (e) => {
    if (state.pinchActive) {
      if (!e.touches.length) {
        pinchStartDistance = 0;
        horizontalSwipeLock = false;
        window.setTimeout(() => { state.pinchActive = false; }, 90);
      }
      return;
    }
    if (!swipeCandidate || !e.changedTouches.length) {
      horizontalSwipeLock = false;
      return;
    }
    if (!dom.controlPanel.hidden) {
      horizontalSwipeLock = false;
      return;
    }

    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    const dt = Date.now() - startTime;

    swipeCandidate = false;

    if (!horizontalSwipeLock && Math.abs(dx) < 96) {
      horizontalSwipeLock = false;
      return;
    }
    if (Math.abs(dy) > Math.min(34, Math.abs(dx) * 0.28)) {
      horizontalSwipeLock = false;
      return;
    }
    if (dt > 420) {
      horizontalSwipeLock = false;
      return;
    }
    if (Math.abs(dx) < Math.abs(dy) * 2.8) {
      horizontalSwipeLock = false;
      return;
    }

    dom.viewerShell.scrollTop = 0;
    if (dx < 0) goToPage(state.currentPage + 1);
    else goToPage(state.currentPage - 1);
    horizontalSwipeLock = false;
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
      if (dom.installBanner) dom.installBanner.hidden = false;
    }
  });

  on(dom.installBannerBtn, "click", async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
    }
    if (dom.installBanner) dom.installBanner.hidden = true;
    localStorage.setItem(LS_INSTALL_KEY, "1");
  });

  on(dom.installBannerDismiss, "click", () => {
    if (dom.installBanner) dom.installBanner.hidden = true;
    localStorage.setItem(LS_INSTALL_KEY, "1");
  });

  // iOS: pas de beforeinstallprompt, on affiche des instructions
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
  const isStandalone = window.navigator.standalone === true;
  if (isIOS && !isStandalone && !localStorage.getItem(LS_IOS_INSTALL_KEY)) {
    if (dom.installBannerText) dom.installBannerText.textContent = 'Pour installer : appuyez sur le bouton Partager ↑ puis "Sur l\'écran d\'accueil"';
    if (dom.installBannerBtn) dom.installBannerBtn.hidden = true;
    if (dom.installBanner) dom.installBanner.hidden = false;
  }

  if ((dom.installBannerBtn && dom.installBannerBtn.hidden === false) || !isIOS) {
    // bouton standard visible ou Android — on le réaffiche si caché
    if (dom.installBannerBtn) dom.installBannerBtn.hidden = false;
  }

  // Dismiss iOS
  on(dom.installBannerDismiss, "click", () => {
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
  bindSafeLoginEvents();
  on(dom.logoutBtn, "click", logoutToGate);
  ["input", "blur"].forEach((eventName) => {
    on(dom.profileFirstNameInput, eventName, () => {
      dom.profileFirstNameInput.value = normalizePersonName(dom.profileFirstNameInput.value);
    });
    on(dom.profileLastNameInput, eventName, () => {
      dom.profileLastNameInput.value = normalizePersonName(dom.profileLastNameInput.value);
    });
  });
  on(dom.profileSaveBtn, "click", saveUserProfileAndContinue);
  on(dom.profileModal, "keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveUserProfileAndContinue();
    }
  });

  // Bibliothèque
  on(dom.refreshBooksBtn, "click", async () => {
    try { await refreshBooks(); showToast("Bibliothèque actualisée"); }
    catch (e) { console.error(e); showToast("Impossible d'actualiser"); }
  });

  // Lecteur — retour
  on(dom.backToLibraryBtn, "click", async () => {
    toggleMenu(false);
    setBookLoading(true, "Veuillez patienter, de retour à la bibliothèque…");
    try {
      await saveProgress({ immediate: true, showError: false });
      clearCurrentBookState();
      state.currentBook = null;
      closePageJumpModal();
      switchScreen("library");
    } finally {
      setBookLoading(false);
    }
  });

  // Menu
  on(dom.menuToggle, "click", () => toggleMenu());
  on(dom.menuBackdrop, "click", () => toggleMenu(false));
  on(dom.closeMenuBtn, "click", () => toggleMenu(false));

  // Navigation principale (menu)
  on(dom.prevBtn, "click", () => goToPage(state.currentPage - 1));
  on(dom.nextBtn, "click", () => goToPage(state.currentPage + 1));
  on(dom.goBtn, "click", () => goToPage(Number(dom.pageInput.value)));
  on(dom.pageInput, "keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); goToPage(Number(dom.pageInput.value)); }
  });

  // Navigation inférieure fixe
  on(dom.navPrevBtn, "click", () => goToPage(state.currentPage - 1));
  on(dom.navNextBtn, "click", () => goToPage(state.currentPage + 1));
  on(dom.navPageBtn, "click", openPageJumpModal);
  on(dom.pageJumpGoBtn, "click", submitPageJump);
  on(dom.pageJumpStayBtn, "click", closePageJumpModal);
  on(dom.pageJumpInput, "keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); void submitPageJump(); }
  });
  on(dom.pageJumpModal, "click", (e) => {
    if (e.target === dom.pageJumpModal) closePageJumpModal();
  });

  // Barre de progression supérieure
  on(dom.topProgressLabel, "click", () => {
    state.progressMode = state.progressMode === "percent" ? "pages" : "percent";
    localStorage.setItem(LS_PROGRESS_MODE_KEY, state.progressMode);
    updateUiLabels();
  });

  // Ajustements
  on(dom.fitBtn, "click", fitCurrentView);
  on(dom.modeToggleBtn, "click", async () => {
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
  on(dom.themeBtn, "click", async () => {
    state.theme = state.theme === "paper" ? "night" : "paper";
    localStorage.setItem(LS_THEME_KEY, state.theme);
    await renderCurrentPage();
  });

  // Progression — toggle barre
  on(dom.progressBarToggleBtn, "click", () => {
    state.showProgressBar = !state.showProgressBar;
    localStorage.setItem(LS_PROGRESS_BAR_KEY, String(state.showProgressBar));
    updateUiLabels();
    showToast(state.showProgressBar ? "Barre de progression affichée" : "Barre de progression masquée");
  });

  // Modal taille du texte
  on(dom.fontSizeBtn, "click", () => {
    if (state.mode === "pdf") { showToast("La taille du texte s'applique au mode texte uniquement."); return; }
    dom.fontModal.hidden = false;
  });
  on(dom.fontModalMinus, "click", () => updateFontOrZoom(-1));
  on(dom.fontModalPlus, "click", () => updateFontOrZoom(1));
  on(dom.fontModalClose, "click", () => { dom.fontModal.hidden = true; });
  on(dom.fontModal, "click", (e) => {
    if (e.target === dom.fontModal) dom.fontModal.hidden = true;
  });

  // Signets / notes / sauvegarde
  on(dom.bookmarkBtn, "click", addBookmark);
  on(dom.saveBtn, "click", () => saveProgress({ immediate: true, showSuccess: true, showError: true }));
  on(dom.saveNoteBtn, "click", saveCurrentNote);
  on(dom.newNoteBtn, "click", resetNoteEditor);

  // Admin
  on(dom.adminCodeInput, "keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); unlockAdmin(); }
  });
  on(dom.unlockAdminBtn, "click", unlockAdmin);
  on(dom.testGithubBtn, "click", testGithubConnection);
  on(dom.publishForm, "submit", publishBook);
  on(dom.reloadAdminBooksBtn, "click", refreshBooks);
  on(dom.addUsersBtn, "click", addUsersInBulk);
  on(dom.editBookSaveBtn, "click", saveEditBook);
  on(dom.editBookCancelBtn, "click", () => { dom.editBookModal.hidden = true; dom.editBookStatus.textContent = ""; if (dom.editHiddenPagesSummary) dom.editHiddenPagesSummary.innerHTML = ""; });
  on(dom.editBookModal, "click", (e) => {
    if (e.target === dom.editBookModal) {
      dom.editBookModal.hidden = true;
      dom.editBookStatus.textContent = "";
      if (dom.editHiddenPagesSummary) dom.editHiddenPagesSummary.innerHTML = "";
    }
  });
  on(dom.publishRestrictedAccessInput, "change", () => handleAssignmentToggle("publish", dom.publishRestrictedAccessInput.checked));
  on(dom.editRestrictedAccessInput, "change", () => handleAssignmentToggle("edit", dom.editRestrictedAccessInput.checked));
  on(dom.publishAssignedSearchInput, "input", () => renderAssignableUsers("publish"));
  on(dom.editAssignedSearchInput, "input", () => renderAssignableUsers("edit"));
  on(dom.editBookHiddenPages, "input", () => {
    const book = getBookById(dom.editBookId?.value || "");
    renderHiddenPagesSummary(Number(book?.totalPages) || 0, dom.editBookHiddenPages?.value || "");
  });
  on(dom.publishAssignedList, "change", (e) => {
    const input = e.target.closest("[data-assignment-email]");
    if (!input) return;
    updateAssignmentSelection("publish", input.dataset.assignmentEmail, input.checked);
  });
  on(dom.editAssignedList, "change", (e) => {
    const input = e.target.closest("[data-assignment-email]");
    if (!input) return;
    updateAssignmentSelection("edit", input.dataset.assignmentEmail, input.checked);
  });
  on(dom.bookTitleInput, "input", rebuildAdminBookIdFromTitle);
  on(dom.publishHiddenPagesInput, "input", () => renderHiddenPagesSummary(Number(state.sourceTotalPages || 0) || 0, dom.publishHiddenPagesInput.value, dom.publishHiddenPagesSummary));
  on(dom.bookIdInput, "input", () => {
    dom.bookIdInput.dataset.lockedManual = dom.bookIdInput.value.trim() ? "1" : "";
  });

  // Délégations — bibliothèque
  on(dom.bookList, "click", async (e) => {
    const btn = e.target.closest("[data-open-book]");
    if (!btn || state.openingBookId) return;
    const book = getBookById(btn.dataset.openBook);
    if (!book) return;
    state.openingBookId = book.bookId;
    renderBookList();
    try {
      await openBook(book);
    } finally {
      state.openingBookId = "";
      if (!dom.library.hidden) renderBookList();
      if (canSeeAdminPanel()) renderAdminBooks();
    }
  });

  // Délégations — admin livres
  on(dom.adminBooksList, "click", async (e) => {
    const openBtn = e.target.closest("[data-open-book]");
    const toggleBtn = e.target.closest("[data-toggle-book]");
    const pdfBtn = e.target.closest("[data-toggle-pdf]");
    const editBtn = e.target.closest("[data-edit-book]");
    if (openBtn) {
      if (state.openingBookId) return;
      const b = getBookById(openBtn.dataset.openBook);
      if (!b) return;
      state.openingBookId = b.bookId;
      renderAdminBooks();
      if (!dom.library.hidden) renderBookList();
      try {
        await openBook(b);
      } finally {
        state.openingBookId = "";
        if (!dom.library.hidden) renderBookList();
        if (canSeeAdminPanel()) renderAdminBooks();
      }
      return;
    }
    if (toggleBtn) { await toggleBookPublished(toggleBtn.dataset.toggleBook); return; }
    if (pdfBtn) { await toggleBookPdfAllowed(pdfBtn.dataset.togglePdf); return; }
    if (editBtn) { await openEditBookModal(editBtn.dataset.editBook); }
  });

  // Délégations — signets
  on(dom.bookmarkList, "click", async (e) => {
    const jumpBtn = e.target.closest("[data-bookmark-page]");
    const renameBtn = e.target.closest("[data-rename-bookmark]");
    const removeBtn = e.target.closest("[data-remove-bookmark]");
    if (jumpBtn) {
      toggleMenu(false);
      await goToPage(Number(jumpBtn.dataset.bookmarkPage), { reason: "bookmark" });
      setBookmarkStatus("Signet chargé.", "success");
      showToast("Page du signet chargée");
      return;
    }
    if (renameBtn) { await renameBookmark(Number(renameBtn.dataset.renameBookmark)); return; }
    if (removeBtn) await removeBookmark(Number(removeBtn.dataset.removeBookmark));
  });

  // Délégations — notes
  on(dom.notesList, "click", async (e) => {
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
    if (document.hidden) {
      if (state.currentBook) saveCurrentBookState();
      saveProgress({ immediate: true, showError: false });
    }
  });
  window.addEventListener("pagehide", () => {
    if (state.currentBook) saveCurrentBookState();
  });
  window.addEventListener("beforeunload", () => {
    if (state.currentBook) {
      saveCurrentBookState();
      saveProgress({ immediate: true, showError: false });
    }
  });

  // Keyboard navigation dans le lecteur
  document.addEventListener("keydown", (e) => {
    if (dom.reader.hidden) return;
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); goToPage(state.currentPage + 1); }
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); goToPage(state.currentPage - 1); }
    if (e.key === "Escape") {
      if (!dom.pageJumpModal.hidden) { closePageJumpModal(); return; }
      if (!dom.fontModal.hidden) { dom.fontModal.hidden = true; return; }
      toggleMenu(false);
    }
  });
}

// ════════════════════════════════════════
// INIT
// ════════════════════════════════════════
async function init() {
  cleanLoginQueryFromUrl();
  blockEasyActions();
  attachEvents();
  initInstallBanner();

  const rememberedEmail = localStorage.getItem(LS_EMAIL_KEY);
  if (rememberedEmail) {
    dom.emailInput.value = rememberedEmail;
    dom.rememberMeInput.checked = true;
  }

  const sessionOk = restoreSession();
  if (sessionOk && state.email) {
    try {
      state.email = normalizeEmail(state.email);
      state.authVerified = true;
      if (!canSeeAdminPanel()) {
        state.adminUnlocked = false;
        state.adminCode = "";
      }
      if (state.adminUnlocked) setPublishStatus("Module administrateur déverrouillé", true);
      await finishLoginFlow({ attemptRestore: true, fromRestore: true });
      void revalidateSessionInBackground();
      return;
    } catch (_) {
      clearSession();
      resetSensitiveUiState();
      resetAdminState();
      switchScreen("gate");
    }
  }

  switchScreen("gate");
  toggleMenu(false);
  rebuildReadingSurfaceClasses();
  applyAdminVisibility();
  setBookmarkStatus("");
  setSaveStatus("En attente");
}

init().catch((error) => {
  console.error(error);
  switchScreen("gate");
  toggleMenu(false);
  setGateBusy(false);
  setGateMessage("Erreur de chargement de l'application. Actualise la page.", "error");
});
