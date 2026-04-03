const SETTINGS = {
  sheetNames: {
    whitelist: 'AllowedEmails',
    progress: 'Progress',
    books: 'Books',
    bookmarks: 'Bookmarks',
    notes: 'Notes',
    users: 'Users'
  },
  allowedDomains: ['educ.cscapitale.qc.ca', 'cscapitale.qc.ca'],
  defaultAdminEmail: 'tremblay.kevin@cscapitale.qc.ca',
  defaultGithubOwner: 'techno-cardi',
  defaultGithubRepo: 'Lecture',
  defaultGithubBranch: 'main',
  defaultGithubAssetsBasePath: 'assets/books'
};

// ════════════════════════════════════════
// POINTS D'ENTRÉE
// ════════════════════════════════════════
function doGet(e) {
  ensureSheets_();
  const action = readParam_(e, 'action');
  const response = handleAction_(action, e);
  return createOutput_(response, readParam_(e, 'prefix'));
}

function doPost(e) {
  ensureSheets_();
  const action = readParam_(e, 'action');
  const response = handlePostAction_(action, e);
  return createOutput_(response, '');
}

// ════════════════════════════════════════
// ROUTAGE GET (JSONP)
// ════════════════════════════════════════
function handleAction_(action, e) {
  try {
    switch (action) {
      case 'auth':                return handleAuth_(e);
      case 'listBooks':           return handleListBooks_(e);
      case 'getProgress':         return handleGetProgress_(e);
      case 'saveProgress':        return handleSaveProgress_(e);
      case 'listBookmarks':       return handleListBookmarks_(e);
      case 'addBookmark':         return handleAddBookmark_(e);
      case 'removeBookmark':      return handleRemoveBookmark_(e);
      case 'renameBookmark':      return handleRenameBookmark_(e);
      case 'listNotes':           return handleListNotes_(e);
      case 'saveNote':            return handleSaveNote_(e);
      case 'deleteNote':          return handleDeleteNote_(e);
      case 'toggleBookPublished': return handleToggleBookPublished_(e);
      case 'setPdfAllowed':       return handleSetPdfAllowed_(e);
      case 'testGithubToken':     return handleTestGithubToken_(e);
      case 'updateBook':          return handleUpdateBook_(e);
      case 'addUsers':            return handleAddUsers_(e);
      case 'saveUserProfile':     return handleSaveUserProfile_(e);
      case 'ping':                return { ok: true, message: 'Service actif.' };
      default:                    return { ok: false, message: 'Action inconnue.' };
    }
  } catch (error) {
    console.error(error);
    return { ok: false, message: 'Erreur serveur.', details: String(error && error.message ? error.message : error) };
  }
}

// ════════════════════════════════════════
// ROUTAGE POST
// ════════════════════════════════════════
function handlePostAction_(action, e) {
  try {
    switch (action) {
      case 'publishBook': return handlePublishBook_(e);
      default:            return { ok: false, message: 'Action POST inconnue.' };
    }
  } catch (error) {
    console.error(error);
    return { ok: false, message: 'Erreur serveur.', details: String(error && error.message ? error.message : error) };
  }
}

// ════════════════════════════════════════
// AUTH
// ════════════════════════════════════════
function handleAuth_(e) {
  const email = normalizeEmail_(readParam_(e, 'email'));
  if (!isValidEmail_(email)) return { ok: false, message: 'Courriel invalide.' };
  if (!isWhitelisted_(email)) return { ok: false, message: 'Courriel non autorisé.' };

  const profile = getUserProfile_(email);
  const firstName = sanitizePersonName_(profile.firstName || '');
  const lastName = sanitizePersonName_(profile.lastName || '');

  return {
    ok: true,
    email: email,
    isAdminCandidate: email === getAdminEmail_(),
    profileComplete: !!(firstName && lastName),
    profile: {
      firstName: firstName,
      lastName: lastName
    },
    message: 'Accès autorisé.'
  };
}

// ════════════════════════════════════════
// LIVRES
// ════════════════════════════════════════
function handleListBooks_(e) {
  const email = normalizeEmail_(readParam_(e, 'email'));
  if (!isAuthorizedReader_(email)) return { ok: false, message: 'Courriel non autorisé.' };
  const includeHidden = isAdminAuthorized_(email, readParam_(e, 'adminCode'));
  return { ok: true, books: readBooks_(includeHidden) };
}

function handleToggleBookPublished_(e) {
  const email = normalizeEmail_(readParam_(e, 'email'));
  const adminCode = readParam_(e, 'adminCode');
  const bookId = sanitizeText_(readParam_(e, 'bookId'));
  const published = toBoolean_(readParam_(e, 'published'));

  if (!isAdminAuthorized_(email, adminCode)) return { ok: false, message: 'Accès administrateur refusé.' };
  if (!bookId) return { ok: false, message: 'Livre introuvable.' };

  const sheet = getSheet_(SETTINGS.sheetNames.books);
  const row = findRowByColumns_(sheet, 2, [1], [bookId]);
  if (!row) return { ok: false, message: 'Livre introuvable.' };

  ensureBooksExtraColumns_(sheet);
  sheet.getRange(row, 4).setValue(published);
  sheet.getRange(row, 11).setValue(new Date());
  return { ok: true, message: 'Statut mis à jour.' };
}

