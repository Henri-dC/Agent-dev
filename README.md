# Simple Tailwind CSS Site

Ce projet contient désormais une seule page `index.html` stylisée avec Tailwind CSS, affichant simplement le mot "Bonjour".

## Structure du Projet

- `index.html`: La page d'accueil avec "Bonjour" au milieu.
- `css/main.css`: Fichier d'importation des directives Tailwind CSS.
- `tailwind.config.js`: Configuration de Tailwind CSS.
- `postcss.config.js`: Configuration de PostCSS (utilisé par Tailwind).
- `vite.config.js`: Configuration de Vite pour le développement et la compilation.

## Comment Lancer le Projet

Ce projet utilise Vite pour le développement.

```sh
npm install
```

### Compiler et Lancer en Développement

```sh
npm run dev
```

Ouvre votre navigateur à l'adresse indiquée (généralement `http://localhost:5173`) pour voir le site en action.

### Compiler pour la Production

```sh
npm run build
```

Cela créera une version optimisée du site dans le dossier `dist/`.