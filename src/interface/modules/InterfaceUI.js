// Gestionnaire d'interface utilisateur pour Mondes Immergés
import { gsap } from 'gsap';

export class InterfaceUI {
    /**
     * Crée une instance de l'interface utilisateur
     * @param {Object} options - Options de configuration
     * @param {HTMLElement} options.zoomInBtn - Bouton de zoom avant
     * @param {HTMLElement} options.zoomOutBtn - Bouton de zoom arrière
     * @param {HTMLElement} options.resetViewBtn - Bouton de réinitialisation de la vue
     * @param {HTMLElement} options.infoBtn - Bouton d'informations
     * @param {HTMLElement} options.closeInfoBtn - Bouton de fermeture des informations
     * @param {HTMLElement} options.infoOverlay - Overlay d'informations
     * @param {Object} options.globeManager - Instance du GlobeManager
     */
    constructor(options) {
        this.options = options;
        this.zoomInBtn = options.zoomInBtn;
        this.zoomOutBtn = options.zoomOutBtn;
        this.resetViewBtn = options.resetViewBtn;
        this.infoBtn = options.infoBtn;
        this.closeInfoBtn = options.closeInfoBtn;
        this.infoOverlay = options.infoOverlay;
        this.globeManager = options.globeManager;

        this.isInfoVisible = false;
        this.buttons = [];
        this.notificationContainer = null;

        this.init();
    }

    /**
     * Initialise l'interface utilisateur avec des styles améliorés
     */
    init() {
        // Améliorer l'apparence des boutons
        this.applyEnhancedStyles();

        // Collecter tous les boutons pour les animations
        this.buttons = [this.zoomInBtn, this.zoomOutBtn, this.resetViewBtn, this.infoBtn];

        // Configurer les écouteurs d'événements pour les boutons
        this.zoomInBtn.addEventListener('click', () => {
            // Appeler la fonction de zoom avant dans GlobeManager
            this.globeManager.zoom(true);
            this.animateButtonClick(this.zoomInBtn);
        });

        this.zoomOutBtn.addEventListener('click', () => {
            // Appeler la fonction de zoom arrière dans GlobeManager
            this.globeManager.zoom(false);
            this.animateButtonClick(this.zoomOutBtn);
        });

        this.resetViewBtn.addEventListener('click', () => {
            // Appeler la fonction de réinitialisation de la vue dans GlobeManager
            this.globeManager.resetView();
            this.animateButtonClick(this.resetViewBtn);
        });

        this.infoBtn.addEventListener('click', () => {
            this.toggleInfoOverlay();
            this.animateButtonClick(this.infoBtn);
        });

        this.closeInfoBtn.addEventListener('click', () => {
            this.hideInfoOverlay();
        });

        // Créer un conteneur pour les notifications en bas à droite
        this.createNotificationContainer();

        // Animation d'entrée des boutons
        this.animateButtonsIn();
    }

    /**
     * Applique des styles améliorés aux éléments de l'interface
     */
    applyEnhancedStyles() {
        // Améliorer le conteneur des contrôles d'interface
        const uiControls = document.getElementById('ui-controls');
        if (uiControls) {
            uiControls.style.cssText = `
                position: absolute;
                bottom: 30px;
                left: 30px;
                z-index: 50;
                transition: opacity 0.3s ease, transform 0.3s ease;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 15px;
            `;
        }

        // Améliorer les contrôles de navigation
        const navControls = document.getElementById('navigation-controls');
        if (navControls) {
            navControls.style.cssText = `
				display: flex;
				flex-direction: column;
				gap: 20px; /* espace plus large entre les boutons */
				background: none;
				padding: 0;
				border: none;
				box-shadow: none;
`;
        }

        // Améliorer l'apparence des boutons de navigation
        const navButtons = navControls ? navControls.querySelectorAll('button') : [];
        navButtons.forEach((button) => {
            button.style.cssText = `
                width: 70px;
                height: 70px;
                border: 2px solid rgba(255, 204, 0, 0.7);              
                border-radius: 50%;
                cursor: pointer;
                transition: all 0.3s ease;
                font-family: 'Roboto Mono', monospace;
                letter-spacing: 1px;
                font-size: 23px;
                font-weight: bold;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0), 0 0 4px rgba(255, 204, 0, 0.4);
            `;

            // Ajouter des effets hover
            button.addEventListener('mouseenter', () => {
                gsap.to(button, {
                    backgroundColor: 'rgba(255, 204, 0, 0.9)',
                    color: '#000000',
                    borderColor: '#ffcc00',
                    boxShadow: '0 2px 15px rgba(255, 204, 0, 0.5), 0 0 8px rgba(255, 204, 0, 0.7)',
                    duration: 0.25,
                });
            });

            button.addEventListener('mouseleave', () => {
                gsap.to(button, {
                    backgroundColor: 'rgba(0, 10, 30, 0.7)',
                    color: '#ffcc00',
                    borderColor: 'rgba(255, 204, 0, 0.7)',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3), 0 0 4px rgba(255, 204, 0, 0.4)',
                    duration: 0.3,
                });
            });
        });

