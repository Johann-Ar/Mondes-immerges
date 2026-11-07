// Gestionnaire de globe pour Mondes Immergés - VERSION CORRIGÉE
import * as THREE from 'three';
import { gsap } from 'gsap';
// Import corrigé pour la redirection
import { getRedirectUrl } from '../data/redirect-config.js';
// Import du VideoManager professionnel
import { videoManager } from '../utils/VideoManager.js';

// === DEBUG LOGGING ===
function glog(tag, ...args) {
    if (import.meta.env.DEV) console.log(`[GLOBE:${tag}]`, performance.now().toFixed(0) + 'ms', ...args);
}
function gwarn(tag, ...args) {
    console.warn(`[GLOBE:${tag}]`, performance.now().toFixed(0) + 'ms', ...args);
}
function gerr(tag, ...args) {
    console.error(`[GLOBE:${tag}]`, performance.now().toFixed(0) + 'ms', ...args);
}

export class GlobeManager {
    constructor(options) {
        glog('INIT', 'Construction GlobeManager, container:', options.containerId);
        this.options = options;
        this.container = document.getElementById(options.containerId);
        if (!this.container) gerr('INIT', 'Container introuvable:', options.containerId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.globe = null;
        this.videoElement = null;
        this.videoTexture = null;
        this.hotspotObjects = [];
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.clock = new THREE.Clock();
        this.labelsVisible = false; // Flag pour contrôler l'apparition des labels

        // Paramètres pour l'orbite ellipsoïdale - ZOOM AUGMENTÉ
        this.orbitParams = {
            isOrbiting: true,
            baseSpeed: 0.0004,
            currentSpeed: 0.0004,
            maxSpeed: 0.002,
            accelerationFactor: 1.3,
            decelerationFactor: 0.9,
            ellipseMajorAxis: 9.5,  // Réduit de 12 à 9.5 pour zoom de base plus proche
            ellipseMinorAxis: 6.5,  // Réduit de 8 à 6.5 pour zoom de base plus proche
            inclination: Math.PI / 6,
            orbitAngle: Math.random() * Math.PI * 2,  // Position aléatoire sur l'orbite au chargement
            zoomLevel: 1,
            maxZoomLevel: 2.0,      // Permet de dézoomer largement
            minZoomLevel: 0.8,      // Limite le zoom à x0.8 (pas plus proche)
            inHotspotMode: false,
            orbitHistory: []
        };
        
        this.celestialParams = {
            sunPosition: new THREE.Vector3(100, 20, 100),
            moonPosition: new THREE.Vector3(-70, 30, -50)
        };

        this._savedState = null;

        // Chemins des vidéos du globe
        // Vidéo du globe (2048×1024) : WebM VP9, ou MP4 H.264 si le navigateur ne lit pas le VP9 (Safari ancien)
        const probe = document.createElement('video');
        const ext = probe.canPlayType('video/webm; codecs="vp9"') ? 'webm' : 'mp4';
        this.currentVideoPath = `${import.meta.env.BASE_URL}videos/globe.${ext}`;

        this.init();
    }
    
    init() {
        // Créer la scène
        this.scene = new THREE.Scene();
        
        // Ajouter une lumière ambiante blanche
        const ambient = new THREE.AmbientLight(0xffffff, 1.2);
        this.scene.add(ambient);
        
        // Ajouter une lumière directionnelle douce
        const directional = new THREE.DirectionalLight(0xffffff, 0.5);
        directional.position.set(5, 10, 7);
        this.scene.add(directional);
        
        this.scene.fog = new THREE.FogExp2(0x000000, 0.00015);
        
        // Créer la caméra
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        
        this.updateCameraPosition();
        
        // Créer le renderer avec vérifications WebGL - OPTIMISÉ POUR MOBILE
        try {
            // Détection mobile pour optimisations
            const isMobile = window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            const isLowEnd = isMobile || (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4);

            this.renderer = new THREE.WebGLRenderer({
                antialias: !isMobile, // Désactiver antialiasing sur mobile (coûteux)
                alpha: true,
                logarithmicDepthBuffer: !isLowEnd, // Désactiver sur appareils bas de gamme
                powerPreference: 'default', // "high-performance" force le GPU dédié et provoque des pertes de contexte sur certains Mac
                precision: isMobile ? 'mediump' : 'highp' // Précision réduite sur mobile
            });
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 1.5)); // 1x sur mobile, 1.5x max sur desktop (VRAM)
            // Shadows désactivées - pas nécessaires pour le globe et consomment de la VRAM
            this.renderer.shadowMap.enabled = false;

            // Stocker le flag mobile pour utilisation ultérieure
            this.isMobile = isMobile;
            
            this.container.appendChild(this.renderer.domElement);

            // Gérer la perte et restauration du contexte WebGL
            const canvas = this.renderer.domElement;
            canvas.addEventListener('webglcontextlost', (event) => {
                event.preventDefault();
                this._contextLost = true;
                // Arrêter le VideoManager pour éviter la boucle infinie de relances
                videoManager.onContextLost();
            });
            canvas.addEventListener('webglcontextrestored', () => {
                this._contextLost = false;
                videoManager.onContextRestored();
            });
        } catch (error) {
            this.handleWebGLError();
            return;
        }

        // L'arrière-plan étoilé sera créé via preloadAllAssets()
        this.skyboxLoaded = false;

