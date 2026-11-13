import { Vector3 } from 'three';

/** Latitude/longitude (degrés) → point du globe de rayon 1, aligné sur l'UV de SphereGeometry. */
export function toVector(lat, lng, radius = 1, target = new Vector3()) {
    const phi = ((lng + 180) / 360) * Math.PI * 2;
    const theta = ((90 - lat) / 180) * Math.PI;
    return target.set(
        -Math.cos(phi) * Math.sin(theta) * radius,
        Math.cos(theta) * radius,
        Math.sin(phi) * Math.sin(theta) * radius,
    );
}
