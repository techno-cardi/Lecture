import * as pdfjsLib from "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.6.205/build/pdf.min.mjs";

const CONFIG = window.READER_CONFIG || {};
const WORKER_SRC = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${CONFIG.pdfJsVersion || "5.6.205"}/build/pdf.worker.min.mjs`;
pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER_SRC;

const dom = {
  gate: document.getElementById("gate"),
  reader: document.getElementById("reader"),
  loginForm: document.getElementById("loginForm"),
  emailInput: document.getElementById("emailInput"),
  loginBtn: document.getElementById("loginBtn"),
  gateMessage: document.getElementById("gateMessage"),
  docLabel: document.getElementById("docLabel"),
  pageLabel: document.getElementById("pageLabel"),
  saveStatus: document.getElementById("saveStatus"),
  viewerShell: document.getElementById("viewerShell"),
  pdfCanvasWrap: document.getElementById("pdfCanvasWrap"),
  pdfCanvas: document.getElementById("pdfCanvas"),
  prevBtn: document.getElementById("prevBtn"),
  nextBtn: document.getElementById("nextBtn"),
  pageInput: document.getElementById("pageInput"),
  goBtn: document.getElementById("goBtn"),
  zoomOutBtn: document.getElementById("zoomOutBtn"),
  zoomInBtn: document.getElementById("zoomInBtn"),
  fitBtn: document.getElementById("fitBtn"),
  switchUserBtn: document.getElementById("switchUserBtn"),
};

const state = {
  email: "",
  pdfDoc: null,
  totalPages: 0,
  currentPage: 1,
  pageScrollRatio: 0,
  overallProgress: 0,
  zoom: 1,
  isRendering: false,
  pendingPage: null,
  renderToken: 0,
  lastSavedSignature: "",
  saveTimer: null,
  scrollTimer: null,
  pendingRestoreRatio: 0,
  touchStart: null,
};

const LOCAL_LAST_EMAIL_KEY = `pdf-reader:last-email:${CONFIG.documentId || "default"}`;

function setGateMessage(message, kind = "") {
  dom.gateMessage.textContent = message || "";
  dom.gateMessage.className = `message${kind ? ` ${kind}` : ""}`;
}

function setSaveStatus(message, success = false) {
  dom.saveStatus.textContent = message;
  dom.saveStatus.className = success ? "status-success" : "";
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function domainAllowed(email) {
  const domain = email.split("@")[1] || "";
  const allowedDomains = Array.isArray(CONFIG.allowedDomains) ? CONFIG.allowedDomains : [];
  if (!allowedDomains.length) return true;
  return allowedDomains.includes(domain);
}

function blockEasyActions() {
  const shouldBlockEvent = (event) => {
    if (dom.reader.hidden) return false;
    const target = event.target;
    if (target && target.closest && target.closest("#gate")) return false;
    if (target && /^(INPUT|TEXTAREA)$/.test(target.tagName)) return false;
    return true;
  };

  const block = (event) => {
    if (shouldBlockEvent(event)) {
      event.preventDefault();
    }
  };

  document.addEventListener("contextmenu", block);
  document.addEventListener("dragstart", block);
  document.addEventListener("selectstart", block);
  document.addEventListener("copy", block);
  document.addEventListener("cut", block);
  document.addEventListener("paste", block);

  document.addEventListener("keydown", (event) => {
    if (!shouldBlockEvent(event)) return;
    const key = event.key.toLowerCase();
    const ctrlOrMeta = event.ctrlKey || event.metaKey;
    if (
      ctrlOrMeta &&
      ["s", "p", "c", "x", "v", "a", "u"].includes(key)
    ) {
      event.preventDefault();
    }
  });
}

function rememberEmail(email) {
  try {
    localStorage.setItem(LOCAL_LAST_EMAIL_KEY, email);
  } catch (error) {
    console.warn("Impossible d'enregistrer le dernier courriel.", error);
  }
}

function loadRememberedEmail() {
  try {
    return localStorage.getItem(LOCAL_LAST_EMAIL_KEY) || "";
  } catch (error) {
    return "";
  }
}

function clearRememberedEmail() {
  try {
    localStorage.removeItem(LOCAL_LAST_EMAIL_KEY);
  } catch (error) {
    console.warn(error);
  }
}

function jsonp(action, params = {}) {
  return new Promise((resolve, reject) => {
    if (!CONFIG.appsScriptUrl || CONFIG.appsScriptUrl.includes("PASTE_WEB_APP_URL_HERE")) {
      reject(new Error("L'URL du Apps Script n'est pas configurée."));
      return;
    }

    const callbackName = `jsonp_cb_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const url = new URL(CONFIG.appsScriptUrl);
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
      reject(new Error("Délai dépassé lors de l'appel au service."));
    }, 15000);

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