function handleSetPdfAllowed_(e) {
  const email = normalizeEmail_(readParam_(e, 'email'));
  const adminCode = readParam_(e, 'adminCode');
  const bookId = sanitizeText_(readParam_(e, 'bookId'));
  const pdfAllowed = toBoolean_(readParam_(e, 'pdfAllowed'));

  if (!isAdminAuthorized_(email, adminCode)) return { ok: false, message: 'Accès administrateur refusé.' };
  if (!bookId) return { ok: false, message: 'Livre introuvable.' };

  const sheet = getSheet_(SETTINGS.sheetNames.books);
  const row = findRowByColumns_(sheet, 2, [1], [bookId]);
  if (!row) return { ok: false, message: 'Livre introuvable.' };

  ensureBooksExtraColumns_(sheet);
  sheet.getRange(row, 13).setValue(pdfAllowed);
  sheet.getRange(row, 11).setValue(new Date());
  return { ok: true, message: 'Autorisation PDF mise à jour.' };
}

// ════════════════════════════════════════
// ADMIN - MODIFICATION LIVRE / UTILISATEURS
// ════════════════════════════════════════
function handleUpdateBook_(e) {
  const email = normalizeEmail_(readParam_(e, 'email'));
  const adminCode = readParam_(e, 'adminCode');
  const bookId = sanitizeText_(readParam_(e, 'bookId'));
  const title = sanitizeText_(readParam_(e, 'title'), 300);
  const author = sanitizeText_(readParam_(e, 'author'), 300);
  const description = sanitizeText_(readParam_(e, 'description'), 500);
  const hiddenPageRanges = normalizePageRanges_(readParam_(e, 'hiddenPageRanges'));

  if (!isAdminAuthorized_(email, adminCode)) return { ok: false, message: 'Accès administrateur refusé.' };
  if (!bookId) return { ok: false, message: 'Livre introuvable.' };
  if (!title) return { ok: false, message: 'Le titre est requis.' };

  return withLock_(function() {
    const sheet = getSheet_(SETTINGS.sheetNames.books);
    const row = findRowByColumns_(sheet, 2, [1], [bookId]);
    if (!row) return { ok: false, message: 'Livre introuvable.' };

    ensureBooksExtraColumns_(sheet);
    sheet.getRange(row, 2).setValue(title);
    sheet.getRange(row, 3).setValue(author || '');
    ensureBooksExtraColumns_(sheet);
    sheet.getRange(row, 10).setValue(description || '');
    sheet.getRange(row, 11).setValue(new Date());
    sheet.getRange(row, 12).setValue(email);
    sheet.getRange(row, 14).setValue(hiddenPageRanges || '');

    return {
      ok: true,
      message: 'Livre modifié.',
      book: readBookRow_(sheet, row)
    };
  });
}

function handleAddUsers_(e) {
  const email = normalizeEmail_(readParam_(e, 'email'));
  const adminCode = readParam_(e, 'adminCode');
  const emailsRaw = String(readParam_(e, 'emails') || '');

  if (!isAdminAuthorized_(email, adminCode)) return { ok: false, message: 'Accès administrateur refusé.' };
  if (!emailsRaw.trim()) return { ok: false, message: 'Aucune adresse fournie.' };

  const parsed = parseEmailList_(emailsRaw);
  if (!parsed.valid.length) return { ok: false, message: 'Aucune adresse valide trouvée.' };
  if (parsed.valid.length > 100) return { ok: false, message: 'Maximum 100 adresses à la fois.' };

  return withLock_(function() {
    const sheet = getSheet_(SETTINGS.sheetNames.whitelist);
    const existing = getWhitelistMap_(sheet);
    let added = 0;
    let reactivated = 0;

    parsed.valid.forEach(function(userEmail) {
      const info = existing[userEmail];
      if (info && info.row) {
        const wasActive = toBoolean_(info.active);
        sheet.getRange(info.row, 2).setValue(true);
        if (!sheet.getRange(info.row, 4).getValue()) {
          sheet.getRange(info.row, 4).setValue(new Date());
        }
        if (!wasActive) reactivated++;
      } else {
        sheet.getRange(sheet.getLastRow() + 1, 1, 1, 4).setValues([[userEmail, true, 'Ajout admin', new Date()]]);
        added++;
      }
    });

    return {
      ok: true,
      message: buildAddUsersMessage_(added, reactivated, parsed.invalid.length),
      added: added,
      reactivated: reactivated,
      invalid: parsed.invalid,
      totalProcessed: parsed.valid.length
    };
  });
}

function handleSaveUserProfile_(e) {
  const email = normalizeEmail_(readParam_(e, 'email'));
  const firstName = sanitizePersonName_(readParam_(e, 'firstName'));
  const lastName = sanitizePersonName_(readParam_(e, 'lastName'));

  if (!isAuthorizedReader_(email)) return { ok: false, message: 'Courriel non autorisé.' };
  if (!firstName || !lastName) return { ok: false, message: 'Le prénom et le nom sont requis.' };

  return withLock_(function() {
    const profile = upsertUserProfile_(email, firstName, lastName);
    return {
      ok: true,
      message: 'Profil enregistré.',
      profile: profile
    };
  });
}

// ════════════════════════════════════════
// PROGRESSION
// ════════════════════════════════════════
function handleGetProgress_(e) {
  const email = normalizeEmail_(readParam_(e, 'email'));
  const bookId = sanitizeText_(readParam_(e, 'bookId'));
  if (!isAuthorizedReader_(email) || !bookId) return { ok: false, message: 'Paramètres invalides.' };

  const sheet = getSheet_(SETTINGS.sheetNames.progress);
  const row = findRowByColumns_(sheet, 2, [1, 2], [email, bookId]);
  if (!row) return { ok: true, progress: null };

  const values = sheet.getRange(row, 1, 1, 7).getValues()[0];
  return {
    ok: true,
    progress: {
      email: values[0], bookId: values[1], title: values[2],
      currentPage: Number(values[3]) || 1,
      totalPages: Number(values[4]) || 0,
      progressPercent: Number(values[5]) || 0,
      lastUpdated: values[6]
    }
  };
}

