// Point d'entrée principal de l'application Mondes Immergés - VERSION OPTIMISÉE
import './styles/main.css';
import { gsap } from 'gsap';
import { initApp, getAppInstance } from './app.js';
import { videoManager } from './utils/VideoManager.js';
import { hotspots } from './data/hotspots.js';
import { getRedirectUrl } from './data/redirect-config.js';
import { initHud } from './hud.js';

initHud();
// ldrs (jelly loader) : enregistré par src/shared/loader.js

// === DEBUG LOGGING ===
const DEBUG = import.meta.env.DEV; // logs détaillés seulement avec npm run dev
function log(tag, ...args) {
    if (DEBUG) console.log(`[MI:${tag}]`, performance.now().toFixed(0) + 'ms', ...args);
}
function logWarn(tag, ...args) {
    console.warn(`[MI:${tag}]`, performance.now().toFixed(0) + 'ms', ...args);
}
function logError(tag, ...args) {
    console.error(`[MI:${tag}]`, performance.now().toFixed(0) + 'ms', ...args);
}
log('BOOT', 'Script principal chargé');

// État global de l'application
const APP_STATE = {
    initialized: false,
    webGLChecked: false,
    domReady: false,
    appStarted: false,
    cleanupDone: false,
};

/**
 * Vérifie qu'un contexte WebGL peut être créé (WebGL 2, sinon WebGL 1).
 * Renvoie la raison de l'échec quand le navigateur la donne.
 */
function checkWebGLCompatibility() {
    if (APP_STATE.webGLChecked) return true;

    const canvas = document.createElement('canvas');
    let reason = '';
    canvas.addEventListener(
        'webglcontextcreationerror',
        (e) => {
            reason = e.statusMessage || reason;
        },
        { once: true },
    );

    let gl = null;
    try {
        gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    } catch (error) {
        reason = error.message;
    }

    if (!gl) {
        logError('WEBGL', 'Contexte WebGL indisponible', reason);
        showWebGLError(reason);
        return false;
    }

    APP_STATE.webGLChecked = true;
    log('WEBGL', 'WebGL OK — renderer:', gl.getParameter(gl.RENDERER));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
}

/**
 * Mode sans WebGL : vidéo du globe en lecture simple + liste des lieux menant aux récits.
 */
function showWebGLError(reason = '') {
    const loadingScreen = document.getElementById('loading-screen');
    if (!loadingScreen) return;
    const base = import.meta.env.BASE_URL;
    const links = hotspots.map((h) => `<li><a href="${getRedirectUrl(h.id)}">${h.title}</a></li>`).join('');
    loadingScreen.innerHTML = `
        <div class="fallback">
            <video class="fallback__globe" src="${base}videos/globe.webm" autoplay muted loop playsinline></video>
            <div class="fallback__panel">
                <h2>Explorer les mondes immergés</h2>
                <p>Le globe 3D n'est pas disponible dans ce navigateur (WebGL désactivé). Choisissez un lieu :</p>
                <ul>${links}</ul>
                <p class="fallback__hint">Pour le globe interactif : activez l'accélération matérielle ou ouvrez le site dans Chrome, Firefox ou Safari.</p>
            </div>
        </div>
    `;
    loadingScreen.title = reason;
}

/**
 * Initialise le curseur personnalisé de manière optimisée - VERSION PROFESSIONNELLE
 */
function initCustomCursor() {
    // Désactiver sur mobile pour économiser ressources
    const isMobile = window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
        return;
    }

    const cursor = document.querySelector('.cursor');
    const follower = document.querySelector('.cursor-follower');

    if (!cursor || !follower) return;

    let mouseX = 0;
    let mouseY = 0;
    let followerX = 0;
    let followerY = 0;
    let rafId = null;

    // Throttle pour mousemove (60fps max)
    let lastMoveTime = 0;
    const moveThrottle = 16; // ~60fps

    const handleMouseMove = (e) => {
        const now = performance.now();
        if (now - lastMoveTime < moveThrottle) return;
        lastMoveTime = now;

        mouseX = e.clientX;
        mouseY = e.clientY;
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Animation optimisée avec RAF et transform (plus performant)
    function animate() {
        // Curseur principal - utiliser transform au lieu de left/top
        cursor.style.transform = `translate(${mouseX}px, ${mouseY}px)`;

        // Curseur suiveur avec interpolation
        followerX += (mouseX - followerX) * 0.1;
        followerY += (mouseY - followerY) * 0.1;
        follower.style.transform = `translate(${followerX}px, ${followerY}px)`;

        rafId = requestAnimationFrame(animate);
    }

    rafId = requestAnimationFrame(animate);

    // Nettoyage
    window.addEventListener(
        'beforeunload',
        () => {
            if (rafId) cancelAnimationFrame(rafId);
            document.removeEventListener('mousemove', handleMouseMove);
        },
        { once: true },
    );
}

