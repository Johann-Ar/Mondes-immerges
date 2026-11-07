// Pages de récit ouvertes depuis les hotspots du globe
const BASE = import.meta.env.BASE_URL;
const OMBRES = `${BASE}interface/les-ombres-de-la-mer/`;
const OKAVANGO = `${BASE}interface/into-the-okavango/`;

export const REDIRECT_URLS = {
    'grande-barriere': OMBRES,
    'abysses': OMBRES,
    'arctique': OKAVANGO,
    'plastique': OKAVANGO,
    'triangle-corail': OMBRES,
    'requins': OKAVANGO
};

// Hotspot inconnu : retour à l'accueil
export const DEFAULT_URL = BASE;

export function getRedirectUrl(hotspotId) {
    return REDIRECT_URLS[hotspotId] || DEFAULT_URL;
}