function handleSaveProgress_(e) {
  const email = normalizeEmail_(readParam_(e, 'email'));
  const bookId = sanitizeText_(readParam_(e, 'bookId'));
  const title = sanitizeText_(readParam_(e, 'title'));
  const currentPage = clampNumber_(readParam_(e, 'currentPage'), 1, 100000, 1);
  const totalPages = clampNumber_(readParam_(e, 'totalPages'), 0, 100000, 0);
  const progressPercent = clampNumber_(readParam_(e, 'progressPercent'), 0, 100, 0);

  if (!isAuthorizedReader_(email) || !bookId) return { ok: false, message: 'Paramètres invalides.' };

  return withLock_(function() {
    const sheet = getSheet_(SETTINGS.sheetNames.progress);
    const rowValues = [[email, bookId, title, currentPage, totalPages, progressPercent, new Date()]];
    const row = findRowByColumns_(sheet, 2, [1, 2], [email, bookId]);
    if (row) {
      sheet.getRange(row, 1, 1, 7).setValues(rowValues);
      return { ok: true, message: 'Progression mise à jour.' };
    }
    sheet.getRange(sheet.getLastRow() + 1, 1, 1, 7).setValues(rowValues);
    return { ok: true, message: 'Progression enregistrée.' };
  });
}

// ════════════════════════════════════════
// SIGNETS
// ════════════════════════════════════════
function handleListBookmarks_(e) {
  const email = normalizeEmail_(readParam_(e, 'email'));
  const bookId = sanitizeText_(readParam_(e, 'bookId'));
  if (!isAuthorizedReader_(email) || !bookId) return { ok: false, message: 'Paramètres invalides.' };

  const sheet = getSheet_(SETTINGS.sheetNames.bookmarks);
  ensureBookmarksExtraColumns_(sheet);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return { ok: true, bookmarks: [] };

  const rows = sheet.getRange(2, 1, lastRow - 1, 5).getValues();
  const bookmarks = rows
    .filter(function(row) { return normalizeEmail_(row[0]) === email && String(row[1]) === bookId; })
    .map(function(row) {
      return {
        email: row[0],
        bookId: row[1],
        page: Number(row[2]) || 1,
        createdAt: row[3],
        label: String(row[4] || '')
      };
    })
    .sort(function(a, b) { return a.page - b.page; });
  return { ok: true, bookmarks: bookmarks };
}

function handleAddBookmark_(e) {
  const email = normalizeEmail_(readParam_(e, 'email'));
  const bookId = sanitizeText_(readParam_(e, 'bookId'));
  const page = clampNumber_(readParam_(e, 'page'), 1, 100000, 1);
  if (!isAuthorizedReader_(email) || !bookId) return { ok: false, message: 'Paramètres invalides.' };

  return withLock_(function() {
    const sheet = getSheet_(SETTINGS.sheetNames.bookmarks);
    ensureBookmarksExtraColumns_(sheet);
    const row = findRowByColumns_(sheet, 2, [1, 2, 3], [email, bookId, page]);
    if (!row) {
      sheet.getRange(sheet.getLastRow() + 1, 1, 1, 5).setValues([[email, bookId, page, new Date(), '']]);
    }
    return { ok: true, message: 'Signet enregistré.' };
  });
}

function handleRemoveBookmark_(e) {
  const email = normalizeEmail_(readParam_(e, 'email'));
  const bookId = sanitizeText_(readParam_(e, 'bookId'));
  const page = clampNumber_(readParam_(e, 'page'), 1, 100000, 1);
  if (!isAuthorizedReader_(email) || !bookId) return { ok: false, message: 'Paramètres invalides.' };

  return withLock_(function() {
    const sheet = getSheet_(SETTINGS.sheetNames.bookmarks);
    ensureBookmarksExtraColumns_(sheet);
    const row = findRowByColumns_(sheet, 2, [1, 2, 3], [email, bookId, page]);
    if (row) sheet.deleteRow(row);
    return { ok: true, message: 'Signet supprimé.' };
  });
}

function handleRenameBookmark_(e) {
  const email = normalizeEmail_(readParam_(e, 'email'));
  const bookId = sanitizeText_(readParam_(e, 'bookId'));
  const page = clampNumber_(readParam_(e, 'page'), 1, 100000, 1);
  const label = sanitizeText_(readParam_(e, 'label'), 80);
  if (!isAuthorizedReader_(email) || !bookId) return { ok: false, message: 'Paramètres invalides.' };

  return withLock_(function() {
    const sheet = getSheet_(SETTINGS.sheetNames.bookmarks);
    ensureBookmarksExtraColumns_(sheet);
    const row = findRowByColumns_(sheet, 2, [1, 2, 3], [email, bookId, page]);
    if (!row) return { ok: false, message: 'Signet introuvable.' };
    sheet.getRange(row, 5).setValue(label || '');
    return {
      ok: true,
      message: 'Nom du signet enregistré.',
      bookmark: { email: email, bookId: bookId, page: page, label: label || '' }
    };
  });
}

// ════════════════════════════════════════
// NOTES
// ════════════════════════════════════════
function handleListNotes_(e) {
  const email = normalizeEmail_(readParam_(e, 'email'));
  const bookId = sanitizeText_(readParam_(e, 'bookId'));
  if (!isAuthorizedReader_(email) || !bookId) return { ok: false, message: 'Paramètres invalides.' };

  const sheet = getSheet_(SETTINGS.sheetNames.notes);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return { ok: true, notes: [] };

  const rows = sheet.getRange(2, 1, lastRow - 1, 7).getValues();
  const notes = rows
    .filter(function(row) { return normalizeEmail_(row[0]) === email && String(row[1]) === bookId; })
    .map(function(row) {
      return {
        email: row[0], bookId: row[1], page: Number(row[2]) || 1,
        noteId: String(row[3] || ''), noteText: String(row[4] || ''),
        createdAt: row[5], updatedAt: row[6]
      };
    })
    .sort(function(a, b) {
      return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
    });
  return { ok: true, notes: notes };
}