/**
 * Joue la vidéo de transition après le préchargement
 * FLUX : écran noir reste → afficher contenu derrière → jouer vidéo logo par-dessus → retirer écran noir
 */
async function playTransitionVideo() {
    return new Promise((resolve) => {
        const jellyLoader = document.querySelector('l-jelly');
        const transitionVideo = document.getElementById('transition-video-in');
        const loadingScreen = document.getElementById('loading-screen');
        const mainContainer = document.getElementById('main-container');

        // Cacher le jelly loader
        if (jellyLoader) {
            jellyLoader.style.transition = 'opacity 0.3s ease';
            jellyLoader.style.opacity = '0';
            setTimeout(() => jellyLoader.remove(), 300);
        }

        if (!transitionVideo) {
            // Pas de vidéo : afficher directement le contenu
            if (mainContainer) mainContainer.style.opacity = '1';
            if (loadingScreen) {
                loadingScreen.style.display = 'none';
                loadingScreen.classList.add('hidden');
            }
            resolve();
            return;
        }

        // ÉTAPE 1: Afficher le contenu derrière l'écran noir (invisible pour l'utilisateur)
        if (mainContainer) {
            mainContainer.style.opacity = '1';
        }

        // Enregistrer la vidéo de transition avec le VideoManager
        videoManager.register(transitionVideo, {
            loop: false,
            muted: true,
            autoRetry: true,
            name: 'transition-video-in',
        });

        // ÉTAPE 2: Préparer et lancer la vidéo
        transitionVideo.classList.add('active');
        transitionVideo.currentTime = 0;

        let resolved = false;
        const finish = () => {
            if (resolved) return;
            resolved = true;

            transitionVideo.classList.remove('active');

            // ÉTAPE 4: Retirer complètement le loading-screen
            if (loadingScreen) {
                loadingScreen.style.display = 'none';
                loadingScreen.classList.add('hidden');
            }

            setTimeout(() => resolve(), 200);
        };

        transitionVideo
            .play()
            .then(() => {
                // ÉTAPE 3: La vidéo joue → retirer le fond noir du loading-screen
                // La vidéo (z-index: 99999) reste visible par-dessus le contenu
                if (loadingScreen) {
                    loadingScreen.style.background = 'transparent';
                }

                transitionVideo.addEventListener('ended', finish, { once: true });
            })
            .catch(() => {
                // Vidéo échouée : afficher directement
                if (loadingScreen) {
                    loadingScreen.style.display = 'none';
                    loadingScreen.classList.add('hidden');
                }
                finish();
            });

        // Timeout de sécurité basé sur la durée de la vidéo
        transitionVideo.addEventListener(
            'loadedmetadata',
            function () {
                const videoDuration = transitionVideo.duration;
                setTimeout(
                    () => {
                        if (!resolved) finish();
                    },
                    (videoDuration + 2) * 1000,
                );
            },
            { once: true },
        );

        // Fallback ultime : 15 secondes
        setTimeout(() => {
            if (!resolved) finish();
        }, 15000);
    });
}

/**
 * Démarre l'application de manière fluide
 */
