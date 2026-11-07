// Modification du fichier VisualEffects.js pour ajouter les fonctions manquantes

// Effets visuels pour Mondes Immergés
import { gsap } from 'gsap';

export class VisualEffects {
    /**
     * Crée une instance de VisualEffects
     * @param {Object} options - Options de configuration
     * @param {HTMLElement} options.container - Élément conteneur principal
     */
    constructor(options) {
        this.container = options.container;
        this.effectsContainer = null;
        this.notificationContainer = null;
        
        this.init();
    }
    
    /**
     * Initialise les effets visuels
     */
    init() {
        // Créer un conteneur pour les effets
        this.effectsContainer = document.createElement('div');
        this.effectsContainer.classList.add('effects-container');
        this.effectsContainer.style.position = 'absolute';
        this.effectsContainer.style.top = '0';
        this.effectsContainer.style.left = '0';
        this.effectsContainer.style.width = '100%';
        this.effectsContainer.style.height = '100%';
        this.effectsContainer.style.pointerEvents = 'none';
        this.effectsContainer.style.zIndex = '5';
        
        // Ajouter le conteneur au DOM
        this.container.appendChild(this.effectsContainer);
        
        // Créer le conteneur de notifications
        this.createNotificationContainer();
    }
    
    /**
     * Crée un conteneur pour les notifications
     */
    createNotificationContainer() {
        this.notificationContainer = document.createElement('div');
        this.notificationContainer.className = 'notification-container';
        this.notificationContainer.style.cssText = `
            position: absolute;
            bottom: 30px;
            right: 30px;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 10px;
            z-index: 100;
            pointer-events: none;
            max-width: 400px;
        `;
        
        this.container.appendChild(this.notificationContainer);
    }
    
    /**
     * Ajoute un effet de transition d'entrée
     */
    transitionIn() {
        // Créer un overlay pour la transition
        const overlay = document.createElement('div');
        overlay.classList.add('transition-overlay');
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = '#000000';
        overlay.style.zIndex = '10';
        
        this.effectsContainer.appendChild(overlay);
        
        // Animer la transition avec GSAP
        gsap.fromTo(overlay, 
            { opacity: 1 }, 
            { 
                opacity: 0, 
                duration: 1.5, 
                ease: 'power2.out',
                onComplete: () => {
                    // Supprimer l'overlay une fois l'animation terminée
                    overlay.remove();
                }
            }
        );
    }
    
    /**
     * Ajoute un effet de transition de sortie
     * @param {Function} callback - Fonction à appeler une fois la transition terminée
     */
    transitionOut(callback) {
        // Créer un overlay pour la transition
        const overlay = document.createElement('div');
        overlay.classList.add('transition-overlay');
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = '#000000';
        overlay.style.zIndex = '10';
        overlay.style.opacity = '0';
        
        this.effectsContainer.appendChild(overlay);
        
        // Animer la transition avec GSAP
        gsap.to(overlay, { 
            opacity: 1, 
            duration: 1, 
            ease: 'power2.in',
            onComplete: () => {
                if (callback) {
                    callback();
                }
            }
        });
    }
    