async function authenticateEmail(email) {
  const response = await jsonp("auth", { email });
  if (!response || !response.ok) {
    throw new Error(response?.message || "Accès refusé.");
  }
  return response;
}

async function loadProgress(email) {
  const response = await jsonp("getProgress", {
    email,
    docId: CONFIG.documentId,
  });

  if (!response || !response.ok) {
    return null;
  }
  return response.progress || null;
}

async function saveProgress({ immediate = false } = {}) {
  if (!state.email || !state.pdfDoc) return;

  const payload = buildProgressPayload();
  const signature = JSON.stringify(payload);

  if (!immediate && signature === state.lastSavedSignature) {
    return;
  }

  try {
    setSaveStatus("Enregistrement...");
    const response = await jsonp("saveProgress", payload);
    if (!response?.ok) {
      throw new Error(response?.message || "Erreur d'enregistrement.");
    }
    state.lastSavedSignature = signature;
    setSaveStatus("Progression enregistrée", true);
  } catch (error) {
    console.error(error);
    setSaveStatus("Erreur réseau");
  }
}

function scheduleSave() {
  if (state.saveTimer) window.clearTimeout(state.saveTimer);
  state.saveTimer = window.setTimeout(() => {
    saveProgress();
  }, CONFIG.saveDebounceMs || 2200);
}

function buildProgressPayload() {
  const overallProgress =
    state.totalPages > 0
      ? Math.min(
          1,
          Math.max(0, (state.currentPage - 1 + state.pageScrollRatio) / state.totalPages)
        )
      : 0;

  state.overallProgress = overallProgress;

  return {
    email: state.email,
    docId: CONFIG.documentId,
    docName: CONFIG.documentName,
    page: state.currentPage,
    pageProgress: roundTo(state.pageScrollRatio, 4),
    overallProgress: roundTo(overallProgress, 4),
    userAgent: navigator.userAgent.slice(0, 500),
  };
}

function roundTo(value, decimals = 4) {
  const power = 10 ** decimals;
  return Math.round((Number(value) || 0) * power) / power;
}

function updatePageUI() {
  dom.docLabel.textContent = CONFIG.documentName || "Document";
  dom.pageLabel.textContent = `Page ${state.currentPage} / ${state.totalPages}`;
  dom.pageInput.value = String(state.currentPage);
  dom.prevBtn.disabled = state.currentPage <= 1;
  dom.nextBtn.disabled = state.currentPage >= state.totalPages;
}

function clampPage(pageNumber) {
  return Math.max(1, Math.min(state.totalPages || 1, Number(pageNumber) || 1));
}

async function openReader(email) {
  state.email = normalizeEmail(email);
  setSaveStatus("Chargement du document...");

  const [pdfDoc, progress] = await Promise.all([
    loadPdf(),
    loadProgress(state.email),
  ]);

  state.pdfDoc = pdfDoc;
  state.totalPages = pdfDoc.numPages;
  state.currentPage = clampPage(progress?.page || 1);
  state.pendingRestoreRatio = Math.min(1, Math.max(0, Number(progress?.pageProgress) || 0));

  dom.gate.hidden = true;
  dom.reader.hidden = false;
  dom.viewerShell.focus();

  updatePageUI();
  await renderCurrentPage({ restoreRatio: state.pendingRestoreRatio });
  scheduleSave();
}

