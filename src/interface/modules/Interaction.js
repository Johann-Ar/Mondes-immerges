// Gestionnaire d'interactions pour Mondes Immergés
import { gsap } from 'gsap';

export class Interaction {
    /**
     * Crée une instance du gestionnaire d'interactions
     * @param {Object} options - Options de configuration
     * @param {Object} options.globeManager - Instance du GlobeManager
     * @param {Object} options.visualEffects - Instance de VisualEffects (optionnel)
     */
    constructor(options) {
        this.globeManager = options.globeManager;
        this.visualEffects = options.visualEffects;
        
        this.isDragging = false;
        this.lastTouchTime = 0;
        this.touchTimeout = null;
        this.mouseStartY = 0;
        this.mouseStartX = 0;
        this.scrollAmount = 0;
        this.lastPosition = { x: 0, y: 0 }; // Pour suivre les mouvements de la souris/touch
        
        // Variables pour gérer le scroll
        this.scrollTimerId = null;
        this.scrollSpeed = 0;
        this.lastScrollTime = 0;
        this.scrollAccumulator = 0;
        
        // Nouveaux paramètres pour l'inertie
        this.inertiaEnabled = true;
        this.velocityX = 0;
        this.velocityY = 0;
        this.inertiaAnimationId = null;
        this.zoomInertia = 0;
        
        // Paramètres pour le pinch-to-zoom
        this.initialDistance = 0;
        this.currentDistance = 0;
        this.isPinching = false;
        
        // Paramètres pour la détection de mouvement
        this.movementThreshold = 5; // pixels
        this.swipeThreshold = 80; // pixels
        this.hasMoved = false;
        
        // État de l'interface
        this.interfaceVisible = true;
        this.autoHideTimeout = null;
        
        this.init();
    }
    
    /**
     * Initialise les gestionnaires d'événements
     */
    init() {
    const container = this.globeManager.container;
    
    // SUPPRIMER TOUTES LES INTERACTIONS DE GLISSEMENT
    // Conserver seulement le scroll et les clics
    
    // Écouteur pour la molette UNIQUEMENT
    container.addEventListener('wheel', this.handleMouseWheel.bind(this), { passive: false });
    
    // Écouteur pour le clavier
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    
    // Écouteur pour masquer/afficher l'interface après inactivité
    document.addEventListener('mousemove', this.resetInterfaceAutoHide.bind(this));
    
    // Démarrer la détection d'inactivité
    this.startInterfaceAutoHide();
    
}
    
    
    
    /**
     * Gère le mouvement d'un toucher
     * @param {TouchEvent} event - Événement de toucher
     */
    handleTouchMove(event) {
        if (!this.isDragging) return;
        
        event.preventDefault();
        
        
        // Si en mode hotspot, détecter le scroll vertical pour quitter
        if (this.globeManager.orbitParams.inHotspotMode && event.touches.length === 1) {
            const currentY = event.touches[0].clientY;
            const diffY = currentY - this.mouseStartY;
            
            // Accumuler la quantité de scroll
            this.scrollAmount += diffY;
            
            // Si le scroll a dépassé un certain seuil vers le bas, quitter le mode hotspot
            if (this.scrollAmount > 150) {
                this.globeManager.exitHotspotModeExternal();
                
                // Créer un effet de feedback visuel
                // Notification désactivée volontairement

                
                this.scrollAmount = 0;
            }
            
            // Mettre à jour la position de départ pour le prochain mouvement
            this.mouseStartY = currentY;
        }
        // Si pas en mode hotspot, permettre la rotation du globe
        else if (event.touches.length === 1) {
            const currentX = event.touches[0].clientX;
            const currentY = event.touches[0].clientY;
            
            // Calculer le déplacement
            const deltaX = currentX - this.lastPosition.x;
            const deltaY = currentY - this.lastPosition.y;
            
            // Marquer comme déplacé si le mouvement dépasse le seuil
            if (Math.abs(deltaX) > this.movementThreshold || Math.abs(deltaY) > this.movementThreshold) {
                this.hasMoved = true;
            }
            
            // Calculer la vélocité
            this.velocityX = 0.8 * this.velocityX + 0.2 * deltaX;
            this.velocityY = 0.8 * this.velocityY + 0.2 * deltaY;
            
            // Rotation manuelle du globe basée sur les paramètres d'orbite
            this.globeManager.orbitParams.orbitAngle -= deltaX * 0.005;
            
            // Mettre à jour la position pour le prochain mouvement
            this.lastPosition = { x: currentX, y: currentY };
            
            // Forcer la mise à jour de la position de la caméra
            if (typeof this.globeManager._updateCameraPositionManual === 'function') {
                this.globeManager._updateCameraPositionManual();
            }
        }
    }
    
