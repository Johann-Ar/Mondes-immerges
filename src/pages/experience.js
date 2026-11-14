import { FILMS, image } from '../data/films.js';
import { header } from '../shared/logo.js';
import { bind, enter, leave } from '../shared/transition.js';

const BASE = import.meta.env.BASE_URL;
const $ = (id) => document.getElementById(id);
const body = document.body;
const filmUrl = (film) => `${BASE}documentaire/?film=${film.slug}`;
const mobile = matchMedia('(max-width: 760px)').matches;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

$('bar').innerHTML = header(BASE);
enter();
bind();

// Liste des films : seul affichage si le navigateur ne peut pas dessiner le globe
$('index-list').innerHTML = FILMS.map(
    (film, i) => `
    <li>
        <a href="${filmUrl(film)}" data-transition>
            <span class="index-n">${String(i + 1).padStart(2, '0')}</span>
            <img src="${image(film.poster, 160)}" alt="" loading="lazy" width="54" height="80" />
            <span class="index-text"><strong>${film.title}</strong><span>${film.world} · ${film.place}</span></span>
        </a>
    </li>`,
).join('');
const index = $('index');
$('index-close').addEventListener('click', () => index.close());
index.addEventListener('click', (e) => e.target === index && index.close());

// Un cadre jaune par film (portrait 2:3, comme l'affiche), son titre toujours à droite, immobile. Au survol :
// 1. le cadre tombe à 90° en tournant sur son centre : il se couche en paysage sans quitter l'axe du titre,
//    avec l'accélération d'une chute et un petit rebond ;
// 2. il grandit vers la gauche (à l'opposé du titre), autant vers le haut que vers le bas, et l'affiche apparaît.
const POSTER = mobile ? 132 : 196; // largeur de l'affiche ouverte (hauteur : ×1,5)
const FALL = 560;
const ease = 'cubic-bezier(0.22, 1, 0.36, 1)';
const spring = 'cubic-bezier(0.3, 1.45, 0.55, 1)';
const REST = { left: '-8px', top: '-12px', width: '16px', height: '24px', borderWidth: '3px' };
const LANDED = { left: '-12px', top: '-8px', width: '24px', height: '16px', borderWidth: '3px' };
const M = 16; // marge à l'écran

function open(element) {
    if (element.opening) return element.opening;
    const frame = element.querySelector('.marker-frame');
    const img = frame.querySelector('img');
    const { left: x, top: y } = element.getBoundingClientRect();
    const ratio = img.naturalWidth ? img.naturalHeight / img.naturalWidth : 1.5;
    // la place : vers la gauche depuis le bord droit du cadre couché, et symétrique en hauteur autour du titre
    const top = document.getElementById('bar').offsetHeight || 64;
    const half = Math.min(y - (top + M), innerHeight - M - y);
    const w = Math.round(Math.max(64, Math.min(POSTER, x + 12 - M, (2 * half) / ratio)));
    const h = Math.round(w * ratio);
    const big = {
        left: `${12 - w}px`,
        top: `${-h / 2}px`,
        width: `${w}px`,
        height: `${h}px`,
        borderWidth: mobile ? '4px' : '5px',
    };

    $('markers').classList.add('has-open');
    globe?.hold(8);
    element.classList.add('is-open');
    frame.getAnimations().forEach((a) => a.cancel());
    element.opening = (async () => {
        if (!reducedMotion) {
            const fall = frame.animate(
                [
                    { rotate: '0deg', easing: 'cubic-bezier(0.55, 0, 1, 0.6)' },
                    { rotate: '90deg', offset: 0.62, easing: 'ease-out' },
                    { rotate: '80deg', offset: 0.8, easing: 'ease-in' },
                    { rotate: '90deg' },
                ],
                { duration: FALL },
            );
            await fall.finished;
            fall.cancel();
        }
        if (!element.opening) return;
        // couché en paysage, puis la fenêtre s'ouvre vers la gauche, centrée sur l'axe du titre
        Object.assign(frame.style, big);
        element.classList.add('is-landed');
        if (!reducedMotion) await frame.animate([LANDED, big], { duration: 640, easing: spring }).finished;
    })().catch(() => {}); // interrompu par close()
    return element.opening;
}

