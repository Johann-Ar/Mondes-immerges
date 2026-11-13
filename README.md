# Mondes Immergés

Un site d'immersion autour de huit documentaires National Geographic : un globe animé par les vrais courants de surface mesurés par satellite (NASA OSCAR), sur lequel chaque cadre jaune ouvre un film. Direction artistique National Geographic : noir, jaune, blanc.

> Projet étudiant non officiel. Les films, photos et marques appartiennent à National Geographic. Les textes sont des résumés rédigés pour ce projet, à partir des pages officielles de chaque documentaire.

**En ligne :** https://johann-ar.github.io/Mondes-immerges/

| Page         | URL                                                         |
| ------------ | ----------------------------------------------------------- |
| Accueil      | `/Mondes-immerges/`                                         |
| Globe        | `/Mondes-immerges/globe/` (`?from=<slug>` : face à ce film) |
| Documentaire | `/Mondes-immerges/documentaire/?film=<slug>`                |

Les anciennes adresses (`/interface/`, `/interface/into-the-okavango/`, `/interface/les-ombres-de-la-mer/`, `/accueil/`) redirigent vers les nouvelles.

## Les films

Into the Okavango · Sea of Shadows · The Last Ice · Endurance · Becoming Cousteau · The Rescue · Fire of Love · The Territory.

Toutes les données (lieu, coordonnées, synopsis, chiffres clés, visages, galerie, presse, liens pour agir, générique) sont dans [`src/data/films.js`](src/data/films.js). Ajouter un film, c'est ajouter une entrée : le globe, l'accueil et la page documentaire suivent.

## Le parcours

1. **Accueil** : le titre, une phrase, un seul bouton. Le globe tourne déjà, décalé à droite.
2. **Globe** (même page, l'adresse devient `/globe/`) : on fait tourner la planète, chaque film est un cadre jaune ; au survol il s'ouvre sur une image du film, au clic il se referme sur l'écran.
3. **Documentaire** : le film, ses visages, sa galerie, comment agir, le monde suivant. Le retour ramène le globe face au film.

Les transitions de page reprennent le cadre jaune : il se referme autour de l'élément cliqué, puis s'ouvre sur la page suivante ([`src/shared/transition.js`](src/shared/transition.js)). « Les films », dans la barre, donne accès direct à la liste.

## Le globe

- **WebGPU** (three.js r187, `three/webgpu` et TSL), avec repli automatique sur WebGL 2. Sans l'un ni l'autre, la liste des films devient la page.
- **Courants réels** ([`src/globe/Currents.js`](src/globe/Currents.js)) : le champ de vitesse NASA/JPL OSCAR (1/3°) est rangé dans une texture. Jusqu'à 240 000 particules y sont advectées par un compute shader ; chacune laisse une traînée dans une texture équirectangulaire qui s'efface lentement, plaquée sur le globe. Les particules des courants rapides sont aussi dessinées en taches gaussiennes au-dessus de l'océan (splatting), et un bloom fait briller les grands courants (Gulf Stream, Kuroshio, Agulhas, courant circumpolaire).
- **Relief** : ETOPO1 (NOAA) ombré, terres couleur pierre, océan noir.
- **Interaction** ([`src/globe/Globe.js`](src/globe/Globe.js)) : rotation libre, zoom, rotation automatique au repos, vols de caméra. Les marqueurs sont en HTML, recalés à chaque image, masqués derrière la planète, étiquettes qui se chevauchent effacées.
- **Textures** : [`scripts/textures.py`](scripts/textures.py) les refabrique depuis le serveur ERDDAP de la NOAA (numpy, scipy, pillow).

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
index.html                 accueil (globe en mode intro)
globe/index.html           le globe (même script, mode explore)
documentaire/index.html    la fiche d'un film
src/data/films.js          contenu des huit films
src/globe/                 globe WebGPU et simulation des courants
scripts/                   fabrication des textures, vérification des liens
src/pages/                 un script par page
src/shared/                en-tête, transitions, apparitions au défilement
src/styles/                base commune + une feuille par page
public/                    polices (Abyss, Geograph), textures, logos, favicon, redirections
```

## Accessibilité

Navigation au clavier (marqueurs, liste des films, fiche, Échap pour fermer), focus visible, lightbox en `<dialog>`, textes alternatifs. Avec `prefers-reduced-motion`, les animations sont coupées ou ralenties.

## Crédits

- Films, photos et textes de référence : [National Geographic Documentary Films](https://films.nationalgeographic.com/). Les photos sont chargées depuis leur CDN, avec leur crédit.
- Courants : NASA/JPL OSCAR (Ocean Surface Current Analysis Real-time), via NOAA CoastWatch ERDDAP.
- Relief : NOAA ETOPO1, via NOAA CoastWatch ERDDAP.
- Polices : Abyss, Geograph.