async function loadPdf() {
  const loadingTask = pdfjsLib.getDocument({
    url: CONFIG.pdfUrl,
    rangeChunkSize: 65536,
    withCredentials: false,
  });
  return loadingTask.promise;
}

async function renderCurrentPage({ restoreRatio = state.pageScrollRatio } = {}) {
  if (!state.pdfDoc) return;

  const currentToken = ++state.renderToken;
  state.isRendering = true;
  dom.viewerShell.classList.add("reader-loading");
  setSaveStatus("Chargement de la page...");

  try {
    const page = await state.pdfDoc.getPage(state.currentPage);
    const unscaledViewport = page.getViewport({ scale: 1 });
    const availableWidth = Math.max(280, dom.viewerShell.clientWidth - 24);
    const fitWidthScale = availableWidth / unscaledViewport.width;
    const finalScale = fitWidthScale * state.zoom;

    const viewport = page.getViewport({ scale: finalScale });
    const pixelRatio = window.devicePixelRatio || 1;
    const canvas = dom.pdfCanvas;
    const context = canvas.getContext("2d", { alpha: false });

    canvas.width = Math.floor(viewport.width * pixelRatio);
    canvas.height = Math.floor(viewport.height * pixelRatio);
    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.height = `${Math.floor(viewport.height)}px`;

    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.imageSmoothingEnabled = true;

    const renderTask = page.render({
      canvasContext: context,
      viewport,
    });

    await renderTask.promise;

    if (currentToken !== state.renderToken) {
      return;
    }

    updatePageUI();
    requestAnimationFrame(() => {
      restoreViewerScroll(restoreRatio);
      setSaveStatus("Prêt");
    });

    void preloadNeighborPages();
  } catch (error) {
    console.error(error);
    setSaveStatus("Impossible d'afficher la page");
  } finally {
    if (currentToken === state.renderToken) {
      state.isRendering = false;
      dom.viewerShell.classList.remove("reader-loading");
    }
  }
}

function restoreViewerScroll(ratio) {
  const maxScroll = Math.max(0, dom.viewerShell.scrollHeight - dom.viewerShell.clientHeight);
  dom.viewerShell.scrollTop = maxScroll * Math.min(1, Math.max(0, ratio || 0));
  state.pageScrollRatio = computePageScrollRatio();
  scheduleSave();
}

function computePageScrollRatio() {
  const maxScroll = Math.max(0, dom.viewerShell.scrollHeight - dom.viewerShell.clientHeight);
  if (maxScroll <= 0) return 0;
  return dom.viewerShell.scrollTop / maxScroll;
}

async function preloadNeighborPages() {
  const prev = state.currentPage - 1;
  const next = state.currentPage + 1;
  const tasks = [];
  if (prev >= 1) tasks.push(state.pdfDoc.getPage(prev));
  if (next <= state.totalPages) tasks.push(state.pdfDoc.getPage(next));
  try {
    await Promise.all(tasks);
  } catch (error) {
    console.warn("Préchargement partiel impossible.", error);
  }
}

async function goToPage(pageNumber, restoreRatio = 0) {
  const targetPage = clampPage(pageNumber);
  if (targetPage === state.currentPage && Math.abs((restoreRatio || 0) - state.pageScrollRatio) < 0.01) {
    return;
  }
  state.currentPage = targetPage;
  state.pageScrollRatio = 0;
  updatePageUI();
  await renderCurrentPage({ restoreRatio });
  scheduleSave();
}

async function changePage(delta) {
  await goToPage(state.currentPage + delta, 0);
  dom.viewerShell.scrollTop = 0;
}

async function zoom(delta) {
  const nextZoom = roundTo(
    Math.min(CONFIG.maxZoom || 2.2, Math.max(CONFIG.minZoom || 0.8, state.zoom + delta)),
    2
  );
  if (nextZoom === state.zoom) return;
  const ratioBefore = computePageScrollRatio();
  state.zoom = nextZoom;
  await renderCurrentPage({ restoreRatio: ratioBefore });
}

async function fitWidth() {
  if (state.zoom === 1) return;
  const ratioBefore = computePageScrollRatio();
  state.zoom = 1;
  await renderCurrentPage({ restoreRatio: ratioBefore });
}

