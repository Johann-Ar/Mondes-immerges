import * as THREE from 'three/webgpu';
import {
    Fn,
    dot,
    exp,
    float,
    hash,
    instanceIndex,
    instancedBufferAttribute,
    mix,
    mx_fractal_noise_float,
    normalize,
    positionWorld,
    smoothstep,
    uv,
    vec2,
    vec3,
    vec4,
} from 'three/tsl';

// Pôle de la Voie lactée : la bande traverse le ciel en biais
const POLE = new THREE.Vector3(-0.35, 0.8, 0.48).normalize();

/**
 * Le ciel : des étoiles de tailles, d'éclats et de teintes variés, plus nombreuses le long d'une Voie lactée
 * à peine visible. Tout reste très sombre pour laisser la lumière aux courants.
 */
export function createSky({ count = 5000 } = {}) {
    const group = new THREE.Group();

    // Voie lactée : une sphère vue de l'intérieur, bande diffuse traversée de poussières sombres
    const milky = new THREE.MeshBasicNodeMaterial({ side: THREE.BackSide, depthWrite: false });
    milky.colorNode = Fn(() => {
        const dir = normalize(positionWorld);
        const b = dot(dir, vec3(POLE.x, POLE.y, POLE.z));
        const band = exp(b.mul(b).mul(-34));
        const cloud = mx_fractal_noise_float(dir.mul(2.6), 4).mul(0.5).add(0.5);
        const dust = smoothstep(0.25, 0.85, mx_fractal_noise_float(dir.mul(6.5), 3).mul(0.5).add(0.5));
        const glow = band.mul(cloud).mul(float(1).sub(dust.mul(0.45)));
        return vec4(
            vec3(0.82, 0.8, 0.76).mul(glow.mul(0.0065)) /* linéaire : ≈ 4 % de gris une fois affiché */,
            1,
        );
    })();
    const backdrop = new THREE.Mesh(new THREE.SphereGeometry(80, 64, 32), milky);
    backdrop.renderOrder = -2;
    group.add(backdrop);

    // Étoiles : beaucoup de faibles, quelques brillantes ; 45 % rassemblées près de la bande
    const data = new Float32Array(count * 4);
    const v = new THREE.Vector3();
    for (let i = 0; i < count; i++) {
        v.randomDirection();
        if (Math.random() < 0.45) v.addScaledVector(POLE, -v.dot(POLE) * 0.85).normalize();
        v.multiplyScalar(60);
        data.set([v.x, v.y, v.z, Math.random() ** 7], i * 4);
    }
    const star = instancedBufferAttribute(new THREE.InstancedBufferAttribute(data, 4));
    const material = new THREE.SpriteNodeMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    });
    material.positionNode = star.xyz;
    material.scaleNode = vec2(float(0.06).add(star.w.mul(0.2)));
    const d = uv().sub(0.5).mul(2);
    const tint = mix(vec3(0.72, 0.8, 1), vec3(1, 0.86, 0.66), hash(instanceIndex));
    material.colorNode = vec4(mix(vec3(1), tint, 0.55), 1);
    material.opacityNode = exp(d.dot(d).mul(-5)).mul(float(0.18).add(star.w.mul(0.8)));
    const stars = new THREE.Sprite(material);
    stars.count = count;
    stars.frustumCulled = false;
    stars.renderOrder = -1;
    group.add(stars);

    return group;
}
