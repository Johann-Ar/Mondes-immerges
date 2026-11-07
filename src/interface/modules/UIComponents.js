// Composants d'interface utilisateur pour Mondes Immergés
// Ce module fournit des composants réutilisables pour enrichir l'interface

import { gsap } from 'gsap';
import { 
    fadeElement, 
    slideElement, 
    animateButtonClick,
    typeText
} from './animations.js';

/**
 * Composant de chargement orbital
 * Affiche un effet de chargement avec des particules orbitant autour d'un centre
 */
export class OrbitalLoader {
    /**
     * Crée un chargeur orbital
     * @param {Object} options - Options de configuration
     */
    constructor(options = {}) {
        const defaults = {
            container: document.body,
            size: 200,            // Taille du loader en pixels
            particleCount: 5,     // Nombre de particules
            color: '#ffcc00',     // Couleur principale
            duration: 2,          // Durée de rotation en secondes
            textContent: 'CHARGEMENT',  // Texte à afficher
            autoRemove: false,    // Supprimer automatiquement après un délai
            removeDelay: 5000,    // Délai avant suppression automatique (ms)
            zIndex: 1000,         // Z-index du loader
            onComplete: null      // Callback après suppression
        };
        
        this.config = { ...defaults, ...options };
        this.element = null;
        this.animationIds = [];
        this.isActive = false;
        
        // Créer le loader
        this.create();
    }
    
    /**
     * Crée le DOM du loader
     */
    create() {
        // Créer le conteneur principal
        this.element = document.createElement('div');
        this.element.className = 'orbital-loader';
        this.element.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: ${this.config.size}px;
            height: ${this.config.size}px;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: ${this.config.zIndex};
            pointer-events: none;
        `;
        
        // Créer le conteneur d'anneaux
        const ringsContainer = document.createElement('div');
        ringsContainer.className = 'orbital-rings';
        ringsContainer.style.cssText = `
            position: absolute;
            width: 100%;
            height: 100%;
        `;
        
        // Créer les anneaux avec leurs particules
        for (let i = 0; i < 3; i++) {
            const ring = document.createElement('div');
            ring.className = 'orbital-ring';
            
            // Taille variable selon l'index
            const ringSize = this.config.size * (0.6 + i * 0.15);
            
            ring.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(${i * 30}deg);
                width: ${ringSize}px;
                height: ${ringSize}px;
                border-radius: 50%;
                border: 1px solid rgba(255, 204, 0, ${0.3 - i * 0.07});
            `;
            
            // Ajouter des particules à l'anneau
            const particleCount = Math.max(3, this.config.particleCount - i);
            for (let j = 0; j < particleCount; j++) {
                const angle = (360 / particleCount) * j;
                const particle = document.createElement('div');
                particle.className = 'orbital-particle';
                
                // Taille variable selon l'index
                const particleSize = 4 + (3 - i) * 2;
                
                particle.style.cssText = `
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: ${particleSize}px;
                    height: ${particleSize}px;
                    background-color: ${this.config.color};
                    border-radius: 50%;
                    transform: translate(-50%, -50%) rotate(${angle}deg) translateX(${ringSize / 2}px);
                    box-shadow: 0 0 10px ${this.config.color};
                `;
                
                ring.appendChild(particle);
                
                // Animer la particule
                this.animateParticle(particle, i);
            }
            
            ringsContainer.appendChild(ring);
            
            // Animer la rotation de l'anneau
            this.animateRing(ring, i);
        }
        
