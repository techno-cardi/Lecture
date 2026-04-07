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
const LS_LINE_SPACING_KEY = "readerLineSpacing";
const LS_NARROW_KEY = "readerNarrowLayout";
const LS_FOCUS_KEY = "readerFocusMode";
const LS_OFFLINE_QUEUE_KEY = "readerOfflineQueue_v1";

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
  libraryInstallBtn: document.getElementById("libraryInstallBtn"),
  logoutBtn: document.getElementById("logoutBtn"),

  adminPanel: document.getElementById("adminPanel"),
  adminCodeInput: document.getElementById("adminCodeInput"),
  unlockAdminBtn: document.getElementById("unlockAdminBtn"),
  adminUnlockStatus: document.getElementById("adminUnlockStatus"),
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
  adminBooksStatus: document.getElementById("adminBooksStatus"),
  adminBooksList: document.getElementById("adminBooksList"),

  bookLoadingOverlay: document.getElementById("bookLoadingOverlay"),
  bookLoadingMessage: document.getElementById("bookLoadingMessage"),

  addUsersSection: document.getElementById("addUsersSection"),
  addUsersTextarea: document.getElementById("addUsersTextarea"),
  addUsersBtn: document.getElementById("addUsersBtn"),
  addUsersStatus: document.getElementById("addUsersStatus"),
  studentCheckBtn: document.getElementById("studentCheckBtn"),
  readingCheckModal: document.getElementById("readingCheckModal"),
  readingCheckCloseBtn: document.getElementById("readingCheckCloseBtn"),
  readingCheckStudentTabBtn: document.getElementById("readingCheckStudentTabBtn"),
  readingCheckOverviewTabBtn: document.getElementById("readingCheckOverviewTabBtn"),
  readingCheckSearchInput: document.getElementById("readingCheckSearchInput"),
  readingCheckSortSelect: document.getElementById("readingCheckSortSelect"),
  readingCheckOverviewBookField: document.getElementById("readingCheckOverviewBookField"),
  readingCheckOverviewBookSelect: document.getElementById("readingCheckOverviewBookSelect"),
  readingCheckGlobalFilterField: document.getElementById("readingCheckGlobalFilterField"),
  readingCheckGlobalFilterSelect: document.getElementById("readingCheckGlobalFilterSelect"),
  readingCheckStatus: document.getElementById("readingCheckStatus"),
  readingCheckGlobalSummary: document.getElementById("readingCheckGlobalSummary"),
  readingCheckShowExternalInput: document.getElementById("readingCheckShowExternalInput"),
  readingCheckUserList: document.getElementById("readingCheckUserList"),
  readingCheckDetails: document.getElementById("readingCheckDetails"),
  bookReviewModal: document.getElementById("bookReviewModal"),
  bookReviewCloseBtn: document.getElementById("bookReviewCloseBtn"),
  bookReviewSubhead: document.getElementById("bookReviewSubhead"),
  bookReviewSearchInput: document.getElementById("bookReviewSearchInput"),
  bookReviewSortSelect: document.getElementById("bookReviewSortSelect"),
  bookReviewFilterSelect: document.getElementById("bookReviewFilterSelect"),
  bookReviewShowExternalInput: document.getElementById("bookReviewShowExternalInput"),
  bookReviewStatus: document.getElementById("bookReviewStatus"),
  bookReviewSummary: document.getElementById("bookReviewSummary"),
  bookReviewUserList: document.getElementById("bookReviewUserList"),
  bookReviewDetails: document.getElementById("bookReviewDetails"),

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
  editCoverPreview: document.getElementById("editCoverPreview"),
  editBookCoverInput: document.getElementById("editBookCoverInput"),
  editRemoveCoverInput: document.getElementById("editRemoveCoverInput"),
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
  lineSpacingBtn: document.getElementById("lineSpacingBtn"),
  widthToggleBtn: document.getElementById("widthToggleBtn"),
  focusModeBtn: document.getElementById("focusModeBtn"),
  readerInstallBtn: document.getElementById("readerInstallBtn"),
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
  loadingAssignableUsers: false,
  publishAssignedEmails: [],
  editAssignedEmails: [],
  openingBookId: "",
  editBusyBookId: "",
  deleteBusyBookId: "",
  booksRefreshPromise: null,
  pendingEditCoverObjectUrl: "",
  selectedReadingCheckEmail: "",
  readingCheckData: null,
  loadingReadingCheckEmail: "",
  pendingReadingCheckUser: null,
  readingCheckBookFilters: [],
  readingCheckSortMode: "name",
  readingCheckShowExternal: false,
  readingCheckViewMode: "student",
  usersReadingOverviewData: null,
  readingCheckOverviewCache: {},
  loadingUsersReadingOverview: false,
  selectedReadingCheckOverviewEmail: "",
  readingCheckGlobalFilterMode: "all",
  readingCheckOverviewBookId: "",
  selectedBookReviewEmail: "",
  bookReviewData: null,
  loadingBookReviewId: "",
  loadingBookReviewEmail: "",
  bookReviewSortMode: "name",
  bookReviewFilterMode: "all",
  bookReviewShowExternal: false,
  pendingReadingSeconds: 0,
  readingTickMs: 0,
  currentBookOpenedAt: "",
  currentPageEnteredAt: 0,
  lineSpacingMode: localStorage.getItem(LS_LINE_SPACING_KEY) || "normal",
  narrowLayout: localStorage.getItem(LS_NARROW_KEY) === "1",
  focusMode: localStorage.getItem(LS_FOCUS_KEY) === "1",
  offlineQueue: [],
  syncingOfflineQueue: false,
  deferredInstallPrompt: null,
};

const runtimeCache = {
  textDocs: new Map(),
  pdfDocs: new Map(),
  bookLists: new Map(),
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

function getUserLastName() {
  return normalizePersonName(state.userProfile?.lastName || "");
}

function getReadingCheckUserName(user) {
  const lastName = normalizePersonName(user?.lastName || "");
  const firstName = normalizePersonName(user?.firstName || "");
  if (lastName && firstName) return `${lastName} ${firstName}`;
  return lastName || firstName || String(user?.email || "");
}

function hasStructuredReadingCheckName(user) {
  return !!(normalizePersonName(user?.lastName || "") || normalizePersonName(user?.firstName || ""));
}

function isStudentDomainEmail(email) {
  return /@educ\.cscapitale\.qc\.ca$/i.test(String(email || "").trim());
}

function isInternalCscapitaleEmail(email) {
  return /@(educ\.)?cscapitale\.qc\.ca$/i.test(String(email || "").trim());
}

function getBookReviewUserName(user) {
  return getReadingCheckUserName(user);
}

function getBookReviewStatusLabel(status) {
  if (status === "completed") return "Terminé";
  if (status === "started") return "Commencé";
  return "Non ouvert";
}

function getBookReviewStatusClass(status) {
  if (status === "completed") return "published";
  if (status === "started") return "status-started";
  return "hidden";
}

function formatReadingDuration(totalSeconds) {
  const seconds = Math.max(0, Math.round(Number(totalSeconds) || 0));
  if (!seconds) return "Aucune donnée";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours) return `${hours} h ${String(minutes).padStart(2, "0")} min`;
  if (minutes) return `${minutes} min`;
  return `${seconds} s`;
}

function escapeRegExp(value) {
  return String(value || "").replace(/[|\\{}()[\]^$+*?.-]/g, "\\$&");
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
  if (dom.bookLoadingMessage) dom.bookLoadingMessage.textContent = message || "Chargement du livre en cours. Veuillez patienter.";
}

function isIOSDevice() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
}

function isStandaloneMode() {
  return window.matchMedia?.("(display-mode: standalone)")?.matches || window.navigator.standalone === true;
}

function updateInstallShortcutVisibility() {
  const visible = !isStandaloneMode();
  if (dom.libraryInstallBtn) dom.libraryInstallBtn.hidden = !visible;
  if (dom.readerInstallBtn) dom.readerInstallBtn.hidden = !visible;
}

function showManualInstallHint() {
  if (dom.installBannerText) {
    dom.installBannerText.textContent = isIOSDevice()
      ? 'Pour installer : appuie sur Partager puis "Sur l\'écran d\'accueil".'
      : "Pour installer : utilise le menu du navigateur puis choisis Installer l'application ou Ajouter à l'écran d'accueil.";
  }
  if (dom.installBannerBtn) dom.installBannerBtn.hidden = !!isIOSDevice() || !state.deferredInstallPrompt;
  if (dom.installBanner) dom.installBanner.hidden = false;
}

async function triggerInstallShortcut() {
  if (isStandaloneMode()) {
    showToast("L'application est déjà installée sur cet appareil");
    return;
  }
  if (state.deferredInstallPrompt) {
    const promptEvent = state.deferredInstallPrompt;
    state.deferredInstallPrompt = null;
    promptEvent.prompt();
    try { await promptEvent.userChoice; } catch (_) {}
    if (dom.installBanner) dom.installBanner.hidden = true;
    localStorage.setItem(LS_INSTALL_KEY, "1");
    updateInstallShortcutVisibility();
    return;
  }
  showManualInstallHint();
  showToast(
    isIOSDevice()
      ? "Appuie sur Partager puis Sur l'écran d'accueil."
      : "Utilise le menu du navigateur puis Installer l'application."
  );
}

function setAdminUnlockStatus(message = "", kind = "") {
  if (!dom.adminUnlockStatus) return;
  dom.adminUnlockStatus.textContent = message || "";
  dom.adminUnlockStatus.className = `save-status admin-unlock-status${kind ? ` status-${kind}` : ""}`;
}

function canSeeAdminPanel() {
  const configAdminEmail = normalizeEmail(CONFIG.adminEmail || "");
  return !!state.isAdminCandidate && (!configAdminEmail || normalizeEmail(state.email) === configAdminEmail);
}

function applyAdminVisibility() {
  const showPanel = canSeeAdminPanel();
  if (dom.adminPanel) dom.adminPanel.hidden = !showPanel;
  const showUnlocked = showPanel && !!state.adminUnlocked;
  if (dom.publishForm) dom.publishForm.hidden = !showUnlocked;
  if (dom.githubTestRow) dom.githubTestRow.hidden = !showUnlocked;
  if (dom.addUsersSection) dom.addUsersSection.hidden = !showUnlocked;
  if (dom.studentCheckBtn) {
    dom.studentCheckBtn.hidden = !showUnlocked;
    dom.studentCheckBtn.disabled = !showUnlocked;
  }
  if (!showUnlocked) {
    closeReadingCheckModal();
    closeBookReviewModal();
  }
}

