// JavaScript principal avec support tactile et responsive

// Corriger le bug de retour depuis la page interface (bfcache)
window.addEventListener('pageshow', function(event) {
    if (event.persisted || (window.performance && window.performance.navigation.type === 2)) {
        window.location.reload();
    }
});

// Variables globales
let currentGalleryIndex = 0;
let touchStartX = 0;
let touchEndX = 0;
let isMenuOpen = false;
let currentLanguage = 'fr'; // VARIABLE GLOBALE POUR LA LANGUE

// Variables pour les contrôles vidéo - DÉPLACÉES EN GLOBAL
let controlsHideTimeout;
let pauseHideTimeout;
let docVideo, videoContainer, playButton; // DÉCLARATION GLOBALE

document.addEventListener("DOMContentLoaded", function() {
    // Détection du type d'appareil
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1025;
    const isDesktop = window.innerWidth >= 1025;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // *** NOUVEAU LOADER AVEC L-JELLY VISIBLE ***
    document.body.classList.add('loading');
    
    // Créer le nouveau loader avec l-jelly - comme dans app.js
    const customLoader = document.createElement('div');
    customLoader.className = 'custom-loader';
    customLoader.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        background-color: #000 !important;
        display: flex !important;
        justify-content: center !important;
        align-items: center !important;
        z-index: 999999 !important;
        opacity: 1 !important;
        visibility: visible !important;
        transition: opacity 0.8s ease !important;
    `;
    
    // Enregistrer l-jelly si nécessaire (comme dans app.js)
    if (window.jelly && window.jelly.register) {
        window.jelly.register();
    }
    
    // Créer l'élément l-jelly comme dans app.js
    const jellyLoader = document.createElement('l-jelly');
    jellyLoader.setAttribute('size', '60');
    jellyLoader.setAttribute('speed', '1.2');
    jellyLoader.setAttribute('color', '#ffcc00');
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
    initTranslateButton(); // UNE SEULE FOIS - TRADUCTION COMPLÈTE
    fixVideos();
    initLogoClick();
    initGallery();
    initReturnExploration();
    animateNavLinks();
    
    // Gestion du redimensionnement
    window.addEventListener('resize', handleResize);
    
    function handleResize() {
        const newIsMobile = window.innerWidth < 768;
        const newIsTablet = window.innerWidth >= 768 && window.innerWidth < 1025;
        
        // Fermer le menu mobile si on passe à desktop
        if (window.innerWidth >= 1025 && isMenuOpen) {
            closeMenu();
        }
        
        // Réinitialiser la galerie si nécessaire
        if ((isMobile && !newIsMobile) || (!isMobile && newIsMobile)) {
            initGallery();
        }
    }
    
    // Force le retour en haut lors du rechargement
    window.addEventListener('beforeunload', function() {
        window.scrollTo(0, 0);
    });
    
    setTimeout(() => {
        window.scrollTo(0, 0);
    }, 100);
    
});

// ========================================
// TRADUCTIONS COMPLÈTES DU SITE
// ========================================
const translations = {
    fr: {
        // Navigation et titre principal
        title: "LES OMBRES DE LA MER",
        subtitle: "Une enquête sur le traffic des espèces marines en voie d'extinction",
        navHome: "Accueil",
        navDoc: "Documentaire",
        navExpedition: "Expédition",
        navGallery: "Galerie",
        navScience: "Enjeux scientifiques",
        navResources: "Documentation",
        navCredits: "Équipe",
        
        // Section documentaire
        docTitle: "PRÉSENTATION DU DOCUMENTAIRE",
        docDesc1: "Dans le golfe de Californie, un groupe d'individus déterminés risque leur vie pour sauver le marsouin du Pacifique, qui est en passe de disparaître à jamais. Cette espèce rare, connue localement sous le nom de \"vaquita\", est victime de la pêche illégale, visant un autre poisson menacé : le totoaba, dont la vessie natatoire est surnommée \"la cocaïne de la mer\" en raison de sa valeur sur le marché noir.",
        docDesc2: "Lorsqu'environnementalistes, journalistes d'investigation et services de renseignement militaire suivent les traces du \"cartel de la mer\", ils découvrent une réalité sinistre qui dépasse la simple activité de pêche : il s'agit d'une véritable opération criminelle qui menace la dernière espèce de marsouin au monde.",
        docButton: "Voir le documentaire",
        
        // Section expédition
        expeditionTitle: "L'EXPÉDITION",
        expeditionDesc1: "Une équipe de scientifiques marins, de conservationnistes, de journalistes d'investigation et d'agents de renseignement s'est unie pour documenter et combattre le trafic illégal d'espèces marines menacées dans le golfe de Californie.",
        expeditionDesc2: "Pendant deux ans, l'équipe a navigué dans les eaux dangereuses du Golfe, poursuivant les pêcheurs illégaux, documentant leurs activités et travaillant avec les autorités locales pour sauver la vaquita de l'extinction.",
        expeditionDesc3: "L'expédition a révélé les liens complexes entre les cartels de la drogue, les marchés noirs asiatiques et les communautés de pêcheurs locales, exposant un réseau criminel international qui menace l'écosystème fragile du golfe de Californie.",
        
        // Section galerie
        galleryTitle: "GALERIE PHOTO",
        galleryImg1Title: "Vaquita en milieu naturel",
        galleryImg1Desc: "Rare photographie d'un marsouin du Pacifique dans le golfe de Californie.",
        galleryImg2Title: "Observer la vaquita",
        galleryImg2Desc: "Les scientifiques utilisent des techniques avancées pour repérer ces créatures élusives.",
        galleryImg3Title: "Filets de pêche illégaux",
        galleryImg3Desc: "Récupération de pièges mortels lors d'une opération de nettoyage.",
        galleryImg4Title: "Sur les traces des braconniers",
        galleryImg4Desc: "L'équipe d'intervention lors d'une mission de surveillance.",
        
        // Section science
        scienceTitle: "ENJEUX SCIENTIFIQUES ET ÉCOLOGIQUES",
        scienceIntro: "Le déclin de la vaquita et la surpêche du totoaba représentent une crise écologique aux implications scientifiques profondes. Ce documentaire explore les conséquences de la disparition d'espèces clés sur l'écosystème marin, ainsi que les défis de la conservation dans un contexte socio-économique complexe.",
        stat1Number: "10",
        stat1Title: "Vaquitas restantes",
        stat1Desc: "Selon les estimations les plus récentes, moins de 10 vaquitas subsistent dans leur habitat naturel, ce qui en fait le mammifère marin le plus menacé au monde.",
        stat2Number: "$100K",
        stat2Title: "Prix d'une vessie de totoaba",
        stat2Desc: "Une seule vessie natatoire de totoaba peut se vendre jusqu'à 100 000 dollars sur le marché noir en Asie, où elle est considérée comme un remède traditionnel.",
        stat3Number: "95%",
        stat3Title: "Déclin de la population",
        stat3Desc: "La population de vaquitas a diminué de plus de 95% au cours des 20 dernières années, principalement en raison des prises accessoires dans les filets de pêche illégaux.",
        scienceImg1Caption: "Une rare photographie d'une vaquita dans le golfe de Californie. Ces marsouins timides sont rarement observés dans la nature.",
        scienceImg2Caption: "Des filets de pêche illégaux récupérés lors d'une opération de nettoyage dans la zone protégée de la vaquita.",
        
        // Section ressources
        resourcesTitle: "DOCUMENTATION ET RECHERCHES ASSOCIÉES",
        resourcesIntro: "Explorez les publications scientifiques, les rapports de conservation et les initiatives qui sous-tendent les efforts de protection des espèces menacées du golfe de Californie. Ces ressources constituent le fondement de notre documentation.",
        resource1Title: "Rapport sur l'état de la vaquita",
        resource1Desc: "Le dernier rapport scientifique détaillant la population actuelle, les menaces et les efforts de conservation pour sauver la vaquita de l'extinction.",
        resource1Link: "Télécharger le rapport",
        resource2Title: "Atlas des espèces menacées",
        resource2Desc: "Une cartographie complète des espèces marines menacées dans le golfe de Californie, leurs habitats et les zones prioritaires pour la conservation.",
        resource2Link: "Explorer l'atlas",
        resource3Title: "Guide d'identification des espèces",
        resource3Desc: "Un guide illustré pour identifier les principales espèces marines du golfe de Californie, y compris celles qui sont protégées ou menacées.",
        resource3Link: "Consulter le guide",
        resource4Title: "Données de surveillance acoustique",
        resource4Desc: "Enregistrements et analyses des données de surveillance acoustique utilisées pour suivre les populations de vaquitas dans leur habitat naturel.",
        resource4Link: "Écouter les données",
        resource5Title: "Études sur l'impact économique",
        resource5Desc: "Recherches sur l'impact économique de la pêche durable par rapport à la pêche illégale sur les communautés locales du golfe de Californie.",
        resource5Link: "Lire les études",
        resource6Title: "Programme de conservation marine",
        resource6Desc: "Détails sur les initiatives de conservation marine en cours dans le golfe de Californie et comment participer aux efforts de protection.",
        resource6Link: "Découvrir le programme",
        
        // Section crédits
        creditsTitle: "ÉQUIPE ET COLLABORATIONS",
        creditsIntro: "Découvrez l'équipe exceptionnelle de créateurs, scientifiques et conservationnistes qui ont rendu possible ce documentaire, ainsi que les organisations partenaires qui soutiennent les efforts de préservation des écosystèmes marins.",
        productionTeam: "ÉQUIPE DE PRODUCTION",
        scientificTeam: "ÉQUIPE SCIENTIFIQUE",
        additionalResources: "RESSOURCES COMPLÉMENTAIRES",
        
        // Équipe de production
        director: "Réalisateur, Directeur de la photographie",
        producer: "Producteur",
        executiveProducer: "Producteur exécutif",
        executiveProducerFemale: "Productrice exécutive",
        
        // Équipe scientifique
        scientificDirector: "Directrice scientifique, VaquitaCPR",
        programCoordinator: "Coordinateur du Programme de conservation de la vaquita",
        operationsCoordinator: "Coordinateur des opérations, Sea Shepherd",
        
        // Liens ressources
        natGeoSite: "Site officiel de National Geographic",
        vaquitaInitiative: "Page de l'Initiative vaquita",
        cirvaReport: "Rapport scientifique CIRVA",
        seaShepherd: "Sea Shepherd Conservation Society",
        donate: "Faire un don pour la conservation",
        educationalMaterial: "Matériel éducatif",
        screenings: "Projections et événements",
        press: "Presse et médias",
        
        // Footer et divers
        copyright: "© 2025 National Geographic Partners, LLC. Tous droits réservés.",
        returnToExploration: "Retour à l'exploration"
    },
    
    en: {
        // Navigation et titre principal
        title: "SEA OF SHADOWS",
        subtitle: "An investigation into the trafficking of endangered marine species",
        navHome: "Home",
        navDoc: "Documentary",
        navExpedition: "Expedition",
        navGallery: "Gallery",
        navScience: "Scientific Issues",
        navResources: "Documentation",
        navCredits: "Team",
        
        // Section documentaire
        docTitle: "DOCUMENTARY PRESENTATION",
        docDesc1: "In the Gulf of California, a group of determined individuals risk their lives to save the Pacific porpoise, which is about to disappear forever. This rare species, known locally as the \"vaquita\", is a victim of illegal fishing, targeting another endangered fish: the totoaba, whose swim bladder is nicknamed \"the cocaine of the sea\" due to its value on the black market.",
        docDesc2: "When environmentalists, investigative journalists and military intelligence services follow the trail of the \"sea cartel\", they discover a sinister reality that goes beyond simple fishing activity: it is a real criminal operation that threatens the last porpoise species in the world.",
        docButton: "Watch the documentary",
        
        // Section expédition
        expeditionTitle: "THE EXPEDITION",
        expeditionDesc1: "A team of marine scientists, conservationists, investigative journalists and intelligence agents united to document and combat the illegal trafficking of endangered marine species in the Gulf of California.",
        expeditionDesc2: "For two years, the team navigated the dangerous waters of the Gulf, pursuing illegal fishermen, documenting their activities and working with local authorities to save the vaquita from extinction.",
        expeditionDesc3: "The expedition revealed the complex links between drug cartels, Asian black markets and local fishing communities, exposing an international criminal network that threatens the fragile ecosystem of the Gulf of California.",
        
        // Section galerie
        galleryTitle: "PHOTO GALLERY",
        galleryImg1Title: "Vaquita in its natural habitat",
        galleryImg1Desc: "Rare photograph of a Pacific porpoise in the Gulf of California.",
        galleryImg2Title: "Observing the vaquita",
        galleryImg2Desc: "Scientists use advanced techniques to spot these elusive creatures.",
        galleryImg3Title: "Illegal fishing nets",
        galleryImg3Desc: "Recovery of deadly traps during a cleanup operation.",
        galleryImg4Title: "On the trail of poachers",
        galleryImg4Desc: "The intervention team during a surveillance mission.",
        
        // Section science
        scienceTitle: "SCIENTIFIC AND ECOLOGICAL ISSUES",
        scienceIntro: "The decline of the vaquita and overfishing of the totoaba represent an ecological crisis with profound scientific implications. This documentary explores the consequences of the disappearance of key species on the marine ecosystem, as well as the challenges of conservation in a complex socio-economic context.",
        stat1Number: "10",
        stat1Title: "Vaquitas remaining",
        stat1Desc: "According to the most recent estimates, fewer than 10 vaquitas remain in their natural habitat, making it the most endangered marine mammal in the world.",
        stat2Number: "$100K",
        stat2Title: "Price of a totoaba bladder",
        stat2Desc: "A single totoaba swim bladder can sell for up to $100,000 on the black market in Asia, where it is considered a traditional remedy.",
        stat3Number: "95%",
        stat3Title: "Population decline",
        stat3Desc: "The vaquita population has declined by more than 95% over the past 20 years, mainly due to bycatch in illegal fishing nets.",
        scienceImg1Caption: "A rare photograph of a vaquita in the Gulf of California. These shy porpoises are rarely observed in the wild.",
        scienceImg2Caption: "Illegal fishing nets recovered during a cleanup operation in the vaquita protected area.",
        
        // Section ressources
        resourcesTitle: "DOCUMENTATION AND ASSOCIATED RESEARCH",
        resourcesIntro: "Explore the scientific publications, conservation reports and initiatives that underpin the efforts to protect endangered species in the Gulf of California. These resources form the foundation of our documentation.",
        resource1Title: "Vaquita status report",
        resource1Desc: "The latest scientific report detailing the current population, threats and conservation efforts to save the vaquita from extinction.",
        resource1Link: "Download the report",
        resource2Title: "Atlas of endangered species",
        resource2Desc: "A comprehensive mapping of endangered marine species in the Gulf of California, their habitats and priority areas for conservation.",
        resource2Link: "Explore the atlas",
        resource3Title: "Species identification guide",
        resource3Desc: "An illustrated guide to identify the main marine species of the Gulf of California, including those that are protected or threatened.",
        resource3Link: "Consult the guide",
        resource4Title: "Acoustic monitoring data",
        resource4Desc: "Recordings and analyses of acoustic monitoring data used to track vaquita populations in their natural habitat.",
        resource4Link: "Listen to the data",
        resource5Title: "Economic impact studies",
        resource5Desc: "Research on the economic impact of sustainable fishing versus illegal fishing on local communities in the Gulf of California.",
        resource5Link: "Read the studies",
        resource6Title: "Marine conservation program",
        resource6Desc: "Details on ongoing marine conservation initiatives in the Gulf of California and how to participate in protection efforts.",
        resource6Link: "Discover the program",
        
        // Section crédits
        creditsTitle: "TEAM AND COLLABORATIONS",
        creditsIntro: "Discover the exceptional team of creators, scientists and conservationists who made this documentary possible, as well as the partner organizations that support efforts to preserve marine ecosystems.",
        productionTeam: "PRODUCTION TEAM",
        scientificTeam: "SCIENTIFIC TEAM",
        additionalResources: "ADDITIONAL RESOURCES",
        
        // Équipe de production
        director: "Director, Director of Photography",
        producer: "Producer",
        executiveProducer: "Executive Producer",
        executiveProducerFemale: "Executive Producer",
        
        // Équipe scientifique
        scientificDirector: "Scientific Director, VaquitaCPR",
        programCoordinator: "Vaquita Conservation Program Coordinator",
        operationsCoordinator: "Operations Coordinator, Sea Shepherd",
        
        // Liens ressources
        natGeoSite: "Official National Geographic website",
        vaquitaInitiative: "Vaquita Initiative page",
        cirvaReport: "CIRVA scientific report",
        seaShepherd: "Sea Shepherd Conservation Society",
        donate: "Donate for conservation",
        educationalMaterial: "Educational material",
        screenings: "Screenings and events",
        press: "Press and media",
        
        // Footer et divers
        copyright: "© 2025 National Geographic Partners, LLC. All rights reserved.",
        returnToExploration: "Return to exploration"
    }
};

// ========================================
// FONCTION DE TRADUCTION COMPLÈTE
// ========================================
function translateSite(targetLang) {
    const t = translations[targetLang];
    if (!t) {
        return;
    }
    
    // === TITRE PRINCIPAL ET NAVIGATION ===
    
    // Titre principal
    const title = document.querySelector('.title');
    if (title) title.textContent = t.title;
    
    // Sous-titre
    const subtitle = document.querySelector('.subtitle');
    if (subtitle) subtitle.textContent = t.subtitle;
    
    // Navigation
    const navLinks = document.querySelectorAll('.nav-link');
    if (navLinks[0]) navLinks[0].textContent = t.navHome;
    if (navLinks[1]) navLinks[1].textContent = t.navDoc;
    if (navLinks[2]) navLinks[2].textContent = t.navExpedition;
    if (navLinks[3]) navLinks[3].textContent = t.navGallery;
    if (navLinks[4]) navLinks[4].textContent = t.navScience;
    if (navLinks[5]) navLinks[5].textContent = t.navResources;
    if (navLinks[6]) navLinks[6].textContent = t.navCredits;
    
    // === SECTION DOCUMENTAIRE ===
    
    // Titre de section documentaire
    const docTitleEl = document.querySelector('#documentary .section-title');
    if (docTitleEl) docTitleEl.textContent = t.docTitle;
    
    // Descriptions du documentaire
    const docDescriptions = document.querySelectorAll('#documentary .description');
    if (docDescriptions[0]) docDescriptions[0].textContent = t.docDesc1;
    if (docDescriptions[1]) docDescriptions[1].textContent = t.docDesc2;
    
    // Bouton documentaire
    const docButton = document.querySelector('.doc-button');
    if (docButton) {
        // Conserver le SVG et remplacer seulement le texte
        const svg = docButton.querySelector('svg');
        const svgHTML = svg ? svg.outerHTML : '';
        docButton.innerHTML = svgHTML + ' ' + t.docButton;
    }
    
    // === SECTION EXPÉDITION ===
    
    // Titre de l'expédition
    const expeditionTitleEl = document.querySelector('#expedition .section-title');
    if (expeditionTitleEl) expeditionTitleEl.textContent = t.expeditionTitle;
    
    // Descriptions de l'expédition
    const expeditionDescriptions = document.querySelectorAll('#expedition .description');
    if (expeditionDescriptions[0]) expeditionDescriptions[0].textContent = t.expeditionDesc1;
    if (expeditionDescriptions[1]) expeditionDescriptions[1].textContent = t.expeditionDesc2;
    if (expeditionDescriptions[2]) expeditionDescriptions[2].textContent = t.expeditionDesc3;
    
    // === SECTION GALERIE ===
    
    // Titre de la galerie
    const galleryTitleEl = document.querySelector('#gallery .section-title, .gallery-title');
    if (galleryTitleEl) galleryTitleEl.textContent = t.galleryTitle;
    
    // Informations des images de galerie
    const galleryInfos = document.querySelectorAll('.image-info');
    if (galleryInfos.length > 0) {
        const imageData = [
            { title: t.galleryImg1Title, desc: t.galleryImg1Desc },
            { title: t.galleryImg2Title, desc: t.galleryImg2Desc },
            { title: t.galleryImg3Title, desc: t.galleryImg3Desc },
            { title: t.galleryImg4Title, desc: t.galleryImg4Desc }
        ];
        
        galleryInfos.forEach((info, index) => {
            if (imageData[index]) {
                const h3 = info.querySelector('h3');
                const p = info.querySelector('p');
                if (h3) h3.textContent = imageData[index].title;
                if (p) p.textContent = imageData[index].desc;
            }
        });
    }
    
    // === SECTION SCIENCE ===
    
    // Titre de la section science
    const scienceTitleEl = document.querySelector('#science .section-title');
    if (scienceTitleEl) scienceTitleEl.textContent = t.scienceTitle;
    
    // Introduction scientifique
    const scienceIntroEl = document.querySelector('#science .scientific-intro .description');
    if (scienceIntroEl) scienceIntroEl.textContent = t.scienceIntro;
    
    // Statistiques
    const statCards = document.querySelectorAll('.stat-card');
    const statData = [
        { number: t.stat1Number, title: t.stat1Title, desc: t.stat1Desc },
        { number: t.stat2Number, title: t.stat2Title, desc: t.stat2Desc },
        { number: t.stat3Number, title: t.stat3Title, desc: t.stat3Desc }
    ];
    
    statCards.forEach((card, index) => {
        if (statData[index]) {
            const number = card.querySelector('.stat-number');
            const title = card.querySelector('.stat-title');
            const desc = card.querySelector('.stat-desc');
            
            if (number) number.textContent = statData[index].number;
            if (title) title.textContent = statData[index].title;
            if (desc) desc.textContent = statData[index].desc;
        }
    });
    
    // Légendes des images scientifiques
    const scienceImageCaptions = document.querySelectorAll('#science .image-caption');
    if (scienceImageCaptions[0]) scienceImageCaptions[0].textContent = t.scienceImg1Caption;
    if (scienceImageCaptions[1]) scienceImageCaptions[1].textContent = t.scienceImg2Caption;
    
    // === SECTION RESSOURCES ===
    
    // Titre de la section ressources
    const resourcesTitleEl = document.querySelector('#resources .section-title');
    if (resourcesTitleEl) resourcesTitleEl.textContent = t.resourcesTitle;
    
    // Introduction des ressources
    const resourcesIntroEl = document.querySelector('#resources .resources-intro .description');
    if (resourcesIntroEl) resourcesIntroEl.textContent = t.resourcesIntro;
    
    // Cartes de ressources
    const resourceCards = document.querySelectorAll('.resource-card');
    const resourceData = [
        { title: t.resource1Title, desc: t.resource1Desc, link: t.resource1Link },
        { title: t.resource2Title, desc: t.resource2Desc, link: t.resource2Link },
        { title: t.resource3Title, desc: t.resource3Desc, link: t.resource3Link },
        { title: t.resource4Title, desc: t.resource4Desc, link: t.resource4Link },
        { title: t.resource5Title, desc: t.resource5Desc, link: t.resource5Link },
        { title: t.resource6Title, desc: t.resource6Desc, link: t.resource6Link }
    ];
    
    resourceCards.forEach((card, index) => {
        if (resourceData[index]) {
            const title = card.querySelector('.resource-title');
            const desc = card.querySelector('.resource-desc');
            const link = card.querySelector('.resource-link');
            
            if (title) title.textContent = resourceData[index].title;
            if (desc) desc.textContent = resourceData[index].desc;
            if (link) {
                const span = link.querySelector('span');
                const spanHTML = span ? span.outerHTML : '<span>→</span>';
                link.innerHTML = resourceData[index].link + ' ' + spanHTML;
            }
        }
    });
    
    // === SECTION CRÉDITS ===
    
    // Titre de la section crédits
    const creditsTitleEl = document.querySelector('#credits .section-title');
    if (creditsTitleEl) creditsTitleEl.textContent = t.creditsTitle;
    
    // Introduction des crédits
    const creditsIntroEl = document.querySelector('#credits .credits-intro .description');
    if (creditsIntroEl) creditsIntroEl.textContent = t.creditsIntro;
    
    // Catégories de crédits
    const creditsCategories = document.querySelectorAll('.credits-category');
    if (creditsCategories[0]) creditsCategories[0].textContent = t.productionTeam;
    if (creditsCategories[1]) creditsCategories[1].textContent = t.scientificTeam;
    if (creditsCategories[2]) creditsCategories[2].textContent = t.additionalResources;
    
    // Rôles de l'équipe de production
    const productionRoles = document.querySelectorAll('#credits .credits-list:first-of-type .credits-role');
    const productionRoleData = [t.director, t.producer, t.executiveProducer, t.executiveProducerFemale, t.executiveProducerFemale];
    
    productionRoles.forEach((role, index) => {
        if (productionRoleData[index]) {
            role.textContent = productionRoleData[index];
        }
    });
    
    // Rôles de l'équipe scientifique
    const scientificRoles = document.querySelectorAll('#credits .credits-list:nth-of-type(2) .credits-role');
    const scientificRoleData = [t.scientificDirector, t.programCoordinator, t.operationsCoordinator];
    
    scientificRoles.forEach((role, index) => {
        if (scientificRoleData[index]) {
            role.textContent = scientificRoleData[index];
        }
    });
    
    // Liens de ressources supplémentaires
    const resourceLinks = document.querySelectorAll('.credits-link');
    const resourceLinkData = [
        t.natGeoSite, t.vaquitaInitiative, t.cirvaReport, t.seaShepherd,
        t.donate, t.educationalMaterial, t.screenings, t.press
    ];
    
    resourceLinks.forEach((link, index) => {
        if (resourceLinkData[index]) {
            const span = link.querySelector('span');
            const spanHTML = span ? span.outerHTML : '<span>→</span>';
            link.innerHTML = resourceLinkData[index] + ' ' + spanHTML;
        }
    });
    
    // === ÉLÉMENTS DIVERS ===
    
    // Copyright
    const copyright = document.querySelector('.copyright');
    if (copyright) copyright.textContent = t.copyright;
    
    // Bouton retour à l'exploration
    const returnText = document.querySelector('.return-text');
    if (returnText) returnText.textContent = t.returnToExploration;
    
    // Mettre à jour le titre de la page
    document.title = `National Geographic | ${t.title}`;
    
}

// Fonctions pour les contrôles vidéo - DÉPLACÉES EN GLOBAL
function hideControlsAfterDelay(delay = 3000) {
    clearTimeout(controlsHideTimeout);
    controlsHideTimeout = setTimeout(() => {
        if (docVideo && !docVideo.paused) {
            videoContainer.classList.add('auto-hide');
        }
    }, delay);
}

function hideControlsAfterPause(delay = 5000) {
    clearTimeout(pauseHideTimeout);
    pauseHideTimeout = setTimeout(() => {
        if (docVideo && docVideo.paused) {
            videoContainer.classList.add('hide-after-pause');
        }
    }, delay);
}

function showControlsTemporarily() {
    if (videoContainer) {
        videoContainer.classList.remove('auto-hide', 'hide-after-pause');
        if (docVideo && !docVideo.paused) {
            hideControlsAfterDelay(3000);
        }
    }
}

// Nouvelle fonction pour lancer la vidéo immédiatement
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
    }
}

// Force le retour en haut au chargement
window.addEventListener('load', function() {
    setTimeout(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    }, 50);
});

// Initialisation du menu mobile/tablette
function initMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const sideNav = document.querySelector('.side-nav');
    const menuOverlay = document.querySelector('.menu-overlay');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (!menuToggle || !sideNav || !menuOverlay) {
        return;
    }
    
    // Afficher le bouton hamburger après la section hero
    window.addEventListener('scroll', function() {
        const heroHeight = document.querySelector('#hero').offsetHeight;
        if (window.scrollY > heroHeight * 0.8) {
            menuToggle.classList.add('visible');
        } else {
            menuToggle.classList.remove('visible');
        }
    });
    
    // Toggle du menu
    menuToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (isMenuOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    });
    
    // Fermer le menu en cliquant sur l'overlay
    menuOverlay.addEventListener('click', closeMenu);
    
    // Fermer le menu en cliquant sur un lien
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth < 1025) {
                closeMenu();
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
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isMenuOpen) {
            closeMenu();
        }
    });
}

// ========================================
// INITIALISATION DU BOUTON DE TRADUCTION COMPLÈTE
// ========================================
function initTranslateButton() {
    const translateButton = document.querySelector('.translate-button');
    const translateCurrent = document.querySelector('.translate-current');
    
    if (!translateButton || !translateCurrent) {
        return;
    }
    
    // Apparition avec les mêmes conditions que back-to-top
    window.addEventListener('scroll', function() {
        if (window.scrollY > 500) {
            translateButton.classList.add('visible');
        } else {
            translateButton.classList.remove('visible');
        }
    });
    
    // Mettre à jour l'affichage initial
    updateTranslateButton();
    
    // Gestion du clic pour basculer la langue
    translateButton.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Empêcher les clics multiples pendant l'animation
        if (translateButton.classList.contains('changing')) return;
        
        const newLang = currentLanguage === 'fr' ? 'en' : 'fr';
        
        // Animation de changement
        translateButton.classList.add('changing');
        showGlobalLoader();
        
        setTimeout(() => {
            // TRADUCTION COMPLÈTE
            translateSite(newLang);
            currentLanguage = newLang;
            updateTranslateButton();
            
            // Sauvegarder la préférence
            localStorage.setItem('preferredLanguage', newLang);
            
            hideGlobalLoader();
            
            setTimeout(() => {
                translateButton.classList.remove('changing');
            }, 100);
        }, 300);
    });
    
    // FORCER LE FRANÇAIS AU DÉMARRAGE - IGNORER LA LANGUE SAUVEGARDÉE
	// Le site se charge TOUJOURS en français, peu importe les préférences sauvegardées
	setTimeout(() => {
		// S'assurer que le site est en français
		if (currentLanguage !== 'fr') {
			currentLanguage = 'fr';
			translateSite('fr');
		}
		updateTranslateButton();
	}, 500);
}

// Fonction pour mettre à jour l'affichage du bouton - VERSION INVERSÉE
function updateTranslateButton() {
    const translateCurrent = document.querySelector('.translate-current');
    if (translateCurrent) {
        // Afficher la langue OPPOSÉE (vers laquelle on peut basculer)
        const nextLang = currentLanguage === 'fr' ? 'en' : 'fr';
        translateCurrent.textContent = nextLang.toUpperCase();
    }
}

// Initialisation du bouton "retour à l'exploration" - AVEC ANIMATION DYNAMIQUE
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
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.5 && !expeditionVisited) {
                expeditionVisited = true;

                returnBtn.style.opacity = '1';
                returnBtn.style.pointerEvents = 'all';
                returnBtn.style.transform = 'translateY(0)';
                returnBtn.classList.add('visible');
            }
        });
    }, {
        threshold: 0.5,
        rootMargin: '-100px 0px -100px 0px'
    });
    
    observer.observe(expeditionSection);

    // NOUVEAU: Animation dynamique quand on est en haut du site
    window.addEventListener('scroll', function() {
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
    returnBtn.addEventListener('click', function(e) {
        e.preventDefault();
        // Animation de clic
        returnBtn.style.transform = 'scale(0.95)';

        // Redirection après courte animation
        setTimeout(() => {
            window.location.href = '../';
        }, 150);
    });
    
}

// Initialisation du loader global
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
    
    window.showGlobalLoader = function() {
        globalLoader.classList.add('active');
    };
    
    window.hideGlobalLoader = function() {
        globalLoader.classList.remove('active');
    };
    
    // Loader pour les navigations internes
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            showGlobalLoader();
            setTimeout(() => {
                hideGlobalLoader();
            }, 800);
        });
    });
    
    window.addEventListener('beforeunload', function() {
        showGlobalLoader();
    });
}

// Initialisation de la galerie - Version complète avec support tactile
function initGallery() {
    loadGalleryImages();

    const galleryTrack = document.querySelector('.gallery-track');
    const dots = document.querySelectorAll('.gallery-dot');
    const prevBtn = document.querySelector('.gallery-prev');
    const nextBtn = document.querySelector('.gallery-next');
    let isFullscreenMode = false;
    let autoplayInterval;

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

    const fsImage = fullscreenMode.querySelector('.fullscreen-image');

    // Fonction pour afficher une slide spécifique
    function showSlide(index) {
        const slides = document.querySelectorAll('.gallery-slide');
        if (!slides.length) return;

        if (index >= slides.length) index = 0;
        if (index < 0) index = slides.length - 1;

        slides.forEach(slide => {
            slide.classList.remove('active');
            slide.classList.remove('transitioning');
        });

        slides[index].classList.add('active');
        slides[index].classList.add('transitioning');

        const updatedDots = document.querySelectorAll('.gallery-dot');
        updatedDots.forEach(dot => dot.classList.remove('active'));
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

// Chargement dynamique des images de la galerie
function loadGalleryImages() {
    const galleryTrack = document.querySelector('.gallery-track');
    const galleryDots = document.querySelector('.gallery-dots');
    
    if (!galleryTrack || !galleryDots) return;
    
    galleryTrack.innerHTML = '';
    galleryDots.innerHTML = '';
    
    const numImages = 10;
    
    for (let i = 1; i <= numImages; i++) {
        const index = i.toString().padStart(2, '0');
        
        const slide = document.createElement('div');
        slide.className = 'gallery-slide' + (i === 1 ? ' active' : '');
        
        const imageContainer = document.createElement('div');
        imageContainer.className = 'gallery-image-container';
        
        const image = document.createElement('img');
        image.src = `images/img-photo-gallerie-${index}.jpeg`;
        image.alt = `Galerie photo ${i}`;
        image.className = 'gallery-image';
        
        image.onerror = function() {
            if (i === 1) {
                image.src = 'images/vaquita.jpeg';
            } else {
                slide.remove();
                const correspondingDot = document.querySelector(`.gallery-dot[data-index="${i-1}"]`);
                if (correspondingDot) correspondingDot.remove();
            }
        };
        
        imageContainer.appendChild(image);
        
        // Ajouter les informations sur mobile/tablette
        if (window.innerWidth < 1025) {
            const imageInfo = document.createElement('div');
            imageInfo.className = 'image-info';
            imageInfo.innerHTML = `
                <h3>Image ${i}</h3>
                <p>Description de l'image ${i} de la galerie.</p>
            `;
            slide.appendChild(imageContainer);
            slide.appendChild(imageInfo);
        } else {
            slide.appendChild(imageContainer);
        }
        
        galleryTrack.appendChild(slide);
        
        const dot = document.createElement('span');
        dot.className = 'gallery-dot' + (i === 1 ? ' active' : '');
        dot.setAttribute('data-index', (i - 1).toString());
        galleryDots.appendChild(dot);
    }
}

// Clic sur le logo pour retourner en haut
function initLogoClick() {
    const logo = document.querySelector('.fixed-logo');
    if (logo) {
        logo.addEventListener('click', function(e) {
            e.preventDefault();
            showGlobalLoader();
            
            document.body.classList.add('scrolling-up');
            
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            
            setTimeout(() => {
                document.body.classList.remove('scrolling-up');
                hideGlobalLoader();
            }, 500);
        });
    }
}

// Gestion du menu latéral - Adapté desktop/mobile
function initSideNav() {
    const sideNav = document.querySelector('.side-nav');
    const heroSection = document.querySelector('#hero');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = [];
    
    navLinks.forEach(link => {
        const targetId = link.getAttribute('href');
        const section = document.querySelector(targetId);
        if (section) {
            sections.push({
                id: targetId,
                element: section,
                link: link
            });
        }
    });
    
    window.addEventListener('scroll', function() {
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
    
    sections.forEach(section => {
        const sectionTop = section.element.offsetTop;
        const sectionBottom = sectionTop + section.element.offsetHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            
            section.link.classList.add('active');
        }
    });
}

// Bouton de retour en haut - Adapté tactile
function initBackToTop() {
    const backToTopBtn = document.querySelector('.back-to-top');
    
    if (!backToTopBtn) return;
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 500) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });
    
    backToTopBtn.addEventListener('click', function(e) {
        e.preventDefault();
        showGlobalLoader();
        
        document.body.classList.add('scrolling-up');
        
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        setTimeout(() => {
            document.body.classList.remove('scrolling-up');
            hideGlobalLoader();
        }, 500);
    });
}

// Gestion des vidéos - Optimisée tactile avec contrôles intelligents
function fixVideos() {
    // Vidéo de texture (hero) - SYSTÈME UNIQUE
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
                p.then(() => { isPlaying = false; })
                 .catch(() => { isPlaying = false; });
            } else {
                isPlaying = false;
            }
        }

        function startGlobeVideo() {
            globeVideo.style.opacity = '1';
            globeVideo.style.transition = 'opacity 1s ease';

            if (globeVideo.readyState >= 3) {
                playOnce();
            } else {
                globeVideo.addEventListener('canplay', () => playOnce(), { once: true });
            }
        }

        window.startGlobeVideoAfterLoading = startGlobeVideo;

        // Only restart on ended (loop should handle this, but as fallback)
        globeVideo.addEventListener('ended', function() {
            this.currentTime = 0;
            playOnce();
        });

        // Start the globe video immediately after setup
        startGlobeVideo();
    }

    // Vidéo du documentaire - AVEC CONTRÔLES INTELLIGENTS
    docVideo = document.querySelector('.main-video');
    videoContainer = document.querySelector('.video-container');
    playButton = document.querySelector('.video-play-button');
    
    if (docVideo && playButton) {
        // Masquer les contrôles par défaut
        docVideo.controls = false;
        
        // Afficher les contrôles au survol sur desktop seulement
        if (window.innerWidth >= 1025 && !('ontouchstart' in window)) {
            videoContainer.addEventListener('mouseenter', function() {
                docVideo.controls = true;
                if (docVideo.paused) {
                    playButton.style.opacity = '1';
                }
            });
            
            videoContainer.addEventListener('mouseleave', function() {
                docVideo.controls = false;
                if (docVideo.paused) {
                    playButton.style.opacity = '0';
                }
            });
        }
        
        // Gestion du bouton play avec contrôles intelligents
        playButton.addEventListener('click', function(e) {
            e.preventDefault();
            showGlobalLoader();
            
            if (docVideo.paused) {
                docVideo.play()
                    .then(() => {
                        hideGlobalLoader();
                        playButton.innerHTML = `
                            <svg viewBox="0 0 24 24">
                                <path d="M14,19H18V5H14M6,19H10V5H6V19Z"></path>
                            </svg>
                        `;
                        
                        // Gérer les classes et contrôles
                        videoContainer.classList.add('playing');
                        videoContainer.classList.remove('paused', 'hide-after-pause');
                        docVideo.controls = true;
                        
                        // Masquer le bouton play
                        setTimeout(() => {
                            playButton.style.opacity = '0';
                        }, 500);
                        
                        // Masquer les contrôles après 3 secondes
                        hideControlsAfterDelay(3000);
                    })
                    .catch(error => {
                        hideGlobalLoader();
                    });
            } else {
                hideGlobalLoader();
                docVideo.pause();
                playButton.innerHTML = `
                    <svg viewBox="0 0 24 24">
                        <path d="M8,5.14V19.14L19,12.14L8,5.14Z"></path>
                    </svg>
                `;
                
                // Gérer les classes
                videoContainer.classList.remove('playing', 'auto-hide');
                videoContainer.classList.add('paused');
                playButton.style.opacity = '1';
                
                // Afficher temporairement les contrôles puis les masquer
                docVideo.controls = true;
                hideControlsAfterPause(5000);
            }
        });

        // Gestionnaire pour l'événement pause
        docVideo.addEventListener('pause', function() {
            clearTimeout(controlsHideTimeout);
            videoContainer.classList.remove('playing', 'auto-hide');
            videoContainer.classList.add('paused');
            
            playButton.innerHTML = `
                <svg viewBox="0 0 24 24">
                    <path d="M8,5.14V19.14L19,12.14L8,5.14Z"></path>
                </svg>
            `;
            playButton.style.opacity = '1';
            
            // Afficher les contrôles temporairement
            docVideo.controls = true;
            videoContainer.classList.remove('hide-after-pause');
            
            // Les masquer après 5 secondes
            hideControlsAfterPause(5000);
        });

        // Gestionnaire pour l'événement play
        docVideo.addEventListener('play', function() {
            clearTimeout(pauseHideTimeout);
            videoContainer.classList.remove('paused', 'hide-after-pause');
            videoContainer.classList.add('playing');
            
            // Afficher les contrôles puis les masquer après 3 secondes
            docVideo.controls = true;
            videoContainer.classList.remove('auto-hide');
            hideControlsAfterDelay(3000);
        });

        // Réafficher temporairement les contrôles au mouvement de souris/touch
        videoContainer.addEventListener('mousemove', showControlsTemporarily);
        videoContainer.addEventListener('touchstart', showControlsTemporarily);

        // Gestionnaire pour le clic sur la vidéo
        docVideo.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (this.paused) {
                // Si en pause, reprendre la lecture
                this.play();
            } else {
                // Si en lecture, mettre en pause
                this.pause();
            }
        });

        // Nettoyer les timers quand la vidéo se termine
        docVideo.addEventListener('ended', function() {
            clearTimeout(controlsHideTimeout);
            clearTimeout(pauseHideTimeout);
            videoContainer.classList.remove('playing', 'paused', 'auto-hide', 'hide-after-pause');
            docVideo.controls = false;
            playButton.style.opacity = '1';
        });
        
        docVideo.addEventListener('loadedmetadata', function() {
            if (docVideo.paused) {
                videoContainer.classList.remove('playing');
                playButton.innerHTML = `
                    <svg viewBox="0 0 24 24">
                        <path d="M8,5.14V19.14L19,12.14L8,5.14Z"></path>
                    </svg>
                `;
            }
        });
        
        // Bouton doc pour lancer la vidéo - AVEC CONTRÔLES INTELLIGENTS
        const docButton = document.querySelector('.doc-button');
        if (docButton) {
            docButton.addEventListener('click', function(e) {
                e.preventDefault();
                showGlobalLoader();
                
                const videoSection = document.querySelector('.video-section');
                if (videoSection) {
                    videoSection.scrollIntoView({ behavior: 'smooth' });
                    setTimeout(() => {
                        docVideo.play().then(() => {
                            hideGlobalLoader();
                            videoContainer.classList.add('playing');
                            videoContainer.classList.remove('paused', 'hide-after-pause');
                            docVideo.controls = true;
                            
                            playButton.innerHTML = `
                                <svg viewBox="0 0 24 24">
                                    <path d="M14,19H18V5H14M6,19H10V5H6V19Z"></path>
                                </svg>
                            `;
                            
                            setTimeout(() => {
                                playButton.style.opacity = '0';
                            }, 500);
                            
                            // Masquer les contrôles après 3 secondes
                            hideControlsAfterDelay(3000);
                        }).catch(err => {
                            hideGlobalLoader();
                        });
                    }, 1000);
                }
            });
        }
    }
}

// Boutons de partage - Adaptés tactile
function initShareButtons() {
    const shareButton = document.querySelector('.share-button');
    const shareIcon = document.querySelector('.share-icon');
    const shareOptions = document.querySelector('.share-options');
    const shareOptionLinks = document.querySelectorAll('.share-option');
    
    if (!shareButton || !shareIcon || !shareOptions) return;
    
    let isOverShareArea = false;
    
    // Apparition avec les mêmes conditions que back-to-top
    window.addEventListener('scroll', function() {
        if (window.scrollY > 500) {
            shareButton.classList.add('visible');
        } else {
            shareButton.classList.remove('visible');
        }
    });
    
    // Gestion différente selon le type d'appareil
    if ('ontouchstart' in window) {
        // Sur tactile, toggle au clic
        shareIcon.addEventListener('click', function(e) {
            e.preventDefault();
            shareOptions.classList.toggle('visible');
        });
        
        // Fermer en cliquant ailleurs
        document.addEventListener('click', function(e) {
            if (!shareButton.contains(e.target)) {
                shareOptions.classList.remove('visible');
            }
        });
    } else {
        // Sur desktop, au survol
        shareButton.addEventListener('mouseenter', function() {
            isOverShareArea = true;
            shareOptions.classList.add('visible');
        });
        
        shareButton.addEventListener('mouseleave', function() {
            isOverShareArea = false;
            setTimeout(() => {
                if (!isOverShareArea) {
                    shareOptions.classList.remove('visible');
                }
            }, 300);
        });
        
        shareOptions.addEventListener('mouseenter', function() {
            isOverShareArea = true;
        });
        
        shareOptions.addEventListener('mouseleave', function() {
            isOverShareArea = false;
            setTimeout(() => {
                if (!isOverShareArea) {
                    shareOptions.classList.remove('visible');
                }
            }, 300);
        });
    }
    
    // Gestion du partage
    shareOptionLinks.forEach(option => {
        option.addEventListener('click', function(e) {
            e.preventDefault();
            
            showGlobalLoader();
            
            const platform = this.getAttribute('data-platform');
            const url = encodeURIComponent(window.location.href);
            const title = encodeURIComponent(document.title);
            
            let shareUrl;
            
            switch(platform) {
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
                        alert('Lien copié ! Collez-le dans votre post Instagram.');
                    } else {
                        alert('Copiez le lien manuellement pour le partager sur Instagram: ' + window.location.href);
                    }
                    hideGlobalLoader();
                    return;
            }
            
            if (shareUrl) {
                window.open(shareUrl, '_blank', 'width=600,height=400');
                setTimeout(() => {
                    hideGlobalLoader();
                }, 1000);
            } else {
                hideGlobalLoader();
            }
        });
    });
}

// Animation des liens de navigation
function animateNavLinks() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            showGlobalLoader();
            
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Fermer le menu mobile si ouvert
                if (window.innerWidth < 1025 && isMenuOpen) {
                    closeMenu();
                }
                
                const offsetTop = targetElement.offsetTop - (window.innerWidth < 768 ? 80 : 0);
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                setTimeout(() => {
                    hideGlobalLoader();
                }, 800);
            } else {
                hideGlobalLoader();
            }
        });
    });
}

// Animations au défilement - Optimisées performances mobile
function initAnimations() {
    const elementsToAnimate = document.querySelectorAll('[data-animation], .video-section, .expedition-image, .stat-card, .scientific-image-wrapper, .resource-card, .credits-col, .section-title, .description');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.15
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
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
    
    elementsToAnimate.forEach(element => {
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
    
    document.addEventListener("scroll", function() {
        if (!ticking) {
            requestAnimationFrame(updateElements);
            ticking = true;
        }
    });
}

// Curseur personnalisé UNIQUEMENT sur desktop avec souris
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
            const isImage = element.tagName === 'IMG' || element.closest('img') || 
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
            } else {
                isOverImage = false;
                cursor.style.width = '30px';
                cursor.style.height = '30px';
                follower.style.width = '40px';
                follower.style.height = '40px';
            }
        }
    });
    
    const interactiveElements = document.querySelectorAll('a, button, .nav-link, .share-icon, .back-to-top, .video-play-button, .gallery-arrow, .gallery-dot, .gallery-image-container, .return-exploration');
    
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            if (!isOverImage) {
                cursor.classList.add('hover');
                follower.classList.add('hover');
            }
        });
        
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
            follower.classList.remove('hover');
        });
    });
}

// Vérifier les éléments visibles
function checkVisibleElements() {
    const elementsToCheck = document.querySelectorAll('.will-change, [data-animation]:not(.visible), .video-section:not(.visible), .expedition-image:not(.visible), .stat-card:not(.visible), .scientific-image-wrapper:not(.visible), .resource-card:not(.visible), .credits-col:not(.visible), .section-title:not(.visible), .description:not(.visible)');
    
    elementsToCheck.forEach(element => {
        if (isElementInViewport(element)) {
            element.classList.add('visible');
            element.classList.remove('will-change');
        }
    });
}

// Vérifier si un élément est dans la zone visible
function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top < window.innerHeight * 0.85 && 
        rect.bottom > 0
    );
}

// Prévenir le zoom sur double-tap (iOS)
let lastTouchEnd = 0;
document.addEventListener('touchend', function(event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Gestion des changements d'orientation
window.addEventListener('orientationchange', function() {
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
window.addEventListener('load', function() {
    const loader = document.querySelector('.loader');
    if (loader) {
        loader.style.display = 'none';
    }
});

// REDIRECTION TOUCHE ENTRÉE - Redirection vers la page collection
document.addEventListener('keydown', function(e) {
    // Vérifier si c'est la touche Entrée (keyCode 13 ou key === 'Enter')
    if (e.key === 'Enter' || e.keyCode === 13) {
        // Empêcher le comportement par défaut
        e.preventDefault();
        
        // Afficher le loader pour une transition fluide
        if (typeof showGlobalLoader === 'function') {
            showGlobalLoader();
        }
        
        // Redirection immédiate vers votre page collection
        setTimeout(() => {
            window.location.href = '../into-the-okavango/';
        }, 200);
    }
});

