import { MARK, MARK_BOX, NAME, NAME_BOX, VIEW } from './logo-paths.js';

/**
 * Logo Mondes Immergés en code : les tracés exacts du fichier d'origine (logo-paths.js), assemblés ici.
 *
 *   logo()                                cadre + nom, comme l'original (en-tête)
 *   logo({ variant: 'mark' })             cadre seul (favicon, petits formats)
 *   logo({ variant: 'name' })             nom seul
 *   logo({ variant: 'stacked' })          cadre au-dessus du nom, centré
 *   logo({ color: '#fff', ink: '#000' })  couleurs du cadre et du nom (monochrome, fond clair…)
 *   logo({ tilt: -8 })                    cadre pivoté autour de son centre, en degrés
 *
 * Taille : la hauteur suit --logo-h (voir .mi-logo dans base.css), les proportions ne bougent jamais.
 */
const DEFAULT = { variant: 'full', color: 'var(--yellow)', ink: 'currentColor', tilt: 0 };

const markPath = ({ color, tilt }) => {
    const cx = MARK_BOX.x + MARK_BOX.w / 2;
    const cy = MARK_BOX.y + MARK_BOX.h / 2;
    return `<g class="mi-mark" style="transform-origin:${cx}px ${cy}px"${tilt ? ` transform="rotate(${tilt} ${cx} ${cy})"` : ''}><path d="${MARK}" fill="${color}" fill-rule="evenodd"/></g>`;
};
const namePath = ({ ink }) => `<path class="mi-name" d="${NAME}" fill="${ink}" fill-rule="evenodd"/>`;
const svg = (box, body, cls) =>
    `<svg class="mi-logo mi-logo--${cls}" viewBox="${box.x} ${box.y} ${box.w} ${box.h}" aria-hidden="true" focusable="false" style="aspect-ratio:${box.w}/${box.h}">${body}</svg>`;

export function logo(options = {}) {
    const o = { ...DEFAULT, ...options };
    if (o.variant === 'mark') return svg(MARK_BOX, markPath(o), 'mark');
    if (o.variant === 'name') return svg(NAME_BOX, namePath(o), 'name');
    if (o.variant === 'stacked') {
        // cadre centré au-dessus du nom, un tiers de sa hauteur d'écart
        const gap = MARK_BOX.h / 3;
        const dx = NAME_BOX.x + (NAME_BOX.w - MARK_BOX.w) / 2;
        const body = `<g transform="translate(${dx} ${NAME_BOX.y - MARK_BOX.h - gap})">${markPath(o)}</g>${namePath(o)}`;
        return svg(
            {
                x: NAME_BOX.x,
                y: NAME_BOX.y - MARK_BOX.h - gap,
                w: NAME_BOX.w,
                h: NAME_BOX.h + MARK_BOX.h + gap,
            },
            body,
            'stacked',
        );
    }
    return svg({ x: 0, y: 0, w: VIEW.w, h: VIEW.h }, markPath(o) + namePath(o), 'full');
}

/** En-tête flottant : le logo Mondes Immergés seul, en haut à gauche (lien vers l'accueil). */
export const header = (base) =>
    `<a class="brand" href="${base}" data-transition aria-label="Mondes Immergés, accueil">${logo()}</a>`;

/** Retour au globe : le petit globe jaune, « Retour » d'un côté, « au globe » de l'autre. */
export const toGlobe = (url, cls = '') => `
    <a class="to-globe ${cls}" href="${url}" data-transition aria-label="Retour au globe">
        <span class="to-globe-side" aria-hidden="true">Retour</span><span class="orb" aria-hidden="true"></span><span class="to-globe-side" aria-hidden="true">au globe</span>
    </a>`;
