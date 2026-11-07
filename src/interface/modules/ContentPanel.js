// Gestionnaire de panneau de contenu pour Mondes Immergés
import { gsap } from 'gsap';


export class ContentPanel {
    /**
     * Crée une instance du gestionnaire de panneau de contenu
     * @param {Object} options - Options de configuration
     * @param {HTMLElement} options.panel - Élément du panneau
     * @param {HTMLElement} options.closeBtn - Bouton de fermeture
     * @param {HTMLElement} options.titleElement - Élément pour le titre
     * @param {HTMLElement} options.descriptionElement - Élément pour la description
     * @param {HTMLElement} options.videoElement - Élément vidéo
     * @param {GlobeManager} options.globeManager - Instance du gestionnaire de globe
     */
    constructor(options) {
        this.panel = options.panel;
        this.closeBtn = options.closeBtn;
        this.titleElement = options.titleElement;
        this.descriptionElement = options.descriptionElement;
        this.videoElement = options.videoElement;
        this.globeManager = options.globeManager;
        this.isVisible = false;
        
        // Éléments pour le mode "informations complémentaires"
        this.drawerToggle = null;
        this.drawer = null;
        this.drawerContent = null;
        this.isDrawerOpen = false;
        
        // Vérifier si les éléments requis existent avant d'initialiser
        if (this.panel && this.closeBtn && this.titleElement && this.descriptionElement) {
            this.init();
        } else {
            // Créer des méthodes vides pour éviter les erreurs
            this.show = () => {};
            this.hide = () => {};
            this.update = () => {};
        }
    }
    
