// Application principale pour Mondes Immergés
import { GlobeManager } from './modules/GlobeManager.js';
import { VisualEffects } from './modules/VisualEffects.js';
import { Interaction } from './modules/Interaction.js';
import { InterfaceUI } from './modules/InterfaceUI.js';
import { ContentPanel } from './modules/ContentPanel.js';
import { hotspots, getHotspotById } from './data/hotspots.js';

/**
 * Application principale Mondes Immergés
 * Classe singleton pour la gestion globale de l'application
 */
class MondesImmergesApp {
    constructor() {
        // Instances des modules
        this.globeManager = null;
        this.visualEffects = null;
        this.interaction = null;
        this.interfaceUI = null;
        this.contentPanel = null;

        // État de l'application
        this.isInitialized = false;
        this.isExploring = false;
        this.currentHotspot = null;
        this.explorationHistory = [];

        // Éléments DOM
        this.welcomeScreen = document.getElementById('welcome-screen');
        this.mainContainer = document.getElementById('main-container');
        this.loadingScreen = document.getElementById('loading-screen');
    }

    /**
     * Initialise l'application complète
     */
    init() {
        if (this.isInitialized) return;
        this.isInitialized = true;

        // Initialiser les effets visuels en premier
        this.visualEffects = new VisualEffects({
            container: this.mainContainer,
        });

        // Initialiser le gestionnaire de globe
        this.globeManager = new GlobeManager({
            containerId: 'globe-container',
        });

        // Initialiser la gestion des interactions
        this.interaction = new Interaction({
            globeManager: this.globeManager,
            visualEffects: this.visualEffects,
        });

        // Initialiser l'interface utilisateur
        this.interfaceUI = new InterfaceUI({
            zoomInBtn: document.getElementById('zoom-in'),
            zoomOutBtn: document.getElementById('zoom-out'),
            resetViewBtn: document.getElementById('reset-view'),
            infoBtn: document.getElementById('info-button'),
            closeInfoBtn: document.getElementById('close-info'),
            infoOverlay: document.getElementById('info-overlay'),
            globeManager: this.globeManager,
        });

        // Initialiser le panneau de contenu seulement si les éléments existent
        const contentPanelElements = {
            panel: document.getElementById('content-panel'),
            closeBtn: document.getElementById('close-panel'),
            titleElement: document.getElementById('hotspot-title'),
            descriptionElement: document.getElementById('hotspot-description'),
            videoElement: document.getElementById('hotspot-video'),
            globeManager: this.globeManager,
        };

        // Vérifier si au moins les éléments essentiels existent
        if (
            contentPanelElements.panel &&
            contentPanelElements.closeBtn &&
            contentPanelElements.titleElement &&
            contentPanelElements.descriptionElement
        ) {
            this.contentPanel = new ContentPanel(contentPanelElements);
        } else {
            // Créer un objet mock pour éviter les erreurs
            this.contentPanel = {
                show: () => {
                    /* Production: panel disabled */
                },
                hide: () => {
                    /* Production: panel disabled */
                },
                update: () => {
                    /* Production: panel disabled */
                },
            };
        }

        // Configurer les callbacks pour les événements de hotspot
        this.globeManager.setHotspotSelectCallback(this.handleHotspotSelect.bind(this));
        this.globeManager.setHotspotExitCallback(this.handleHotspotExit.bind(this));

        // Démarrer l'animation du globe
        this.globeManager.animate();

        // Ajouter les hotspots au globe
        this.globeManager.addHotspots(hotspots);

        // Initialiser l'interface satellite
        this.initSatelliteInterface();

        // Configurer les événements de l'application
        this.setupEventListeners();

        // Ajouter le logo National Geographic
        this.addNatGeoLogo();
    }

