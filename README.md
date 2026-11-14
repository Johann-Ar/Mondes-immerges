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
2. **Globe** (même page, l'adresse devient `/globe/`) : on fait tourner la planète en glissant ; la molette fait voyager la caméra sur une orbite elliptique qui se décale à chaque tour (elle s'approche et s'éloigne, monte et descend à deux cadences différentes : le point le plus proche change à chaque boucle). Chaque film est un cadre jaune au format de son affiche, son titre toujours à droite et immobile : au survol, le cadre tombe à 90° en tournant sur son centre (il reste dans l'axe du titre), rebondit, puis grandit vers la gauche, autant vers le haut que vers le bas, en ouvrant l'affiche officielle.
3. **Documentaire** : le film, ses visages, sa galerie (les photos arrivent en pile puis se rangent, en mosaïque ou en grille), comment agir, le monde suivant. Un petit globe jaune qui tourne, en bas à gauche, ramène au globe face au film.

Les transitions de page sont les vidéos du logo avec transparence (`public/transition/`, WebM VP9 alpha, et HEVC alpha pour Safari) : le cadre du logo tourne et se referme jusqu'au noir, puis la version inverse s'ouvre sur la page suivante ([`src/shared/transition.js`](src/shared/transition.js)). Les cadres du globe font la même chute au survol. Pas de barre de menu : le logo Mondes Immergés seul, en haut à gauche. Il est en code ([`src/shared/logo.js`](src/shared/logo.js)) : les contours exacts du fichier d'origine, vectorisés par [`scripts/trace-logo.py`](scripts/trace-logo.py), assemblés en variantes (complet, cadre seul, nom seul, empilé ; couleurs et rotation du cadre réglables). Tailles et typographie suivent une échelle fluide (`clamp`) : rien ne saute d'un palier à l'autre. Un grain très fin et un tramage dans les shaders effacent les paliers des dégradés sombres. Le cadre qui penche et devient fenêtre est le motif de tout le projet.

## Le globe

- **WebGPU** (three.js r187, `three/webgpu` et TSL), avec repli automatique sur WebGL 2. Sans l'un ni l'autre, la liste des films devient la page.
- **Courants réels** ([`src/globe/Currents.js`](src/globe/Currents.js)) : le champ de vitesse NASA/JPL OSCAR (1/3°) est rangé dans une texture. Jusqu'à 300 000 particules y sont advectées par un compute shader ; la direction visuelle est celle de l'encre filmée au microscope. Au courant réel s'ajoutent une micro-turbulence (rotationnel d'un bruit, deux échelles, pré-calculé dans une texture) et une agitation brownienne. Chaque particule dépose de l'encre dans une texture équirectangulaire ; à chaque image, cette encre est transportée par le courant, diffuse et s'efface (deux textures en alternance) : des panaches qui s'étalent autour de filaments nets. Les particules sont aussi dessinées en micro-éléments posés sur la surface : des grains qui scintillent et quelques cellules en anneau. Tout est en jaune National Geographic, sans halo ni volume. Les terres sont solides, sur le trait de côte fin de la bathymétrie ETOPO (le champ OSCAR, à 1/3°, laissait passer les splats sur les isthmes et les rivages) : près d'une côte, les particules perdent la part de leur mouvement qui va vers la terre et glissent le long du rivage ; elles y renaissent souvent au large, pour qu'aucun amas lumineux ne se forme. Les cœurs chauds de l'encre ne brillent qu'au large. Les mers sans mesure OSCAR (Méditerranée, mer Noire, mer Rouge, Baltique, baie d'Hudson, marges antarctiques) sont complétées par un courant côtier cyclonique, et le masque océan suit le trait de côte du relief.
- **Nuit et profondeur** : ETOPO1 (NOAA) ombré avec un relief accentué (pentes exagérées, vallées creusées, crêtes soulevées) dans des tons de pierre clairs, sous un clair de lune bas : les courants sont la vraie source de lumière. L'océan est d'autant plus noir et froid qu'il est profond (bathymétrie ETOPO), les plateaux continentaux restent plus clairs ; l'encre s'étouffe légèrement au-dessus des abysses. Les splats flottent à des hauteurs différentes (les courants rapides plus haut).
- **Fleuves** : grands fleuves et rivières de la base GLWD du WWF, tracés en lignes fines et continues sur les terres (lacs et zones humides relient le réseau sans être dessinés). L'encre y descend vers la mer par vagues : leur phase suit la distance à la mer le long du réseau (parcours en largeur depuis les embouchures). Une particule sur dix naît sur un fleuve : un petit splat qui descend le courant (sens tiré du gradient de cette phase), reste au fond du lit et rejoint l'océan à l'embouchure. Là où le sens se perd (confluences contraires, bassins fermés comme l'Okavango), il disparaît au lieu de s'entasser.
- **Interaction** ([`src/globe/Globe.js`](src/globe/Globe.js)) : rotation libre, zoom, rotation automatique au repos, vols de caméra. Les marqueurs sont en HTML, recalés à chaque image, masqués derrière la planète, étiquettes qui se chevauchent effacées. Le survol ne touche jamais la simulation : il est purement visuel et temporaire, un doigt plongé dans l'eau. Sous le curseur, un tourbillon serré et localisé (profil de Lamb-Oseen : rotation maximale sous le doigt, qui retombe vite avec la distance) enroule l'encre et les splats, toujours dans le sens horaire ; le doigt écarte l'eau autour de lui (un léger creux dans l'encre) et le geste l'entraîne sur son passage. Le tourbillon suit le doigt de près, aspire les splats vers le fond, puis se fond dans le dessin d'origine quand il quitte le globe, sans jamais tourner à l'envers. Les micro-éléments en cellule sont cachés : la touche Espace les fait apparaître, pleins, puis les cache à nouveau. Sur les continents, aucune réaction liquide.
- **Textures** : [`scripts/textures.py`](scripts/textures.py) les refabrique depuis le serveur ERDDAP de la NOAA (numpy, scipy, pillow) ; `--from-png currents.png` repart d'une texture existante si le serveur est indisponible. [`scripts/hydro.py`](scripts/hydro.py) fabrique `rivers.png` (présence de l'eau et phase de l'écoulement), `river-seeds.bin` (départs des splats fluviaux) et `depth.jpg` depuis GLWD niveau 3 et ETOPO (avec rasterio).

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
- Relief et bathymétrie : NOAA ETOPO1, via NOAA CoastWatch ERDDAP.
- Eaux douces : WWF Global Lakes and Wetlands Database, niveau 3 (Lehner & Döll, 2004), usage non commercial et éducatif.
- Polices : Abyss, Geograph.
