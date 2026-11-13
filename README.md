# Mondes Immergés

Huit documentaires National Geographic à explorer sur un globe 3D, au fil des grands courants marins. Fleuve, océan, banquise, grotte noyée, volcan, forêt : chaque point lumineux ouvre la fiche d'un film.

> Projet étudiant non officiel. Les films, photos et marques appartiennent à National Geographic. Les textes sont des résumés rédigés pour ce projet, à partir des pages officielles de chaque documentaire.

**En ligne :** https://johann-ar.github.io/Mondes-immerges/

| Page         | URL                                                        |
| ------------ | ---------------------------------------------------------- |
| Accueil      | `/Mondes-immerges/`                                        |
| Globe        | `/Mondes-immerges/globe/` (`?film=<slug>` ouvre une fiche) |
| Documentaire | `/Mondes-immerges/documentaire/?film=<slug>`               |

Les anciennes adresses (`/interface/`, `/interface/into-the-okavango/`, `/interface/les-ombres-de-la-mer/`, `/accueil/`) redirigent vers les nouvelles.

## Les films

Into the Okavango · Sea of Shadows · The Last Ice · Endurance · Becoming Cousteau · The Rescue · Fire of Love · The Territory.

Toutes les données (lieu, coordonnées, synopsis, chiffres clés, visages, galerie, presse, liens pour agir, générique) sont dans [`src/data/films.js`](src/data/films.js). Ajouter un film, c'est ajouter une entrée : le globe, l'accueil et la page documentaire suivent.

## Le globe

- **Surface** : un shader dessine une carte stylisée à partir d'une seule texture (`public/textures/earth.png` : R = eau, G = relief, B = plateaux continentaux). Le résultat : océan bleu nuit qui s'éclaircit en turquoise sur les plateaux, terres couleur sable ombrées par le relief, pôles nacrés, trait de côte crème.
- **Courants** ([`src/globe/currents.js`](src/globe/currents.js)) : 23 courants chauds, froids et profonds tracés en latitude/longitude. Chaque tracé est lissé (Catmull-Rom) puis rangé dans une texture flottante.
- **Rendu en volume** ([`src/globe/CurrentsLayer.js`](src/globe/CurrentsLayer.js)) : des dizaines de milliers de traînées instanciées, étirées à l'écran entre leur queue et leur tête, réparties en largeur et en altitude. S'y ajoutent des nappes gaussiennes diffuses (splatting) qui donnent du corps au flux. Les courants profonds passent sous la surface.
- **Interaction** ([`src/globe/GlobeView.js`](src/globe/GlobeView.js)) : rotation libre, zoom, rotation automatique au repos. La caméra vole vers le lieu choisi, et le globe se décale pour laisser la place au titre ou à la fiche. Les marqueurs sont en HTML, recalés à chaque image et masqués derrière la planète.
- **Sans WebGL 2**, la page reste utilisable : le bandeau des films et les fiches fonctionnent.

## Développement

```bash
npm install
npm run dev        # serveur Vite
npm run build      # génère dist/
npm run check      # vérifie qu'aucun fichier référencé ne manque dans dist/
npm run lint       # ESLint
npm run format     # Prettier
npm run preview    # sert dist/ comme sur GitHub Pages
```

Node 20.11 ou plus récent. Chaque push sur `main` est déployé sur GitHub Pages par l'action [`deploy.yml`](.github/workflows/deploy.yml).

## Structure

```
index.html                 accueil (animation de flux 2D, sélection des films)
globe/index.html           le globe
documentaire/index.html    la fiche d'un film
src/data/films.js          contenu des huit films
src/globe/                 moteur du globe (three.js)
src/pages/                 un script par page
src/shared/                logo, apparitions au défilement, détection WebGL
src/styles/                base commune + une feuille par page
public/                    polices (Abyss, Geograph), texture, favicon, redirections
```

## Accessibilité

Navigation au clavier (marqueurs, bandeau, fiche, Échap pour fermer), focus visible, lightbox en `<dialog>`, textes alternatifs. Avec `prefers-reduced-motion`, les animations sont coupées ou ralenties.

## Crédits

- Films, photos et textes de référence : [National Geographic Documentary Films](https://films.nationalgeographic.com/). Les photos sont chargées depuis leur CDN, avec leur crédit.
- Texture de la Terre : dérivée des images NASA Blue Marble (via les exemples de three-globe).
- Polices : Abyss, Geograph.