function handleSaveNote_(e) {
  const email = normalizeEmail_(readParam_(e, 'email'));
  const bookId = sanitizeText_(readParam_(e, 'bookId'));
  const page = clampNumber_(readParam_(e, 'page'), 1, 100000, 1);
  const noteId = sanitizeText_(readParam_(e, 'noteId')) || Utilities.getUuid();
  const noteText = sanitizeText_(readParam_(e, 'noteText'), 1200);
  if (!isAuthorizedReader_(email) || !bookId || !noteText) return { ok: false, message: 'Paramètres invalides.' };

  return withLock_(function() {
    const sheet = getSheet_(SETTINGS.sheetNames.notes);
    const row = findRowByColumns_(sheet, 2, [1, 2, 4], [email, bookId, noteId]);
    const createdAt = row ? sheet.getRange(row, 6).getValue() : new Date();
    const values = [[email, bookId, page, noteId, noteText, createdAt, new Date()]];
    if (row) {
      sheet.getRange(row, 1, 1, 7).setValues(values);
    } else {
      sheet.getRange(sheet.getLastRow() + 1, 1, 1, 7).setValues(values);
    }
    return { ok: true, message: 'Note enregistrée.', noteId: noteId };
  });
}

function handleDeleteNote_(e) {
  const email = normalizeEmail_(readParam_(e, 'email'));
  const bookId = sanitizeText_(readParam_(e, 'bookId'));
  const noteId = sanitizeText_(readParam_(e, 'noteId'));
  if (!isAuthorizedReader_(email) || !bookId || !noteId) return { ok: false, message: 'Paramètres invalides.' };

  return withLock_(function() {
    const sheet = getSheet_(SETTINGS.sheetNames.notes);
    const row = findRowByColumns_(sheet, 2, [1, 2, 4], [email, bookId, noteId]);
    if (row) sheet.deleteRow(row);
    return { ok: true, message: 'Note supprimée.' };
  });
}

// ════════════════════════════════════════
// TEST TOKEN GITHUB — DIAGNOSTIC
// ════════════════════════════════════════
function handleTestGithubToken_(e) {
  const email = normalizeEmail_(readParam_(e, 'email'));
  const adminCode = readParam_(e, 'adminCode');
  if (!isAdminAuthorized_(email, adminCode)) return { ok: false, message: 'Accès administrateur refusé.' };

  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty('GITHUB_TOKEN') || '';
  const owner = props.getProperty('GITHUB_OWNER') || SETTINGS.defaultGithubOwner;
  const repo = props.getProperty('GITHUB_REPO') || SETTINGS.defaultGithubRepo;

  if (!token || token === 'PASTE_GITHUB_FINE_GRAINED_TOKEN_HERE') {
    return {
      ok: false,
      message: 'Token GitHub non configuré. Ouvre Apps Script → Propriétés du projet → Variables de script → GITHUB_TOKEN.'
    };
  }

  try {
    var response = UrlFetchApp.fetch(
      'https://api.github.com/repos/' + encodeURIComponent(owner) + '/' + encodeURIComponent(repo),
      {
        method: 'get',
        headers: {
          Authorization: 'Bearer ' + token,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28'
        },
        muteHttpExceptions: true
      }
    );
    var code = response.getResponseCode();
    if (code === 200) {
      return { ok: true, message: 'Token valide — dépôt ' + owner + '/' + repo + ' accessible.' };
    } else if (code === 401) {
      return { ok: false, message: 'Token invalide ou expiré (401). Génère un nouveau token et mets-le dans GITHUB_TOKEN.' };
    } else if (code === 404) {
      return { ok: false, message: 'Dépôt introuvable (404) : ' + owner + '/' + repo + '. Vérifie GITHUB_OWNER et GITHUB_REPO.' };
    } else if (code === 403) {
      return { ok: false, message: 'Accès refusé (403). Le token n\'a pas les permissions nécessaires (contents: write).' };
    } else {
      return { ok: false, message: 'Erreur GitHub ' + code + ' : ' + response.getContentText().slice(0, 200) };
    }
  } catch (err) {
    return { ok: false, message: 'Impossible de joindre GitHub : ' + err.message };
  }
}

