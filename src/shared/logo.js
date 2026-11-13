// Logo Mondes Immergés : le cadre jaune de National Geographic, traversé par une vague.
export const LOGO = `
<svg class="logo-mark" viewBox="0 0 320 442" aria-hidden="true" focusable="false">
    <path class="logo-frame" fill-rule="evenodd" d="M0 0H320V442H0Z
        M58 55H262V387H58V302
        C58 290 64 284 78 283 C112 281 160 283 168 262 C175 243 150 236 118 236
        C100 236 96 224 112 219 C142 210 168 208 160 188 C152 168 104 172 76 164
        C64 160 58 154 58 142Z"/>
</svg>`;

/** Logo + nom, en lien vers l'accueil. */
export function brand(href) {
    return `<a class="brand" href="${href}" aria-label="Mondes Immergés, accueil">${LOGO}<span class="brand-name">Mondes<br>Immergés</span></a>`;
}
