import { FILMS, SOURCE, filmBySlug, image } from '../data/films.js';
import { brand } from '../shared/logo.js';
import { reveal } from '../shared/reveal.js';

const BASE = import.meta.env.BASE_URL;
const $ = (id) => document.getElementById(id);

const slug = new URLSearchParams(location.search).get('film');
const film = filmBySlug(slug) || FILMS[0];
const index = FILMS.indexOf(film);
const next = FILMS[(index + 1) % FILMS.length];

document.title = `${film.title} · Mondes Immergés`;
document.documentElement.style.setProperty('--accent', film.accent);
$('brand').innerHTML = brand(BASE);
$('back').href = `${BASE}globe/?film=${film.slug}`;

const section = (id, kicker, title, body, cls = '') => `
    <section class="section ${cls}" id="${id}">
        <header class="section-head reveal">
            <p class="kicker">${kicker}</p>
            <h2>${title}</h2>
        </header>
        ${body}
    </section>`;

const people = film.people
    .map(
        (p) => `
        <li class="person reveal">
            ${
                p.photo
                    ? `<img src="${image(p.photo, 400)}" alt="${p.name}" loading="lazy" width="400" height="400" />`
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
        <li class="reveal">
            <button class="shot" data-index="${i}" aria-label="Agrandir : ${caption}">
                <img src="${image(file, 900)}" alt="${caption}" loading="lazy" />
            </button>
            <p>${caption} <span>© ${credit}</span></p>
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
        <img class="hero-image" src="${image(film.hero, 2000)}" alt="" fetchpriority="high" />
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
        <a class="hero-scroll" href="#film" aria-label="Lire la suite">↓</a>
    </section>

    ${section(
        'film',
        'Le documentaire',
        'L’histoire',
        `<div class="story">
            ${film.synopsis.map((p, i) => `<p class="reveal ${i === 0 ? 'lead' : ''}">${p}</p>`).join('')}
        </div>
        <ul class="facts">
            ${film.facts.map((f) => `<li class="reveal"><strong>${f.value}</strong><span>${f.label}</span></li>`).join('')}
        </ul>`,
    )}

    ${section('visages', 'Ils font le film', 'Les visages', `<ul class="people">${people}</ul>`, 'section-people')}

    ${section('galerie', 'Dans l’objectif', 'Galerie photo', `<ul class="gallery">${gallery}</ul>`, 'section-gallery')}

    ${reviews}

    ${section('agir', 'Aller plus loin', 'Agir et s’informer', `<ul class="actions">${actions}</ul>`)}

    ${section(
        'equipe',
        'Générique',
        'L’équipe',
        `<dl class="credits">${film.credits.map(([role, names]) => `<div class="reveal"><dt>${role}</dt><dd>${names}</dd></div>`).join('')}</dl>`,
        'section-credits',
    )}

    <a class="next-film" href="${BASE}documentaire/?film=${next.slug}" style="--next:${next.accent}">
        <img src="${image(next.hero, 1600)}" alt="" loading="lazy" />
        <span class="next-label">Monde suivant</span>
        <span class="next-title">${next.title}</span>
        <span class="next-place">${next.place} · ${next.country}</span>
    </a>

    <footer class="footer">
        <p>Mondes Immergés est un projet étudiant non officiel. Films, photos et informations : <a href="${SOURCE}" target="_blank" rel="noopener">National Geographic Documentary Films</a>. Textes adaptés en français.</p>
        <a href="${BASE}globe/">Retour au globe</a>
    </footer>`;

reveal();

// Barre du haut : opaque dès qu'on quitte l'image d'ouverture
const bar = $('bar');
new IntersectionObserver(([e]) => bar.classList.toggle('is-solid', !e.isIntersecting), {
    rootMargin: '-80px 0px 0px 0px',
}).observe(document.querySelector('.hero'));

// Visionneuse de la galerie
const dialog = $('lightbox');
let shown = 0;
function show(i) {
    shown = (i + film.gallery.length) % film.gallery.length;
    const [file, caption, credit] = film.gallery[shown];
    $('lightbox-img').src = image(file, 2000);
    $('lightbox-img').alt = caption;
    $('lightbox-caption').textContent = `${caption} © ${credit}`;
}
document.querySelectorAll('.shot').forEach((b) =>
    b.addEventListener('click', () => {
        show(Number(b.dataset.index));
        dialog.showModal();
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