async function startApplication() {
    if (APP_STATE.appStarted) {
        log('APP', 'Déjà démarré, skip');
        return;
    }

    APP_STATE.appStarted = true;
    log('APP', '=== DÉMARRAGE APPLICATION ===');

    try {
        // Initialiser l'app
        log('APP', 'initApp()...');
        initApp();

        const app = getAppInstance();
        if (!app) {
            throw new Error('Instance application non disponible');
        }
        log('APP', 'Instance app OK, globeManager:', !!app.globeManager);

        // Afficher le conteneur principal en arrière-plan (transparent pour l'instant)
        prepareMainContainer();

        // CRITIQUE: Précharger TOUS les assets avant de continuer
        if (app.globeManager && app.globeManager.preloadAllAssets) {
            log('APP', 'Préchargement assets...');
            await app.globeManager.preloadAllAssets();
            log('APP', 'Assets préchargés OK');
        } else {
            logWarn('APP', 'preloadAllAssets non disponible');
        }

        // Afficher et jouer la vidéo de transition
        log('APP', 'Lancement vidéo de transition...');
        await playTransitionVideo();
        log('APP', 'Vidéo de transition terminée');

        // Démarrer l'exploration et afficher l'interface immédiatement
        log('APP', 'Démarrage exploration...');
        app.startExploration(true);

        // Afficher les éléments UI immédiatement
        log('APP', 'Affichage éléments interface...');
        showInterfaceElements(app);
        log('APP', '=== APPLICATION PRÊTE ===');
    } catch (error) {
        logError('APP', 'ERREUR CRITIQUE:', error);
        showError(error);
    }
}

/**
 * Prépare le conteneur principal (invisible pour l'instant)
 * ET initialise l'interface en mode "clear" (tous les éléments UI cachés)
 */
function prepareMainContainer() {
    const mainContainer = document.getElementById('main-container');
    if (!mainContainer) return;

    mainContainer.classList.remove('hidden');
    // Le laisser à opacity 0 pour l'instant
    mainContainer.style.opacity = '0';
    mainContainer.style.transition = 'opacity 1s cubic-bezier(0.19, 1, 0.22, 1)';

    // Initialiser l'interface en mode "clear" - tous les éléments UI cachés
    const uiControls = document.getElementById('ui-controls');
    const huds = document.querySelectorAll('.satellite-hud, .coordinates-display');
    const crosshair = document.querySelector('.satellite-crosshair');
    const scannerEffect = document.querySelector('.scanner-effect');

    if (uiControls) {
        uiControls.style.opacity = '0';
        uiControls.style.transform = 'translateY(20px)';
        uiControls.style.pointerEvents = 'none';
    }

    huds.forEach((hud) => {
        hud.style.opacity = '0';
    });

    if (crosshair) {
        crosshair.style.opacity = '0';
    }

    if (scannerEffect) {
        scannerEffect.style.opacity = '0';
    }
}

/**
 * Fait apparaître les éléments de l'interface avec animation
 * Appelé 0.25s après la fin de la transition du fond noir
 * Inclut les HUD, crosshair, contrôles, scanner, hotspots ET leurs traits jaunes (connector lines)
 * @param {Object} appInstance - L'instance de l'application pour accéder au GlobeManager
 */
function showInterfaceElements(appInstance) {
    const uiControls = document.getElementById('ui-controls');
    const huds = document.querySelectorAll('.satellite-hud, .coordinates-display');
    const crosshair = document.querySelector('.satellite-crosshair');
    const hotspotLabels = document.querySelectorAll('.hotspot-label');
    const connectorSvgs = document.querySelectorAll('svg'); // Tous les SVG sont des connector lines
    const scannerEffect = document.querySelector('.scanner-effect');

    // IMPORTANT: Activer l'affichage des labels dans le GlobeManager
    if (appInstance && appInstance.globeManager) {
        appInstance.globeManager.showLabels();
    }

    // Réactiver les interactions
    if (uiControls) {
        uiControls.style.pointerEvents = 'auto';
    }

    // Réafficher l'interface
    {
        if (uiControls) {
            gsap.to(uiControls, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: 'power2.out',
            });
        }

        // Animer tous les éléments UI
        gsap.to([...huds, crosshair, scannerEffect].filter(Boolean), {
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
        });

        // Animer les hotspots ET leurs connector lines en même temps
        gsap.to([...hotspotLabels, ...connectorSvgs], {
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
        });
    }
}

/**
 * Affiche une erreur
 */
