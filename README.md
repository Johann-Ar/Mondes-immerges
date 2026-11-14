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
2. **Globe** (même page, l'adresse devient `/globe/`) : on fait tourner la planète en glissant ; la molette fait voyager la caméra sur une orbite elliptique qui se décale à chaque tour (elle s'approche et s'éloigne, monte et descend à deux cadences différentes : le point le plus proche change à chaque boucle). Chaque film est un cadre jaune au format de son affiche : au survol, il tombe à 90° sur son coin ; pendant la chute, le titre descend se caler sur le coin bas du cadre couché et arrive en même temps que lui ; puis le cadre grandit vers le haut en ouvrant l'affiche officielle, titre en diagonale basse. Près du bord gauche, tout passe en miroir.
3. **Documentaire** : le film, ses visages, sa galerie (les photos arrivent en pile puis se rangent, en mosaïque ou en grille), comment agir, le monde suivant. Un petit globe jaune qui tourne, en bas à gauche, ramène au globe face au film.

Les transitions de page sont les vidéos du logo avec transparence (`public/transition/`, WebM VP9 alpha, et HEVC alpha pour Safari) : le cadre du logo tourne et se referme jusqu'au noir, puis la version inverse s'ouvre sur la page suivante ([`src/shared/transition.js`](src/shared/transition.js)). Les cadres du globe font la même chute au survol. Pas de barre de menu : National Geographic en haut à gauche, Mondes Immergés à droite, à la même hauteur optique. Le logo Mondes Immergés est entièrement codé ([`src/shared/logo.js`](src/shared/logo.js)) : cadre en SVG (inclinaison, vague, épaisseur, couleur réglables) et nom en texte, avec ses variantes (complet, cadre seul, empilé, sobre, monochrome). Tailles et typographie suivent une échelle fluide (`clamp`) : rien ne saute d'un palier à l'autre. Un grain très fin et un tramage dans les shaders effacent les paliers des dégradés sombres. Sur le globe, un curseur règle la teinte des courants, de l'or au jaune National Geographic. Le cadre qui penche et devient fenêtre est le motif de tout le projet.

## Le globe

- **WebGPU** (three.js r187, `three/webgpu` et TSL), avec repli automatique sur WebGL 2. Sans l'un ni l'autre, la liste des films devient la page.
- **Courants réels** ([`src/globe/Currents.js`](src/globe/Currents.js)) : le champ de vitesse NASA/JPL OSCAR (1/3°) est rangé dans une texture. Jusqu'à 300 000 particules y sont advectées par un compute shader ; chacune laisse une traînée dans une texture équirectangulaire qui s'efface lentement, plaquée sur le globe. Un grain fixe donne aux traînées un aspect de sable doré ; les particules sont aussi dessinées en micro-splats qui scintillent, posés sur la surface (plus gros et plus clairs sur les courants rapides) : la lumière reste sur les courants, sans halo ni volume. Les mers sans mesure OSCAR (Méditerranée, mer Noire, mer Rouge, Baltique, baie d'Hudson, marges antarctiques) sont complétées par un courant côtier cyclonique, et le masque océan suit le trait de côte du relief.
- **Relief** : ETOPO1 (NOAA) ombré, terres couleur pierre, océan noir.
- **Interaction** ([`src/globe/Globe.js`](src/globe/Globe.js)) : rotation libre, zoom, rotation automatique au repos, vols de caméra. Les marqueurs sont en HTML, recalés à chaque image, masqués derrière la planète, étiquettes qui se chevauchent effacées.
- **Textures** : [`scripts/textures.py`](scripts/textures.py) les refabrique depuis le serveur ERDDAP de la NOAA (numpy, scipy, pillow) ; `--from-png currents.png` repart d'une texture existante si le serveur est indisponible.

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