        // Créer l'éclairage
        this.setupLighting();

        // NOTE: Le globe et la skybox seront créés via preloadAllAssets()
        // Ne pas les créer ici pour éviter les duplications


        // Créer la trajectoire de la caméra
        this.createOrbitPath();
        
        // Ajouter les écouteurs d'événements
        window.addEventListener('resize', this.onWindowResize.bind(this));
        this.container.addEventListener('click', this.onMouseClick.bind(this));
    }
    
    // Méthode pour gérer les erreurs WebGL
    handleWebGLError() {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: rgba(0, 0, 0, 0.9);
            color: #ffdd00;
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            font-family: 'Roboto Mono', monospace;
            z-index: 10000;
            border: 2px solid #ffdd00;
            max-width: 500px;
        `;
        
        errorDiv.innerHTML = `
            <h2>Erreur d'initialisation 3D</h2>
            <p>Impossible d'initialiser le rendu WebGL.</p>
            <p>Veuillez vérifier que votre navigateur supporte WebGL.</p>
            <button onclick="location.reload()" style="background: #ffdd00; color: #000; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-family: inherit; margin-top: 10px;">
                Réessayer
            </button>
        `;
        
        this.container.appendChild(errorDiv);
    }

    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0x404050, 0.5);
        this.scene.add(ambientLight);
        
        const sunLight = new THREE.DirectionalLight(0xffffff, 1);
        sunLight.position.copy(this.celestialParams.sunPosition);
        sunLight.castShadow = false;
        
        this.scene.add(sunLight);
        this.sunLight = sunLight;
        
        const hemisphereLight = new THREE.HemisphereLight(0x0088ff, 0x00ff88, 0.6);
        this.scene.add(hemisphereLight);
    }
    
    
    createOrbitPath() {
        const points = [];
        const segments = 100;
        
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const a = this.orbitParams.ellipseMajorAxis;
            const b = this.orbitParams.ellipseMinorAxis;
            const inclination = this.orbitParams.inclination;
            
            let x = a * Math.cos(angle);
            let z = b * Math.sin(angle);
            
            const y = z * Math.sin(inclination);
            z = z * Math.cos(inclination);
            
            points.push(new THREE.Vector3(x, y, z));
        }
        
        const pathGeometry = new THREE.BufferGeometry().setFromPoints(points);
        
        const markerGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        const markerMaterial = new THREE.MeshBasicMaterial({
            color: 0xffcc00,
            transparent: true,
            opacity: 0.9
        });
        
        this.cameraMarker = new THREE.Mesh(markerGeometry, markerMaterial);
        this.scene.add(this.cameraMarker);
    }
    
    createGlobe() {
        glog('GLOBE', 'Création du globe...');
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            // Utiliser la vidéo par défaut au démarrage
            glog('GLOBE', 'Chemin vidéo:', this.currentVideoPath);
            video.src = this.currentVideoPath;
            video.loop = true;
            video.muted = true;
            video.autoplay = false; // Désactiver autoplay pour contrôler le préchargement
            video.playsInline = true;
            video.crossOrigin = 'anonymous';
            video.preload = 'auto'; // Forcer le préchargement complet
            this.videoElement = video;

            let resolved = false;

            // Timeout de sécurité: si pas chargé en 10 secondes, continuer quand même
            const timeout = setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    resolve();
                }
            }, 10000);

            // Résoudre la promesse quand la vidéo est prête à être jouée
            video.addEventListener('canplaythrough', () => {
                if (!resolved) {
                    resolved = true;
                    clearTimeout(timeout);
                    resolve();
                }
            }, { once: true });

            // Alternative: résoudre dès que suffisamment de données sont chargées
            video.addEventListener('canplay', () => {
                if (!resolved) {
                    resolved = true;
                    clearTimeout(timeout);
                    resolve();
                }
            }, { once: true });

            video.addEventListener('error', (e) => {
                if (!resolved) {
                    resolved = true;
                    clearTimeout(timeout);
                    resolve(); // Résoudre au lieu de rejeter pour ne pas bloquer
                }
            });

            // Enregistrer la vidéo avec le VideoManager professionnel
            videoManager.register(video, {
                loop: true,
                muted: true,
                autoRetry: true,
                name: 'globe-texture',
                onError: (e) => {
                    /* Production: error silenced */
                },
                onPlay: () => {
                    /* Production: play event silenced */
                }
            });

            this.videoTexture = new THREE.VideoTexture(video);
            this.videoTexture.minFilter = THREE.LinearFilter;
            this.videoTexture.magFilter = THREE.LinearFilter;
            this.videoTexture.generateMipmaps = false;
            this.videoTexture.colorSpace = THREE.SRGBColorSpace;

            const depthGeometry = new THREE.SphereGeometry(1.99, 64, 64);
            const depthMaterial = new THREE.MeshBasicMaterial({
                color: 0x000000,
                transparent: true,
                opacity: 0.0,
                colorWrite: false,
                depthWrite: true,
                side: THREE.FrontSide
            });

            const depthSphere = new THREE.Mesh(depthGeometry, depthMaterial);
            depthSphere.renderOrder = 0;
            this.scene.add(depthSphere);
            this.depthSphere = depthSphere;

            const globeGeometry = new THREE.SphereGeometry(2, 64, 64);

            const globeMaterial = new THREE.MeshBasicMaterial({
                map: this.videoTexture,
                transparent: true,
                opacity: 1,
                side: THREE.FrontSide,
                depthTest: true,
                depthWrite: false,
                color: 0xffffff,
                toneMapped: false
            });

            this.globe = new THREE.Mesh(globeGeometry, globeMaterial);
            this.globe.castShadow = true;
            this.globe.receiveShadow = true;
            this.globe.renderOrder = 1;
            this.scene.add(this.globe);

            // Atmosphère désactivée à la demande de l'utilisateur
            // this.createAtmosphere();

            const cloudsGeometry = new THREE.SphereGeometry(2.02, 64, 64);
            const cloudsMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.4,
                alphaTest: 0.1,
                depthTest: true,
                depthWrite: false
            });

            this.clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
            this.clouds.renderOrder = 2;
            this.scene.add(this.clouds);

            // Charger la vidéo - la promesse se résoudra quand canplaythrough se déclenchera
            video.load();
        });
    }
    
    // ATMOSPHÈRE AMÉLIORÉE: Plus réaliste et visible
    createAtmosphere() {
        const atmosphereGeometry = new THREE.SphereGeometry(2.15, 64, 64); // Plus grande pour effet prononcé
        const atmosphereMaterial = new THREE.ShaderMaterial({
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vWorldPosition;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                precision mediump float;

                varying vec3 vNormal;
                varying vec3 vWorldPosition;

                void main() {
                    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
                    float fresnel = 1.0 - abs(dot(viewDirection, vNormal));

                    float distance = length(cameraPosition - vWorldPosition);
                    float attenuation = 1.0 / (1.0 + distance * 0.03);

                    vec3 atmosphereColor = vec3(0.4, 0.7, 1.0);
                    float intensity = pow(fresnel, 1.2) * attenuation;

                    gl_FragColor = vec4(atmosphereColor, intensity * 0.55);
                }
            `,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
            transparent: true
        });

        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        this.scene.add(atmosphere);
        this.atmosphere = atmosphere;
    }
    
    createSkybox() {
        return new Promise((resolve, reject) => {
            const loader = new THREE.TextureLoader();
            const skyTexturePath = `${import.meta.env.BASE_URL}images/night-sky.jpg`;
            glog('SKYBOX', 'Chargement texture:', skyTexturePath);

            let resolved = false;

            // Timeout de sécurité: si pas chargé en 15 secondes, continuer quand même
            const timeout = setTimeout(() => {
                if (!resolved) {
                    gwarn('SKYBOX', 'TIMEOUT 15s — fallback couleur unie');
                    this.scene.background = new THREE.Color(0x000011);
                    resolved = true;
                    resolve();
                }
            }, 15000);

            loader.load(
                skyTexturePath,
                (texture) => {
                    if (!resolved) {
                        try {
                            glog('SKYBOX', 'Texture chargée OK, dimensions:', texture.image.width, 'x', texture.image.height);
                            this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
                            this.renderer.toneMappingExposure = 0.6;

                            // FIX: Limiter la résolution du cubemap pour éviter GL_OUT_OF_MEMORY
                            const maxCubemapSize = this.isMobile ? 512 : 1024;
                            const cubemapSize = Math.min(texture.image.height, maxCubemapSize);
                            glog('SKYBOX', 'Cubemap size:', cubemapSize, '(max:', maxCubemapSize, ')');

                            const rt = new THREE.WebGLCubeRenderTarget(cubemapSize);
                            rt.fromEquirectangularTexture(this.renderer, texture);
                            this.scene.background = rt.texture;
                            glog('SKYBOX', 'Skybox appliquée avec succès');

                            // Libérer la texture equirectangulaire originale
                            texture.dispose();

                            // Fog plus légère pour voir davantage les étoiles
                            this.scene.fog = new THREE.FogExp2(0x000011, 0.00005);
                        } catch (error) {
                            gerr('SKYBOX', 'Erreur création cubemap:', error.message);
                            this.scene.background = new THREE.Color(0x000011);
                        }
                        resolved = true;
                        clearTimeout(timeout);
                        resolve();
                    }
                },
                (progress) => {
                    if (progress.lengthComputable) {
                        glog('SKYBOX', 'Progression:', Math.round(progress.loaded / progress.total * 100) + '%');
                    }
                },
                (error) => {
                    if (!resolved) {
                        gerr('SKYBOX', 'ERREUR chargement texture:', error);
                        gerr('SKYBOX', 'Chemin tenté:', skyTexturePath);
                        this.scene.background = new THREE.Color(0x000011);
                        resolved = true;
                        clearTimeout(timeout);
                        resolve();
                    }
                }
            );
        });
    }

    /**
     * Précharge TOUS les assets avant l'affichage de l'interface
     * Retourne une Promise qui se résout quand tout est prêt
     */
    preloadAllAssets() {
        glog('PRELOAD', 'Début préchargement de tous les assets...');
        return Promise.all([
            this.createGlobe(),
            this.createSkybox()
        ]).then(() => {
            glog('PRELOAD', 'Tous les assets chargés OK');
            // Démarrer la lecture de la vidéo maintenant que tout est chargé
            if (this.videoElement) {
                glog('PRELOAD', 'Lecture vidéo globe...');
                this.videoElement.play().catch(e => {
                    gwarn('PRELOAD', 'Erreur lecture vidéo:', e.message);
                });
            } else {
                gwarn('PRELOAD', 'Pas de videoElement !');
            }

            // Démarrer la surveillance du VideoManager
            videoManager.startMonitoring(10000);
        }).catch((error) => {
            gerr('PRELOAD', 'Erreur préchargement:', error);
            // Continuer quand même pour ne pas bloquer l'application
            if (this.videoElement) {
                this.videoElement.play().catch(e => {
                    gwarn('PRELOAD', 'Erreur lecture vidéo (fallback):', e.message);
                });
            }

            // Démarrer la surveillance même en cas d'erreur
            videoManager.startMonitoring(10000);
        });
    }
    
    updateCameraPosition() {
        if (!this.orbitParams.isOrbiting) return;
        
        const a = this.orbitParams.ellipseMajorAxis * this.orbitParams.zoomLevel;
        const b = this.orbitParams.ellipseMinorAxis * this.orbitParams.zoomLevel;
        
        let x = a * Math.cos(this.orbitParams.orbitAngle);
        let z = b * Math.sin(this.orbitParams.orbitAngle);
        
        const inclination = this.orbitParams.inclination;
        const y = z * Math.sin(inclination);
        z = z * Math.cos(inclination);
        
        this.camera.position.set(x, y, z);
        
        this.camera.lookAt(0, 0, 0);
        
        if (this.cameraMarker) {
            this.cameraMarker.position.set(x, y, z);
        }
        
        this.orbitParams.orbitAngle += this.orbitParams.currentSpeed;
        
        this.orbitParams.orbitHistory.push(new THREE.Vector3(x, y, z));
        
        if (this.orbitParams.orbitHistory.length > 100) {
            this.orbitParams.orbitHistory.shift();
        }
    }
    
    _updateCameraPositionManual() {
        const a = this.orbitParams.ellipseMajorAxis * this.orbitParams.zoomLevel;
        const b = this.orbitParams.ellipseMinorAxis * this.orbitParams.zoomLevel;
        
        let x = a * Math.cos(this.orbitParams.orbitAngle);
        let z = b * Math.sin(this.orbitParams.orbitAngle);
        
        const inclination = this.orbitParams.inclination;
        const y = z * Math.sin(inclination);
        z = z * Math.cos(inclination);
        
        this.camera.position.set(x, y, z);
        
        this.camera.lookAt(0, 0, 0);
        
        if (this.cameraMarker) {
            this.cameraMarker.position.copy(this.camera.position);
        }
    }
    
    addHotspots(hotspots) {
        // Nettoyer tous les anciens hotspots et leurs labels
        this.hotspotObjects.forEach(hotspot => {
            this.scene.remove(hotspot);

            // Supprimer les event listeners pour éviter les fuites mémoire
            if (hotspot.userData.label && hotspot.userData.labelHandlers) {
                const { onMouseEnter, onMouseLeave, onClick } = hotspot.userData.labelHandlers;
                hotspot.userData.label.removeEventListener('mouseenter', onMouseEnter);
                hotspot.userData.label.removeEventListener('mouseleave', onMouseLeave);
                hotspot.userData.label.removeEventListener('click', onClick);
            }

            // Supprimer les éléments DOM
            if (hotspot.userData.label && hotspot.userData.label.parentNode) {
                hotspot.userData.label.parentNode.removeChild(hotspot.userData.label);
            }
            if (hotspot.userData.connectorSvg && hotspot.userData.connectorSvg.parentNode) {
                hotspot.userData.connectorSvg.parentNode.removeChild(hotspot.userData.connectorSvg);
            }

            // Ancienne méthode de cleanup pour compatibilité
            if (hotspot.userData.labelContainer && hotspot.userData.labelContainer.parentNode) {
                hotspot.userData.labelContainer.parentNode.removeChild(hotspot.userData.labelContainer);
            }
        });
        this.hotspotObjects = [];

        // Nettoyage complet de tous les éléments orphelins
        document.querySelectorAll('.hotspot-label').forEach(el => el.remove());
        document.querySelectorAll('.hotspot-label-container').forEach(el => el.remove());
        document.querySelectorAll('.connector-line').forEach(el => el.remove());

        hotspots.forEach(hotspot => {
            const { position, title } = hotspot;

            const lat = position.lat * (Math.PI / 180);
            const lon = position.lng * (Math.PI / 180);

            // Rayon du globe (défini dans l'application)
            const globeRadius = 2.0;

            // Offset pour éviter de traverser + petite marge pour être visible
            const hotspotOffset = 0.15; // Distance fixe au-dessus de la surface
            const hotspotRadius = globeRadius + hotspotOffset;

            // Position sur la sphère avec offset constant
            const x = hotspotRadius * Math.cos(lat) * Math.cos(lon);
            const y = hotspotRadius * Math.sin(lat);
            const z = hotspotRadius * Math.cos(lat) * Math.sin(lon);

            // Hotspot sphérique avec jaune vif DA
            const markerGeometry = new THREE.SphereGeometry(0.05, 16, 16);
            const markerMaterial = new THREE.MeshBasicMaterial({
                color: 0xffdd00, // Jaune vif de la DA (plus lumineux)
                transparent: true,
                opacity: 0, // Commence invisible, apparaîtra avec les autres UI
                depthTest: true,
                depthWrite: true, // Activer pour éviter de voir à travers le globe
                toneMapped: false // Désactive le tone mapping pour conserver la couleur pure
            });

            const marker = new THREE.Mesh(markerGeometry, markerMaterial);
            marker.position.set(x, y, z);
            marker.userData = { hotspot };

            // Ajouter le halo
            const haloGeometry = new THREE.SphereGeometry(0.08, 16, 16);
            const haloMaterial = new THREE.MeshBasicMaterial({
                color: 0xffdd00, // Jaune vif de la DA (plus lumineux)
                transparent: true,
                opacity: 0, // Commence invisible
                side: THREE.BackSide,
                depthTest: true,
                depthWrite: false,
                toneMapped: false // Désactive le tone mapping pour conserver la couleur pure
            });

            const halo = new THREE.Mesh(haloGeometry, haloMaterial);
            marker.add(halo);

            // Stocker les matériaux pour pouvoir les animer lors de l'apparition
            marker.userData.materials = [markerMaterial, haloMaterial];

            this.addHotspotLabel(marker, title, new THREE.Vector3(x, y, z));

            this.scene.add(marker);
            this.hotspotObjects.push(marker);
        });
    }
    
    addHotspotLabel(marker, text, position) {
        // Créer le label
        const labelDiv = document.createElement('div');
        labelDiv.className = 'hotspot-label';
        labelDiv.textContent = text;
        labelDiv.style.cssText = `
            position: fixed;
            background-color: rgba(0, 0, 0, 0.85);
            color: #ffdd00;
            padding: 6px 12px;
            border-radius: 4px;
            font-family: 'Roboto Mono', monospace;
            font-size: 12px;
            white-space: nowrap;
            opacity: 0;
            border: 1px solid rgba(255, 204, 0, 0.7);
            z-index: 1000;
            pointer-events: auto;
            cursor: pointer;
            transition: opacity 0.3s ease;
        `;

        // Créer le connector line en SVG pour de meilleures performances
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.classList.add('hotspot-connector');
        svg.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 50;
            opacity: 0;
        `;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('stroke', 'rgba(255, 204, 0, 0.6)');
        line.setAttribute('stroke-width', '1.5');
        line.setAttribute('stroke-dasharray', '4, 4');
        svg.appendChild(line);

        // Ajouter au DOM
        document.body.appendChild(labelDiv);
        document.body.appendChild(svg);

        // Handlers d'événements
        const onMouseEnter = () => {
            labelDiv.style.backgroundColor = 'rgba(255, 204, 0, 0.9)';
            labelDiv.style.color = '#000';
            labelDiv.style.transform = 'scale(1.05)';
        };

        const onMouseLeave = () => {
            labelDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            labelDiv.style.color = '#ffdd00';
            labelDiv.style.transform = 'scale(1)';
        };

        const onClick = (e) => {
            e.stopPropagation();
            const hotspot = marker.userData.hotspot;
            if (hotspot) {
                this.activateHotspot(hotspot);
            }
        };

        labelDiv.addEventListener('mouseenter', onMouseEnter);
        labelDiv.addEventListener('mouseleave', onMouseLeave);
        labelDiv.addEventListener('click', onClick);

        // Stocker les références
        marker.userData.label = labelDiv;
        marker.userData.connectorSvg = svg;
        marker.userData.connectorLine = line;
        marker.userData.worldPosition = position.clone();
        marker.userData.labelHandlers = { onMouseEnter, onMouseLeave, onClick };
        marker.userData.labelText = text;
    }
    
    onMouseClick(event) {
        if (this.orbitParams.inHotspotMode) return;
        
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        const globeIntersects = this.raycaster.intersectObject(this.globe);
        
        if (globeIntersects.length > 0) {
            const intersectionPoint = globeIntersects[0].point;
            
            const globeRadius = 2.0;
            
            const phi = Math.acos(intersectionPoint.y / globeRadius);
            const theta = Math.atan2(intersectionPoint.z, intersectionPoint.x);
            
            const lat = 90 - (phi * 180 / Math.PI);
            const lng = (theta * 180 / Math.PI) - 180;
            
            const clickedHotspot = this._findNearestHotspot(lat, lng, 10);

            if (clickedHotspot) {
                this.activateHotspot(clickedHotspot);
                return;
            }
        }
        
        const hotspotIntersects = this.raycaster.intersectObjects(this.hotspotObjects);
        
        if (hotspotIntersects.length > 0) {
            const selectedHotspot = hotspotIntersects[0].object.userData.hotspot;
            this.activateHotspot(selectedHotspot);
        }
    }
    
    _findNearestHotspot(lat, lng, maxDistance) {
        let nearestHotspot = null;
        let minDistance = maxDistance;
        
        const hotspots = this.hotspotObjects.map(obj => obj.userData.hotspot).filter(Boolean);
        
        for (const hotspot of hotspots) {
            const hotspotLat = hotspot.position.lat;
            const hotspotLng = hotspot.position.lng;
            
            const distance = Math.sqrt(
                Math.pow(hotspotLat - lat, 2) + 
                Math.pow(hotspotLng - lng, 2)
            );
            
            if (distance < minDistance) {
                minDistance = distance;
                nearestHotspot = hotspot;
            }
        }
        
        return nearestHotspot;
    }
    
    // Vue verticale du hotspot
    activateHotspot(hotspot) {
        if (this.orbitParams.inHotspotMode) return;
        
        // Convertir coordonnées GPS vers 3D
        const lat = hotspot.position.lat * (Math.PI / 180);
        const lon = hotspot.position.lng * (Math.PI / 180);
        const radius = 2.1;
        
        const hotspotX = radius * Math.cos(lat) * Math.cos(lon);
        const hotspotY = radius * Math.sin(lat);
        const hotspotZ = radius * Math.cos(lat) * Math.sin(lon);
        const hotspotPos = new THREE.Vector3(hotspotX, hotspotY, hotspotZ);

        // Effet de scan désactivé
        // this.createScanEffect(hotspot.position);

        // Arrêter l'orbite
        this.orbitParams.isOrbiting = false;

        // Position actuelle de la caméra
        const currentCameraPos = this.camera.position.clone();

        // Calculer la position finale au-dessus du hotspot
        const cameraDistance = 5.2;
        const normalizedPos = hotspotPos.clone().normalize();
        const finalPosition = normalizedPos.multiplyScalar(cameraDistance);

        // Calculer une position intermédiaire HAUTE (arc parabolique)
        // Point milieu entre position actuelle et finale, mais plus haut
        const midPoint = new THREE.Vector3()
            .addVectors(currentCameraPos, finalPosition)
            .multiplyScalar(0.5);

        // Pousser le point milieu plus loin du centre pour créer un arc
        const arcHeight = 1.8; // Hauteur supplémentaire de l'arc
        midPoint.normalize().multiplyScalar(midPoint.length() + arcHeight);

        // Animation en 2 étapes : d'abord vers le haut, puis descente vers le hotspot
        const timeline = gsap.timeline();

        // Étape 1 : Montée parabolique vers le point intermédiaire
        timeline.to(this.camera.position, {
            x: midPoint.x,
            y: midPoint.y,
            z: midPoint.z,
            duration: 1.0,
            ease: "power1.inOut",
            onUpdate: () => {
                this.camera.lookAt(0, 0, 0);
            }
        });

        // Créer un overlay noir pour la transition
        let fadeOverlay = document.getElementById('fade-overlay');
        if (!fadeOverlay) {
            fadeOverlay = document.createElement('div');
            fadeOverlay.id = 'fade-overlay';
            fadeOverlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: #000;
                opacity: 0;
                z-index: 98000;
                pointer-events: none;
            `;
            document.body.appendChild(fadeOverlay);
        }

        // Étape 2 : Descente fluide vers le hotspot avec zoom
        timeline.to(this.camera.position, {
            x: finalPosition.x,
            y: finalPosition.y,
            z: finalPosition.z,
            duration: 1.2,
            ease: "power2.out",
            onUpdate: () => {
                this.camera.lookAt(0, 0, 0);
            },
            onComplete: () => {
                this.orbitParams.inHotspotMode = true;
                this._redirectToExternalPage(hotspot);
            }
        }, "-=0.3"); // Overlap pour fluidité

        // Ajouter le fondu au noir progressif vers la fin de l'animation
        timeline.to(fadeOverlay, {
            opacity: 1,
            duration: 0.8,
            ease: "power2.in"
        }, "-=0.8"); // Commence 0.8s avant la fin de l'animation

        // Zoom progressif pendant la descente (réduit pour moins de rapprochement)
        timeline.to(this.camera, {
            fov: 55,
            duration: 1.2,
            ease: "power2.out",
            onUpdate: () => {
                this.camera.updateProjectionMatrix();
            }
        }, "-=1.2"); // Commence avec la descente
    }
    
    // Fonction de redirection
   _redirectToExternalPage(hotspot) {
       // Jouer la vidéo de transition puis rediriger
       this.playTransitionVideoAndRedirect(hotspot.id);
   }

   /**
    * Joue la vidéo de transition puis redirige vers une page
    */
   playTransitionVideoAndRedirect(hotspotId) {
       const transitionVideo = document.getElementById('transition-video-out');

       if (!transitionVideo) {
           const redirectUrl = getRedirectUrl(hotspotId);
           window.location.href = redirectUrl;
           return;
       }

       // Activer la vidéo (la rendre visible)
       transitionVideo.classList.add('active');
       transitionVideo.currentTime = 0;

       // Lancer la vidéo
       transitionVideo.play().then(() => {
           // Écouter la fin de la vidéo pour faire la redirection
           transitionVideo.addEventListener('ended', () => {
               const redirectUrl = getRedirectUrl(hotspotId);
               window.location.href = redirectUrl;
           }, { once: true });

       }).catch(e => {
           // En cas d'erreur, rediriger quand même
           const redirectUrl = getRedirectUrl(hotspotId);
           window.location.href = redirectUrl;
       });

       // Timeout de sécurité
       setTimeout(() => {
           const redirectUrl = getRedirectUrl(hotspotId);
           window.location.href = redirectUrl;
       }, 10000);
   }
   
   // MÉTHODE CORRIGÉE: Effet de scan avec shader compatible
   createScanEffect(position) {
       const phi = (90 - position.lat) * (Math.PI / 180);
       const theta = (position.lng + 180) * (Math.PI / 180);
       
       const x = -(2.1 * Math.sin(phi) * Math.cos(theta));
       const y = 2.1 * Math.cos(phi);
       const z = 2.1 * Math.sin(phi) * Math.sin(theta);
       
       const scanGeometry = new THREE.RingGeometry(0, 0.3, 32);
       const scanMaterial = new THREE.ShaderMaterial({
           uniforms: {
               color: { value: new THREE.Color(0xffcc00) },
               time: { value: 0 }
           },
           vertexShader: `
               varying vec2 vUv;
               void main() {
                   vUv = uv;
                   gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
               }
           `,
           fragmentShader: `
               precision mediump float;

               uniform vec3 color;
               uniform float time;
               varying vec2 vUv;

               void main() {
                   float distance = length(vUv - vec2(0.5, 0.5)) * 2.0;
                   float alpha = smoothstep(0.8, 1.0, distance) * 0.8;

                   alpha *= (sin(time * 10.0) * 0.2 + 0.8);

                   gl_FragColor = vec4(color, alpha);
               }
           `,
           side: THREE.DoubleSide,
           transparent: true,
           blending: THREE.AdditiveBlending,
           depthWrite: false
       });
       
       const scanRing = new THREE.Mesh(scanGeometry, scanMaterial);
       
       scanRing.position.set(x, y, z);
       scanRing.lookAt(0, 0, 0);
       
       this.scene.add(scanRing);
       
       let startTime = performance.now();
       const animate = () => {
           const elapsedTime = (performance.now() - startTime) / 1000;
           scanMaterial.uniforms.time.value = elapsedTime;
           
           if (elapsedTime < 2) {
               requestAnimationFrame(animate);
           } else {
               this.scene.remove(scanRing);
               scanRing.geometry.dispose();
               scanMaterial.dispose();
           }
       };
       
       animate();
       
       gsap.to(scanRing.scale, {
           x: 4,
           y: 4,
           z: 1,
           duration: 2,
           ease: "power1.out"
       });
       
       gsap.to(scanMaterial.uniforms.color.value, {
           r: 1.0,
           g: 0.8,
           b: 0.2,
           duration: 2,
           ease: "power1.out"
       });
   }
   
   exitHotspotMode() {
       if (!this.orbitParams.inHotspotMode) return;
       
       this.orbitParams.inHotspotMode = false;
       
       // Réinitialiser le champ de vision
       gsap.to(this.camera, {
           fov: 60,
           duration: 1,
           ease: "power2.out",
           onUpdate: () => {
               this.camera.updateProjectionMatrix();
           }
       });
       
       // Réactiver l'orbite
       setTimeout(() => {
           this.orbitParams.isOrbiting = true;
           this.orbitParams.currentSpeed = this.orbitParams.baseSpeed;
       }, 500);
   }
   
   exitHotspotModeExternal() {
       this.exitHotspotMode();
   }
   
   
   zoom(zoomIn) {
       const zoomFactor = zoomIn ? 0.85 : 1.15;
       
       const newZoomLevel = this.orbitParams.zoomLevel * zoomFactor;
       
       this.orbitParams.zoomLevel = Math.min(
           Math.max(newZoomLevel, this.orbitParams.minZoomLevel),
           this.orbitParams.maxZoomLevel
       );
       
       gsap.to(this.camera.position, {
           x: this.camera.position.x * zoomFactor,
           y: this.camera.position.y * zoomFactor,
           z: this.camera.position.z * zoomFactor,
           duration: 0.5,
           ease: "back.out(1.2)",
           onUpdate: () => {
               this.camera.lookAt(0, 0, 0);
           }
       });
   }
   
   resetView() {
       this.orbitParams.zoomLevel = 1;
       
       this.orbitParams.currentSpeed = this.orbitParams.baseSpeed;
       
       const a = this.orbitParams.ellipseMajorAxis;
       const b = this.orbitParams.ellipseMinorAxis;
       const inclination = this.orbitParams.inclination;
       const currentAngle = this.orbitParams.orbitAngle;
       
       const targetX = a * Math.cos(currentAngle);
       const rawZ = b * Math.sin(currentAngle);
       const targetY = rawZ * Math.sin(inclination);
       const targetZ = rawZ * Math.cos(inclination);
       
       gsap.to(this.camera.position, {
           x: targetX,
           y: targetY,
           z: targetZ,
           duration: 1,
           ease: "elastic.out(1, 0.7)",
           onUpdate: () => {
               this.camera.lookAt(0, 0, 0);
           }
       });
   }
   
   onWindowResize() {
       this.camera.aspect = window.innerWidth / window.innerHeight;
       this.camera.updateProjectionMatrix();
       this.renderer.setSize(window.innerWidth, window.innerHeight);
   }
   
   setHotspotSelectCallback(callback) {
       this.onHotspotSelect = callback;
   }
   
   setHotspotExitCallback(callback) {
       this.onHotspotExit = callback;
   }

   /**
    * Met à jour les positions de tous les labels et connector lines de manière optimisée
    */
   updateHotspotLabels() {
       if (this.orbitParams.inHotspotMode) {
           // Cacher tous les labels en mode hotspot
           this.hotspotObjects.forEach(marker => {
               if (marker.userData.label) marker.userData.label.style.opacity = '0';
               if (marker.userData.connectorSvg) marker.userData.connectorSvg.style.opacity = '0';
           });
           return;
       }

       this.hotspotObjects.forEach(marker => {
           if (!marker.userData.label || !marker.userData.worldPosition) return;

           const worldPos = marker.userData.worldPosition;

           // Vérifier si le point est visible
           const projected = worldPos.clone().project(this.camera);

           // Hors de l'écran
           if (projected.z > 1 || projected.x < -1 || projected.x > 1 ||
               projected.y < -1 || projected.y > 1) {
               marker.userData.label.style.opacity = '0';
               marker.userData.connectorSvg.style.opacity = '0';
               return;
           }

           // Vérifier occlusion par le globe
           const direction = new THREE.Vector3().subVectors(worldPos, this.camera.position).normalize();
           const raycaster = new THREE.Raycaster(this.camera.position, direction);
           const intersects = raycaster.intersectObject(this.globe);

           if (intersects.length > 0) {
               const distToIntersection = intersects[0].distance;
               const distToPoint = this.camera.position.distanceTo(worldPos);

               if (distToIntersection < distToPoint - 0.1) {
                   marker.userData.label.style.opacity = '0';
                   marker.userData.connectorSvg.style.opacity = '0';
                   return;
               }
           }

           // Le point est visible, calculer sa position à l'écran
           const x = (projected.x * 0.5 + 0.5) * window.innerWidth;
           const y = (-projected.y * 0.5 + 0.5) * window.innerHeight;

           // Position du label avec offset simple
           const textWidth = marker.userData.labelText.length * 7;
           const offsetX = 40;
           const offsetY = -15;

           let labelX = x + offsetX;
           let labelY = y + offsetY;

           // Garder le label dans l'écran
           const padding = 10;
           if (labelX + textWidth > window.innerWidth - padding) {
               labelX = x - offsetX - textWidth;
           }
           if (labelX < padding) labelX = padding;
           if (labelY < padding) labelY = padding;
           if (labelY > window.innerHeight - padding) labelY = window.innerHeight - padding;

           // Mettre à jour le label
           marker.userData.label.style.left = `${labelX}px`;
           marker.userData.label.style.top = `${labelY}px`;
           // Ne rendre visible que si le flag labelsVisible est true
           if (this.labelsVisible) {
               marker.userData.label.style.opacity = '1';
           }

           // Mettre à jour le connector line (SVG)
           const line = marker.userData.connectorLine;
           if (line) {
               line.setAttribute('x1', x);
               line.setAttribute('y1', y);
               line.setAttribute('x2', labelX);
               line.setAttribute('y2', labelY + 10); // Offset pour centrer sur le label
               // Ne rendre visible que si le flag labelsVisible est true
               if (this.labelsVisible) {
                   marker.userData.connectorSvg.style.opacity = '1';
               }
           }
       });
   }

   /**
    * Active l'affichage des labels de hotspots
    * Appelé quand les éléments UI doivent apparaître
    */
   showLabels() {
       this.labelsVisible = true;

       // Animer l'apparition des hotspots (markers) avec GSAP
       this.hotspotObjects.forEach((marker, index) => {
           if (marker.userData.materials) {
               // Animer chaque matériau (cercle principal + halo)
               marker.userData.materials.forEach((material, matIndex) => {
                   const targetOpacity = matIndex === 0 ? 0.8 : 0.5; // Principal = 0.8, Halo = 0.5

                   gsap.to(material, {
                       opacity: targetOpacity,
                       duration: 0.8,
                       delay: index * 0.1, // Délai progressif pour chaque hotspot
                       ease: "power2.out"
                   });
               });
           }
       });
   }

   animate() {
       requestAnimationFrame(this.animate.bind(this));

       // Ne pas rendre si le contexte WebGL est perdu
       if (this._contextLost) return;

       const delta = this.clock.getDelta();
       const time = this.clock.getElapsedTime() * 1000;
       
       if (this.orbitParams.isOrbiting && !this.orbitParams.inHotspotMode) {
           this.updateCameraPosition();
       }
       
       if (this.updateSkyboxTime) {
           this.updateSkyboxTime(time);
       }

       // Animer les ondes des hotspots (sprites)
       this.hotspotObjects.forEach(hotspot => {
           const waveRings = hotspot.userData.waveRings;
           if (waveRings) {
               waveRings.forEach(wave => {
                   // Incrémenter le temps de vague
                   wave.userData.waveTime += delta;

                   // Temps relatif avec délai initial
                   const relativeTime = wave.userData.waveTime - wave.userData.initialDelay;

                   if (relativeTime > 0) {
                       // Durée d'une vague complète
                       const waveDuration = 2.5;
                       const progress = (relativeTime % waveDuration) / waveDuration;

                       // Expansion de l'anneau
                       const minRadius = 0.05;
                       const maxRadius = 0.18;
                       const currentRadius = minRadius + (maxRadius - minRadius) * progress;

                       // Recréer la géométrie avec le nouveau rayon
                       wave.geometry.dispose();
                       wave.geometry = new THREE.RingGeometry(currentRadius, currentRadius + 0.02, 32);

                       // Opacité qui diminue avec l'expansion
                       wave.material.opacity = 0.7 * (1 - progress);
                   }
               });
           }
       });

       // Mettre à jour les labels et connector lines (méthode optimisée)
       this.updateHotspotLabels();
       
       if (this.clouds) {
           this.clouds.rotation.y += 0.0001;
       }
       
       if (this.globe && !this.orbitParams.inHotspotMode) {
           this.globe.rotation.y += 0.0002;
       }
       
       if (this.globe && this.globe.material.uniforms && this.globe.material.uniforms.time) {
           this.globe.material.uniforms.time.value = time;
       }
       
       // Video playback is managed exclusively by VideoManager - no retry here
       
       this.renderer.render(this.scene, this.camera);
   }
}