// Horloge du HUD satellite et blocage du défilement clavier (les flèches pilotent le globe)

const ARROWS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

function updateClock() {
    const now = new Date();
    const date = document.getElementById('current-date');
    const time = document.getElementById('current-time');
    if (date)
        date.textContent = now.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    if (time) time.textContent = now.toISOString().slice(11, 19);
}

export function initHud() {
    document.addEventListener('keydown', (e) => {
        if (ARROWS.includes(e.key)) e.preventDefault();
    });
    updateClock();
    setInterval(updateClock, 1000);
}