    /**
     * Créer un effet de chargement orbital
     * @param {Function} onComplete - Fonction à appeler une fois l'animation terminée
     * @param {number} duration - Durée de l'animation en secondes
     */
    createOrbitalLoaderEffect(onComplete, duration = 4, targetContainer = null) {
        // Créer un conteneur pour l'effet
        const loaderContainer = document.createElement('div');
        loaderContainer.className = 'orbital-loader';

        // Si un conteneur cible est fourni, ne pas créer de fond (l'écran de chargement a déjà un fond noir)
        if (targetContainer) {
            loaderContainer.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 50;
                background-color: transparent;
            `;
        } else {
            // Comportement par défaut avec fond
            loaderContainer.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 50;
                background-color: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(5px);
            `;
        }
        
        // Créer le loader orbital
        const orbitalLoader = document.createElement('div');
        orbitalLoader.style.cssText = `
            width: 200px;
            height: 200px;
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
        `;
        
        // Anneaux orbitaux (3 anneaux avec différentes vitesses)
        for (let i = 0; i < 3; i++) {
            const ring = document.createElement('div');
            ring.style.cssText = `
                position: absolute;
                border-radius: 50%;
                border: 2px solid rgba(255, 204, 0, ${0.7 - i * 0.2});
                width: ${120 + i * 40}px;
                height: ${120 + i * 40}px;
                animation: orbit${i} ${4 - i * 0.5}s linear infinite;
            `;
            
            // Créer particules sur l'anneau
            for (let j = 0; j < 3 + i; j++) {
                const particle = document.createElement('div');
                const angle = (360 / (3 + i)) * j;
                particle.style.cssText = `
                    position: absolute;
                    width: ${8 - i}px;
                    height: ${8 - i}px;
                    background-color: #ffcc00;
                    border-radius: 50%;
                    top: 50%;
                    left: 50%;
                    box-shadow: 0 0 10px #ffcc00;
                    transform: translate(-50%, -50%) rotate(${angle}deg) translateX(${60 + i * 20}px);
                `;
                ring.appendChild(particle);
            }
            
            orbitalLoader.appendChild(ring);
        }
        
        // Créer le point central
        const center = document.createElement('div');
        center.style.cssText = `
            width: 20px;
            height: 20px;
            background-color: #ffcc00;
            border-radius: 50%;
            box-shadow: 0 0 20px #ffcc00;
            animation: pulse 2s ease-in-out infinite;
        `;
        orbitalLoader.appendChild(center);

        // Ajouter le texte "Initialisation du système..."
        const loadingText = document.createElement('div');
        loadingText.className = 'orbital-loading-text';
        loadingText.style.cssText = `
            position: absolute;
            bottom: -60px;
            left: 50%;
            transform: translateX(-50%);
            color: #ffcc00;
            font-family: 'Roboto Mono', monospace;
            font-size: 14px;
            white-space: nowrap;
            letter-spacing: 1px;
        `;

        // Créer le texte avec les spans pour les points
        loadingText.innerHTML = `
            Initialisation du système<span class="loading-dots"><span>.</span><span>.</span><span>.</span></span>
        `;

        orbitalLoader.appendChild(loadingText);

        // Ajouter les éléments au DOM
        loaderContainer.appendChild(orbitalLoader);
        
        // Ajouter le style des animations
        const styleEl = document.createElement('style');
        styleEl.textContent = `
            @keyframes orbit0 {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            @keyframes orbit1 {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(-360deg); }
            }
            @keyframes orbit2 {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            @keyframes pulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.3); opacity: 0.7; }
            }

            /* Animation des points de chargement */
            .loading-dots span {
                opacity: 0;
                animation: dotFade 1.5s infinite;
            }
            .loading-dots span:nth-child(1) {
                animation-delay: 0s;
            }
            .loading-dots span:nth-child(2) {
                animation-delay: 0.5s;
            }
            .loading-dots span:nth-child(3) {
                animation-delay: 1s;
            }

            @keyframes dotFade {
                0%, 100% { opacity: 0; }
                50% { opacity: 1; }
            }
        `;
        document.head.appendChild(styleEl);

        // Ajouter au conteneur cible ou au conteneur d'effets par défaut
        const container = targetContainer || this.effectsContainer;
        container.appendChild(loaderContainer);

        // Animer l'entrée
        gsap.fromTo(loaderContainer,
            { opacity: 0 },
            {
                opacity: 1,
                duration: 0.5,
                onComplete: () => {
                    // Une fois que l'orbital est complètement visible,
                    // démarrer la transition du fond noir si on est dans un targetContainer
                    if (targetContainer && onComplete) {
                        onComplete();
                    }
                }
            }
        );

        // Définir un timer pour la sortie
        setTimeout(() => {
            // Si c'est dans un conteneur cible (écran de chargement),
            // l'orbital reste à 100% d'opacité puis disparaît instantanément
            if (targetContainer) {
                // Supprimer l'orbital instantanément (pas de fade)
                loaderContainer.remove();
                styleEl.remove();
            } else {
                // Comportement normal : tout disparaît ensemble
                gsap.to(loaderContainer, {
                    opacity: 0,
                    duration: 1,
                    onComplete: () => {
                        loaderContainer.remove();
                        styleEl.remove();
                        if (onComplete) onComplete();
                    }
                });
            }
        }, duration * 1000);
    }
    