function showError(error) {
    const loadingScreen = document.getElementById('loading-screen');
    if (!loadingScreen) return;

    loadingScreen.innerHTML = `
        <div style="text-align: center; color: #ff6b6b; font-family: 'Roboto Mono', monospace; padding: 40px;">
            <div style="font-size: 2em; margin-bottom: 20px;">💥</div>
            <h2 style="margin-bottom: 20px;">Erreur</h2>
            <p style="margin-bottom: 20px;">Une erreur s'est produite.</p>
            <button onclick="location.reload()" style="background: #ff6b6b; color: #fff; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer;">
                🔄 Recharger
            </button>
        </div>
    `;
}

/**
 * Préparation initiale de l'environnement
 */
function prepareEnvironment() {
    // Masquer l'écran d'accueil
    const welcomeScreen = document.getElementById('welcome-screen');
    if (welcomeScreen) {
        welcomeScreen.style.display = 'none';
        welcomeScreen.classList.add('hidden');
    }

    // Préparer le conteneur principal (caché au départ)
    const mainContainer = document.getElementById('main-container');
    if (mainContainer) {
        mainContainer.classList.add('hidden');
        mainContainer.style.opacity = '0';
    }

    // Style pour désactiver la sélection et le drag
    const style = document.createElement('style');
    style.textContent = `
        #main-container, #globe-container, canvas {
            user-select: none !important;
            touch-action: none !important;
            -webkit-user-drag: none !important;
            pointer-events: auto !important;
            cursor: none !important;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Initialisation principale
 */
function initialize() {
    if (APP_STATE.initialized) {
        log('INIT', 'Déjà initialisé, skip');
        return;
    }

    APP_STATE.initialized = true;
    log('INIT', '=== INITIALISATION ===');

    // Vérifier WebGL
    if (!checkWebGLCompatibility()) {
        logError('INIT', 'WebGL incompatible, arrêt');
        return;
    }

    // Préparer l'environnement
    log('INIT', 'Préparation environnement...');
    prepareEnvironment();

    // Vérifier éléments DOM critiques
    const criticalElements = ['loading-screen', 'main-container', 'globe-container', 'app'];
    criticalElements.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) logWarn('INIT', `Élément manquant: #${id}`);
        else log('INIT', `#${id} OK`);
    });

    // Simulation de chargement simplifiée
    let progress = 0;
    const interval = setInterval(() => {
        progress += 12.5;

        if (progress >= 100) {
            clearInterval(interval);
            log('INIT', 'Chargement simulé terminé, démarrage app...');

            // Petit délai avant de démarrer l'app
            setTimeout(() => {
                startApplication();
            }, 300);
        }
    }, 200);
}

/**
 * Nettoyage des ressources à la fermeture
 */
function cleanup() {
    if (APP_STATE.cleanupDone) return;

    APP_STATE.cleanupDone = true;

    // Le nettoyage spécifique se fait dans les écouteurs individuels
}

// Point d'entrée principal - UN SEUL écouteur DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    log('DOM', 'DOMContentLoaded déclenché');
    if (APP_STATE.domReady) {
        logWarn('DOM', 'DOMContentLoaded déjà traité, skip');
        return;
    }

    APP_STATE.domReady = true;

    // Initialiser le curseur
    initCustomCursor();

    // Démarrer l'initialisation
    setTimeout(() => {
        initialize();
    }, 100);
});

// UN SEUL écouteur d'erreurs global
window.addEventListener(
    'error',
    (e) => {
        if (e.target !== window && (e.target.tagName === 'IMG' || e.target.tagName === 'SCRIPT')) {
            logWarn('ERR', 'Ressource non chargée:', e.target.tagName, e.target.src || e.target.href);
            return;
        }
        logError('ERR', 'Erreur globale:', e.message, e.filename, 'ligne', e.lineno);
    },
    { once: false, capture: true },
);

// UN SEUL écouteur pour les promesses rejetées
window.addEventListener(
    'unhandledrejection',
    (e) => {
        logError('PROMISE', 'Promise rejetée:', e.reason);
        e.preventDefault();
    },
    { once: false },
);

// Nettoyage avant déchargement
window.addEventListener('beforeunload', cleanup, { once: true });

// Corriger le bug de retour depuis les pages collection
// Recharger la page si elle vient du cache (bouton retour)
window.addEventListener('pageshow', (event) => {
    if (event.persisted || (window.performance && window.performance.navigation.type === 2)) {
        window.location.reload();
    }
});

// Export
export { initialize, initCustomCursor };
