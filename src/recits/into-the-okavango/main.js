import './translations.js';

// JavaScript principal pour Into the Okavango - National Geographic

// Corriger le bug de retour depuis la page interface (bfcache)
window.addEventListener('pageshow', function (event) {
    if (event.persisted || (window.performance && window.performance.navigation.type === 2)) {
        window.location.reload();
    }
});

// Variables globales
let currentGalleryIndex = 0;
let touchStartX = 0;
let touchEndX = 0;
let isMenuOpen = false;

document.addEventListener('DOMContentLoaded', function () {
    // Détection du type d'appareil
    const isMobile = window.innerWidth < 768;
    const isDesktop = window.innerWidth >= 1025;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // *** NOUVEAU LOADER AVEC L-JELLY VISIBLE ***
    document.body.classList.add('loading');

    // Créer le nouveau loader avec l-jelly
    const customLoader = document.createElement('div');
    customLoader.className = 'custom-loader';
    customLoader.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        background: #000000 !important;
        display: flex !important;
        justify-content: center !important;
        align-items: center !important;
        z-index: 999999 !important;
        opacity: 1 !important;
        visibility: visible !important;
        transition: opacity 0.8s ease !important;
    `;

    // Enregistrer l-jelly si nécessaire
    if (window.jelly && window.jelly.register) {
        window.jelly.register();
    }

    // Créer l'élément l-jelly avec couleurs National Geographic
    const jellyLoader = document.createElement('l-jelly');
    jellyLoader.setAttribute('size', '60');
    jellyLoader.setAttribute('speed', '1.2');
    jellyLoader.setAttribute('color', '#ffdd00'); // Jaune National Geographic
    jellyLoader.style.cssText = `
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
    `;

    customLoader.appendChild(jellyLoader);
    document.body.appendChild(customLoader);

    // Force le retour en haut
    history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // LANCER LA VIDÉO IMMÉDIATEMENT
    startGlobeVideoImmediately();

    // MASQUER LE LOADER ET JOUER LA VIDÉO DE TRANSITION INVERSÉE
    setTimeout(() => {
        // Masquer le jelly loader
        customLoader.style.opacity = '0';

        setTimeout(() => {
            customLoader.remove();
            document.body.classList.remove('loading');

            // Initialiser le curseur personnalisé UNIQUEMENT sur desktop avec souris
            if (isDesktop && !isTouchDevice) {
                initCustomCursor();
            }
        }, 800);
    }, 2000);

    // Masquer l'ancien loader s'il existe
    const oldLoader = document.querySelector('.loader');
    if (oldLoader) {
        oldLoader.style.display = 'none';
    }

    // Initialiser toutes les fonctionnalités
    initGlobalLoader();
    initMobileMenu();
    initAnimations();
    initSideNav();
    initBackToTop();
    initShareButtons();
    fixVideos();
    initLogoClick();
    initGallery();
    initReturnExploration();
    animateNavLinks();
    setTimeout(() => {
        window.initOkavangoTranslator();
    }, 1000);

    // Gestion du redimensionnement
    window.addEventListener('resize', handleResize);

    function handleResize() {
        const newIsMobile = window.innerWidth < 768;

        // Fermer le menu mobile si on passe à desktop
        if (window.innerWidth >= 1025 && isMenuOpen) {
            window.closeMenu();
        }

        // Réinitialiser la galerie si nécessaire
        if ((isMobile && !newIsMobile) || (!isMobile && newIsMobile)) {
            initGallery();
        }
    }

    // Force le retour en haut lors du rechargement
    window.addEventListener('beforeunload', function () {
        window.scrollTo(0, 0);
    });

    setTimeout(() => {
        window.scrollTo(0, 0);
    }, 100);
});

// Nouvelle fonction pour lancer la vidéo texture Okavango immédiatement
function startGlobeVideoImmediately() {
    const globeVideo = document.querySelector('.globe-video');
    if (globeVideo) {
        // Only set attributes - actual playback is managed by fixVideos() exclusively
        globeVideo.muted = true;
        globeVideo.loop = true;
        globeVideo.playsInline = true;
        globeVideo.setAttribute('playsinline', '');
        globeVideo.setAttribute('webkit-playsinline', '');
        globeVideo.style.opacity = '0';
        globeVideo.style.transition = 'opacity 1.5s ease';
        globeVideo.style.filter = 'brightness(0.7) contrast(1.1) hue-rotate(10deg)';
    }
}

// Force le retour en haut au chargement
window.addEventListener('load', function () {
    setTimeout(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    }, 50);
});

// Initialisation du menu mobile/tablette - Thème Okavango
function initMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const sideNav = document.querySelector('.side-nav');
    const menuOverlay = document.querySelector('.menu-overlay');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!menuToggle || !sideNav || !menuOverlay) {
        return;
    }

    // Afficher le bouton hamburger après la section hero
    window.addEventListener('scroll', function () {
        const heroHeight = document.querySelector('#hero').offsetHeight;
        if (window.scrollY > heroHeight * 0.8) {
            menuToggle.classList.add('visible');
        } else {
            menuToggle.classList.remove('visible');
        }
    });

    // Toggle du menu
    menuToggle.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        if (isMenuOpen) {
            window.closeMenu();
        } else {
            openMenu();
        }
    });

    // Fermer le menu en cliquant sur l'overlay
    menuOverlay.addEventListener('click', closeMenu);

    // Fermer le menu en cliquant sur un lien
    navLinks.forEach((link) => {
        link.addEventListener('click', function () {
            if (window.innerWidth < 1025) {
                window.closeMenu();
            }
        });
    });

    // Fonctions d'ouverture/fermeture du menu
    window.openMenu = openMenu;
    window.closeMenu = closeMenu;

    function openMenu() {
        sideNav.classList.add('open');
        menuOverlay.classList.add('active');
        menuToggle.classList.add('active');
        document.body.style.overflow = 'hidden';
        isMenuOpen = true;
    }

    function closeMenu() {
        sideNav.classList.remove('open');
        menuOverlay.classList.remove('active');
        menuToggle.classList.remove('active');
        document.body.style.overflow = '';
        isMenuOpen = false;
    }

    // Fermer le menu avec la touche Escape
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && isMenuOpen) {
            window.closeMenu();
        }
    });
}

// Initialisation du bouton "retour à l'exploration" - THÈME OKAVANGO
function initReturnExploration() {
    const returnBtn = document.querySelector('.return-exploration');

    if (!returnBtn) {
        return;
    }

    const expeditionSection = document.querySelector('#expedition');

    if (!expeditionSection) {
        return;
    }

    // Variable locale pour éviter les conflits
    let expeditionVisited = false;

    // Observer pour détecter la visite de l'expédition
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && entry.intersectionRatio >= 0.5 && !expeditionVisited) {
                    expeditionVisited = true;

                    returnBtn.style.opacity = '1';
                    returnBtn.style.pointerEvents = 'all';
                    returnBtn.style.transform = 'translateY(0)';
                    returnBtn.classList.add('visible');
                }
            });
        },
        {
            threshold: 0.5,
            rootMargin: '-100px 0px -100px 0px',
        },
    );

    observer.observe(expeditionSection);

    // NOUVEAU: Animation dynamique quand on est en haut du site
    window.addEventListener('scroll', function () {
        if (returnBtn.classList.contains('visible')) {
            if (window.scrollY < 100) {
                // En haut du site - animation pulse
                returnBtn.classList.add('at-top');
            } else {
                // Pas en haut - retour normal
                returnBtn.classList.remove('at-top');
            }
        }
    });

    // Gestion du clic - REDIRECTION DIRECTE
    returnBtn.addEventListener('click', function (e) {
        e.preventDefault();
        // Animation de clic
        returnBtn.style.transform = 'scale(0.95)';

        // Redirection après courte animation
        setTimeout(() => {
            window.location.href = '../';
        }, 150);
    });
}

// Initialisation du loader global - Thème National Geographic
function initGlobalLoader() {
    let globalLoader = document.querySelector('.global-loader');
    if (!globalLoader) {
        globalLoader = document.createElement('div');
        globalLoader.className = 'global-loader';
        globalLoader.innerHTML = `
            <div class="loader-content">
                <l-jelly size="40" speed="0.9" color="#ffdd00"></l-jelly>
            </div>
        `;
        document.body.appendChild(globalLoader);
    }

    window.showGlobalLoader = function () {
        globalLoader.classList.add('active');
    };

    window.hideGlobalLoader = function () {
        globalLoader.classList.remove('active');
    };

    // Loader pour les navigations internes
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function (e) {
            window.showGlobalLoader();
            setTimeout(() => {
                window.hideGlobalLoader();
            }, 800);
        });
    });

    window.addEventListener('beforeunload', function () {
        window.showGlobalLoader();
    });
}

// Initialisation de la galerie Okavango avec support tactile
// Initialisation de la galerie - Version complète avec support tactile
function initGallery() {
    loadGalleryImages();

    const galleryTrack = document.querySelector('.gallery-track');
    const prevBtn = document.querySelector('.gallery-prev');
    const nextBtn = document.querySelector('.gallery-next');

    if (!galleryTrack) {
        return;
    }

    // Créer l'élément pour le mode plein écran
    let fullscreenMode = document.querySelector('.fullscreen-mode');
    if (!fullscreenMode) {
        fullscreenMode = document.createElement('div');
        fullscreenMode.className = 'fullscreen-mode';
        fullscreenMode.innerHTML = `
            <img src="" alt="Image en plein écran" class="fullscreen-image">
        `;
        document.body.appendChild(fullscreenMode);
    }

    // Fonction pour afficher une slide spécifique
    function showSlide(index) {
        const slides = document.querySelectorAll('.gallery-slide');
        if (!slides.length) return;

        if (index >= slides.length) index = 0;
        if (index < 0) index = slides.length - 1;

        slides.forEach((slide) => {
            slide.classList.remove('active');
            slide.classList.remove('transitioning');
        });

        slides[index].classList.add('active');
        slides[index].classList.add('transitioning');

        const updatedDots = document.querySelectorAll('.gallery-dot');
        updatedDots.forEach((dot) => dot.classList.remove('active'));
        if (updatedDots[index]) {
            updatedDots[index].classList.add('active');
        }

        currentGalleryIndex = index;
    }

    // Navigation par boutons
    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showSlide(currentGalleryIndex - 1);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showSlide(currentGalleryIndex + 1);
        });
    }

    // Support tactile pour le swipe
    if ('ontouchstart' in window) {
        galleryTrack.addEventListener('touchstart', handleTouchStart, { passive: true });
        galleryTrack.addEventListener('touchmove', handleTouchMove, { passive: true });
        galleryTrack.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    function handleTouchStart(e) {
        touchStartX = e.touches[0].clientX;
    }

    function handleTouchMove(e) {
        if (!touchStartX) return;
        touchEndX = e.touches[0].clientX;
    }

    function handleTouchEnd(e) {
        if (!touchStartX || !touchEndX) return;

        const difference = touchStartX - touchEndX;
        const threshold = 50; // Seuil minimum pour déclencher le swipe

        if (Math.abs(difference) > threshold) {
            if (difference > 0) {
                // Swipe vers la gauche - image suivante
                showSlide(currentGalleryIndex + 1);
            } else {
                // Swipe vers la droite - image précédente
                showSlide(currentGalleryIndex - 1);
            }
        }

        touchStartX = 0;
        touchEndX = 0;
    }
}

// Chargement dynamique des images de la galerie Okavango
function loadGalleryImages() {
    const galleryTrack = document.querySelector('.gallery-track');
    const galleryDots = document.querySelector('.gallery-dots');

    if (!galleryTrack || !galleryDots) return;

    galleryTrack.innerHTML = '';
    galleryDots.innerHTML = '';

    // Images spécifiques à l'Okavango (6 images exactes)
    const okavango_images = [
        {
            src: 'images/img-photo-gallerie-01.jpeg',
            title: "Eaux du Delta de l'Okavango",
            desc: "Les eaux cristallines du delta de l'Okavango, source de vie pour la plus grande population d'éléphants d'Afrique.",
        },
        {
            src: 'images/img-photo-gallerie-02.jpeg',
            title: 'Reflets au coucher du soleil',
            desc: 'Les eaux paisibles du delta reflètent les couleurs dorées du coucher de soleil africain.',
        },
        {
            src: 'images/img-photo-gallerie-03.jpeg',
            title: 'Oiseaux migrateurs',
            desc: "Les oiseaux survolent les eaux du delta lors de leur migration annuelle à travers l'Afrique australe.",
        },
        {
            src: 'images/img-photo-gallerie-04.jpeg',
            title: 'Éléphants traversant le delta',
            desc: "Un groupe d'éléphants traverse les eaux peu profondes du delta de l'Okavango.",
        },
        {
            src: 'images/img-photo-gallerie-05.jpeg',
            title: 'Expédition scientifique',
            desc: "L'équipe de Steve Boyes lors de l'expédition de recherche dans le delta de l'Okavango.",
        },
        {
            src: 'images/img-photo-gallerie-06.jpeg',
            title: 'Coucher de soleil sur le delta',
            desc: 'Le soleil se couche sur les eaux du delta, créant un spectacle naturel magnifique.',
        },
    ];

    okavango_images.forEach((imageData, i) => {
        const slide = document.createElement('div');
        slide.className = 'gallery-slide' + (i === 0 ? ' active' : '');

        const imageContainer = document.createElement('div');
        imageContainer.className = 'gallery-image-container';

        const image = document.createElement('img');
        image.src = imageData.src;
        image.alt = imageData.title;
        image.className = 'gallery-image';

        image.onerror = function () {
            // Image de fallback si l'image n'existe pas
            image.src = 'images/expedition.jpeg';
        };

        imageContainer.appendChild(image);

        // Ajouter les informations sur mobile/tablette
        if (window.innerWidth < 1025) {
            const imageInfo = document.createElement('div');
            imageInfo.className = 'image-info';
            imageInfo.innerHTML = `
                <h3>${imageData.title}</h3>
                <p>${imageData.desc}</p>
            `;
            slide.appendChild(imageContainer);
            slide.appendChild(imageInfo);
        } else {
            slide.appendChild(imageContainer);
        }

        galleryTrack.appendChild(slide);

        const dot = document.createElement('span');
        dot.className = 'gallery-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('data-index', i.toString());
        galleryDots.appendChild(dot);
    });
}

// Clic sur le logo pour retourner en haut
function initLogoClick() {
    const logo = document.querySelector('.fixed-logo');
    if (logo) {
        logo.addEventListener('click', function (e) {
            e.preventDefault();
            window.showGlobalLoader();

            document.body.classList.add('scrolling-up');

            window.scrollTo({
                top: 0,
                behavior: 'smooth',
            });

            setTimeout(() => {
                document.body.classList.remove('scrolling-up');
                window.hideGlobalLoader();
            }, 500);
        });
    }
}

// Gestion du menu latéral - Adapté desktop/mobile Okavango
function initSideNav() {
    const sideNav = document.querySelector('.side-nav');
    const heroSection = document.querySelector('#hero');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = [];

    navLinks.forEach((link) => {
        const targetId = link.getAttribute('href');
        const section = document.querySelector(targetId);
        if (section) {
            sections.push({
                id: targetId,
                element: section,
                link: link,
            });
        }
    });

    window.addEventListener('scroll', function () {
        // Afficher la navigation seulement sur desktop après le hero
        if (window.innerWidth >= 1025) {
            if (window.scrollY > heroSection.offsetHeight * 0.8) {
                sideNav.classList.add('visible');
            } else {
                sideNav.classList.remove('visible');
            }
        }

        updateActiveSection(sections);
    });
}

// Mettre à jour la section active
function updateActiveSection(sections) {
    const scrollPosition = window.scrollY + window.innerHeight / 3;

    sections.forEach((section) => {
        const sectionTop = section.element.offsetTop;
        const sectionBottom = sectionTop + section.element.offsetHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            document.querySelectorAll('.nav-link').forEach((link) => {
                link.classList.remove('active');
            });

            section.link.classList.add('active');
        }
    });
}

// Bouton de retour en haut - Adapté tactile Okavango
function initBackToTop() {
    const backToTopBtn = document.querySelector('.back-to-top');

    if (!backToTopBtn) return;

    window.addEventListener('scroll', function () {
        if (window.scrollY > 500) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    backToTopBtn.addEventListener('click', function (e) {
        e.preventDefault();
        window.showGlobalLoader();

        document.body.classList.add('scrolling-up');

        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });

        setTimeout(() => {
            document.body.classList.remove('scrolling-up');
            window.hideGlobalLoader();
        }, 500);
    });
}

// Gestion des vidéos - Optimisée tactile Okavango
function fixVideos() {
    // Vidéo de texture (hero) avec filtres Okavango - SYSTÈME UNIQUE
    const globeVideo = document.querySelector('.globe-video');
    if (globeVideo) {
        globeVideo.muted = true;
        globeVideo.loop = true;
        globeVideo.playsInline = true;
        globeVideo.setAttribute('playsinline', '');
        globeVideo.setAttribute('webkit-playsinline', '');
        globeVideo.preload = 'auto';

        // Single play function - no competing systems
        let isPlaying = false;

        function playOnce() {
            if (isPlaying) return;
            isPlaying = true;
            const p = globeVideo.play();
            if (p && p.then) {
                p.then(() => {
                    isPlaying = false;
                }).catch(() => {
                    isPlaying = false;
                });
            } else {
                isPlaying = false;
            }
        }

        function startGlobeVideo() {
            globeVideo.style.opacity = '1';
            globeVideo.style.transition = 'opacity 1s ease';
            globeVideo.style.filter = 'brightness(0.7) contrast(1.1) hue-rotate(10deg)';

            if (globeVideo.readyState >= 3) {
                playOnce();
            } else {
                globeVideo.addEventListener('canplay', () => playOnce(), { once: true });
            }
        }

        window.startGlobeVideoAfterLoading = startGlobeVideo;

        // Only restart on ended (loop should handle this, but as fallback)
        globeVideo.addEventListener('ended', function () {
            this.currentTime = 0;
            playOnce();
        });

        // Start the globe video immediately after setup
        startGlobeVideo();
    }

    // Vidéo du documentaire - Adaptée tactile avec contrôles intelligents
    const docVideo = document.querySelector('.main-video');
    const videoContainer = document.querySelector('.video-container');
    const playButton = document.querySelector('.video-play-button');

    if (docVideo && playButton) {
        let controlsTimeout;

        // Masquer les contrôles par défaut
        docVideo.controls = false;
        videoContainer.classList.remove('playing', 'paused', 'hide-controls');

        // Fonction pour masquer les contrôles après un délai
        function hideControlsAfterDelay() {
            clearTimeout(controlsTimeout);
            controlsTimeout = setTimeout(() => {
                if (docVideo.paused) {
                    videoContainer.classList.add('hide-controls');
                    docVideo.controls = false;
                }
            }, 3000); // 3 secondes en pause
        }

        // Fonction pour afficher les contrôles
        function showControls() {
            clearTimeout(controlsTimeout);
            videoContainer.classList.remove('hide-controls');
            docVideo.controls = true;
        }

        // Afficher les contrôles au survol sur desktop seulement
        if (window.innerWidth >= 1025 && !('ontouchstart' in window)) {
            videoContainer.addEventListener('mouseenter', function () {
                if (!docVideo.paused) {
                    showControls();
                }
            });

            videoContainer.addEventListener('mouseleave', function () {
                if (!docVideo.paused) {
                    // Garder les contrôles visibles pendant la lecture
                    return;
                }
            });
        }

        // Gestion du bouton play adapté tactile
        playButton.addEventListener('click', function (e) {
            e.preventDefault();
            window.showGlobalLoader();

            if (docVideo.paused) {
                docVideo
                    .play()
                    .then(() => {
                        window.hideGlobalLoader();
                        playButton.innerHTML = `
                            <svg viewBox="0 0 24 24">
                                <path d="M14,19H18V5H14M6,19H10V5H6V19Z"></path>
                            </svg>
                        `;
                        videoContainer.classList.add('playing');
                        videoContainer.classList.remove('paused', 'hide-controls');

                        // Afficher les contrôles pendant la lecture
                        showControls();

                        setTimeout(() => {
                            playButton.style.opacity = '0';
                        }, 500);
                    })
                    .catch((error) => {
                        window.hideGlobalLoader();
                    });
            } else {
                window.hideGlobalLoader();
                docVideo.pause();
                playButton.innerHTML = `
                    <svg viewBox="0 0 24 24">
                        <path d="M8,5.14V19.14L19,12.14L8,5.14Z"></path>
                    </svg>
                `;
                videoContainer.classList.remove('playing');
                videoContainer.classList.add('paused');
                videoContainer.classList.remove('hide-controls');
                playButton.style.opacity = '1';

                // Afficher les contrôles puis les masquer après 3 secondes
                showControls();
                hideControlsAfterDelay();
            }
        });

        // Événement quand la vidéo est mise en pause
        docVideo.addEventListener('pause', function () {
            videoContainer.classList.remove('playing');
            videoContainer.classList.add('paused');
            videoContainer.classList.remove('hide-controls');
            playButton.innerHTML = `
                <svg viewBox="0 0 24 24">
                    <path d="M8,5.14V19.14L19,12.14L8,5.14Z"></path>
                </svg>
            `;
            playButton.style.opacity = '1';

            // Afficher les contrôles puis les masquer après 3 secondes
            showControls();
            hideControlsAfterDelay();
        });

        // Événement quand la vidéo est lancée
        docVideo.addEventListener('play', function () {
            videoContainer.classList.add('playing');
            videoContainer.classList.remove('paused', 'hide-controls');
            playButton.innerHTML = `
                <svg viewBox="0 0 24 24">
                    <path d="M14,19H18V5H14M6,19H10V5H6V19Z"></path>
                </svg>
            `;

            // Afficher les contrôles pendant la lecture
            showControls();

            setTimeout(() => {
                playButton.style.opacity = '0';
            }, 500);
        });

        // Événement de fin de vidéo
        docVideo.addEventListener('ended', function () {
            videoContainer.classList.remove('playing', 'paused', 'hide-controls');
            playButton.innerHTML = `
                <svg viewBox="0 0 24 24">
                    <path d="M8,5.14V19.14L19,12.14L8,5.14Z"></path>
                </svg>
            `;
            playButton.style.opacity = '1';
            docVideo.controls = false;
        });

        docVideo.addEventListener('loadedmetadata', function () {
            if (docVideo.paused) {
                videoContainer.classList.remove('playing', 'paused', 'hide-controls');
                playButton.innerHTML = `
                    <svg viewBox="0 0 24 24">
                        <path d="M8,5.14V19.14L19,12.14L8,5.14Z"></path>
                    </svg>
                `;
                docVideo.controls = false;
            }
        });

        // Bouton doc pour lancer la vidéo
        const docButton = document.querySelector('.doc-button');
        if (docButton) {
            docButton.addEventListener('click', function (e) {
                e.preventDefault();
                window.showGlobalLoader();

                const videoSection = document.querySelector('.video-section');
                if (videoSection) {
                    videoSection.scrollIntoView({ behavior: 'smooth' });
                    setTimeout(() => {
                        docVideo
                            .play()
                            .then(() => {
                                window.hideGlobalLoader();
                                videoContainer.classList.add('playing');
                                videoContainer.classList.remove('paused', 'hide-controls');
                                playButton.innerHTML = `
                                <svg viewBox="0 0 24 24">
                                    <path d="M14,19H18V5H14M6,19H10V5H6V19Z"></path>
                                </svg>
                            `;

                                // Afficher les contrôles pendant la lecture
                                showControls();

                                setTimeout(() => {
                                    playButton.style.opacity = '0';
                                }, 500);
                            })
                            .catch((err) => {
                                window.hideGlobalLoader();
                            });
                    }, 1000);
                }
            });
        }
    }
}

// Boutons de partage - Adaptés tactile Okavango
function initShareButtons() {
    const shareButton = document.querySelector('.share-button');
    const shareIcon = document.querySelector('.share-icon');
    const shareOptions = document.querySelector('.share-options');
    const shareOptionLinks = document.querySelectorAll('.share-option');

    if (!shareButton || !shareIcon || !shareOptions) return;

    let isOverShareArea = false;

    // Apparition avec les mêmes conditions que back-to-top
    window.addEventListener('scroll', function () {
        if (window.scrollY > 500) {
            shareButton.classList.add('visible');
        } else {
            shareButton.classList.remove('visible');
        }
    });

    // Gestion différente selon le type d'appareil
    if ('ontouchstart' in window) {
        // Sur tactile, toggle au clic
        shareIcon.addEventListener('click', function (e) {
            e.preventDefault();
            shareOptions.classList.toggle('visible');
        });

        // Fermer en cliquant ailleurs
        document.addEventListener('click', function (e) {
            if (!shareButton.contains(e.target)) {
                shareOptions.classList.remove('visible');
            }
        });
    } else {
        // Sur desktop, au survol
        shareButton.addEventListener('mouseenter', function () {
            isOverShareArea = true;
            shareOptions.classList.add('visible');
        });

        shareButton.addEventListener('mouseleave', function () {
            isOverShareArea = false;
            setTimeout(() => {
                if (!isOverShareArea) {
                    shareOptions.classList.remove('visible');
                }
            }, 300);
        });

        shareOptions.addEventListener('mouseenter', function () {
            isOverShareArea = true;
        });

        shareOptions.addEventListener('mouseleave', function () {
            isOverShareArea = false;
            setTimeout(() => {
                if (!isOverShareArea) {
                    shareOptions.classList.remove('visible');
                }
            }, 300);
        });
    }

    // Gestion du partage Okavango
    shareOptionLinks.forEach((option) => {
        option.addEventListener('click', function (e) {
            e.preventDefault();

            window.showGlobalLoader();

            const platform = this.getAttribute('data-platform');
            const url = encodeURIComponent(window.location.href);
            const title = encodeURIComponent('Into the Okavango - National Geographic Documentary');

            let shareUrl;

            switch (platform) {
                case 'facebook':
                    shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                    break;
                case 'twitter':
                    shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
                    break;
                case 'linkedin':
                    shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
                    break;
                case 'instagram':
                    // Instagram ne permet pas le partage direct par URL
                    if (navigator.clipboard) {
                        navigator.clipboard.writeText(window.location.href);
                        alert(
                            'Lien copié ! Collez-le dans votre post Instagram pour partager Into the Okavango.',
                        );
                    } else {
                        alert(
                            'Copiez le lien manuellement pour le partager sur Instagram: ' +
                                window.location.href,
                        );
                    }
                    window.hideGlobalLoader();
                    return;
            }

            if (shareUrl) {
                window.open(shareUrl, '_blank', 'width=600,height=400');
                setTimeout(() => {
                    window.hideGlobalLoader();
                }, 1000);
            } else {
                window.hideGlobalLoader();
            }
        });
    });
}

// Animation des liens de navigation - Okavango
function animateNavLinks() {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            window.showGlobalLoader();

            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // Fermer le menu mobile si ouvert
                if (window.innerWidth < 1025 && isMenuOpen) {
                    window.closeMenu();
                }

                const offsetTop = targetElement.offsetTop - (window.innerWidth < 768 ? 80 : 0);

                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth',
                });

                setTimeout(() => {
                    window.hideGlobalLoader();
                }, 800);
            } else {
                window.hideGlobalLoader();
            }
        });
    });
}

// Animations au défilement - Optimisées performances mobile Okavango
function initAnimations() {
    const elementsToAnimate = document.querySelectorAll(
        '[data-animation], .video-section, .expedition-image, .stat-card, .scientific-image-wrapper, .resource-card, .credits-col, .section-title, .description',
    );

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.15,
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                entry.target.classList.remove('will-change');

                // Désactiver l'observation une fois l'animation déclenchée pour optimiser les performances
                observer.unobserve(entry.target);
            } else {
                entry.target.classList.add('will-change');
                entry.target.classList.remove('visible');
            }
        });
    }, observerOptions);

    elementsToAnimate.forEach((element) => {
        observer.observe(element);
    });

    // Vérification initiale
    checkVisibleElements();

    // Throttled scroll pour les performances
    let ticking = false;
    function updateElements() {
        checkVisibleElements();
        ticking = false;
    }

    document.addEventListener('scroll', function () {
        if (!ticking) {
            requestAnimationFrame(updateElements);
            ticking = true;
        }
    });
}

// Curseur personnalisé UNIQUEMENT sur desktop avec souris - Thème National Geographic
function initCustomCursor() {
    // Vérifier si c'est vraiment un appareil avec souris
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        return; // Ne pas initialiser sur tactile
    }

    const cursor = document.createElement('div');
    cursor.classList.add('cursor');

    const follower = document.createElement('div');
    follower.classList.add('cursor-follower');

    document.body.appendChild(cursor);
    document.body.appendChild(follower);

    let isOverImage = false;

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';

        setTimeout(() => {
            follower.style.left = e.clientX + 'px';
            follower.style.top = e.clientY + 'px';
        }, 30);

        const element = document.elementFromPoint(e.clientX, e.clientY);
        if (element) {
            const isVideo = element.tagName === 'VIDEO' || element.closest('video');
            const isImage =
                element.tagName === 'IMG' ||
                element.closest('img') ||
                element.classList.contains('gallery-image') ||
                element.classList.contains('fullscreen-image') ||
                element.classList.contains('main-video') ||
                element.classList.contains('globe-video');

            if (isVideo || isImage) {
                isOverImage = true;
                cursor.style.width = '60px';
                cursor.style.height = '60px';
                follower.style.width = '80px';
                follower.style.height = '80px';
                cursor.style.backgroundColor = '#ffdd00'; // Jaune National Geographic
                follower.style.borderColor = '#ffdd00'; // Jaune National Geographic
            } else {
                isOverImage = false;
                cursor.style.width = '30px';
                cursor.style.height = '30px';
                follower.style.width = '40px';
                follower.style.height = '40px';
                cursor.style.backgroundColor = '#ffdd00'; // Jaune National Geographic
                follower.style.borderColor = '#ffdd00';
            }
        }
    });

    const interactiveElements = document.querySelectorAll(
        'a, button, .nav-link, .share-icon, .back-to-top, .video-play-button, .gallery-arrow, .gallery-dot, .gallery-image-container, .return-exploration',
    );

    interactiveElements.forEach((el) => {
        el.addEventListener('mouseenter', () => {
            if (!isOverImage) {
                cursor.classList.add('hover');
                follower.classList.add('hover');
                cursor.style.backgroundColor = '#ffdd00'; // Jaune au survol
                follower.style.borderColor = '#ffdd00';
            }
        });

        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
            follower.classList.remove('hover');
            cursor.style.backgroundColor = '#ffdd00'; // Retour au jaune
            follower.style.borderColor = '#ffdd00';
        });
    });
}

// Vérifier les éléments visibles
function checkVisibleElements() {
    const elementsToCheck = document.querySelectorAll(
        '.will-change, [data-animation]:not(.visible), .video-section:not(.visible), .expedition-image:not(.visible), .stat-card:not(.visible), .scientific-image-wrapper:not(.visible), .resource-card:not(.visible), .credits-col:not(.visible), .section-title:not(.visible), .description:not(.visible)',
    );

    elementsToCheck.forEach((element) => {
        if (isElementInViewport(element)) {
            element.classList.add('visible');
            element.classList.remove('will-change');
        }
    });
}

// Vérifier si un élément est dans la zone visible
function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return rect.top < window.innerHeight * 0.85 && rect.bottom > 0;
}

// Prévenir le zoom sur double-tap (iOS)
let lastTouchEnd = 0;
document.addEventListener(
    'touchend',
    function (event) {
        const now = new Date().getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    },
    false,
);

// Gestion des changements d'orientation
window.addEventListener('orientationchange', function () {
    setTimeout(() => {
        // Recalculer les positions après changement d'orientation
        window.scrollTo(window.scrollX, window.scrollY);

        // Réinitialiser la galerie si nécessaire
        if (document.querySelector('.gallery-track')) {
            initGallery();
        }
    }, 100);
});

// Loader désactivé - pas de calque noir au chargement
window.addEventListener('load', function () {
    const loader = document.querySelector('.loader');
    if (loader) {
        loader.style.display = 'none';
    }
});

// Fonctions utilitaires spécifiques à Into the Okavango
function logOkavangoMessage(message) {
    /* Production: logging silenced */
}

// Performance monitoring pour Into the Okavango
if (window.performance && window.performance.mark) {
    window.performance.mark('into-the-okavango-app-start');

    window.addEventListener('load', function () {
        window.performance.mark('into-the-okavango-app-loaded');
        window.performance.measure(
            'into-the-okavango-load-time',
            'into-the-okavango-app-start',
            'into-the-okavango-app-loaded',
        );

        const measure = window.performance.getEntriesByName('into-the-okavango-load-time')[0];
        logOkavangoMessage(`Application chargée en ${Math.round(measure.duration)}ms`);
    });
}

// Variables globales pour la traduction

// Fonction de traduction simple qui utilise OkavangoTranslator