    /**
     * Configure les écouteurs d'événements de l'application
     */
    setupEventListeners() {
        // Bouton Explorer
        const exploreBtn = document.getElementById('explore-btn');
        if (exploreBtn) {
            exploreBtn.addEventListener('click', () => {
                this.startExploration();
            });
        }

        // Raccourcis clavier globaux
        document.addEventListener('keydown', (event) => {
            // Touche Espace pour démarrer l'exploration depuis l'écran d'accueil
            if (event.key === ' ' && !this.isExploring) {
                this.startExploration();
            }

            // Touche Échap pour quitter le mode hotspot ou revenir à l'écran d'accueil
            if (event.key === 'Escape') {
                if (this.currentHotspot) {
                    this.globeManager.exitHotspotModeExternal();
                    this.currentHotspot = null;
                } else if (this.isExploring) {
                    // Option pour revenir à l'écran d'accueil avec double échap
                    // Peut être désactivé selon les préférences
                    // this.returnToWelcomeScreen();
                }
            }
        });

        // Gérer le redimensionnement de la fenêtre
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    /**
     * Démarre l'exploration avec une animation d'entrée
     * @param {boolean} skipStartupAnimation - Si true, saute l'animation de démarrage fictive
     */
    startExploration(skipStartupAnimation = false) {
        if (this.isExploring) return;

        // Masquer l'écran d'accueil et afficher le conteneur principal
        if (this.welcomeScreen) {
            this.welcomeScreen.classList.add('hidden');
        }
        if (this.mainContainer) {
            this.mainContainer.classList.remove('hidden');
        }

        // Si skipStartupAnimation est true, on saute complètement la transition
        // pour éviter le flash noir qui coupe l'animation de chargement
        if (skipStartupAnimation) {
            this.isExploring = true;
        } else {
            // Transition visuelle normale
            this.visualEffects.transitionIn();

            // Attendre la fin de la transition pour démarrer la séquence d'initialisation
            setTimeout(() => {
                this.startupSequence();
            }, 1000);

            this.isExploring = true;
        }
    }

    /**
     * Retourne à l'écran d'accueil
     */
    returnToWelcomeScreen() {
        if (!this.isExploring) return;

        // Transition de sortie
        this.visualEffects.transitionOut(() => {
            // Masquer le conteneur principal et afficher l'écran d'accueil
            if (this.mainContainer) {
                this.mainContainer.classList.add('hidden');
            }
            if (this.welcomeScreen) {
                this.welcomeScreen.classList.remove('hidden');
            }

            // Réinitialiser l'état
            this.isExploring = false;
            this.currentHotspot = null;

            // Réinitialiser les vues
            if (this.contentPanel && this.contentPanel.hide) {
                this.contentPanel.hide();
            }

            if (this.globeManager) {
                this.globeManager.resetView();
            }
        });
    }

    /**
     * Gère le redimensionnement de la fenêtre
     */
    handleResize() {
        // Mettre à jour les dimensions du renderer si nécessaire
        if (this.globeManager && this.globeManager.renderer) {
            this.globeManager.onWindowResize();
        }

        // Autres ajustements responsive si nécessaire
    }

    /**
     * Ajoute le logo National Geographic en haut au centre
     * Avec vérification pour éviter les duplications - SANS fond
     */
    addNatGeoLogo() {
        // Vérifier si le logo existe déjà pour éviter les duplications
        const existingLogo = this.mainContainer.querySelector('.nat-geo-logo-container');
        if (existingLogo) {
            return;
        }

        // Créer le conteneur du logo avec une classe identifiable - SANS FOND
        const logoContainer = document.createElement('div');
        logoContainer.className = 'nat-geo-logo-container';
        logoContainer.style.cssText = `
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1000;
        `;

        // Créer l'élément image du logo (PNG transparent, taille réduite)
        const logo = document.createElement('img');
        logo.src = `${import.meta.env.BASE_URL}images/nat-geo-logo.png`;
        logo.alt = 'National Geographic';
        logo.className = 'nat-geo-logo';
        logo.style.cssText = `
            height: 50px;
            width: auto;
            display: block;
            filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.5));
        `;

        // Ajouter le logo au conteneur puis au document
        logoContainer.appendChild(logo);
        this.mainContainer.appendChild(logoContainer);
    }

    /**
     * Initialise l'interface satellite avec les mises à jour en temps réel
     */
    initSatelliteInterface() {
        // Éléments d'interface
        const coordLatElement = document.getElementById('coord-lat');
        const coordLngElement = document.getElementById('coord-lng');
        const zoomLevelElement = document.getElementById('zoom-level');
        const orbitStatusElement = document.getElementById('orbit-status');
        const altitudeElement = document.getElementById('altitude-value');
        const currentDateElement = document.getElementById('current-date');
        const currentTimeElement = document.getElementById('current-time');

        // Mise à jour en temps réel
        setInterval(() => {
            // Mettre à jour l'heure et la date
            const now = new Date();

            // Formater la date
            const dateOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
            if (currentDateElement) {
                currentDateElement.textContent = now.toLocaleDateString('fr-FR', dateOptions);
            }

            // Formater l'heure UTC
            const hours = String(now.getUTCHours()).padStart(2, '0');
            const minutes = String(now.getUTCMinutes()).padStart(2, '0');
            const seconds = String(now.getUTCSeconds()).padStart(2, '0');
            if (currentTimeElement) {
                currentTimeElement.textContent = `${hours}:${minutes}:${seconds}`;
            }

            // Mise à jour des coordonnées et du statut si le globe est initialisé
            if (this.globeManager && this.globeManager.camera) {
                // Position de la caméra
                const cameraPosition = this.globeManager.camera.position;

                // Calculer les coordonnées géographiques approximatives
                const distance = Math.sqrt(
                    cameraPosition.x * cameraPosition.x + cameraPosition.z * cameraPosition.z,
                );

                const lng = Math.atan2(cameraPosition.z, cameraPosition.x) * (180 / Math.PI);
                const lat = Math.atan2(cameraPosition.y, distance) * (180 / Math.PI);

                // Mettre à jour les valeurs d'interface
                if (coordLatElement) {
                    coordLatElement.textContent = Math.abs(lat).toFixed(4) + (lat >= 0 ? '' : '-');
                }

                if (coordLngElement) {
                    coordLngElement.textContent = Math.abs(lng).toFixed(4) + (lng >= 0 ? '' : '-');
                }

                // Calculer l'altitude réaliste (distance au centre - rayon Terre)
                // Rayon du globe = 2 unités, 1 unité ≈ 100 km
                const GLOBE_RADIUS = 2; // Rayon du globe en unités Three.js
                const KM_PER_UNIT = 100; // Conversion: 1 unité = 100 km
                const distanceFromCenter = cameraPosition.length();
                const altitude = (distanceFromCenter - GLOBE_RADIUS) * KM_PER_UNIT;
                if (altitudeElement) {
                    // Afficher en format xxx.xx KM
                    altitudeElement.textContent = altitude.toFixed(2);
                }

                // Mettre à jour le niveau de zoom
                if (zoomLevelElement && this.globeManager.orbitParams) {
                    zoomLevelElement.textContent = this.globeManager.orbitParams.zoomLevel.toFixed(1);
                }

                // Mettre à jour le statut d'orbite
                if (orbitStatusElement && this.globeManager.orbitParams) {
                    if (this.globeManager.orbitParams.inHotspotMode) {
                        orbitStatusElement.textContent = 'FIXÉE';
                        orbitStatusElement.style.color = '#ffcc00';
                    } else if (
                        this.globeManager.orbitParams.currentSpeed >
                        this.globeManager.orbitParams.baseSpeed * 1.5
                    ) {
                        orbitStatusElement.textContent = 'ACCÉLÉRÉE';
                        orbitStatusElement.style.color = '#ff9900';
                    } else if (
                        this.globeManager.orbitParams.currentSpeed < this.globeManager.orbitParams.baseSpeed
                    ) {
                        orbitStatusElement.textContent = 'RALENTIE';
                        orbitStatusElement.style.color = '#66ccff';
                    } else {
                        orbitStatusElement.textContent = 'NORMALE';
                        orbitStatusElement.style.color = '#ffffff';
                    }
                }
            }
        }, 100);
    }

    /**
     * Exécute une séquence de démarrage stylisée
     */
    startupSequence(onComplete) {
        // Créer l'effet de chargement orbital dans l'écran de chargement existant
        const loadingScreen = document.getElementById('loading-screen');

        this.visualEffects.createOrbitalLoaderEffect(
            () => {
                // Cette fonction sera appelée une fois l'animation terminée
                this.finalizeStartup();

                // Appeler le callback si fourni
                if (onComplete && typeof onComplete === 'function') {
                    onComplete();
                }
            },
            3,
            loadingScreen,
        ); // Durée de 3 secondes et utiliser l'écran de chargement

        // Pas de messages - loader uniquement
    }

    /**
     * Finalise le démarrage après la séquence d'animation
     */
    finalizeStartup() {
        // Afficher des messages système après le chargement
        this.showSystemMessages();

        // Afficher une notification de bienvenue
        setTimeout(() => {
            this.visualEffects.showNotification(
                "Bienvenue dans l'exploration des Mondes Immergés",
                'info',
                4000,
            );
        }, 1000);
    }

    /**
     * Affiche des messages système après le chargement
     */
    showSystemMessages() {
        // Cette méthode peut être utilisée pour afficher des messages informatifs
        // après le chargement de l'application
        // Vous pouvez implémenter cette fonction selon vos besoins
    }

    /**
     * Gère la sélection d'un point d'intérêt
     * @param {Object} hotspot - Le point d'intérêt sélectionné
     */
    handleHotspotSelect(hotspot) {
        // Mettre à jour l'état actuel
        this.currentHotspot = hotspot;

        // Ajouter à l'historique d'exploration
        this.explorationHistory.push({
            id: hotspot.id,
            title: hotspot.title,
            timestamp: Date.now(),
        });

        // Appliquer des effets visuels pour mettre en évidence la sélection
        this.visualEffects.highlightSelection(hotspot.position);
        this.visualEffects.flashScreen('rgba(255, 204, 0, 0.2)');

        // Modifier l'interface pour le mode "zone sensible"
        const coordDisplay = document.querySelector('.coordinates-display');
        if (coordDisplay) {
            coordDisplay.style.backgroundColor = 'rgba(255, 204, 0, 0.2)';
            coordDisplay.style.borderColor = 'rgba(255, 204, 0, 0.8)';
        }

        // Récupérer les données complètes du hotspot
        const fullHotspotData = getHotspotById(hotspot.id);

        // Préparer les informations détaillées pour le panneau de contenu
        const detailedInfo = this.generateDetailedInfoHTML(fullHotspotData);

        // Préparer les liens externes
        const links = fullHotspotData.sources || [
            {
                title: 'Étude scientifique de référence (National Geographic)',
                url: 'https://www.nationalgeographic.com/environment/oceans',
            },
            {
                title: 'Base de données océanographiques (NOAA)',
                url: 'https://www.noaa.gov/oceans-coasts',
            },
            {
                title: 'Conservation marine (UNESCO)',
                url: 'https://en.unesco.org/themes/ocean',
            },
        ];

        // Mettre à jour le panneau de contenu avec les informations du hotspot
        if (this.contentPanel && this.contentPanel.update) {
            this.contentPanel.update({
                title: hotspot.title,
                description: hotspot.description,
                videoSrc: hotspot.videoSrc,
                coordinates: hotspot.position,
                detailedInfo: detailedInfo,
                links: links,
            });

            // Afficher le panneau
            this.contentPanel.show();
        }

        // Masquer les contrôles de l'interface utilisateur
        if (this.interfaceUI && this.interfaceUI.setUIVisibility) {
            this.interfaceUI.setUIVisibility(false);
        }
    }

    /**
     * Génère le HTML pour les informations détaillées d'un hotspot
     * @param {Object} hotspot - Données complètes du hotspot
     * @returns {string} - HTML formaté
     */
    generateDetailedInfoHTML(hotspot) {
        if (!hotspot || !hotspot.scientificData) {
            return '<p>Informations détaillées non disponibles pour cette zone.</p>';
        }

        // Formater les données scientifiques
        const data = hotspot.scientificData;

        let scientificHTML = `
            <div class="scientific-data">
                <strong>Profondeur moyenne:</strong> ${
                    data.depth
                        ? typeof data.depth === 'object'
                            ? `${data.depth.min}-${data.depth.max} m (moy. ${data.depth.avg} m)`
                            : data.depth
                        : 'Non disponible'
                }<br>
                <strong>Température de l'eau:</strong> ${
                    data.temperature
                        ? typeof data.temperature === 'object'
                            ? `${data.temperature.min}-${data.temperature.max}°C (moy. ${data.temperature.avg}°C)`
                            : data.temperature
                        : 'Non disponible'
                }<br>
                <strong>Biodiversité:</strong> ${data.biodiversity || 'Non classifiée'}<br>
                <strong>Statut de conservation:</strong> ${data.conservationStatus || 'Non déterminé'}<br>
        `;

        // Ajouter d'autres données spécifiques si disponibles
        if (data.area) scientificHTML += `<strong>Superficie:</strong> ${data.area}<br>`;
        if (data.iceExtent)
            scientificHTML += `<strong>Étendue de glace:</strong> ${typeof data.iceExtent === 'object' ? `Hiver: ${data.iceExtent.winter}, Été: ${data.iceExtent.summer}` : data.iceExtent}<br>`;
        if (data.annualInput) scientificHTML += `<strong>Apport annuel:</strong> ${data.annualInput}<br>`;
        if (data.economicValue)
            scientificHTML += `<strong>Valeur économique:</strong> ${data.economicValue}<br>`;

        scientificHTML += `</div>`;

        // Ajouter la description détaillée
        let detailedHTML = '';
        if (hotspot.detailedInfo) {
            detailedHTML = `
                <div class="detailed-text">
                    ${hotspot.detailedInfo}
                </div>
            `;
        }

        // Ajouter une visualisation des données d'évolution si disponible
        let evolutionHTML = '';
        if (hotspot.evolutionData && hotspot.evolutionData.length > 0) {
            evolutionHTML = `
                <div class="data-visualization">
                    <h4>Évolution sur ${hotspot.evolutionData[hotspot.evolutionData.length - 1].year - hotspot.evolutionData[0].year} ans</h4>
                    <div class="chart-placeholder" style="width: 100%; height: 200px; background-color: rgba(0, 30, 60, 0.5); border-radius: 5px; display: flex; justify-content: center; align-items: center;">
                        <span>Graphique de tendance (à implémenter)</span>
                    </div>
                </div>
            `;
        }

        // Assembler le tout
        return `
            ${scientificHTML}
            ${detailedHTML}
            ${evolutionHTML}
        `;
    }

    /**
     * Gère la sortie du mode hotspot
     */
    handleHotspotExit() {
        // Masquer le panneau de contenu
        if (this.contentPanel && this.contentPanel.hide) {
            this.contentPanel.hide();
        }

        // Réinitialiser l'interface de coordonnées
        const coordDisplay = document.querySelector('.coordinates-display');
        if (coordDisplay) {
            coordDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            coordDisplay.style.borderColor = 'rgba(255, 204, 0, 0.3)';
        }

        // Réafficher les contrôles de l'interface utilisateur
        if (this.interfaceUI && this.interfaceUI.setUIVisibility) {
            this.interfaceUI.setUIVisibility(true);
        }

        // Réinitialiser l'état actuel
        this.currentHotspot = null;
    }
}

// Instance unique de l'application
const app = new MondesImmergesApp();

/**
 * Initialise l'application
 */
export function initApp() {
    app.init();
}

/**
 * Donne accès à l'instance de l'application (pour le débogage)
 */
export function getAppInstance() {
    return app;
}
