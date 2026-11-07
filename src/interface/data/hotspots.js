// Données des points d'intérêt pour Mondes Immergés
// Version enrichie avec métadonnées scientifiques et contenu multimédia

export const hotspots = [
    {
        id: 'grande-barriere',
        title: 'Grande Barrière de Corail',
        position: {
            lat: -18.2871,
            lng: 147.6992,
        },
        description: `
            <p>La Grande Barrière de Corail représente le plus grand récif corallien du monde. Située au large du Queensland en Australie, elle s'étend sur plus de 2 300 kilomètres et abrite une biodiversité exceptionnelle avec plus de 1 500 espèces de poissons et 400 types de coraux.</p>
            <p>Ce site classé au patrimoine mondial de l'UNESCO est aujourd'hui gravement menacé par le changement climatique, la pollution et la surpêche. Les scientifiques observent un blanchissement massif des coraux dû à l'augmentation de la température des océans, avec cinq épisodes majeurs depuis 1998, dont trois entre 2016 et 2020.</p>
        `,
        scientificData: {
            depth: { min: 15, max: 45, avg: 35 },
            temperature: { min: 23.5, max: 28.5, avg: 25.7 },
            biodiversity: 'Exceptionnelle',
            conservationStatus: 'En danger critique',
            area: '348,000 km²',
            discoveryYear: 1770,
            phValue: { min: 8.1, max: 8.4 },
            salinity: '34-35‰',
        },
        detailedInfo: `
            <p>La Grande Barrière de Corail est le plus vaste écosystème corallien du monde. Elle abrite plus de 1 500 espèces de poissons, 4 000 types de mollusques, 240 espèces d'oiseaux et de nombreux mammifères marins en danger. Le réchauffement océanique a provoqué cinq épisodes massifs de blanchissement des coraux depuis 1998, dont trois entre 2016 et 2020, affectant gravement cet écosystème unique.</p>
            <p>Selon les dernières études, plus de 50% des coraux de la Grande Barrière ont été perdus depuis 1995, principalement en raison du réchauffement des océans. La hausse des températures provoque l'expulsion des algues symbiotiques qui donnent aux coraux leur couleur et leur principale source d'énergie, entraînant leur blanchissement et, souvent, leur mort.</p>
            <p>Le site est également menacé par l'acidification des océans, qui réduit la capacité des coraux à construire leurs squelettes calcaires, les rendant plus vulnérables aux tempêtes et aux prédateurs. Les scientifiques estiment que si la tendance actuelle se poursuit, nous pourrions assister à la disparition de la majorité des récifs coralliens du monde d'ici 2050.</p>
        `,
        evolutionData: [
            { year: 2000, healthIndex: 0.85 },
            { year: 2005, healthIndex: 0.79 },
            { year: 2010, healthIndex: 0.72 },
            { year: 2015, healthIndex: 0.61 },
            { year: 2020, healthIndex: 0.47 },
            { year: 2025, healthIndex: 0.43, projected: true },
        ],
        sources: [
            {
                title: 'État des récifs coralliens 2024 (UNESCO)',
                url: 'https://whc.unesco.org/en/list/154/',
            },
            {
                title: 'Études sur le blanchissement des coraux (AIMS)',
                url: 'https://www.aims.gov.au/research-topics/coral-reefs',
            },
            {
                title: 'Stratégies de conservation marine (GBRMPA)',
                url: 'https://www.gbrmpa.gov.au/',
            },
        ],
    },
    {
        id: 'abysses',
        title: 'Les Abysses',
        position: {
            lat: -10.9638,
            lng: -176.6333,
        },
        description: `
            <p>Les abysses constituent les zones les plus profondes des océans, situées entre 3 000 et 11 000 mètres de profondeur. Ces environnements extrêmes, caractérisés par une pression écrasante, l'absence de lumière et des températures avoisinant 2°C, abritent pourtant une vie extraordinaire.</p>
            <p>Les créatures abyssales ont développé des adaptations fascinantes : organes bioluminescents, corps transparents, dents démesurées ou encore capacité à résister à des pressions plusieurs centaines de fois supérieures à celle de la surface. Notre connaissance de ces écosystèmes reste limitée, avec moins de 5% des fonds marins ayant été explorés à ce jour.</p>
        `,
        scientificData: {
            depth: { min: 3000, max: 11000, avg: 5000 },
            temperature: { min: 1.5, max: 3.0, avg: 2.3 },
            biodiversity: 'Rare et spécialisée',
            conservationStatus: 'Zone peu explorée',
            pressure: "Jusqu'à 1100 atmosphères",
            lightPenetration: 'Nulle',
            oxygenLevel: 'Très faible',
            microbialDensity: 'Élevée dans certaines zones hydrothermales',
        },
        detailedInfo: `
            <p>Les abysses, zones des océans situées entre 3 000 et 11 000 mètres de profondeur, sont parmi les environnements les moins explorés de notre planète. La fosse des Mariannes, point le plus profond de la Terre (10 994 mètres), abrite une biodiversité étonnamment riche malgré une pression 1 100 fois supérieure à celle du niveau de la mer. Les créatures abyssales ont développé des adaptations uniques comme la bioluminescence pour communiquer et attirer leurs proies dans l'obscurité totale.</p>
            <p>Ces écosystèmes fonctionnent différemment des environnements de surface. Sans photosynthèse, ils s'appuient sur la "neige marine" (particules organiques tombant des eaux supérieures) et sur les sources hydrothermales comme sources d'énergie. Ces cheminées, découvertes en 1977, ont révolutionné notre compréhension de la vie sur Terre, montrant qu'elle peut exister sans lumière solaire, basée sur la chimiosynthèse.</p>
            <p>Les abysses abritent une biodiversité unique : poissons comme le dragon des mers ou le poisson-ogre, calmars géants, vers tubicoles géants, et diverses espèces bioluminescentes. Paradoxalement, bien que très hostiles à la vie humaine, ces environnements font preuve d'une remarquable stabilité climatique, à l'abri des variations affectant la surface des océans, ce qui en fait des témoins privilégiés de l'évolution.</p>
        `,
        evolutionData: [
            { year: 2000, discoveryIndex: 0.12 },
            { year: 2005, discoveryIndex: 0.15 },
            { year: 2010, discoveryIndex: 0.19 },
            { year: 2015, discoveryIndex: 0.25 },
            { year: 2020, discoveryIndex: 0.32 },
            { year: 2025, discoveryIndex: 0.38, projected: true },
        ],
        sources: [
            {
                title: 'Exploration des grands fonds (NOAA)',
                url: 'https://oceanexplorer.noaa.gov/explorations/deepwater-exploration.html',
            },
            {
                title: 'Biodiversité des abysses (DOSI)',
                url: 'https://www.dosi-project.org/',
            },
            {
                title: 'Adaptations aux milieux extrêmes (MBARI)',
                url: 'https://www.mbari.org/science/seafloor-processes/',
            },
        ],
    },
    {
        id: 'arctique',
        title: 'Océan Arctique',
        position: {
            lat: 78.9634,
            lng: 12.5847,
        },
        description: `
            <p>L'océan Arctique, en grande partie recouvert de glace, constitue un écosystème unique abritant des espèces parfaitement adaptées aux conditions extrêmes, comme l'ours polaire, le phoque annelé et le narval.</p>
            <p>Le réchauffement climatique affecte cet environnement deux fois plus rapidement que le reste de la planète. La fonte de la banquise estivale, qui a diminué de plus de 40% depuis 1979, transforme radicalement les habitats et menace la survie de nombreuses espèces qui dépendent de la glace pour leur alimentation et leur reproduction.</p>
        `,
        scientificData: {
            temperature: { min: -1.8, max: 3.0, avg: -0.5 },
            iceExtent: { winter: '15 millions km²', summer: '5 millions km²' },
            biodiversity: 'Modérée',
            conservationStatus: 'Vulnérable',
            depth: { max: 5567, avg: 1038 },
            salinity: '30-34‰',
            iceThickness: { min: 0.5, max: 4, avg: 1.8 },
            iceRetreatRate: '13% par décennie',
        },
        detailedInfo: `
            <p>L'Océan Arctique subit le réchauffement le plus rapide de la planète, avec des températures augmentant à un rythme deux fois plus élevé que la moyenne mondiale. La banquise estivale a diminué de 40% depuis 1979, ce qui modifie radicalement l'écosystème régional. Des espèces tempérées migrent vers le nord, entrant en compétition avec les espèces arctiques comme le phoque annelé, le narval et l'ours polaire, dont la survie dépend directement de la glace de mer.</p>
            <p>L'effet d'amplification arctique, causé par la réduction de l'albédo (réflexion de la lumière solaire) lorsque la glace blanche est remplacée par l'eau sombre qui absorbe la chaleur, accélère le réchauffement dans un cycle de rétroaction positive. Les mesures de l'épaisseur de la glace montrent également une diminution drastique, avec une perte de 65% depuis 1975.</p>
            <p>Cette transformation a des conséquences planétaires : modification des courants océaniques, perturbation de la circulation atmosphérique globale et libération potentielle de grandes quantités de méthane piégé dans le pergélisol. Les prévisions actuelles suggèrent que l'océan Arctique pourrait être pratiquement libre de glace en été dès les années 2030-2040, soit quelques décennies plus tôt que ce qui était prévu par les modèles climatiques précédents.</p>
        `,
        evolutionData: [
            { year: 1980, iceExtent: 7.85 },
            { year: 1990, iceExtent: 6.74 },
            { year: 2000, iceExtent: 6.32 },
            { year: 2010, iceExtent: 4.9 },
            { year: 2020, iceExtent: 3.74 },
            { year: 2025, iceExtent: 3.2, projected: true },
        ],
        sources: [
            {
                title: 'Évolution de la banquise arctique (NSIDC)',
                url: 'https://nsidc.org/arcticseaicenews/',
            },
            {
                title: "Impact du changement climatique sur l'écosystème arctique (WWF)",
                url: 'https://arcticwwf.org/work/climate/',
            },
            {
                title: "Rapport sur l'état de l'Arctique (NOAA)",
                url: 'https://arctic.noaa.gov/Report-Card',
            },
        ],
    },
    {
        id: 'plastique',
        title: 'Pollution Plastique',
        position: {
            lat: 28.3699,
            lng: -144.4089,
        },
        description: `
            <p>Le "Great Pacific Garbage Patch" est une zone d'accumulation de déchets plastiques située dans le Pacifique Nord. Cette "soupe de plastique" s'étend sur une surface équivalente à trois fois la France et contient plus de 1,8 trillion de morceaux de plastique.</p>
            <p>Ces débris se fragmentent en microplastiques qui sont ingérés par la faune marine et entrent dans la chaîne alimentaire. Chaque année, plus de 8 millions de tonnes de plastique sont déversées dans les océans, avec des conséquences désastreuses pour les écosystèmes marins et potentiellement la santé humaine.</p>
        `,
        scientificData: {
            area: 'Environ 1,6 million km²',
            plasticDensity: { min: '10 kg/km²', max: '100 kg/km²' },
            biodiversity: 'Dégradée',
            conservationStatus: 'Zone fortement dégradée',
            microplasticConcentration: "Jusqu'à 1 million de particules/km²",
            originOfWaste: '80% terrestre, 20% maritime',
            degradationTime: '450 ans pour une bouteille plastique',
            annualInput: '8 millions de tonnes/an',
        },
        detailedInfo: `
            <p>Le "Great Pacific Garbage Patch" (vortex de déchets du Pacifique nord) est la plus grande des cinq zones d'accumulation de plastiques océaniques. D'une superficie de 1,6 million de km², elle contient environ 1,8 trillion de fragments plastiques. Plus de 80% de cette pollution provient d'activités terrestres. Les microplastiques (&lt;5mm) sont particulièrement dangereux car ils sont ingérés par les organismes marins et s'accumulent dans la chaîne alimentaire. On estime que d'ici 2050, il y aura plus de plastique que de poissons dans les océans (en poids).</p>
            <p>La durée de vie des plastiques en milieu marin peut atteindre plusieurs centaines d'années. Loin de se décomposer complètement, ils se fragmentent en particules de plus en plus petites qui deviennent impossibles à récupérer. Ces microplastiques sont désormais présents dans tous les océans, des fosses les plus profondes jusqu'à l'Arctique, et ont été détectés dans plus de 700 espèces marines.</p>
            <p>Les impacts sur la faune sont multiples : enchevêtrement (tortues, mammifères marins), ingestion causant des occlusions intestinales, faux sentiment de satiété, et absorption de polluants toxiques concentrés sur les microplastiques. De récentes études ont également mis en évidence la présence de microplastiques dans le poisson et les fruits de mer consommés par les humains, soulevant de sérieuses questions de santé publique. Les estimations actuelles suggèrent qu'un être humain ingère en moyenne l'équivalent d'une carte de crédit en plastique par semaine.</p>
        `,
        evolutionData: [
            { year: 1990, plasticAmount: 0.8 },
            { year: 2000, plasticAmount: 1.5 },
            { year: 2010, plasticAmount: 2.8 },
            { year: 2020, plasticAmount: 4.5 },
            { year: 2025, plasticAmount: 5.7, projected: true },
        ],
        sources: [
            {
                title: 'Étude globale sur la pollution plastique (The Ocean Cleanup)',
                url: 'https://theoceancleanup.com/great-pacific-garbage-patch/',
            },
            {
                title: 'Impact des microplastiques sur les écosystèmes marins (PNUE)',
                url: 'https://www.unep.org/explore-topics/oceans-seas/what-we-do/addressing-land-based-pollution/marine-plastics-issue',
            },
            {
                title: 'Solutions pour réduire la pollution plastique (Plastic Pollution Coalition)',
                url: 'https://www.plasticpollutioncoalition.org/',
            },
        ],
    },
    {
        id: 'triangle-corail',
        title: 'Triangle de Corail',
        position: {
            lat: 0.7893,
            lng: 127.8641,
        },
        description: `
            <p>Le Triangle de Corail, situé entre l'Indonésie, la Malaisie, les Philippines, la Papouasie-Nouvelle-Guinée, les Îles Salomon et le Timor-Leste, représente l'épicentre de la biodiversité marine mondiale.</p>
            <p>Cette région abrite 76% des espèces de coraux connues et plus de 3 000 espèces de poissons. Véritable nurserie des océans, le Triangle de Corail joue un rôle crucial dans l'équilibre des écosystèmes marins de la planète et assure la subsistance de plus de 120 millions de personnes.</p>
        `,
        scientificData: {
            area: '5,7 millions km²',
            depth: { min: 10, max: 200, avg: 53 },
            temperature: { min: 26.0, max: 29.0, avg: 27.6 },
            biodiversity: 'Exceptionnelle',
            conservationStatus: 'En danger',
            coralSpecies: '605 (76% du total mondial)',
            fishSpecies: '2228+',
            economicValue: '1,2 billion USD/an',
        },
        detailedInfo: `
            <p>Le Triangle de Corail, épicentre de la biodiversité marine mondiale, abrite 76% des espèces de coraux connues et plus de 2 200 espèces de poissons récifaux. Chaque année, 30% des espèces marines de ce triangle disparaissent à cause de la surpêche, de la pollution et du changement climatique. Cette région couvre seulement 1,5% de la surface océanique totale mais contient le plus grand nombre d'espèces marines par unité de surface au monde, ce qui en fait un véritable "Amazon de la mer".</p>
            <p>Cette richesse exceptionnelle s'explique par la rencontre de facteurs géologiques et océanographiques favorables : eaux chaudes et peu profondes, complexité topographique sous-marine, et position au carrefour des courants marins principaux. Au-delà des coraux et poissons, on y trouve 6 des 7 espèces de tortues marines, des dugongs, des requins-baleines et d'innombrables invertébrés, dont beaucoup restent à découvrir.</p>
            <p>Le Triangle de Corail fournit des services écosystémiques vitaux : barrière naturelle contre les tempêtes, puits de carbone, nurserie pour de nombreuses espèces commerciales, et source de nourriture pour plus de 120 millions de personnes. Sa valeur économique est estimée à 1,2 billion de dollars annuels. Les efforts de conservation impliquent six nations et des dizaines d'ONG, avec un objectif de protection effective de 20% des récifs d'ici 2030, contre moins de 10% actuellement.</p>
        `,
        evolutionData: [
            { year: 2000, coralCover: 0.65 },
            { year: 2005, coralCover: 0.61 },
            { year: 2010, coralCover: 0.58 },
            { year: 2015, coralCover: 0.53 },
            { year: 2020, coralCover: 0.49 },
            { year: 2025, coralCover: 0.45, projected: true },
        ],
        sources: [
            {
                title: 'Initiative pour le Triangle de Corail (CTI)',
                url: 'https://www.coraltriangleinitiative.org/',
            },
            {
                title: 'Stratégies de conservation marine (WWF)',
                url: 'https://www.worldwildlife.org/places/coral-triangle',
            },
            {
                title: 'Biodiversité du Triangle de Corail (Nature Conservancy)',
                url: 'https://www.nature.org/en-us/about-us/where-we-work/asia-pacific/asia-and-the-pacific-coral-triangle/',
            },
        ],
    },
    {
        id: 'requins',
        title: 'Requins en Danger',
        position: {
            lat: 24.287,
            lng: -77.6843,
        },
        description: `
            <p>Les requins, prédateurs au sommet de la chaîne alimentaire marine depuis plus de 400 millions d'années, sont aujourd'hui gravement menacés. Plus d'un tiers des espèces de requins et de raies sont en danger d'extinction.</p>
            <p>La surpêche, notamment pour le commerce des ailerons, et les prises accessoires sont les principales menaces. En tant que régulateurs des écosystèmes marins, leur déclin a des effets en cascade sur la santé des océans et l'équilibre des populations de poissons.</p>
        `,
        scientificData: {
            speciesCount: '500+ espèces',
            depth: { min: 0, max: 2000, avg: 150 },
            temperature: { min: 4.0, max: 26.0, avg: 21.5 },
            biodiversity: 'Élevée',
            conservationStatus: 'En danger',
            annualDeath: "~100 millions d'individus",
            evolutionTime: "450 millions d'années",
            threatLevel: '37% des espèces menacées',
        },
        detailedInfo: `
            <p>Les requins, prédateurs au sommet des écosystèmes marins depuis plus de 400 millions d'années, sont aujourd'hui gravement menacés. Chaque année, environ 100 millions de requins sont tués, principalement pour leurs ailerons. Plus de 37% des espèces de requins et de raies dans le monde sont menacées d'extinction. En tant que régulateurs des populations de proies, leur disparition a un effet en cascade sur l'ensemble de l'écosystème marin, avec des conséquences sur les stocks de poissons commerciaux et la santé des récifs coralliens.</p>
            <p>Le commerce des ailerons, notamment pour la soupe d'aileron en Asie, est particulièrement dévastateur car il implique souvent la pratique du "finning" où seuls les ailerons sont prélevés et le requin, encore vivant, est rejeté à la mer où il meurt lentement. Bien que des réglementations existent dans certains pays, le commerce illégal reste répandu.</p>
            <p>Les requins sont particulièrement vulnérables à la surpêche en raison de leur maturité sexuelle tardive et de leur faible taux de reproduction. Une femelle de requin blanc, par exemple, n'atteint sa maturité sexuelle qu'à l'âge de 33 ans et ne produit qu'un petit nombre de jeunes. Cette biologie "lente" signifie que les populations mettent des décennies à se reconstituer après avoir été décimées. Des zones marines protégées dédiées, comme le sanctuaire de requins des Bahamas, montrent qu'une protection efficace peut permettre aux populations de se maintenir, tout en générant des revenus importants grâce à l'écotourisme.</p>
        `,
        evolutionData: [
            { year: 1970, sharkPopulation: 1.0 },
            { year: 1990, sharkPopulation: 0.8 },
            { year: 2000, sharkPopulation: 0.68 },
            { year: 2010, sharkPopulation: 0.55 },
            { year: 2020, sharkPopulation: 0.44 },
            { year: 2025, sharkPopulation: 0.39, projected: true },
        ],
        sources: [
            {
                title: 'État des populations de requins (IUCN Shark Specialist Group)',
                url: 'https://www.iucnssg.org/',
            },
            {
                title: 'Impact de la disparition des grands prédateurs marins (Shark Trust)',
                url: 'https://www.sharktrust.org/',
            },
            {
                title: 'Sanctuaires de requins et protection (PEW Charitable Trusts)',
                url: 'https://www.pewtrusts.org/en/projects/global-shark-conservation',
            },
        ],
    },
];

