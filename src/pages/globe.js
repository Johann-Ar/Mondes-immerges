import { FILMS, image } from '../data/films.js';
import { KINDS } from '../globe/currents.js';
import { brand } from '../shared/logo.js';
import { hasWebGL } from '../shared/reveal.js';

const BASE = import.meta.env.BASE_URL;
const $ = (id) => document.getElementById(id);
const filmUrl = (film) => `${BASE}documentaire/?film=${film.slug}`;

$('brand').innerHTML = brand(BASE);

// Légende des courants
$('legend-list').innerHTML = Object.entries(KINDS)
    .map(
        ([kind, k]) => `
        <li class="legend-item legend-${kind}">
            <strong>${k.label}</strong>
            <span>${k.text}</span>
        </li>`,
    )
    .join('');
$('legend-toggle').addEventListener('click', (e) => {
    const open = e.currentTarget.getAttribute('aria-expanded') !== 'true';
    e.currentTarget.setAttribute('aria-expanded', String(open));
    $('legend').hidden = !open;
});

// Bandeau des films et marqueurs sur le globe
$('strip').innerHTML = FILMS.map(
    (film, i) => `
    <li>
        <button class="chip" data-slug="${film.slug}" style="--accent:${film.accent}">
            <span class="chip-index">${String(i + 1).padStart(2, '0')}</span>
            <span class="chip-title">${film.title}</span>
            <span class="chip-place">${film.place}</span>
        </button>
    </li>`,
).join('');

const markers = FILMS.map((film) => {
    const element = document.createElement('button');
    element.className = 'marker';
    element.dataset.slug = film.slug;
    element.style.setProperty('--accent', film.accent);
    element.innerHTML = `<span class="marker-dot"></span><span class="marker-label">${film.title}</span>`;
    element.setAttribute('aria-label', `${film.title}, ${film.place}`);
    $('markers').append(element);
    return { element, lat: film.lat, lng: film.lng };
});

let globe = null;
let current = null;

function panel(film) {
    const i = FILMS.indexOf(film);
    const prev = FILMS[(i - 1 + FILMS.length) % FILMS.length];
    const next = FILMS[(i + 1) % FILMS.length];
    return `
        <button class="panel-close" id="panel-close" aria-label="Fermer">×</button>
        <div class="panel-media">
            <img src="${image(film.hero, 900)}" alt="" />
        </div>
        <div class="panel-body">
            <span class="tag" style="--accent:${film.accent}">${film.world}</span>
            <h2>${film.title}</h2>
            <p class="panel-meta">${film.year} · ${film.place}, ${film.country}</p>
            <p class="panel-pitch">${film.pitch}</p>
            <a class="button" href="${filmUrl(film)}">Découvrir le documentaire <span class="arrow">→</span></a>
            <div class="panel-nav">
                <button data-slug="${prev.slug}" aria-label="Film précédent : ${prev.title}">← ${prev.title}</button>
                <button data-slug="${next.slug}" aria-label="Film suivant : ${next.title}">${next.title} →</button>
            </div>
        </div>`;
}

function select(slug, { fly = true } = {}) {
    const film = FILMS.find((f) => f.slug === slug);
    if (!film) return;
    current = film;
    const el = $('panel');
    el.innerHTML = panel(film);
    el.style.setProperty('--accent', film.accent);
    el.hidden = false;
    requestAnimationFrame(() => el.classList.add('is-open'));
    document.body.classList.add('has-selection');
    document.querySelectorAll('[data-slug]').forEach((b) => {
        if (b.closest('.panel-nav')) return;
        b.classList.toggle('is-active', b.dataset.slug === slug);
    });
    document
        .querySelector(`.chip[data-slug="${slug}"]`)
        ?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    if (fly && globe) globe.flyTo(film.lat, film.lng);
    globe?.setShift(-1);
    history.replaceState(null, '', `?film=${slug}`);
}

function close() {
    const el = $('panel');
    el.classList.remove('is-open');
    document.body.classList.remove('has-selection');
    document.querySelectorAll('.is-active').forEach((b) => b.classList.remove('is-active'));
    current = null;
    globe?.setShift(1);
    history.replaceState(null, '', location.pathname);
    setTimeout(() => !current && (el.hidden = true), 500);
}

document.addEventListener('click', (e) => {
    if (e.target.closest('#panel-close')) return close();
    const trigger = e.target.closest('button[data-slug]');
    if (trigger) select(trigger.dataset.slug);
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && current) close();
});

// Le globe 3D (chargé à part : la page reste utilisable sans WebGL)
if (hasWebGL()) {
    const { GlobeView } = await import('../globe/GlobeView.js');
    globe = new GlobeView({
        canvas: $('globe'),
        markers,
        textureUrl: `${BASE}textures/earth.png`,
        onReady: () => document.body.classList.add('is-ready'),
    });
    $('currents-switch').addEventListener('change', (e) => globe.setCurrentsVisible(e.target.checked));
    $('globe').addEventListener('pointerdown', () => document.body.classList.add('has-interacted'), {
        once: true,
    });
} else {
    document.body.classList.add('no-webgl', 'is-ready');
}

const initial = new URLSearchParams(location.search).get('film');
if (initial) select(initial);
