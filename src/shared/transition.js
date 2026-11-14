/**
 * Transitions de page : les vidéos du logo, avec transparence, jouées par-dessus la page.
 * Sortie : le cadre du logo tourne et se referme jusqu'au noir.
 * Arrivée : la version inverse, qui s'ouvre depuis le noir sur la nouvelle page.
 * Le script en ligne du <head> pose « is-entering » (écran noir) avant le premier rendu : aucun flash.
 * Si la vidéo ne peut pas démarrer (économie d'énergie, réseau), un rideau animé prend le relais.
 */
const KEY = 'mi:transition';
const BASE = import.meta.env.BASE_URL;
const TILT = '9deg';
const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
// Safari ne lit la transparence qu'en HEVC ; les autres navigateurs en WebM VP9
const safari = /^((?!chrome|chromium|android|crios|fxios).)*safari/i.test(navigator.userAgent);
const src = (name) => `${BASE}transition/${name}.${safari ? 'mov' : 'webm'}`;

const videos = {};
function video(name) {
    if (!videos[name]) {
        const v = document.createElement('video');
        Object.assign(v, { muted: true, playsInline: true, preload: 'auto', src: src(name) });
        v.className = 'wipe';
        v.setAttribute('aria-hidden', 'true');
        document.body.append(v);
        videos[name] = v;
    }
    return videos[name];
}

/** Lance la vidéo ; résout à la fin, ou rejette si elle ne démarre pas vite. */
function play(v, onStart) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('lente')), 700);
        v.addEventListener(
            'playing',
            () => {
                clearTimeout(timer);
                v.classList.add('is-on');
                onStart?.();
            },
            { once: true },
        );
        v.addEventListener('ended', resolve, { once: true });
        setTimeout(resolve, ((v.duration || 1) + 1.2) * 1000); // sécurité : une vidéo figée ne bloque jamais la page
        v.currentTime = 0;
        v.play().catch((e) => {
            clearTimeout(timer);
            reject(e);
        });
    });
}

// Repli : un rideau noir dont l'ouverture penchée se referme ou s'ouvre
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
    const s = Math.hypot(innerWidth, innerHeight) * 1.1;
    return box((innerWidth - s) / 2, (innerHeight - s * 0.7) / 2, s, s * 0.7);
};
const point = () => box(innerWidth / 2, innerHeight / 2, 0, 0);

let leaving = false;

/** Quitte la page vers `url`. */
export async function leave(url) {
    if (leaving) return;
    leaving = true;
    try {
        sessionStorage.setItem(KEY, '1');
    } catch {
        /* stockage indisponible : arrivée sans transition */
    }
    if (still()) return location.assign(url);
    try {
        await play(video('out'));
    } catch {
        await curtain().animate(
            [
                { ...cover(), rotate: '0deg' },
                { ...point(), rotate: TILT },
            ],
            { duration: 700, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', fill: 'forwards' },
        ).finished;
    }
    location.assign(url);
}

/** À l'arrivée : ouvre la page si la précédente a lancé une transition. */
export function enter() {
    let pending = false;
    try {
        pending = sessionStorage.getItem(KEY) === '1';
        sessionStorage.removeItem(KEY);
    } catch {
        /* rien */
    }
    const root = document.documentElement;
    const done = () => root.classList.remove('is-entering');
    if (!pending || still()) return done();
    const v = video('in');
    play(v, done)
        .then(() => v.classList.remove('is-on'))
        .catch(() => {
            const hole = curtain();
            done();
            hole.animate(
                [
                    { ...point(), rotate: TILT },
                    { ...cover(), rotate: '0deg' },
                ],
                { duration: 800, easing: 'cubic-bezier(0.7, 0, 0.2, 1)', fill: 'forwards' },
            ).finished.then(() => hole.parentElement.remove());
        });
}

/** Liens internes marqués data-transition ; les vidéos se chargent en avance. */
export function bind(root = document) {
    root.addEventListener('click', (e) => {
        const link = e.target.closest('a[data-transition]');
        if (!link || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        leave(link.href);
    });
    const warm = () => ['out', 'in'].forEach(video);
    if ('requestIdleCallback' in window) requestIdleCallback(warm, { timeout: 2000 });
    else setTimeout(warm, 1200);
}

// Retour arrière depuis le cache du navigateur : la page doit réapparaître sans voile
addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    leaving = false;
    document.querySelector('.curtain')?.remove();
    document.querySelectorAll('.wipe').forEach((v) => v.classList.remove('is-on'));
});
