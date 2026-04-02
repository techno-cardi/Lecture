# Lecteur PDF protégé pour GitHub Pages

Solution front-end statique + PDF.js + Google Sheets + Google Apps Script.

## Contenu du projet

- `index.html` : interface principale
- `style.css` : styles responsive, mobile first
- `config.js` : configuration à modifier
- `app.js` : logique du lecteur
- `assets/roman.pdf` : PDF à remplacer
- `apps-script/Code.gs` : code du service Google Apps Script
- `apps-script/appsscript.json` : manifeste Apps Script
- `sheet-templates/allowed-emails.csv` : import initial de la liste blanche
- `sheet-templates/progress-headers.csv` : rappel des colonnes de progression

## Architecture

### Front-end GitHub Pages
- Affiche un écran de connexion minimal
- Vérifie le courriel via Apps Script
- Charge le PDF avec PDF.js
- Affiche une seule page à la fois sur canvas
- Enregistre automatiquement la page, la position dans la page et la progression globale

### Google Sheets
Utilisé comme base légère avec 2 onglets:

1. `AllowedEmails`
   - `email`
   - `active`
   - `note`
   - `addedAt`

2. `Progress`
   - `key`
   - `email`
   - `docId`
   - `docName`
   - `page`
   - `pageProgress`
   - `overallProgress`
   - `lastSeen`
   - `userAgent`

### Google Apps Script
- `auth` : vérifie que le courriel est valide, dans le bon domaine et présent dans la liste blanche
- `getProgress` : retourne la dernière progression pour un couple `email + docId`
- `saveProgress` : crée ou met à jour la ligne de progression

## Mise en place

### 1. Préparer le Google Sheets
1. Crée un nouveau Google Sheets.
2. Renomme le premier onglet en `AllowedEmails`.
3. Crée un second onglet nommé `Progress`.
4. Dans `AllowedEmails`, colle le contenu du fichier `sheet-templates/allowed-emails.csv`.
5. Laisse l'onglet `Progress` vide ou crée seulement les en-têtes avec `sheet-templates/progress-headers.csv`.

### 2. Ajouter Apps Script
1. Dans le Google Sheets, ouvre `Extensions > Apps Script`.
2. Remplace le contenu du projet par `apps-script/Code.gs`.
3. Ouvre `Paramètres du projet` et vérifie que le fuseau horaire est `America/Montreal`.
4. Sauvegarde.
5. Exécute une première fois la fonction `setupSpreadsheet` pour créer les en-têtes si besoin.
6. Autorise le script.

### 3. Déployer Apps Script en web app
1. Clique `Déployer > Nouveau déploiement`.
2. Type de déploiement: `Application Web`.
3. Description: par exemple `Production`.
4. Exécuter en tant que: `Moi`.
5. Qui a accès: `Toute personne`.
6. Déploie.
7. Copie l'URL `/exec`.

## Important
Cette option `Toute personne` est la plus simple pour un site GitHub Pages public. La sécurité repose alors sur:
- le contrôle par liste blanche
- le fait que seules des données légères sont exposées
- l'absence de données sensibles dans les réponses

Si tu veux une vraie protection forte du fichier PDF, il faut quitter GitHub Pages et passer à un backend authentifié.

### 4. Configurer le site
Modifie `config.js`:

```js
window.READER_CONFIG = {
  appTitle: "Lecteur PDF protégé",
  documentId: "roman-2026",
  documentName: "Roman",
  pdfUrl: "./assets/roman.pdf",
  appsScriptUrl: "COLLE_ICI_L_URL_EXEC",
  allowedDomains: ["educ.cscapitale.qc.ca", "cscapitale.qc.ca"],
  pdfJsVersion: "5.6.205",
  saveDebounceMs: 2200,
  autoSaveOnScrollMs: 700,
  minZoom: 0.8,
  maxZoom: 2.2,
  zoomStep: 0.15
};
```

### 5. Ajouter le PDF
- Remplace `assets/roman.pdf` par ton vrai document.
- Garde le même nom ou modifie `pdfUrl`.

### 6. Publier sur GitHub Pages
1. Crée un dépôt GitHub.
2. Ajoute tous les fichiers du dossier.
3. Place ton PDF dans `assets/roman.pdf`.
4. Commit et pousse.
5. Dans `Settings > Pages`, choisis:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/root`
6. Publie.
7. L'URL finale ressemblera à:
   - `https://nom-utilisateur.github.io/nom-du-depot/`

## Remplacer plus tard le PDF

Pour changer de document, il suffit idéalement de:
1. remplacer `assets/roman.pdf`
2. changer `documentId`
3. changer `documentName`
4. republier

### Pourquoi changer `documentId`
Le `documentId` sert à distinguer les progressions. Si tu gardes le même identifiant, les anciennes positions de lecture pourront être réutilisées.

## Expérience élève
Parcours attendu:
1. ouverture du site
2. entrée du courriel
3. validation
4. chargement automatique du PDF
5. reprise à la dernière page et à la dernière position

## Limites réelles
Cette solution réduit les usages évidents, mais ne protège pas parfaitement le PDF.

### Ce qui est limité
- pas de bouton natif de téléchargement
- pas de couche texte PDF.js, donc pas de copier-coller direct du texte
- blocage du clic droit, de la sélection et des raccourcis courants
- rendu en canvas seulement

### Ce qui reste possible pour un utilisateur motivé
- capture d'écran
- récupération des requêtes réseau via outils développeur
- extraction du fichier si quelqu'un inspecte techniquement le site

GitHub Pages reste un hébergement statique public. Donc:
- l'accès au lecteur peut être filtré
- l'accès au fichier lui-même ne peut pas être verrouillé de façon forte côté client seulement

## Ajustements simples possibles
- changer les domaines autorisés dans `config.js` et `apps-script/Code.gs`
- ajouter ou désactiver des élèves dans `AllowedEmails`
- consulter la feuille `Progress` pour voir les dernières pages consultées
- dupliquer la structure pour d'autres documents avec un autre `documentId`

## Conseils de maintenance
- garde une copie locale du projet
- épingle la version de PDF.js
- republie Apps Script après chaque changement côté script
- teste sur iPhone Safari et Android Chrome après chaque remplacement de PDF
