import { FILMS, image } from '../data/films.js';
import { LOGO } from '../shared/logo.js';
import { reveal } from '../shared/reveal.js';

const BASE = import.meta.env.BASE_URL;
const $ = (id) => document.getElementById(id);

$('logo').innerHTML = LOGO;
$('cards').innerHTML = FILMS.map(
    (film) => `
    <li class="reveal" style="--accent:${film.accent}">
        <a class="card" href="${BASE}documentaire/?film=${film.slug}">
            <img src="${image(film.hero, 900)}" alt="" loading="lazy" />
            <span class="tag">${film.world}</span>
            <span class="card-title">${film.title}</span>
            <span class="card-place">${film.place} · ${film.year}</span>
        </a>
    </li>`,
).join('');
reveal();

/**
 * Fond animé : des filets de courant qui dérivent dans un champ d'écoulement,
 * chauds en haut, froids en bas. Léger (canvas 2D) et arrêté hors écran.
 */
function flow(canvas) {
    const ctx = canvas.getContext('2d');
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0;
    let h = 0;
    let particles = [];
    let visible = true;

    function resize() {
        const dpr = Math.min(window.devicePixelRatio, 2);
        w = canvas.clientWidth;
        h = canvas.clientHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const count = Math.round((w * h) / 2600);
        particles = Array.from({ length: count }, () => spawn({}));
        ctx.fillStyle = '#061325';
        ctx.fillRect(0, 0, w, h);
    }

    function spawn(p) {
        p.x = Math.random() * w;
        p.y = Math.random() * h;
        p.life = 60 + Math.random() * 160;
        return p;
    }

    const field = (x, y, t) =>
        Math.sin(x * 0.0021 + t * 0.12) * 1.2 +
        Math.cos(y * 0.0034 - t * 0.09) * 0.9 +
        Math.sin((x + y) * 0.0012) * 0.6;

    function frame(now) {
        if (visible) {
            const t = now / 1000;
            ctx.fillStyle = 'rgba(6, 19, 37, 0.07)';
            ctx.fillRect(0, 0, w, h);
            ctx.lineWidth = 1.2;
            for (const p of particles) {
                const a = field(p.x, p.y, t);
                const nx = p.x + Math.cos(a) * 1.4 + 0.5;
                const ny = p.y + Math.sin(a) * 1.4;
                const warm = p.y / h < 0.5 + Math.sin(p.x * 0.004 + t * 0.2) * 0.12;
                ctx.strokeStyle = warm ? 'rgba(255, 143, 82, 0.55)' : 'rgba(107, 219, 255, 0.5)';
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(nx, ny);
                ctx.stroke();
                p.x = nx;
                p.y = ny;
                if (--p.life < 0 || p.x > w || p.y < 0 || p.y > h) spawn(p);
            }
        }
        if (!still) requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener('resize', resize);
    new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(canvas);
    if (still) for (let i = 0; i < 120; i++) frame(i * 16);
    else requestAnimationFrame(frame);
}

flow($('flow'));