    /**
     * Gère le défilement de la molette pour contrôler la vitesse de l'orbite
     * Implémentation améliorée avec effets visuels et transition fluide
     * @param {WheelEvent} event - Événement de défilement
     */
    handleMouseWheel(event) {
        event.preventDefault();

        // Afficher l'interface si elle est masquée
        this.showInterface();

        // Réinitialiser la détection d'inactivité
        this.resetInterfaceAutoHide();

        // Si en mode hotspot, utiliser la molette pour zoomer/dézoomer
        if (this.globeManager.orbitParams.inHotspotMode) {
            const zoomIn = event.deltaY < 0;
            this.globeManager.zoom(zoomIn);
            return;
        }

        // Annuler toute animation gsap de retour en cours (évite les conflits)
        gsap.killTweensOf(this.globeManager.orbitParams, "currentSpeed");

        // Normaliser le deltaY (les trackpads envoient des valeurs très différentes des souris)
        let delta = event.deltaY;
        if (event.deltaMode === 1) delta *= 40; // lignes → pixels
        if (event.deltaMode === 2) delta *= 800; // pages → pixels

        // Appliquer le changement de vitesse directement (pas d'accumulation buggée)
        const scrollMagnitude = Math.min(Math.abs(delta) / 100, 1.5);

        if (delta > 0) {
            // Défilement vers le bas - ralentir
            this.globeManager.orbitParams.currentSpeed = Math.max(
                this.globeManager.orbitParams.baseSpeed * 0.3,
                this.globeManager.orbitParams.currentSpeed * Math.pow(this.globeManager.orbitParams.decelerationFactor, scrollMagnitude)
            );
        } else {
            // Défilement vers le haut - accélérer
            this.globeManager.orbitParams.currentSpeed = Math.min(
                this.globeManager.orbitParams.maxSpeed,
                this.globeManager.orbitParams.currentSpeed * Math.pow(this.globeManager.orbitParams.accelerationFactor, scrollMagnitude)
            );
        }

        // Annuler tout minuteur existant de retour à la vitesse de base
        if (this.scrollTimerId) {
            clearTimeout(this.scrollTimerId);
        }

        // Retour progressif à la vitesse de base après 2s d'inactivité de scroll
        this.scrollTimerId = setTimeout(() => {
            gsap.to(this.globeManager.orbitParams, {
                currentSpeed: this.globeManager.orbitParams.baseSpeed,
                duration: 2.5,
                ease: "power2.out"
            });
            this.scrollTimerId = null;
        }, 2000);
    }
    
    /**
     * Gère les événements du clavier avec améliorations pour les hotspots
     * MODIFICATION: Retrait de la gestion de la touche Entrée (maintenant gérée par GlobeManager)
     * @param {KeyboardEvent} event - Événement clavier
     */
    handleKeyDown(event) {
        // Afficher l'interface si elle est masquée
        this.showInterface();
        
        // Réinitialiser la détection d'inactivité
        this.resetInterfaceAutoHide();
        
        switch (event.key) {
            case 'Escape':
                // Si en mode hotspot, Escape pour revenir au globe
                if (this.globeManager.orbitParams.inHotspotMode) {
                    this.globeManager.exitHotspotModeExternal();
                    
                    // Effet visuel de retour
                    if (this.visualEffects) {
                        this.visualEffects.flashScreen('rgba(0, 0, 0, 0.4)');
                        this.visualEffects.showNotification("Retour à l'exploration globale", "info", 2000);
                    }
                }
                break;
                
            // SUPPRIMÉ: case 'Enter' - maintenant géré par GlobeManager pour le changement de vidéo
                
            case 'ArrowUp':
            case 'ArrowDown':
            case 'ArrowLeft':
            case 'ArrowRight':
                // Empêcher le défilement de la page
                event.preventDefault();
                
                // Comportement différent selon le mode
                if (this.globeManager.orbitParams.inHotspotMode && event.key === 'ArrowDown') {
                    // Si en mode hotspot, flèche bas pour quitter
                    this.globeManager.exitHotspotModeExternal();
                    
                    if (this.visualEffects) {
                        this.visualEffects.flashScreen('rgba(0, 0, 0, 0.4)');
                        this.visualEffects.showNotification("Retour à l'exploration globale", "info", 2000);
                    }
                } else {
                    // Navigation standard pour les autres cas
                    this.handleArrowNavigation(event.key);
                }
                break;
                
            case '+':
            case '=': 
                // Zoomer
                this.globeManager.zoom(true);
                break;
                
            case '-':
            case '_': 
                // Dézoomer
                this.globeManager.zoom(false);
                break;
                
            case 'r':
            case 'R':
                // Réinitialiser la vue
                this.globeManager.resetView();
                
                // Effet visuel de réinitialisation
                if (this.visualEffects) {
                    this.visualEffects.flashScreen('rgba(255, 255, 255, 0.2)');
                    this.visualEffects.showNotification("Vue réinitialisée", "info", 2000);
                }
                break;
                
            case 'h':
            case 'H':
                // Basculer la visibilité de l'interface
                this.toggleInterface();
                break;
        }
    }
    