function resetAdminState() {
  state.isAdminCandidate = false;
  state.adminUnlocked = false;
  state.adminCode = "";
  state.assignableUsers = [];
  state.publishAssignedEmails = [];
  state.editAssignedEmails = [];
  state.selectedReadingCheckEmail = "";
  state.selectedReadingCheckOverviewEmail = "";
  state.readingCheckData = null;
  state.usersReadingOverviewData = null;
  state.readingCheckOverviewCache = {};
  state.loadingReadingCheckEmail = "";
  state.loadingUsersReadingOverview = false;
  state.readingCheckViewMode = "student";
  state.readingCheckGlobalFilterMode = "all";
  state.readingCheckOverviewBookId = "";
  state.selectedBookReviewEmail = "";
  state.bookReviewData = null;
  state.loadingBookReviewId = "";
  state.loadingBookReviewEmail = "";
  state.bookReviewSortMode = "name";
  state.bookReviewFilterMode = "all";
  state.bookReviewShowExternal = false;
  if (dom.readingCheckSearchInput) dom.readingCheckSearchInput.value = "";
  if (dom.readingCheckSortSelect) dom.readingCheckSortSelect.value = "name";
  if (dom.readingCheckOverviewBookSelect) dom.readingCheckOverviewBookSelect.value = "";
  if (dom.readingCheckGlobalFilterSelect) dom.readingCheckGlobalFilterSelect.value = "all";
  if (dom.readingCheckShowExternalInput) dom.readingCheckShowExternalInput.checked = false;
  if (dom.bookReviewSearchInput) dom.bookReviewSearchInput.value = "";
  if (dom.bookReviewSortSelect) dom.bookReviewSortSelect.value = "name";
  if (dom.bookReviewFilterSelect) dom.bookReviewFilterSelect.value = "all";
  if (dom.bookReviewShowExternalInput) dom.bookReviewShowExternalInput.checked = false;
  if (dom.adminCodeInput) dom.adminCodeInput.value = "";
  setAdminUnlockStatus("");
  closeReadingCheckModal();
  closeBookReviewModal();
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
    currentPage: Number(book.currentPage) || 0,
    progressPercent: Number(book.progressPercent) || 0,
    lastUpdated: book.lastUpdated || "",
    progressLastUpdated: book.progressLastUpdated || book.lastUpdated || "",
    lastOpenedAt: book.lastOpenedAt || "",
    firstOpenedAt: book.firstOpenedAt || "",
    readingSeconds: Number(book.readingSeconds) || 0,
    sessionCount: Number(book.sessionCount) || 0,
    averageSessionSeconds: Number(book.averageSessionSeconds) || 0,
    lastPageVisited: Number(book.lastPageVisited) || 0,
    completedAt: book.completedAt || "",
    bookmarksCount: Number(book.bookmarksCount) || 0,
    notesCount: Number(book.notesCount) || 0,
    viewedPagesCount: Number(book.viewedPagesCount) || 0,
    totalPageViews: Number(book.totalPageViews) || 0,
    lastViewedPage: Number(book.lastViewedPage) || 0,
    readingStatus: book.readingStatus || "",
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


function setAdminBooksStatus(message = "", tone = "") {
  if (!dom.adminBooksStatus) return;
  dom.adminBooksStatus.textContent = message || "";
  dom.adminBooksStatus.className = `save-status${tone ? ` status-${tone}` : ""}`;
}

function revokePendingEditCoverObjectUrl() {
  if (!state.pendingEditCoverObjectUrl) return;
  try { URL.revokeObjectURL(state.pendingEditCoverObjectUrl); } catch (_) {}
  state.pendingEditCoverObjectUrl = "";
}

function renderCoverPreviewMarkup(book = {}, previewUrl = "") {
  const title = escapeHtml(book?.title || "Livre");
  const effectiveUrl = previewUrl || (book?.coverPath ? computePublicAssetUrl(book.coverPath, book, "cover") : "");
  if (effectiveUrl) {
    return `<div class="edit-cover-preview-image"><img src="${escapeHtml(effectiveUrl)}" alt="Couverture de ${title}"></div>`;
  }
  return `<div class="edit-cover-preview-placeholder">${escapeHtml((book?.title || "?").trim().slice(0, 1).toUpperCase())}</div>`;
}

function updateEditCoverPreview(book = null) {
  if (!dom.editCoverPreview) return;
  const sourceBook = book || getBookById(dom.editBookId?.value || "") || {};
  const selectedFile = dom.editBookCoverInput?.files?.[0] || null;
  const removeRequested = !!dom.editRemoveCoverInput?.checked;
  revokePendingEditCoverObjectUrl();
  let previewUrl = "";
  if (selectedFile) {
    previewUrl = URL.createObjectURL(selectedFile);
    state.pendingEditCoverObjectUrl = previewUrl;
  } else if (!removeRequested && sourceBook?.coverPath) {
    previewUrl = computePublicAssetUrl(sourceBook.coverPath, sourceBook, "cover");
  }
  dom.editCoverPreview.innerHTML = renderCoverPreviewMarkup(removeRequested ? { ...sourceBook, coverPath: "" } : sourceBook, previewUrl);
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

function normalizePageRangeText(value) {
  return String(value || "").replace(/[‐‑‒–—−﹘﹣－]/g, "-");
}

function expandPageRanges(ranges, totalPages = 0) {
  const total = Math.max(0, Number(totalPages) || 0);
  const pages = [];
  const seen = new Set();
  normalizePageRangeText(ranges)
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
    renderReadingCheckUserList();
    renderReadingCheckDetails();
    renderReadingCheckGlobalSummary();
    return;
  }
  state.loadingAssignableUsers = true;
  renderReadingCheckUserList();
  renderReadingCheckDetails();
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
      hasProfile: !!(normalizePersonName(user.firstName || "") || normalizePersonName(user.lastName || "")),
      createdAt: user.createdAt || "",
      updatedAt: user.updatedAt || "",
      lastConnectionAt: user.lastConnectionAt || "",
      isExternal: user.isExternal !== undefined ? !!user.isExternal : !isInternalCscapitaleEmail(user.email || ""),
    })).filter((user) => user.email) : [];
    renderAssignableUsers("publish");
    renderAssignableUsers("edit");
    renderReadingCheckUserList();
    renderReadingCheckDetails();
    renderReadingCheckGlobalSummary();
  } catch (error) {
    console.error(error);
    if (dom.readingCheckUserList && !state.assignableUsers.length) {
      dom.readingCheckUserList.innerHTML = `<div class="empty-state">Impossible de charger la liste des utilisateurs.</div>`;
    }
  } finally {
    state.loadingAssignableUsers = false;
    renderReadingCheckUserList();
    renderReadingCheckDetails();
    renderReadingCheckGlobalSummary();
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

function parseDateMs(value) {
  if (!value) return 0;
  const date = new Date(value);
  const time = date.getTime();
  return Number.isFinite(time) ? time : 0;
}

function formatRelativeTimeFromNow(value) {
  const ts = parseDateMs(value);
  if (!ts) return "";
  const deltaMinutes = Math.round((Date.now() - ts) / 60000);
  if (deltaMinutes < 1) return "à l'instant";
  if (deltaMinutes < 60) return `il y a ${deltaMinutes} min`;
  const deltaHours = Math.round(deltaMinutes / 60);
  if (deltaHours < 24) return `il y a ${deltaHours} h`;
  const deltaDays = Math.round(deltaHours / 24);
  if (deltaDays < 30) return `il y a ${deltaDays} j`;
  const deltaMonths = Math.round(deltaDays / 30);
  if (deltaMonths < 12) return `il y a ${deltaMonths} mois`;
  const deltaYears = Math.round(deltaMonths / 12);
  return `il y a ${deltaYears} an${deltaYears > 1 ? "s" : ""}`;
}

function formatDateTimeWithRelative(value, emptyText = "Aucune donnée") {
  if (!value) return emptyText;
  const full = formatDateTime(value);
  const relative = formatRelativeTimeFromNow(value);
  return relative ? `${full} (${relative})` : full;
}

function setReadingCheckStatus(message = "", kind = "", showSpinner = false) {
  if (!dom.readingCheckStatus) return;
  dom.readingCheckStatus.className = `save-status reading-check-status${kind ? ` status-${kind}` : ""}`;
  dom.readingCheckStatus.innerHTML = message ? `${showSpinner ? `<span class="inline-spinner" aria-hidden="true"></span>` : ""}<span>${escapeHtml(message)}</span>` : "";
}

function getReadingCheckStatusLabel(status) {
  if (status === "completed") return "Terminé";
  if (status === "started") return "Commencé";
  return "Non lu";
}

function getReadingCheckStatusClass(status) {
  if (status === "completed") return "published";
  if (status === "started") return "status-started";
  return "hidden";
}

function getEffectiveReadingCheckConnectionAt(user) {
  return user?.lastConnectionAt || user?.lastAuthAt || user?.lastActivityAt || user?.lastUpdated || user?.lastOpenedAt || "";
}

function formatReadingCheckConnectionText(user) {
  if (user?.lastConnectionAt || user?.lastAuthAt) {
    return `Connexion: ${formatDateTime(getEffectiveReadingCheckConnectionAt(user))}`;
  }
  if (user?.lastActivityAt || user?.lastUpdated || user?.lastOpenedAt) {
    return `Activité: ${formatDateTime(getEffectiveReadingCheckConnectionAt(user))}`;
  }
  return "Jamais connecté";
}

function formatReadingCheckKnownConnectionValue(user) {
  if (user?.lastConnectionAt || user?.lastAuthAt) {
    return formatDateTimeWithRelative(getEffectiveReadingCheckConnectionAt(user), "Jamais connecté");
  }
  if (user?.lastActivityAt || user?.lastUpdated || user?.lastOpenedAt) {
    return `${formatDateTimeWithRelative(getEffectiveReadingCheckConnectionAt(user))} (activité détectée)`;
  }
  return "Jamais connecté";
}

function resetReadingCheckDetailScroll() {
  if (dom.readingCheckDetails) dom.readingCheckDetails.scrollTop = 0;
}

function scrollActiveReadingCheckUserIntoView() {
  if (!dom.readingCheckUserList) return;
  const activeButton = dom.readingCheckUserList.querySelector('.reading-check-user-btn.is-active');
  if (!activeButton || typeof activeButton.scrollIntoView !== 'function') return;
  activeButton.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}

function compareReadingCheckUsers(left, right, sortMode = "name") {
  const leftHasProfile = !!(left?.hasProfile || hasStructuredReadingCheckName(left));
  const rightHasProfile = !!(right?.hasProfile || hasStructuredReadingCheckName(right));
  if (leftHasProfile !== rightHasProfile) return leftHasProfile ? -1 : 1;

  if (sortMode === "connection") {
    const rightConnection = parseDateMs(getEffectiveReadingCheckConnectionAt(right));
    const leftConnection = parseDateMs(getEffectiveReadingCheckConnectionAt(left));
    if (rightConnection !== leftConnection) return rightConnection - leftConnection;
  }

  if (sortMode === "activity") {
    const rightActivity = parseDateMs(right?.lastActivityAt || right?.lastUpdated || right?.lastOpenedAt || getEffectiveReadingCheckConnectionAt(right));
    const leftActivity = parseDateMs(left?.lastActivityAt || left?.lastUpdated || left?.lastOpenedAt || getEffectiveReadingCheckConnectionAt(left));
    if (rightActivity !== leftActivity) return rightActivity - leftActivity;
  }

  if (sortMode === "email") {
    return String(left?.email || "").localeCompare(String(right?.email || ""), "fr-CA");
  }

  const leftKey = `${String(left?.lastName || "").toLowerCase()}${String(left?.firstName || "").toLowerCase()}${String(left?.email || "").toLowerCase()}`;
  const rightKey = `${String(right?.lastName || "").toLowerCase()}${String(right?.firstName || "").toLowerCase()}${String(right?.email || "").toLowerCase()}`;
  return leftKey.localeCompare(rightKey, "fr-CA");
}

function updateReadingCheckModeUi() {
  const isOverview = state.readingCheckViewMode === "overview";
  if (dom.readingCheckStudentTabBtn) {
    dom.readingCheckStudentTabBtn.classList.toggle("is-active", !isOverview);
    dom.readingCheckStudentTabBtn.setAttribute("aria-selected", !isOverview ? "true" : "false");
  }
  if (dom.readingCheckOverviewTabBtn) {
    dom.readingCheckOverviewTabBtn.classList.toggle("is-active", isOverview);
    dom.readingCheckOverviewTabBtn.setAttribute("aria-selected", isOverview ? "true" : "false");
  }
  if (dom.readingCheckOverviewBookField) dom.readingCheckOverviewBookField.hidden = !isOverview;
  if (dom.readingCheckGlobalFilterField) dom.readingCheckGlobalFilterField.hidden = !isOverview;
  if (dom.readingCheckGlobalSummary) dom.readingCheckGlobalSummary.hidden = !isOverview;
  if (dom.readingCheckModal) {
    dom.readingCheckModal.dataset.viewMode = isOverview ? "overview" : "student";
    const modalPanel = dom.readingCheckModal.querySelector('.reading-check-modal-panel');
    if (modalPanel) modalPanel.dataset.viewMode = isOverview ? "overview" : "student";
  }
}

function getSortedReadingCheckUsers() {
  const query = String(dom.readingCheckSearchInput?.value || "").trim().toLowerCase();
  const sortMode = dom.readingCheckSortSelect?.value || state.readingCheckSortMode || "name";
  const showExternal = !!dom.readingCheckShowExternalInput?.checked;
  state.readingCheckSortMode = sortMode;
  state.readingCheckShowExternal = showExternal;
  return [...state.assignableUsers]
    .filter((user) => {
      if (!showExternal && user.isExternal) return false;
      if (!query) return true;
      const haystack = `${getReadingCheckUserName(user)} ${user.email}`.toLowerCase();
      return haystack.includes(query);
    })
    .sort((left, right) => compareReadingCheckUsers(left, right, sortMode));
}


function getReadingCheckOverviewSelectableBooks() {
  const sourceBooks = Array.isArray(state.books) ? state.books : [];
  const books = sourceBooks
    .filter((book) => !!String(book?.bookId || ""))
    .filter((book) => book?.published !== false)
    .map((book) => ({
      bookId: String(book.bookId || ""),
      title: String(book.title || book.bookId || "Roman"),
      author: String(book.author || ""),
      restrictedAccess: !!book.restrictedAccess,
    }));
  const seen = new Set();
  return books.filter((book) => {
    if (!book.bookId || seen.has(book.bookId)) return false;
    seen.add(book.bookId);
    return true;
  });
}

function getReadingCheckOverviewSelectedBookId() {
  const selectableBooks = getReadingCheckOverviewSelectableBooks();
  const firstBookId = selectableBooks[0]?.bookId || "";
  const value = String(dom.readingCheckOverviewBookSelect?.value || state.readingCheckOverviewBookId || firstBookId || "");
  const allowed = new Set(selectableBooks.map((book) => String(book.bookId || "")));
  const nextValue = allowed.has(value) ? value : firstBookId;
  state.readingCheckOverviewBookId = nextValue || "";
  if (dom.readingCheckOverviewBookSelect && dom.readingCheckOverviewBookSelect.value !== state.readingCheckOverviewBookId) {
    dom.readingCheckOverviewBookSelect.value = state.readingCheckOverviewBookId;
  }
  return state.readingCheckOverviewBookId;
}

function getReadingCheckOverviewBooks() {
  const payloadBooks = Array.isArray(state.usersReadingOverviewData?.books) ? state.usersReadingOverviewData.books : [];
  if (payloadBooks.length) return payloadBooks;
  return getReadingCheckOverviewSelectableBooks();
}

function getReadingCheckOverviewBookMeta(bookId = getReadingCheckOverviewSelectedBookId()) {
  if (!bookId) return null;
  return getReadingCheckOverviewBooks().find((book) => String(book.bookId || "") === String(bookId))
    || getReadingCheckOverviewSelectableBooks().find((book) => String(book.bookId || "") === String(bookId))
    || null;
}

function getReadingCheckOverviewUserBookStatus(user, bookId = getReadingCheckOverviewSelectedBookId()) {
  if (!user || !bookId) return null;
  const statuses = Array.isArray(user.bookStatuses) ? user.bookStatuses : [];
  return statuses.find((item) => String(item.bookId || "") === String(bookId))
    || (String(user.bookId || "") === String(bookId) ? user : null);
}

function getReadingCheckOverviewEffectiveStatus(user, bookId = getReadingCheckOverviewSelectedBookId()) {
  const scoped = getReadingCheckOverviewUserBookStatus(user, bookId);
  return scoped?.status || user?.status || "not_started";
}

function getReadingCheckOverviewEffectiveActivityAt(user, bookId = getReadingCheckOverviewSelectedBookId()) {
  const scoped = getReadingCheckOverviewUserBookStatus(user, bookId);
  return scoped?.lastActivityAt || scoped?.lastUpdated || scoped?.lastOpenedAt || user?.lastActivityAt || user?.lastUpdated || user?.lastOpenedAt || getEffectiveReadingCheckConnectionAt(user);
}

function getReadingCheckOverviewScopeLabel() {
  const selectedBook = getReadingCheckOverviewBookMeta(getReadingCheckOverviewSelectedBookId());
  return selectedBook?.title || "Roman sélectionné";
}

function compareReadingCheckOverviewUsers(left, right, sortMode = "name") {
  const leftHasProfile = !!(left?.hasProfile || hasStructuredReadingCheckName(left));
  const rightHasProfile = !!(right?.hasProfile || hasStructuredReadingCheckName(right));
  if (leftHasProfile !== rightHasProfile) return leftHasProfile ? -1 : 1;

  if (sortMode === "connection") {
    const rightConnection = parseDateMs(getEffectiveReadingCheckConnectionAt(right));
    const leftConnection = parseDateMs(getEffectiveReadingCheckConnectionAt(left));
    if (rightConnection !== leftConnection) return rightConnection - leftConnection;
  }

  if (sortMode === "activity") {
    const rightActivity = parseDateMs(getReadingCheckOverviewEffectiveActivityAt(right));
    const leftActivity = parseDateMs(getReadingCheckOverviewEffectiveActivityAt(left));
    if (rightActivity !== leftActivity) return rightActivity - leftActivity;
  }

  if (sortMode === "email") {
    return String(left?.email || "").localeCompare(String(right?.email || ""), "fr-CA");
  }

  const leftKey = `${String(left?.lastName || "").toLowerCase()}${String(left?.firstName || "").toLowerCase()}${String(left?.email || "").toLowerCase()}`;
  const rightKey = `${String(right?.lastName || "").toLowerCase()}${String(right?.firstName || "").toLowerCase()}${String(right?.email || "").toLowerCase()}`;
  return leftKey.localeCompare(rightKey, "fr-CA");
}

function getBaseReadingCheckOverviewUsers({ applyStatusFilter = true, applySearch = true } = {}) {
  const payload = state.usersReadingOverviewData;
  if (!payload?.users) return [];
  const query = String(dom.readingCheckSearchInput?.value || "").trim().toLowerCase();
  const sortMode = dom.readingCheckSortSelect?.value || state.readingCheckSortMode || "name";
  const filterMode = dom.readingCheckGlobalFilterSelect?.value || state.readingCheckGlobalFilterMode || "all";
  const showExternal = !!dom.readingCheckShowExternalInput?.checked;
  state.readingCheckSortMode = sortMode;
  state.readingCheckGlobalFilterMode = filterMode;
  state.readingCheckShowExternal = showExternal;

  return [...payload.users]
    .filter((user) => {
      const effectiveConnectionAt = getEffectiveReadingCheckConnectionAt(user);
      const effectiveStatus = getReadingCheckOverviewEffectiveStatus(user);
      if (!showExternal && user.isExternal) return false;
      if (applyStatusFilter) {
        if (filterMode === "started" && !(effectiveStatus === "started" || effectiveStatus === "completed")) return false;
        if (filterMode === "not_started" && effectiveStatus !== "not_started") return false;
        if (filterMode === "completed" && effectiveStatus !== "completed") return false;
        if (filterMode === "connected" && !effectiveConnectionAt) return false;
        if (filterMode === "never_connected" && !!effectiveConnectionAt) return false;
      }
      if (!applySearch || !query) return true;
      const haystack = `${getReadingCheckUserName(user)} ${user.email}`.toLowerCase();
      return haystack.includes(query);
    })
    .sort((left, right) => compareReadingCheckOverviewUsers(left, right, sortMode));
}

function getFilteredReadingCheckOverviewUsers() {
  return getBaseReadingCheckOverviewUsers({ applyStatusFilter: true, applySearch: true });
}
function getPendingReadingCheckUser() {
  const selectedEmail = normalizeEmail(state.loadingReadingCheckEmail || state.selectedReadingCheckEmail);
  if (!selectedEmail) return state.pendingReadingCheckUser || null;
  return state.assignableUsers.find((user) => normalizeEmail(user.email) === selectedEmail)
    || state.pendingReadingCheckUser
    || null;
}
function getReadingCheckBookKey(book, index) {
  return String(book?.bookId || book?.title || `book-${index}`);
}

function getVisibleReadingCheckBooks(allBooks) {
  const filters = new Set((Array.isArray(state.readingCheckBookFilters) ? state.readingCheckBookFilters : []).map(String));
  if (!filters.size) return allBooks;
  return allBooks.filter((book, index) => filters.has(getReadingCheckBookKey(book, index)));
}

function computeReadingCheckSummaryFromBooks(books) {
  const summary = {
    booksStarted: books.length,
    totalBookmarks: 0,
    totalNotes: 0,
    totalReadingSeconds: 0,
    totalSessions: 0,
  };
  books.forEach((book) => {
    summary.totalBookmarks += Array.isArray(book.bookmarks) ? book.bookmarks.length : 0;
    summary.totalNotes += Array.isArray(book.notes) ? book.notes.length : 0;
    summary.totalReadingSeconds += Number(book.readingSeconds) || 0;
    summary.totalSessions += Number(book.sessionCount) || 0;
  });
  return summary;
}

function getReadingCheckOverviewSummary() {
  const users = getBaseReadingCheckOverviewUsers({ applyStatusFilter: false, applySearch: false });
  return {
    scopeLabel: getReadingCheckOverviewScopeLabel(),
    totalUsers: users.length,
    startedUsers: users.filter((item) => {
      const status = getReadingCheckOverviewEffectiveStatus(item);
      return status === "started" || status === "completed";
    }).length,
    notStartedUsers: users.filter((item) => getReadingCheckOverviewEffectiveStatus(item) === "not_started").length,
    completedUsers: users.filter((item) => getReadingCheckOverviewEffectiveStatus(item) === "completed").length,
    connectedUsers: users.filter((item) => !!getEffectiveReadingCheckConnectionAt(item)).length,
    neverConnectedUsers: users.filter((item) => !getEffectiveReadingCheckConnectionAt(item)).length,
  };
}


function syncReadingCheckOverviewBookOptions() {
  if (!dom.readingCheckOverviewBookSelect) return;
  const books = getReadingCheckOverviewSelectableBooks();
  const currentValue = String(dom.readingCheckOverviewBookSelect.value || state.readingCheckOverviewBookId || "");
  const options = books.length
    ? books.map((book) => `<option value="${escapeHtml(String(book.bookId || ""))}">${escapeHtml(String(book.title || book.bookId || "Roman"))}</option>`)
    : ['<option value="">Aucun roman disponible</option>'];
  dom.readingCheckOverviewBookSelect.innerHTML = options.join("");
  const allowed = new Set(books.map((book) => String(book.bookId || "")));
  const fallbackValue = books[0]?.bookId || "";
  const nextValue = allowed.has(currentValue) ? currentValue : fallbackValue;
  dom.readingCheckOverviewBookSelect.value = nextValue;
  state.readingCheckOverviewBookId = nextValue;
}
function formatReadingCheckOverviewListMeta(user) {
  const bookId = getReadingCheckOverviewSelectedBookId();
  const scoped = getReadingCheckOverviewUserBookStatus(user, bookId);
  if (scoped && (scoped.lastActivityAt || scoped.lastUpdated || scoped.lastOpenedAt)) {
    return `Activité sur ce livre: ${formatDateTime(scoped.lastActivityAt || scoped.lastUpdated || scoped.lastOpenedAt)}`;
  }
  return formatReadingCheckConnectionText(user);
}

function renderReadingCheckGlobalSummary() {
  if (!dom.readingCheckGlobalSummary) return;
  const isOverview = state.readingCheckViewMode === "overview";
  dom.readingCheckGlobalSummary.hidden = !isOverview;
  if (!isOverview) {
    dom.readingCheckGlobalSummary.innerHTML = "";
    return;
  }
  if (state.loadingUsersReadingOverview && !state.usersReadingOverviewData?.users) {
    dom.readingCheckGlobalSummary.innerHTML = `<div class="reading-check-summary reading-check-summary-wide reading-check-summary-wide-compact"><div class="reading-check-summary-card"><div class="reading-check-summary-value"><span class="inline-spinner" aria-hidden="true"></span> Chargement…</div></div></div>`;
    return;
  }
  if (!state.usersReadingOverviewData?.users) {
    dom.readingCheckGlobalSummary.innerHTML = "";
    return;
  }
  const summary = getReadingCheckOverviewSummary();
  dom.readingCheckGlobalSummary.innerHTML = `
    <div class="reading-check-global-summary-head">
      <div class="reading-check-global-summary-title">Vue du roman</div>
      <div class="reading-check-global-summary-scope">${escapeHtml(summary.scopeLabel || "Tous les romans visibles")}</div>
    </div>
    <div class="reading-check-summary reading-check-summary-wide reading-check-summary-wide-compact">
      <div class="reading-check-summary-card"><div class="reading-check-summary-label">Utilisateurs visés</div><div class="reading-check-summary-value">${Number(summary.totalUsers) || 0}</div></div>
      <div class="reading-check-summary-card"><div class="reading-check-summary-label">Ont commencé</div><div class="reading-check-summary-value">${Number(summary.startedUsers) || 0}</div></div>
      <div class="reading-check-summary-card"><div class="reading-check-summary-label">N'ont pas lu</div><div class="reading-check-summary-value">${Number(summary.notStartedUsers) || 0}</div></div>
      <div class="reading-check-summary-card"><div class="reading-check-summary-label">Terminés</div><div class="reading-check-summary-value">${Number(summary.completedUsers) || 0}</div></div>
      <div class="reading-check-summary-card"><div class="reading-check-summary-label">Connectés</div><div class="reading-check-summary-value">${Number(summary.connectedUsers) || 0}</div></div>
      <div class="reading-check-summary-card"><div class="reading-check-summary-label">Jamais connectés</div><div class="reading-check-summary-value">${Number(summary.neverConnectedUsers) || 0}</div></div>
    </div>`;
}

function renderReadingCheckOverviewUserList() {
  if (!dom.readingCheckUserList) return;
  if (state.loadingUsersReadingOverview && !state.usersReadingOverviewData?.users) {
    dom.readingCheckUserList.innerHTML = `<div class="empty-state"><span class="inline-spinner" aria-hidden="true"></span><span>Vue globale en cours de chargement.</span></div>`;
    return;
  }
  const users = getFilteredReadingCheckOverviewUsers();
  if (!users.length) {
    dom.readingCheckUserList.innerHTML = `<div class="empty-state">Aucun utilisateur ne correspond aux filtres.</div>`;
    return;
  }
  dom.readingCheckUserList.innerHTML = users.map((user) => {
    const active = state.selectedReadingCheckOverviewEmail === user.email;
    const effectiveStatus = getReadingCheckOverviewEffectiveStatus(user);
    return `
      <button class="reading-check-user-btn reading-check-user-btn-rich${active ? " is-active" : ""}" type="button" data-reading-check-overview-email="${escapeHtml(user.email)}">
        <span class="reading-check-user-name">${escapeHtml(getReadingCheckUserName(user))}</span>
        <span class="reading-check-user-email">${escapeHtml(user.email)}</span>
        <span class="reading-check-user-meta-line">
          <span class="badge ${getReadingCheckStatusClass(effectiveStatus)}">${escapeHtml(getReadingCheckStatusLabel(effectiveStatus))}</span>
          ${user.isExternal ? `<span class="badge hidden">Externe</span>` : ""}
          ${!user.hasProfile ? `<span class="badge hidden">Nom manquant</span>` : ""}
        </span>
        <span class="reading-check-user-meta-line reading-check-user-meta-small">
          <span>${escapeHtml(formatReadingCheckOverviewListMeta(user))}</span>
        </span>
      </button>`;
  }).join("");
}

function renderReadingCheckUserList() {
  if (state.readingCheckViewMode === "overview") {
    renderReadingCheckOverviewUserList();
    return;
  }
  if (!dom.readingCheckUserList) return;
  if (state.loadingAssignableUsers && !state.assignableUsers.length) {
    dom.readingCheckUserList.innerHTML = `<div class="empty-state"><span class="inline-spinner" aria-hidden="true"></span><span>Liste d'utilisateurs en cours de chargement.</span></div>`;
    return;
  }
  const users = getSortedReadingCheckUsers();
  if (!users.length) {
    dom.readingCheckUserList.innerHTML = `<div class="empty-state">Aucun utilisateur trouvé.</div>`;
    return;
  }
  dom.readingCheckUserList.innerHTML = users.map((user) => {
    const active = state.selectedReadingCheckEmail === user.email;
    const displayName = getReadingCheckUserName(user);
    return `
      <button class="reading-check-user-btn${active ? " is-active" : ""}" type="button" data-reading-check-email="${escapeHtml(user.email)}">
        <span class="reading-check-user-name">${escapeHtml(displayName)}</span>
        <span class="reading-check-user-email">${escapeHtml(user.email)}</span>
        ${getEffectiveReadingCheckConnectionAt(user) ? `<span class="reading-check-user-email">${escapeHtml(`Dernière connexion connue: ${formatDateTime(getEffectiveReadingCheckConnectionAt(user))}`)}</span>` : ""}
        ${user.isExternal ? `<span class="badge hidden reading-check-external-badge">Externe</span>` : ""}
      </button>
    `;
  }).join("");
}

function renderReadingCheckOverviewDetails() {
  if (!dom.readingCheckDetails) return;
  dom.readingCheckDetails.classList.add("is-overview-mode");
  const users = getFilteredReadingCheckOverviewUsers();
  const selected = users.find((user) => user.email === state.selectedReadingCheckOverviewEmail) || users[0] || null;
  if (!selected) {
    dom.readingCheckDetails.innerHTML = `<div class="empty-state">Aucune donnée globale disponible pour le moment.</div>`;
    return;
  }
  state.selectedReadingCheckOverviewEmail = selected.email;
  const selectedBookId = getReadingCheckOverviewSelectedBookId();
  const selectedBook = getReadingCheckOverviewUserBookStatus(selected, selectedBookId);
  const selectedBookMeta = getReadingCheckOverviewBookMeta(selectedBookId);
  const scopedMode = !!selectedBook && selectedBookId !== "all";
  const scopedTitle = selectedBookMeta?.title || selectedBook?.title || "Roman sélectionné";
  const scopedProgress = Number(selectedBook?.totalPages) > 0
    ? `${Math.max(0, Number(selectedBook?.currentPage) || 0)} / ${Math.max(0, Number(selectedBook?.totalPages) || 0)}`
    : `${Math.round(Number(selectedBook?.progressPercent) || 0)} %`;
  const scopedActivity = selectedBook?.lastActivityAt || selectedBook?.lastUpdated || selectedBook?.lastOpenedAt || "";
  dom.readingCheckDetails.innerHTML = `
    <div class="reading-check-user-heading">
      <h4>${escapeHtml(getReadingCheckUserName(selected))}</h4>
      <p>${escapeHtml(selected.email || "")}</p>
    </div>
    <div class="reading-check-summary reading-check-summary-detail-compact">
      <div class="reading-check-summary-card"><div class="reading-check-summary-label">Statut</div><div class="reading-check-summary-value">${escapeHtml(getReadingCheckStatusLabel(scopedMode ? selectedBook?.status : selected.status))}</div></div>
      ${scopedMode
        ? `<div class="reading-check-summary-card"><div class="reading-check-summary-label">Progression</div><div class="reading-check-summary-value">${escapeHtml(scopedProgress)}</div></div>
           <div class="reading-check-summary-card"><div class="reading-check-summary-label">Temps de lecture</div><div class="reading-check-summary-value">${escapeHtml(formatReadingDuration(selectedBook?.readingSeconds))}</div></div>
           <div class="reading-check-summary-card"><div class="reading-check-summary-label">Séances</div><div class="reading-check-summary-value">${Number(selectedBook?.sessionCount) || 0}</div></div>
           <div class="reading-check-summary-card"><div class="reading-check-summary-label">Dernière connexion</div><div class="reading-check-summary-value">${escapeHtml(formatReadingCheckKnownConnectionValue(selected))}</div></div>
           <div class="reading-check-summary-card"><div class="reading-check-summary-label">Dernière activité</div><div class="reading-check-summary-value">${escapeHtml(formatDateTimeWithRelative(scopedActivity))}</div></div>
           <div class="reading-check-summary-card"><div class="reading-check-summary-label">Signets</div><div class="reading-check-summary-value">${Number(selectedBook?.bookmarksCount) || 0}</div></div>
           <div class="reading-check-summary-card"><div class="reading-check-summary-label">Notes</div><div class="reading-check-summary-value">${Number(selectedBook?.notesCount) || 0}</div></div>`
        : `<div class="reading-check-summary-card"><div class="reading-check-summary-label">Livres commencés</div><div class="reading-check-summary-value">${Number(selected.booksStarted) || 0}</div></div>
           <div class="reading-check-summary-card"><div class="reading-check-summary-label">Livres terminés</div><div class="reading-check-summary-value">${Number(selected.booksCompleted) || 0}</div></div>
           <div class="reading-check-summary-card"><div class="reading-check-summary-label">Temps de lecture</div><div class="reading-check-summary-value">${escapeHtml(formatReadingDuration(selected.totalReadingSeconds))}</div></div>
           <div class="reading-check-summary-card"><div class="reading-check-summary-label">Séances</div><div class="reading-check-summary-value">${Number(selected.totalSessions) || 0}</div></div>
           <div class="reading-check-summary-card"><div class="reading-check-summary-label">Dernière connexion</div><div class="reading-check-summary-value">${escapeHtml(formatReadingCheckKnownConnectionValue(selected))}</div></div>
           <div class="reading-check-summary-card"><div class="reading-check-summary-label">Dernière activité</div><div class="reading-check-summary-value">${escapeHtml(formatDateTimeWithRelative(selected.lastActivityAt))}</div></div>
           <div class="reading-check-summary-card"><div class="reading-check-summary-label">Signets</div><div class="reading-check-summary-value">${Number(selected.totalBookmarks) || 0}</div></div>
           <div class="reading-check-summary-card"><div class="reading-check-summary-label">Notes</div><div class="reading-check-summary-value">${Number(selected.totalNotes) || 0}</div></div>`}
    </div>
    <div class="reading-check-book-list">
      ${scopedMode ? `<article class="reading-check-book-card">
        <div class="reading-check-book-head">
          <div>
            <h5>${escapeHtml(scopedTitle)}</h5>
            <p>Données de lecture pour le roman sélectionné</p>
          </div>
          <div class="badge ${getReadingCheckStatusClass(selectedBook?.status)}">${escapeHtml(getReadingCheckStatusLabel(selectedBook?.status))}</div>
        </div>
        <div class="reading-check-book-stats">
          <div class="reading-check-stat"><div class="reading-check-stat-label">Page actuelle</div><div class="reading-check-stat-value">${Number(selectedBook?.currentPage) || 0}</div></div>
          <div class="reading-check-stat"><div class="reading-check-stat-label">Total de pages</div><div class="reading-check-stat-value">${Number(selectedBook?.totalPages) || 0}</div></div>
          <div class="reading-check-stat"><div class="reading-check-stat-label">Progression</div><div class="reading-check-stat-value">${Math.round(Number(selectedBook?.progressPercent) || 0)} %</div></div>
          <div class="reading-check-stat"><div class="reading-check-stat-label">Dernière page visitée</div><div class="reading-check-stat-value">${Number(selectedBook?.lastPageVisited) || 0}</div></div>
        </div>
      </article>` : ""}
      <article class="reading-check-book-card">
        <div class="reading-check-book-head">
          <div>
            <h5>Profil de l'utilisateur</h5>
            <p>${selected.hasProfile ? "Nom et prénom complétés" : "Nom et prénom non complétés"}</p>
          </div>
          <div class="badge ${selected.hasProfile ? "published" : "hidden"}">${selected.hasProfile ? "Profil complet" : "Profil incomplet"}</div>
        </div>
        <div class="reading-check-book-stats">
          <div class="reading-check-stat"><div class="reading-check-stat-label">Créé le</div><div class="reading-check-stat-value">${escapeHtml(formatDateTimeWithRelative(selected.createdAt))}</div></div>
          <div class="reading-check-stat"><div class="reading-check-stat-label">Profil modifié le</div><div class="reading-check-stat-value">${escapeHtml(formatDateTimeWithRelative(selected.profileUpdatedAt || selected.updatedAt))}</div></div>
          <div class="reading-check-stat"><div class="reading-check-stat-label">Dernier livre actif</div><div class="reading-check-stat-value">${escapeHtml(selected.latestBookTitle || "Aucune donnée")}</div></div>
          <div class="reading-check-stat"><div class="reading-check-stat-label">Type de compte</div><div class="reading-check-stat-value">${selected.isExternal ? "Externe" : "Interne"}</div></div>
        </div>
      </article>
    </div>`;
}

function renderReadingCheckDetails() {
  if (state.readingCheckViewMode === "overview") {
    renderReadingCheckOverviewDetails();
    return;
  }
  if (!dom.readingCheckDetails) return;
  dom.readingCheckDetails.classList.remove("is-overview-mode");
  const payload = state.readingCheckData;
  const pendingUser = getPendingReadingCheckUser();
  const payloadUser = payload?.user || null;
  const selectedUser = payloadUser || pendingUser;
  const isLoading = !!state.loadingReadingCheckEmail;

  if (!selectedUser) {
    dom.readingCheckDetails.innerHTML = `<div class="empty-state">Sélectionne un élève pour consulter ses données de lecture.</div>`;
    return;
  }

  const userName = getReadingCheckUserName(selectedUser);
  const allBooks = Array.isArray(payload?.books) ? payload.books : [];
  const filterOptions = allBooks.map((book, index) => ({
    key: getReadingCheckBookKey(book, index),
    label: String(book.title || book.bookId || `Livre ${index + 1}`),
  }));
  if (!Array.isArray(state.readingCheckBookFilters) || !state.readingCheckBookFilters.length) {
    state.readingCheckBookFilters = filterOptions.map((item) => item.key);
  } else {
    const allowed = new Set(filterOptions.map((item) => item.key));
    state.readingCheckBookFilters = state.readingCheckBookFilters.filter((key) => allowed.has(String(key)));
    if (!state.readingCheckBookFilters.length && filterOptions.length) {
      state.readingCheckBookFilters = filterOptions.map((item) => item.key);
    }
  }

  const books = getVisibleReadingCheckBooks(allBooks);
  const summary = computeReadingCheckSummaryFromBooks(books);
  const filtersHtml = filterOptions.length > 1 ? `
    <div class="reading-check-book-filter-block">
      <div class="reading-check-book-filter-title">Livres à afficher dans les statistiques</div>
      <div class="reading-check-book-filter-list">
        ${filterOptions.map((item) => {
          const checked = state.readingCheckBookFilters.includes(item.key);
          return `<label class="reading-check-book-filter-item"><input type="checkbox" data-reading-check-book-filter="${escapeHtml(item.key)}" ${checked ? "checked" : ""}><span>${escapeHtml(item.label)}</span></label>`;
        }).join("")}
      </div>
    </div>` : "";

  const bookCards = books.length ? books.map((book) => {
    const bookmarks = Array.isArray(book.bookmarks) ? book.bookmarks : [];
    const notes = Array.isArray(book.notes) ? book.notes : [];
    const bookmarkHtml = bookmarks.length
      ? `<div class="reading-check-chip-list">${bookmarks.map((bookmark) => {
          const page = Number(bookmark.page) || 0;
          const label = String(bookmark.label || "").trim();
          return `<div class="reading-check-chip">${label ? `<strong>${escapeHtml(label)}</strong>` : "<strong>Signet</strong>"}<span>Page ${page}</span></div>`;
        }).join("")}</div>`
      : `<div class="empty-state">Aucun signet enregistré.</div>`;
    const notesHtml = notes.length
      ? `<div class="reading-check-note-list">${notes.map((note) => `
          <div class="reading-check-note">
            <div class="reading-check-note-meta">Page ${Number(note.page) || 0}${note.updatedAt ? ` - ${escapeHtml(formatDateTime(note.updatedAt))}` : ""}</div>
            <div class="reading-check-note-text">${escapeHtml(note.noteText || "")}</div>
          </div>
        `).join("")}</div>`
      : `<div class="empty-state">Aucune note enregistrée.</div>`;
    return `
      <article class="reading-check-book-card">
        <div class="reading-check-book-head">
          <div>
            <h5>${escapeHtml(book.title || book.bookId || "Livre")}</h5>
            <p>${book.author ? escapeHtml(book.author) : "Auteur non indiqué"}</p>
          </div>
          <div class="badge published">${Math.round(Number(book.progressPercent) || 0)} %</div>
        </div>
        <div class="reading-check-book-stats">
          <div class="reading-check-stat"><div class="reading-check-stat-label">Progression</div><div class="reading-check-stat-value">Page ${Number(book.currentPage) || 0} / ${Number(book.totalPages) || 0}</div></div>
          <div class="reading-check-stat"><div class="reading-check-stat-label">Dernière ouverture</div><div class="reading-check-stat-value">${book.lastOpenedAt ? escapeHtml(formatDateTime(book.lastOpenedAt)) : "Aucune donnée"}</div></div>
          <div class="reading-check-stat"><div class="reading-check-stat-label">Temps de lecture</div><div class="reading-check-stat-value">${escapeHtml(formatReadingDuration(book.readingSeconds))}</div></div>
          <div class="reading-check-stat"><div class="reading-check-stat-label">Première ouverture</div><div class="reading-check-stat-value">${book.firstOpenedAt ? escapeHtml(formatDateTime(book.firstOpenedAt)) : "Aucune donnée"}</div></div>
        </div>
        <div class="reading-check-book-stats">
          <div class="reading-check-stat"><div class="reading-check-stat-label">Dernière activité</div><div class="reading-check-stat-value">${book.lastUpdated ? escapeHtml(formatDateTime(book.lastUpdated)) : "Aucune donnée"}</div></div>
          <div class="reading-check-stat"><div class="reading-check-stat-label">Séances</div><div class="reading-check-stat-value">${Number(book.sessionCount) || 0}</div></div>
          <div class="reading-check-stat"><div class="reading-check-stat-label">Moyenne / séance</div><div class="reading-check-stat-value">${escapeHtml(formatSessionAverage(book.averageSessionSeconds))}</div></div>
          <div class="reading-check-stat"><div class="reading-check-stat-label">Pages vues</div><div class="reading-check-stat-value">${Number(book.viewedPagesCount) || 0}</div></div>
        </div>
        <div class="reading-check-book-sections">
          <section class="reading-check-section">
            <div class="reading-check-section-title">Pages les plus consultées</div>
            ${(Array.isArray(book.topPages) && book.topPages.length) ? `<div class="reading-check-chip-list">${book.topPages.map((item) => `<div class="reading-check-chip"><strong>Page ${Number(item.page) || 0}</strong><span>${Number(item.viewsCount) || 0} vue(s)</span><span>${escapeHtml(formatReadingDuration(item.readingSeconds))}</span></div>`).join("")}</div>` : `<div class="empty-state">Aucune donnée de consultation.</div>`}
          </section>
          <section class="reading-check-section">
            <div class="reading-check-section-title">Signets (${bookmarks.length})</div>
            ${bookmarkHtml}
          </section>
          <section class="reading-check-section">
            <div class="reading-check-section-title">Notes (${notes.length})</div>
            ${notesHtml}
          </section>
        </div>
      </article>`;
  }).join("") : `<div class="empty-state">Aucun livre commencé pour cet élève.</div>`;

  const loadingOverlay = isLoading ? `
    <div class="reading-check-overlay" aria-hidden="true">
      <div class="reading-check-overlay-card"><span class="inline-spinner" aria-hidden="true"></span><span>Chargement des données de lecture…</span></div>
    </div>` : "";

  dom.readingCheckDetails.innerHTML = `
    <div class="reading-check-details-shell${isLoading ? " is-loading" : ""}">
      <div class="reading-check-details-content">
        <div class="reading-check-user-heading">
          <h4>${escapeHtml(userName)}</h4>
          <p>${escapeHtml(selectedUser.email || "")}</p>
        </div>
        <div class="reading-check-summary">
          <div class="reading-check-summary-card"><div class="reading-check-summary-label">Livres commencés</div><div class="reading-check-summary-value">${summary.booksStarted}</div></div>
          <div class="reading-check-summary-card"><div class="reading-check-summary-label">Signets</div><div class="reading-check-summary-value">${summary.totalBookmarks}</div></div>
          <div class="reading-check-summary-card"><div class="reading-check-summary-label">Notes</div><div class="reading-check-summary-value">${summary.totalNotes}</div></div>
          <div class="reading-check-summary-card"><div class="reading-check-summary-label">Temps total</div><div class="reading-check-summary-value">${escapeHtml(formatReadingDuration(summary.totalReadingSeconds))}</div></div>
          <div class="reading-check-summary-card"><div class="reading-check-summary-label">Séances</div><div class="reading-check-summary-value">${summary.totalSessions}</div></div>
        </div>
        ${filtersHtml}
        <div class="reading-check-book-list">${bookCards}</div>
      </div>
      ${loadingOverlay}
    </div>
  `;
}

async function loadStudentReadingOverview(targetEmail) {
  const email = normalizeEmail(targetEmail);
  if (!email || !state.adminUnlocked || !canSeeAdminPanel()) return;
  state.selectedReadingCheckEmail = email;
  state.loadingReadingCheckEmail = email;
  state.pendingReadingCheckUser = state.assignableUsers.find((user) => normalizeEmail(user.email) === email) || { email };
  renderReadingCheckUserList();
  renderReadingCheckDetails();
  setReadingCheckStatus("");
  try {
    const response = await jsonp("getStudentReadingOverview", { email: state.email, adminCode: state.adminCode, targetEmail: email });
    if (!response?.ok) throw new Error(response?.message || "Impossible de charger les données de lecture.");
    state.readingCheckData = response;
    state.pendingReadingCheckUser = response.user || state.pendingReadingCheckUser;
    const books = Array.isArray(response.books) ? response.books : [];
    state.readingCheckBookFilters = books.map((book, index) => getReadingCheckBookKey(book, index));
    renderReadingCheckDetails();
  } catch (error) {
    console.error(error);
    state.readingCheckData = null;
    renderReadingCheckDetails();
    setReadingCheckStatus(error.message || "Erreur lors du chargement.", "error");
  } finally {
    state.loadingReadingCheckEmail = "";
    renderReadingCheckUserList();
    renderReadingCheckDetails();
  }
}



function getLatestKnownDate(values) {
  const list = Array.isArray(values) ? values : [values];
  let bestValue = "";
  let bestTs = 0;
  list.forEach((value) => {
    const ts = parseDateMs(value);
    if (ts > bestTs) {
      bestTs = ts;
      bestValue = value;
    }
  });
  return bestValue || "";
}

function buildReadingCheckOverviewDataFromBookResponse(response) {
  const book = response?.book || {};
  const summary = response?.summary || {};
  const assignableMap = new Map(
    (Array.isArray(state.assignableUsers) ? state.assignableUsers : [])
      .filter((user) => !!normalizeEmail(user?.email || ""))
      .map((user) => [normalizeEmail(user.email), user])
  );

  const normalizedBook = {
    bookId: String(book.bookId || ""),
    title: String(book.title || book.bookId || "Roman"),
    author: String(book.author || ""),
    restrictedAccess: !!book.restrictedAccess,
    eligibleUsers: Number(summary.eligibleUsers) || 0,
  };

  const users = (Array.isArray(response?.users) ? response.users : []).map((item) => {
    const email = normalizeEmail(item?.email || "");
    const profile = assignableMap.get(email) || {};
    const firstName = normalizePersonName(item?.firstName || profile.firstName || "");
    const lastName = normalizePersonName(item?.lastName || profile.lastName || "");
    const hasProfile = !!(firstName || lastName);
    const lastConnectionAt = profile.lastConnectionAt || "";
    const bookStatus = {
      bookId: normalizedBook.bookId,
      title: normalizedBook.title,
      status: String(item?.status || "not_started"),
      currentPage: Number(item?.currentPage) || 0,
      totalPages: Number(item?.totalPages) || 0,
      progressPercent: Number(item?.progressPercent) || 0,
      readingSeconds: Number(item?.readingSeconds) || 0,
      sessionCount: Number(item?.sessionCount) || 0,
      bookmarksCount: Number(item?.bookmarksCount) || 0,
      notesCount: Number(item?.notesCount) || 0,
      lastOpenedAt: item?.lastOpenedAt || "",
      lastUpdated: item?.lastUpdated || "",
      lastActivityAt: item?.lastUpdated || item?.lastOpenedAt || item?.completedAt || "",
      lastPageVisited: Number(item?.lastPageVisited) || 0,
      completedAt: item?.completedAt || "",
    };
    const aggregatedActivity = getLatestKnownDate([lastConnectionAt, bookStatus.lastActivityAt, item?.firstOpenedAt || ""]);
    return {
      email,
      bookId: normalizedBook.bookId,
      firstName,
      lastName,
      fullName: hasProfile ? `${lastName} ${firstName}`.trim() : email,
      hasProfile,
      isExternal: item?.isExternal !== undefined ? !!item.isExternal : !!profile.isExternal,
      createdAt: profile.createdAt || "",
      profileUpdatedAt: profile.updatedAt || "",
      lastConnectionAt,
      lastActivityAt: aggregatedActivity || "",
      lastOpenedAt: item?.lastOpenedAt || "",
      latestBookTitle: bookStatus.status === "not_started" ? "" : normalizedBook.title,
      booksStarted: bookStatus.status === "not_started" ? 0 : 1,
      booksCompleted: bookStatus.status === "completed" ? 1 : 0,
      totalReadingSeconds: bookStatus.readingSeconds,
      totalSessions: bookStatus.sessionCount,
      totalBookmarks: bookStatus.bookmarksCount,
      totalNotes: bookStatus.notesCount,
      availableBookCount: 1,
      bookStatuses: [bookStatus],
      status: bookStatus.status,
    };
  });

  return {
    selectedBookId: normalizedBook.bookId,
    summary: {
      totalUsers: Number(summary.eligibleUsers) || users.length,
      usersWithProfile: users.filter((user) => user.hasProfile).length,
      usersWithoutProfile: users.filter((user) => !user.hasProfile).length,
      connectedUsers: users.filter((user) => !!getEffectiveReadingCheckConnectionAt(user)).length,
      neverConnectedUsers: users.filter((user) => !getEffectiveReadingCheckConnectionAt(user)).length,
      startedUsers: Number(summary.startedUsers) || users.filter((user) => user.status === "started" || user.status === "completed").length,
      notStartedUsers: Number(summary.notStartedUsers) || users.filter((user) => user.status === "not_started").length,
      completedUsers: Number(summary.completedUsers) || users.filter((user) => user.status === "completed").length,
    },
    users,
    books: [normalizedBook],
  };
}

async function loadUsersReadingOverview(force = false) {
  if (!state.adminUnlocked || !canSeeAdminPanel()) return;
  syncReadingCheckOverviewBookOptions();
  const selectedBookId = getReadingCheckOverviewSelectedBookId();
  if (!selectedBookId) {
    state.usersReadingOverviewData = { selectedBookId: "", summary: {}, users: [], books: [] };
    state.selectedReadingCheckOverviewEmail = "";
    renderReadingCheckGlobalSummary();
    renderReadingCheckUserList();
    renderReadingCheckDetails();
    return;
  }
  if (!force && state.usersReadingOverviewData?.selectedBookId === selectedBookId && Array.isArray(state.usersReadingOverviewData?.users)) {
    renderReadingCheckGlobalSummary();
    renderReadingCheckUserList();
    renderReadingCheckDetails();
    return;
  }
  const cached = state.readingCheckOverviewCache?.[selectedBookId];
  if (!force && cached && Array.isArray(cached.users)) {
    state.usersReadingOverviewData = cached;
    const firstCachedUser = getFilteredReadingCheckOverviewUsers()[0] || cached.users[0] || null;
    if (!state.selectedReadingCheckOverviewEmail || !cached.users.some((user) => user.email === state.selectedReadingCheckOverviewEmail)) {
      state.selectedReadingCheckOverviewEmail = firstCachedUser ? firstCachedUser.email : "";
    }
    renderReadingCheckGlobalSummary();
    renderReadingCheckUserList();
    renderReadingCheckDetails();
    return;
  }

  state.loadingUsersReadingOverview = true;
  renderReadingCheckGlobalSummary();
  renderReadingCheckUserList();
  renderReadingCheckDetails();
  setReadingCheckStatus("Chargement de la vue globale…", "", true);
  try {
    const response = await jsonp("getBookReadingOverview", {
      email: state.email,
      adminCode: state.adminCode,
      bookId: selectedBookId,
      summaryOnly: "1",
    }, { timeoutMs: 45000 });
    if (!response?.ok) throw new Error(response?.message || "Impossible de charger la vue globale.");
    const normalized = buildReadingCheckOverviewDataFromBookResponse(response);
    state.usersReadingOverviewData = normalized;
    state.readingCheckOverviewCache[selectedBookId] = normalized;
    const firstUser = getFilteredReadingCheckOverviewUsers()[0] || normalized.users[0] || null;
    if (!state.selectedReadingCheckOverviewEmail || !normalized.users.some((user) => user.email === state.selectedReadingCheckOverviewEmail)) {
      state.selectedReadingCheckOverviewEmail = firstUser ? firstUser.email : "";
    }
    setReadingCheckStatus("");
  } catch (error) {
    console.error(error);
    state.usersReadingOverviewData = null;
    state.selectedReadingCheckOverviewEmail = "";
    setReadingCheckStatus(error.message || "Erreur lors du chargement.", "error");
  } finally {
    state.loadingUsersReadingOverview = false;
    renderReadingCheckGlobalSummary();
    renderReadingCheckUserList();
    renderReadingCheckDetails();
  }
}
function setReadingCheckViewMode(mode) {
  state.readingCheckViewMode = mode === "overview" ? "overview" : "student";
  updateReadingCheckModeUi();
  renderReadingCheckGlobalSummary();
  renderReadingCheckUserList();
  renderReadingCheckDetails();
  resetReadingCheckDetailScroll();
  scrollActiveReadingCheckUserIntoView();
  if (state.readingCheckViewMode === "overview" && !state.usersReadingOverviewData && !state.loadingUsersReadingOverview) {
    void loadUsersReadingOverview(true);
  }
}


function refreshReadingCheckAfterFilterChange() {
  if (state.readingCheckViewMode === "overview") {
    const selectedBookId = getReadingCheckOverviewSelectedBookId();
    if (selectedBookId && selectedBookId !== String(state.usersReadingOverviewData?.selectedBookId || "")) {
      void loadUsersReadingOverview(true);
      return;
    }
    const overviewUsers = getFilteredReadingCheckOverviewUsers();
    const firstOverviewUser = overviewUsers[0] || null;
    if (state.selectedReadingCheckOverviewEmail && !overviewUsers.some((user) => user.email === state.selectedReadingCheckOverviewEmail)) {
      state.selectedReadingCheckOverviewEmail = firstOverviewUser ? firstOverviewUser.email : "";
    }
    if (!state.selectedReadingCheckOverviewEmail && firstOverviewUser) state.selectedReadingCheckOverviewEmail = firstOverviewUser.email;
  } else {
    const studentUsers = getSortedReadingCheckUsers();
    const firstStudentUser = studentUsers[0] || null;
    if (state.selectedReadingCheckEmail && !studentUsers.some((user) => user.email === state.selectedReadingCheckEmail)) {
      state.selectedReadingCheckEmail = firstStudentUser ? firstStudentUser.email : "";
    }
  }
  renderReadingCheckGlobalSummary();
  renderReadingCheckUserList();
  renderReadingCheckDetails();
  resetReadingCheckDetailScroll();
  scrollActiveReadingCheckUserIntoView();
}

async function openReadingCheckModal() {
  if (!state.adminUnlocked || !canSeeAdminPanel()) {
    showToast("Déverrouille d'abord le module administrateur");
    return;
  }
  if (!dom.readingCheckModal) return;
  dom.readingCheckModal.hidden = false;
  if (dom.readingCheckSearchInput) dom.readingCheckSearchInput.value = "";
  if (dom.readingCheckSortSelect) dom.readingCheckSortSelect.value = "name";
  if (dom.readingCheckOverviewBookSelect) dom.readingCheckOverviewBookSelect.value = "";
  if (dom.readingCheckGlobalFilterSelect) dom.readingCheckGlobalFilterSelect.value = "all";
  if (dom.readingCheckShowExternalInput) dom.readingCheckShowExternalInput.checked = false;
  state.readingCheckSortMode = "name";
  state.readingCheckShowExternal = false;
  state.readingCheckGlobalFilterMode = "all";
  state.readingCheckData = null;
  state.usersReadingOverviewData = null;
  state.pendingReadingCheckUser = null;
  state.selectedReadingCheckEmail = "";
  state.selectedReadingCheckOverviewEmail = "";
  state.loadingReadingCheckEmail = "";
  state.loadingUsersReadingOverview = false;
  state.readingCheckBookFilters = [];
  state.readingCheckOverviewBookId = "";
  state.loadingAssignableUsers = true;
  setReadingCheckStatus("");
  setReadingCheckViewMode("student");
  renderReadingCheckUserList();
  renderReadingCheckDetails();
  void loadAssignableUsers(true);
}

function closeReadingCheckModal() {
  if (!dom.readingCheckModal) return;
  dom.readingCheckModal.hidden = true;
  state.pendingReadingCheckUser = null;
  state.loadingReadingCheckEmail = "";
  state.loadingUsersReadingOverview = false;
  state.readingCheckBookFilters = [];
  state.readingCheckOverviewBookId = "";
  state.readingCheckViewMode = "student";
  if (dom.readingCheckGlobalSummary) dom.readingCheckGlobalSummary.innerHTML = "";
  setReadingCheckStatus("");
  updateReadingCheckModeUi();
}

function renderBookReviewSummary() {
  if (!dom.bookReviewSummary) return;
  const payload = state.bookReviewData;
  if (!payload?.summary) {
    dom.bookReviewSummary.innerHTML = "";
    return;
  }
  const summary = payload.summary || {};
  dom.bookReviewSummary.innerHTML = `
    <div class="reading-check-summary book-review-summary-grid">
      <div class="reading-check-summary-card"><div class="reading-check-summary-label">Utilisateurs autorisés</div><div class="reading-check-summary-value">${Number(summary.eligibleUsers) || 0}</div></div>
      <div class="reading-check-summary-card"><div class="reading-check-summary-label">Commencés</div><div class="reading-check-summary-value">${Number(summary.startedUsers) || 0}</div></div>
      <div class="reading-check-summary-card"><div class="reading-check-summary-label">Avec notes</div><div class="reading-check-summary-value">${Number(summary.withNotesUsers) || 0}</div></div>
      <div class="reading-check-summary-card"><div class="reading-check-summary-label">Terminés</div><div class="reading-check-summary-value">${Number(summary.completedUsers) || 0}</div></div>
      <div class="reading-check-summary-card"><div class="reading-check-summary-label">Séances</div><div class="reading-check-summary-value">${Number(summary.totalSessions) || 0}</div></div>
    </div>
  `;
}

function getFilteredBookReviewUsers() {
  const payload = state.bookReviewData;
  if (!payload?.users) return [];
  const query = String(dom.bookReviewSearchInput?.value || "").trim().toLowerCase();
  const sortMode = dom.bookReviewSortSelect?.value || state.bookReviewSortMode || "name";
  const filterMode = dom.bookReviewFilterSelect?.value || state.bookReviewFilterMode || "all";
  const showExternal = !!dom.bookReviewShowExternalInput?.checked;
  state.bookReviewSortMode = sortMode;
  state.bookReviewFilterMode = filterMode;
  state.bookReviewShowExternal = showExternal;
  return [...payload.users]
    .filter((user) => {
      if (!showExternal && user.isExternal) return false;
      if (filterMode === "started" && user.status !== "started" && user.status !== "completed") return false;
      if (filterMode === "notes" && !(Number(user.notesCount) > 0)) return false;
      if (filterMode === "completed" && user.status !== "completed") return false;
      if (filterMode === "not_started" && user.status !== "not_started") return false;
      if (!query) return true;
      const haystack = `${getBookReviewUserName(user)} ${user.email}`.toLowerCase();
      return haystack.includes(query);
    })
    .sort((left, right) => {
      if (sortMode === "email") return String(left.email || "").localeCompare(String(right.email || ""), "fr-CA");
      if (sortMode === "progress") {
        const delta = (Number(right.progressPercent) || 0) - (Number(left.progressPercent) || 0);
        if (delta) return delta;
      }
      if (sortMode === "activity") {
        const leftTime = new Date(left.lastUpdated || left.lastOpenedAt || 0).getTime() || 0;
        const rightTime = new Date(right.lastUpdated || right.lastOpenedAt || 0).getTime() || 0;
        if (rightTime !== leftTime) return rightTime - leftTime;
      }
      const leftKey = `${String(left.lastName || "").toLowerCase()}${String(left.firstName || "").toLowerCase()}${String(left.email || "").toLowerCase()}`;
      const rightKey = `${String(right.lastName || "").toLowerCase()}${String(right.firstName || "").toLowerCase()}${String(right.email || "").toLowerCase()}`;
      return leftKey.localeCompare(rightKey, "fr-CA");
    });
}

function renderBookReviewUserList() {
  if (!dom.bookReviewUserList) return;
  const users = getFilteredBookReviewUsers();
  if (!users.length) {
    dom.bookReviewUserList.innerHTML = `<div class="empty-state">Aucun utilisateur ne correspond aux filtres.</div>`;
    return;
  }
  dom.bookReviewUserList.innerHTML = users.map((user) => {
    const active = state.selectedBookReviewEmail === user.email;
    const loading = state.loadingBookReviewEmail === user.email;
    return `
      <button class="reading-check-user-btn book-review-user-btn${active ? " is-active" : ""}" type="button" data-book-review-email="${escapeHtml(user.email)}">
        <span class="reading-check-user-name">${escapeHtml(getBookReviewUserName(user))}</span>
        <span class="reading-check-user-email">${escapeHtml(user.email)}</span>
        <span class="book-review-user-meta">
          <span class="badge ${getBookReviewStatusClass(user.status)}">${escapeHtml(getBookReviewStatusLabel(user.status))}</span>
          <span class="book-review-progress">${Math.round(Number(user.progressPercent) || 0)} %</span>
          ${user.isExternal ? `<span class="badge hidden">Externe</span>` : ""}
          ${loading ? `<span class="inline-spinner" aria-hidden="true"></span>` : ""}
        </span>
      </button>
    `;
  }).join("");
}

function renderBookReviewDetails() {
  if (!dom.bookReviewDetails) return;
  const payload = state.bookReviewData;
  if (!payload?.book) {
    dom.bookReviewDetails.innerHTML = `<div class="empty-state">Choisis un livre pour consulter l'activité de lecture.</div>`;
    return;
  }
  const book = payload.book;
  const selected = (payload.users || []).find((user) => user.email === state.selectedBookReviewEmail) || null;
  const countsLine = `${Number(book.visiblePageCount) || Number(book.totalPages) || 0} page(s) visibles${Number(book.hiddenPagesCount) ? ` sur ${Number(book.totalPages) || 0}` : ""}`;
  const hiddenLine = Number(book.hiddenPagesCount) ? `Pages masquées: ${escapeHtml(book.hiddenPageRanges || book.hiddenPagesList?.join(", ") || "")}` : "Aucune page masquée";
  if (!selected) {
    dom.bookReviewDetails.innerHTML = `
      <div class="reading-check-user-heading">
        <h4>${escapeHtml(book.title || "Livre")}</h4>
        <p>${escapeHtml(countsLine)} - ${escapeHtml(hiddenLine)}</p>
      </div>
      <div class="empty-state">Choisis un élève dans la liste pour consulter ses données sur ce livre.</div>
    `;
    return;
  }
  const bookmarks = Array.isArray(selected.bookmarks) ? selected.bookmarks : [];
  const notes = Array.isArray(selected.notes) ? selected.notes : [];
  const bookmarkHtml = bookmarks.length
    ? `<div class="reading-check-chip-list">${bookmarks.map((bookmark) => {
        const page = Number(bookmark.page) || 0;
        const label = String(bookmark.label || "").trim();
        return `<div class="reading-check-chip">${label ? `<strong>${escapeHtml(label)}</strong>` : "<strong>Signet</strong>"}<span>Page ${page}</span></div>`;
      }).join("")}</div>`
    : `<div class="empty-state">Aucun signet enregistré.</div>`;
  const notesHtml = notes.length
    ? `<div class="reading-check-note-list">${notes.map((note) => `
        <div class="reading-check-note">
          <div class="reading-check-note-meta">Page ${Number(note.page) || 0}${note.updatedAt ? ` - ${escapeHtml(formatDateTime(note.updatedAt))}` : ""}</div>
          <div class="reading-check-note-text">${escapeHtml(note.noteText || "")}</div>
        </div>
      `).join("")}</div>`
    : `<div class="empty-state">Aucune note enregistrée.</div>`;
  dom.bookReviewDetails.innerHTML = `
    <div class="reading-check-user-heading">
      <h4>${escapeHtml(getBookReviewUserName(selected))}</h4>
      <p>${escapeHtml(book.title || "Livre")} - ${escapeHtml(selected.email || "")}</p>
    </div>
    <div class="reading-check-summary">
      <div class="reading-check-summary-card"><div class="reading-check-summary-label">Statut</div><div class="reading-check-summary-value">${escapeHtml(getBookReviewStatusLabel(selected.status))}</div></div>
      <div class="reading-check-summary-card"><div class="reading-check-summary-label">Progression</div><div class="reading-check-summary-value">${Number(selected.currentPage) || 0} / ${Number(selected.totalPages) || 0}</div></div>
      <div class="reading-check-summary-card"><div class="reading-check-summary-label">Temps de lecture</div><div class="reading-check-summary-value">${escapeHtml(formatReadingDuration(selected.readingSeconds))}</div></div>
      <div class="reading-check-summary-card"><div class="reading-check-summary-label">Dernière activité</div><div class="reading-check-summary-value">${selected.lastUpdated ? escapeHtml(formatDateTime(selected.lastUpdated)) : "Aucune donnée"}</div></div>
    </div>
    <div class="reading-check-book-card book-review-detail-card">
      <div class="reading-check-book-head">
        <div>
          <h5>${escapeHtml(book.title || "Livre")}</h5>
          <p>${escapeHtml(countsLine)} - ${escapeHtml(hiddenLine)}</p>
        </div>
        <div class="badge ${getBookReviewStatusClass(selected.status)}">${Math.round(Number(selected.progressPercent) || 0)} %</div>
      </div>
      <div class="reading-check-book-stats">
        <div class="reading-check-stat"><div class="reading-check-stat-label">Dernière ouverture</div><div class="reading-check-stat-value">${selected.lastOpenedAt ? escapeHtml(formatDateTime(selected.lastOpenedAt)) : "Aucune donnée"}</div></div>
        <div class="reading-check-stat"><div class="reading-check-stat-label">Signets</div><div class="reading-check-stat-value">${bookmarks.length}</div></div>
        <div class="reading-check-stat"><div class="reading-check-stat-label">Notes</div><div class="reading-check-stat-value">${notes.length}</div></div>
      </div>
      <div class="reading-check-book-sections">
        <section class="reading-check-section">
          <div class="reading-check-section-title">Signets</div>
          ${bookmarkHtml}
        </section>
        <section class="reading-check-section">
          <div class="reading-check-section-title">Notes</div>
          ${notesHtml}
        </section>
      </div>
    </div>
  `;
}

function selectBookReviewUser(email) {
  state.selectedBookReviewEmail = normalizeEmail(email);
  renderBookReviewUserList();
  renderBookReviewDetails();
}

async function loadBookReadingOverview(bookId) {
  const targetBookId = String(bookId || "").trim();
  if (!targetBookId || !state.adminUnlocked || !canSeeAdminPanel()) return;
  state.loadingBookReviewId = targetBookId;
  if (dom.bookReviewStatus) {
    dom.bookReviewStatus.className = "save-status reading-check-status";
    dom.bookReviewStatus.innerHTML = `<span class="inline-spinner" aria-hidden="true"></span><span>Chargement du suivi du livre…</span>`;
  }
  renderAdminBooks();
  try {
    const response = await jsonp("getBookReadingOverview", {
      email: state.email,
      adminCode: state.adminCode,
      bookId: targetBookId,
    });
    if (!response?.ok) throw new Error(response?.message || "Impossible de charger le suivi du livre.");
    state.bookReviewData = response;
    state.selectedBookReviewEmail = "";
    renderBookReviewSummary();
    renderBookReviewUserList();
    const firstUser = getFilteredBookReviewUsers()[0];
    if (firstUser) state.selectedBookReviewEmail = firstUser.email;
    renderBookReviewUserList();
    renderBookReviewDetails();
    if (dom.bookReviewSubhead) {
      const book = response.book || {};
      dom.bookReviewSubhead.textContent = `${book.title || "Livre"} - ${Number(book.visiblePageCount) || Number(book.totalPages) || 0} page(s) visibles pour ${Number(response.summary?.eligibleUsers) || 0} utilisateur(s).`;
    }
    if (dom.bookReviewStatus) dom.bookReviewStatus.textContent = "";
  } catch (error) {
    console.error(error);
    state.bookReviewData = null;
    renderBookReviewSummary();
    renderBookReviewUserList();
    renderBookReviewDetails();
    if (dom.bookReviewStatus) {
      dom.bookReviewStatus.className = "save-status reading-check-status status-error";
      dom.bookReviewStatus.textContent = error.message || "Erreur lors du chargement.";
    }
  } finally {
    state.loadingBookReviewId = "";
    renderAdminBooks();
  }
}

async function openBookReviewModal(bookId) {
  if (!state.adminUnlocked || !canSeeAdminPanel() || !dom.bookReviewModal) return;
  dom.bookReviewModal.hidden = false;
  if (dom.bookReviewSearchInput) dom.bookReviewSearchInput.value = "";
  if (dom.bookReviewSortSelect) dom.bookReviewSortSelect.value = "name";
  if (dom.bookReviewFilterSelect) dom.bookReviewFilterSelect.value = "all";
  if (dom.bookReviewShowExternalInput) dom.bookReviewShowExternalInput.checked = false;
  state.bookReviewSortMode = "name";
  state.bookReviewFilterMode = "all";
  state.bookReviewShowExternal = false;
  renderBookReviewSummary();
  renderBookReviewUserList();
  renderBookReviewDetails();
  await loadBookReadingOverview(bookId);
}

function closeBookReviewModal() {
  if (!dom.bookReviewModal) return;
  dom.bookReviewModal.hidden = true;
  if (dom.bookReviewStatus) {
    dom.bookReviewStatus.textContent = "";
    dom.bookReviewStatus.className = "save-status reading-check-status";
  }
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
  normalizePageRangeText(hiddenPageRanges)
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

function getSourcePageForDisplayPage(displayPageNumber) {
  return getSourcePageNumber(displayPageNumber);
}

async function resolveBookForOpening(book) {
  const fallbackBook = buildBookSnapshot(book) || book;
  if (!fallbackBook?.bookId) return fallbackBook;
  const currentListVersion = getBookById(fallbackBook.bookId);
  return buildBookSnapshot(currentListVersion) || fallbackBook;
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
  state.pendingReadingSeconds = 0;
  state.readingTickMs = 0;
  state.currentBookOpenedAt = "";
  state.currentPageEnteredAt = 0;
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

function startReadingTracking() {
  state.pendingReadingSeconds = 0;
  state.readingTickMs = Date.now();
  state.currentBookOpenedAt = new Date().toISOString();
}

function accumulateReadingTime() {
  const now = Date.now();
  if (!state.readingTickMs) {
    state.readingTickMs = now;
    return;
  }
  if (state.currentBook && !dom.reader.hidden && !document.hidden) {
    const deltaSeconds = Math.max(0, (now - state.readingTickMs) / 1000);
    state.pendingReadingSeconds += deltaSeconds;
  }
  state.readingTickMs = now;
}

function consumeReadingSeconds() {
  const wholeSeconds = Math.max(0, Math.floor(state.pendingReadingSeconds));
  state.pendingReadingSeconds = Math.max(0, state.pendingReadingSeconds - wholeSeconds);
  return wholeSeconds;
}

function stopReadingTracking() {
  accumulateReadingTime();
  state.readingTickMs = 0;
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
    state.adminUnlocked = false;
    state.adminCode = "";
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
function jsonp(action, params = {}, options = {}) {
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

    const timeoutMs = Math.max(3000, Number(options.timeoutMs) || 22000);
    const timeoutId = window.setTimeout(() => {
      cleanup();
      reject(new Error("Délai dépassé lors de la connexion au service."));
    }, timeoutMs);

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

async function refreshBooks(options = {}) {
  const { showFeedback = false, origin = "" } = options || {};
  if (!state.email || !state.authVerified) {
    throw new Error("Session invalide.");
  }
  if (state.booksRefreshPromise) return state.booksRefreshPromise;

  if (origin === "admin") {
    setAdminBooksStatus("Actualisation…");
    if (dom.reloadAdminBooksBtn) dom.reloadAdminBooksBtn.disabled = true;
  }

  state.booksRefreshPromise = (async () => {
    const previousBooks = Array.isArray(state.books) ? state.books.map(buildBookSnapshot).filter(Boolean) : [];
    const response = await jsonp("listBooks", {
      email: state.email,
      adminCode: state.adminUnlocked ? state.adminCode : "",
    }, { timeoutMs: 30000 });
    if (!response?.ok) throw new Error(response?.message || "Impossible de charger les livres.");
    state.books = Array.isArray(response.books) ? response.books.map(buildBookSnapshot).filter(Boolean) : [];
    syncRuntimeCacheWithBookList(previousBooks, state.books);
    saveBooksCache();
    renderBookList();
    renderAdminBooks();
    if (state.adminUnlocked) {
      renderAssignableUsers("publish");
      renderAssignableUsers("edit");
    }
    if (origin === "admin") setAdminBooksStatus("Liste à jour.", "success");
    if (showFeedback) showToast("Bibliothèque actualisée");
    return state.books;
  })();

  try {
    return await state.booksRefreshPromise;
  } catch (error) {
    if (origin === "admin") setAdminBooksStatus(error?.message || "Échec de l'actualisation.", "error");
    throw error;
  } finally {
    state.booksRefreshPromise = null;
    if (origin === "admin" && dom.reloadAdminBooksBtn) dom.reloadAdminBooksBtn.disabled = false;
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
  accumulateReadingTime();
  const progressPercent = state.totalPages
    ? Math.round((state.currentPage / state.totalPages) * 1000) / 10
    : 0;
  const readSecondsDelta = consumeReadingSeconds();
  const payload = {
    email: state.email,
    bookId: state.currentBook?.bookId,
    title: state.currentBook?.title,
    currentPage: state.currentPage,
    totalPages: state.totalPages,
    progressPercent,
    readSecondsDelta,
  };
  if (state.currentBookOpenedAt) payload.lastOpenedAt = state.currentBookOpenedAt;
  return payload;
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
    if (payload.lastOpenedAt) state.currentBookOpenedAt = "";
    setSaveStatus("Progression enregistrée", "success");
    if (showSuccess) showToast("Progression enregistrée");
  } catch (error) {
    console.error(error);
    if (payload.readSecondsDelta) state.pendingReadingSeconds += Number(payload.readSecondsDelta) || 0;
    queueOfflineAction('saveProgress', payload, 'Progression enregistrée localement.');
    if (showError) showToast('Progression enregistrée localement');
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
    state.bookmarks.push({ page: state.currentPage, createdAt: new Date().toISOString(), label: '' });
    state.bookmarks.sort((a, b) => Number(a.page) - Number(b.page));
    renderBookmarks();
    queueOfflineAction('addBookmark', { email: state.email, bookId: state.currentBook.bookId, page: state.currentPage }, 'Signet enregistré localement.');
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
    state.bookmarks = state.bookmarks.filter((bookmark) => Number(bookmark.page) !== Number(page));
    renderBookmarks();
    queueOfflineAction('removeBookmark', { email: state.email, bookId: state.currentBook.bookId, page }, 'Retrait du signet en attente.');
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


function loadOfflineQueue() {
  try {
    state.offlineQueue = JSON.parse(localStorage.getItem(LS_OFFLINE_QUEUE_KEY) || '[]');
    if (!Array.isArray(state.offlineQueue)) state.offlineQueue = [];
  } catch (_) {
    state.offlineQueue = [];
  }
}

function persistOfflineQueue() {
  try {
    localStorage.setItem(LS_OFFLINE_QUEUE_KEY, JSON.stringify(state.offlineQueue || []));
  } catch (_) {}
}

function queueOfflineAction(action, params, statusMessage = 'Action enregistrée hors ligne. Synchronisation en attente.') {
  state.offlineQueue = Array.isArray(state.offlineQueue) ? state.offlineQueue : [];
  state.offlineQueue.push({ action, params, queuedAt: new Date().toISOString() });
  persistOfflineQueue();
  setSaveStatus('Synchronisation en attente', 'error');
  if (action.indexOf('Bookmark') !== -1) setBookmarkStatus(statusMessage, 'error');
  if (action.indexOf('Note') !== -1) setNoteStatus(statusMessage, 'error');
}

async function syncOfflineQueue() {
  if (!state.authVerified || !state.email || state.syncingOfflineQueue) return;
  if (!Array.isArray(state.offlineQueue) || !state.offlineQueue.length) return;
  state.syncingOfflineQueue = true;
  const remaining = [];
  for (const item of state.offlineQueue) {
    try {
      const response = await jsonp(item.action, item.params || {});
      if (!response?.ok) throw new Error(response?.message || 'Erreur de synchronisation.');
    } catch (_) {
      remaining.push(item);
    }
  }
  state.offlineQueue = remaining;
  persistOfflineQueue();
  state.syncingOfflineQueue = false;
  if (!remaining.length) {
    if (state.currentBook) {
      setSaveStatus('Synchronisé', 'success');
      setBookmarkStatus('Synchronisé', 'success');
      setNoteStatus('Synchronisé', 'success');
    }
  }
}

function applyReadingComfortClasses() {
  if (!dom.readingSurface) return;
  dom.readingSurface.classList.remove('line-spacing-normal', 'line-spacing-relaxed', 'line-spacing-loose', 'narrow-layout');
  dom.readingSurface.classList.add(`line-spacing-${state.lineSpacingMode || 'normal'}`);
  if (state.narrowLayout) dom.readingSurface.classList.add('narrow-layout');
  document.body.classList.toggle('focus-mode-active', !!state.focusMode && !dom.reader.hidden);
}

function cycleLineSpacing() {
  if (state.mode === 'pdf') {
    showToast("L'interligne s'applique au mode texte uniquement");
    return;
  }
  const order = ['normal', 'relaxed', 'loose'];
  const currentIndex = Math.max(0, order.indexOf(state.lineSpacingMode));
  state.lineSpacingMode = order[(currentIndex + 1) % order.length];
  localStorage.setItem(LS_LINE_SPACING_KEY, state.lineSpacingMode);
  applyReadingComfortClasses();
  updateUiLabels();
  showToast(state.lineSpacingMode === 'normal' ? 'Interligne normal' : (state.lineSpacingMode === 'relaxed' ? 'Interligne moyen' : 'Interligne ample'));
}

function toggleNarrowLayout() {
  if (state.mode === 'pdf') {
    showToast("La largeur s'applique au mode texte uniquement");
    return;
  }
  state.narrowLayout = !state.narrowLayout;
  localStorage.setItem(LS_NARROW_KEY, state.narrowLayout ? '1' : '0');
  applyReadingComfortClasses();
  updateUiLabels();
  showToast(state.narrowLayout ? 'Largeur compacte activée' : 'Largeur standard activée');
}

function toggleFocusMode() {
  state.focusMode = !state.focusMode;
  localStorage.setItem(LS_FOCUS_KEY, state.focusMode ? '1' : '0');
  applyReadingComfortClasses();
  updateUiLabels();
  showToast(state.focusMode ? 'Mode concentration activé' : 'Mode concentration désactivé');
}

function getEffectiveBookStatus(book) {
  const explicitStatus = String(book?.readingStatus || '').trim();
  const visiblePages = Number(book?.visiblePageCount) || Number(book?.totalPages) || 0;
  const currentPage = Number(book?.currentPage) || 0;
  const lastPageVisited = Number(book?.lastPageVisited) || 0;
  const viewedPagesCount = Number(book?.viewedPagesCount) || 0;
  const totalPageViews = Number(book?.totalPageViews) || 0;
  const progressPercent = Number(book?.progressPercent) || 0;
  const hasOpened = !!(book?.lastOpenedAt || book?.firstOpenedAt || book?.lastUpdated || book?.progressLastUpdated || book?.completedAt);
  const hasReadingActivity = hasOpened
    || currentPage > 0
    || lastPageVisited > 0
    || viewedPagesCount > 0
    || totalPageViews > 0
    || progressPercent > 0
    || Number(book?.readingSeconds) > 0
    || Number(book?.sessionCount) > 0
    || Number(book?.bookmarksCount) > 0
    || Number(book?.notesCount) > 0;
  if ((visiblePages > 0 && Math.max(currentPage, lastPageVisited) >= visiblePages) || progressPercent >= 99.5 || !!book?.completedAt || explicitStatus === 'completed') {
    return 'completed';
  }
  if (explicitStatus === 'started') return 'started';
  if (hasReadingActivity) return 'started';
  return 'not_started';
}

function getBookStatusLabel(book) {
  const status = getEffectiveBookStatus(book);
  if (status === 'completed') return 'Terminé';
  if (status === 'started') return 'Commencé';
  return 'Non ouvert';
}

function getBookActivityMeta(book) {
  if (book?.lastOpenedAt) {
    return `Dernière ouverture: ${formatDateTime(book.lastOpenedAt)}`;
  }
  if (book?.firstOpenedAt) {
    return `Première ouverture: ${formatDateTime(book.firstOpenedAt)}`;
  }
  const status = getEffectiveBookStatus(book);
  const visiblePages = Number(book?.visiblePageCount) || Number(book?.totalPages) || 0;
  const currentPage = Number(book?.currentPage) || 0;
  const progressPercent = Number(book?.progressPercent) || 0;
  if (status === 'completed') {
    return visiblePages > 0 ? `Lecture terminée - page ${visiblePages} / ${visiblePages}` : 'Lecture terminée';
  }
  if (status === 'started') {
    if (visiblePages > 0 && currentPage > 0) {
      return `Progression: page ${currentPage} / ${visiblePages}`;
    }
    if (progressPercent > 0) {
      return `Progression: ${Math.round(progressPercent)} %`;
    }
    if (Number(book?.bookmarksCount) > 0 || Number(book?.notesCount) > 0) {
      return 'Lecture commencée';
    }
    return 'Activité de lecture détectée';
  }
  return 'Pas encore ouvert';
}

function formatSessionAverage(seconds) {
  return seconds ? formatReadingDuration(seconds) : '—';
}

function flushCurrentPageJournal() {
  if (!state.authVerified || !state.currentBook || !state.currentPageEnteredAt) return;
  const secondsSpent = Math.max(0, Math.round((Date.now() - state.currentPageEnteredAt) / 1000));
  const sourcePage = getSourcePageForDisplayPage(state.currentPage);
  if (!sourcePage || secondsSpent < 2) {
    state.currentPageEnteredAt = Date.now();
    return;
  }
  const params = { email: state.email, bookId: state.currentBook.bookId, page: sourcePage, secondsSpent };
  jsonp('trackPageView', params).catch(() => queueOfflineAction('trackPageView', params));
  state.currentPageEnteredAt = Date.now();
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
    const optimisticNoteId = state.editingNoteId || `local-${Date.now()}`;
    const existingIndex = state.notes.findIndex((item) => item.noteId === optimisticNoteId);
    const optimistic = { page: state.currentPage, noteId: optimisticNoteId, noteText, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    if (existingIndex >= 0) state.notes.splice(existingIndex, 1, optimistic); else state.notes.unshift(optimistic);
    renderNotes();
    resetNoteEditor();
    queueOfflineAction('saveNote', { email: state.email, bookId: state.currentBook.bookId, page: state.currentPage, noteId: state.editingNoteId, noteText }, 'Note enregistrée localement.');
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
    state.notes = state.notes.filter((item) => item.noteId !== noteId);
    renderNotes();
    queueOfflineAction('deleteNote', { email: state.email, bookId: state.currentBook.bookId, noteId }, 'Suppression de note en attente.');
  }
}

// ════════════════════════════════════════
// RENDU BIBLIOTHÈQUE
// ════════════════════════════════════════
function getBookAssetVersion(book = null) {
  const raw = String(book?.lastPublishedAt || book?.lastUpdated || book?.progressLastUpdated || "").trim();
  if (!raw) return "";
  const parsed = Date.parse(raw);
  return Number.isFinite(parsed) && parsed > 0 ? String(parsed) : raw.replace(/[^a-zA-Z0-9_.-]+/g, "-");
}

function computePublicAssetUrl(path, book = null, tag = "") {
  if (!path) return "";
  const normalizedPath = `./${String(path).replace(/^\.\//, "").replace(/^\//, "")}`;
  const params = new URLSearchParams();
  const version = getBookAssetVersion(book);
  if (version) params.set("v", version);
  if (tag) params.set("t", String(tag));
  const query = params.toString();
  return query ? `${normalizedPath}?${query}` : normalizedPath;
}

function getBookAssetCacheKey(book, kind = "json") {
  if (!book) return "";
  const basePath = kind === "pdf" ? String(book.pdfPath || "") : String(book.jsonPath || "");
  const version = getBookAssetVersion(book);
  return `${String(book.bookId || basePath || kind)}::${kind}::${version || "noversion"}`;
}

function clearBookRuntimeCache(bookOrId) {
  const targetId = typeof bookOrId === "string" ? String(bookOrId) : String(bookOrId?.bookId || "");
  if (!targetId) return;
  for (const key of Array.from(runtimeCache.textDocs.keys())) {
    if (key.startsWith(`${targetId}::json::`)) runtimeCache.textDocs.delete(key);
  }
  for (const key of Array.from(runtimeCache.pdfDocs.keys())) {
    if (key.startsWith(`${targetId}::pdf::`)) runtimeCache.pdfDocs.delete(key);
  }
  if (state.currentBook?.bookId === targetId) {
    state.pdfDoc = null;
  }
}

function syncRuntimeCacheWithBookList(previousBooks = [], nextBooks = []) {
  const previousMap = new Map((Array.isArray(previousBooks) ? previousBooks : []).map((book) => [String(book.bookId || ""), book]).filter(([id]) => id));
  const nextMap = new Map((Array.isArray(nextBooks) ? nextBooks : []).map((book) => [String(book.bookId || ""), book]).filter(([id]) => id));

  for (const [bookId, previousBook] of previousMap.entries()) {
    const nextBook = nextMap.get(bookId);
    if (!nextBook) {
      clearBookRuntimeCache(bookId);
      continue;
    }
    const changed = String(previousBook.jsonPath || "") !== String(nextBook.jsonPath || "")
      || String(previousBook.pdfPath || "") !== String(nextBook.pdfPath || "")
      || String(previousBook.coverPath || "") !== String(nextBook.coverPath || "")
      || getBookAssetVersion(previousBook) !== getBookAssetVersion(nextBook);
    if (changed) clearBookRuntimeCache(bookId);
  }

  for (const [bookId] of nextMap.entries()) {
    if (!previousMap.has(bookId)) clearBookRuntimeCache(bookId);
  }
}

function coverHtml(book, className = "book-cover") {
  if (book.coverPath) {
    return `<div class="${className}"><img src="${escapeHtml(computePublicAssetUrl(book.coverPath, book, "cover"))}" alt="Couverture de ${escapeHtml(book.title)}" loading="lazy"></div>`;
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
        <div class="library-book-stats">
          <span class="library-stat-chip status-${escapeHtml(getEffectiveBookStatus(book))}">${escapeHtml(getBookStatusLabel(book))}</span>
          ${Number(book.progressPercent) ? `<span class="library-stat-chip">${Math.round(Number(book.progressPercent) || 0)} %</span>` : ''}
          ${Number(book.bookmarksCount) ? `<span class="library-stat-chip">${Number(book.bookmarksCount)} signet(s)</span>` : ''}
          ${Number(book.notesCount) ? `<span class="library-stat-chip">${Number(book.notesCount)} note(s)</span>` : ''}
        </div>
        <p class="book-meta">${escapeHtml(getBookActivityMeta(book))}</p>
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
            <button class="ghost-btn admin-delete-btn${state.deleteBusyBookId === book.bookId ? " is-loading" : ""}" type="button" data-delete-book="${escapeHtml(book.bookId)}"${state.deleteBusyBookId === book.bookId ? " disabled aria-busy=\"true\"" : ""}>
              ${state.deleteBusyBookId === book.bookId ? `<span class="inline-spinner" aria-hidden="true"></span><span>Suppression…</span>` : "Supprimer"}
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
  if (!book?.jsonPath) return null;
  const cacheKey = getBookAssetCacheKey(book, "json");
  if (runtimeCache.textDocs.has(cacheKey)) return runtimeCache.textDocs.get(cacheKey);
  const response = await fetch(computePublicAssetUrl(book.jsonPath, book, "json"), { cache: "no-store" });
  if (!response.ok) return null;
  const data = await response.json();
  runtimeCache.textDocs.set(cacheKey, data);
  return data;
}

async function loadPdfDocument(book) {
  if (state.pdfDoc && state.currentBook?.bookId === book.bookId) return state.pdfDoc;
  const cacheKey = getBookAssetCacheKey(book, "pdf");
  if (runtimeCache.pdfDocs.has(cacheKey)) {
    state.pdfDoc = runtimeCache.pdfDocs.get(cacheKey);
    return state.pdfDoc;
  }
  const pdfUrl = computePublicAssetUrl(book.pdfPath, book, "pdf");
  const loadingTask = pdfjsLib.getDocument({
    url: pdfUrl,
    disableAutoFetch: true,
    disableStream: false,
    rangeChunkSize: 262144,
  });
  state.pdfDoc = await loadingTask.promise;
  runtimeCache.pdfDocs.set(cacheKey, state.pdfDoc);
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
  applyReadingComfortClasses();
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
  if (dom.lineSpacingBtn) dom.lineSpacingBtn.textContent = state.lineSpacingMode === 'normal' ? 'Interligne normal' : (state.lineSpacingMode === 'relaxed' ? 'Interligne moyen' : 'Interligne ample');
  if (dom.widthToggleBtn) dom.widthToggleBtn.textContent = state.narrowLayout ? 'Largeur compacte' : 'Largeur standard';
  if (dom.focusModeBtn) dom.focusModeBtn.textContent = state.focusMode ? 'Mode concentration : ON' : 'Mode concentration';
  dom.progressBarToggleBtn.textContent = state.showProgressBar ? "Masquer progression" : "Barre de progression";
  dom.docLabel.textContent = state.currentBook?.title || "Document";
  dom.prevBtn.disabled = state.currentPage <= 1;
  dom.nextBtn.disabled = state.currentPage >= total;

  // PDF controls visibility
  const pdfAllowed = !!state.currentBook?.pdfAllowed;
  dom.modeToggleBtn.hidden = !pdfAllowed;
  dom.fitBtn.hidden = !pdfAllowed || state.mode === "text";
  dom.fontSizeBtn.hidden = state.mode === "pdf";
  if (dom.lineSpacingBtn) dom.lineSpacingBtn.hidden = state.mode === "pdf";
  if (dom.widthToggleBtn) dom.widthToggleBtn.hidden = state.mode === "pdf";

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

function isCenteredTextBlock(text = "") {
  return /^[A-ZÉÈÀÂÊÎÔÛÇ][A-ZÉÈÀÂÊÎÔÛÇ''\s]{4,}$/.test(text) && text.length <= 60;
}

function looksLikeContinuationStart(text = "") {
  return /^[a-zàâäçéèêëîïôöùûüÿæœ]/.test(text)
    || /^(de|du|des|la|le|les|un|une|et|ou|où|que|qui|dont|mais|car|or|ni|donc|pour|par|sur|sous|dans|avec|sans|ce|cet|cette|ces|sa|son|ses|leur|leurs|au|aux|à|en)\b/i.test(text);
}

function stripHtmlToText(html = "") {
  return String(html || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function parseStructuredBlocksFromHtml(html = "") {
  const blocks = [];
  const source = String(html || "");
  const paragraphPattern = /<p(?:\s+class="([^"]*)")?>([\s\S]*?)<\/p>/gi;
  let match = null;
  while ((match = paragraphPattern.exec(source))) {
    const className = String(match[1] || "");
    const text = stripHtmlToText(match[2]);
    if (!text) continue;
    blocks.push({
      type: /\bdialogue\b/.test(className) ? "dialogue" : (/\bcentered\b/.test(className) ? "centered" : "paragraph"),
      text,
    });
  }
  return blocks;
}

function renderStructuredBlocksHtml(blocks = []) {
  return (Array.isArray(blocks) ? blocks : []).map((block) => {
    if (block.type === "dialogue") return `<p class="dialogue">${escapeHtml(block.text)}</p>`;
    if (block.type === "centered") return `<p class="centered">${escapeHtml(block.text)}</p>`;
    return `<p class="book-paragraph">${escapeHtml(block.text)}</p>`;
  }).join("");
}

function finalizeStructuredBlocks(blocks = [], fallbackText = "") {
  const filteredBlocks = (Array.isArray(blocks) ? blocks : []).filter((block) => String(block?.text || "").trim());
  const plainText = filteredBlocks.map((block) => String(block.text || "").trim()).join("\n\n").trim();
  const charCount = plainText.replace(/\s+/g, "").length;
  if (!filteredBlocks.length || charCount < 18) {
    return { html: "", text: plainText || String(fallbackText || ""), charCount, renderMode: "pdf" };
  }
  return { html: renderStructuredBlocksHtml(filteredBlocks), text: plainText, charCount, renderMode: "text" };
}

function shouldStartNewParagraphFromLines(previousLine = "", currentLine = "", paragraphText = "", paragraphLineCount = 0) {
  const prev = String(previousLine || "").trim();
  const current = String(currentLine || "").trim();
  const paragraph = String(paragraphText || "").trim();
  if (!prev || !current) return false;
  if (looksLikeContinuationStart(current)) return false;
  if (!/[.!?…»”"]$/.test(prev)) return false;
  if (!/^[«"(\[]?[A-ZÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸÆŒ]/.test(current)) return false;
  const paragraphLength = paragraph.replace(/\s+/g, " ").length;
  if (paragraphLineCount >= 3 && paragraphLength >= 90) return true;
  if (paragraphLineCount >= 2 && paragraphLength >= 120 && current.length >= 28) return true;
  if (paragraphLength >= 170 && current.length >= 40) return true;
  return false;
}

function rebuildStructuredPageFromLineBlocks(lineBlocks = [], fallbackText = "") {
  const blocks = [];
  let paragraphLines = [];
  const pushParagraph = () => {
    if (!paragraphLines.length) return;
    blocks.push({
      type: "paragraph",
      text: paragraphLines.join(" ").replace(/\s+([,.;:!?])/g, "$1").trim(),
    });
    paragraphLines = [];
  };

  for (const lineBlock of Array.isArray(lineBlocks) ? lineBlocks : []) {
    const type = String(lineBlock?.type || "paragraph");
    const text = String(lineBlock?.text || "").trim();
    if (!text) continue;
    if (lineBlock?.forceBreakBefore) pushParagraph();

    if (type === "dialogue") {
      pushParagraph();
      blocks.push({ type: "dialogue", text: text.replace(/^[-–—]\s*/, "- ") });
      continue;
    }

    if (type === "centered") {
      pushParagraph();
      blocks.push({ type: "centered", text });
      continue;
    }

    const lastBlock = blocks[blocks.length - 1] || null;
    if (!paragraphLines.length && lastBlock && lastBlock.type === "dialogue" && !/[.!?…»”"]$/.test(lastBlock.text)) {
      lastBlock.text = `${lastBlock.text} ${text}`.replace(/\s+([,.;:!?])/g, "$1").trim();
      continue;
    }

    if (paragraphLines.length) {
      const previousLine = paragraphLines[paragraphLines.length - 1];
      const paragraphText = paragraphLines.join(" ");
      if (shouldStartNewParagraphFromLines(previousLine, text, paragraphText, paragraphLines.length)) {
        pushParagraph();
      }
    }
    paragraphLines.push(text);
  }

  pushParagraph();
  return finalizeStructuredBlocks(blocks, fallbackText);
}

function looksPoorlyReflowedBlockSequence(blocks = []) {
  const proseBlocks = (Array.isArray(blocks) ? blocks : []).filter((block) => String(block?.type || "paragraph") === "paragraph");
  if (proseBlocks.length < 4) return false;
  const texts = proseBlocks.map((block) => String(block.text || "").trim()).filter(Boolean);
  if (texts.length < 4) return false;
  const shortBlocks = texts.filter((text) => text.length < 95).length;
  const weakEndings = texts.filter((text) => !/[.!?…»”"]$/.test(text)).length;
  const continuationStarts = texts.filter((text) => looksLikeContinuationStart(text)).length;
  const tinyBlocks = texts.filter((text) => text.length <= 24).length;
  return shortBlocks >= Math.max(3, Math.ceil(texts.length * 0.55))
    && (weakEndings >= Math.max(2, Math.ceil(texts.length * 0.3)) || continuationStarts >= 2 || tinyBlocks >= 1);
}

function normalizeRenderableTextPage(page = null) {
  if (!page || page.renderMode === "pdf") return page;
  const htmlBlocks = parseStructuredBlocksFromHtml(page.html || "");
  if (!htmlBlocks.length) return page;
  if (!looksPoorlyReflowedBlockSequence(htmlBlocks)) {
    return {
      renderMode: "text",
      html: renderStructuredBlocksHtml(htmlBlocks),
      text: htmlBlocks.map((block) => block.text).join("\n\n"),
    };
  }
  return rebuildStructuredPageFromLineBlocks(htmlBlocks, page.text || "");
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
  const lineBlocks = source.split(/\n/).map((line) => String(line || "").trim()).filter(Boolean).map((line) => {
    if (/^[-–—]\s*/.test(line)) return { type: "dialogue", text: line.replace(/^[-–—]\s*/, "- ") };
    if (isCenteredTextBlock(line)) return { type: "centered", text: line };
    return { type: "paragraph", text: line };
  });
  return rebuildStructuredPageFromLineBlocks(lineBlocks, source);
}

function getRenderableTextPage(pageNumber) {
  const sourcePageNumber = getSourcePageNumber(pageNumber);
  const page = state.textDoc?.pages?.[sourcePageNumber - 1];
  if (!page) return null;
  if (page.renderMode === "pdf") return { renderMode: "pdf" };
  const structuredPage = page.html ? { renderMode: "text", html: page.html, text: page.text || "" } : buildStructuredPageFromPlainText(page.text || "");
  return normalizeRenderableTextPage(structuredPage);
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
  state.currentPageEnteredAt = Date.now();
}

async function goToPage(pageNumber, { save = true, reason = "nav" } = {}) {
  if (!state.totalPages) return;
  const next = Math.max(1, Math.min(state.totalPages, Number(pageNumber) || 1));
  if (next === state.currentPage && save) return;
  const previous = state.currentPage;
  flushCurrentPageJournal();
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
  const defaultLoadingMessage = "Chargement du livre en cours. Veuillez patienter.";
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

  setSaveStatus("");
  switchScreen("reader");
  toggleMenu(false);
  setBookLoading(true, loadingMessage);
  state.currentPageEnteredAt = 0;

  try {
    const progressPromise = fetchProgress(resolvedBook.bookId).catch(() => null);
    const textDocPromise = loadTextJson(resolvedBook).catch(() => null);
    const bookmarksPromise = jsonp("listBookmarks", { email: state.email, bookId: resolvedBook.bookId }).catch(() => ({ ok: false }));
    const notesPromise = jsonp("listNotes", { email: state.email, bookId: resolvedBook.bookId }).catch(() => ({ ok: false }));

    const [progress, textDoc] = await Promise.all([progressPromise, textDocPromise]);
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
    startReadingTracking();
    saveCurrentBookState();
    setSaveStatus("Prêt");

    void bookmarksPromise.then((bookmarksResult) => {
      state.bookmarks = bookmarksResult?.ok && Array.isArray(bookmarksResult.bookmarks) ? bookmarksResult.bookmarks : [];
      renderBookmarks();
    });
    void notesPromise.then((notesResult) => {
      state.notes = notesResult?.ok && Array.isArray(notesResult.notes) ? notesResult.notes : [];
      renderNotes();
    });
    void saveProgress({ immediate: true, showError: false, showSuccess: false });
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
  if (!code) {
    setAdminUnlockStatus("Entre le code administrateur.", "error");
    showToast("Entre le code administrateur");
    return;
  }

  dom.unlockAdminBtn.disabled = true;
  dom.unlockAdminBtn.textContent = "Vérification…";
  setAdminUnlockStatus("Vérification du code administrateur…");

  try {
    const response = await jsonp("listBooks", { email: state.email, adminCode: code });
    if (!response?.ok) throw new Error(response?.message || "Code invalide.");
    state.adminUnlocked = true;
    state.adminCode = code;
    state.books = Array.isArray(response.books) ? response.books : [];
    saveBooksCache();
    renderBookList();
    renderAdminBooks();
    applyAdminVisibility();
    setAdminUnlockStatus("Module administrateur déverrouillé.", "success");
    void loadAssignableUsers(true);
  } catch (error) {
    console.error(error);
    state.adminUnlocked = false;
    state.adminCode = "";
    applyAdminVisibility();
    setAdminUnlockStatus(error?.message || "Code administrateur invalide.", "error");
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
  const book = getBookById(bookId);
  if (!book) return;
  const previous = buildBookSnapshot(book);
  const nextPublished = !book.published;
  state.books = state.books.map((item) => item.bookId === bookId ? buildBookSnapshot({ ...item, published: nextPublished }) : item);
  saveBooksCache();
  renderBookList();
  renderAdminBooks();
  try {
    const response = await jsonp("toggleBookPublished", {
      email: state.email, adminCode: state.adminCode,
      bookId, published: nextPublished ? "true" : "false",
    }, { timeoutMs: 30000 });
    if (!response?.ok) throw new Error(response?.message || "Impossible de changer le statut.");
    showToast("Statut mis à jour");
    await refreshBooks({ origin: "admin" });
  } catch (error) {
    console.error(error);
    state.books = state.books.map((item) => item.bookId === bookId ? previous : item);
    saveBooksCache();
    renderBookList();
    renderAdminBooks();
    showToast(error?.message || "Impossible de changer le statut");
  }
}

async function toggleBookPdfAllowed(bookId) {
  if (!canSeeAdminPanel() || !state.adminUnlocked) return;
  const book = getBookById(bookId);
  if (!book) return;
  const previous = buildBookSnapshot(book);
  const nextAllowed = !book.pdfAllowed;
  state.books = state.books.map((item) => item.bookId === bookId ? buildBookSnapshot({ ...item, pdfAllowed: nextAllowed }) : item);
  saveBooksCache();
  renderBookList();
  renderAdminBooks();
  try {
    const response = await jsonp("setPdfAllowed", {
      email: state.email, adminCode: state.adminCode,
      bookId, pdfAllowed: nextAllowed ? "true" : "false",
    }, { timeoutMs: 30000 });
    if (!response?.ok) throw new Error(response?.message || "Impossible de changer l'autorisation PDF.");
    showToast("Autorisation PDF mise à jour");
    void refreshBooks({ origin: "admin" }).catch((error) => { console.error(error); });
  } catch (error) {
    console.error(error);
    state.books = state.books.map((item) => item.bookId === bookId ? previous : item);
    saveBooksCache();
    renderBookList();
    renderAdminBooks();
    showToast(error?.message || "Impossible de modifier l'autorisation PDF");
  }
}


async function deleteBook(bookId) {
  if (!canSeeAdminPanel() || !state.adminUnlocked) return;
  const book = getBookById(bookId);
  if (!book) return;

  const label = book.title || book.bookId || "ce livre";
  const confirmed = window.confirm(`Supprimer définitivement « ${label} » ?

Cette action retirera le livre de la bibliothèque et effacera ses données liées.`);
  if (!confirmed) return;

  const safety = window.prompt(`Confirmation de sécurité

Tape SUPPRIMER pour confirmer la suppression définitive de « ${label} ».`, "");
  if (safety !== "SUPPRIMER") {
    showToast("Suppression annulée");
    return;
  }

  const previousBooks = state.books.map(buildBookSnapshot).filter(Boolean);
  state.deleteBusyBookId = bookId;
  setAdminBooksStatus(`Suppression de « ${label} » en cours…`);
  state.books = state.books.filter((item) => item.bookId !== bookId);
  saveBooksCache();
  renderBookList();
  renderAdminBooks();
  showToast(`Suppression de « ${label} » en cours…`);

  try {
    const response = await jsonp("deleteBook", {
      email: state.email,
      adminCode: state.adminCode,
      bookId,
    }, { timeoutMs: 90000 });
    if (!response?.ok) throw new Error(response?.message || "Impossible de supprimer le livre.");
    if (Array.isArray(response.warnings) && response.warnings.length) {
      console.warn("Avertissements lors de la suppression du livre :", response.warnings);
    }
    clearBookRuntimeCache(bookId);
    setAdminBooksStatus((response.message || "Livre supprimé.") + " Actualisation de la liste…", "success");
    showToast(response.message || "Livre supprimé");
    await refreshBooks({ origin: "admin" });
    setAdminBooksStatus(response.message || "Livre supprimé.", "success");
  } catch (error) {
    console.error(error);
    state.books = previousBooks;
    saveBooksCache();
    renderBookList();
    renderAdminBooks();
    setAdminBooksStatus(error?.message || "Impossible de supprimer le livre.", "error");
    showToast(error?.message || "Impossible de supprimer le livre");
  } finally {
    state.deleteBusyBookId = "";
    if (canSeeAdminPanel()) renderAdminBooks();
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
    if (dom.editBookCoverInput) dom.editBookCoverInput.value = "";
    if (dom.editRemoveCoverInput) dom.editRemoveCoverInput.checked = false;
    renderAssignableUsers("edit");
    renderHiddenPagesSummary(Number(book.totalPages) || 0, book.hiddenPageRanges || "");
    updateEditCoverPreview(book);
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
  const coverFile = dom.editBookCoverInput?.files?.[0] || null;
  const removeCover = !!dom.editRemoveCoverInput?.checked;
  if (!title) { dom.editBookStatus.textContent = "Le titre est requis."; return; }
  if (restrictedAccess && !assignedEmails.length) { dom.editBookStatus.textContent = "Choisis au moins un utilisateur."; return; }
  dom.editBookSaveBtn.disabled = true;
  dom.editBookStatus.textContent = coverFile || removeCover ? "Téléversement et enregistrement…" : "Enregistrement…";
  renderHiddenPagesSummary(totalPages, hiddenPageRanges);

  const optimisticBook = buildBookSnapshot({
    ...(currentBook || {}),
    bookId,
    title,
    author,
    description,
    hiddenPageRanges,
    restrictedAccess,
    assignedEmails,
    coverPath: removeCover ? "" : (currentBook?.coverPath || ""),
  });
  const previousBooks = state.books.map(buildBookSnapshot).filter(Boolean);

  try {
    let response;
    if (coverFile || removeCover) {
      const payload = {
        action: "updateBook",
        email: state.email,
        adminCode: state.adminCode,
        bookId,
        title,
        author,
        description,
        hiddenPageRanges,
        restrictedAccess: restrictedAccess ? "true" : "false",
        assignedEmails: assignedEmails.join(","),
        removeCover: removeCover ? "true" : "false",
      };
      if (coverFile) {
        payload.coverBase64 = arrayBufferToBase64(await coverFile.arrayBuffer());
        payload.coverExt = detectCoverExtension(coverFile);
      }
      response = await postAdminAction(payload);
    } else {
      response = await jsonp("updateBook", {
        email: state.email, adminCode: state.adminCode,
        bookId, title, author, description, hiddenPageRanges,
        restrictedAccess: restrictedAccess ? "true" : "false",
        assignedEmails: assignedEmails.join(","),
      }, { timeoutMs: 45000 });
    }
    if (!response?.ok) throw new Error(response?.message || "Impossible de modifier le livre.");
    const nextBook = response.book?.bookId ? buildBookSnapshot(response.book) : optimisticBook;
    state.books = state.books.map((book) => (book.bookId === nextBook.bookId ? nextBook : book));
    clearBookRuntimeCache(nextBook.bookId);
    saveBooksCache();
    renderBookList();
    renderAdminBooks();
    renderHiddenPagesSummary(Number(nextBook.totalPages) || totalPages, nextBook.hiddenPageRanges || hiddenPageRanges);
    updateEditCoverPreview(nextBook);
    dom.editBookStatus.textContent = response.message || "Livre modifié.";
    setAdminBooksStatus(response.message || "Livre modifié.", "success");
    showToast(response.message || "Livre modifié");
    window.setTimeout(() => {
      dom.editBookModal.hidden = true;
      dom.editBookStatus.textContent = "";
      if (dom.editHiddenPagesSummary) dom.editHiddenPagesSummary.innerHTML = "";
      if (dom.editBookCoverInput) dom.editBookCoverInput.value = "";
      if (dom.editRemoveCoverInput) dom.editRemoveCoverInput.checked = false;
      revokePendingEditCoverObjectUrl();
    }, 500);
    void refreshBooks({ origin: "admin" }).catch((error) => { console.error(error); });
  } catch (error) {
    console.error(error);
    state.books = previousBooks;
    saveBooksCache();
    renderBookList();
    renderAdminBooks();
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
  let prevHeight = 0;
  for (const word of words) {
    const text = String(word.text || "").trim();
    if (!text) continue;
    const left = Number(word.x) || 0;
    const height = Number(word.height) || 0;
    if (!parts.length) {
      parts.push(text);
    } else {
      const gap = prevRight === null ? 0 : left - prevRight;
      const previousText = parts[parts.length - 1] || "";
      const noLeadSpace = /^[,.;:!?%)\]»]/.test(text);
      const noTrailSpace = /[(\[«]$/.test(previousText);
      const decorativeInitialJoin = /^[A-ZÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸÆŒ]$/.test(previousText)
        && /^[a-zàâäçéèêëîïôöùûüÿæœ]/.test(text)
        && gap <= Math.max(prevHeight * 0.95, height * 0.95, 8);
      if (noLeadSpace || noTrailSpace || gap < 1.5 || decorativeInitialJoin) parts[parts.length - 1] += text;
      else parts.push(text);
    }
    prevRight = (Number(word.x) || 0) + (Number(word.width) || 0);
    prevHeight = height;
  }
  return normalizeLineText(parts);
}

function mergeDecorativeInitialLines(lines) {
  if (!Array.isArray(lines) || lines.length < 2) return Array.isArray(lines) ? lines.slice() : [];
  const merged = [];
  for (let index = 0; index < lines.length; index += 1) {
    const current = lines[index];
    const next = lines[index + 1];
    const currentText = String(current?.text || "").trim();
    const nextText = String(next?.text || "").trim();
    const currentHeight = Number(current?.height) || 0;
    const nextHeight = Number(next?.height) || 0;
    const currentTop = Number(current?.top ?? current?.y ?? 0);
    const currentBottom = Number(current?.bottom ?? current?.y ?? 0);
    const nextTop = Number(next?.top ?? next?.y ?? 0);
    const nextBottom = Number(next?.bottom ?? next?.y ?? 0);
    const currentLeft = Number(current?.left) || 0;
    const nextLeft = Number(next?.left) || 0;
    const currentRight = Number(current?.right);

    const currentIsInitial = /^[A-ZÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸÆŒ]$/.test(currentText);
    const nextStartsLowercase = /^[a-zàâäçéèêëîïôöùûüÿæœ]/.test(nextText);
    const significantlyTaller = currentHeight > nextHeight * 1.45;
    const verticalOverlap = Math.min(currentBottom, nextBottom) - Math.max(currentTop, nextTop);
    const minHeight = Math.min(Math.max(0, currentBottom - currentTop), Math.max(0, nextBottom - nextTop));
    const sameParagraphBand = verticalOverlap >= Math.max(1.2, minHeight * 0.16)
      || nextTop <= currentBottom + Math.max(currentHeight * 0.65, nextHeight * 0.9, 10);
    const nextBeginsToTheRight = nextLeft >= currentLeft + Math.max(currentHeight * 0.14, 2);
    const gapToNext = Number.isFinite(currentRight) ? nextLeft - currentRight : 0;
    const visuallyClose = !Number.isFinite(currentRight) || gapToNext <= Math.max(currentHeight * 0.9, nextHeight * 2.4, 18);

    if (currentIsInitial && nextStartsLowercase && significantlyTaller && sameParagraphBand && nextBeginsToTheRight && visuallyClose) {
      merged.push({
        text: currentText + nextText,
        y: Math.max(Number(current?.y) || 0, Number(next?.y) || 0),
        top: Math.min(currentTop, nextTop),
        bottom: Math.max(currentBottom, nextBottom),
        height: Math.max(currentHeight, nextHeight),
        left: Math.min(currentLeft, nextLeft),
        right: Number.isFinite(Number(next?.right)) ? Number(next.right) : nextLeft,
      });
      index += 1;
      continue;
    }

    merged.push(current);
  }
  return merged;
}

function extractStructuredPage(items) {
  if (!Array.isArray(items) || !items.length) return { html: "", text: "", charCount: 0, renderMode: "pdf" };
  const entries = items
    .map((item) => {
      const x = Number(item.transform?.[4] || 0);
      const y = Number(item.transform?.[5] || 0);
      const width = Number(item.width || 0);
      const height = Number(item.height || 0);
      return {
        text: String(item.str || ""),
        x,
        y,
        width,
        height,
        right: x + width,
        top: y - height,
        bottom: y,
      };
    })
    .filter((item) => item.text && item.text.trim());
  if (!entries.length) return { html: "", text: "", charCount: 0, renderMode: "pdf" };

  const sorted = entries.sort((a, b) => Math.abs(b.y - a.y) > 3 ? b.y - a.y : a.x - b.x);
  const lines = [];
  let currentWords = [];
  let currentTop = null;
  let currentBottom = null;
  let currentY = null;
  let currentHeight = 0;

  const flushLine = () => {
    if (!currentWords.length) return;
    const ordered = currentWords.slice().sort((a, b) => a.x - b.x);
    lines.push({
      text: buildLineFromWords(ordered),
      y: currentY,
      top: currentTop,
      bottom: currentBottom,
      height: currentHeight,
      left: ordered[0]?.x || 0,
      right: ordered[ordered.length - 1]?.right || ((ordered[ordered.length - 1]?.x || 0) + (ordered[ordered.length - 1]?.width || 0)),
    });
    currentWords = [];
    currentTop = null;
    currentBottom = null;
    currentY = null;
    currentHeight = 0;
  };

  for (const entry of sorted) {
    if (!currentWords.length) {
      currentWords = [entry];
      currentTop = entry.top;
      currentBottom = entry.bottom;
      currentY = entry.y;
      currentHeight = entry.height || 10;
      continue;
    }

    const overlap = Math.min(currentBottom, entry.bottom) - Math.max(currentTop, entry.top);
    const bandHeight = Math.max(0, currentBottom - currentTop);
    const entryHeight = Math.max(0, entry.bottom - entry.top);
    const minHeight = Math.min(bandHeight || currentHeight || 0, entryHeight || entry.height || 0);
    const currentMid = ((currentTop || 0) + (currentBottom || 0)) / 2;
    const entryMid = ((entry.top || 0) + (entry.bottom || 0)) / 2;
    const midpointDistance = Math.abs(entryMid - currentMid);
    const sameVisualLine = overlap >= Math.max(1.2, minHeight * 0.18)
      || midpointDistance <= Math.max(3.4, Math.max(currentHeight || 0, entry.height || 0) * 0.58);

    if (sameVisualLine) {
      currentWords.push(entry);
      currentTop = Math.min(currentTop, entry.top);
      currentBottom = Math.max(currentBottom, entry.bottom);
      currentY = Math.max(currentY, entry.y);
      currentHeight = Math.max(currentHeight, entry.height || 10);
    } else {
      flushLine();
      currentWords = [entry];
      currentTop = entry.top;
      currentBottom = entry.bottom;
      currentY = entry.y;
      currentHeight = entry.height || 10;
    }
  }
  flushLine();

  const filteredLines = mergeDecorativeInitialLines(
    lines.map((line) => ({ ...line, text: String(line.text || "").trim() })).filter((line) => line.text)
  );
  const avgH = filteredLines.reduce((sum, line) => sum + (line.height || 0), 0) / Math.max(1, filteredLines.length);
  const leftVals = filteredLines.map((line) => line.left).sort((a, b) => a - b);
  const baseLeft = leftVals[Math.floor(leftVals.length * 0.2)] || 0;

  const lineBlocks = [];
  let prevLine = null;
  for (const line of filteredLines) {
    const text = String(line.text || "").trim();
    if (!text) continue;
    const indent = line.left - baseLeft;
    const gap = prevLine ? Math.abs((Number(prevLine?.bottom ?? prevLine?.y ?? 0)) - (Number(line?.top ?? line?.y ?? 0))) : 0;
    const strongBreak = prevLine && gap > Math.max(avgH * 2.05, 22);
    const indentBreak = prevLine && indent > Math.max(avgH * 1.85, 24) && gap > Math.max(avgH * 0.65, 8);

    lineBlocks.push({
      type: /^[-–—]\s*/.test(text) ? "dialogue" : (isCenteredTextBlock(text) ? "centered" : "paragraph"),
      text: /^[-–—]\s*/.test(text) ? text.replace(/^[-–—]\s*/, "- ") : text,
      forceBreakBefore: !!(strongBreak || indentBreak),
    });
    prevLine = line;
  }

  return rebuildStructuredPageFromLineBlocks(lineBlocks);
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
        clearBookRuntimeCache(bookId);
        await refreshBooks({ origin: "admin" });
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
      clearBookRuntimeCache(bookId);
      await refreshBooks({ origin: "admin" });
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
  await openBook(book, {
    preferredPage: Number(saved.page) || 1,
    loadingMessage: "Chargement du livre en cours. Veuillez patienter.",
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
  const readerLoadingMessage = "Chargement du livre en cours. Veuillez patienter.";
  const cachedBooks = readBooksCache();
  const savedBook = buildBookSnapshot(savedBookState?.book);

  if (wantsDirectRestore) {
    switchScreen("reader");
    toggleMenu(false);
    setBookLoading(true, readerLoadingMessage);
    setSaveStatus("Chargement...");

    if (cachedBooks?.books?.length) {
      state.books = cachedBooks.books;
      renderBookList();
      renderAdminBooks();
    } else if (savedBook) {
      state.books = [savedBook];
      renderBookList();
      renderAdminBooks();
    }

    if (state.books.length) {
      try {
        const restored = await maybeRestoreCurrentBook(savedBookState);
        if (restored) {
          void refreshBooks().catch((error) => {
            console.error(error);
          });
          void syncOfflineQueue();
          return;
        }
      } catch (error) {
        if (!fromRestore) throw error;
        showToast("Impossible de rouvrir le dernier livre");
      } finally {
        if (!state.currentBook) setBookLoading(false);
      }
    }
  } else {
    switchScreen("library");
    renderLibraryLoadingState(libraryLoadingMessage);
  }

  let loadedFromCache = false;
  try {
    await refreshBooks();
  } catch (error) {
    if (!fromRestore && !wantsDirectRestore) {
      throw error;
    }
    if (cachedBooks?.books?.length) {
      state.books = cachedBooks.books;
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
      if (restored) {
        void syncOfflineQueue();
        return;
      }
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

  void syncOfflineQueue();
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
    state.adminUnlocked = false;
    state.adminCode = "";
    setAdminUnlockStatus("");
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
    state.adminUnlocked = false;
    state.adminCode = "";
    setAdminUnlockStatus("");
    state.userProfile = {
      firstName: normalizePersonName(response.profile?.firstName || ""),
      lastName: normalizePersonName(response.profile?.lastName || ""),
    };

    if (dom.rememberMeInput.checked) {
      localStorage.setItem(LS_EMAIL_KEY, email);
    } else {
      localStorage.removeItem(LS_EMAIL_KEY);
    }

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
  state.deferredInstallPrompt = null;

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    state.deferredInstallPrompt = e;
    if (!localStorage.getItem(LS_INSTALL_KEY) && dom.installBanner) {
      dom.installBanner.hidden = false;
      if (dom.installBannerText) dom.installBannerText.textContent = "Installez l'application sur votre écran d'accueil";
      if (dom.installBannerBtn) dom.installBannerBtn.hidden = false;
    }
    updateInstallShortcutVisibility();
  });

  on(dom.installBannerBtn, "click", async () => {
    if (state.deferredInstallPrompt) {
      const promptEvent = state.deferredInstallPrompt;
      state.deferredInstallPrompt = null;
      promptEvent.prompt();
      try { await promptEvent.userChoice; } catch (_) {}
    }
    if (dom.installBanner) dom.installBanner.hidden = true;
    localStorage.setItem(LS_INSTALL_KEY, "1");
    updateInstallShortcutVisibility();
  });

  on(dom.installBannerDismiss, "click", () => {
    if (dom.installBanner) dom.installBanner.hidden = true;
    localStorage.setItem(isIOSDevice() ? LS_IOS_INSTALL_KEY : LS_INSTALL_KEY, "1");
    updateInstallShortcutVisibility();
  });

  if (isIOSDevice() && !isStandaloneMode() && !localStorage.getItem(LS_IOS_INSTALL_KEY)) {
    showManualInstallHint();
  }

  updateInstallShortcutVisibility();
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
  on(dom.libraryInstallBtn, "click", triggerInstallShortcut);
  on(dom.readerInstallBtn, "click", triggerInstallShortcut);
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
    try { await refreshBooks({ showFeedback: true, origin: "library" }); }
    catch (e) { console.error(e); showToast(e.message || "Impossible d'actualiser"); }
  });

  // Lecteur — retour
  on(dom.backToLibraryBtn, "click", async () => {
    toggleMenu(false);
    setBookLoading(true, "Chargement en cours. Veuillez patienter.");
    try {
      stopReadingTracking();
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
  on(dom.lineSpacingBtn, "click", cycleLineSpacing);
  on(dom.widthToggleBtn, "click", toggleNarrowLayout);
  on(dom.focusModeBtn, "click", toggleFocusMode);
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
  on(dom.reloadAdminBooksBtn, "click", () => refreshBooks({ showFeedback: true, origin: "admin" }).catch((error) => {
    console.error(error);
    showToast(error.message || "Impossible d'actualiser la liste des livres");
  }));
  on(dom.addUsersBtn, "click", addUsersInBulk);
  on(dom.studentCheckBtn, "click", openReadingCheckModal);
  on(dom.readingCheckCloseBtn, "click", closeReadingCheckModal);
  on(dom.readingCheckStudentTabBtn, "click", () => setReadingCheckViewMode("student"));
  on(dom.readingCheckOverviewTabBtn, "click", () => setReadingCheckViewMode("overview"));
  on(dom.readingCheckModal, "click", (e) => { if (e.target === dom.readingCheckModal) closeReadingCheckModal(); });
  on(dom.readingCheckSearchInput, "input", refreshReadingCheckAfterFilterChange);
  on(dom.readingCheckSortSelect, "change", refreshReadingCheckAfterFilterChange);
  on(dom.readingCheckOverviewBookSelect, "change", refreshReadingCheckAfterFilterChange);
  on(dom.readingCheckGlobalFilterSelect, "change", refreshReadingCheckAfterFilterChange);
  on(dom.readingCheckShowExternalInput, "change", refreshReadingCheckAfterFilterChange);
  on(dom.readingCheckDetails, "change", (e) => {
    const input = e.target.closest("[data-reading-check-book-filter]");
    if (!input) return;
    const key = String(input.dataset.readingCheckBookFilter || "");
    const next = new Set((Array.isArray(state.readingCheckBookFilters) ? state.readingCheckBookFilters : []).map(String));
    if (input.checked) next.add(key);
    else next.delete(key);
    state.readingCheckBookFilters = [...next];
    renderReadingCheckDetails();
  });
  on(dom.readingCheckUserList, "click", (e) => {
    const overviewBtn = e.target.closest("[data-reading-check-overview-email]");
    if (overviewBtn) {
      state.selectedReadingCheckOverviewEmail = overviewBtn.dataset.readingCheckOverviewEmail;
      renderReadingCheckUserList();
      renderReadingCheckDetails();
      resetReadingCheckDetailScroll();
      scrollActiveReadingCheckUserIntoView();
      return;
    }
    const btn = e.target.closest("[data-reading-check-email]");
    if (!btn) return;
    void loadStudentReadingOverview(btn.dataset.readingCheckEmail);
  });
  on(dom.bookReviewCloseBtn, "click", closeBookReviewModal);
  on(dom.bookReviewModal, "click", (e) => { if (e.target === dom.bookReviewModal) closeBookReviewModal(); });
  on(dom.bookReviewSearchInput, "input", () => {
    renderBookReviewUserList();
    const firstUser = getFilteredBookReviewUsers()[0];
    if (state.selectedBookReviewEmail && !getFilteredBookReviewUsers().some((user) => user.email === state.selectedBookReviewEmail)) {
      state.selectedBookReviewEmail = firstUser ? firstUser.email : "";
    }
    renderBookReviewUserList();
    renderBookReviewDetails();
  });
  on(dom.bookReviewSortSelect, "change", () => { renderBookReviewUserList(); renderBookReviewDetails(); });
  on(dom.bookReviewFilterSelect, "change", () => {
    const firstUser = getFilteredBookReviewUsers()[0];
    if (!getFilteredBookReviewUsers().some((user) => user.email === state.selectedBookReviewEmail)) {
      state.selectedBookReviewEmail = firstUser ? firstUser.email : "";
    }
    renderBookReviewUserList();
    renderBookReviewDetails();
  });
  on(dom.bookReviewShowExternalInput, "change", () => {
    const firstUser = getFilteredBookReviewUsers()[0];
    if (!getFilteredBookReviewUsers().some((user) => user.email === state.selectedBookReviewEmail)) {
      state.selectedBookReviewEmail = firstUser ? firstUser.email : "";
    }
    renderBookReviewSummary();
    renderBookReviewUserList();
    renderBookReviewDetails();
  });
  on(dom.bookReviewUserList, "click", (e) => {
    const btn = e.target.closest("[data-book-review-email]");
    if (!btn) return;
    selectBookReviewUser(btn.dataset.bookReviewEmail);
  });
  on(dom.editBookSaveBtn, "click", saveEditBook);
  on(dom.editBookCoverInput, "change", () => {
    if (dom.editRemoveCoverInput && dom.editBookCoverInput?.files?.length) dom.editRemoveCoverInput.checked = false;
    updateEditCoverPreview();
  });
  on(dom.editRemoveCoverInput, "change", () => {
    if (dom.editRemoveCoverInput?.checked && dom.editBookCoverInput) dom.editBookCoverInput.value = "";
    updateEditCoverPreview();
  });
  on(dom.editBookCancelBtn, "click", () => {
    dom.editBookModal.hidden = true;
    dom.editBookStatus.textContent = "";
    if (dom.editHiddenPagesSummary) dom.editHiddenPagesSummary.innerHTML = "";
    if (dom.editBookCoverInput) dom.editBookCoverInput.value = "";
    if (dom.editRemoveCoverInput) dom.editRemoveCoverInput.checked = false;
    revokePendingEditCoverObjectUrl();
  });
  on(dom.editBookModal, "click", (e) => {
    if (e.target === dom.editBookModal) {
      dom.editBookModal.hidden = true;
      dom.editBookStatus.textContent = "";
      if (dom.editHiddenPagesSummary) dom.editHiddenPagesSummary.innerHTML = "";
      if (dom.editBookCoverInput) dom.editBookCoverInput.value = "";
      if (dom.editRemoveCoverInput) dom.editRemoveCoverInput.checked = false;
      revokePendingEditCoverObjectUrl();
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
    const reviewBtn = e.target.closest("[data-review-book]");
    const toggleBtn = e.target.closest("[data-toggle-book]");
    const pdfBtn = e.target.closest("[data-toggle-pdf]");
    const editBtn = e.target.closest("[data-edit-book]");
    const deleteBtn = e.target.closest("[data-delete-book]");
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
    if (reviewBtn) { await openBookReviewModal(reviewBtn.dataset.reviewBook); return; }
    if (toggleBtn) { await toggleBookPublished(toggleBtn.dataset.toggleBook); return; }
    if (pdfBtn) { await toggleBookPdfAllowed(pdfBtn.dataset.togglePdf); return; }
    if (editBtn) { await openEditBookModal(editBtn.dataset.editBook); return; }
    if (deleteBtn) { await deleteBook(deleteBtn.dataset.deleteBook); }
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
      flushCurrentPageJournal();
      stopReadingTracking();
      saveProgress({ immediate: true, showError: false });
    } else if (state.currentBook) {
      state.readingTickMs = Date.now();
    }
  });
  window.addEventListener("pagehide", () => {
    if (state.currentBook) {
      saveCurrentBookState();
      flushCurrentPageJournal();
      stopReadingTracking();
    }
  });
  window.addEventListener("beforeunload", () => {
    if (state.currentBook) {
      saveCurrentBookState();
      flushCurrentPageJournal();
      stopReadingTracking();
      saveProgress({ immediate: true, showError: false });
    }
  });

    window.addEventListener("online", () => { void syncOfflineQueue(); });

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
  loadOfflineQueue();
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
      state.adminUnlocked = false;
      state.adminCode = "";
      setAdminUnlockStatus("");
      await finishLoginFlow({ attemptRestore: true, fromRestore: true });
      void revalidateSessionInBackground();
      void syncOfflineQueue();
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
