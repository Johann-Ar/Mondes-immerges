/**
 * Galerie qui se range toute seule. Les photos arrivent en pile, penchées, puis volent à leur place :
 * - mosaïque : rangées justifiées selon les vraies proportions des images ;
 * - grille : cases carrées régulières.
 * Au redimensionnement ou au changement de disposition, chaque photo glisse vers sa nouvelle place.
 */
const GAP = 12;

export function gallery(list, tools) {
    const items = [...list.children];
    const ratio = items.map(() => 1.5);
    let mode = 'mosaic';
    let shown = false;

    // Pile de départ : chaque photo un peu tournée, au centre
    items.forEach((li, i) => {
        li.style.setProperty('--r', `${((i * 47) % 25) - 12}deg`);
        const img = li.querySelector('img');
        const read = () => {
            if (img.naturalWidth) ratio[i] = img.naturalWidth / img.naturalHeight;
            if (shown) layout();
        };
        if (img.complete) read();
        else img.addEventListener('load', read, { once: true });
    });

    function mosaic(width) {
        const target = width < 640 ? 170 : width < 1000 ? 240 : 300;
        const boxes = [];
        let row = [];
        let y = 0;
        const flush = (last) => {
            const sum = row.reduce((s, i) => s + ratio[i], 0);
            const free = width - GAP * (row.length - 1);
            const h = last ? Math.min(target, free / sum) : free / sum;
            let x = 0;
            for (const i of row) {
                boxes[i] = { x, y, w: ratio[i] * h, h };
                x += ratio[i] * h + GAP;
            }
            y += h + GAP;
            row = [];
        };
        items.forEach((_, i) => {
            row.push(i);
            const sum = row.reduce((s, j) => s + ratio[j], 0);
            if (sum * target + GAP * (row.length - 1) >= width) flush(false);
        });
        if (row.length) flush(true);
        return { boxes, height: y - GAP };
    }

    function grid(width) {
        const cols = width < 640 ? 2 : 3;
        const size = (width - GAP * (cols - 1)) / cols;
        const boxes = items.map((_, i) => ({
            x: (i % cols) * (size + GAP),
            y: Math.floor(i / cols) * (size + GAP),
            w: size,
            h: size,
        }));
        return { boxes, height: Math.ceil(items.length / cols) * (size + GAP) - GAP };
    }

    function layout(stagger = false) {
        const width = list.clientWidth;
        const { boxes, height } = (mode === 'grid' ? grid : mosaic)(width);
        list.style.height = `${height}px`;
        items.forEach((li, i) => {
            const b = boxes[i];
            li.style.transitionDelay = stagger ? `${i * 70}ms` : '0ms';
            li.style.transform = `translate(${b.x}px, ${b.y}px)`;
            li.style.width = `${b.w}px`;
            li.style.height = `${b.h}px`;
        });
    }

    // Avant l'arrivée : la pile, au centre de la zone
    const pile = () => {
        const width = list.clientWidth;
        const w = Math.min(320, width * 0.6);
        list.style.height = `${w * 0.9}px`;
        items.forEach((li) => {
            li.style.transform = `translate(${(width - w) / 2}px, 0)`;
            li.style.width = `${w}px`;
            li.style.height = `${w / 1.5}px`;
        });
    };
    pile();

    new IntersectionObserver(
        ([e], observer) => {
            if (!e.isIntersecting) return;
            observer.disconnect();
            shown = true;
            list.classList.add('is-arranged');
            layout(true);
        },
        { threshold: 0.25 },
    ).observe(list);

    let frame = 0;
    new ResizeObserver(() => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => (shown ? layout() : pile()));
    }).observe(list);

    tools.addEventListener('click', (e) => {
        const button = e.target.closest('[data-layout]');
        if (!button || button.dataset.layout === mode) return;
        mode = button.dataset.layout;
        tools.querySelectorAll('[data-layout]').forEach((b) => b.setAttribute('aria-pressed', b === button));
        list.dataset.layout = mode;
        if (shown) layout(true);
    });
}
