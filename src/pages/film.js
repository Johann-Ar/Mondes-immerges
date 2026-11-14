import { FILMS, SOURCE, filmBySlug, image } from '../data/films.js';
import { header, toGlobe } from '../shared/logo.js';
import { gallery as arrange } from './gallery.js';
import { reveal } from '../shared/reveal.js';
import { bind, enter } from '../shared/transition.js';

const BASE = import.meta.env.BASE_URL;
const $ = (id) => document.getElementById(id);

const slug = new URLSearchParams(location.search).get('film');
const film = filmBySlug(slug) || FILMS[0];
const index = FILMS.indexOf(film);
const next = FILMS[(index + 1) % FILMS.length];
const [still, stillCaption, stillCredit] = film.gallery.at(-1);

document.title = `${film.title} · Mondes Immergés`;
const GLOBE = `${BASE}globe/?from=${film.slug}`;
$('bar').innerHTML = header(BASE);
document.body.insertAdjacentHTML('beforeend', toGlobe(GLOBE, 'to-globe-fixed'));

const SECTIONS = [];
const section = (id, kicker, title, body, cls = '') => {
    SECTIONS.push([id, title]);
    return `
    <section class="section ${cls}" id="${id}">
        <header class="section-head reveal">
            <p class="kicker">${kicker}</p>
            <h2 class="title">${title}</h2>
        </header>
        ${body}
    </section>`;
};

const people = film.people
    .map(
        (p) => `
        <li class="person reveal">
            ${
                p.photo
                    ? `<img src="${image(p.photo, 200)}" alt="${p.name}" loading="lazy" width="88" height="88" />`
                    : `<span class="person-initials" aria-hidden="true">${p.name
                          .split(' ')
                          .map((w) => w[0])
                          .slice(0, 2)
                          .join('')}</span>`
            }
            <div>
                <h3>${p.name}</h3>
                <p class="person-role">${p.role}</p>
                <p>${p.bio}</p>
            </div>
        </li>`,
    )
    .join('');

const gallery = film.gallery
    .map(
        ([file, caption, credit], i) => `
        <li>
            <button class="shot" data-index="${i}" aria-label="Agrandir : ${caption}">
                <img src="${image(file, 900)}" alt="${caption}" loading="lazy" decoding="async" />
                <span class="shot-caption">${caption} <span>© ${credit}</span></span>
            </button>
        </li>`,
    )
    .join('');

const reviews = film.reviews.length
    ? section(
          'presse',
          'La presse en parle',
          'Ce qu’ils en disent',
          `<ul class="quotes">${film.reviews
              .map(
                  (r) =>
                      `<li class="reveal"><blockquote>« ${r.quote} »</blockquote><cite>${r.source}</cite></li>`,
              )
              .join('')}</ul>`,
          'section-quotes',
      )
    : '';

const actions = [
    ...film.actions,
    {
        label: 'Le film sur National Geographic',
        url: `${SOURCE}${film.slug}`,
        text: 'La page officielle : bande-annonce, équipe et où regarder.',
    },
]
    .map(
        (a) => `
        <li class="reveal">
            <a class="action" href="${a.url}" target="_blank" rel="noopener">
                <strong>${a.label}</strong>
                <span>${a.text}</span>
                <span class="action-arrow" aria-hidden="true">↗</span>
            </a>
        </li>`,
    )
    .join('');

