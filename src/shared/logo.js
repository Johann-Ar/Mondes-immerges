import { SOURCE } from '../data/films.js';

/**
 * En-tête flottant, sans barre : le logo National Geographic et le cadre de Mondes Immergés, penché.
 * `home` : où mène le cadre (l'accueil, ou le globe depuis un documentaire) ; `label` : texte facultatif à côté.
 */
export const header = (home, base = home, label = '') => `
    <a class="natgeo" href="${SOURCE}" target="_blank" rel="noopener" aria-label="National Geographic Documentary Films">
        <img src="${base}images/logo-national-geographic.png" alt="National Geographic" width="700" height="206" />
    </a>
    <a class="brand" href="${home}" data-transition aria-label="${label ? 'Retour au globe' : 'Mondes Immergés, accueil'}">
        <img class="brand-mark" src="${base}images/logo-mondes-immerges.png" alt="" width="319" height="442" />
        ${label ? `<span class="brand-label">${label}</span>` : ''}
    </a>`;