function onViewerScroll() {
  state.pageScrollRatio = computePageScrollRatio();
  if (state.scrollTimer) window.clearTimeout(state.scrollTimer);
  state.scrollTimer = window.setTimeout(() => {
    scheduleSave();
  }, CONFIG.autoSaveOnScrollMs || 700);
}

function setupTouchNavigation() {
  dom.viewerShell.addEventListener("touchstart", (event) => {
    const touch = event.changedTouches[0];
    state.touchStart = {
      x: touch.clientX,
      y: touch.clientY,
    };
  }, { passive: true });

  dom.viewerShell.addEventListener("touchend", async (event) => {
    if (!state.touchStart) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - state.touchStart.x;
    const dy = touch.clientY - state.touchStart.y;
    state.touchStart = null;

    if (Math.abs(dx) < 70 || Math.abs(dy) > 50) return;
    if (dx < 0) {
      await changePage(1);
    } else {
      await changePage(-1);
    }
  }, { passive: true });
}

function attachEvents() {
  dom.loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = normalizeEmail(dom.emailInput.value);

    if (!isValidEmail(email)) {
      setGateMessage("Courriel invalide.", "error");
      return;
    }

    if (!domainAllowed(email)) {
      setGateMessage("Courriel hors du domaine autorisé.", "error");
      return;
    }

    dom.loginBtn.disabled = true;
    setGateMessage("Validation du courriel...");

    try {
      await authenticateEmail(email);
      rememberEmail(email);
      setGateMessage("Accès autorisé.", "success");
      await openReader(email);
    } catch (error) {
      console.error(error);
      setGateMessage(error.message || "Accès refusé.", "error");
      dom.loginBtn.disabled = false;
    }
  });

  dom.prevBtn.addEventListener("click", () => changePage(-1));
  dom.nextBtn.addEventListener("click", () => changePage(1));

  dom.goBtn.addEventListener("click", () => {
    const pageNumber = clampPage(dom.pageInput.value);
    goToPage(pageNumber, 0);
  });

  dom.pageInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const pageNumber = clampPage(dom.pageInput.value);
      goToPage(pageNumber, 0);
    }
  });

  dom.zoomOutBtn.addEventListener("click", () => zoom(-(CONFIG.zoomStep || 0.15)));
  dom.zoomInBtn.addEventListener("click", () => zoom(CONFIG.zoomStep || 0.15));
  dom.fitBtn.addEventListener("click", () => fitWidth());

  dom.switchUserBtn.addEventListener("click", async () => {
    await saveProgress({ immediate: true });
    clearRememberedEmail();
    state.email = "";
    state.pdfDoc = null;
    dom.reader.hidden = true;
    dom.gate.hidden = false;
    dom.loginBtn.disabled = false;
    dom.emailInput.value = "";
    setGateMessage("");
    setSaveStatus("En attente");
  });

  dom.viewerShell.addEventListener("scroll", onViewerScroll, { passive: true });
  window.addEventListener("resize", debounce(async () => {
    if (!state.pdfDoc) return;
    const ratioBefore = computePageScrollRatio();
    await renderCurrentPage({ restoreRatio: ratioBefore });
  }, 200));

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      state.pageScrollRatio = computePageScrollRatio();
      saveProgress({ immediate: true });
    }
  });

  window.addEventListener("pagehide", () => {
    state.pageScrollRatio = computePageScrollRatio();
    saveProgress({ immediate: true });
  });

  setupTouchNavigation();
}

function debounce(fn, delay = 200) {
  let timer = null;
  return (...args) => {
    if (timer) window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), delay);
  };
}

function init() {
  blockEasyActions();
  attachEvents();
  document.title = CONFIG.appTitle || "Lecteur PDF protégé";
  dom.docLabel.textContent = CONFIG.documentName || "Document";
  const rememberedEmail = loadRememberedEmail();
  if (rememberedEmail) {
    dom.emailInput.value = rememberedEmail;
  }
  setSaveStatus("En attente");
}

init();