/**
 * Récupère un hotspot par son ID
 * @param {string} id - Identifiant du hotspot
 * @returns {Object|null} - Hotspot correspondant ou null si non trouvé
 */
export function getHotspotById(id) {
    return hotspots.find((hotspot) => hotspot.id === id) || null;
}

/**
 * Récupère tous les hotspots d'une région
 * @param {string} region - Nom de la région (océan, latitude)
 * @returns {Array} - Tableau de hotspots correspondants
 */
export function getHotspotsByRegion(region) {
    // Correspondance des régions avec les plages de latitude
    const regionMapping = {
        arctic: [66, 90], // Arctique
        north: [23, 66], // Nord (tempéré)
        tropical: [-23, 23], // Tropical
        south: [-66, -23], // Sud (tempéré)
        antarctic: [-90, -66], // Antarctique
    };

    // Si région par nom d'océan
    if (!regionMapping[region.toLowerCase()]) {
        return hotspots.filter((hotspot) => hotspot.description.toLowerCase().includes(region.toLowerCase()));
    }

    // Si région par latitude
    const [minLat, maxLat] = regionMapping[region.toLowerCase()];
    return hotspots.filter((hotspot) => hotspot.position.lat >= minLat && hotspot.position.lat <= maxLat);
}

/**
 * Récupère les hotspots en fonction de leur statut de conservation
 * @param {string} status - Statut de conservation
 * @returns {Array} - Tableau de hotspots correspondants
 */