$('page').innerHTML = `
    <section class="hero">
        <img class="hero-image" src="${image(film.hero, 2000)}" srcset="${[1000, 1600, 2000, 2800].map((w) => `${image(film.hero, w)} ${w}w`).join(', ')}" sizes="100vw" alt="" fetchpriority="high" />
        <div class="hero-content">
            <span class="tag">${film.world}</span>
            <h1>${film.title}</h1>
            <p class="hero-pitch">${film.pitch}</p>
            <dl class="hero-meta">
                <div><dt>Sortie</dt><dd>${film.date}</dd></div>
                <div><dt>Réalisation</dt><dd>${film.director}</dd></div>
                <div><dt>Lieu</dt><dd>${film.place}, ${film.country}</dd></div>
            </dl>
        </div>
    </section>

    ${section(
        'film',
        'Le documentaire',
        'L’histoire',
        `<div class="story">
            <div class="story-text">
                ${film.synopsis.map((p, i) => `<p class="reveal ${i === 0 ? 'lead' : ''}">${p}</p>`).join('')}
            </div>
            <figure class="story-frame reveal">
                <img src="${image(still, 1200)}" alt="${stillCaption}" loading="lazy" />
                <figcaption>© ${stillCredit}</figcaption>
            </figure>
        </div>
        <ul class="facts">
            ${film.facts.map((f) => `<li class="reveal"><strong>${f.value}</strong><span>${f.label}</span></li>`).join('')}
        </ul>`,
    )}

    ${section('visages', 'Ils font le film', 'Les visages', `<ul class="people">${people}</ul>`, 'section-people')}

    ${section(
        'galerie',
        'Dans l’objectif',
        'Galerie photo',
        `<div class="gallery-tools reveal" id="gallery-tools">
            <span class="gallery-count">${String(film.gallery.length).padStart(2, '0')} photos</span>
            <div role="group" aria-label="Disposition">
                <button type="button" data-layout="mosaic" aria-pressed="true">Mosaïque</button>
                <button type="button" data-layout="grid" aria-pressed="false">Grille</button>
            </div>
        </div>
        <ul class="gallery" id="gallery" data-layout="mosaic">${gallery}</ul>`,
        'section-gallery',
    )}

    ${reviews}

    ${section('agir', 'Aller plus loin', 'Agir et s’informer', `<ul class="actions">${actions}</ul>`)}

    ${section(
        'equipe',
        'Générique',
        'L’équipe',
        `<dl class="credits">${film.credits.map(([role, names]) => `<div class="reveal"><dt>${role}</dt><dd>${names}</dd></div>`).join('')}</dl>`,
        'section-credits',
    )}

    <a class="next-film" href="${BASE}documentaire/?film=${next.slug}" data-transition>
        <img src="${image(next.hero, 1600)}" alt="" loading="lazy" />
        <span class="next-label">Monde suivant</span>
        <span class="next-title">${next.title}</span>
        <span class="next-place">${next.place} · ${next.country}</span>
    </a>

    <footer class="footer">
        <p>Films, photos et informations : <a href="${SOURCE}" target="_blank" rel="noopener">National Geographic Documentary Films</a>. Textes adaptés en français.</p>
    </footer>`;

reveal();
arrange($('gallery'), $('gallery-tools'));
enter();
bind();

// Navigation latérale : un repère par section, le repère actif suit la lecture
const dots = $('dots');
dots.innerHTML = SECTIONS.map(([id, title]) => `<a href="#${id}"><span>${title}</span></a>`).join('');
const links = [...dots.children];
const visible = new IntersectionObserver(
    (entries) => {
        for (const e of entries) {
            if (!e.isIntersecting) continue;
            links.forEach((a) => a.classList.toggle('is-active', a.hash === `#${e.target.id}`));
        }
    },
    { rootMargin: '-45% 0px -50% 0px' },
);
SECTIONS.forEach(([id]) => visible.observe($(id)));
new IntersectionObserver(([e]) => dots.classList.toggle('is-shown', !e.isIntersecting), {
    threshold: 0.6,
}).observe(document.querySelector('.hero'));

// Visionneuse de la galerie
const dialog = $('lightbox');
let shown = 0;
function show(i, preview) {
    shown = (i + film.gallery.length) % film.gallery.length;
    const [file, caption, credit] = film.gallery[shown];
    const img = $('lightbox-img');
    const full = image(file, 2000);
    img.src = preview ?? full; // l'image déjà chargée d'abord, la grande ensuite
    if (preview) {
        const big = new Image();
        const current = shown;
        big.onload = () => shown === current && (img.src = full);
        big.src = full;
    }
    $('lightbox-img').alt = caption;
    $('lightbox-caption').textContent = `${caption} © ${credit}`;
}
// La photo grandit depuis sa place dans la galerie
document.querySelectorAll('.shot').forEach((b) =>
    b.addEventListener('click', () => {
        const thumb = b.querySelector('img');
        const from = thumb.getBoundingClientRect();
        show(Number(b.dataset.index), thumb.currentSrc);
        dialog.showModal();
        const img = $('lightbox-img');
        const to = img.getBoundingClientRect();
        if (!to.width || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        img.animate(
            [
                {
                    transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width}, ${from.height / to.height})`,
                },
                { transform: 'none' },
            ],
            { duration: 550, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' },
        );
    }),
);
$('lightbox-close').addEventListener('click', () => dialog.close());
$('lightbox-prev').addEventListener('click', () => show(shown - 1));
$('lightbox-next').addEventListener('click', () => show(shown + 1));
dialog.addEventListener('click', (e) => e.target === dialog && dialog.close());
dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(shown - 1);
    if (e.key === 'ArrowRight') show(shown + 1);
});
