// Utilitaires d'animation pour Mondes Immergés
// Ce module centralise les animations et transitions pour maintenir
// une cohérence visuelle dans l'ensemble de l'application
import { gsap } from 'gsap';

// Collection d'effets visuels réutilisables
export const AnimationEffects = {
    /**
     * Effet de transition en fondu
     * @param {HTMLElement} element - Élément à animer
     * @param {boolean} show - True pour afficher, false pour masquer
     * @param {Object} options - Options d'animation
     * @returns {Object} - Animation GSAP
     */
    fade: (element, show = true, options = {}) => {
        const defaults = {
            duration: 0.5,
            ease: "power2.inOut",
            onComplete: null,
            delay: 0
        };
        
        const config = { ...defaults, ...options };
        
        if (show) {
            // Configurer l'état initial
            gsap.set(element, { opacity: 0 });
            element.style.display = 'block';
            
            return gsap.to(element, {
                opacity: 1,
                duration: config.duration,
                ease: config.ease,
                delay: config.delay,
                onComplete: config.onComplete
            });
        } else {
            return gsap.to(element, {
                opacity: 0,
                duration: config.duration,
                ease: config.ease,
                delay: config.delay,
                onComplete: () => {
                    element.style.display = 'none';
                    if (config.onComplete) config.onComplete();
                }
            });
        }
    },
    
    /**
     * Effet de transition en glissement
     * @param {HTMLElement} element - Élément à animer
     * @param {boolean} show - True pour afficher, false pour masquer
     * @param {string} direction - Direction ('left', 'right', 'top', 'bottom')
     * @param {Object} options - Options d'animation
     * @returns {Object} - Animation GSAP
     */
    slide: (element, show = true, direction = 'right', options = {}) => {
        const defaults = {
            duration: 0.6,
            ease: "power2.out",
            distance: 100, // pixels
            onComplete: null,
            delay: 0
        };
        
        const config = { ...defaults, ...options };
        
        // Déterminer les propriétés à animer selon la direction
        let from = {};
        
        switch (direction) {
            case 'left':
                from = { x: -config.distance };
                break;
            case 'right':
                from = { x: config.distance };
                break;
            case 'top':
                from = { y: -config.distance };
                break;
            case 'bottom':
                from = { y: config.distance };
                break;
        }
        
        if (show) {
            // Configurer l'état initial
            gsap.set(element, { ...from, opacity: 0 });
            element.style.display = 'block';
            
            return gsap.to(element, {
                x: 0,
                y: 0,
                opacity: 1,
                duration: config.duration,
                ease: config.ease,
                delay: config.delay,
                onComplete: config.onComplete
            });
        } else {
            return gsap.to(element, {
                ...from,
                opacity: 0,
                duration: config.duration,
                ease: config.ease,
                delay: config.delay,
                onComplete: () => {
                    element.style.display = 'none';
                    if (config.onComplete) config.onComplete();
                }
            });
        }
    },
    
    /**
     * Effet d'échelle (zoom in/out)
     * @param {HTMLElement} element - Élément à animer
     * @param {boolean} show - True pour zoom in, false pour zoom out
     * @param {Object} options - Options d'animation
     * @returns {Object} - Animation GSAP
     */
    scale: (element, show = true, options = {}) => {
        const defaults = {
            duration: 0.5,
            ease: "back.out(1.7)",
            startScale: 0.5,
            endScale: 1,
            onComplete: null,
            delay: 0
        };
        
        const config = { ...defaults, ...options };
        
        if (show) {
            // Configurer l'état initial
            gsap.set(element, { scale: config.startScale, opacity: 0 });
            element.style.display = 'block';
            
            return gsap.to(element, {
                scale: config.endScale,
                opacity: 1,
                duration: config.duration,
                ease: config.ease,
                delay: config.delay,
                onComplete: config.onComplete
            });
        } else {
            return gsap.to(element, {
                scale: config.startScale,
                opacity: 0,
                duration: config.duration,
                ease: config.ease,
                delay: config.delay,
                onComplete: () => {
                    element.style.display = 'none';
                    if (config.onComplete) config.onComplete();
                }
            });
        }
    },
    
    /**
     * Effet de flash sur un élément
     * @param {HTMLElement} element - Élément à animer
     * @param {string} color - Couleur du flash
     * @param {Object} options - Options d'animation
     * @returns {Object} - Animation GSAP
     */
    flash: (element, color = '#ffcc00', options = {}) => {
        const defaults = {
            duration: 0.3,
            intensity: 0.5, // Intensité du flash (0-1)
            onComplete: null
        };
        
        const config = { ...defaults, ...options };
        
        // Sauvegarder le style initial
        const originalBoxShadow = element.style.boxShadow;
        const originalFilter = element.style.filter;
        
        // Créer la timeline d'animation
        const timeline = gsap.timeline({
            onComplete: () => {
                element.style.boxShadow = originalBoxShadow;
                element.style.filter = originalFilter;
                if (config.onComplete) config.onComplete();
            }
        });
        
        // Animation du flash
        timeline.to(element, {
            boxShadow: `0 0 30px ${color}`,
            filter: `brightness(${1 + config.intensity})`,
            duration: config.duration / 2
        }).to(element, {
            boxShadow: originalBoxShadow,
            filter: originalFilter,
            duration: config.duration / 2
        });
        
        return timeline;
    },
    
    /**
     * Effet de pulsation sur un élément
     * @param {HTMLElement} element - Élément à animer
     * @param {Object} options - Options d'animation
     * @returns {Object} - Animation GSAP
     */
    pulse: (element, options = {}) => {
        const defaults = {
            duration: 1.5,
            scale: 1.05,
            repeat: 3,
            ease: "sine.inOut"
        };
        
        const config = { ...defaults, ...options };
        
        // Sauvegarder l'échelle initiale
        const originalScale = gsap.getProperty(element, "scale") || 1;
        
        return gsap.to(element, {
            scale: originalScale * config.scale,
            duration: config.duration / 2,
            repeat: config.repeat * 2 - 1,
            yoyo: true,
            ease: config.ease,
            onComplete: () => {
                gsap.set(element, { scale: originalScale });
            }
        });
    },
    
    /**
     * Effet de rotation sur un élément
     * @param {HTMLElement} element - Élément à animer
     * @param {Object} options - Options d'animation
     * @returns {Object} - Animation GSAP
     */
    rotate: (element, options = {}) => {
        const defaults = {
            duration: 1,
            rotation: 360,
            ease: "power1.inOut",
            repeat: 0
        };
        
        const config = { ...defaults, ...options };
        
        return gsap.to(element, {
            rotation: config.rotation,
            duration: config.duration,
            ease: config.ease,
            repeat: config.repeat,
            onComplete: config.onComplete
        });
    },
    
    /**
     * Effet de typage progressif pour le texte
     * @param {HTMLElement} element - Élément contenant le texte à animer
     * @param {string} text - Texte à afficher progressivement
     * @param {Object} options - Options d'animation
     */
    typeText: (element, text, options = {}) => {
        const defaults = {
            speed: 30, // ms par caractère
            delay: 0,
            onComplete: null,
            cursor: true
        };
        
        const config = { ...defaults, ...options };
        
        // Effacer le contenu initial
        element.textContent = '';
        
        // Ajouter un curseur si demandé
        let cursor = null;
        if (config.cursor) {
            cursor = document.createElement('span');
            cursor.className = 'typing-cursor';
            cursor.textContent = '|';
            cursor.style.animation = 'cursorBlink 1s step-end infinite';
            
            // Ajouter le style d'animation si nécessaire
            if (!document.getElementById('cursor-blink-style')) {
                const style = document.createElement('style');
                style.id = 'cursor-blink-style';
                style.textContent = `
                    @keyframes cursorBlink {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0; }
                    }
                `;
                document.head.appendChild(style);
            }
            
            element.appendChild(cursor);
        }
        
        // Animation de typage
        let charIndex = 0;
        const typeNextChar = () => {
            if (charIndex < text.length) {
                // Ajouter le caractère
                if (cursor) {
                    element.insertBefore(
                        document.createTextNode(text.charAt(charIndex)), 
                        cursor
                    );
                } else {
                    element.textContent += text.charAt(charIndex);
                }
                
                charIndex++;
                
                // Programmer le prochain caractère
                setTimeout(typeNextChar, config.speed);
            } else {
                // Animation terminée
                if (config.onComplete) config.onComplete();
            }
        };
        
        // Démarrer l'animation après le délai spécifié
        setTimeout(typeNextChar, config.delay);
    }
};

