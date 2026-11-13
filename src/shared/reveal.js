/** Fait apparaître en douceur les éléments .reveal quand ils entrent dans l'écran. */
export function reveal(root = document) {
    const items = root.querySelectorAll('.reveal:not(.is-visible)');
    if (!('IntersectionObserver' in window)) {
        items.forEach((el) => el.classList.add('is-visible'));
        return;
    }
    const observer = new IntersectionObserver(
        (entries) => {
            for (const entry of entries) {
                if (!entry.isIntersecting) continue;
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        },
        { rootMargin: '0px 0px -8% 0px' },
    );
    items.forEach((el) => observer.observe(el));
}
