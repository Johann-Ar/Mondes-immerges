// URLs de redirection pour les hotspots
// URLs des pages de collection dans le repo consolidé

export const REDIRECT_URLS = {
    'grande-barriere': '/Mondes-immerges/interface/les-ombres-de-la-mer/',
    'abysses': '/Mondes-immerges/interface/les-ombres-de-la-mer/',
    'arctique': '/Mondes-immerges/interface/into-the-okavango/',
    'plastique': '/Mondes-immerges/interface/into-the-okavango/',
    'triangle-corail': '/Mondes-immerges/interface/les-ombres-de-la-mer/',
    'requins': '/Mondes-immerges/interface/into-the-okavango/'
};

// URL par défaut si un hotspot n'est pas trouvé - retour à l'accueil
export const DEFAULT_URL = '/Mondes-immerges/accueil/';

// Fonction utilitaire pour récupérer l'URL d'un hotspot
export function getRedirectUrl(hotspotId) {
    return REDIRECT_URLS[hotspotId] || DEFAULT_URL;
}