function close(element) {
    if (!element.opening) return;
    element.opening = null;
    const frame = element.querySelector('.marker-frame');
    const cs = getComputedStyle(frame);
    const now = {
        left: cs.left,
        top: cs.top,
        width: cs.width,
        height: cs.height,
        borderWidth: cs.borderTopWidth,
        rotate: cs.rotate === 'none' ? '0deg' : cs.rotate,
    };
    frame.getAnimations().forEach((a) => a.cancel());
    Object.assign(frame.style, { left: '', top: '', width: '', height: '', borderWidth: '' });
    element.classList.remove('is-open', 'is-landed');
    if (!document.querySelector('.marker.is-open')) $('markers').classList.remove('has-open');
    if (!reducedMotion) frame.animate([now, { ...REST, rotate: '0deg' }], { duration: 340, easing: ease });
}

const markers = FILMS.map((film) => {
    const element = document.createElement('a');
    element.className = 'marker is-hidden';
    element.href = filmUrl(film);
    element.tabIndex = -1;
    element.innerHTML = `
        <span class="marker-frame"><img src="${image(film.poster, 420)}" alt="" decoding="async" /></span>
        <span class="marker-label"><strong>${film.title}</strong><span>${film.world} · ${film.place}</span></span>`;
    let going = false;
    element.addEventListener('pointerenter', (e) => e.pointerType === 'mouse' && open(element));
    element.addEventListener('pointerleave', () => !going && close(element));
    element.addEventListener('focus', () => open(element));
    element.addEventListener('blur', () => !going && close(element));
    element.addEventListener('click', async (e) => {
        e.preventDefault();
        going = true;
        globe?.hold(10);
        await open(element); // au doigt : la fenêtre s'ouvre d'abord, puis on part
        await new Promise((r) => setTimeout(r, reducedMotion ? 0 : 250));
        leave(element.href);
    });
    $('markers').append(element);
    return { element, lat: film.lat, lng: film.lng };
});

let globe = null;
const VIEW = {
    intro: { shift: mobile ? 0 : 0.22, distance: mobile ? 6.6 : 5.6 },
    explore: { shift: 0, distance: mobile ? 5.6 : 4.5 },
};

function setMode(mode, { push = false, instant = false } = {}) {
    body.dataset.mode = mode;
    if (push) history.pushState({ mode }, '', mode === 'explore' ? `${BASE}globe/` : BASE);
    if (!globe) return;
    globe.setShift(VIEW[mode].shift, instant);
    if (!instant) globe.flyTo({ distance: VIEW[mode].distance, duration: 1700 });
    if (mode === 'explore') globe.hold(4);
}

$('enter').addEventListener('click', () => setMode('explore', { push: true }));
addEventListener('popstate', () => setMode(location.pathname.endsWith('/globe/') ? 'explore' : 'intro'));

const supported = () => {
    if ('gpu' in navigator) return true;
    try {
        return Boolean(document.createElement('canvas').getContext('webgl2'));
    } catch {
        return false;
    }
};

function fallback() {
    body.classList.add('no-globe', 'is-ready');
    index.show();
}

if (supported()) {
    try {
        const { Globe } = await import('../globe/Globe.js');
        globe = await Globe.create({ canvas: $('globe'), markers, base: BASE, mobile });
        const from = FILMS.find((f) => f.slug === new URLSearchParams(location.search).get('from'));
        const mode = body.dataset.mode;
        globe.face(from?.lat ?? 22, from?.lng ?? (mode === 'intro' ? -25 : 10), VIEW[mode].distance);
        setMode(mode, { instant: true });
        if (from) globe.hold(6);
        if (import.meta.env.DEV) window.__globe = globe; // inspection en développement
        requestAnimationFrame(() => body.classList.add('is-ready'));
    } catch (error) {
        console.error('Globe indisponible :', error);
        fallback();
    }
} else {
    fallback();
}