        // Améliorer le bouton d'information
        if (this.infoBtn) {
            this.infoBtn.style.cssText = `
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background-color: rgba(0, 10, 30, 0.7);
                color: #ffcc00;
                border: 2px solid rgba(255, 204, 0, 0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                cursor: pointer;
                transition: all 0.3s ease;
                font-family: 'Roboto Mono', monospace;
                font-size: 18px;
                font-weight: bold;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3), 0 0 4px rgba(255, 204, 0, 0.4);
            `;

            // Ajouter des effets hover
            this.infoBtn.addEventListener('mouseenter', () => {
                gsap.to(this.infoBtn, {
                    backgroundColor: 'rgba(255, 204, 0, 0.9)',
                    color: '#000000',
                    borderColor: '#ffcc00',
                    boxShadow: '0 2px 15px rgba(255, 204, 0, 0.5), 0 0 8px rgba(255, 204, 0, 0.7)',
                    duration: 0.3,
                });
            });

            this.infoBtn.addEventListener('mouseleave', () => {
                gsap.to(this.infoBtn, {
                    backgroundColor: 'rgba(0, 10, 30, 0.7)',
                    color: '#ffcc00',
                    borderColor: 'rgba(255, 204, 0, 0.7)',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3), 0 0 4px rgba(255, 204, 0, 0.4)',
                    duration: 0.3,
                });
            });
        }

        // Améliorer l'overlay d'informations
        if (this.infoOverlay) {
            this.infoOverlay.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.85);
                backdrop-filter: blur(10px);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 200;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.5s ease;
            `;

            // Améliorer le contenu de l'overlay
            const overlayContent = this.infoOverlay.querySelector('.overlay-content');
            if (overlayContent) {
                overlayContent.style.cssText = `
                    background: linear-gradient(to bottom, rgba(0, 40, 94, 0.9), rgba(0, 20, 47, 0.9));
                    padding: 40px;
                    border-radius: 10px;
                    max-width: 700px;
                    text-align: center;
                    position: relative;
                    border: 1px solid var(--nat-geo-yellow);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 15px rgba(255, 204, 0, 0.3);
                `;

                // Améliorer le titre
                const title = overlayContent.querySelector('h3');
                if (title) {
                    title.style.cssText = `
                        font-size: 2rem;
                        margin-bottom: 30px;
                        color: #ffcc00;
                        letter-spacing: 2px;
                        text-transform: uppercase;
                        font-family: 'Roboto Mono', monospace;
                        font-weight: 700;
                        text-shadow: 0 0 10px rgba(255, 204, 0, 0.5);
                    `;
                }

                // Améliorer les paragraphes
                const paragraphs = overlayContent.querySelectorAll('p');
                paragraphs.forEach((p) => {
                    p.style.cssText = `
                        margin-bottom: 25px;
                        line-height: 1.8;
                        color: #e0e0e0;
                        font-size: 1.1rem;
                        font-family: 'Merriweather Sans', 'Source Sans Pro', sans-serif;
                        text-align: justify;
                    `;
                });

                // Améliorer le bouton de fermeture
                if (this.closeInfoBtn) {
                    this.closeInfoBtn.style.cssText = `
                        padding: 12px 32px;
                        background-color: transparent;
                        color: #ffcc00;
                        border: 2px solid #ffcc00;
                        border-radius: 30px;
                        cursor: pointer;
                        font-weight: 600;
                        transition: all 0.3s ease;
                        font-family: 'Roboto Mono', monospace;
                        letter-spacing: 1px;
                        position: relative;
                        overflow: hidden;
                        z-index: 1;
                        font-size: 16px;
                    `;

                    // Ajouter un effet de hover
                    const closeInfoStyle = document.createElement('style');
                    closeInfoStyle.textContent = `
                        #close-info::before {
                            content: "";
                            position: absolute;
                            left: -100%;
                            top: 0;
                            width: 100%;
                            height: 100%;
                            background-color: #ffcc00;
                            transition: all 0.3s ease;
                            z-index: -1;
                        }
                        
                        #close-info:hover {
                            color: #000000;
                            box-shadow: 0 0 15px rgba(255, 204, 0, 0.5);
                        }
                        
                        #close-info:hover::before {
                            left: 0;
                        }
                    `;
                    document.head.appendChild(closeInfoStyle);
                }
            }
        }
    }

    /**
     * Crée un conteneur pour les notifications en bas à droite
     */
    createNotificationContainer() {
        this.notificationContainer = document.createElement('div');
        this.notificationContainer.className = 'notifications-container';
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

        document.getElementById('main-container').appendChild(this.notificationContainer);
    }

    /**
     * Anime l'entrée des boutons de l'interface avec effet cascade
     */
    animateButtonsIn() {
        // Configurer les états initiaux
        this.buttons.forEach((button) => {
            gsap.set(button, {
                opacity: 0,
                y: 20,
                scale: 0.8,
            });
        });

        // Animer l'entrée des boutons avec un délai entre chacun et un effet de ressort
        this.buttons.forEach((button, index) => {
            gsap.to(button, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.7,
                delay: 1.5 + index * 0.15, // Délai croissant pour chaque bouton
                ease: 'back.out(1.7)',
            });
        });
    }

    /**
     * Anime un clic sur un bouton avec effet de rebond
     * @param {HTMLElement} button - Élément bouton
     */
    animateButtonClick(button) {
        gsap.timeline()
            .to(button, {
                scale: 0.85,
                duration: 0.15,
                ease: 'power2.in',
            })
            .to(button, {
                scale: 1,
                duration: 0.4,
                ease: 'elastic.out(1.2, 0.5)', // Effet de rebond élastique
            });
    }

    /**
     * Affiche ou masque l'overlay d'informations
     */
    toggleInfoOverlay() {
        if (this.isInfoVisible) {
            this.hideInfoOverlay();
        } else {
            this.showInfoOverlay();
        }
    }

    /**
     * Affiche l'overlay d'informations avec une animation améliorée
     */
    showInfoOverlay() {
        if (this.isInfoVisible) return;

        this.isInfoVisible = true;
        this.infoOverlay.classList.add('visible');

        // Rendre l'overlay visible
        gsap.to(this.infoOverlay, {
            opacity: 1,
            duration: 0.4,
            ease: 'power2.out',
            onStart: () => {
                this.infoOverlay.style.pointerEvents = 'all';
            },
        });

        // Animer l'entrée du contenu
        const content = this.infoOverlay.querySelector('.overlay-content');

        gsap.fromTo(
            content,
            {
                opacity: 0,
                y: 30,
                scale: 0.95,
            },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.6,
                delay: 0.1,
                ease: 'back.out(1.7)', // Effet de ressort élégant
            },
        );

        // Animer les éléments internes pour une apparition en cascade
        const elements = content.querySelectorAll('h3, p, button');
        elements.forEach((el, index) => {
            gsap.fromTo(
                el,
                {
                    opacity: 0,
                    y: 20,
                },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    delay: 0.3 + index * 0.1,
                    ease: 'power2.out',
                },
            );
        });
    }

    /**
     * Masque l'overlay d'informations avec une animation améliorée
     */
    hideInfoOverlay() {
        if (!this.isInfoVisible) return;

        this.isInfoVisible = false;
        const content = this.infoOverlay.querySelector('.overlay-content');

        // Animer la sortie du contenu
        gsap.to(content, {
            opacity: 0,
            y: 30,
            scale: 0.95,
            duration: 0.4,
            ease: 'power3.in',
        });

        // Animer la sortie de l'overlay
        gsap.to(this.infoOverlay, {
            opacity: 0,
            duration: 0.5,
            delay: 0.2,
            ease: 'power2.in',
            onComplete: () => {
                this.infoOverlay.classList.remove('visible');
                this.infoOverlay.style.pointerEvents = 'none';
            },
        });
    }

    /**
     * Affiche une notification améliorée dans le conteneur dédié
     * @param {string} message - Message à afficher
     * @param {string} type - Type de notification ('info', 'success', 'warning', 'error')
     * @param {number} duration - Durée d'affichage en millisecondes
     */
    showNotification(message, type = 'info', duration = 3000) {
        // Créer l'élément de notification
        const notification = document.createElement('div');
        notification.classList.add('notification', `notification-${type}`);

        // Déterminer l'icône en fonction du type
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
        const iconStyle = `
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

        notification.querySelector('.notification-icon').style.cssText = iconStyle;
        notification.querySelector('.notification-message').style.cssText = `
            flex: 1;
            line-height: 1.4;
        `;

        // Ajouter au conteneur
        this.notificationContainer.appendChild(notification);

        // Animer l'entrée
        gsap.fromTo(
            notification,
            {
                opacity: 0,
                x: 50,
            },
            {
                opacity: 1,
                x: 0,
                duration: 0.4,
                ease: 'power2.out',
            },
        );

        // Animer la sortie après la durée spécifiée
        setTimeout(() => {
            gsap.to(notification, {
                opacity: 0,
                x: 50,
                duration: 0.4,
                ease: 'power2.in',
                onComplete: () => {
                    notification.remove();
                },
            });
        }, duration);
    }

    /**
     * Masque ou affiche tous les éléments de l'interface avec animation fluide
     * @param {boolean} visible - True pour afficher, False pour masquer
     */
    setUIVisibility(visible) {
        // Préparer les animations
        const opacity = visible ? 1 : 0;
        const y = visible ? 0 : 20;
        const pointerEvents = visible ? 'auto' : 'none';

        // Récupérer le conteneur d'interface
        const uiControls = document.getElementById('ui-controls');

        if (uiControls) {
            // Animer avec GSAP pour une transition fluide
            gsap.to(uiControls, {
                opacity: opacity,
                y: y,
                duration: 0.4,
                ease: visible ? 'power2.out' : 'power2.in',
                onComplete: () => {
                    uiControls.style.pointerEvents = pointerEvents;
                },
            });
        }

        // Animer aussi les autres éléments d'interface si nécessaire
        const otherElements = document.querySelectorAll('.satellite-hud, .coordinates-display');
        otherElements.forEach((element) => {
            gsap.to(element, {
                opacity: opacity,
                duration: 0.4,
                ease: visible ? 'power2.out' : 'power2.in',
            });
        });
    }

    /**
     * Affiche une infobulle contextuelle à côté d'un élément
     * @param {HTMLElement} element - Élément cible
     * @param {string} text - Texte à afficher
     * @param {Object} options - Options de configuration
     */
    showTooltip(element, text, options = {}) {
        const defaults = {
            position: 'top', // 'top', 'bottom', 'left', 'right'
            duration: 3000, // Durée d'affichage en ms
            offset: 10, // Distance de l'élément
            className: '', // Classes CSS additionnelles
        };

        const config = { ...defaults, ...options };

        // Créer l'élément de l'infobulle
        const tooltip = document.createElement('div');
        tooltip.className = `tooltip ${config.className}`;
        tooltip.textContent = text;

        // Appliquer les styles de base
        tooltip.style.cssText = `
            position: absolute;
            background-color: rgba(0, 10, 30, 0.9);
            color: #ffffff;
            padding: 8px 12px;
            border-radius: 4px;
            font-family: 'Roboto Mono', monospace;
            font-size: 12px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
            pointer-events: none;
            z-index: 1000;
            white-space: nowrap;
            opacity: 0;
            transform: scale(0.9);
            border: 1px solid rgba(255, 204, 0, 0.5);
        `;

        // Ajouter au DOM
        document.body.appendChild(tooltip);

        // Positionner l'infobulle
        const elementRect = element.getBoundingClientRect();

        switch (config.position) {
            case 'top':
                tooltip.style.bottom = `${window.innerHeight - elementRect.top + config.offset}px`;
                tooltip.style.left = `${elementRect.left + elementRect.width / 2}px`;
                tooltip.style.transform = 'translateX(-50%) scale(0.9)';
                break;
            case 'bottom':
                tooltip.style.top = `${elementRect.bottom + config.offset}px`;
                tooltip.style.left = `${elementRect.left + elementRect.width / 2}px`;
                tooltip.style.transform = 'translateX(-50%) scale(0.9)';
                break;
            case 'left':
                tooltip.style.top = `${elementRect.top + elementRect.height / 2}px`;
                tooltip.style.right = `${window.innerWidth - elementRect.left + config.offset}px`;
                tooltip.style.transform = 'translateY(-50%) scale(0.9)';
                break;
            case 'right':
                tooltip.style.top = `${elementRect.top + elementRect.height / 2}px`;
                tooltip.style.left = `${elementRect.right + config.offset}px`;
                tooltip.style.transform = 'translateY(-50%) scale(0.9)';
                break;
        }

        // Animer l'affichage
        gsap.to(tooltip, {
            opacity: 1,
            scale: 1,
            duration: 0.3,
            ease: 'back.out(1.7)',
        });

        // Masquer après la durée spécifiée
        setTimeout(() => {
            gsap.to(tooltip, {
                opacity: 0,
                scale: 0.9,
                duration: 0.2,
                ease: 'power2.in',
                onComplete: () => {
                    tooltip.remove();
                },
            });
        }, config.duration);

        // Renvoyer une fonction pour masquer manuellement
        return {
            hide: () => {
                gsap.to(tooltip, {
                    opacity: 0,
                    scale: 0.9,
                    duration: 0.2,
                    ease: 'power2.in',
                    onComplete: () => {
                        tooltip.remove();
                    },
                });
            },
        };
    }
}
