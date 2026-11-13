import { FILMS, image } from '../data/films.js';
import { header } from '../shared/logo.js';
import { bind, enter, leave } from '../shared/transition.js';

const BASE = import.meta.env.BASE_URL;
const $ = (id) => document.getElementById(id);
const body = document.body;
const filmUrl = (film) => `${BASE}documentaire/?film=${film.slug}`;
const mobile = matchMedia('(max-width: 760px)').matches;

$('bar').innerHTML = header(
    BASE,
    '<button class="bar-link" id="index-open" type="button">Les films</button>',
);
enter();
bind();

// Liste des films (accès direct, et seul affichage si le navigateur ne peut pas dessiner le globe)
$('index-list').innerHTML = FILMS.map(
    (film, i) => `
    <li>
        <a href="${filmUrl(film)}" data-transition>
            <span class="index-n">${String(i + 1).padStart(2, '0')}</span>
            <img src="${image(film.hero, 240)}" alt="" loading="lazy" width="120" height="68" />
            <span class="index-text"><strong>${film.title}</strong><span>${film.world} · ${film.place}</span></span>
        </a>
    </li>`,
).join('');
const index = $('index');
$('index-open').addEventListener('click', () => index.showModal());
$('index-close').addEventListener('click', () => index.close());
index.addEventListener('click', (e) => e.target === index && index.close());

// Un cadre jaune par film : au survol il s'ouvre sur une image du film, au clic il se referme sur l'écran
const markers = FILMS.map((film) => {
    const element = document.createElement('a');
    element.className = 'marker is-hidden';
    element.href = filmUrl(film);
    element.tabIndex = -1;
    element.innerHTML = `
        <span class="marker-frame"><img src="${image(film.hero, 360)}" alt="" loading="lazy" /></span>
        <span class="marker-label"><strong>${film.title}</strong><span>${film.world} · ${film.place}</span></span>`;
    element.addEventListener('click', (e) => {
        e.preventDefault();
        leave(element.href, element.querySelector('.marker-frame').getBoundingClientRect());
    });
    $('markers').append(element);
    return { element, lat: film.lat, lng: film.lng };
});

let globe = null;
const VIEW = {
    intro: { shift: mobile ? 0 : 0.2, distance: mobile ? 5.6 : 4.7 },
    explore: { shift: 0, distance: mobile ? 4.6 : 3.7 },
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