// ════════════════════════════════════════
// PUBLICATION — GITHUB
// ════════════════════════════════════════
function handlePublishBook_(e) {
  const email = normalizeEmail_(readParam_(e, 'email'));
  const adminCode = readParam_(e, 'adminCode');
  if (!isAdminAuthorized_(email, adminCode)) return { ok: false, message: 'Accès administrateur refusé.' };

  const bookId = sanitizeText_(readParam_(e, 'bookId'));
  const title = sanitizeText_(readParam_(e, 'title'));
  const author = sanitizeText_(readParam_(e, 'author'));
  const sourceFileName = sanitizeText_(readParam_(e, 'sourceFileName'));
  const totalPages = clampNumber_(readParam_(e, 'totalPages'), 0, 100000, 0);
  const publishNow = toBoolean_(readParam_(e, 'publishNow'));
  const pdfBase64 = readParam_(e, 'pdfBase64');
  const jsonBase64 = readParam_(e, 'jsonBase64');
  const coverBase64 = readParam_(e, 'coverBase64');
  const coverExt = sanitizeText_(readParam_(e, 'coverExt')) || 'jpg';

  if (!bookId || !title) {
    return { ok: false, message: 'Identifiant ou titre manquant.' };
  }
  if (!pdfBase64 || !jsonBase64) {
    return { ok: false, message: 'Données PDF ou JSON manquantes. Le fichier est peut-être trop volumineux ou le format de la requête est incorrect.' };
  }

  const github = getGithubSettings_(e);
  const pdfPath = joinPaths_(github.assetsBasePath, bookId, 'book.pdf');
  const jsonPath = joinPaths_(github.assetsBasePath, bookId, 'book.json');
  const coverPath = coverBase64 ? joinPaths_(github.assetsBasePath, bookId, 'cover.' + normalizeCoverExt_(coverExt)) : '';

  if (!github.token || github.token === 'PASTE_GITHUB_FINE_GRAINED_TOKEN_HERE') {
    return { ok: false, message: 'Token GitHub absent. Configure GITHUB_TOKEN dans les propriétés du script Apps Script.' };
  }

  githubPutFile_(github, pdfPath, pdfBase64, 'Publish PDF: ' + bookId);
  githubPutFile_(github, jsonPath, jsonBase64, 'Publish JSON: ' + bookId);
  if (coverPath && coverBase64) {
    githubPutFile_(github, coverPath, coverBase64, 'Publish cover: ' + bookId);
  }

  upsertBookRow_({
    bookId: bookId, title: title, author: author,
    published: publishNow,
    pdfPath: pdfPath, jsonPath: jsonPath, coverPath: coverPath,
    totalPages: totalPages, sourceFileName: sourceFileName,
    description: '',
    lastUpdatedBy: email,
    pdfAllowed: false,
    hiddenPageRanges: '' 
  });

  return {
    ok: true,
    message: 'Livre publié avec succès.',
    book: { bookId: bookId, title: title, pdfPath: pdfPath, jsonPath: jsonPath, coverPath: coverPath, published: publishNow }
  };
}

// ════════════════════════════════════════
// GITHUB — ENVOI DE FICHIER
// ════════════════════════════════════════
function getGithubSettings_(e) {
  const props = PropertiesService.getScriptProperties();
  return {
    owner: sanitizeText_(readParam_(e, 'repoOwner')) || props.getProperty('GITHUB_OWNER') || SETTINGS.defaultGithubOwner,
    repo: sanitizeText_(readParam_(e, 'repoName')) || props.getProperty('GITHUB_REPO') || SETTINGS.defaultGithubRepo,
    branch: sanitizeText_(readParam_(e, 'repoBranch')) || props.getProperty('GITHUB_BRANCH') || SETTINGS.defaultGithubBranch,
    assetsBasePath: sanitizeText_(readParam_(e, 'assetsBasePath')) || props.getProperty('GITHUB_ASSETS_BASE_PATH') || SETTINGS.defaultGithubAssetsBasePath,
    token: props.getProperty('GITHUB_TOKEN') || ''
  };
}

