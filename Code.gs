const SETTINGS = {
  sheetNames: {
    whitelist: 'AllowedEmails',
    progress: 'Progress',
    books: 'Books',
    bookmarks: 'Bookmarks',
    notes: 'Notes',
    users: 'Users',
    bookSettings: 'BookSettings',
    bookVisibility: 'BookVisibility',
    pageJournal: 'PageJournal'
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
      case 'deleteBook':          return handleDeleteBook_(e);
      case 'addUsers':            return handleAddUsers_(e);
      case 'saveUserProfile':     return handleSaveUserProfile_(e);
      case 'listAssignableUsers': return handleListAssignableUsers_(e);
      case 'getStudentReadingOverview': return handleGetStudentReadingOverview_(e);
      case 'getUsersReadingOverview': return handleGetUsersReadingOverview_(e);
      case 'getBookReadingOverview': return handleGetBookReadingOverview_(e);
      case 'trackPageView':       return handleTrackPageView_(e);
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
      case 'updateBook':  return handleUpdateBook_(e);
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

  touchUserAuth_(email);
  const profile = getUserProfile_(email);
  const firstName = sanitizePersonName_(profile.firstName || '');
  const lastName = sanitizePersonName_(profile.lastName || '');

  return {
    ok: true,
    email: email,
    isAuthorized: true,
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
  const isAdminUser = email === getAdminEmail_();
  const books = readBooks_(includeHidden).filter(function(book) {
    return isBookAvailableToUser_(book, email, isAdminUser);
  });
  const statsMap = buildUserBookStats_(email, books);
  const enrichedBooks = books.map(function(book) {
    return attachUserStatsToBook_(book, statsMap[String(book.bookId || '')]);
  });
  return { ok: true, books: enrichedBooks };
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
  upsertBookSettingsRow_({
    bookId: bookId,
    pdfAllowed: pdfAllowed,
    updatedBy: email
  });
  return { ok: true, message: 'Autorisation PDF mise à jour.' };
}

// ════════════════════════════════════════
// ADMIN - MODIFICATION LIVRE / UTILISATEURS
// ════════════════════════════════════════
function handleDeleteBook_(e) {
  const email = normalizeEmail_(readParam_(e, 'email'));
  const adminCode = readParam_(e, 'adminCode');
  const bookId = sanitizeText_(readParam_(e, 'bookId'));

  if (!isAdminAuthorized_(email, adminCode)) return { ok: false, message: 'Accès administrateur refusé.' };
  if (!bookId) return { ok: false, message: 'Livre introuvable.' };

  return withLock_(function() {
    ensureSheets_();
    const booksSheet = getSheet_(SETTINGS.sheetNames.books);
    ensureBooksExtraColumns_(booksSheet);
    const row = findRowByColumns_(booksSheet, 2, [1], [bookId]);
    if (!row) return { ok: false, message: 'Livre introuvable.' };

    const book = readBookRow_(booksSheet, row);
    const warnings = [];

    try {
      const github = getGithubSettings_(e);
      if (github.token && github.token !== 'PASTE_GITHUB_FINE_GRAINED_TOKEN_HERE') {
        [book.pdfPath, book.jsonPath, book.coverPath].forEach(function(path) {
          if (!String(path || '').trim()) return;
          try {
            githubDeleteFileIfExists_(github, path, 'Delete book asset: ' + bookId);
          } catch (error) {
            warnings.push('Actif GitHub non supprimé (' + path + ') : ' + error.message);
          }
        });
      } else {
        warnings.push('Actifs GitHub non supprimés : token absent ou non configuré.');
      }
    } catch (error) {
      warnings.push('Suppression GitHub partielle : ' + error.message);
    }

    const deleted = {
      progress: deleteRowsByColumns_(getSheet_(SETTINGS.sheetNames.progress), [2], [bookId]),
      bookmarks: deleteRowsByColumns_(getSheet_(SETTINGS.sheetNames.bookmarks), [2], [bookId]),
      notes: deleteRowsByColumns_(getSheet_(SETTINGS.sheetNames.notes), [2], [bookId]),
      pageJournal: deleteRowsByColumns_(getSheet_(SETTINGS.sheetNames.pageJournal), [2], [bookId]),
      bookSettings: deleteRowsByColumns_(getSheet_(SETTINGS.sheetNames.bookSettings), [1], [bookId]),
      bookVisibility: deleteRowsByColumns_(getSheet_(SETTINGS.sheetNames.bookVisibility), [1], [bookId])
    };

    booksSheet.deleteRow(row);
    SpreadsheetApp.flush();

    return {
      ok: true,
      message: 'Livre supprimé.',
      bookId: bookId,
      deleted: deleted,
      warnings: warnings
    };
  });
}

function handleUpdateBook_(e) {
  const email = normalizeEmail_(readParam_(e, 'email'));
  const adminCode = readParam_(e, 'adminCode');
  const bookId = sanitizeText_(readParam_(e, 'bookId'));
  const title = sanitizeText_(readParam_(e, 'title'), 300);
  const author = sanitizeText_(readParam_(e, 'author'), 300);
  const description = sanitizeText_(readParam_(e, 'description'), 500);
  const hiddenPageRanges = normalizePageRanges_(readParam_(e, 'hiddenPageRanges'));
  const restrictedAccess = toBoolean_(readParam_(e, 'restrictedAccess'));
  const assignedEmails = normalizeAssignedEmails_(readParam_(e, 'assignedEmails'));
  const coverBase64 = readParam_(e, 'coverBase64');
  const coverExt = sanitizeText_(readParam_(e, 'coverExt')) || 'jpg';
  const removeCover = toBoolean_(readParam_(e, 'removeCover'));

  if (!isAdminAuthorized_(email, adminCode)) return { ok: false, message: 'Accès administrateur refusé.' };
  if (!bookId) return { ok: false, message: 'Livre introuvable.' };
  if (!title) return { ok: false, message: 'Le titre est requis.' };
  if (restrictedAccess && !assignedEmails.length) return { ok: false, message: 'Choisis au moins un utilisateur.' };

  return withLock_(function() {
    const sheet = getSheet_(SETTINGS.sheetNames.books);
    const row = findRowByColumns_(sheet, 2, [1], [bookId]);
    if (!row) return { ok: false, message: 'Livre introuvable.' };

    const settingsMap = getBookSettingsMap_();
    const existing = readBookRow_(sheet, row, settingsMap);

    var nextCoverPath = existing.coverPath || '';
    if (coverBase64 || removeCover) {
      const github = getGithubSettings_(e);
      if (!github.token || github.token === 'PASTE_GITHUB_FINE_GRAINED_TOKEN_HERE') {
        return { ok: false, message: 'Token GitHub absent. Impossible de modifier la couverture.' };
      }
      const desiredCoverPath = coverBase64
        ? joinPaths_(github.assetsBasePath, existing.bookId, 'cover.' + normalizeCoverExt_(coverExt))
        : '';
      if (coverBase64) {
        githubPutFile_(github, desiredCoverPath, coverBase64, 'Update cover: ' + existing.bookId);
        if (existing.coverPath && existing.coverPath !== desiredCoverPath) {
          try { githubDeleteFileIfExists_(github, existing.coverPath, 'Delete previous cover: ' + existing.bookId); } catch (coverDeleteError) {}
        }
        nextCoverPath = desiredCoverPath;
      } else if (removeCover && existing.coverPath) {
        try { githubDeleteFileIfExists_(github, existing.coverPath, 'Delete cover: ' + existing.bookId); } catch (coverDeleteError) {}
        nextCoverPath = '';
      }
    }

    upsertBookRow_({
      bookId: existing.bookId,
      title: title,
      author: author || '',
      published: existing.published,
      pdfPath: existing.pdfPath,
      jsonPath: existing.jsonPath,
      coverPath: nextCoverPath,
      totalPages: existing.totalPages,
      sourceFileName: existing.sourceFileName,
      description: description || '',
      lastUpdatedBy: email,
      pdfAllowed: existing.pdfAllowed,
      hiddenPageRanges: hiddenPageRanges || '',
      restrictedAccess: restrictedAccess,
      assignedEmails: assignedEmails
    });
    upsertBookSettingsRow_({
      bookId: existing.bookId,
      description: description || '',
      pdfAllowed: existing.pdfAllowed,
      hiddenPageRanges: hiddenPageRanges || '',
      restrictedAccess: restrictedAccess,
      assignedEmails: assignedEmails,
      updatedBy: email
    });
    upsertBookVisibilityRow_({
      bookId: existing.bookId,
      hiddenPageRanges: hiddenPageRanges || '',
      updatedBy: email
    });
    SpreadsheetApp.flush();

    const refreshedRow = findRowByColumns_(sheet, 2, [1], [bookId]);
    const refreshedSettingsMap = getBookSettingsMap_();
    const refreshedVisibilityMap = getBookVisibilityMap_();
    return {
      ok: true,
      message: (coverBase64 || removeCover) ? 'Livre et couverture mis à jour.' : 'Livre modifié.',
      book: readBookRow_(sheet, refreshedRow, refreshedSettingsMap, refreshedVisibilityMap)
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



function handleTrackPageView_(e) {
  const email = normalizeEmail_(readParam_(e, 'email'));
  const bookId = sanitizeText_(readParam_(e, 'bookId'));
  const page = clampNumber_(readParam_(e, 'page'), 1, 100000, 1);
  const secondsSpent = clampNumber_(readParam_(e, 'secondsSpent'), 0, 7200, 0);
  if (!isAuthorizedReader_(email) || !bookId) return { ok: false, message: 'Paramètres invalides.' };

  return withLock_(function() {
    const sheet = getSheet_(SETTINGS.sheetNames.pageJournal);
    ensurePageJournalColumns_(sheet);
    const row = findRowByColumns_(sheet, 2, [1, 2, 3], [email, bookId, page]);
    const now = new Date();
    if (row) {
      const existing = sheet.getRange(row, 1, 1, 8).getValues()[0];
      const existingViews = Number(existing[5]) || 0;
      const existingSeconds = Number(existing[6]) || 0;
      const firstViewedAt = existing[7] || existing[4] || now;
      sheet.getRange(row, 1, 1, 8).setValues([[
        email,
        bookId,
        page,
        now,
        now,
        existingViews + 1,
        existingSeconds + Math.max(0, Number(secondsSpent) || 0),
        firstViewedAt
      ]]);
    } else {
      sheet.getRange(sheet.getLastRow() + 1, 1, 1, 8).setValues([[
        email,
        bookId,
        page,
        now,
        now,
        1,
        Math.max(0, Number(secondsSpent) || 0),
        now
      ]]);
    }
    return { ok: true, message: 'Journal mis à jour.' };
  });
}

function handleListAssignableUsers_(e) {
  const email = normalizeEmail_(readParam_(e, 'email'));
  const adminCode = readParam_(e, 'adminCode');
  if (!isAdminAuthorized_(email, adminCode)) return { ok: false, message: 'Accès administrateur refusé.' };
  return { ok: true, users: buildAssignableUsers_() };
}

function handleGetStudentReadingOverview_(e) {
  const email = normalizeEmail_(readParam_(e, 'email'));
  const adminCode = readParam_(e, 'adminCode');
  const targetEmail = normalizeEmail_(readParam_(e, 'targetEmail'));
  if (!isAdminAuthorized_(email, adminCode)) return { ok: false, message: 'Accès administrateur refusé.' };
  if (!targetEmail || !isValidEmail_(targetEmail)) return { ok: false, message: 'Utilisateur invalide.' };

  ensureSheets_();
  const books = readBooks_(true);
  const bookMap = {};
  books.forEach(function(book) {
    if (book && book.bookId) bookMap[String(book.bookId)] = book;
  });

  const progressMap = getProgressMapByEmailAndBook_();
  const bookmarksMap = getBookmarksMapByEmailAndBook_();
  const notesMap = getNotesMapByEmailAndBook_();
  const pageJournalMap = getPageJournalMapByEmailAndBook_();

  const bookIds = {};
  Object.keys(progressMap).forEach(function(key) {
    var parts = key.split('||');
    if (parts[0] === targetEmail && parts[1]) bookIds[parts[1]] = true;
  });
  Object.keys(bookmarksMap).forEach(function(key) {
    var parts = key.split('||');
    if (parts[0] === targetEmail && parts[1]) bookIds[parts[1]] = true;
  });
  Object.keys(notesMap).forEach(function(key) {
    var parts = key.split('||');
    if (parts[0] === targetEmail && parts[1]) bookIds[parts[1]] = true;
  });
  Object.keys(pageJournalMap).forEach(function(key) {
    var parts = key.split('||');
    if (parts[0] === targetEmail && parts[1]) bookIds[parts[1]] = true;
  });

  const resultBooks = Object.keys(bookIds).map(function(bookId) {
    const progress = progressMap[targetEmail + '||' + bookId] || null;
    const bookMeta = bookMap[bookId] || {};
    const bookmarks = bookmarksMap[targetEmail + '||' + bookId] || [];
    const notes = notesMap[targetEmail + '||' + bookId] || [];
    const pageSummary = pageJournalMap[targetEmail + '||' + bookId] || buildEmptyPageJournalSummary_();
    const totalPages = progress ? Number(progress.totalPages) || 0 : Number(bookMeta.visiblePageCount) || Number(bookMeta.totalPages) || 0;
    return {
      bookId: bookId,
      title: String(bookMeta.title || (progress && progress.title) || bookId),
      author: String(bookMeta.author || ''),
      currentPage: progress ? Number(progress.currentPage) || 1 : 0,
      totalPages: totalPages,
      progressPercent: progress ? Number(progress.progressPercent) || 0 : 0,
      lastUpdated: progress ? progress.lastUpdated : '',
      lastOpenedAt: progress ? progress.lastOpenedAt : '',
      firstOpenedAt: progress ? progress.firstOpenedAt : '',
      sessionCount: progress ? Number(progress.sessionCount) || 0 : 0,
      averageSessionSeconds: progress ? Number(progress.averageSessionSeconds) || 0 : 0,
      completedAt: progress ? progress.completedAt : '',
      lastPageVisited: progress ? Number(progress.lastPageVisited) || 0 : 0,
      readingSeconds: progress ? Number(progress.readingSeconds) || 0 : 0,
      viewedPagesCount: Number(pageSummary.viewedPagesCount) || 0,
      totalPageViews: Number(pageSummary.totalPageViews) || 0,
      lastViewedPage: Number(pageSummary.lastViewedPage) || 0,
      topPages: pageSummary.topPages || [],
      bookmarks: bookmarks,
      notes: notes
    };
  }).sort(function(a, b) {
    return String(a.title || '').localeCompare(String(b.title || ''), 'fr-CA');
  });

  const profile = getUserProfile_(targetEmail);
  const totalBookmarks = resultBooks.reduce(function(sum, book) { return sum + (book.bookmarks ? book.bookmarks.length : 0); }, 0);
  const totalNotes = resultBooks.reduce(function(sum, book) { return sum + (book.notes ? book.notes.length : 0); }, 0);
  const totalReadingSeconds = resultBooks.reduce(function(sum, book) { return sum + (Number(book.readingSeconds) || 0); }, 0);
  const totalSessions = resultBooks.reduce(function(sum, book) { return sum + (Number(book.sessionCount) || 0); }, 0);
  const booksCompleted = resultBooks.filter(function(book) { return !!String(book.completedAt || ''); }).length;
  const lastActivityAt = getLatestDateValue_(resultBooks.map(function(book) { return book.lastUpdated || book.lastOpenedAt || ''; }).concat([profile.lastAuthAt || '']));

  return {
    ok: true,
    user: {
      email: targetEmail,
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      hasProfile: !!profile.hasProfile,
      createdAt: profile.createdAt || '',
      profileUpdatedAt: profile.updatedAt || '',
      lastConnectionAt: profile.lastAuthAt || '',
      lastActivityAt: lastActivityAt || '',
      booksCompleted: booksCompleted,
      status: resultBooks.length ? (booksCompleted > 0 && booksCompleted === resultBooks.length ? 'completed' : 'started') : 'not_started'
    },
    summary: {
      booksStarted: resultBooks.length,
      totalBookmarks: totalBookmarks,
      totalNotes: totalNotes,
      totalReadingSeconds: totalReadingSeconds,
      totalSessions: totalSessions
    },
    books: resultBooks
  };
}

function handleGetBookReadingOverview_(e) {
  const email = normalizeEmail_(readParam_(e, 'email'));
  const adminCode = readParam_(e, 'adminCode');
  const bookId = sanitizeText_(readParam_(e, 'bookId'));
  const summaryOnly = toBoolean_(readParam_(e, 'summaryOnly'));
  if (!isAdminAuthorized_(email, adminCode)) return { ok: false, message: 'Accès administrateur refusé.' };
  if (!bookId) return { ok: false, message: 'Livre introuvable.' };

  ensureSheets_();
  const books = readBooks_(true);
  const book = books.filter(function(item) { return String(item.bookId || '') === bookId; })[0] || null;
  if (!book) return { ok: false, message: 'Livre introuvable.' };

  const allUsers = buildAssignableUsers_();
  const assignedEmails = normalizeAssignedEmails_(book.assignedEmails);
  const accessSet = {};
  assignedEmails.forEach(function(item) { accessSet[item] = true; });
  var eligibleUsers = allUsers.filter(function(user) {
    if (!book.restrictedAccess) return true;
    return !!accessSet[normalizeEmail_(user.email)];
  });

  const progressMap = getProgressMapByEmailAndBook_();
  const bookmarkCountsMap = summaryOnly ? getBookmarkCountsMapByEmailAndBook_() : null;
  const noteCountsMap = summaryOnly ? getNoteCountsMapByEmailAndBook_() : null;
  const bookmarksMap = summaryOnly ? null : getBookmarksMapByEmailAndBook_();
  const notesMap = summaryOnly ? null : getNotesMapByEmailAndBook_();
  const pageJournalMap = summaryOnly ? null : getPageJournalMapByEmailAndBook_();

  const users = eligibleUsers.map(function(user) {
    const userEmail = normalizeEmail_(user.email);
    const progress = progressMap[userEmail + '||' + bookId] || null;
    const bookmarks = summaryOnly ? [] : ((bookmarksMap[userEmail + '||' + bookId]) || []);
    const notes = summaryOnly ? [] : ((notesMap[userEmail + '||' + bookId]) || []);
    const pageSummary = summaryOnly ? buildEmptyPageJournalSummary_() : ((pageJournalMap[userEmail + '||' + bookId]) || buildEmptyPageJournalSummary_());
    const bookmarksCount = summaryOnly ? Number(bookmarkCountsMap[userEmail + '||' + bookId] || 0) : bookmarks.length;
    const notesCount = summaryOnly ? Number(noteCountsMap[userEmail + '||' + bookId] || 0) : notes.length;
    const hasActivity = !!progress || bookmarksCount > 0 || notesCount > 0 || Number(pageSummary.totalPageViews) > 0;
    const progressPercent = progress ? Number(progress.progressPercent) || 0 : 0;
    const currentPage = progress ? Number(progress.currentPage) || 0 : 0;
    const totalPages = progress ? Number(progress.totalPages) || 0 : Number(book.visiblePageCount) || Number(book.totalPages) || 0;
    const completed = !!totalPages && ((currentPage >= totalPages && currentPage > 0) || progressPercent >= 99.5);
    return {
      email: userEmail,
      firstName: sanitizePersonName_(user.firstName || ''),
      lastName: sanitizePersonName_(user.lastName || ''),
      isExternal: !/@educ\.cscapitale\.qc\.ca$/i.test(userEmail),
      status: completed ? 'completed' : (hasActivity ? 'started' : 'not_started'),
      currentPage: currentPage,
      totalPages: totalPages,
      progressPercent: progressPercent,
      lastUpdated: progress ? progress.lastUpdated : '',
      lastOpenedAt: progress ? progress.lastOpenedAt : '',
      firstOpenedAt: progress ? progress.firstOpenedAt : '',
      sessionCount: progress ? Number(progress.sessionCount) || 0 : 0,
      averageSessionSeconds: progress ? Number(progress.averageSessionSeconds) || 0 : 0,
      completedAt: progress ? progress.completedAt : '',
      lastPageVisited: progress ? Number(progress.lastPageVisited) || 0 : 0,
      readingSeconds: progress ? Number(progress.readingSeconds) || 0 : 0,
      viewedPagesCount: Number(pageSummary.viewedPagesCount) || 0,
      totalPageViews: Number(pageSummary.totalPageViews) || 0,
      lastViewedPage: Number(pageSummary.lastViewedPage) || 0,
      topPages: pageSummary.topPages || [],
      bookmarksCount: bookmarksCount,
      notesCount: notesCount,
      bookmarks: bookmarks,
      notes: notes
    };
  });

  const summary = {
    eligibleUsers: users.length,
    externalUsers: users.filter(function(item) { return item.isExternal; }).length,
    startedUsers: users.filter(function(item) { return item.status === 'started' || item.status === 'completed'; }).length,
    withNotesUsers: users.filter(function(item) { return Number(item.notesCount) > 0; }).length,
    completedUsers: users.filter(function(item) { return item.status === 'completed'; }).length,
    notStartedUsers: users.filter(function(item) { return item.status === 'not_started'; }).length,
    totalSessions: users.reduce(function(sum, item) { return sum + (Number(item.sessionCount) || 0); }, 0)
  };

  return {
    ok: true,
    book: {
      bookId: book.bookId,
      title: book.title,
      author: book.author,
      totalPages: Number(book.totalPages) || 0,
      visiblePageCount: Number(book.visiblePageCount) || Number(book.totalPages) || 0,
      hiddenPagesCount: Number(book.hiddenPagesCount) || 0,
      hiddenPageRanges: String(book.hiddenPageRanges || ''),
      hiddenPagesList: Array.isArray(book.hiddenPagesList) ? book.hiddenPagesList : [],
      restrictedAccess: !!book.restrictedAccess,
      assignedEmails: normalizeAssignedEmails_(book.assignedEmails)
    },
    summary: summary,
    users: users
  };
}

// ════════════════════════════════════════
// PROGRESSION
// ════════════════════════════════════════
function handleGetProgress_(e) {
  const email = normalizeEmail_(readParam_(e, 'email'));
  const bookId = sanitizeText_(readParam_(e, 'bookId'));
  if (!isAuthorizedReader_(email) || !bookId) return { ok: false, message: 'Paramètres invalides.' };

  const sheet = getSheet_(SETTINGS.sheetNames.progress);
  ensureProgressColumns_(sheet);
  const row = findRowByColumns_(sheet, 2, [1, 2], [email, bookId]);
  if (!row) return { ok: true, progress: null };

  const values = sheet.getRange(row, 1, 1, 13).getValues()[0];
  return {
    ok: true,
    progress: normalizeProgressRow_(values)
  };
}

function handleSaveProgress_(e) {
  const email = normalizeEmail_(readParam_(e, 'email'));
  const bookId = sanitizeText_(readParam_(e, 'bookId'));
  const title = sanitizeText_(readParam_(e, 'title'));
  const currentPage = clampNumber_(readParam_(e, 'currentPage'), 1, 100000, 1);
  const totalPages = clampNumber_(readParam_(e, 'totalPages'), 0, 100000, 0);
  const progressPercent = clampNumber_(readParam_(e, 'progressPercent'), 0, 100, 0);
  const readSecondsDelta = clampNumber_(readParam_(e, 'readSecondsDelta'), 0, 86400, 0);
  const lastOpenedAtRaw = sanitizeText_(readParam_(e, 'lastOpenedAt'));

  if (!isAuthorizedReader_(email) || !bookId) return { ok: false, message: 'Paramètres invalides.' };

  return withLock_(function() {
    const sheet = getSheet_(SETTINGS.sheetNames.progress);
    ensureProgressColumns_(sheet);
    const row = findRowByColumns_(sheet, 2, [1, 2], [email, bookId]);
    var existing = null;
    if (row) {
      existing = normalizeProgressRow_(sheet.getRange(row, 1, 1, 13).getValues()[0]);
    }
    const now = new Date();
    const previousOpenedAt = existing ? String(existing.lastOpenedAt || '') : '';
    const nextOpenedAt = lastOpenedAtRaw || previousOpenedAt;
    const nextReadingSeconds = Math.max(0, Number(existing ? existing.readingSeconds : 0) || 0) + Math.max(0, Number(readSecondsDelta) || 0);
    const firstOpenedAt = (existing && existing.firstOpenedAt) || nextOpenedAt || '';
    const isNewSession = !!lastOpenedAtRaw && String(lastOpenedAtRaw) !== String(previousOpenedAt || '');
    const sessionCount = Math.max(0, Number(existing ? existing.sessionCount : 0) || 0) + (isNewSession ? 1 : (row ? 0 : 1));
    const lastPageVisited = currentPage;
    const completedAt = (totalPages > 0 && (currentPage >= totalPages || progressPercent >= 99.5))
      ? ((existing && existing.completedAt) || now)
      : (existing ? existing.completedAt : '');
    const rowValues = [[email, bookId, title, currentPage, totalPages, progressPercent, now, nextOpenedAt || '', nextReadingSeconds, firstOpenedAt || '', sessionCount, lastPageVisited, completedAt || '']];
    if (row) {
      sheet.getRange(row, 1, 1, 13).setValues(rowValues);
      return { ok: true, message: 'Progression mise à jour.' };
    }
    sheet.getRange(sheet.getLastRow() + 1, 1, 1, 13).setValues(rowValues);
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
    var createdAt = new Date();
    if (!row) {
      sheet.getRange(sheet.getLastRow() + 1, 1, 1, 5).setValues([[email, bookId, page, createdAt, '']]);
    }
    return { ok: true, message: 'Signet enregistré.', bookmark: { email: email, bookId: bookId, page: page, createdAt: createdAt, label: '' } };
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
    if (row) sheet.getRange(row, 1, 1, 5).clearContent();
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
  const restrictedAccess = toBoolean_(readParam_(e, 'restrictedAccess'));
  const assignedEmails = normalizeAssignedEmails_(readParam_(e, 'assignedEmails'));
  const hiddenPageRanges = normalizePageRanges_(readParam_(e, 'hiddenPageRanges'));
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
  if (restrictedAccess && !assignedEmails.length) {
    return { ok: false, message: 'Choisis au moins un utilisateur pour une attribution restreinte.' };
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
    hiddenPageRanges: hiddenPageRanges || '',
    restrictedAccess: restrictedAccess,
    assignedEmails: assignedEmails
  });
  upsertBookSettingsRow_({
    bookId: bookId,
    description: '',
    pdfAllowed: false,
    hiddenPageRanges: hiddenPageRanges || '',
    restrictedAccess: restrictedAccess,
    assignedEmails: assignedEmails,
    updatedBy: email
  });
  upsertBookVisibilityRow_({
    bookId: bookId,
    hiddenPageRanges: hiddenPageRanges || '',
    updatedBy: email
  });
  SpreadsheetApp.flush();

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

function githubDeleteFileIfExists_(github, path, message) {
  if (!github.token || !path) return false;
  var endpoint = 'https://api.github.com/repos/' +
    encodeURIComponent(github.owner) + '/' +
    encodeURIComponent(github.repo) + '/contents/' +
    path.split('/').map(encodeURIComponent).join('/');

  var headers = {
    Authorization: 'Bearer ' + github.token,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  };

  var getResponse = UrlFetchApp.fetch(endpoint + '?ref=' + encodeURIComponent(github.branch), {
    method: 'get',
    headers: headers,
    muteHttpExceptions: true
  });
  var getCode = getResponse.getResponseCode();
  if (getCode === 404) return false;
  if (getCode !== 200) {
    throw new Error('Échec lecture GitHub ' + getCode + ' pour ' + path + ' : ' + getResponse.getContentText().slice(0, 300));
  }

  var existing = JSON.parse(getResponse.getContentText() || '{}');
  var sha = existing.sha || '';
  if (!sha) return false;

  var deleteResponse = UrlFetchApp.fetch(endpoint, {
    method: 'delete',
    contentType: 'application/json',
    headers: headers,
    payload: JSON.stringify({
      message: message || ('Delete file: ' + path),
      sha: sha,
      branch: github.branch
    }),
    muteHttpExceptions: true
  });

  var deleteCode = deleteResponse.getResponseCode();
  if (deleteCode === 404) return false;
  if (deleteCode < 200 || deleteCode >= 300) {
    throw new Error('Échec suppression GitHub ' + deleteCode + ' pour ' + path + ' : ' + deleteResponse.getContentText().slice(0, 300));
  }
  return true;
}

function deleteRowsByColumns_(sheet, columns, values, startRow) {
  var targetSheet = sheet;
  var rowStart = Math.max(2, Number(startRow) || 2);
  var lastRow = targetSheet.getLastRow();
  if (lastRow < rowStart) return 0;
  var maxColumn = Math.max.apply(null, [targetSheet.getLastColumn()].concat(columns || [1]));
  var rows = targetSheet.getRange(rowStart, 1, lastRow - rowStart + 1, maxColumn).getValues();
  var rowsToDelete = [];

  rows.forEach(function(row, index) {
    var matches = (columns || []).every(function(columnNumber, valueIndex) {
      return String(row[columnNumber - 1] || '') === String(values[valueIndex] || '');
    });
    if (matches) rowsToDelete.push(rowStart + index);
  });

  rowsToDelete.reverse().forEach(function(rowNumber) {
    targetSheet.deleteRow(rowNumber);
  });
  return rowsToDelete.length;
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
function buildBookRowValues_(book, existing) {
  var previous = existing || {};
  var assignedEmails = book.assignedEmails !== undefined ? normalizeAssignedEmails_(book.assignedEmails) : normalizeAssignedEmails_(previous.assignedEmails || []);
  var hiddenPageRanges = book.hiddenPageRanges !== undefined ? normalizePageRanges_(book.hiddenPageRanges) : normalizePageRanges_(previous.hiddenPageRanges || '');
  return [[
    sanitizeText_(book.bookId),
    sanitizeText_(book.title, 300),
    sanitizeText_(book.author, 300),
    !!book.published,
    sanitizeText_(book.pdfPath),
    sanitizeText_(book.jsonPath),
    sanitizeText_(book.coverPath || previous.coverPath || ''),
    Number(book.totalPages) || 0,
    sanitizeText_(book.sourceFileName || ''),
    book.description !== undefined ? sanitizeText_(book.description, 500) : sanitizeText_(previous.description || '', 500),
    book.lastPublishedAt instanceof Date
      ? book.lastPublishedAt
      : (previous.lastPublishedAt ? new Date(previous.lastPublishedAt) : new Date()),
    sanitizeText_(book.lastUpdatedBy || previous.lastUpdatedBy || ''),
    book.pdfAllowed !== undefined ? !!book.pdfAllowed : !!previous.pdfAllowed,
    hiddenPageRanges,
    book.restrictedAccess !== undefined ? !!book.restrictedAccess : !!previous.restrictedAccess,
    serializeAssignedEmails_(assignedEmails)
  ]];
}

function normalizePageRangeText_(value) {
  return String(value || '').replace(/[‐‑‒–—−﹘﹣－]/g, '-');
}

function getHiddenPagesList_(hiddenPageRanges, totalPages) {
  var total = Math.max(0, Number(totalPages) || 0);
  var pages = [];
  var seen = {};
  normalizePageRangeText_(hiddenPageRanges)
    .split(/[;,]+/)
    .map(function(part) { return String(part || '').trim(); })
    .forEach(function(part) {
      if (!part) return;
      var rangeMatch = part.match(/^(\d+)\s*-\s*(\d+)$/);
      if (rangeMatch) {
        var start = Number(rangeMatch[1]);
        var end = Number(rangeMatch[2]);
        if (!isFinite(start) || !isFinite(end)) return;
        if (start > end) {
          var temp = start;
          start = end;
          end = temp;
        }
        for (var page = start; page <= end; page++) {
          if (page < 1) continue;
          if (total && page > total) break;
          if (!seen[page]) {
            seen[page] = true;
            pages.push(page);
          }
        }
        return;
      }
      var single = Number(part);
      if (!isFinite(single) || single < 1) return;
      if (total && single > total) return;
      if (!seen[single]) {
        seen[single] = true;
        pages.push(single);
      }
    });
  return pages.sort(function(a, b) { return a - b; });
}

function enrichBookRecord_(book) {
  var hiddenPagesList = getHiddenPagesList_(book.hiddenPageRanges, book.totalPages);
  book.hiddenPagesList = hiddenPagesList;
  book.hiddenPagesCount = hiddenPagesList.length;
  book.visiblePageCount = Math.max(0, (Number(book.totalPages) || 0) - hiddenPagesList.length);
  return book;
}

function normalizeBookSettingsRow_(row) {
  var values = Array.isArray(row) ? row : [];
  function at(index) {
    return index < values.length ? values[index] : '';
  }
  return {
    __exists: true,
    bookId: String(at(0) || ''),
    description: String(at(1) || ''),
    pdfAllowed: toBoolean_(at(2)),
    hiddenPageRanges: normalizePageRanges_(at(3)),
    restrictedAccess: toBoolean_(at(4)),
    assignedEmails: normalizeAssignedEmails_(at(5)),
    updatedAt: formatStoredDate_(at(6)),
    updatedBy: String(at(7) || '')
  };
}

function applyBookSettingsToBook_(book, settings) {
  var merged = Object.assign({}, book || {});
  if (settings && settings.__exists) {
    merged.description = String(settings.description || '');
    merged.pdfAllowed = !!settings.pdfAllowed;
    merged.hiddenPageRanges = normalizePageRanges_(settings.hiddenPageRanges || '');
    merged.restrictedAccess = !!settings.restrictedAccess;
    merged.assignedEmails = normalizeAssignedEmails_(settings.assignedEmails || []);
  }
  return enrichBookRecord_(merged);
}

function normalizeBookVisibilityRow_(row) {
  var values = Array.isArray(row) ? row : [];
  function at(index) {
    return index < values.length ? values[index] : '';
  }
  return {
    __exists: true,
    bookId: String(at(0) || ''),
    hiddenPageRanges: normalizePageRanges_(at(1)),
    updatedAt: formatStoredDate_(at(2)),
    updatedBy: String(at(3) || '')
  };
}

function applyBookVisibilityToBook_(book, visibility) {
  var merged = Object.assign({}, book || {});
  if (visibility && visibility.__exists) {
    merged.hiddenPageRanges = normalizePageRanges_(visibility.hiddenPageRanges || merged.hiddenPageRanges || '');
  }
  return enrichBookRecord_(merged);
}

function getBookVisibilityMap_(sheet) {
  var targetSheet = sheet || getSheet_(SETTINGS.sheetNames.bookVisibility);
  ensureBookVisibilityColumns_(targetSheet);
  var map = {};
  var lastRow = targetSheet.getLastRow();
  if (lastRow < 2) return map;
  var rows = targetSheet.getRange(2, 1, lastRow - 1, 4).getValues();
  rows.forEach(function(row, index) {
    var item = normalizeBookVisibilityRow_(row);
    if (!item.bookId) return;
    item.rowNumber = index + 2;
    map[item.bookId] = item;
  });
  return map;
}

function upsertBookVisibilityRow_(settings) {
  var targetSheet = getSheet_(SETTINGS.sheetNames.bookVisibility);
  ensureBookVisibilityColumns_(targetSheet);
  var bookId = sanitizeText_(settings.bookId);
  if (!bookId) throw new Error('bookId requis pour BookVisibility.');
  var row = findRowByColumns_(targetSheet, 2, [1], [bookId]);
  var existingMap = getBookVisibilityMap_(targetSheet);
  var existing = existingMap[bookId] || { __exists: false };
  var values = [[
    bookId,
    settings.hiddenPageRanges !== undefined ? normalizePageRanges_(settings.hiddenPageRanges) : normalizePageRanges_(existing.hiddenPageRanges || ''),
    new Date(),
    sanitizeText_(settings.updatedBy || existing.updatedBy || '')
  ]];
  if (row) targetSheet.getRange(row, 1, 1, 4).setValues(values);
  else targetSheet.getRange(targetSheet.getLastRow() + 1, 1, 1, 4).setValues(values);
}

function getBookSettingsMap_(sheet) {
  var targetSheet = sheet || getSheet_(SETTINGS.sheetNames.bookSettings);
  ensureBookSettingsColumns_(targetSheet);
  var map = {};
  var lastRow = targetSheet.getLastRow();
  if (lastRow < 2) return map;
  var rows = targetSheet.getRange(2, 1, lastRow - 1, 8).getValues();
  rows.forEach(function(row, index) {
    var item = normalizeBookSettingsRow_(row);
    if (!item.bookId) return;
    item.rowNumber = index + 2;
    map[item.bookId] = item;
  });
  return map;
}

function upsertBookSettingsRow_(settings) {
  var targetSheet = getSheet_(SETTINGS.sheetNames.bookSettings);
  ensureBookSettingsColumns_(targetSheet);
  var bookId = sanitizeText_(settings.bookId);
  if (!bookId) throw new Error('bookId requis pour BookSettings.');
  var row = findRowByColumns_(targetSheet, 2, [1], [bookId]);
  var existingMap = getBookSettingsMap_(targetSheet);
  var existing = existingMap[bookId] || { __exists: false };
  var values = [[
    bookId,
    settings.description !== undefined ? sanitizeText_(settings.description, 500) : String(existing.description || ''),
    settings.pdfAllowed !== undefined ? !!settings.pdfAllowed : !!existing.pdfAllowed,
    settings.hiddenPageRanges !== undefined ? normalizePageRanges_(settings.hiddenPageRanges) : normalizePageRanges_(existing.hiddenPageRanges || ''),
    settings.restrictedAccess !== undefined ? !!settings.restrictedAccess : !!existing.restrictedAccess,
    settings.assignedEmails !== undefined ? serializeAssignedEmails_(normalizeAssignedEmails_(settings.assignedEmails)) : serializeAssignedEmails_(normalizeAssignedEmails_(existing.assignedEmails || [])),
    new Date(),
    sanitizeText_(settings.updatedBy || existing.updatedBy || '')
  ]];
  if (row) targetSheet.getRange(row, 1, 1, 8).setValues(values);
  else targetSheet.getRange(targetSheet.getLastRow() + 1, 1, 1, 8).setValues(values);
}

function normalizeCurrentBookRow_(row) {
  var values = Array.isArray(row) ? row : [];
  function at(index) {
    return index < values.length ? values[index] : '';
  }
  var book = {
    bookId: String(at(0) || ''),
    title: String(at(1) || ''),
    author: String(at(2) || ''),
    published: toBoolean_(at(3)),
    pdfPath: String(at(4) || ''),
    jsonPath: String(at(5) || ''),
    coverPath: String(at(6) || ''),
    totalPages: Number(at(7)) || 0,
    sourceFileName: String(at(8) || ''),
    description: String(at(9) || ''),
    lastPublishedAt: formatStoredDate_(at(10)),
    lastUpdatedBy: String(at(11) || ''),
    pdfAllowed: toBoolean_(at(12)),
    hiddenPageRanges: normalizePageRanges_(at(13)),
    restrictedAccess: toBoolean_(at(14)),
    assignedEmails: normalizeAssignedEmails_(at(15))
  };
  return enrichBookRecord_(book);
}

function normalizeLegacyBookRow_(row) {
  var values = Array.isArray(row) ? row : [];
  function at(index) {
    return index < values.length ? values[index] : '';
  }
  var hiddenPageRanges = isLikelyPageRanges_(at(13)) ? normalizePageRanges_(at(13)) : '';
  var restrictedAccess = isLikelyBooleanValue_(at(14)) ? toBoolean_(at(14)) : false;
  var assignedEmails = normalizeAssignedEmails_(at(15));
  var book = {
    bookId: String(at(0) || ''),
    title: String(at(1) || ''),
    author: String(at(2) || ''),
    published: toBoolean_(at(3)),
    pdfPath: String(at(4) || ''),
    jsonPath: String(at(5) || ''),
    coverPath: String(at(6) || ''),
    totalPages: Number(at(7)) || 0,
    sourceFileName: String(at(8) || ''),
    description: '',
    lastPublishedAt: formatStoredDate_(at(9)),
    lastUpdatedBy: String(at(10) || ''),
    pdfAllowed: toBoolean_(at(11)),
    hiddenPageRanges: hiddenPageRanges,
    restrictedAccess: restrictedAccess,
    assignedEmails: assignedEmails
  };
  return enrichBookRecord_(book);
}

function isLegacyBookRow_(row) {
  var values = Array.isArray(row) ? row : [];
  if (!values.length) return false;
  var c10 = values.length > 9 ? values[9] : '';
  var c11 = values.length > 10 ? values[10] : '';
  var c12 = values.length > 11 ? values[11] : '';
  var c13 = values.length > 12 ? values[12] : '';
  var looksLegacyCore = isLikelyDateValue_(c10) || (isLikelyPersonOrEmail_(c11) && isLikelyBooleanValue_(c12));
  if (!looksLegacyCore) return false;
  if (isLikelyFreeTextDescription_(c10)) return false;
  if (isLikelyPageRanges_(c13)) return false;
  return true;
}

function migrateLegacyBooksRows_(sheet) {
  var targetSheet = sheet || getSheet_(SETTINGS.sheetNames.books);
  ensureBooksExtraColumns_(targetSheet);
  var lastRow = targetSheet.getLastRow();
  if (lastRow < 2) return;
  var rows = targetSheet.getRange(2, 1, lastRow - 1, 16).getValues();
  rows.forEach(function(row, index) {
    if (!isLegacyBookRow_(row)) return;
    var normalized = normalizeLegacyBookRow_(row);
    var values = buildBookRowValues_(normalized, normalized);
    targetSheet.getRange(index + 2, 1, 1, 16).setValues(values);
  });
}

function readBookRow_(sheet, rowNumber, settingsMap, visibilityMap) {
  ensureBooksExtraColumns_(sheet);
  const values = sheet.getRange(rowNumber, 1, 1, 16).getValues()[0];
  const baseBook = normalizeCurrentBookRow_(values);
  const map = settingsMap || getBookSettingsMap_();
  const visMap = visibilityMap || getBookVisibilityMap_();
  return applyBookVisibilityToBook_(applyBookSettingsToBook_(baseBook, map[baseBook.bookId]), visMap[baseBook.bookId]);
}

function readBooks_(includeHidden) {
  const sheet = getSheet_(SETTINGS.sheetNames.books);
  ensureBooksExtraColumns_(sheet);
  migrateLegacyBooksRows_(sheet);
  const settingsMap = getBookSettingsMap_();
  const visibilityMap = getBookVisibilityMap_();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  const rows = sheet.getRange(2, 1, lastRow - 1, 16).getValues();
  return rows
    .map(function(row) { return applyBookVisibilityToBook_(applyBookSettingsToBook_(normalizeCurrentBookRow_(row), settingsMap[String(row[0] || '')]), visibilityMap[String(row[0] || '')]); })
    .filter(function(book) {
      return book.bookId && book.title && (includeHidden || book.published);
    })
    .sort(function(a, b) { return a.title.localeCompare(b.title); });
}

function upsertBookRow_(book) {
  const sheet = getSheet_(SETTINGS.sheetNames.books);
  ensureBooksExtraColumns_(sheet);
  migrateLegacyBooksRows_(sheet);
  const row = findRowByColumns_(sheet, 2, [1], [book.bookId]);
  const existing = row ? readBookRow_(sheet, row) : {
    coverPath: '',
    description: '',
    lastUpdatedBy: '',
    pdfAllowed: false,
    hiddenPageRanges: '',
    restrictedAccess: false,
    assignedEmails: []
  };
  const values = buildBookRowValues_(book, existing);

  if (row) {
    sheet.getRange(row, 1, 1, 16).setValues(values);
  } else {
    sheet.getRange(sheet.getLastRow() + 1, 1, 1, 16).setValues(values);
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
  var bookSettingsSheet = spreadsheet.getSheetByName(SETTINGS.sheetNames.bookSettings) || spreadsheet.insertSheet(SETTINGS.sheetNames.bookSettings);
  var bookVisibilitySheet = spreadsheet.getSheetByName(SETTINGS.sheetNames.bookVisibility) || spreadsheet.insertSheet(SETTINGS.sheetNames.bookVisibility);
  var pageJournalSheet = spreadsheet.getSheetByName(SETTINGS.sheetNames.pageJournal) || spreadsheet.insertSheet(SETTINGS.sheetNames.pageJournal);

  if (whitelistSheet.getLastRow() === 0) {
    whitelistSheet.getRange(1, 1, 1, 4).setValues([['email', 'active', 'note', 'addedAt']]);
    whitelistSheet.setFrozenRows(1);
  }
  if (progressSheet.getLastRow() === 0) {
    progressSheet.getRange(1, 1, 1, 9).setValues([['email', 'bookId', 'title', 'currentPage', 'totalPages', 'progressPercent', 'lastUpdated', 'lastOpenedAt', 'readingSeconds']]);
    progressSheet.setFrozenRows(1);
  } else {
    ensureProgressColumns_(progressSheet);
  }
  if (booksSheet.getLastRow() === 0) {
    booksSheet.getRange(1, 1, 1, 16).setValues([['bookId', 'title', 'author', 'published', 'pdfPath', 'jsonPath', 'coverPath', 'totalPages', 'sourceFileName', 'description', 'lastPublishedAt', 'lastUpdatedBy', 'pdfAllowed', 'hiddenPageRanges', 'restrictedAccess', 'assignedEmails']]);
    booksSheet.setFrozenRows(1);
  } else {
    ensureBooksExtraColumns_(booksSheet);
    migrateLegacyBooksRows_(booksSheet);
  }
  if (bookSettingsSheet.getLastRow() === 0) {
    bookSettingsSheet.getRange(1, 1, 1, 8).setValues([['bookId', 'description', 'pdfAllowed', 'hiddenPageRanges', 'restrictedAccess', 'assignedEmails', 'updatedAt', 'updatedBy']]);
    bookSettingsSheet.setFrozenRows(1);
  } else {
    ensureBookSettingsColumns_(bookSettingsSheet);
  }
  if (bookVisibilitySheet.getLastRow() === 0) {
    bookVisibilitySheet.getRange(1, 1, 1, 4).setValues([['bookId', 'hiddenPageRanges', 'updatedAt', 'updatedBy']]);
    bookVisibilitySheet.setFrozenRows(1);
  } else {
    ensureBookVisibilityColumns_(bookVisibilitySheet);
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
    usersSheet.getRange(1, 1, 1, 6).setValues([['email', 'firstName', 'lastName', 'createdAt', 'updatedAt', 'lastAuthAt']]);
    usersSheet.setFrozenRows(1);
  } else {
    ensureUsersColumns_(usersSheet);
  }
  if (pageJournalSheet.getLastRow() === 0) {
    pageJournalSheet.getRange(1, 1, 1, 8).setValues([['email', 'bookId', 'page', 'lastLoggedAt', 'lastViewedAt', 'viewsCount', 'readingSeconds', 'firstViewedAt']]);
    pageJournalSheet.setFrozenRows(1);
  } else {
    ensurePageJournalColumns_(pageJournalSheet);
  }
  ensureDataIntegrity_();
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
function ensureProgressColumns_(sheet) {
  var targetSheet = sheet || getSheet_(SETTINGS.sheetNames.progress);
  var expected = ['email', 'bookId', 'title', 'currentPage', 'totalPages', 'progressPercent', 'lastUpdated', 'lastOpenedAt', 'readingSeconds', 'firstOpenedAt', 'sessionCount', 'lastPageVisited', 'completedAt'];
  var currentCols = Math.max(targetSheet.getLastColumn(), 1);
  if (currentCols < expected.length) {
    targetSheet.insertColumnsAfter(currentCols, expected.length - currentCols);
  }
  targetSheet.getRange(1, 1, 1, expected.length).setValues([expected]);
  targetSheet.setFrozenRows(1);
}

function ensureBooksExtraColumns_(sheet) {
  var targetSheet = sheet || getSheet_(SETTINGS.sheetNames.books);
  var expected = ['bookId', 'title', 'author', 'published', 'pdfPath', 'jsonPath', 'coverPath', 'totalPages', 'sourceFileName', 'description', 'lastPublishedAt', 'lastUpdatedBy', 'pdfAllowed', 'hiddenPageRanges', 'restrictedAccess', 'assignedEmails'];
  var currentCols = Math.max(targetSheet.getLastColumn(), 1);
  if (currentCols < expected.length) {
    targetSheet.insertColumnsAfter(currentCols, expected.length - currentCols);
  }
  targetSheet.getRange(1, 1, 1, expected.length).setValues([expected]);
  targetSheet.setFrozenRows(1);
}

function ensureBookSettingsColumns_(sheet) {
  var targetSheet = sheet || getSheet_(SETTINGS.sheetNames.bookSettings);
  var expected = ['bookId', 'description', 'pdfAllowed', 'hiddenPageRanges', 'restrictedAccess', 'assignedEmails', 'updatedAt', 'updatedBy'];
  var currentCols = Math.max(targetSheet.getLastColumn(), 1);
  if (currentCols < expected.length) {
    targetSheet.insertColumnsAfter(currentCols, expected.length - currentCols);
  }
  targetSheet.getRange(1, 1, 1, expected.length).setValues([expected]);
  targetSheet.setFrozenRows(1);
}


function ensureBookVisibilityColumns_(sheet) {
  var targetSheet = sheet || getSheet_(SETTINGS.sheetNames.bookVisibility);
  var expected = ['bookId', 'hiddenPageRanges', 'updatedAt', 'updatedBy'];
  var currentCols = Math.max(targetSheet.getLastColumn(), 1);
  if (currentCols < expected.length) {
    targetSheet.insertColumnsAfter(currentCols, expected.length - currentCols);
  }
  targetSheet.getRange(1, 1, 1, expected.length).setValues([expected]);
  targetSheet.setFrozenRows(1);
}

function ensureUsersColumns_(sheet) {
  var targetSheet = sheet || getSheet_(SETTINGS.sheetNames.users);
  var expected = ['email', 'firstName', 'lastName', 'createdAt', 'updatedAt', 'lastAuthAt'];
  var currentCols = Math.max(targetSheet.getLastColumn(), 1);
  if (currentCols < expected.length) {
    targetSheet.insertColumnsAfter(currentCols, expected.length - currentCols);
  }
  targetSheet.getRange(1, 1, 1, expected.length).setValues([expected]);
  targetSheet.setFrozenRows(1);
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


function ensurePageJournalColumns_(sheet) {
  var targetSheet = sheet || getSheet_(SETTINGS.sheetNames.pageJournal);
  var expected = ['email', 'bookId', 'page', 'lastLoggedAt', 'lastViewedAt', 'viewsCount', 'readingSeconds', 'firstViewedAt'];
  var currentCols = Math.max(targetSheet.getLastColumn(), 1);
  if (currentCols < expected.length) {
    targetSheet.insertColumnsAfter(currentCols, expected.length - currentCols);
  }
  targetSheet.getRange(1, 1, 1, expected.length).setValues([expected]);
  targetSheet.setFrozenRows(1);
}

function ensureDataIntegrity_() {
  try {
    ensureProgressColumns_(getSheet_(SETTINGS.sheetNames.progress));
    ensureBooksExtraColumns_(getSheet_(SETTINGS.sheetNames.books));
    ensureBookSettingsColumns_(getSheet_(SETTINGS.sheetNames.bookSettings));
    ensureBookVisibilityColumns_(getSheet_(SETTINGS.sheetNames.bookVisibility));
    ensureUsersColumns_(getSheet_(SETTINGS.sheetNames.users));
    ensureBookmarksExtraColumns_(getSheet_(SETTINGS.sheetNames.bookmarks));
    ensurePageJournalColumns_(getSheet_(SETTINGS.sheetNames.pageJournal));
    PropertiesService.getScriptProperties().setProperty('SCHEMA_VERSION', '2026-04-reading-v2');
  } catch (error) {
    console.error(error);
  }
}

function getUserProfile_(email) {
  var userEmail = normalizeEmail_(email);
  if (!userEmail) return { email: '', firstName: '', lastName: '', createdAt: '', updatedAt: '', lastAuthAt: '', hasProfile: false };
  var sheet = getSheet_(SETTINGS.sheetNames.users);
  ensureUsersColumns_(sheet);
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return { email: userEmail, firstName: '', lastName: '', createdAt: '', updatedAt: '', lastAuthAt: '', hasProfile: false };
  var rows = sheet.getRange(2, 1, lastRow - 1, 6).getValues();
  for (var i = 0; i < rows.length; i++) {
    if (normalizeEmail_(rows[i][0]) === userEmail) {
      var firstName = sanitizePersonName_(rows[i][1] || '');
      var lastName = sanitizePersonName_(rows[i][2] || '');
      return {
        email: userEmail,
        firstName: firstName,
        lastName: lastName,
        createdAt: rows[i][3] || '',
        updatedAt: rows[i][4] || '',
        lastAuthAt: rows[i][5] || '',
        hasProfile: !!(firstName || lastName)
      };
    }
  }
  return { email: userEmail, firstName: '', lastName: '', createdAt: '', updatedAt: '', lastAuthAt: '', hasProfile: false };
}

function touchUserAuth_(email) {
  var userEmail = normalizeEmail_(email);
  if (!userEmail) return;
  var sheet = getSheet_(SETTINGS.sheetNames.users);
  ensureUsersColumns_(sheet);
  var row = findRowByColumns_(sheet, 2, [1], [userEmail]);
  var now = new Date();
  if (row) {
    sheet.getRange(row, 6).setValue(now);
    return;
  }
  sheet.getRange(sheet.getLastRow() + 1, 1, 1, 6).setValues([[userEmail, '', '', now, '', now]]);
}

function normalizeProgressRow_(row) {
  var safe = Array.isArray(row) ? row : [];
  var readingSeconds = Number(safe[8]) || 0;
  var sessionCount = Math.max(0, Number(safe[10]) || 0);
  return {
    email: normalizeEmail_(safe[0] || ''),
    bookId: String(safe[1] || ''),
    title: String(safe[2] || ''),
    currentPage: Number(safe[3]) || 1,
    totalPages: Number(safe[4]) || 0,
    progressPercent: Number(safe[5]) || 0,
    lastUpdated: safe[6] || '',
    lastOpenedAt: safe[7] || '',
    readingSeconds: readingSeconds,
    firstOpenedAt: safe[9] || '',
    sessionCount: sessionCount,
    lastPageVisited: Number(safe[11]) || 0,
    completedAt: safe[12] || '',
    averageSessionSeconds: sessionCount ? Math.round(readingSeconds / sessionCount) : 0
  };
}

function upsertUserProfile_(email, firstName, lastName) {
  var userEmail = normalizeEmail_(email);
  var cleanFirstName = sanitizePersonName_(firstName);
  var cleanLastName = sanitizePersonName_(lastName);
  var sheet = getSheet_(SETTINGS.sheetNames.users);
  ensureUsersColumns_(sheet);
  var row = findRowByColumns_(sheet, 2, [1], [userEmail]);
  var existing = row ? sheet.getRange(row, 1, 1, 6).getValues()[0] : null;
  var createdAt = existing ? (existing[3] || new Date()) : new Date();
  var lastAuthAt = existing ? (existing[5] || '') : '';
  var values = [[userEmail, cleanFirstName, cleanLastName, createdAt, new Date(), lastAuthAt]];
  if (row) {
    sheet.getRange(row, 1, 1, 6).setValues(values);
  } else {
    sheet.getRange(sheet.getLastRow() + 1, 1, 1, 6).setValues(values);
  }
  return { email: userEmail, firstName: cleanFirstName, lastName: cleanLastName, createdAt: createdAt, updatedAt: values[0][4], lastAuthAt: lastAuthAt, hasProfile: !!(cleanFirstName || cleanLastName) };
}

function getLatestDateValue_(values) {
  var latest = '';
  var latestTs = 0;
  (values || []).forEach(function(value) {
    if (!value) return;
    var ts = new Date(value).getTime();
    if (!isNaN(ts) && ts > latestTs) {
      latestTs = ts;
      latest = value;
    }
  });
  return latest;
}

function buildUserBookIdsByEmail_(progressMap, bookmarksMap, notesMap, pageJournalMap) {
  var result = {};
  [progressMap, bookmarksMap, notesMap, pageJournalMap].forEach(function(map) {
    Object.keys(map || {}).forEach(function(key) {
      var parts = key.split('||');
      var email = normalizeEmail_(parts[0] || '');
      var bookId = String(parts[1] || '');
      if (!email || !bookId) return;
      if (!result[email]) result[email] = {};
      result[email][bookId] = true;
    });
  });
  return result;
}

function buildUsersReadingOverviewPayload_() {
  ensureSheets_();
  var users = buildAssignableUsers_();
  var books = readBooks_(false);
  var bookMap = {};
  books.forEach(function(book) {
    if (book && book.bookId) bookMap[String(book.bookId)] = book;
  });
  var progressMap = getProgressMapByEmailAndBook_();
  var bookmarksMap = getBookmarksMapByEmailAndBook_();
  var notesMap = getNotesMapByEmailAndBook_();
  var pageJournalMap = getPageJournalMapByEmailAndBook_();

  var payloadBooks = books.map(function(book) {
    return {
      bookId: String(book.bookId || ''),
      title: String(book.title || book.bookId || ''),
      author: String(book.author || ''),
      restrictedAccess: !!book.restrictedAccess,
      eligibleUsers: 0
    };
  });
  var eligibleCounts = {};

  var userPayload = users.map(function(user) {
    var userEmail = normalizeEmail_(user.email);
    var booksStarted = 0;
    var booksCompleted = 0;
    var totalReadingSeconds = 0;
    var totalSessions = 0;
    var totalBookmarks = 0;
    var totalNotes = 0;
    var latestBookTitle = '';
    var latestBookTs = 0;
    var lastActivityCandidates = [user.lastConnectionAt || ''];
    var lastOpenedAtCandidates = [];
    var bookStatuses = [];

    books.forEach(function(book) {
      if (!isBookAvailableToUser_(book, userEmail, false)) return;
      var bookId = String(book.bookId || '');
      if (!bookId) return;
      eligibleCounts[bookId] = (eligibleCounts[bookId] || 0) + 1;
      var progress = progressMap[userEmail + '||' + bookId] || null;
      var bookmarks = bookmarksMap[userEmail + '||' + bookId] || [];
      var notes = notesMap[userEmail + '||' + bookId] || [];
      var pageSummary = pageJournalMap[userEmail + '||' + bookId] || buildEmptyPageJournalSummary_();
      var totalPages = progress ? Number(progress.totalPages) || 0 : Number(book.visiblePageCount) || Number(book.totalPages) || 0;
      var currentPage = progress ? Number(progress.currentPage) || 0 : 0;
      var percent = progress ? Number(progress.progressPercent) || 0 : 0;
      var completed = !!totalPages && ((currentPage >= totalPages && currentPage > 0) || percent >= 99.5);
      var started = completed || currentPage > 0 || bookmarks.length > 0 || notes.length > 0 || Number(pageSummary.totalPageViews) > 0;
      if (started) booksStarted += 1;
      if (completed) booksCompleted += 1;
      totalReadingSeconds += progress ? Number(progress.readingSeconds) || 0 : 0;
      totalSessions += progress ? Number(progress.sessionCount) || 0 : 0;
      totalBookmarks += bookmarks.length;
      totalNotes += notes.length;
      if (progress) {
        lastActivityCandidates.push(progress.lastUpdated || '', progress.lastOpenedAt || '', progress.completedAt || '');
        lastOpenedAtCandidates.push(progress.lastOpenedAt || '');
      }
      if (pageSummary.lastViewedAt) lastActivityCandidates.push(pageSummary.lastViewedAt);
      bookmarks.forEach(function(bookmark) { if (bookmark.createdAt) lastActivityCandidates.push(bookmark.createdAt); });
      notes.forEach(function(note) { if (note.updatedAt || note.createdAt) lastActivityCandidates.push(note.updatedAt || note.createdAt); });
      var bookLastActivityAt = getLatestDateValue_([
        progress && progress.lastUpdated,
        progress && progress.lastOpenedAt,
        progress && progress.completedAt,
        pageSummary.lastViewedAt
      ].concat(bookmarks.map(function(item) { return item.createdAt || ''; })).concat(notes.map(function(item) { return item.updatedAt || item.createdAt || ''; })));
      var bookLastActivityTs = bookLastActivityAt ? new Date(bookLastActivityAt).getTime() : 0;
      if (bookLastActivityTs > latestBookTs) {
        latestBookTs = bookLastActivityTs;
        latestBookTitle = String(book.title || progress && progress.title || bookId);
      }
      bookStatuses.push({
        bookId: bookId,
        title: String(book.title || progress && progress.title || bookId),
        status: completed ? 'completed' : (started ? 'started' : 'not_started'),
        currentPage: currentPage,
        totalPages: totalPages,
        progressPercent: percent,
        readingSeconds: progress ? Number(progress.readingSeconds) || 0 : 0,
        sessionCount: progress ? Number(progress.sessionCount) || 0 : 0,
        bookmarksCount: bookmarks.length,
        notesCount: notes.length,
        lastOpenedAt: progress ? progress.lastOpenedAt : '',
        lastUpdated: progress ? progress.lastUpdated : '',
        lastActivityAt: bookLastActivityAt || '',
        lastPageVisited: progress ? Number(progress.lastPageVisited) || 0 : 0,
        completedAt: progress ? progress.completedAt : ''
      });
    });

    var lastActivityAt = getLatestDateValue_(lastActivityCandidates);
    var lastOpenedAt = getLatestDateValue_(lastOpenedAtCandidates);
    var status = booksStarted ? (booksCompleted > 0 && booksCompleted === booksStarted ? 'completed' : 'started') : 'not_started';
    return {
      email: userEmail,
      firstName: sanitizePersonName_(user.firstName || ''),
      lastName: sanitizePersonName_(user.lastName || ''),
      fullName: String(user.fullName || ''),
      hasProfile: !!user.hasProfile,
      isExternal: !!user.isExternal,
      createdAt: user.createdAt || '',
      profileUpdatedAt: user.updatedAt || '',
      lastConnectionAt: user.lastConnectionAt || '',
      lastActivityAt: lastActivityAt || '',
      lastOpenedAt: lastOpenedAt || '',
      latestBookTitle: latestBookTitle || '',
      booksStarted: booksStarted,
      booksCompleted: booksCompleted,
      totalReadingSeconds: totalReadingSeconds,
      totalSessions: totalSessions,
      totalBookmarks: totalBookmarks,
      totalNotes: totalNotes,
      availableBookCount: bookStatuses.length,
      bookStatuses: bookStatuses,
      status: status
    };
  });

  payloadBooks = payloadBooks.map(function(book) {
    return Object.assign({}, book, { eligibleUsers: Number(eligibleCounts[book.bookId] || 0) });
  });

  var summary = {
    totalUsers: userPayload.length,
    usersWithProfile: userPayload.filter(function(item) { return item.hasProfile; }).length,
    usersWithoutProfile: userPayload.filter(function(item) { return !item.hasProfile; }).length,
    connectedUsers: userPayload.filter(function(item) { return !!item.lastConnectionAt; }).length,
    neverConnectedUsers: userPayload.filter(function(item) { return !item.lastConnectionAt; }).length,
    startedUsers: userPayload.filter(function(item) { return item.status === 'started' || item.status === 'completed'; }).length,
    notStartedUsers: userPayload.filter(function(item) { return item.status === 'not_started'; }).length,
    completedUsers: userPayload.filter(function(item) { return item.status === 'completed'; }).length
  };

  return { ok: true, summary: summary, users: userPayload, books: payloadBooks };
}

function handleGetUsersReadingOverview_(e) {
  var email = normalizeEmail_(readParam_(e, 'email'));
  var adminCode = readParam_(e, 'adminCode');
  if (!isAdminAuthorized_(email, adminCode)) return { ok: false, message: 'Accès administrateur refusé.' };
  return buildUsersReadingOverviewPayload_();
}

function normalizeAssignedEmails_(raw) {
  if (Array.isArray(raw)) {
    return raw
      .map(function(item) { return normalizeEmail_(item); })
      .filter(function(item, index, array) { return item && isValidEmail_(item) && array.indexOf(item) === index; });
  }
  return parseEmailList_(raw).valid;
}

function serializeAssignedEmails_(raw) {
  return normalizeAssignedEmails_(raw).join(', ');
}

function isLikelyDateValue_(value) {
  if (value instanceof Date) return !isNaN(value.getTime());
  var text = String(value || '').trim();
  if (!text) return false;
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return true;
  if (/^[A-Z][a-z]{2}\s[A-Z][a-z]{2}\s\d{2}\s\d{4}/.test(text)) return true;
  var parsed = new Date(text);
  return !isNaN(parsed.getTime());
}

function formatStoredDate_(value) {
  if (!value) return '';
  var date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return String(value || '');
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
}

function isLikelyBooleanValue_(value) {
  if (typeof value === 'boolean') return true;
  var normalized = String(value || '').trim().toLowerCase();
  return ['true', 'false', '1', '0', 'yes', 'no', 'oui', 'non', 'vrai', 'faux'].indexOf(normalized) !== -1;
}

function isLikelyPageRanges_(value) {
  var text = normalizePageRangeText_(value).trim();
  if (!text) return false;
  return /^\d+(\s*-\s*\d+)?(\s*,\s*\d+(\s*-\s*\d+)?)*$/.test(text);
}

function isLikelyFreeTextDescription_(value) {
  var text = String(value || '').trim();
  if (!text) return false;
  if (isLikelyDateValue_(text)) return false;
  if (isLikelyBooleanValue_(text)) return false;
  if (isLikelyPageRanges_(text)) return false;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return false;
  return true;
}

function isLikelyPersonOrEmail_(value) {
  var text = String(value || '').trim();
  if (!text) return false;
  if (isLikelyDateValue_(text)) return false;
  if (isLikelyBooleanValue_(text)) return false;
  return true;
}

function normalizeBookRecordFromRow_(row) {
  return normalizeCurrentBookRow_(row);
}

function isBookAvailableToUser_(book, email, isAdminUser) {
  if (isAdminUser) return true;
  if (!book || !book.restrictedAccess) return true;
  var allowed = normalizeAssignedEmails_(book.assignedEmails);
  return allowed.indexOf(normalizeEmail_(email)) !== -1;
}


function buildUserBookStats_(email, books) {
  var userEmail = normalizeEmail_(email);
  var statsMap = {};
  var progressMap = getProgressMapByEmailAndBook_();
  var bookmarksMap = getBookmarksMapByEmailAndBook_();
  var notesMap = getNotesMapByEmailAndBook_();
  var pageJournalMap = getPageJournalMapByEmailAndBook_();
  (books || []).forEach(function(book) {
    var bookId = String(book.bookId || '');
    if (!bookId) return;
    var key = userEmail + '||' + bookId;
    var progress = progressMap[key] || null;
    var bookmarks = bookmarksMap[key] || [];
    var notes = notesMap[key] || [];
    var pageSummary = pageJournalMap[key] || buildEmptyPageJournalSummary_();
    var totalPages = progress ? Number(progress.totalPages) || 0 : Number(book.visiblePageCount) || Number(book.totalPages) || 0;
    var currentPage = progress ? Number(progress.currentPage) || 0 : 0;
    var percent = progress ? Number(progress.progressPercent) || 0 : 0;
    var completed = !!totalPages && ((currentPage >= totalPages && currentPage > 0) || percent >= 99.5);
    var started = completed || currentPage > 0 || bookmarks.length > 0 || notes.length > 0 || Number(pageSummary.totalPageViews) > 0;
    statsMap[bookId] = {
      currentPage: currentPage,
      totalPages: totalPages,
      progressPercent: percent,
      lastUpdated: progress ? progress.lastUpdated : '',
      lastOpenedAt: progress ? progress.lastOpenedAt : '',
      firstOpenedAt: progress ? progress.firstOpenedAt : '',
      readingSeconds: progress ? Number(progress.readingSeconds) || 0 : 0,
      sessionCount: progress ? Number(progress.sessionCount) || 0 : 0,
      averageSessionSeconds: progress ? Number(progress.averageSessionSeconds) || 0 : 0,
      lastPageVisited: progress ? Number(progress.lastPageVisited) || 0 : 0,
      completedAt: progress ? progress.completedAt : '',
      bookmarksCount: bookmarks.length,
      notesCount: notes.length,
      viewedPagesCount: Number(pageSummary.viewedPagesCount) || 0,
      totalPageViews: Number(pageSummary.totalPageViews) || 0,
      lastViewedPage: Number(pageSummary.lastViewedPage) || 0,
      status: completed ? 'completed' : (started ? 'started' : 'not_started')
    };
  });
  return statsMap;
}

function attachUserStatsToBook_(book, stats) {
  var payload = {};
  for (var key in book) payload[key] = book[key];
  var meta = stats || {};
  payload.currentPage = Number(meta.currentPage) || 0;
  payload.progressPercent = Number(meta.progressPercent) || 0;
  payload.lastUpdated = meta.lastUpdated || '';
  payload.lastOpenedAt = meta.lastOpenedAt || '';
  payload.firstOpenedAt = meta.firstOpenedAt || '';
  payload.readingSeconds = Number(meta.readingSeconds) || 0;
  payload.sessionCount = Number(meta.sessionCount) || 0;
  payload.averageSessionSeconds = Number(meta.averageSessionSeconds) || 0;
  payload.lastPageVisited = Number(meta.lastPageVisited) || 0;
  payload.completedAt = meta.completedAt || '';
  payload.bookmarksCount = Number(meta.bookmarksCount) || 0;
  payload.notesCount = Number(meta.notesCount) || 0;
  payload.viewedPagesCount = Number(meta.viewedPagesCount) || 0;
  payload.totalPageViews = Number(meta.totalPageViews) || 0;
  payload.lastViewedPage = Number(meta.lastViewedPage) || 0;
  payload.readingStatus = meta.status || 'not_started';
  return payload;
}

function getProgressMapByEmailAndBook_() {
  var sheet = getSheet_(SETTINGS.sheetNames.progress);
  ensureProgressColumns_(sheet);
  var map = {};
  if (sheet.getLastRow() < 2) return map;
  var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 13).getValues();
  rows.forEach(function(row) {
    var item = normalizeProgressRow_(row);
    if (!item.email || !item.bookId) return;
    map[item.email + '||' + item.bookId] = item;
  });
  return map;
}

function getBookmarksMapByEmailAndBook_() {
  var sheet = getSheet_(SETTINGS.sheetNames.bookmarks);
  ensureBookmarksExtraColumns_(sheet);
  var map = {};
  if (sheet.getLastRow() < 2) return map;
  var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 5).getValues();
  rows.forEach(function(row) {
    var rowEmail = normalizeEmail_(row[0]);
    var bookId = String(row[1] || '');
    if (!rowEmail || !bookId || !row[0]) return;
    var key = rowEmail + '||' + bookId;
    if (!map[key]) map[key] = [];
    map[key].push({
      page: Number(row[2]) || 1,
      createdAt: row[3] || '',
      label: String(row[4] || '')
    });
  });
  Object.keys(map).forEach(function(key) {
    map[key].sort(function(a, b) { return a.page - b.page; });
  });
  return map;
}

function getBookmarkCountsMapByEmailAndBook_() {
  var sheet = getSheet_(SETTINGS.sheetNames.bookmarks);
  ensureBookmarksExtraColumns_(sheet);
  var map = {};
  if (sheet.getLastRow() < 2) return map;
  var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues();
  rows.forEach(function(row) {
    var rowEmail = normalizeEmail_(row[0]);
    var bookId = String(row[1] || '');
    if (!rowEmail || !bookId) return;
    var key = rowEmail + '||' + bookId;
    map[key] = (Number(map[key]) || 0) + 1;
  });
  return map;
}

function getNotesMapByEmailAndBook_() {
  var sheet = getSheet_(SETTINGS.sheetNames.notes);
  var map = {};
  if (sheet.getLastRow() < 2) return map;
  var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 7).getValues();
  rows.forEach(function(row) {
    var rowEmail = normalizeEmail_(row[0]);
    var bookId = String(row[1] || '');
    if (!rowEmail || !bookId) return;
    var key = rowEmail + '||' + bookId;
    if (!map[key]) map[key] = [];
    map[key].push({
      page: Number(row[2]) || 1,
      noteId: String(row[3] || ''),
      noteText: String(row[4] || ''),
      createdAt: row[5] || '',
      updatedAt: row[6] || ''
    });
  });
  Object.keys(map).forEach(function(key) {
    map[key].sort(function(a, b) {
      return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
    });
  });
  return map;
}

function buildEmptyPageJournalSummary_() {
  return { viewedPagesCount: 0, totalPageViews: 0, lastViewedPage: 0, topPages: [] };
}

function getNoteCountsMapByEmailAndBook_() {
  var sheet = getSheet_(SETTINGS.sheetNames.notes);
  var map = {};
  if (sheet.getLastRow() < 2) return map;
  var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues();
  rows.forEach(function(row) {
    var rowEmail = normalizeEmail_(row[0]);
    var bookId = String(row[1] || '');
    if (!rowEmail || !bookId) return;
    var key = rowEmail + '||' + bookId;
    map[key] = (Number(map[key]) || 0) + 1;
  });
  return map;
}

function getPageJournalMapByEmailAndBook_() {
  var sheet = getSheet_(SETTINGS.sheetNames.pageJournal);
  ensurePageJournalColumns_(sheet);
  var map = {};
  if (sheet.getLastRow() < 2) return map;
  var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 8).getValues();
  rows.forEach(function(row) {
    var rowEmail = normalizeEmail_(row[0]);
    var bookId = String(row[1] || '');
    var page = Number(row[2]) || 0;
    if (!rowEmail || !bookId || !page) return;
    var key = rowEmail + '||' + bookId;
    if (!map[key]) map[key] = { viewedPagesCount: 0, totalPageViews: 0, lastViewedPage: 0, lastViewedAt: '', topPages: [] };
    map[key].viewedPagesCount += 1;
    var viewsCount = Number(row[5]) || 0;
    map[key].totalPageViews += viewsCount;
    var lastViewedAt = row[4] || row[3] || '';
    if (lastViewedAt && (!map[key].lastViewedAt || new Date(lastViewedAt).getTime() > new Date(map[key].lastViewedAt).getTime())) {
      map[key].lastViewedAt = lastViewedAt;
      map[key].lastViewedPage = page;
    }
    map[key].topPages.push({
      page: page,
      viewsCount: viewsCount,
      readingSeconds: Number(row[6]) || 0,
      lastViewedAt: lastViewedAt
    });
  });
  Object.keys(map).forEach(function(key) {
    map[key].topPages.sort(function(a, b) {
      if (b.viewsCount !== a.viewsCount) return b.viewsCount - a.viewsCount;
      return b.readingSeconds - a.readingSeconds;
    });
    map[key].topPages = map[key].topPages.slice(0, 8);
  });
  return map;
}

function buildAssignableUsers_() {
  var whitelistSheet = getSheet_(SETTINGS.sheetNames.whitelist);
  var usersSheet = getSheet_(SETTINGS.sheetNames.users);
  ensureUsersColumns_(usersSheet);
  var profiles = {};
  var whitelist = [];

  if (usersSheet.getLastRow() >= 2) {
    var userRows = usersSheet.getRange(2, 1, usersSheet.getLastRow() - 1, 6).getValues();
    userRows.forEach(function(row) {
      var email = normalizeEmail_(row[0]);
      if (!email) return;
      var firstName = sanitizePersonName_(row[1] || '');
      var lastName = sanitizePersonName_(row[2] || '');
      profiles[email] = {
        firstName: firstName,
        lastName: lastName,
        createdAt: row[3] || '',
        updatedAt: row[4] || '',
        lastConnectionAt: row[5] || '',
        hasProfile: !!(firstName || lastName)
      };
    });
  }

  if (whitelistSheet.getLastRow() >= 2) {
    var rows = whitelistSheet.getRange(2, 1, whitelistSheet.getLastRow() - 1, 4).getValues();
    rows.forEach(function(row) {
      var email = normalizeEmail_(row[0]);
      if (!email || !toBoolean_(row[1])) return;
      var profile = profiles[email] || { firstName: '', lastName: '', createdAt: '', updatedAt: '', lastConnectionAt: '', hasProfile: false };
      var fullName = [profile.lastName, profile.firstName].filter(Boolean).join(' ');
      whitelist.push({
        email: email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        fullName: fullName,
        hasProfile: !!profile.hasProfile,
        createdAt: profile.createdAt || '',
        updatedAt: profile.updatedAt || '',
        lastConnectionAt: profile.lastConnectionAt || '',
        isExternal: !/@(educ\.)?cscapitale\.qc\.ca$/i.test(email)
      });
    });
  }

  whitelist.sort(function(a, b) {
    if (!!a.hasProfile !== !!b.hasProfile) return a.hasProfile ? -1 : 1;
    var left = a.hasProfile ? ((a.lastName || '').toLowerCase() + '\u0001' + (a.firstName || '').toLowerCase() + '\u0001' + a.email.toLowerCase()) : a.email.toLowerCase();
    var right = b.hasProfile ? ((b.lastName || '').toLowerCase() + '\u0001' + (b.firstName || '').toLowerCase() + '\u0001' + b.email.toLowerCase()) : b.email.toLowerCase();
    return left.localeCompare(right, 'fr-CA');
  });
  return whitelist;
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
  normalizePageRangeText_(raw)
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