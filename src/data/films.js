// Les huit documentaires de National Geographic Documentary Films présentés sur le globe.
// Faits, équipes, photos et liens : pages officielles films.nationalgeographic.com (consultées en 2026).
// Textes rédigés et traduits pour ce projet ; photos servies par le CDN de National Geographic.

const CDN = 'https://lumiere-a.akamaihd.net/v1/images/';

/** URL d'une image National Geographic redimensionnée par leur CDN. */
export const image = (file, width = 1600) => `${CDN}${file}?width=${width}`;

export const SOURCE = 'https://films.nationalgeographic.com/';

export const FILMS = [
    {
        slug: 'into-the-okavango',
        title: 'Into the Okavango',
        year: 2018,
        date: '22 avril 2018',
        director: 'Neil Gelinas',
        place: 'Delta de l’Okavango',
        country: 'Angola · Namibie · Botswana',
        lat: -19.3,
        lng: 22.9,
        world: 'Eau douce',
        accent: '#f2b33d',
        pitch: 'Quatre mois en pirogue, des sources angolaises jusqu’au delta.',
        synopsis: [
            'Le bassin de l’Okavango fait vivre près d’un million de personnes, la plus grande population d’éléphants d’Afrique, des lions, des guépards et des centaines d’espèces d’oiseaux. Mais cette oasis encore intacte subit une pression humaine croissante.',
            'Le film suit une équipe d’explorateurs pendant une expédition de quatre mois et 2 400 kilomètres, à travers trois pays, pour protéger les rivières qui nourrissent le delta, l’une des dernières grandes zones humides sauvages de la planète.',
        ],
        facts: [
            { value: '1 million', label: 'de personnes vivent de l’eau du bassin' },
            { value: '2 400 km', label: 'parcourus en mokoro, la pirogue locale' },
            { value: '95 %', label: 'de l’eau du delta vient des hauts plateaux angolais' },
        ],
        poster: 'docfilmswebsite_1080x1600_okavango_3a6c3ca3.jpeg', // affiche officielle, portrait 2:3
        hero: 'intotheokavango_hero_e8b99097.jpeg',
        thumb: ['intotheokavango_ngm_42_1be68c4f.jpeg', '45% 50%'], // vignette du globe, choisie à l'œil
        gallery: [
            [
                'intotheokavango_ngm_42_1be68c4f.jpeg',
                'Un groupe d’éléphants traverse les eaux de crue annuelles, descendues des hauts plateaux angolais.',
                'Cory Richards',
            ],
            [
                'intotheokavango_ngm_47_e543ecc8.jpeg',
                'Près de Huambo, l’équipe met à l’eau pour la partie fluviale de l’expédition.',
                'Pete Muller',
            ],
            [
                'intotheokavango_ngm_01_3c703783.jpeg',
                'Un incendie embrase la plaine inondable face au bivouac, sur la rivière Cuito.',
                'James Kydd',
            ],
            [
                'intotheokavango_ngm_39_03f630f4.jpeg',
                'Des tantales ibis survolent l’Okavango.',
                'Cory Richards',
            ],
            [
                'intotheokavango_ngm_19_57bbee3f.jpeg',
                'Steve Boyes et Neil Gelinas chassent des nuées d’abeilles après une longue journée sur l’eau.',
                'Cory Richards',
            ],
            [
                'intotheokavango_ngm_40_973662f6.jpeg',
                'Une famille de babouins sur une termitière, aux dernières lueurs du jour.',
                'Cory Richards',
            ],
        ],
        people: [
            {
                name: 'Steve Boyes',
                role: 'Explorateur National Geographic',
                bio: 'Biologiste de la conservation, il dirige l’Okavango Wilderness Project et mène l’expédition depuis les sources angolaises jusqu’au delta.',
            },
            {
                name: 'Neil Gelinas',
                role: 'Réalisateur',
                bio: 'Cinéaste et explorateur, il filme l’expédition de l’intérieur, au rythme des pirogues.',
            },
        ],
        reviews: [],
        actions: [
            {
                label: 'Okavango Wilderness Project',
                url: 'https://www.nationalgeographic.org/projects/okavango/',
                text: 'Le programme de la National Geographic Society qui protège le bassin.',
            },
            {
                label: 'Okavango Eternal',
                url: 'https://nationalgeographic.org/explore/programs/okavango',
                text: 'Partenariat de dix ans pour préserver les sources du delta.',
            },
        ],
        credits: [
            ['Réalisation', 'Neil Gelinas'],
            ['Production', 'National Geographic Documentary Films'],
        ],
    },
    {
        slug: 'sea-of-shadows',
        title: 'Sea of Shadows',
        year: 2019,
        date: '12 juillet 2019',
        director: 'Richard Ladkani',
        place: 'Mer de Cortés',
        country: 'Mexique',
        lat: 31.0,
        lng: -114.6,
        world: 'Océan',
        accent: '#4fc3c9',
        pitch: 'Une course contre la montre pour sauver le plus petit cétacé du monde.',
        synopsis: [
            'Dans la mer de Cortés, cartels mexicains et trafiquants chinois s’associent pour pêcher le totoaba, un poisson dont la vessie natatoire vaut une fortune. Leurs filets dérivants menacent toute la vie marine de la région, dont le vaquita, le marsouin le plus rare de la planète.',
            'Scientifiques, défenseurs de l’environnement, journalistes d’investigation, agents infiltrés et marine mexicaine risquent leur vie pour sauver les derniers vaquitas. Un documentaire au rythme d’un thriller, prix du public au festival de Sundance.',
        ],
        facts: [
            { value: '< 15', label: 'vaquitas encore observés lors des derniers recensements' },
            { value: '1,5 m', label: 'de long : le plus petit cétacé du monde' },
            { value: 'Sundance', label: 'prix du public 2019' },
        ],
        poster: 'docfilmswebsite_1080x1600_sos_ec1ddec1.jpeg', // affiche officielle, portrait 2:3
        hero: 'sos-1900x792_2b2a5bbd.png',
        thumb: ['sos-1900x792_2b2a5bbd.png', '40% 50%'], // vignette du globe, choisie à l'œil
        gallery: [
            [
                'sos_07_45526f12.jpeg',
                'Un vaquita sous l’eau, l’un des derniers de son espèce.',
                'National Geographic',
            ],
            [
                'sos_01_05913518.jpeg',
                'Un navire de Sea Shepherd patrouille dans les eaux côtières.',
                'National Geographic',
            ],
            [
                'sos_02_b2c0e5a0.jpeg',
                'Jack Hutton examine un totoaba mort avec deux marins mexicains.',
                'National Geographic',
            ],
            ['sos_03_d9d4f3ca.jpeg', 'Un totoaba pris dans un filet.', 'National Geographic'],
            ['sos_04_babb6a62.jpeg', 'Un dépôt de filets fantômes récupérés en mer.', 'National Geographic'],
            [
                'sos_06_5b0bba4e.jpeg',
                'La marine mexicaine se prépare à traquer les braconniers.',
                'National Geographic',
            ],
        ],
        people: [
            {
                name: 'Richard Ladkani',
                role: 'Réalisateur et chef opérateur',
                photo: 'bio-richard_6ae583dd.jpeg',
                bio: 'Auteur de « The Ivory Game », présélectionné aux Oscars, il filme au plus près de l’action, comme si on y était.',
            },
            {
                name: 'Andrea Crosta',
                role: 'Earth League International',
                photo: 'bio-andrea_1214b22a.jpeg',
                bio: 'Il infiltre les réseaux de trafic d’espèces sauvages pour remonter jusqu’à leurs commanditaires.',
            },
            {
                name: 'Carlos Loret de Mola',
                role: 'Journaliste d’investigation',
                photo: 'carlos_4866c157.jpeg',
                bio: 'Figure majeure de la télévision mexicaine, il enquête sur la corruption qui protège le trafic.',
            },
            {
                name: 'Cynthia Smith',
                role: 'Vaquita CPR',
                photo: 'bio-cynthia_824eac32.jpeg',
                bio: 'Vétérinaire, elle tente un plan de sauvetage de la dernière chance : capturer des vaquitas pour les protéger.',
            },
            {
                name: 'Jack Hutton',
                role: 'Pilote de drone, Sea Shepherd',
                photo: 'bio-jack_7fa9f39c.jpeg',
                bio: 'Depuis le ciel, il repère les filets illégaux et les bateaux des braconniers.',
            },
        ],
        reviews: [
            {
                quote: 'Un drame haletant, plein de coups de feu, de cartels et de corruption.',
                source: 'The New York Times',
            },
            {
                quote: 'Une aventure bouleversante, aussi inspirante que déchirante.',
                source: 'The Hollywood Reporter',
            },
            { quote: 'Un réquisitoire qui prend aux tripes.', source: 'Variety' },
        ],
        actions: [
            {
                label: 'Earth League International',
                url: 'https://earthleagueinternational.org/',
                text: 'Enquêtes contre le trafic d’espèces sauvages.',
            },
            {
                label: 'Vaquita CPR',
                url: 'https://www.vaquitacpr.org/',
                text: 'Le programme scientifique de sauvetage du vaquita.',
            },
            {
                label: 'Sea Shepherd · Opération Milagro',
                url: 'https://seashepherd.org/campaigns/milagro/',
                text: 'Le retrait des filets illégaux dans la mer de Cortés.',
            },
            {
                label: 'Guide de discussion',
                url: 'https://www.nationalgeographic.com/content/dam/ngdotcom/rights-exempt/films/seaofshadows/seaofshadows_discussionguide_2019.pdf',
                text: 'Pour débattre du film en classe ou en groupe (PDF, en anglais).',
            },
        ],
        credits: [
            ['Réalisation et image', 'Richard Ladkani'],
            ['Production', 'Walter Köhler, Wolfgang Knöpfler'],
            ['Montage', 'Georg Fischer, Verena Schönauer'],
            ['Musique', 'H. Scott Salinas'],
            ['Production exécutive', 'Leonardo DiCaprio, Jennifer Davisson, Phillip Watson, Scott Z. Burns'],
        ],
    },
    {
        slug: 'the-last-ice',
        title: 'The Last Ice',
        year: 2020,
        date: '2020',
        director: 'Scott Ressler',
        place: 'Pikialasorsuaq',
        country: 'Canada · Groenland',
        lat: 77.0,
        lng: -72.0,
        world: 'Glace',
        accent: '#9fd8ff',
        pitch: 'Quand la banquise fond, tout un peuple défend son océan gelé.',
        synopsis: [
            'Entre le Canada et le Groenland, la banquise fond. Le monde extérieur y voit des occasions inédites : pétrole et gaz, routes maritimes plus courtes, tourisme, pêche. Mais pour plus de 100 000 Inuit qui vivent sur et autour de l’océan gelé, c’est tout un mode de vie qui est en jeu.',
            'Réalisé par Scott Ressler et produit par Enric Sala, fondateur de Pristine Seas, le film raconte le combat des communautés inuit pour protéger l’Arctique, leur foyer depuis des siècles.',
        ],
        facts: [
            { value: '100 000+', label: 'Inuit vivent autour de l’océan gelé' },
            { value: '2', label: 'pays, un seul peuple de part et d’autre de la glace' },
            { value: 'Pristine Seas', label: 'le programme de National Geographic pour protéger les océans' },
        ],
        poster: 'thelastice-poster_1080x1600_68f3c53e.jpeg', // affiche officielle, portrait 2:3
        hero: 'the-last-ice_bg_desktop_79a50875.jpeg',
        thumb: ['thelastice_aleqatsiaq_peary_d6259274.jpeg', '55% 50%'], // vignette du globe, choisie à l'œil
        gallery: [
            [
                '86059484ca1e2e52789192510cf4702f_4096x2304_8dc4b471.jpeg',
                'La banquise entre le Canada et le Groenland.',
                'National Geographic',
            ],
            [
                'thelastice_aleqatsiaq_peary_d6259274.jpeg',
                'Aleqatsiaq Peary, musicien et chasseur à Qaanaaq.',
                'National Geographic',
            ],
            [
                'thelastice_maatalii_okalik_54f550a5.jpeg',
                'Maatalii Okalik, porte-voix de la jeunesse inuit.',
                'National Geographic',
            ],
        ],
        people: [
            {
                name: 'Maatalii Okalik',
                role: 'Militante inuit',
                photo: 'thelastice_maatalii_okalik_54f550a5.jpeg',
                bio: 'Originaire de Panniqtuuq, au Nunavut, elle défend les droits de la jeunesse inuit au Canada et à l’international.',
            },
            {
                name: 'Aleqatsiaq Peary',
                role: 'Musicien et chasseur',
                photo: 'thelastice_aleqatsiaq_peary_d6259274.jpeg',
                bio: 'Il vit à Qaanaaq, au Groenland, l’une des villes les plus au nord du monde.',
            },
            {
                name: 'Scott Ressler',
                role: 'Réalisateur',
                photo: 'scott_ressler_191015_0250_a82b126a.jpeg',
                bio: 'Après dix ans à filmer les océans pour la National Geographic Society, il signe ici son premier long métrage.',
            },
            {
                name: 'Enric Sala',
                role: 'Producteur exécutif',
                photo: 'nationalgeographic_2729972_7171cd13.jpeg',
                bio: 'Ancien professeur devenu explorateur en résidence, il a fondé Pristine Seas pour protéger les derniers océans sauvages.',
            },
        ],
        reviews: [],
        actions: [
            {
                label: 'Pristine Seas',
                url: 'https://www.nationalgeographic.org/projects/pristine-seas/',
                text: 'Le programme qui aide à créer des aires marines protégées dans le monde.',
            },
        ],
        credits: [
            ['Réalisation', 'Scott Ressler'],
            ['Production exécutive', 'Enric Sala'],
            ['Montage et postproduction', 'Brian Newell'],
        ],
    },
    {
        slug: 'endurance',
        title: 'Endurance',
        year: 2024,
        date: '2024',
        director: 'E. Chai Vasarhelyi, Jimmy Chin, Natalie Hewit',
        place: 'Mer de Weddell',
        country: 'Antarctique',
        lat: -68.73,
        lng: -52.33,
        world: 'Glace',
        accent: '#c9e4f2',
        pitch: 'Un siècle après le naufrage de Shackleton, retrouver l’épave sous la glace.',
        synopsis: [
            'En 1915, le navire de l’explorateur Ernest Shackleton est broyé par la banquise. Pendant plus d’un an, il parvient à garder en vie ses 27 hommes d’équipage, au cœur de l’Antarctique.',
            'Plus d’un siècle plus tard, une équipe d’explorateurs part à la recherche de l’épave. Le film entrelace ces deux expéditions, unies par la même ténacité.',
        ],
        facts: [
            { value: '3 008 m', label: 'de profondeur : là où dort l’épave' },
            { value: '107 ans', label: 'entre le naufrage et la découverte, en 2022' },
            { value: '27', label: 'hommes d’équipage, tous revenus vivants' },
        ],
        poster: 'endurance_cover_f1c2b981.jpeg', // affiche officielle, portrait 2:3
        hero: 'ng_endurance_desktop_1920x792_1f8a7b66.png',
        thumb: ['endurance_004_9e394935.jpeg', '50% 50%'], // vignette du globe, choisie à l'œil
        gallery: [
            [
                'endurance_004_9e394935.jpeg',
                'La poupe de l’Endurance, intacte au fond de la mer de Weddell.',
                'National Geographic',
            ],
            [
                'endurance_003_c60f4507.jpeg',
                'Le S.A. Agulhas II dans la glace, en route vers les coordonnées du naufrage.',
                'National Geographic',
            ],
            ['endurance_048_5dccb933.jpeg', 'Le brise-glace vu depuis la banquise.', 'National Geographic'],
            [
                'endurance_085_1c1ff33a.jpeg',
                'L’équipage pose avec le robot sous-marin qui a retrouvé l’épave.',
                'National Geographic',
            ],
            [
                'endurance_140_fc9dbc3a.jpeg',
                'Mensun Bound et John Shears sur la glace de l’Antarctique.',
                'Esther Horvath',
            ],
            [
                'endurance_129_aa812e65.jpeg',
                'La géomètre Maeva Onde à bord du S.A. Agulhas II.',
                'National Geographic',
            ],
        ],
        people: [
            {
                name: 'John Shears',
                role: 'Chef d’expédition',
                photo: 'john_shears_stockpkg_mm9903_220210-02326_7b4cc95c.jpeg',
                bio: 'Géographe polaire britannique, il dirige l’expédition Endurance22.',
            },
            {
                name: 'Mensun Bound',
                role: 'Archéologue marin',
                photo: 'mensun_bound_stockpkg_mm9903_220220-05939_00a6d2b1.jpeg',
                bio: 'Né aux Malouines, il consacre sa vie aux épaves et dirige l’exploration du navire.',
            },
            {
                name: 'Nico Vincent',
                role: 'Ingénieur sous-marin',
                photo: 'nicolas_vincent_stockpkg_mm9903_220209-01707_17b1413f.jpeg',
                bio: 'Trente ans de projets en eaux profondes et de nombreuses épaves célèbres à son actif.',
            },
            {
                name: 'Dan Snow',
                role: 'Historien',
                photo: 'dan_snow_d0dabd5c.jpeg',
                bio: 'Présentateur primé aux BAFTA, il raconte l’histoire à ceux qui la revivent.',
            },
        ],
        reviews: [],
        actions: [
            {
                label: 'Impact Guild',
                url: 'https://www.impact-guild.org/',
                text: 'Les actions associées à la sortie du film.',
            },
        ],
        credits: [
            ['Réalisation et production', 'E. Chai Vasarhelyi, Jimmy Chin, Natalie Hewit'],
            ['Production', 'Ruth Johnston'],
            ['Production et montage', 'Bob Eisenhardt'],
            ['Images d’archives', 'Frank Hurley'],
        ],
    },
    {
        slug: 'becoming-cousteau',
        title: 'Becoming Cousteau',
        year: 2021,
        date: '22 octobre 2021',
        director: 'Liz Garbus',
        place: 'Méditerranée',
        country: 'France',
        lat: 43.0,
        lng: 6.0,
        world: 'Océan',
        accent: '#e2574c',
        pitch: 'L’homme au bonnet rouge, qui nous a fait découvrir le monde du silence.',
        synopsis: [
            'Aventurier, cinéaste, inventeur et défenseur des océans : Jacques-Yves Cousteau a ouvert les fonds marins au monde entier. Le film retrace sa vie, ses films devenus légendaires, ses inventions et les épreuves qui l’ont forgé.',
            'Il montre aussi un Cousteau précurseur, qui alertait déjà sur le réchauffement des mers et dont l’héritage inspire encore ceux qui protègent la planète.',
        ],
        facts: [
            { value: '1943', label: 'il co-invente le scaphandre autonome' },
            { value: 'Palme d’or', label: 'à Cannes en 1956 pour « Le Monde du silence »' },
            { value: 'Calypso', label: 'le navire de toutes ses expéditions' },
        ],
        poster: 'becomingcousteau_1080x1620_2e6100f4.jpeg', // affiche officielle, portrait 2:3
        hero: 'cousteau-big-bg_cc204399.png',
        thumb: ['becomingcousteau_00015811_83bb0930.jpeg', '55% 50%'], // vignette du globe, choisie à l'œil
        gallery: [
            [
                '4fe70020f3ad75f9d4543ea0fdafcdbb_3813x4096_edc45d06.jpeg',
                'Jacques Cousteau en tenue de plongée, 1972.',
                'Yousuf Karsh',
            ],
            [
                'a14d69eddaa624396c1ad1dbc7ce1b73_4096x2778_32177551.jpeg',
                'L’équipage de la Calypso plonge pour une scène du « Monde du silence ».',
                'National Geographic',
            ],
            [
                'becomingcousteau_00015811_83bb0930.jpeg',
                'Le célèbre bonnet rouge, à bord de la Calypso, années 1970.',
                'The Cousteau Society',
            ],
            [
                '940c4b3463ddd2923c1f1def935c3fad_4096x2751_07a0f467.jpeg',
                'En expédition à bord de la Calypso, 1960.',
                'Luis Marden',
            ],
            [
                'becomingcousteau_00003339_bd3d643e.jpeg',
                'Il filme une épave en Méditerranée, 1943.',
                'The Cousteau Society',
            ],
            [
                '42509042792a7c41bb28cb07fd87c030_4096x2855_d0d2326b.jpeg',
                'Repas avec l’équipage pendant une expédition dans l’océan Indien, 1955.',
                'National Geographic',
            ],
        ],
        people: [
            {
                name: 'Liz Garbus',
                role: 'Réalisatrice et productrice',
                photo: 'liz-garbus_31b4f03e.jpeg',
                bio: 'Deux fois nommée aux Oscars, elle a notamment réalisé « What Happened, Miss Simone? ».',
            },
            {
                name: 'Dan Cogan',
                role: 'Producteur',
                photo: 'dan-cogan_4011195e.jpeg',
                bio: 'Oscarisé pour « Icarus », c’est l’un des producteurs de documentaires les plus en vue.',
            },
            {
                name: 'Mridu Chandra',
                role: 'Productrice',
                photo: 'mridu-chandra_0b056149.jpeg',
                bio: 'Cinéaste new-yorkaise dont les films ont été présentés à Sundance.',
            },
            {
                name: 'Evan Hayes',
                role: 'Producteur',
                photo: 'evan-hayes_860232e1.png',
                bio: 'Primé aux Oscars, aux BAFTA et aux Emmy, il a produit « Free Solo ».',
            },
        ],
        reviews: [
            {
                quote: 'Un portrait merveilleusement intime du légendaire océanographe.',
                source: 'The Hollywood Reporter',
            },
            {
                quote: 'Un plongeon éblouissant dans les profondeurs du monde sous-marin.',
                source: 'IndieWire',
            },
            { quote: 'Une introduction vivifiante pour ceux qui le découvrent.', source: 'Deadline' },
        ],
        actions: [
            {
                label: 'The Cousteau Society',
                url: 'https://www.cousteau.org',
                text: 'La fondation qui poursuit son œuvre.',
            },
            {
                label: 'Guide de discussion',
                url: 'https://lumiere-a.akamaihd.net/v1/documents/becomingcousteau_discussionguide_2021_0798032b.pdf',
                text: 'Pour débattre du film en classe ou en groupe (PDF, en anglais).',
            },
        ],
        credits: [
            ['Réalisation', 'Liz Garbus'],
            ['Production', 'Liz Garbus, Dan Cogan, Mridu Chandra, Evan Hayes'],
            ['Scénario', 'Mark Monroe, Pax Wassermann'],
            ['Montage', 'Pax Wassermann'],
        ],
    },
    {
        slug: 'the-rescue',
        title: 'The Rescue',
        year: 2021,
        date: '8 octobre 2021',
        director: 'E. Chai Vasarhelyi, Jimmy Chin',
        place: 'Grotte de Tham Luang',
        country: 'Thaïlande',
        lat: 20.38,
        lng: 99.87,
        world: 'Grotte noyée',
        accent: '#f08a3c',
        pitch: 'Treize vies piégées sous la montagne, et des plongeurs pour aller les chercher.',
        synopsis: [
            'En juin 2018, douze jeunes footballeurs et leur entraîneur se retrouvent piégés par la mousson au fond de la grotte de Tham Luang, en Thaïlande. Le monde entier retient son souffle.',
            'Grâce à des images inédites, le film raconte le sauvetage du point de vue de ceux qui l’ont mené, en particulier une poignée de plongeurs spéléologues amateurs, prêts à tout risquer dans des galeries noyées et obscures.',
        ],
        facts: [
            { value: '13', label: 'personnes piégées : 12 enfants et leur entraîneur' },
            { value: '18 jours', label: 'sous la montagne avant la sortie du dernier' },
            { value: '4 km', label: 'de galeries, en partie noyées, jusqu’au groupe' },
        ],
        poster: 'therescue-poster_1080x1600_e9ca44a1.jpeg', // affiche officielle, portrait 2:3
        hero: 'signal-2021-09-27-144025_001_db43b4b2.jpeg',
        thumb: ['therescue_sg_016_de7a36d3.jpeg', '45% 50%'], // vignette du globe, choisie à l'œil
        gallery: [
            ['therescue_sg_001_6b421197.jpeg', 'Un plongeur dans une grotte noyée.', 'National Geographic'],
            [
                'therescue_sg_009_f6d07caa.jpeg',
                'Seule une lampe frontale guide le plongeur.',
                'National Geographic',
            ],
            [
                'therescue_sg_026_ff0bbd4c.jpeg',
                'Rick Stanton et John Volanthen dans la grotte.',
                'National Geographic',
            ],
            ['therescue_sg_016_de7a36d3.jpeg', 'Rick Stanton se prépare à plonger.', 'National Geographic'],
            ['therescue_sg_015_5d6f6861.jpeg', 'Un plongeur émerge de l’eau.', 'National Geographic'],
            ['therescue_sg_007_49a3f129.jpeg', 'Jason Mallinson.', 'National Geographic'],
        ],
        people: [
            {
                name: 'E. Chai Vasarhelyi',
                role: 'Réalisatrice et productrice',
                photo: '855e45303b42c78fb0a2f27fc24e714a_2730x4096_f69bb69c.jpeg',
                bio: 'Oscarisée pour « Free Solo », elle filme des exploits humains hors du commun.',
            },
            {
                name: 'Jimmy Chin',
                role: 'Réalisateur et producteur',
                photo: 'jimmychin_38_8f5b043d.jpeg',
                bio: 'Photographe pour National Geographic, alpiniste et skieur de l’extrême, oscarisé pour « Free Solo ».',
            },
            {
                name: 'John Volanthen',
                role: 'Plongeur spéléologue',
                photo: 'john_volanthen_39f0028a.jpeg',
                bio: 'Consultant en informatique, il fait partie des plongeurs qui ont retrouvé les enfants.',
            },
            {
                name: 'Richard Harris',
                role: 'Médecin et plongeur',
                photo: 'drrichardharris_ae92a40b.jpeg',
                bio: 'Anesthésiste australien, il a rendu possible l’évacuation des enfants sous l’eau.',
            },
            {
                name: 'Thanet Natisri',
                role: 'Expert des eaux souterraines',
                photo: 'thanet_headshot_bf5b6ef8.jpeg',
                bio: 'Il a aidé à détourner l’eau de la montagne pour gagner un temps précieux.',
            },
        ],
        reviews: [
            { quote: 'Un documentaire haletant, qui vous noue l’estomac.', source: 'IndieWire' },
            {
                quote: 'Un film qui célèbre l’humanité dans ce qu’elle a de plus généreux.',
                source: 'Variety',
            },
            { quote: 'Incroyablement émouvant et palpitant.', source: 'RogerEbert.com' },
        ],
        actions: [],
        credits: [
            ['Réalisation', 'E. Chai Vasarhelyi, Jimmy Chin'],
            ['Production', 'P.J. van Sandwijk, John Battsek, E. Chai Vasarhelyi, Jimmy Chin'],
            ['Image', 'David Katznelson, Picha Srisansanee, Ian Seabrook'],
            ['Montage', 'Bob Eisenhardt'],
            ['Musique', 'Daniel Pemberton'],
        ],
    },
    {
        slug: 'fire-of-love',
        title: 'Fire of Love',
        year: 2022,
        date: '2022',
        director: 'Sara Dosa',
        place: 'Mont Unzen',
        country: 'Japon',
        lat: 32.76,
        lng: 130.29,
        world: 'Volcan',
        accent: '#ff6a3d',
        pitch: 'Un couple de volcanologues français, amoureux l’un de l’autre et des volcans.',
        synopsis: [
            'Katia et Maurice Krafft aimaient deux choses : l’un l’autre, et les volcans. Pendant vingt ans, ce couple de volcanologues alsaciens a parcouru la planète pour filmer les éruptions et documenter leurs découvertes, jusqu’à disparaître en 1991 au mont Unzen, au Japon.',
            'À partir de leurs archives spectaculaires, Sara Dosa signe une célébration poétique de leur esprit d’aventure : une histoire de création et de destruction, et d’un amour qui les a menés au bord du monde connu.',
        ],
        facts: [
            { value: '20 ans', label: 'à poursuivre les éruptions sur toute la planète' },
            { value: '1991', label: 'ils disparaissent sous une nuée ardente au mont Unzen' },
            { value: 'Oscars', label: 'nommé au meilleur documentaire en 2023' },
        ],
        poster: 'fol-awards-poster-2_627fd1e0.jpeg', // affiche officielle, portrait 2:3
        hero: 'ng_fol_desktop_1920x792_e1f116a6.jpeg',
        thumb: ['fireoflove_kkrafft_01_285f3a97.jpeg', '72% 50%'], // vignette du globe, choisie à l'œil
        gallery: [
            [
                'fireoflove_film_still_1b_16936eca.jpeg',
                'Katia et Maurice Krafft face à un volcan qui crache vapeur et cendres.',
                'Image’Est',
            ],
            [
                'fireoflove_kkrafft_01_285f3a97.jpeg',
                'Katia en combinaison aluminisée près d’une coulée de lave, volcan Krafla, Islande.',
                'Image’Est',
            ],
            [
                'fireoflove_film-still-10_a5b5daf0.png',
                'Katia enfile son casque de métal sur l’Etna, en 1972.',
                'Image’Est',
            ],
            ['fireoflove_film-still-4_5298057f.png', 'Le couple interviewé chez lui, en Alsace.', 'INA'],
        ],
        people: [
            {
                name: 'Katia Krafft',
                role: 'Volcanologue',
                bio: 'Géochimiste, elle photographiait les éruptions au plus près, souvent en combinaison aluminisée.',
            },
            {
                name: 'Maurice Krafft',
                role: 'Volcanologue',
                bio: 'Géologue et cinéaste, il a filmé des centaines d’heures d’éruptions pour mieux protéger les populations.',
            },
            {
                name: 'Sara Dosa',
                role: 'Réalisatrice',
                bio: 'Productrice primée aux Peabody, elle raconte des histoires inattendues sur l’écologie et ceux qui la vivent.',
            },
        ],
        reviews: [],
        actions: [],
        credits: [
            ['Réalisation et production', 'Sara Dosa'],
            ['Production', 'Shane Boris, Ina Fichman'],
            ['Montage', 'Erin Casper, Jocelyne Chaput'],
        ],
    },
    {
        slug: 'the-territory',
        title: 'The Territory',
        year: 2022,
        date: '2022',
        director: 'Alex Pritz',
        place: 'Rondônia, Amazonie',
        country: 'Brésil',
        lat: -11.0,
        lng: -63.3,
        world: 'Forêt',
        accent: '#7bc96f',
        pitch: 'Un peuple autochtone filme lui-même la défense de sa forêt.',
        synopsis: [
            'Au cœur de l’Amazonie brésilienne, le peuple autochtone Uru-eu-wau-wau se bat sans relâche contre la déforestation menée par des agriculteurs et des colons illégaux.',
            'Tourné sur trois ans, en partie par les Uru-eu-wau-wau eux-mêmes, le film plonge au cœur de la communauté, qui risque sa vie pour créer sa propre équipe de journalistes et révéler la vérité. Il donne aussi la parole aux colons qui brûlent et défrichent la terre protégée.',
        ],
        facts: [
            { value: '3 ans', label: 'de tournage au cœur du territoire' },
            { value: '2 prix', label: 'à Sundance en 2022, dont le prix du public' },
            { value: 'Caméra', label: 'en partie tenue par les Uru-eu-wau-wau' },
        ],
        poster: 'ng_theterritory_keyart_vertical_4b14a73f.jpeg', // affiche officielle, portrait 2:3
        hero: 'bitate-cropped_709c37fc.png',
        thumb: ['the_territory_33_9f17ff2b.jpeg', '58% 50%'], // vignette du globe, choisie à l'œil
        gallery: [
            [
                'the_territory_27_378bb26d.jpeg',
                'Des enfants uru-eu-wau-wau jouent dans un ruisseau près du village.',
                'Alex Pritz',
            ],
            [
                'the_territory_6_44c8efd7.jpeg',
                'Un feu allumé par des agriculteurs dévore la forêt pendant l’été.',
                'Alex Pritz',
            ],
            [
                'the_territory_33_9f17ff2b.jpeg',
                'Bitaté Uru-eu-wau-wau, nommé chef de son peuple.',
                'Alex Pritz',
            ],
            [
                'theterritory_rco_37_40bd4181.jpeg',
                'Là où se dressait la forêt, un paysage calciné.',
                'Alex Pritz',
            ],
            ['theterritory_martins_ff5cbe97.jpeg', 'Martins, un colon installé en Amazonie.', 'Alex Pritz'],
            ['the_territory_8_93509d87.jpeg', 'Bitaté Uru-eu-wau-wau.', 'Alex Pritz'],
        ],
        people: [
            {
                name: 'Bitaté Uru-eu-wau-wau',
                role: 'Leader de son peuple',
                photo: 'theterritory_bita_71e5af89.jpeg',
                bio: 'À 18 ans, il prend la tête de la défense de son territoire.',
            },
            {
                name: 'Neidinha Bandeira',
                role: 'Militante',
                photo: 'theterritory_neidinha_81faea3a.jpeg',
                bio: 'Cofondatrice de l’association Kanindé, elle accompagne les Uru-eu-wau-wau depuis des décennies.',
            },
            {
                name: 'Alex Pritz',
                role: 'Réalisateur',
                photo: 'theterritory_alexpritz_2_3d2c9fe8.jpeg',
                bio: 'Réalisateur et chef opérateur, il signe ici son premier long métrage.',
            },
            {
                name: 'Txai Suruí',
                role: 'Productrice exécutive',
                photo: 'a7d6d50e8e67f17bd70df9be38313e62_4096x2732_b4b17eb9.jpeg',
                bio: 'Jeune militante autochtone, elle porte la voix des peuples de l’Amazonie.',
            },
        ],
        reviews: [],
        actions: [
            {
                label: 'The Territory Impact',
                url: 'https://theterritoryimpact.org/',
                text: 'Soutenir les Uru-eu-wau-wau et la protection de leur forêt.',
            },
        ],
        credits: [
            ['Réalisation', 'Alex Pritz'],
            [
                'Production',
                'Darren Aronofsky, Sigrid Dyekjær, Will N. Miller, Gabriel Uchida, Lizzie Gillett, Alex Pritz',
            ],
            ['Production exécutive', 'Txai Suruí, Tejubi Uru-eu-wau-wau, Potei Uru-eu-wau-wau'],
        ],
    },
];

export const filmBySlug = (slug) => FILMS.find((f) => f.slug === slug);
