# Lecteur scolaire hybride avec module administrateur

## Ce que fait cette version
- accès par liste blanche via Google Sheets + Apps Script
- bibliothèque de livres publiés
- lecteur hybride : JSON reflowable en priorité, PDF en secours
- progression enregistrée par élève et par livre
- module administrateur réservé à `tremblay.kevin@cscapitale.qc.ca`
- conversion d'un PDF local en `book.json` dans le navigateur administrateur
- publication automatique du PDF et du JSON dans GitHub via Apps Script
- gestion publier / retirer dans l'interface admin

## Structure GitHub attendue

```text
Lecture/
  index.html
  style.css
  app.js
  config.js
  assets/
    books/
      <bookId>/
        book.pdf
        book.json
```

## Déploiement du site
1. Remplacer dans le dépôt GitHub :
   - `index.html`
   - `style.css`
   - `app.js`
   - `config.js`
2. Publier le dépôt avec GitHub Pages.

## Déploiement Apps Script
1. Ouvrir le Google Sheets
2. `Extensions > Apps Script`
3. Remplacer `Code.gs` et `appsscript.json`
4. Enregistrer
5. Exécuter `setupSpreadsheet`
6. Exécuter `configureSecrets`
7. Dans les **propriétés du script**, modifier ensuite au minimum :
   - `ADMIN_ACCESS_CODE`
   - `GITHUB_TOKEN`

## GitHub token requis
Créer un fine-grained personal access token GitHub avec accès en écriture au dépôt cible, puis le coller dans la propriété de script `GITHUB_TOKEN`.

Valeurs utilisées par défaut :
- owner : `techno-cardi`
- repo : `Lecture`
- branch : `main`
- base path : `assets/books`

## Feuilles Google Sheets créées
### AllowedEmails
- `email`
- `active`
- `note`
- `addedAt`

### Progress
- `email`
- `bookId`
- `title`
- `currentPage`
- `totalPages`
- `progressPercent`
- `lastUpdated`

### Books
- `bookId`
- `title`
- `author`
- `published`
- `pdfPath`
- `jsonPath`
- `totalPages`
- `sourceFileName`
- `lastPublishedAt`
- `lastUpdatedBy`

## Parcours administrateur
1. Se connecter avec `tremblay.kevin@cscapitale.qc.ca`
2. Déverrouiller le module avec le code administrateur
3. Choisir un PDF local
4. Cliquer `Convertir et publier`
5. Le navigateur produit le JSON une seule fois
6. Apps Script envoie automatiquement `book.pdf` et `book.json` dans GitHub
7. Le livre apparaît dans la bibliothèque

## Limites réelles
- la publication automatique dépend d'un token GitHub valide
- les très gros PDF ou les PDF numérisés sans vrai texte sont de mauvais candidats
- l'extraction texte est bien meilleure sur des PDF texte que sur des scans
- l'admin par simple courriel n'est pas sécurisé, d'où l'ajout d'un code administrateur séparé
