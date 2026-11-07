# Mondes Immergés

Expérience web immersive sur les milieux aquatiques en disparition : une page d'accueil, un globe 3D interactif (Three.js) et deux récits.

> Projet étudiant. Le contenu et l'habillage s'inspirent de National Geographic à titre pédagogique ; ce n'est pas un site officiel.

**En ligne :** https://johann-ar.github.io/Mondes-immerges/

| Page                 | URL                                                |
| -------------------- | -------------------------------------------------- |
| Accueil              | `/Mondes-immerges/`                                |
| Globe interactif     | `/Mondes-immerges/interface/`                      |
| Les ombres de la mer | `/Mondes-immerges/interface/les-ombres-de-la-mer/` |
| Into the Okavango    | `/Mondes-immerges/interface/into-the-okavango/`    |

## Développement

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # génère dist/
npm run check      # vérifie qu'aucun fichier référencé ne manque dans dist/
npm run lint       # ESLint
npm run format     # Prettier
npm run preview    # sert dist/ comme sur GitHub Pages
```

Node 20.11 ou plus récent.

## Structure

```
index.html                          Accueil
interface/index.html                Globe 3D
interface/les-ombres-de-la-mer/     Récit (HTML + CSS)
interface/into-the-okavango/        Récit (HTML + CSS)
src/
  accueil/accueil.css               Styles de l'accueil
  interface/                        Code du globe (Three.js, GSAP)
    data/                           Hotspots et redirections vers les récits
    modules/                        Globe, interactions, interface, panneau
  shared/loader.js                  Loader <l-jelly> commun à toutes les pages
  recits/<récit>/                   JS et CSS de chaque récit
public/                             Copié tel quel dans dist/
  fonts/ images/ videos/            Médias partagés (polices, logos, vidéos)
  interface/<récit>/                Images et vidéos de chaque récit
scripts/check-links.mjs             Contrôle des liens du build
.github/workflows/deploy.yml        Build + déploiement GitHub Pages
```

Règles :

- Dans le HTML et le CSS traités par Vite, référencer les médias partagés en absolu (`/images/…`, `/fonts/…`) : Vite ajoute `/Mondes-immerges/` au build.
- Dans le JavaScript du globe, préfixer avec `import.meta.env.BASE_URL`.
- Noms de fichiers en kebab-case, sans espaces ni accents.

## Déploiement

Chaque push sur `main` lance `.github/workflows/deploy.yml`, qui build le site et publie `dist/` sur GitHub Pages (Settings → Pages → Source : GitHub Actions). Aucun fichier compilé n'est versionné.