// Collection de transitions entre écrans
export const ScreenTransitions = {
    /**
     * Transition entre deux écrans avec fondu
     * @param {HTMLElement} fromScreen - Écran de départ
     * @param {HTMLElement} toScreen - Écran d'arrivée
     * @param {Object} options - Options d'animation
     */
    fade: (fromScreen, toScreen, options = {}) => {
        const defaults = {
            duration: 0.8,
            overlap: 0.3, // Proportion de chevauchement entre les animations
            onComplete: null
        };
        
        const config = { ...defaults, ...options };
        
        // Calculer le délai pour l'écran d'arrivée
        const toDelay = config.duration * (1 - config.overlap);
        
        // Afficher l'écran d'arrivée avec opacity: 0
        gsap.set(toScreen, { opacity: 0, display: 'block' });
        
        // Créer la timeline
        const timeline = gsap.timeline({
            onComplete: config.onComplete
        });
        
        // Animer la sortie de l'écran de départ
        timeline.to(fromScreen, {
            opacity: 0,
            duration: config.duration,
            ease: "power2.inOut",
            onComplete: () => {
                fromScreen.style.display = 'none';
            }
        });
        
        // Animer l'entrée de l'écran d'arrivée
        timeline.to(toScreen, {
            opacity: 1,
            duration: config.duration,
            ease: "power2.inOut"
        }, `-=${config.duration * config.overlap}`);
        
        return timeline;
    },
    
    /**
     * Transition avec effet de flou entre écrans
     * @param {HTMLElement} fromScreen - Écran de départ
     * @param {HTMLElement} toScreen - Écran d'arrivée
     * @param {Object} options - Options d'animation
     */
    blur: (fromScreen, toScreen, options = {}) => {
        const defaults = {
            duration: 1.2,
            blurAmount: 20, // pixels
            onComplete: null
        };
        
        const config = { ...defaults, ...options };
        
        // Afficher l'écran d'arrivée sous l'écran de départ
        gsap.set(toScreen, { 
            opacity: 0, 
            filter: `blur(${config.blurAmount}px)`,
            display: 'block',
            zIndex: parseInt(window.getComputedStyle(fromScreen).zIndex) - 1
        });
        
        // Créer la timeline
        const timeline = gsap.timeline({
            onComplete: config.onComplete
        });
        
        // Flou et fade out sur l'écran de départ
        timeline.to(fromScreen, {
            opacity: 0,
            filter: `blur(${config.blurAmount}px)`,
            duration: config.duration / 2,
            ease: "power2.in",
            onComplete: () => {
                fromScreen.style.display = 'none';
                
                // Remettre l'écran d'arrivée au-dessus
                toScreen.style.zIndex = '';
            }
        });
        
        // Déflou et fade in sur l'écran d'arrivée
        timeline.to(toScreen, {
            opacity: 1,
            filter: 'blur(0px)',
            duration: config.duration / 2,
            ease: "power2.out"
        });
        
        return timeline;
    },
    
    /**
     * Transition avec effet de zoom entre écrans
     * @param {HTMLElement} fromScreen - Écran de départ
     * @param {HTMLElement} toScreen - Écran d'arrivée
     * @param {boolean} zoomIn - True pour zoom in, false pour zoom out
     * @param {Object} options - Options d'animation
     */
    zoom: (fromScreen, toScreen, zoomIn = true, options = {}) => {
        const defaults = {
            duration: 1,
            scale: zoomIn ? 1.2 : 0.8,
            onComplete: null
        };
        
        const config = { ...defaults, ...options };
        
        // Configurer l'état initial
        gsap.set(toScreen, {
            opacity: 0,
            scale: zoomIn ? 0.8 : 1.2,
            display: 'block'
        });
        
        // Créer la timeline
        const timeline = gsap.timeline({
            onComplete: config.onComplete
        });
        
        // Animer l'écran de départ
        timeline.to(fromScreen, {
            opacity: 0,
            scale: config.scale,
            duration: config.duration,
            ease: "power2.inOut",
            onComplete: () => {
                fromScreen.style.display = 'none';
                gsap.set(fromScreen, { scale: 1 }); // Réinitialiser l'échelle
            }
        });
        
        // Animer l'écran d'arrivée
        timeline.to(toScreen, {
            opacity: 1,
            scale: 1,
            duration: config.duration,
            ease: "power2.inOut"
        }, `-=${config.duration * 0.5}`);
        
        return timeline;
    },
    
    /**
     * Transition avec effet de glissement entre écrans
     * @param {HTMLElement} fromScreen - Écran de départ
     * @param {HTMLElement} toScreen - Écran d'arrivée
     * @param {string} direction - Direction du glissement ('left', 'right', 'up', 'down')
     * @param {Object} options - Options d'animation
     */
    slide: (fromScreen, toScreen, direction = 'left', options = {}) => {
        const defaults = {
            duration: 0.8,
            distance: '100%', // Distance de déplacement
            onComplete: null
        };
        
        const config = { ...defaults, ...options };
        
        // Déterminer les propriétés à animer selon la direction
        let fromProps = {};
        let toInitialProps = {};
        
        switch (direction) {
            case 'left':
                fromProps = { x: `-${config.distance}` };
                toInitialProps = { x: config.distance };
                break;
            case 'right':
                fromProps = { x: config.distance };
                toInitialProps = { x: `-${config.distance}` };
                break;
            case 'up':
                fromProps = { y: `-${config.distance}` };
                toInitialProps = { y: config.distance };
                break;
            case 'down':
                fromProps = { y: config.distance };
                toInitialProps = { y: `-${config.distance}` };
                break;
        }
        
        // Configurer l'état initial de l'écran d'arrivée
        gsap.set(toScreen, { 
            ...toInitialProps, 
            display: 'block',
            opacity: 1
        });
        
        // Créer la timeline
        const timeline = gsap.timeline({
            onComplete: config.onComplete
        });
        
        // Animer l'écran de départ
        timeline.to(fromScreen, {
            ...fromProps,
            duration: config.duration,
            ease: "power2.inOut",
            onComplete: () => {
                fromScreen.style.display = 'none';
                gsap.set(fromScreen, { x: 0, y: 0 }); // Réinitialiser la position
            }
        });
        
        // Animer l'écran d'arrivée
        timeline.to(toScreen, {
            x: 0,
            y: 0,
            duration: config.duration,
            ease: "power2.inOut"
        }, `-=${config.duration}`);
        
        return timeline;
    }
};

