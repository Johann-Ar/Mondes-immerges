document.addEventListener('DOMContentLoaded', function () {
    // Initialisation du curseur personnalisé (désactivé sur mobile) - VERSION OPTIMISÉE
    if (window.innerWidth > 768) {
        const cursor = document.querySelector('.cursor');
        const follower = document.querySelector('.cursor-follower');

        let mouseX = 0;
        let mouseY = 0;
        let followerX = 0;
        let followerY = 0;
        let rafId = null;

        // Throttle professionnel pour mousemove (limite à 60fps max)
        let lastMouseMoveTime = 0;
        const mouseMoveThrottle = 16; // ~60fps

        const handleMouseMove = function (e) {
            const now = performance.now();
            if (now - lastMouseMoveTime < mouseMoveThrottle) return;
            lastMouseMoveTime = now;

            mouseX = e.clientX;
            mouseY = e.clientY;

            // Utiliser transform au lieu de left/top (plus performant)
            cursor.style.transform = `translate(${mouseX}px, ${mouseY}px)`;

            // Throttle l'elementFromPoint (coûteux)
            if (now % 100 < mouseMoveThrottle) {
                const element = document.elementFromPoint(e.clientX, e.clientY);
                if (element && (element.tagName === 'VIDEO' || element.classList.contains('bg-video'))) {
                    cursor.style.width = '60px';
                    cursor.style.height = '60px';
                    follower.style.width = '80px';
                    follower.style.height = '80px';
                } else {
                    const isInteractive =
                        element &&
                        (element.tagName === 'A' ||
                            element.tagName === 'BUTTON' ||
                            element.classList.contains('explore-globe-btn'));

                    if (isInteractive) {
                        cursor.style.width = '50px';
                        cursor.style.height = '50px';
                        follower.style.width = '70px';
                        follower.style.height = '70px';
                    } else {
                        cursor.style.width = '30px';
                        cursor.style.height = '30px';
                        follower.style.width = '40px';
                        follower.style.height = '40px';
                    }
                }
            }
        };

        document.addEventListener('mousemove', handleMouseMove, { passive: true });

        function animateFollower() {
            const dx = mouseX - followerX;
            const dy = mouseY - followerY;

            followerX += dx * 0.2;
            followerY += dy * 0.2;

            // Utiliser transform au lieu de left/top
            follower.style.transform = `translate(${followerX}px, ${followerY}px)`;

            rafId = requestAnimationFrame(animateFollower);
        }

        rafId = requestAnimationFrame(animateFollower);

        // Cleanup au déchargement de la page
        window.addEventListener('beforeunload', () => {
            if (rafId) cancelAnimationFrame(rafId);
            document.removeEventListener('mousemove', handleMouseMove);
        });

        // Gestion de l'entrée et sortie de la page
        document.addEventListener('mouseenter', function () {
            cursor.style.opacity = '1';
            follower.style.opacity = '0.7';
        });

        document.addEventListener('mouseleave', function () {
            cursor.style.opacity = '0';
            follower.style.opacity = '0';
        });

        window.addEventListener('mouseenter', function () {
            cursor.style.opacity = '1';
            follower.style.opacity = '0.7';
        });

        window.addEventListener('mouseleave', function () {
            cursor.style.opacity = '0';
            follower.style.opacity = '0';
        });

        // Effets de survol pour les éléments interactifs
        const interactiveElements = document.querySelectorAll('a, button, .explore-globe-btn');

        interactiveElements.forEach(function (el) {
            el.addEventListener('mouseenter', function () {
                follower.style.opacity = '1';
            });

            el.addEventListener('mouseleave', function () {
                follower.style.opacity = '0.7';
            });
        });
    }

    // ===== GESTION OPTIMISÉE DES VIDÉOS AVEC LAZY LOADING =====
    const bgVideo = document.querySelector('.bg-video');
    const logoVideo = document.getElementById('logoVideo');
    let bgVideoLoaded = false;

    // Fonction pour charger la vidéo d'arrière-plan (LAZY LOADING)
    function loadBackgroundVideo() {
        if (bgVideoLoaded || !bgVideo) return;
        bgVideoLoaded = true;

        const videoSrc = bgVideo.dataset.src;
        if (!videoSrc) return;

        // Créer un élément source
        const source = document.createElement('source');
        source.src = videoSrc;
        source.type = 'video/webm';
        bgVideo.appendChild(source);

        // Charger la vidéo
        bgVideo.load();

        // Événements optimisés
        bgVideo.addEventListener(
            'canplaythrough',
            function onReady() {
                bgVideo.play().catch(function () {
                    /* Autoplay prevented */
                });
            },
            { once: true },
        );

        bgVideo.addEventListener(
            'error',
            function () {
                // Retry une seule fois
                setTimeout(() => bgVideo.load(), 2000);
            },
            { once: true },
        );
    }

    // Gestion de la vidéo du logo avec déclenchement lazy loading
    if (logoVideo) {
        let logoHandled = false;

        // Forcer le chargement immédiat
        logoVideo.load();

        logoVideo.addEventListener('loadstart', function () {});

        logoVideo.addEventListener(
            'canplay',
            function () {
                logoVideo.play().catch(function (e) {});
            },
            { once: true },
        );

        logoVideo.addEventListener('playing', function () {}, { once: true });

        logoVideo.addEventListener('stalled', function () {});

        logoVideo.addEventListener('waiting', function () {});

        logoVideo.addEventListener('error', function (e) {
            console.error('[ACCUEIL] Erreur logo vidéo:', logoVideo.error?.message || e);
        });

        const handleLogoEnd = function () {
            if (logoHandled) return;
            logoHandled = true;

            logoVideo.style.opacity = '0';
            setTimeout(() => {
                logoVideo.style.display = 'none';
            }, 500);

            // LAZY LOADING: Charger la vidéo d'arrière-plan APRÈS le logo
            // Polyfill requestIdleCallback pour navigateurs non supportés
            const idleCallback = window.requestIdleCallback || ((cb) => setTimeout(cb, 1));
            idleCallback(
                () => {
                    loadBackgroundVideo();
                },
                { timeout: 1000 },
            );
        };

        logoVideo.addEventListener('ended', handleLogoEnd, { once: true });

        logoVideo.addEventListener(
            'error',
            function () {
                handleLogoEnd();
            },
            { once: true },
        );

        // Sécurité : masquer après 10 secondes maximum
        setTimeout(function () {
            if (!logoHandled) {
                handleLogoEnd();
            }
        }, 10000);
    } else {
        // Pas de logo video, charger directement la vidéo d'arrière-plan
        loadBackgroundVideo();
    }

    // Gestion du bouton Explorer avec vidéo de transition
    const exploreBtn = document.getElementById('exploreBtn');
    const transitionVideo = document.getElementById('transitionVideo');
    const loadingOverlay = document.getElementById('loading-overlay');

    if (exploreBtn && transitionVideo && loadingOverlay) {
        let blackScreenShown = false;

        exploreBtn.addEventListener('click', function () {
            // Masquer le contenu et activer la vidéo de transition
            document.body.classList.add('transition-active');
            transitionVideo.classList.add('active');
            transitionVideo.currentTime = 0;
            blackScreenShown = false;

            // Écouter la progression de la vidéo pour afficher l'écran noir AVANT la fin
            transitionVideo.addEventListener('timeupdate', function checkEndApproaching() {
                const timeLeft = transitionVideo.duration - transitionVideo.currentTime;

                // Quand il reste 0.3 seconde ou moins, afficher l'écran noir
                if (timeLeft <= 0.3 && !blackScreenShown) {
                    blackScreenShown = true;

                    // Afficher l'écran noir IMMÉDIATEMENT au-dessus de tout
                    loadingOverlay.style.display = 'flex';
                    loadingOverlay.style.opacity = '1';
                    loadingOverlay.style.background = '#000';
                    loadingOverlay.style.zIndex = '999999';
                    loadingOverlay.classList.add('active');

                    transitionVideo.removeEventListener('timeupdate', checkEndApproaching);
                }
            });

            // Lancer la vidéo
            transitionVideo
                .play()
                .then(() => {
                    transitionVideo.addEventListener(
                        'ended',
                        function () {
                            if (document.body.classList.contains('redirected')) return;
                            document.body.classList.add('redirected');
                            transitionVideo.classList.add('freeze-last-frame');
                            window.location.href = 'interface/';
                        },
                        { once: true },
                    );
                })
                .catch(() => {
                    // En cas d'erreur, redirection immédiate
                    if (!document.body.classList.contains('redirected')) {
                        document.body.classList.add('redirected');
                        transitionVideo.classList.add('freeze-last-frame');
                        window.location.href = 'interface/';
                    }
                });

            // Fallback : 15 secondes maximum
            setTimeout(() => {
                if (!document.body.classList.contains('redirected')) {
                    document.body.classList.add('redirected');
                    transitionVideo.classList.add('freeze-last-frame');
                    window.location.href = 'interface/';
                }
            }, 15000);
        });
    }

    // Smooth scroll pour les liens de navigation
    const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
    navLinks.forEach(function (link) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });
            }
        });
    });
});

// Reset transition video when page is restored from cache (back button)
window.addEventListener('pageshow', function (event) {
    if (event.persisted || (performance.navigation && performance.navigation.type === 2)) {
        const transitionVideo = document.getElementById('transitionVideo');
        const loadingOverlay = document.getElementById('loadingOverlay');

        if (transitionVideo) {
            transitionVideo.classList.remove('active');
            transitionVideo.classList.remove('freeze-last-frame');
            transitionVideo.pause();
            transitionVideo.currentTime = 0;
        }

        if (loadingOverlay) {
            loadingOverlay.classList.remove('active');
            loadingOverlay.style.display = 'none';
            loadingOverlay.style.opacity = '0';
        }

        // Reset redirected state
        document.body.classList.remove('redirected');
        document.body.classList.remove('transition-active');
    }
});