    /**
     * Initialise le panneau de contenu
     */
    init() {
        // Appliquer la grille de design optimisée au panneau principal
        this.applyDesignSystem();
        
        // Configurer le bouton de fermeture
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => {
                this.hide();
                this.globeManager.exitHotspotModeExternal();
            });
        }
        
        // Configurer l'événement de chargement de la vidéo si l'élément existe
        if (this.videoElement) {
            this.videoElement.addEventListener('loadeddata', () => {
                // Ajouter un effet de fade-in pour la vidéo
                gsap.fromTo(this.videoElement, 
                    { opacity: 0 },
                    { opacity: 1, duration: 0.8, ease: "power2.out" }
                );
            });
            
            // Gérer les erreurs de vidéo
            this.videoElement.addEventListener('error', () => {
                this.videoElement.style.display = 'none';
            });
        }
        
        // Créer le bouton de tiroir et le tiroir d'informations complémentaires
        this.createDrawerElements();
    }
    
    /**
     * Applique le système de design au panneau
     * Suit une grille en 12 colonnes et respecte une hiérarchie typographique
     */
    applyDesignSystem() {
        // Vérifier que tous les éléments existent avant d'appliquer les styles
        if (!this.panel) {
            return;
        }
        
        // Appliquer des styles cohérents au panneau principal
        this.panel.style.cssText = `
            position: absolute;
            top: 5%;
            right: 5%;
            width: 380px;
            max-width: 33.33%; /* Règle du tiers */
            max-height: 90%;
            background-color: rgba(0, 0, 0, 0.85);
            border: 1px solid rgba(255, 204, 0, 0.7);
            border-radius: 5px;
            overflow: hidden;
            transition: transform 0.5s cubic-bezier(0.19, 1, 0.22, 1), opacity 0.5s cubic-bezier(0.19, 1, 0.22, 1);
            transform: translateX(100%);
            z-index: 10;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 15px rgba(255, 204, 0, 0.2);
        `;
        
        // Appliquer des styles à l'en-tête du panneau
        const header = this.panel.querySelector('.panel-header');
        if (header) {
            header.style.cssText = `
                padding: 16px 20px;
                background: linear-gradient(to bottom, rgba(0, 30, 60, 0.9), rgba(0, 15, 30, 0.9));
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid rgba(255, 204, 0, 0.5);
                position: relative;
            `;
            
            // Ajouter l'effet de ligne verticale
            const headerLine = document.createElement('div');
            headerLine.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 4px;
                height: 100%;
                background-color: #ffcc00;
            `;
            header.insertBefore(headerLine, header.firstChild);
        }
        
        // Ajuster les styles du titre pour la hiérarchie typographique
        if (this.titleElement) {
            this.titleElement.style.cssText = `
                margin: 0;
                font-size: 1.2rem;
                font-weight: 600;
                color: #ffcc00;
                letter-spacing: 1px;
                font-family: 'Roboto Mono', monospace;
                text-transform: uppercase;
                line-height: 1.3;
            `;
        }
        
        // Améliorer les styles du bouton de fermeture
        if (this.closeBtn) {
            this.closeBtn.style.cssText = `
                background: none;
                border: none;
                color: #ffffff;
                font-size: 1.5rem;
                cursor: pointer;
                opacity: 0.7;
                transition: all 0.3s ease;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
            `;
            
            // Ajouter l'effet hover
            this.closeBtn.addEventListener('mouseenter', () => {
                this.closeBtn.style.opacity = '1';
                this.closeBtn.style.color = '#ffcc00';
                this.closeBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            });
            
            this.closeBtn.addEventListener('mouseleave', () => {
                this.closeBtn.style.opacity = '0.7';
                this.closeBtn.style.color = '#ffffff';
                this.closeBtn.style.backgroundColor = 'transparent';
            });
        }
        
        // Améliorer le conteneur de contenu avec scrollbar stylisée
        const content = this.panel.querySelector('.panel-content');
        if (content) {
            content.style.cssText = `
                padding: 20px;
                max-height: calc(90vh - 60px);
                overflow-y: auto;
                scrollbar-width: thin;
                scrollbar-color: rgba(255, 204, 0, 0.7) rgba(0, 0, 0, 0.3);
            `;
            
            // Ajouter des styles pour les scrollbars personnalisées
            const style = document.createElement('style');
            style.textContent = `
                .panel-content::-webkit-scrollbar {
                    width: 6px;
                }
                
                .panel-content::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 3px;
                }
                
                .panel-content::-webkit-scrollbar-thumb {
                    background-color: rgba(255, 204, 0, 0.7);
                    border-radius: 3px;
                }
                
                .panel-content::-webkit-scrollbar-thumb:hover {
                    background-color: rgba(255, 204, 0, 0.9);
                }
            `;
            document.head.appendChild(style);
        }
        
        // Améliorer le conteneur vidéo avec ombre portée et bordure
        const videoContainer = this.panel.querySelector('#video-container');
        if (videoContainer) {
            videoContainer.style.cssText = `
                width: 100%;
                margin-bottom: 24px;
                border: 1px solid rgba(255, 204, 0, 0.3);
                position: relative;
                overflow: hidden;
                border-radius: 4px;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            `;
        }
        
        // Améliorer l'aspect du lecteur vidéo
        if (this.videoElement) {
            this.videoElement.style.cssText = `
                width: 100%;
                border-radius: 3px;
                display: block;
                background-color: #000;
            `;
            
            // Ajouter des contrôles personnalisés
            this.videoElement.controls = true;
        }
        
        // Améliorer la zone de description avec une typographie et des marges optimisées
        if (this.descriptionElement) {
            this.descriptionElement.style.cssText = `
                font-size: 0.95rem;
                line-height: 1.6;
                color: #e0e0e0;
                font-family: 'Merriweather Sans', 'Source Sans Pro', sans-serif;
            `;
            
            // Changer les styles des paragraphes dans la description
            const descStyle = document.createElement('style');
            descStyle.textContent = `
                #hotspot-description p {
                    margin-bottom: 16px;
                    text-align: justify;
                }
                
                #hotspot-description p:last-child {
                    margin-bottom: 0;
                }
                
                #hotspot-description .coordinates {
                    background: linear-gradient(to right, rgba(0, 40, 80, 0.5), rgba(0, 20, 40, 0.5));
                    padding: 10px 15px;
                    border-radius: 4px;
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-left: 3px solid #ffcc00;
                    font-family: 'Roboto Mono', monospace;
                }
                
                #hotspot-description .coordinates-label {
                    font-weight: bold;
                    color: #ffcc00;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                    font-size: 0.85rem;
                }
                
                #hotspot-description .coordinates-value {
                    font-family: 'Roboto Mono', monospace;
                    letter-spacing: 1px;
                }
            `;
            document.head.appendChild(descStyle);
        }
    }
    
    /**
     * Crée les éléments de l'interface du tiroir
     */
    createDrawerElements() {
        // Ne créer les éléments que si le panneau principal existe
        if (!this.panel) {
            return;
        }
        
        // Créer le bouton de toggle du tiroir
        this.drawerToggle = document.createElement('div');
        this.drawerToggle.className = 'drawer-toggle';
        this.drawerToggle.innerHTML = '<span class="arrow up"></span>';
        this.drawerToggle.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 44px;
            height: 28px;
            background-color: rgba(0, 0, 0, 0.7);
            border-top-left-radius: 5px;
            border-top-right-radius: 5px;
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
            box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.2);
            border-top: 1px solid rgba(255, 204, 0, 0.5);
            border-left: 1px solid rgba(255, 204, 0, 0.5);
            border-right: 1px solid rgba(255, 204, 0, 0.5);
            z-index: 101;
        `;
        
        // Style pour la flèche améliorée
        const style = document.createElement('style');
        style.textContent = `
            .arrow {
                width: 12px;
                height: 12px;
                border-style: solid;
                border-color: #ffcc00;
                border-width: 0 2px 2px 0;
                display: inline-block;
                transition: transform 0.3s cubic-bezier(0.19, 1, 0.22, 1);
            }
            
            .up {
                transform: rotate(-135deg) translateY(-2px);
            }
            
            .down {
                transform: rotate(45deg) translateY(-2px);
            }
            
            .drawer-toggle:hover .arrow {
                border-color: #ffffff;
            }
        `;
        document.head.appendChild(style);
        
        // Ajouter le bouton de toggle au panneau
        this.panel.appendChild(this.drawerToggle);
        
        // Créer le tiroir d'informations complémentaires
        this.drawer = document.createElement('div');
        this.drawer.className = 'info-drawer';
        this.drawer.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 70%;
            background: linear-gradient(to bottom, rgba(0, 40, 80, 0.97) 0%, rgba(0, 10, 30, 0.97) 100%);
            transform: translateY(100%);
            transition: transform 0.5s cubic-bezier(0.19, 1, 0.22, 1);
            z-index: 100;
            box-shadow: 0 -5px 15px rgba(0, 0, 0, 0.3);
            overflow-y: auto;
            padding: 20px;
            box-sizing: border-box;
            color: white;
            display: none;
            border-top: 1px solid rgba(255, 204, 0, 0.7);
            backdrop-filter: blur(10px);
            scrollbar-width: thin;
            scrollbar-color: rgba(255, 204, 0, 0.7) rgba(0, 0, 0, 0.3);
        `;
        
        // Contenu du tiroir dans une grille responsive
        this.drawerContent = document.createElement('div');
        this.drawerContent.className = 'drawer-content';
        this.drawerContent.style.cssText = `
            max-width: 1200px;
            margin: 0 auto;
            padding: 30px;
            display: grid;
            grid-template-columns: repeat(12, 1fr);
            grid-gap: 24px;
        `;
        this.drawer.appendChild(this.drawerContent);
        
        // Ajouter le tiroir au document
        document.body.appendChild(this.drawer);
        
        // Configurer l'événement du bouton toggle
        this.drawerToggle.addEventListener('click', () => {
            this.toggleDrawer();
        });
    }
    
    /**
     * Bascule l'état du tiroir (ouvert/fermé)
     */
    toggleDrawer() {
        if (this.isDrawerOpen) {
            this.closeDrawer();
        } else {
            this.openDrawer();
        }
    }
    
    /**
     * Ouvre le tiroir d'informations complémentaires
     */
    openDrawer() {
        if (this.isDrawerOpen || !this.drawer) return;
        
        this.isDrawerOpen = true;
        this.drawer.style.display = 'block';
        
        // Animation d'ouverture avec ressort
        gsap.to(this.drawer, {
            y: 0,
            duration: 0.7,
            ease: "back.out(1.2)"
        });
        
        // Changer la direction de la flèche
        const arrow = this.drawerToggle.querySelector('.arrow');
        if (arrow) {
            arrow.classList.remove('up');
            arrow.classList.add('down');
        }
        
        // Déplacer le toggle en haut du tiroir
        if (this.drawerToggle) {
            gsap.to(this.drawerToggle, {
                bottom: 'auto',
                top: -28,
                duration: 0.5
            });
        }
        
        // Réduire légèrement le panneau principal
        if (this.panel) {
            gsap.to(this.panel, {
                scale: 0.95,
                opacity: 0.85,
                duration: 0.5,
                ease: "power2.out"
            });
        }
    }
    
    /**
     * Ferme le tiroir d'informations complémentaires
     */
    closeDrawer() {
        if (!this.isDrawerOpen || !this.drawer) return;
        
        this.isDrawerOpen = false;
        
        // Animation de fermeture
        gsap.to(this.drawer, {
            y: '100%',
            duration: 0.5,
            ease: "power3.in",
            onComplete: () => {
                this.drawer.style.display = 'none';
            }
        });
        
        // Changer la direction de la flèche
        const arrow = this.drawerToggle.querySelector('.arrow');
        if (arrow) {
            arrow.classList.remove('down');
            arrow.classList.add('up');
        }
        
        // Replacer le toggle en bas du panneau
        if (this.drawerToggle) {
            gsap.to(this.drawerToggle, {
                top: 'auto',
                bottom: 0,
                duration: 0.5
            });
        }
        
        // Restaurer le panneau principal
        if (this.panel) {
            gsap.to(this.panel, {
                scale: 1,
                opacity: 1,
                duration: 0.5,
                ease: "power2.out"
            });
        }
    }
    
    /**
     * Met à jour le contenu du panneau avec une disposition améliorée
     * @param {Object} content - Contenu à afficher
     * @param {string} content.title - Titre
     * @param {string} content.description - Description
     * @param {string} content.videoSrc - Source de la vidéo
     * @param {Object} content.coordinates - Coordonnées GPS
     * @param {string} content.detailedInfo - Informations détaillées pour le tiroir
     * @param {Array} content.links - Liens externes pour le tiroir
     */
    update(content) {
        // Ne pas procéder si les éléments n'existent pas
        if (!this.titleElement || !this.descriptionElement) {
            return;
        }
        
        // Mettre à jour le titre
        this.titleElement.textContent = content.title || 'Information';
        
        // Préparer la description avec les coordonnées GPS si disponibles
        let descriptionHTML = content.description || '';
        
        if (content.coordinates) {
            descriptionHTML = `
                <div class="coordinates">
                    <span class="coordinates-label">GPS:</span>
                    <span class="coordinates-value">${content.coordinates.lat.toFixed(4)}° N, ${content.coordinates.lng.toFixed(4)}° E</span>
                </div>
                ${descriptionHTML}
            `;
        }
        
        // Mettre à jour la description
        this.descriptionElement.innerHTML = descriptionHTML;
        
        // Mettre à jour la vidéo
        if (this.videoElement && content.videoSrc) {
            this.videoElement.style.display = 'block';
            if (this.videoElement.querySelector('source')) {
                this.videoElement.querySelector('source').src = content.videoSrc;
            } else {
                const source = document.createElement('source');
                source.src = content.videoSrc;
                source.type = 'video/mp4';
                this.videoElement.appendChild(source);
            }
            
            // Recharger la vidéo
            this.videoElement.load();
        } else if (this.videoElement) {
            this.videoElement.style.display = 'none';
        }
        
        // Mettre à jour le contenu du tiroir si des informations détaillées sont fournies
        if ((content.detailedInfo || content.links) && this.drawerContent) {
            // Créer le contenu HTML pour le tiroir avec mise en page en grille
            let drawerHTML = '';
            
            // Titre principal
            drawerHTML += `<h3>INFORMATIONS COMPLÉMENTAIRES</h3>`;
            
            // Ajouter les informations détaillées
            if (content.detailedInfo) {
                drawerHTML += `
                    <div class="detailed-info">
                        ${content.detailedInfo}
                    </div>
                `;
            }
            
            // Ajouter les liens externes
            if (content.links && content.links.length > 0) {
                drawerHTML += `
                    <div class="external-links">
                        <h4>RESSOURCES SCIENTIFIQUES</h4>
                        <ul>
                `;
                
                content.links.forEach(link => {
                    drawerHTML += `<li><a href="${link.url}" target="_blank">${link.title}</a></li>`;
                });
                
                drawerHTML += `
                        </ul>
                    </div>
                `;
            }
            
            // Mettre à jour le contenu du tiroir
            this.drawerContent.innerHTML = drawerHTML;
            
            // Afficher le bouton de toggle
            if (this.drawerToggle) {
                this.drawerToggle.style.display = 'flex';
            }
        } else if (this.drawerToggle) {
            // Masquer le bouton de toggle si pas d'informations détaillées
            this.drawerToggle.style.display = 'none';
        }
    }
    
    /**
     * Affiche le panneau avec une animation améliorée
     */
    show() {
        if (this.isVisible || !this.panel) return;
        
        this.isVisible = true;
        this.panel.classList.remove('hidden');
        this.panel.classList.add('visible');
        
        // S'assurer que le tiroir est fermé
        this.closeDrawer();
        
        // Animation d'entrée avec ressort
        gsap.fromTo(this.panel,
            { 
                x: '100%',
                opacity: 0,
                scale: 0.95
            },
            {
                x: '0%',
                opacity: 1,
                scale: 1,
                duration: 0.7,
                ease: "back.out(1.2)"
            }
        );
        
        // Ajouter un effet de flou sur le reste de l'interface pour mettre en valeur le panneau
        const mainContainer = document.getElementById('main-container');
        if (mainContainer) {
            gsap.to(mainContainer.querySelectorAll(':not(#content-panel)'), {
                filter: 'blur(2px)',
                opacity: 0.8,
                duration: 0.5,
                ease: "power2.out"
            });
        }
    }
    
    /**
     * Masque le panneau avec une animation améliorée
     */
    hide() {
        if (!this.isVisible || !this.panel) return;
        
        this.isVisible = false;
        
        // Fermer le tiroir s'il est ouvert
        if (this.isDrawerOpen) {
            this.closeDrawer();
        }
        
        // Animation de sortie
        gsap.to(this.panel, {
            x: '100%',
            opacity: 0,
            scale: 0.95,
            duration: 0.5,
            ease: "power3.in",
            onComplete: () => {
                this.panel.classList.remove('visible');
                this.panel.classList.add('hidden');
                
                // Arrêter la vidéo si elle est en cours de lecture
                if (this.videoElement) {
                    this.videoElement.pause();
                }
            }
        });
        
        // Restaurer l'effet de flou sur le reste de l'interface
        const mainContainer = document.getElementById('main-container');
        if (mainContainer) {
            gsap.to(mainContainer.querySelectorAll(':not(#content-panel)'), {
                filter: 'blur(0px)',
                opacity: 1,
                duration: 0.5,
                ease: "power2.out"
            });
        }
    }
}