function githubPutFile_(github, path, contentBase64, message) {
  if (!github.token) throw new Error('GITHUB_TOKEN absent dans les propriétés du script.');
  var endpoint = 'https://api.github.com/repos/' +
    encodeURIComponent(github.owner) + '/' +
    encodeURIComponent(github.repo) + '/contents/' +
    path.split('/').map(encodeURIComponent).join('/');

  var headers = {
    Authorization: 'Bearer ' + github.token,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  };

  // Récupérer le SHA si le fichier existe déjà (nécessaire pour la mise à jour)
  var sha = '';
  var getResponse = UrlFetchApp.fetch(endpoint + '?ref=' + encodeURIComponent(github.branch), {
    method: 'get',
    headers: headers,
    muteHttpExceptions: true
  });
  if (getResponse.getResponseCode() === 200) {
    var existing = JSON.parse(getResponse.getContentText());
    sha = existing.sha || '';
  }

  var payload = { message: message, content: contentBase64, branch: github.branch };
  if (sha) payload.sha = sha;

  var putResponse = UrlFetchApp.fetch(endpoint, {
    method: 'put',
    contentType: 'application/json',
    headers: headers,
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  var code = putResponse.getResponseCode();
  if (code < 200 || code >= 300) {
    var body = putResponse.getContentText();
    throw new Error('Échec GitHub ' + code + ' pour ' + path + ' : ' + body.slice(0, 300));
  }
}

// ════════════════════════════════════════
// FEUILLE BOOKS — LECTURE / ÉCRITURE
// ════════════════════════════════════════
function readBookRow_(sheet, rowNumber) {
  ensureBooksExtraColumns_(sheet);
  const values = sheet.getRange(rowNumber, 1, 1, 14).getValues()[0];
  return {
    bookId:           String(values[0] || ''),
    title:            String(values[1] || ''),
    author:           String(values[2] || ''),
    published:        toBoolean_(values[3]),
    pdfPath:          String(values[4] || ''),
    jsonPath:         String(values[5] || ''),
    coverPath:        String(values[6] || ''),
    totalPages:       Number(values[7]) || 0,
    sourceFileName:   String(values[8] || ''),
    description:      String(values[9] || ''),
    lastPublishedAt:  values[10] ? Utilities.formatDate(new Date(values[10]), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss') : '',
    lastUpdatedBy:    String(values[11] || ''),
    pdfAllowed:       toBoolean_(values[12] || false),
    hiddenPageRanges: String(values[13] || '')
  };
}

function readBooks_(includeHidden) {
  const sheet = getSheet_(SETTINGS.sheetNames.books);
  ensureBooksExtraColumns_(sheet);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  const rows = sheet.getRange(2, 1, lastRow - 1, 14).getValues();
  return rows
    .map(function(row) {
      return {
        bookId:           String(row[0] || ''),
        title:            String(row[1] || ''),
        author:           String(row[2] || ''),
        published:        toBoolean_(row[3]),
        pdfPath:          String(row[4] || ''),
        jsonPath:         String(row[5] || ''),
        coverPath:        String(row[6] || ''),
        totalPages:       Number(row[7]) || 0,
        sourceFileName:   String(row[8] || ''),
        description:      String(row[9] || ''),
        lastPublishedAt:  row[10] ? Utilities.formatDate(new Date(row[10]), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss') : '',
        lastUpdatedBy:    String(row[11] || ''),
        pdfAllowed:       toBoolean_(row[12] || false),
        hiddenPageRanges: String(row[13] || '')
      };
    })
    .filter(function(book) {
      return book.bookId && book.title && (includeHidden || book.published);
    })
    .sort(function(a, b) { return a.title.localeCompare(b.title); });
}

function upsertBookRow_(book) {
  const sheet = getSheet_(SETTINGS.sheetNames.books);
  ensureBooksExtraColumns_(sheet);
  const row = findRowByColumns_(sheet, 2, [1], [book.bookId]);
  const existingCoverPath = row ? String(sheet.getRange(row, 7).getValue() || '') : '';
  const existingDescription = row ? String(sheet.getRange(row, 10).getValue() || '') : '';
  const existingPdfAllowed = row ? toBoolean_(sheet.getRange(row, 13).getValue()) : false;
  const existingHiddenPageRanges = row ? String(sheet.getRange(row, 14).getValue() || '') : '';
  const values = [[
    book.bookId,
    book.title,
    book.author || '',
    !!book.published,
    book.pdfPath,
    book.jsonPath,
    book.coverPath || existingCoverPath,
    Number(book.totalPages) || 0,
    book.sourceFileName || '',
    book.description !== undefined ? String(book.description || '') : existingDescription,
    new Date(),
    book.lastUpdatedBy || '',
    book.pdfAllowed !== undefined ? !!book.pdfAllowed : existingPdfAllowed,
    book.hiddenPageRanges !== undefined ? normalizePageRanges_(book.hiddenPageRanges) : existingHiddenPageRanges
  ]];

  if (row) {
    sheet.getRange(row, 1, 1, 14).setValues(values);
  } else {
    sheet.getRange(sheet.getLastRow() + 1, 1, 1, 14).setValues(values);
  }
}

// ════════════════════════════════════════
// INITIALISATION DES FEUILLES
// ════════════════════════════════════════
function ensureSheets_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  var whitelistSheet  = spreadsheet.getSheetByName(SETTINGS.sheetNames.whitelist)  || spreadsheet.insertSheet(SETTINGS.sheetNames.whitelist);
  var progressSheet   = spreadsheet.getSheetByName(SETTINGS.sheetNames.progress)   || spreadsheet.insertSheet(SETTINGS.sheetNames.progress);
  var booksSheet      = spreadsheet.getSheetByName(SETTINGS.sheetNames.books)      || spreadsheet.insertSheet(SETTINGS.sheetNames.books);
  var bookmarksSheet  = spreadsheet.getSheetByName(SETTINGS.sheetNames.bookmarks)  || spreadsheet.insertSheet(SETTINGS.sheetNames.bookmarks);
  var notesSheet      = spreadsheet.getSheetByName(SETTINGS.sheetNames.notes)      || spreadsheet.insertSheet(SETTINGS.sheetNames.notes);
  var usersSheet      = spreadsheet.getSheetByName(SETTINGS.sheetNames.users)      || spreadsheet.insertSheet(SETTINGS.sheetNames.users);

  if (whitelistSheet.getLastRow() === 0) {
    whitelistSheet.getRange(1, 1, 1, 4).setValues([['email', 'active', 'note', 'addedAt']]);
    whitelistSheet.setFrozenRows(1);
  }
  if (progressSheet.getLastRow() === 0) {
    progressSheet.getRange(1, 1, 1, 7).setValues([['email', 'bookId', 'title', 'currentPage', 'totalPages', 'progressPercent', 'lastUpdated']]);
    progressSheet.setFrozenRows(1);
  }
  if (booksSheet.getLastRow() === 0) {
    booksSheet.getRange(1, 1, 1, 14).setValues([['bookId', 'title', 'author', 'published', 'pdfPath', 'jsonPath', 'coverPath', 'totalPages', 'sourceFileName', 'description', 'lastPublishedAt', 'lastUpdatedBy', 'pdfAllowed', 'hiddenPageRanges']]);
    booksSheet.setFrozenRows(1);
  } else {
    ensureBooksExtraColumns_(booksSheet);
  }
  if (bookmarksSheet.getLastRow() === 0) {
    bookmarksSheet.getRange(1, 1, 1, 5).setValues([['email', 'bookId', 'page', 'createdAt', 'label']]);
    bookmarksSheet.setFrozenRows(1);
  } else {
    ensureBookmarksExtraColumns_(bookmarksSheet);
  }
  if (notesSheet.getLastRow() === 0) {
    notesSheet.getRange(1, 1, 1, 7).setValues([['email', 'bookId', 'page', 'noteId', 'noteText', 'createdAt', 'updatedAt']]);
    notesSheet.setFrozenRows(1);
  }
  if (usersSheet.getLastRow() === 0) {
    usersSheet.getRange(1, 1, 1, 5).setValues([['email', 'firstName', 'lastName', 'createdAt', 'updatedAt']]);
    usersSheet.setFrozenRows(1);
  }
}

// ════════════════════════════════════════
// FONCTIONS DE CONFIGURATION
// (exécuter une seule fois depuis l'éditeur Apps Script)
// ════════════════════════════════════════

/**
 * Crée les feuilles du classeur si elles n'existent pas encore.
 */
function setupSpreadsheet() {
  ensureSheets_();
}

/**
 * Configure les propriétés du script (secrets).
 *
 * IMPORTANT : remplace PASTE_GITHUB_FINE_GRAINED_TOKEN_HERE par ton vrai token
 * Fine-Grained avant d'exécuter cette fonction.
 *
 * Permission requise sur le token : Contents → Read and Write
 * sur le dépôt techno-cardi/Lecture
 */
function configureSecrets() {
  PropertiesService.getScriptProperties().setProperties({
    ADMIN_EMAIL:              SETTINGS.defaultAdminEmail,
    ADMIN_ACCESS_CODE:        '2427',
    GITHUB_OWNER:             SETTINGS.defaultGithubOwner,
    GITHUB_REPO:              SETTINGS.defaultGithubRepo,
    GITHUB_BRANCH:            SETTINGS.defaultGithubBranch,
    GITHUB_ASSETS_BASE_PATH:  SETTINGS.defaultGithubAssetsBasePath,
    GITHUB_TOKEN:             'PASTE_GITHUB_FINE_GRAINED_TOKEN_HERE'
  }, false);
}

// ════════════════════════════════════════
// UTILITAIRES INTERNES
// ════════════════════════════════════════
function ensureBooksExtraColumns_(sheet) {
  var targetSheet = sheet || getSheet_(SETTINGS.sheetNames.books);
  var currentCols = Math.max(targetSheet.getLastColumn(), 1);
  if (currentCols < 14) {
    targetSheet.insertColumnsAfter(currentCols, 14 - currentCols);
  }

  var headers = targetSheet.getRange(1, 1, 1, 14).getValues()[0];
  var expected = ['bookId', 'title', 'author', 'published', 'pdfPath', 'jsonPath', 'coverPath', 'totalPages', 'sourceFileName', 'description', 'lastPublishedAt', 'lastUpdatedBy', 'pdfAllowed', 'hiddenPageRanges'];

  if (String(headers[9] || '') === 'lastPublishedAt') {
    targetSheet.insertColumnBefore(10);
    headers = targetSheet.getRange(1, 1, 1, 14).getValues()[0];
  }

  for (var i = 0; i < expected.length; i++) {
    if (String(headers[i] || '') !== expected[i]) {
      targetSheet.getRange(1, i + 1).setValue(expected[i]);
    }
  }
}

function ensureBookmarksExtraColumns_(sheet) {
  var targetSheet = sheet || getSheet_(SETTINGS.sheetNames.bookmarks);
  var currentCols = Math.max(targetSheet.getLastColumn(), 1);
  if (currentCols < 5) {
    targetSheet.insertColumnsAfter(currentCols, 5 - currentCols);
  }
  var headers = targetSheet.getRange(1, 1, 1, 5).getValues()[0];
  var expected = ['email', 'bookId', 'page', 'createdAt', 'label'];
  for (var i = 0; i < expected.length; i++) {
    if (String(headers[i] || '') !== expected[i]) {
      targetSheet.getRange(1, i + 1).setValue(expected[i]);
    }
  }
}

function getUserProfile_(email) {
  var userEmail = normalizeEmail_(email);
  if (!userEmail) return { email: '', firstName: '', lastName: '' };
  var sheet = getSheet_(SETTINGS.sheetNames.users);
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return { email: userEmail, firstName: '', lastName: '' };
  var rows = sheet.getRange(2, 1, lastRow - 1, 5).getValues();
  for (var i = 0; i < rows.length; i++) {
    if (normalizeEmail_(rows[i][0]) === userEmail) {
      return {
        email: userEmail,
        firstName: sanitizePersonName_(rows[i][1] || ''),
        lastName: sanitizePersonName_(rows[i][2] || '')
      };
    }
  }
  return { email: userEmail, firstName: '', lastName: '' };
}

function upsertUserProfile_(email, firstName, lastName) {
  var userEmail = normalizeEmail_(email);
  var cleanFirstName = sanitizePersonName_(firstName);
  var cleanLastName = sanitizePersonName_(lastName);
  var sheet = getSheet_(SETTINGS.sheetNames.users);
  var row = findRowByColumns_(sheet, 2, [1], [userEmail]);
  var createdAt = row ? sheet.getRange(row, 4).getValue() : new Date();
  var values = [[userEmail, cleanFirstName, cleanLastName, createdAt, new Date()]];
  if (row) {
    sheet.getRange(row, 1, 1, 5).setValues(values);
  } else {
    sheet.getRange(sheet.getLastRow() + 1, 1, 1, 5).setValues(values);
  }
  return { email: userEmail, firstName: cleanFirstName, lastName: cleanLastName };
}

function sanitizePersonName_(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/(^|[\s\-'])[a-zàâäçéèêëîïôöùûüÿæœ]/g, function(match) {
      return match.toUpperCase();
    })
    .slice(0, 120);
}

function normalizePageRanges_(raw) {
  var parts = [];
  var seen = {};
  String(raw || '')
    .split(/[;,]+/)
    .map(function(part) { return String(part || '').trim(); })
    .forEach(function(part) {
      if (!part) return;
      var match = part.match(/^(\d+)\s*-\s*(\d+)$/);
      if (match) {
        var start = Number(match[1]);
        var end = Number(match[2]);
        if (!isFinite(start) || !isFinite(end)) return;
        if (start > end) {
          var temp = start;
          start = end;
          end = temp;
        }
        var key = start + '-' + end;
        if (!seen[key]) {
          seen[key] = true;
          parts.push(key);
        }
        return;
      }
      var single = Number(part);
      if (!isFinite(single) || single < 1) return;
      var singleKey = String(single);
      if (!seen[singleKey]) {
        seen[singleKey] = true;
        parts.push(singleKey);
      }
    });
  return parts.join(', ');
}

function parseEmailList_(raw) {
  var seen = {};
  var valid = [];
  var invalid = [];
  String(raw || '')
    .split(/[\n,;]+/)
    .map(function(item) { return normalizeEmail_(item); })
    .forEach(function(item) {
      if (!item || seen[item]) return;
      seen[item] = true;
      if (isValidEmail_(item)) {
        valid.push(item);
      } else {
        invalid.push(item);
      }
    });
  return { valid: valid, invalid: invalid };
}

function getWhitelistMap_(sheet) {
  var targetSheet = sheet || getSheet_(SETTINGS.sheetNames.whitelist);
  var map = {};
  var lastRow = targetSheet.getLastRow();
  if (lastRow < 2) return map;
  var rows = targetSheet.getRange(2, 1, lastRow - 1, 4).getValues();
  rows.forEach(function(row, index) {
    var email = normalizeEmail_(row[0]);
    if (!email) return;
    map[email] = { row: index + 2, active: row[1] };
  });
  return map;
}

function buildAddUsersMessage_(added, reactivated, invalidCount) {
  var parts = [];
  if (added) parts.push(added + ' ajouté(s)');
  if (reactivated) parts.push(reactivated + ' réactivé(s)');
  if (!parts.length) parts.push('Aucun nouvel utilisateur');
  if (invalidCount) parts.push(invalidCount + ' invalide(s) ignoré(s)');
  return parts.join(' - ') + '.';
}

function isAuthorizedReader_(email) {
  return isValidEmail_(email) && isWhitelisted_(email);
}

function isWhitelisted_(email) {
  const sheet = getSheet_(SETTINGS.sheetNames.whitelist);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return false;
  const values = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
  for (var i = 0; i < values.length; i++) {
    if (normalizeEmail_(values[i][0]) === email && toBoolean_(values[i][1])) return true;
  }
  return false;
}

function isAdminAuthorized_(email, code) {
  const props = PropertiesService.getScriptProperties();
  const expectedCode = String(props.getProperty('ADMIN_ACCESS_CODE') || '').trim();
  return normalizeEmail_(email) === getAdminEmail_() && !!expectedCode && String(code || '').trim() === expectedCode;
}

function getAdminEmail_() {
  return normalizeEmail_(PropertiesService.getScriptProperties().getProperty('ADMIN_EMAIL') || SETTINGS.defaultAdminEmail);
}

function getSheet_(name) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sheet) throw new Error('Feuille introuvable: ' + name);
  return sheet;
}

function findRowByColumns_(sheet, startRow, columns, values) {
  const lastRow = sheet.getLastRow();
  if (lastRow < startRow) return 0;
  const width = Math.max.apply(null, columns);
  const actualWidth = Math.min(width, sheet.getLastColumn());
  if (actualWidth < width) return 0;
  const rows = sheet.getRange(startRow, 1, lastRow - startRow + 1, width).getValues();
  for (var index = 0; index < rows.length; index++) {
    var row = rows[index];
    var matches = true;
    for (var i = 0; i < columns.length; i++) {
      var rowValue = row[columns[i] - 1];
      var targetValue = values[i];
      if (columns[i] === 1) rowValue = normalizeEmail_(rowValue);
      if (columns[i] === 2 && columns.length > 1) rowValue = String(rowValue || '');
      if (columns[i] === 3 && typeof targetValue === 'number') rowValue = Number(rowValue) || 0;
      if (columns[i] === 4 && typeof targetValue === 'string') rowValue = String(rowValue || '');
      if (rowValue !== targetValue) { matches = false; break; }
    }
    if (matches) return startRow + index;
  }
  return 0;
}

function withLock_(callback) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try { return callback(); } finally { lock.releaseLock(); }
}