    /**
     * Ajoute un effet de highlight pour mettre en évidence une sélection
     * @param {Object} position - Position à mettre en évidence (lat, lng)
     */
    highlightSelection(position) {
        // Créer un élément pour l'effet
        const highlight = document.createElement('div');
        highlight.classList.add('highlight-effect');
        highlight.style.position = 'absolute';
        highlight.style.width = '100px';
        highlight.style.height = '100px';
        highlight.style.borderRadius = '50%';
        highlight.style.border = '2px solid #ffcc00';
        highlight.style.boxShadow = '0 0 20px rgba(255, 204, 0, 0.5)';
        highlight.style.transform = 'translate(-50%, -50%)';
        highlight.style.pointerEvents = 'none';
        
        // Positionner l'effet (centré sur l'écran pour le moment)
        highlight.style.top = '50%';
        highlight.style.left = '50%';
        
        this.effectsContainer.appendChild(highlight);
        
        // Animer l'effet avec GSAP
        gsap.fromTo(highlight, 
            { 
                scale: 0.5, 
                opacity: 0 
            }, 
            { 
                scale: 1.5, 
                opacity: 0.8, 
                duration: 0.8, 
                ease: 'elastic.out(1, 0.3)',
                onComplete: () => {
                    // Animation de disparition
                    gsap.to(highlight, {
                        scale: 2,
                        opacity: 0,
                        duration: 0.5,
                        delay: 0.3,
                        onComplete: () => {
                            highlight.remove();
                        }
                    });
                }
            }
        );
    }
    
    /**
     * Crée un effet d'onde radar rayonnant depuis un point
     * @param {Object} position - Position de départ {x, y}
     * @param {Object} options - Options de l'effet
     */
    createRadarScanEffect(position, options = {}) {
        const defaults = {
            radius: 50,
            duration: 1,
            color: 'rgba(255, 204, 0, 0.4)',
            pulseCount: 1
        };
        
        const config = { ...defaults, ...options };
        
        for (let i = 0; i < config.pulseCount; i++) {
            setTimeout(() => {
                // Créer l'élément d'effet
                const radar = document.createElement('div');
                radar.style.cssText = `
                    position: absolute;
                    top: ${position.y}px;
                    left: ${position.x}px;
                    width: 10px;
                    height: 10px;
                    background-color: transparent;
                    border: 2px solid ${config.color};
                    border-radius: 50%;
                    transform: translate(-50%, -50%);
                    z-index: 100;
                    pointer-events: none;
                `;
                
                this.effectsContainer.appendChild(radar);
                
                // Animer l'expansion
                gsap.to(radar, {
                    width: config.radius * 2,
                    height: config.radius * 2,
                    opacity: 0,
                    duration: config.duration,
                    ease: "power2.out",
                    onComplete: () => {
                        radar.remove();
                    }
                });
            }, i * (config.duration * 300)); // Espacer les pulses
        }
    }
    
    /**
     * Effet de flash global
     * @param {string} color - Couleur du flash (par défaut, blanc)
     */
    flashScreen(color = '#ffffff') {
        // Créer un overlay pour le flash
        const flash = document.createElement('div');
        flash.style.position = 'absolute';
        flash.style.top = '0';
        flash.style.left = '0';
        flash.style.width = '100%';
        flash.style.height = '100%';
        flash.style.backgroundColor = color;
        flash.style.pointerEvents = 'none';
        flash.style.zIndex = '20';
        flash.style.opacity = '0';
        
        this.effectsContainer.appendChild(flash);
        
        // Animer le flash avec GSAP
        gsap.timeline()
            .to(flash, { opacity: 0.7, duration: 0.1 })
            .to(flash, { 
                opacity: 0, 
                duration: 0.3,
                onComplete: () => {
                    flash.remove();
                }
            });
    }
    