// Animations pour les éléments d'interface spécifiques
export const UIAnimations = {
    /**
     * Anime l'apparition d'un groupe de boutons en cascade
     * @param {Array} buttons - Tableau d'éléments de bouton
     * @param {Object} options - Options d'animation
     */
    buttonsCascade: (buttons, options = {}) => {
        const defaults = {
            duration: 0.5,
            stagger: 0.08,
            from: { y: 20, opacity: 0, scale: 0.9 },
            to: { y: 0, opacity: 1, scale: 1 },
            ease: "back.out(1.7)",
            onComplete: null
        };
        
        const config = { ...defaults, ...options };
        
        // Configurer l'état initial
        buttons.forEach(button => {
            gsap.set(button, config.from);
        });
        
        // Animer l'entrée des boutons
        return gsap.to(buttons, {
            ...config.to,
            duration: config.duration,
            stagger: config.stagger,
            ease: config.ease,
            onComplete: config.onComplete
        });
    },
    
    /**
     * Anime un bouton lors d'un clic
     * @param {HTMLElement} button - Élément de bouton
     * @param {Object} options - Options d'animation
     */
    buttonClick: (button, options = {}) => {
        const defaults = {
            duration: 0.4,
            scale: 0.9,
            ease: "back.out(2)"
        };
        
        const config = { ...defaults, ...options };
        
        return gsap.timeline()
            .to(button, {
                scale: config.scale,
                duration: config.duration / 3,
                ease: "power2.in"
            })
            .to(button, {
                scale: 1,
                duration: config.duration * 2/3,
                ease: config.ease
            });
    },
    
    /**
     * Anime un panneau de notification
     * @param {HTMLElement} panel - Élément du panneau
     * @param {boolean} show - True pour afficher, false pour masquer
     * @param {Object} options - Options d'animation
     */
    notification: (panel, show = true, options = {}) => {
        const defaults = {
            duration: 0.5,
            y: 30,
            ease: show ? "back.out(1.7)" : "power2.in",
            onComplete: null
        };
        
        const config = { ...defaults, ...options };
        
        if (show) {
            // Configurer l'état initial
            gsap.set(panel, { y: config.y, opacity: 0, display: 'block' });
            
            return gsap.to(panel, {
                y: 0,
                opacity: 1,
                duration: config.duration,
                ease: config.ease,
                onComplete: config.onComplete
            });
        } else {
            return gsap.to(panel, {
                y: config.y,
                opacity: 0,
                duration: config.duration,
                ease: config.ease,
                onComplete: () => {
                    panel.style.display = 'none';
                    if (config.onComplete) config.onComplete();
                }
            });
        }
    },
    
    /**
     * Anime une barre de progression
     * @param {HTMLElement} progressBar - Élément de la barre de progression
     * @param {number} value - Valeur (0-100)
     * @param {Object} options - Options d'animation
     */
    progressBar: (progressBar, value, options = {}) => {
        const defaults = {
            duration: 0.8,
            ease: "power1.inOut",
            onComplete: null
        };
        
        const config = { ...defaults, ...options };
        
        // Animer la largeur de la barre
        return gsap.to(progressBar, {
            width: `${value}%`,
            duration: config.duration,
            ease: config.ease,
            onComplete: config.onComplete
        });
    },
    
    /**
     * Crée un effet de progression circulaire
     * @param {HTMLElement} container - Conteneur pour l'effet
     * @param {number} value - Valeur (0-100)
     * @param {Object} options - Options d'animation
     */
    circularProgress: (container, value, options = {}) => {
        const defaults = {
            duration: 1,
            radius: 50,
            thickness: 8,
            color: '#ffcc00',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            onComplete: null
        };
        
        const config = { ...defaults, ...options };
        
        // Nettoyer le conteneur
        container.innerHTML = '';
        
        // Créer un SVG pour la progression circulaire
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', (config.radius * 2) + 'px');
        svg.setAttribute('height', (config.radius * 2) + 'px');
        svg.setAttribute('viewBox', `0 0 ${config.radius * 2} ${config.radius * 2}`);
        
        // Créer le cercle d'arrière-plan
        const bgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        bgCircle.setAttribute('cx', config.radius);
        bgCircle.setAttribute('cy', config.radius);
        bgCircle.setAttribute('r', config.radius - config.thickness / 2);
        bgCircle.setAttribute('fill', 'none');
        bgCircle.setAttribute('stroke', config.backgroundColor);
        bgCircle.setAttribute('stroke-width', config.thickness);
        svg.appendChild(bgCircle);
        
        // Créer le cercle de progression
        const progressCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        progressCircle.setAttribute('cx', config.radius);
        progressCircle.setAttribute('cy', config.radius);
        progressCircle.setAttribute('r', config.radius - config.thickness / 2);
        progressCircle.setAttribute('fill', 'none');
        progressCircle.setAttribute('stroke', config.color);
        progressCircle.setAttribute('stroke-width', config.thickness);
        progressCircle.setAttribute('stroke-dasharray', `${2 * Math.PI * (config.radius - config.thickness / 2)}`);
        progressCircle.setAttribute('stroke-dashoffset', `${2 * Math.PI * (config.radius - config.thickness / 2)}`);
        progressCircle.setAttribute('transform', `rotate(-90 ${config.radius} ${config.radius})`);
        svg.appendChild(progressCircle);
        
        // Ajouter le SVG au conteneur
        container.appendChild(svg);
        
        // Animer la progression
        const circumference = 2 * Math.PI * (config.radius - config.thickness / 2);
        const offset = circumference - (value / 100) * circumference;
        
        return gsap.fromTo(progressCircle, 
            { strokeDashoffset: circumference },
            {
                strokeDashoffset: offset,
                duration: config.duration,
                ease: "power2.out",
                onComplete: config.onComplete
            }
        );
    }
};

// Exporter les fonctions individuelles pour faciliter l'importation
export const fadeElement = AnimationEffects.fade;
export const slideElement = AnimationEffects.slide;
export const scaleElement = AnimationEffects.scale;
export const flashElement = AnimationEffects.flash;
export const pulseElement = AnimationEffects.pulse;
export const rotateElement = AnimationEffects.rotate;
export const typeText = AnimationEffects.typeText;

export const fadeScreens = ScreenTransitions.fade;
export const blurScreens = ScreenTransitions.blur;
export const zoomScreens = ScreenTransitions.zoom;
export const slideScreens = ScreenTransitions.slide;

export const animateButtonsCascade = UIAnimations.buttonsCascade;
export const animateButtonClick = UIAnimations.buttonClick;
export const animateNotification = UIAnimations.notification;
export const animateProgressBar = UIAnimations.progressBar;
export const createCircularProgress = UIAnimations.circularProgress;