        // Créer le centre
        const center = document.createElement('div');
        center.className = 'orbital-center';
        center.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: ${this.config.size * 0.15}px;
            height: ${this.config.size * 0.15}px;
            background-color: ${this.config.color};
            border-radius: 50%;
            box-shadow: 0 0 15px ${this.config.color};
        `;
        
        // Animer le centre avec une pulsation
        this.animateCenter(center);
        
        // Ajouter le texte
        const text = document.createElement('div');
        text.className = 'orbital-text';
        text.style.cssText = `
            position: absolute;
            bottom: 15%;
            left: 50%;
            transform: translateX(-50%);
            color: ${this.config.color};
            font-family: 'Roboto Mono', monospace;
            font-size: 14px;
            letter-spacing: 2px;
            text-shadow: 0 0 5px rgba(255, 204, 0, 0.5);
        `;
        
        // Ajouter les éléments au DOM
        this.element.appendChild(ringsContainer);
        this.element.appendChild(center);
        this.element.appendChild(text);
        
        // Animer le texte avec effet de typewriter
        if (this.config.textContent) {
            typeText(text, this.config.textContent, {
                speed: 100,
                cursor: true
            });
        }
        
        // Ajouter au conteneur
        this.config.container.appendChild(this.element);
        this.isActive = true;
        
        // Supprimer automatiquement si configuré
        if (this.config.autoRemove) {
            setTimeout(() => {
                this.remove();
            }, this.config.removeDelay);
        }
    }
    
    /**
     * Anime un anneau
     * @param {HTMLElement} ring - Élément d'anneau
     * @param {number} index - Index de l'anneau
     */
    animateRing(ring, index) {
        // Direction et vitesse variables selon l'index
        const direction = index % 2 === 0 ? 1 : -1;
        const duration = this.config.duration * (1 + index * 0.2);
        
        const animate = () => {
            ring.style.transform = `translate(-50%, -50%) rotate(${direction * (Date.now() / (duration * 1000)) * 360}deg)`;
            this.animationIds.push(requestAnimationFrame(animate));
        };
        
        animate();
    }
    
    /**
     * Anime une particule
     * @param {HTMLElement} particle - Élément de particule
     * @param {number} ringIndex - Index de l'anneau parent
     */
    animateParticle(particle, ringIndex) {
        // Utiliser GSAP pour l'animation de pulsation
        gsap.to(particle, {
            boxShadow: `0 0 15px ${this.config.color}`,
            opacity: 0.8,
            duration: 0.8 + Math.random() * 0.4,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: Math.random() * 0.5
        });
    }
    
    /**
     * Anime le centre du loader
     * @param {HTMLElement} center - Élément central
     */
    animateCenter(center) {
        gsap.to(center, {
            boxShadow: `0 0 25px ${this.config.color}`,
            opacity: 0.9,
            scale: 1.2,
            duration: 1.2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
    }
    
    /**
     * Supprime le loader
     * @param {Function} callback - Fonction à appeler après la suppression
     */
    remove(callback) {
        if (!this.isActive) return;
        
        // Animer la disparition
        gsap.to(this.element, {
            opacity: 0,
            scale: 0.8,
            duration: 0.5,
            ease: "power2.in",
            onComplete: () => {
                // Nettoyer les animations
                this.animationIds.forEach(id => cancelAnimationFrame(id));
                this.animationIds = [];
                
                // Supprimer l'élément
                if (this.element && this.element.parentNode) {
                    this.element.parentNode.removeChild(this.element);
                }
                
                this.isActive = false;
                
                // Appeler les callbacks
                if (callback) callback();
                if (this.config.onComplete) this.config.onComplete();
            }
        });
    }
}

/**
 * Composant de notification
 * Affiche un message temporaire avec animation
 */
export class Notification {
    /**
     * Crée une notification
     * @param {string} message - Message à afficher
     * @param {Object} options - Options de configuration
     */
    constructor(message, options = {}) {
        const defaults = {
            container: document.body,
            type: 'info',          // 'info', 'success', 'warning', 'error'
            position: 'bottom-right', // 'top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'
            duration: 4000,        // Durée d'affichage en ms (0 pour persistant)
            closable: true,        // Affiche un bouton de fermeture
            animation: 'slide',    // 'fade', 'slide', 'scale'
            width: 'auto',         // Largeur de la notification
            zIndex: 1000,          // Z-index
            onClose: null          // Callback à la fermeture
        };
        
        this.config = { ...defaults, ...options };
        this.message = message;
        this.element = null;
        this.timeout = null;
        
        // Créer et afficher la notification
        this.create();
    }
    
    /**
     * Crée le DOM de la notification
     */
    create() {
        // Créer l'élément
        this.element = document.createElement('div');
        this.element.className = `notification notification-${this.config.type}`;
        
        // Déterminer la position
        const posStyles = this.getPositionStyles();
        
        // Configurer les styles
        this.element.style.cssText = `
            position: fixed;
            ${posStyles}
            min-width: 250px;
            max-width: ${this.config.width === 'auto' ? '400px' : this.config.width};
            background-color: rgba(0, 10, 30, 0.85);
            color: #ffffff;
            border-radius: 6px;
            padding: 12px 16px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: ${this.config.zIndex};
            backdrop-filter: blur(5px);
            font-family: 'Roboto Mono', monospace;
            font-size: 14px;
            display: flex;
            align-items: center;
            margin: 10px;
            opacity: 0;
            overflow: hidden;
            pointer-events: all;
        `;
        
        // Ajouter une bordure colorée selon le type
        const colors = {
            info: '#3498db',
            success: '#2ecc71',
            warning: '#f39c12',
            error: '#e74c3c'
        };
        
        const color = colors[this.config.type] || colors.info;
        this.element.style.borderLeft = `4px solid ${color}`;
        
        // Créer l'icône
        const iconElement = document.createElement('div');
        iconElement.className = 'notification-icon';
        iconElement.style.cssText = `
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background-color: ${color};
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            flex-shrink: 0;
            color: white;
            font-weight: bold;
        `;
        
        // Définir l'icône selon le type
        const icons = {
            info: 'i',
            success: '✓',
            warning: '!',
            error: '✗'
        };
        
        iconElement.textContent = icons[this.config.type] || icons.info;
        
        // Créer le contenu
        const contentElement = document.createElement('div');
        contentElement.className = 'notification-content';
        contentElement.style.cssText = `
            flex: 1;
            margin-right: ${this.config.closable ? '10px' : '0'};
            line-height: 1.4;
        `;
        contentElement.textContent = this.message;
        
        // Ajouter l'icône et le contenu
        this.element.appendChild(iconElement);
        this.element.appendChild(contentElement);
        
        // Ajouter le bouton de fermeture si nécessaire
        if (this.config.closable) {
            const closeButton = document.createElement('button');
            closeButton.className = 'notification-close';
            closeButton.style.cssText = `
                background: none;
                border: none;
                color: rgba(255, 255, 255, 0.7);
                font-size: 18px;
                cursor: pointer;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: color 0.2s ease;
            `;
            closeButton.textContent = '×';
            closeButton.addEventListener('mouseover', () => {
                closeButton.style.color = 'white';
            });
            closeButton.addEventListener('mouseout', () => {
                closeButton.style.color = 'rgba(255, 255, 255, 0.7)';
            });
            closeButton.addEventListener('click', () => {
                this.close();
            });
            
            this.element.appendChild(closeButton);
        }
        
        // Ajouter au conteneur
        this.config.container.appendChild(this.element);
        
        // Animer l'entrée
        this.animateIn();
        
        // Configurer la disparition automatique
        if (this.config.duration > 0) {
            this.timeout = setTimeout(() => {
                this.close();
            }, this.config.duration);
            
            // Pause du timer au survol
            this.element.addEventListener('mouseenter', () => {
                if (this.timeout) {
                    clearTimeout(this.timeout);
                    this.timeout = null;
                }
            });
            
            this.element.addEventListener('mouseleave', () => {
                if (!this.timeout) {
                    this.timeout = setTimeout(() => {
                        this.close();
                    }, this.config.duration / 2);
                }
            });
        }
    }
    
    /**
     * Détermine les styles de position
     * @returns {string} Styles CSS de position
     */
    getPositionStyles() {
        switch (this.config.position) {
            case 'top-left':
                return 'top: 20px; left: 20px;';
            case 'top-right':
                return 'top: 20px; right: 20px;';
            case 'bottom-left':
                return 'bottom: 20px; left: 20px;';
            case 'bottom-right':
                return 'bottom: 20px; right: 20px;';
            case 'center':
                return 'top: 50%; left: 50%; transform: translate(-50%, -50%);';
            default:
                return 'bottom: 20px; right: 20px;';
        }
    }
    
    /**
     * Anime l'entrée de la notification
     */
    animateIn() {
        // Animations selon le type
        switch (this.config.animation) {
            case 'fade':
                fadeElement(this.element, true, { duration: 0.4 });
                break;
            case 'scale':
                this.element.style.transformOrigin = 'right';
                gsap.fromTo(this.element, 
                    { scale: 0.7, opacity: 0 },
                    { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }
                );
                break;
            case 'slide':
            default:
                // Direction selon la position
                let direction = 'right';
                if (this.config.position.includes('left')) {
                    direction = 'left';
                } else if (this.config.position === 'center') {
                    direction = 'bottom';
                }
                
                slideElement(this.element, true, direction, { 
                    duration: 0.5,
                    distance: 50
                });
                break;
        }
    }
    
    /**
     * Ferme la notification
     */
    close() {
        if (!this.element) return;
        
        // Annuler le timer si existant
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
        
        // Animations selon le type
        switch (this.config.animation) {
            case 'fade':
                fadeElement(this.element, false, { 
                    duration: 0.3,
                    onComplete: this.destroy.bind(this)
                });
                break;
            case 'scale':
                gsap.to(this.element, {
                    scale: 0.7,
                    opacity: 0,
                    duration: 0.3,
                    ease: "power2.in",
                    onComplete: this.destroy.bind(this)
                });
                break;
            case 'slide':
            default:
                // Direction selon la position
                let direction = 'right';
                if (this.config.position.includes('left')) {
                    direction = 'left';
                } else if (this.config.position === 'center') {
                    direction = 'bottom';
                }
                
                slideElement(this.element, false, direction, { 
                    duration: 0.3,
                    distance: 50,
                    onComplete: this.destroy.bind(this)
                });
                break;
        }
    }
    
    /**
     * Détruit la notification
     */
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
            
            // Appeler le callback
            if (this.config.onClose) {
                this.config.onClose();
            }
        }
        
        this.element = null;
    }
    
    /**
     * Méthode statique pour créer une notification de type info
     * @param {string} message - Message
     * @param {Object} options - Options
     * @returns {Notification} Instance de notification
     */
    static info(message, options = {}) {
        return new Notification(message, { ...options, type: 'info' });
    }
    
    /**
     * Méthode statique pour créer une notification de type succès
     * @param {string} message - Message
     * @param {Object} options - Options
     * @returns {Notification} Instance de notification
     */
    static success(message, options = {}) {
        return new Notification(message, { ...options, type: 'success' });
    }
    
    /**
     * Méthode statique pour créer une notification de type avertissement
     * @param {string} message - Message
     * @param {Object} options - Options
     * @returns {Notification} Instance de notification
     */
    static warning(message, options = {}) {
        return new Notification(message, { ...options, type: 'warning' });
    }
    
    /**
     * Méthode statique pour créer une notification de type erreur
     * @param {string} message - Message
     * @param {Object} options - Options
     * @returns {Notification} Instance de notification
     */
    static error(message, options = {}) {
        return new Notification(message, { ...options, type: 'error' });
    }
}

/**
 * Composant de modal
 * Affiche une boîte de dialogue modale
 */
export class Modal {
    /**
     * Crée une modal
     * @param {Object} options - Options de configuration
     */
    constructor(options = {}) {
        const defaults = {
            title: '',                   // Titre de la modal
            content: '',                 // Contenu HTML ou texte
            container: document.body,    // Conteneur parent
            width: '500px',              // Largeur
            height: 'auto',              // Hauteur
            closable: true,              // Fermeture possible
            closeOnOverlay: true,        // Fermeture au clic sur l'overlay
            animation: 'scale',          // 'fade', 'slide', 'scale'
            buttons: [],                 // Boutons [{label, action, type}]
            onOpen: null,                // Callback à l'ouverture
            onClose: null,               // Callback à la fermeture
            customClass: '',             // Classe CSS personnalisée
            showCloseButton: true,       // Affiche le bouton X
            zIndex: 1050,                // Z-index
            overlay: true                // Affiche un overlay
        };
        
        this.config = { ...defaults, ...options };
        this.element = null;
        this.overlayElement = null;
        this.isOpen = false;
        
        // Créer la modal (mais ne pas l'afficher)
        this.create();
    }
    
    /**
     * Crée le DOM de la modal
     */
    create() {
        // Créer l'overlay si nécessaire
        if (this.config.overlay) {
            this.overlayElement = document.createElement('div');
            this.overlayElement.className = 'modal-overlay';
            this.overlayElement.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(3px);
                z-index: ${this.config.zIndex};
                display: none;
                opacity: 0;
            `;
            
