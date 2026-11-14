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

// Un cadre jaune par film (portrait 2:3, comme l'affiche). Au survol, en un seul mouvement :
// 1. le cadre tombe à 90° sur son coin bas (il se couche en paysage), rebondit, se pose ;
// 2. pendant la chute, l'étiquette (titre + infos) descend : son coin haut vient se caler pile sur le coin
//    bas du cadre couché, et arrive en même temps que lui, rebond compris ;
// 3. le cadre grandit vers le haut et vers l'extérieur, ancré sur ce coin : l'affiche apparaît,
//    le titre reste en diagonale basse. Près du bord gauche de l'écran, tout est en miroir.
const POSTER = mobile ? 132 : 196; // largeur de l'affiche ouverte (hauteur : ×1,5)
const FALL = 600;
const ease = 'cubic-bezier(0.22, 1, 0.36, 1)';
const spring = 'cubic-bezier(0.3, 1.45, 0.55, 1)';
const REST = { left: '-8px', top: '-12px', width: '16px', height: '24px', borderWidth: '3px' };
const M = 16; // marge à l'écran

function open(element) {
    if (element.opening) return element.opening;
    const frame = element.querySelector('.marker-frame');
    const label = element.querySelector('.marker-label');
    const img = frame.querySelector('img');
    const dir = element.classList.contains('is-flip') ? -1 : 1; // 1 : tombe à droite, grandit à gauche
    const { left: x, top: y } = element.getBoundingClientRect();
    const ratio = img.naturalWidth ? img.naturalHeight / img.naturalWidth : 1.5;
    // la place : vers le haut (sous l'en-tête) et vers l'extérieur, à partir du coin d'ancrage
    const bar = document.getElementById('bar').offsetHeight || 64;
    const up = y + 12 - (bar + M);
    const side = dir > 0 ? x + 32 - M : innerWidth - (x - 32) - M;
    const w = Math.round(Math.max(72, Math.min(POSTER, side, up / ratio)));
    const h = Math.round(w * ratio);
    const big = {
        left: dir > 0 ? `${32 - w}px` : '-32px',
        top: `${12 - h}px`,
        width: `${w}px`,
        height: `${h}px`,
        borderWidth: mobile ? '4px' : '5px',
    };
    const landed = {
        left: dir > 0 ? '8px' : '-32px',
        top: '-4px',
        width: '24px',
        height: '16px',
        borderWidth: '3px',
    };
    // l'étiquette : son coin haut (droit, ou gauche en miroir) vient sur le coin bas du cadre couché
    const lift = { translate: `${22 * dir}px ${12 + label.offsetHeight / 2}px` };

    $('markers').classList.add('has-open');
    globe?.hold(8);
    element.classList.add('is-open');
    frame.getAnimations().forEach((a) => a.cancel());
    label.getAnimations().forEach((a) => a.cancel());
    frame.style.transformOrigin = dir > 0 ? 'right bottom' : 'left bottom';
    element.opening = (async () => {
        if (reducedMotion) {
            label.animate([lift, lift], { duration: 1, fill: 'forwards' });
        } else {
            // même horloge, mêmes appuis : accélération de la chute, impact à 60 %, petit rebond, repos
            const gravity = 'cubic-bezier(0.55, 0, 1, 0.6)';
            const fall = frame.animate(
                [
                    { rotate: '0deg', easing: gravity },
                    { rotate: `${90 * dir}deg`, offset: 0.6, easing: 'ease-out' },
                    { rotate: `${80 * dir}deg`, offset: 0.78, easing: 'ease-in' },
                    { rotate: `${90 * dir}deg` },
                ],
                { duration: FALL },
            );
            const bounce = { translate: `${22 * dir}px ${8 + label.offsetHeight / 2}px` };
            label.animate(
                [
                    { translate: '0 0', easing: gravity },
                    { ...lift, offset: 0.6, easing: 'ease-out' },
                    { ...bounce, offset: 0.78, easing: 'ease-in' },
                    lift,
                ],
                { duration: FALL, fill: 'forwards' },
            );
            await fall.finished;
            fall.cancel();
        }
        if (!element.opening) return;
        Object.assign(frame.style, big, { transformOrigin: '' });
        element.classList.add('is-landed');
        if (!reducedMotion) await frame.animate([landed, big], { duration: 680, easing: spring }).finished;
    })().catch(() => {}); // interrompu par close()
    return element.opening;
}

function close(element) {
    if (!element.opening) return;
    element.opening = null;
    const frame = element.querySelector('.marker-frame');
    const label = element.querySelector('.marker-label');
    const cs = getComputedStyle(frame);
    const now = {
        left: cs.left,
        top: cs.top,
        width: cs.width,
        height: cs.height,
        borderWidth: cs.borderTopWidth,
        rotate: cs.rotate === 'none' ? '0deg' : cs.rotate,
    };
    const origin = cs.transformOrigin;
    const at = getComputedStyle(label).translate;
    frame.getAnimations().forEach((a) => a.cancel());
    label.getAnimations().forEach((a) => a.cancel());
    Object.assign(frame.style, {
        left: '',
        top: '',
        width: '',
        height: '',
        borderWidth: '',
        transformOrigin: origin,
    });
    element.classList.remove('is-open', 'is-landed');
    if (!document.querySelector('.marker.is-open')) $('markers').classList.remove('has-open');
    if (reducedMotion) return;
    frame.animate([now, { ...REST, rotate: '0deg' }], { duration: 360, easing: ease });
    if (at && at !== 'none')
        label.animate([{ translate: at }, { translate: '0 0' }], { duration: 360, easing: ease });
}

const markers = FILMS.map((film) => {
    const element = document.createElement('a');
    element.className = 'marker is-hidden';
    element.href = filmUrl(film);
    element.tabIndex = -1;
    element.innerHTML = `
        <span class="marker-frame"><img src="${image(film.poster, 420)}" alt="" /></span>
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
        // Curseur de teinte des courants (or ↔ jaune National Geographic), mémorisé pour ce navigateur
        const tone = $('tone');
        try {
            tone.value = localStorage.getItem('mi:tone') ?? tone.value;
        } catch {
            /* stockage indisponible */
        }
        globe.setTone(Number(tone.value));
        tone.addEventListener('input', () => {
            globe.setTone(Number(tone.value));
            try {
                localStorage.setItem('mi:tone', tone.value);
            } catch {
                /* rien */
            }
        });
        if (import.meta.env.DEV) window.__globe = globe; // inspection en développement
        requestAnimationFrame(() => body.classList.add('is-ready'));
    } catch (error) {
        console.error('Globe indisponible :', error);
        fallback();
    }
} else {
    fallback();
}