    /**
     * Gère la navigation par flèches avec protection améliorée
     * @param {string} key - Touche de direction ('ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight')
     */
    handleArrowNavigation(key) {
        try {
            // Sauvegarde temporaire des paramètres actuels en cas d'erreur
            const backupAngle = this.globeManager.orbitParams.orbitAngle;
            
            // Désactiver temporairement l'orbite automatique
            const wasOrbiting = this.globeManager.orbitParams.isOrbiting;
            this.globeManager.orbitParams.isOrbiting = false;
            
            // Modifier la rotation en fonction de la touche
            switch (key) {
                case 'ArrowLeft':
                    this.globeManager.orbitParams.orbitAngle += 0.05;
                    break;
                case 'ArrowRight':
                    this.globeManager.orbitParams.orbitAngle -= 0.05;
                    break;
                case 'ArrowUp':
                    // Optionnellement utiliser pour augmenter l'inclinaison ou accélérer l'orbite
                    if (!this.globeManager.orbitParams.inHotspotMode) {
                        const prevIncl = this.globeManager.orbitParams.inclination;
                        this.globeManager.orbitParams.inclination = Math.min(
                            prevIncl + 0.03, 
                            Math.PI / 3 // Maximum 60 degrés
                        );
                    }
                    break;
                case 'ArrowDown':
                    // Optionnellement utiliser pour diminuer l'inclinaison ou ralentir l'orbite
                    if (!this.globeManager.orbitParams.inHotspotMode) {
                        const prevIncl = this.globeManager.orbitParams.inclination;
                        this.globeManager.orbitParams.inclination = Math.max(
                            prevIncl - 0.03,
                            0.1 // Minimum 5.7 degrés
                        );
                    }
                    break;
            }
            
            // Mettre à jour la caméra
            if (typeof this.globeManager._updateCameraPositionManual === 'function') {
                this.globeManager._updateCameraPositionManual();
            }
            
            // Réactiver l'orbite après un court délai
            setTimeout(() => {
                this.globeManager.orbitParams.isOrbiting = wasOrbiting;
            }, 500);
        } catch (e) {
            // Restaurer l'angle original en cas d'erreur
            if (this.globeManager && this.globeManager.orbitParams) {
                this.globeManager.orbitParams.orbitAngle = backupAngle;
                this.globeManager.orbitParams.isOrbiting = true;
            }
        }
    }
    
    /**
     * Démarre le minuteur pour masquer l'interface après une période d'inactivité
     */
    startInterfaceAutoHide() {
        if (this.autoHideTimeout) {
            clearTimeout(this.autoHideTimeout);
        }
        
        this.autoHideTimeout = setTimeout(() => {
            this.hideInterface();
        }, 10000); // 10 secondes d'inactivité
    }
    
    /**
     * Réinitialise le minuteur d'auto-masquage de l'interface
     */
    resetInterfaceAutoHide() {
        this.showInterface();
        this.startInterfaceAutoHide();
    }
    
    /**
     * Masque l'interface utilisateur
     */
    hideInterface() {
        if (!this.interfaceVisible) return;
        
        this.interfaceVisible = false;
        
        // Obtenir les éléments d'interface
        const uiControls = document.getElementById('ui-controls');
        const huds = document.querySelectorAll('.satellite-hud, .coordinates-display');
        const crosshair = document.querySelector('.satellite-crosshair');
        
        // Animer la disparition progressive
        gsap.to(uiControls, {
            opacity: 0,
            y: 20,
            duration: 0.5,
            ease: "power2.inOut"
        });
        
        gsap.to([...huds, crosshair], {
            opacity: 0,
            duration: 0.5,
            ease: "power2.inOut"
        });
        
        // Désactiver les interactions avec les éléments masqués
        setTimeout(() => {
            if (!this.interfaceVisible) {
                uiControls.style.pointerEvents = 'none';
            }
        }, 500);
    }
    
    /**
     * Affiche l'interface utilisateur
     */
    showInterface() {
        if (this.interfaceVisible) return;
        
        this.interfaceVisible = true;
        
        // Obtenir les éléments d'interface
        const uiControls = document.getElementById('ui-controls');
        const huds = document.querySelectorAll('.satellite-hud, .coordinates-display');
        const crosshair = document.querySelector('.satellite-crosshair');
        
        // Réactiver les interactions
        uiControls.style.pointerEvents = 'auto';
        
        // Animer l'apparition progressive
        gsap.to(uiControls, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out"
        });
        
        gsap.to([...huds, crosshair], {
            opacity: 1,
            duration: 0.5,
            ease: "power2.out"
        });
    }
    
    /**
     * Bascule l'état de visibilité de l'interface
     */
    toggleInterface() {
        if (this.interfaceVisible) {
            this.hideInterface();
            
            // Afficher une notification temporaire pour indiquer que 'H' peut réafficher l'interface
            // Notification désactivée volontairement

        } else {
            this.showInterface();
            this.startInterfaceAutoHide();
        }
    }
}