            // Fermeture au clic si configurée
            if (this.config.closeOnOverlay) {
                this.overlayElement.addEventListener('click', (e) => {
                    if (e.target === this.overlayElement) {
                        this.close();
                    }
                });
            }
            
            this.config.container.appendChild(this.overlayElement);
        }
        
        // Créer la modal
        this.element = document.createElement('div');
        this.element.className = `modal ${this.config.customClass}`;
        this.element.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: ${this.config.width};
            max-width: 90vw;
            max-height: 90vh;
            background: linear-gradient(to bottom, rgba(0, 30, 60, 0.95), rgba(0, 10, 30, 0.95));
            color: #fff;
            border-radius: 8px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            z-index: ${this.config.zIndex + 1};
            display: none;
            opacity: 0;
            overflow: hidden;
            border: 1px solid rgba(255, 204, 0, 0.3);
        `;
        
        // Créer l'en-tête
        const header = document.createElement('div');
        header.className = 'modal-header';
        header.style.cssText = `
            padding: 16px 20px;
            border-bottom: 1px solid rgba(255, 204, 0, 0.3);
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: relative;
        `;
        
        // Ajouter une ligne verticale décorative
        const headerLine = document.createElement('div');
        headerLine.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 4px;
            height: 100%;
            background-color: #ffcc00;
        `;
        header.appendChild(headerLine);
        
        // Créer le titre
        const title = document.createElement('h3');
        title.className = 'modal-title';
        title.style.cssText = `
            margin: 0;
            font-size: 1.2rem;
            font-weight: 600;
            color: #ffcc00;
            font-family: 'Roboto Mono', monospace;
            letter-spacing: 1px;
        `;
        title.textContent = this.config.title;
        header.appendChild(title);
        
        // Ajouter le bouton de fermeture si nécessaire
        if (this.config.showCloseButton) {
            const closeButton = document.createElement('button');
            closeButton.className = 'modal-close';
            closeButton.style.cssText = `
                background: none;
                border: none;
                color: rgba(255, 255, 255, 0.7);
                font-size: 1.5rem;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                border-radius: 50%;
            `;
            closeButton.textContent = '×';
            closeButton.addEventListener('mouseover', () => {
                closeButton.style.color = 'white';
                closeButton.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            });
            closeButton.addEventListener('mouseout', () => {
                closeButton.style.color = 'rgba(255, 255, 255, 0.7)';
                closeButton.style.backgroundColor = 'transparent';
            });
            closeButton.addEventListener('click', () => {
                this.close();
            });
            
            header.appendChild(closeButton);
        }
        
        // Créer le corps
        const body = document.createElement('div');
        body.className = 'modal-body';
        body.style.cssText = `
            padding: 20px;
            overflow-y: auto;
            max-height: calc(80vh - 60px - ${this.config.buttons.length > 0 ? '60px' : '0px'});
            font-family: 'Merriweather Sans', 'Source Sans Pro', sans-serif;
            line-height: 1.6;
        `;
        
        // Insérer le contenu
        if (typeof this.config.content === 'string') {
            body.innerHTML = this.config.content;
        } else if (this.config.content instanceof HTMLElement) {
            body.appendChild(this.config.content);
        }
        
        // Créer le pied si des boutons sont définis
        let footer = null;
        if (this.config.buttons.length > 0) {
            footer = document.createElement('div');
            footer.className = 'modal-footer';
            footer.style.cssText = `
                padding: 16px 20px;
                border-top: 1px solid rgba(255, 204, 0, 0.3);
                display: flex;
                justify-content: flex-end;
                gap: 10px;
            `;
            
            // Ajouter les boutons
            this.config.buttons.forEach(btn => {
                const button = document.createElement('button');
                button.textContent = btn.label;
                button.className = `modal-button ${btn.type || 'default'}`;
                
                // Styles selon le type
                const baseStyle = `
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-family: 'Roboto Mono', monospace;
                    font-size: 14px;
                    transition: all 0.2s ease;
                    outline: none;
                `;
                
                switch (btn.type) {
                    case 'primary':
                        button.style.cssText = `
                            ${baseStyle}
                            background-color: #ffcc00;
                            color: #000;
                            border: none;
                        `;
                        break;
                    case 'danger':
                        button.style.cssText = `
                            ${baseStyle}
                            background-color: #e74c3c;
                            color: white;
                            border: none;
                        `;
                        break;
                    case 'text':
                        button.style.cssText = `
                            ${baseStyle}
                            background: none;
                            color: #ffcc00;
                            border: none;
                        `;
                        break;
                    default:
                        button.style.cssText = `
                            ${baseStyle}
                            background-color: transparent;
                            color: white;
                            border: 1px solid rgba(255, 255, 255, 0.3);
                        `;
                }
                
                // Ajouter les événements
                button.addEventListener('mouseover', () => {
                    if (btn.type === 'primary') {
                        button.style.backgroundColor = '#e6b800';
                    } else if (btn.type === 'danger') {
                        button.style.backgroundColor = '#c0392b';
                    } else if (btn.type === 'text') {
                        button.style.backgroundColor = 'rgba(255, 204, 0, 0.1)';
                    } else {
                        button.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                        button.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    }
                });
                
                button.addEventListener('mouseout', () => {
                    if (btn.type === 'primary') {
                        button.style.backgroundColor = '#ffcc00';
                    } else if (btn.type === 'danger') {
                        button.style.backgroundColor = '#e74c3c';
                    } else if (btn.type === 'text') {
                        button.style.backgroundColor = 'transparent';
                    } else {
                        button.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                        button.style.backgroundColor = 'transparent';
                    }
                });
                
                button.addEventListener('click', () => {
                    // Animer le clic
                    animateButtonClick(button);
                    
                    // Appeler l'action
                    if (btn.action) {
                        btn.action(this);
                    }
                    
                    // Fermer automatiquement si demandé
                    if (btn.closeOnClick !== false) {
                        this.close();
                    }
                });
                
                footer.appendChild(button);
            });
        }
        
        // Assembler la modal
        this.element.appendChild(header);
        this.element.appendChild(body);
        if (footer) {
            this.element.appendChild(footer);
        }
        
        // Ajouter la modal au conteneur
        this.config.container.appendChild(this.element);
        
        // Gérer la fermeture avec Échap
        if (this.config.closable) {
            const handleKeyDown = (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.close();
                }
            };
            
            document.addEventListener('keydown', handleKeyDown);
            
            // Stocker la référence pour le nettoyage
            this.handleKeyDown = handleKeyDown;
        }
    }
    
    /**
     * Ouvre la modal
     */
    open() {
        if (this.isOpen) return;
        
        // Afficher l'overlay
        if (this.overlayElement) {
            this.overlayElement.style.display = 'block';
            gsap.to(this.overlayElement, {
                opacity: 1,
                duration: 0.3
            });
        }
        
        // Afficher la modal avec l'animation configurée
        this.element.style.display = 'block';
        
        switch (this.config.animation) {
            case 'fade':
                gsap.fromTo(this.element, 
                    { opacity: 0 },
                    { opacity: 1, duration: 0.4, ease: "power2.out" }
                );
                break;
            case 'slide':
                gsap.fromTo(this.element,
                    { opacity: 0, y: -50 },
                    { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
                );
                break;
            case 'scale':
            default:
                gsap.fromTo(this.element,
                    { opacity: 0, scale: 0.7 },
                    { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" }
                );
                break;
        }
        
        this.isOpen = true;
        
        // Appeler le callback
        if (this.config.onOpen) {
            this.config.onOpen(this);
        }
    }
    
    /**
     * Ferme la modal
     */
    close() {
        if (!this.isOpen) return;
        
        // Animer la fermeture de l'overlay
        if (this.overlayElement) {
            gsap.to(this.overlayElement, {
                opacity: 0,
                duration: 0.3,
                onComplete: () => {
                    this.overlayElement.style.display = 'none';
                }
            });
        }
        
        // Animer la fermeture de la modal
        switch (this.config.animation) {
            case 'fade':
                gsap.to(this.element, {
                    opacity: 0,
                    duration: 0.3,
                    onComplete: this.handleCloseComplete.bind(this)
                });
                break;
            case 'slide':
                gsap.to(this.element, {
                    opacity: 0,
                    y: -50,
                    duration: 0.3,
                    ease: "power2.in",
                    onComplete: this.handleCloseComplete.bind(this)
                });
                break;
            case 'scale':
            default:
                gsap.to(this.element, {
                    opacity: 0,
                    scale: 0.7,
                    duration: 0.3,
                    ease: "power2.in",
                    onComplete: this.handleCloseComplete.bind(this)
                });
                break;
        }
        
        this.isOpen = false;
    }
    
    /**
     * Gère la fin de l'animation de fermeture
     */
    handleCloseComplete() {
        // Masquer la modal
        this.element.style.display = 'none';
        
        // Appeler le callback
        if (this.config.onClose) {
            this.config.onClose(this);
        }
    }
    
    /**
     * Détruit la modal
     */
    destroy() {
        // Supprimer l'écouteur d'événement
        if (this.handleKeyDown) {
            document.removeEventListener('keydown', this.handleKeyDown);
        }
        
        // Supprimer les éléments
        if (this.overlayElement && this.overlayElement.parentNode) {
            this.overlayElement.parentNode.removeChild(this.overlayElement);
        }
        
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        
        // Nettoyer les références
        this.element = null;
        this.overlayElement = null;
        this.isOpen = false;
    }
    
    /**
     * Met à jour le contenu de la modal
     * @param {string|HTMLElement} content - Nouveau contenu
     */
    updateContent(content) {
        const body = this.element.querySelector('.modal-body');
        
        if (body) {
            // Vider le contenu actuel
            body.innerHTML = '';
            
            // Insérer le nouveau contenu
            if (typeof content === 'string') {
                body.innerHTML = content;
            } else if (content instanceof HTMLElement) {
                body.appendChild(content);
            }
        }
    }
    
    /**
     * Met à jour le titre de la modal
     * @param {string} title - Nouveau titre
     */
    updateTitle(title) {
        const titleElement = this.element.querySelector('.modal-title');
        
        if (titleElement) {
            titleElement.textContent = title;
        }
    }
    
    /**
     * Méthode statique pour créer et ouvrir une modal de confirmation
     * @param {string} message - Message de confirmation
     * @param {Function} onConfirm - Fonction à appeler si confirmé
     * @param {Function} onCancel - Fonction à appeler si annulé
     * @param {Object} options - Options supplémentaires
     * @returns {Modal} Instance de modal
     */
    static confirm(message, onConfirm, onCancel, options = {}) {
        const modal = new Modal({
            title: options.title || 'Confirmation',
            content: `<p>${message}</p>`,
            buttons: [
                {
                    label: options.cancelText || 'Annuler',
                    action: () => {
                        if (onCancel) onCancel();
                    }
                },
                {
                    label: options.confirmText || 'Confirmer',
                    type: 'primary',
                    action: () => {
                        if (onConfirm) onConfirm();
                    }
                }
            ],
            ...options
        });
        
        modal.open();
        return modal;
    }
    
    /**
     * Méthode statique pour créer et ouvrir une modal d'alerte
     * @param {string} message - Message d'alerte
     * @param {Function} onClose - Fonction à appeler à la fermeture
     * @param {Object} options - Options supplémentaires
     * @returns {Modal} Instance de modal
     */
    static alert(message, onClose, options = {}) {
        const modal = new Modal({
            title: options.title || 'Alerte',
            content: `<p>${message}</p>`,
            buttons: [
                {
                    label: options.okText || 'OK',
                    type: 'primary',
                    action: () => {
                        if (onClose) onClose();
                    }
                }
            ],
            ...options
        });
        
        modal.open();
        return modal;
    }
}

/**
 * Gère une collection de notifications
 */
export class NotificationManager {
    constructor(options = {}) {
        const defaults = {
            container: document.body,
            position: 'bottom-right',
            maxNotifications: 5,
            spacing: 10
        };
        
        this.config = { ...defaults, ...options };
        this.notifications = [];
        this.container = null;
        
        this.init();
    }
    
    /**
     * Initialise le gestionnaire
     */
    init() {
        // Créer un conteneur pour les notifications
        this.container = document.createElement('div');
        this.container.className = 'notification-container';
        this.container.style.cssText = `
            position: fixed;
            z-index: 9999;
            pointer-events: none;
        `;
        
        // Positionner le conteneur
        switch (this.config.position) {
            case 'top-left':
                this.container.style.top = '20px';
                this.container.style.left = '20px';
                break;
            case 'top-right':
                this.container.style.top = '20px';
                this.container.style.right = '20px';
                break;
            case 'bottom-left':
                this.container.style.bottom = '20px';
                this.container.style.left = '20px';
                break;
            case 'bottom-right':
            default:
                this.container.style.bottom = '20px';
                this.container.style.right = '20px';
                break;
        }
        
        this.config.container.appendChild(this.container);
    }
    
    /**
     * Ajoute une notification
     * @param {string} message - Message
     * @param {string} type - Type ('info', 'success', 'warning', 'error')
     * @param {Object} options - Options
     * @returns {Notification} Instance de notification
     */
    add(message, type = 'info', options = {}) {
        // Limiter le nombre de notifications
        if (this.notifications.length >= this.config.maxNotifications) {
            // Supprimer la plus ancienne
            const oldest = this.notifications.shift();
            if (oldest) {
                oldest.close();
            }
        }
        
        // Créer la notification
        const notification = new Notification(message, {
            ...options,
            type,
            position: this.config.position,
            container: this.container,
            onClose: () => {
                // Supprimer de la liste
                this.notifications = this.notifications.filter(n => n !== notification);
                
                // Appeler le callback original
                if (options.onClose) {
                    options.onClose();
                }
            }
        });
        
        // Ajouter à la liste
        this.notifications.push(notification);
        
        return notification;
    }
    
    /**
     * Ferme toutes les notifications
     */
    closeAll() {
        this.notifications.forEach(notification => {
            notification.close();
        });
        
        this.notifications = [];
    }
    
    /**
     * Ajoute une notification de type info
     * @param {string} message - Message
     * @param {Object} options - Options
     * @returns {Notification} Instance de notification
     */
    info(message, options = {}) {
        return this.add(message, 'info', options);
    }
    
    /**
     * Ajoute une notification de type succès
     * @param {string} message - Message
     * @param {Object} options - Options
     * @returns {Notification} Instance de notification
     */
    success(message, options = {}) {
        return this.add(message, 'success', options);
    }
    
    /**
     * Ajoute une notification de type avertissement
     * @param {string} message - Message
     * @param {Object} options - Options
     * @returns {Notification} Instance de notification
     */
    warning(message, options = {}) {
        return this.add(message, 'warning', options);
    }
    
    /**
     * Ajoute une notification de type erreur
     * @param {string} message - Message
     * @param {Object} options - Options
     * @returns {Notification} Instance de notification
     */
    error(message, options = {}) {
        return this.add(message, 'error', options);
    }
}