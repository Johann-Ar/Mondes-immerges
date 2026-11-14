import { float, fract, max, screenCoordinate, sqrt } from 'three/tsl';

/**
 * Tramage : un bruit d'un demi-niveau ajouté avant la conversion en 8 bits. Les dégradés très sombres
 * (Voie lactée, nuit du globe) ne montrent plus de paliers. Amplitude calée sur la courbe sRGB.
 */
export function dither(color) {
    const p = screenCoordinate.xy;
    const n = fract(fract(p.x.mul(0.0671).add(p.y.mul(0.00584))).mul(52.9829)).sub(0.5);
    const level = max(color.r, max(color.g, color.b));
    const step = max(sqrt(level).mul(2), float(0.0774)).div(255);
    return color.add(n.mul(step).mul(1.1)).max(0);
}