    /**
     * Affiche une notification en bas à droite
     * @param {string} message - Message à afficher
     * @param {string} type - Type de notification ('info', 'success', 'warning', 'error')
     * @param {number} duration - Durée d'affichage en millisecondes
     */
    showNotification(message, type = 'info', duration = 3000) {
        // S'assurer que le conteneur existe
        if (!this.notificationContainer) {
            this.createNotificationContainer();
        }
        
        // Créer l'élément de notification
        const notification = document.createElement('div');
        notification.className = 'notification';
        
        // Déterminer l'icône et la couleur en fonction du type
        let icon = '';
        let color = '#2196F3'; // Bleu pour info
        
        switch (type) {
            case 'success':
                icon = '✓';
                color = '#4CAF50'; // Vert
                break;
            case 'warning':
                icon = '!';
                color = '#FF9800'; // Orange
                break;
            case 'error':
                icon = '✗';
                color = '#F44336'; // Rouge
                break;
            default: // info
                icon = 'i';
                color = '#2196F3'; // Bleu
        }
        
        // Construire le contenu
        notification.innerHTML = `
            <div class="notification-icon" style="background-color: ${color};">${icon}</div>
            <div class="notification-message">${message}</div>
        `;
        
        // Appliquer les styles
        notification.style.cssText = `
            display: flex;
            align-items: center;
            gap: 12px;
            background-color: rgba(0, 10, 30, 0.85);
            color: #ffffff;
            padding: 12px 16px;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            font-family: 'Roboto Mono', monospace;
            font-size: 14px;
            max-width: 100%;
            pointer-events: all;
            transform: translateX(50px);
            opacity: 0;
            border-left: 3px solid ${color};
            backdrop-filter: blur(5px);
        `;
        
        // Styles pour les éléments internes
        const iconElement = notification.querySelector('.notification-icon');
        if (iconElement) {
            iconElement.style.cssText = `
                display: flex;
                align-items: center;
                justify-content: center;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                color: white;
                font-weight: bold;
                flex-shrink: 0;
            `;
        }
        
        const messageElement = notification.querySelector('.notification-message');
        if (messageElement) {
            messageElement.style.cssText = `
                flex: 1;
                line-height: 1.4;
            `;
        }
        
        // Ajouter au conteneur
        this.notificationContainer.appendChild(notification);
        
        // Animer l'entrée
        gsap.fromTo(notification, 
            { 
                opacity: 0, 
                x: 50
            }, 
            {
                opacity: 1,
                x: 0,
                duration: 0.4,
                ease: "power2.out"
            }
        );
        
        // Animer la sortie après la durée spécifiée
        setTimeout(() => {
            gsap.to(notification, {
                opacity: 0,
                x: 50,
                duration: 0.4,
                ease: "power2.in",
                onComplete: () => {
                    notification.remove();
                }
            });
        }, duration);
    }
    
    /**
     * Affiche un message système
     * @param {string} message - Message à afficher
     */
    showSystemMessage(message) {
        // Créer l'élément de message
        const messageElement = document.createElement('div');
        messageElement.className = 'system-message';
        messageElement.textContent = message;
        
        // Appliquer les styles
        messageElement.style.cssText = `
            position: absolute;
            bottom: 20px;
            right: 20px;
            background-color: rgba(0, 10, 30, 0.8);
            color: #ffffff;
            padding: 10px 15px;
            border-radius: 6px;
            border-left: 3px solid #ffcc00;
            font-family: 'Roboto Mono', monospace;
            font-size: 12px;
            max-width: 400px;
            text-align: left;
            transform: translateY(20px);
            opacity: 0;
            z-index: 100;
            pointer-events: none;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(3px);
        `;
        
        this.effectsContainer.appendChild(messageElement);
        
        // Animer l'entrée et la sortie
        gsap.timeline()
            .to(messageElement, {
                y: 0,
                opacity: 1,
                duration: 0.5,
                ease: "power2.out"
            })
            .to(messageElement, {
                y: -10,
                opacity: 0,
                duration: 0.5,
                delay: 3,
                ease: "power2.in",
                onComplete: () => {
                    messageElement.remove();
                }
            });
    }
    
    /**
     * Ajoute des particules en arrière-plan
     * @param {Object} options - Options pour les particules
     */
    addBackgroundParticles(options = {}) {
        const defaults = {
            count: 50,
            container: this.container
        };
        
        const config = { ...defaults, ...options };
        
        // Créer un conteneur pour les particules
        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'background-particles';
        particlesContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            z-index: 1;
            pointer-events: none;
        `;
        
        // Créer les particules
        for (let i = 0; i < config.count; i++) {
            const particle = document.createElement('div');
            
            // Propriétés aléatoires
            const size = Math.random() * 3 + 1;
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const delay = Math.random() * 5;
            const duration = Math.random() * 10 + 10;
            const opacity = Math.random() * 0.5 + 0.1;
            
            // Styler la particule
            particle.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background-color: rgba(255, 255, 255, ${opacity});
                border-radius: 50%;
                top: ${y}%;
                left: ${x}%;
                box-shadow: 0 0 ${size * 2}px rgba(255, 255, 255, ${opacity * 0.8});
            `;
            
            // Animer la particule
            gsap.to(particle, {
                y: `${Math.random() * 20 - 10}%`,
                x: `${Math.random() * 20 - 10}%`,
                opacity: Math.random() * 0.5 + 0.1,
                duration: duration,
                delay: delay,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
            
            particlesContainer.appendChild(particle);
        }
        
        config.container.appendChild(particlesContainer);
    }
}