export function getHotspotsByConservationStatus(status) {
    return hotspots.filter(
        (hotspot) =>
            hotspot.scientificData &&
            hotspot.scientificData.conservationStatus &&
            hotspot.scientificData.conservationStatus.toLowerCase().includes(status.toLowerCase()),
    );
}

/**
 * Calcule la distance entre deux hotspots en kilomètres
 * @param {string} id1 - ID du premier hotspot
 * @param {string} id2 - ID du deuxième hotspot
 * @returns {number} - Distance en kilomètres
 */
export function calculateDistanceBetweenHotspots(id1, id2) {
    const hotspot1 = getHotspotById(id1);
    const hotspot2 = getHotspotById(id2);

    if (!hotspot1 || !hotspot2) return -1;

    return calculateDistance(
        hotspot1.position.lat,
        hotspot1.position.lng,
        hotspot2.position.lat,
        hotspot2.position.lng,
    );
}

/**
 * Calcule la distance entre deux points géographiques (formule de Haversine)
 * @param {number} lat1 - Latitude du premier point
 * @param {number} lon1 - Longitude du premier point
 * @param {number} lat2 - Latitude du deuxième point
 * @param {number} lon2 - Longitude du deuxième point
 * @returns {number} - Distance en kilomètres
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Rayon de la Terre en km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
