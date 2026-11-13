import { SOURCE } from '../data/films.js';

/** En-tête commun : comme une rubrique du site National Geographic, avec la marque du projet. */
export const header = (base, extra = '') => `
    <a class="natgeo" href="${SOURCE}" target="_blank" rel="noopener" aria-label="National Geographic Documentary Films">
        <img src="${base}images/logo-national-geographic.png" alt="National Geographic" width="700" height="206" />
    </a>
    <span class="bar-rule" aria-hidden="true"></span>
    <a class="brand" href="${base}" data-transition aria-label="Mondes Immergés, accueil">
        <img class="brand-mark" src="${base}images/logo-mondes-immerges.png" alt="" width="319" height="442" />
        <span class="brand-name">Mondes<br />Immergés</span>
    </a>
    <span class="bar-space"></span>
    ${extra}`;
