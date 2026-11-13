/**
 * Transitions de page : le cadre jaune National Geographic.
 * En sortie, le jaune se referme autour de l'élément choisi (un marqueur, un lien) jusqu'à couvrir l'écran ;
 * à l'arrivée, le cadre s'ouvre depuis le centre et dévoile la nouvelle page.
 * Le script en ligne du <head> pose la classe « is-entering » avant le premier rendu (aucun flash).
 */
const KEY = 'mi:transition';
const RATIO = 0.72; // proportions du cadre (logo)
const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function curtain() {
    let el = document.querySelector('.curtain');
    if (!el) {
        el = document.createElement('div');
        el.className = 'curtain';
        el.innerHTML = '<div class="curtain-hole"></div>';
        document.body.append(el);
    }
    return el.firstElementChild;
}

const box = (x, y, w, h) => ({ left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px` });
const cover = () => {
    const w = Math.max(innerWidth, innerHeight * RATIO) * 1.25;
    const h = w / RATIO;
    return box((innerWidth - w) / 2, (innerHeight - h) / 2, w, h);
};
const point = (x, y) => box(x, y, 0, 0);

let leaving = false;

/** Quitte la page vers `url` ; `from` (DOMRect) est l'élément autour duquel le cadre se referme. */
export async function leave(url, from) {
    if (leaving) return;
    leaving = true;
    try {
        sessionStorage.setItem(KEY, '1');
    } catch {
        /* stockage indisponible : arrivée sans transition */
    }
    if (still()) return location.assign(url);
    const hole = curtain();
    const r = from ?? { left: innerWidth / 2 - 30, top: innerHeight / 2 - 40, width: 60, height: 80 };
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const w = Math.max(r.width, 26);
    const h = Math.max(r.height, w / RATIO);
    const frames = [cover(), box(cx - w / 2, cy - h / 2, w, h), point(cx, cy)];
    await hole.animate(frames, { duration: 820, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', fill: 'forwards' })
        .finished;
    location.assign(url);
}

/** À l'arrivée : ouvre le cadre si la page précédente a lancé une transition. */
export function enter() {
    let pending = false;
    try {
        pending = sessionStorage.getItem(KEY) === '1';
        sessionStorage.removeItem(KEY);
    } catch {
        /* rien */
    }
    const root = document.documentElement;
    if (!pending || still()) {
        root.classList.remove('is-entering');
        return;
    }
    const hole = curtain();
    Object.assign(hole.style, point(innerWidth / 2, innerHeight / 2));
    root.classList.remove('is-entering');
    const animation = hole.animate([point(innerWidth / 2, innerHeight / 2), cover()], {
        duration: 900,
        delay: 120,
        easing: 'cubic-bezier(0.7, 0, 0.2, 1)',
        fill: 'forwards',
    });
    animation.finished.then(() => hole.parentElement.remove());
}

/** Liens internes marqués data-transition. */
export function bind(root = document) {
    root.addEventListener('click', (e) => {
        const link = e.target.closest('a[data-transition]');
        if (!link || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        leave(link.href, link.getBoundingClientRect());
    });
}

// Retour arrière depuis le cache du navigateur : la page doit réapparaître sans rideau
addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    leaving = false;
    document.querySelector('.curtain')?.remove();
});