function createOutput_(payload, prefix) {
  const safePrefix = sanitizePrefix_(prefix);
  const text = JSON.stringify(payload);
  if (safePrefix) {
    return ContentService.createTextOutput(safePrefix + '(' + text + ')').setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(text).setMimeType(ContentService.MimeType.JSON);
}

function sanitizePrefix_(value) {
  const prefix = String(value || '').trim();
  if (!prefix) return '';
  return /^[A-Za-z_$][0-9A-Za-z_$\.]*$/.test(prefix) ? prefix : '';
}

function normalizeEmail_(value) { return String(value || '').trim().toLowerCase(); }
function isValidEmail_(value)   { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }
function isAllowedDomain_(email) {
  var domain = email.split('@')[1] || '';
  return SETTINGS.allowedDomains.indexOf(domain) !== -1;
}

/**
 * Lecture d'un paramètre.
 * Fonctionne pour GET (e.parameter) et POST url-encoded ou JSON raw body.
 */
function readParam_(e, name) {
  if (!e) return '';
  if (e.parameter && e.parameter[name] !== undefined && e.parameter[name] !== '') {
    return e.parameter[name];
  }
  if (e.postData && e.postData.type === 'application/json') {
    try {
      var body = JSON.parse(e.postData.contents);
      if (body && body[name] !== undefined) return String(body[name]);
    } catch (_) {}
  }
  return '';
}

function sanitizeText_(value, maxLength) {
  var trimmed = String(value || '').trim();
  return maxLength ? trimmed.slice(0, maxLength) : trimmed;
}

function clampNumber_(value, min, max, fallback) {
  var number = Number(value);
  if (!isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

function toBoolean_(value) {
  if (typeof value === 'boolean') return value;
  var normalized = String(value || '').trim().toLowerCase();
  return ['true', '1', 'yes', 'oui', 'vrai'].indexOf(normalized) !== -1;
}

function joinPaths_() {
  return Array.prototype.slice.call(arguments)
    .filter(function(p) { return p !== null && p !== undefined && String(p).trim() !== ''; })
    .map(function(p) { return String(p).replace(/^\/+|\/+$/g, ''); })
    .join('/');
}

function normalizeCoverExt_(ext) {
  var normalized = String(ext || '').toLowerCase();
  if (normalized === 'png' || normalized === 'webp') return normalized;
  return 'jpg';
}