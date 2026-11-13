import * as THREE from 'three';
import { CURRENTS, KINDS } from './currents.js';
import { toVector } from './geo.js';

const SAMPLES = 512; // points par courant, espacés à longueur d'arc constante
const SURFACE = 1.004; // juste au-dessus de l'océan

// Échantillonnage du tracé d'un courant (texture : une ligne par courant), commun aux deux shaders
const PATH = /* glsl */ `
    uniform sampler2D uPaths;
    uniform float uTime;
    vec3 pathPoint(float row, float t) {
        float x = t * ${SAMPLES - 1}.0;
        int a = int(floor(x));
        int b = min(a + 1, ${SAMPLES - 1});
        vec3 p = mix(texelFetch(uPaths, ivec2(a, int(row)), 0).xyz, texelFetch(uPaths, ivec2(b, int(row)), 0).xyz, fract(x));
        return normalize(p);
    }
    float wrapT(float t, float loop) { return loop > 0.5 ? fract(t) : clamp(t, 0.0, 1.0); }
    // Position décalée latéralement (largeur du courant) et en altitude (épaisseur, effet de volume)
    vec3 place(float row, float t, float loop, float lateral, float height) {
        vec3 p = pathPoint(row, wrapT(t, loop));
        vec3 q = pathPoint(row, wrapT(t + 0.003, loop));
        vec3 side = normalize(cross(p, q - p + 1e-6));
        return normalize(p + side * lateral) * height;
    }
    float horizon(vec3 local) {
        vec3 world = (modelMatrix * vec4(local, 1.0)).xyz;
        return smoothstep(-0.02, 0.18, dot(normalize(world), normalize(cameraPosition - world)));
    }
`;

// Traînées : un quad étiré à l'écran entre la queue et la tête de chaque particule
const STREAK_VERTEX = /* glsl */ `
    ${PATH}
    uniform vec2 uResolution;
    attribute vec4 aPath;   // ligne, phase, décalage latéral, altitude
    attribute vec4 aMotion; // vitesse, longueur de traîne, largeur (px), boucle
    attribute vec3 aColor;
    varying vec2 vUv;
    varying vec3 vColor;
    varying float vAlpha;
    void main() {
        float t = fract(aPath.y + uTime * aMotion.x);
        float loop = aMotion.w;
        vec3 head = place(aPath.x, t, loop, aPath.z, aPath.w);
        vec3 tail = place(aPath.x, t - aMotion.y, loop, aPath.z, aPath.w);
        vec4 ch = projectionMatrix * modelViewMatrix * vec4(head, 1.0);
        vec4 ct = projectionMatrix * modelViewMatrix * vec4(tail, 1.0);
        vec2 halfRes = uResolution * 0.5;
        vec2 d = ch.xy / ch.w * halfRes - ct.xy / ct.w * halfRes;
        float len = length(d);
        vec2 dir = len > 1e-3 ? d / len : vec2(1.0, 0.0);
        vec2 normal = vec2(-dir.y, dir.x);
        float w = aMotion.z;
        vec4 c = mix(ct, ch, position.x);
        vec2 px = c.xy / c.w * halfRes + normal * position.y * w + dir * (position.x * 2.0 - 1.0) * w;
        c.xy = px / halfRes * c.w;
        gl_Position = c;
        float ends = loop > 0.5 ? 1.0 : smoothstep(0.0, 0.06, t) * smoothstep(1.0, 0.92, t);
        vAlpha = horizon(head) * ends;
        vUv = position.xy;
        vColor = aColor;
    }
`;

const STREAK_FRAGMENT = /* glsl */ `
    uniform float uIntensity;
    varying vec2 vUv;
    varying vec3 vColor;
    varying float vAlpha;
    void main() {
        float across = exp(-vUv.y * vUv.y * 3.5);
        float along = pow(clamp(vUv.x, 0.0, 1.0), 1.7);
        vec3 color = mix(vColor, vec3(1.0), pow(clamp(vUv.x, 0.0, 1.0), 8.0) * 0.35 * across);
        gl_FragColor = vec4(color, across * along * vAlpha * uIntensity);
    }
`;

// Nappes : grosses taches gaussiennes très diffuses qui donnent du corps au courant (splatting)
const SPLAT_VERTEX = /* glsl */ `
    ${PATH}
    uniform float uPixelRatio;
    attribute vec4 aPath;
    attribute vec4 aMotion; // vitesse, taille, -, boucle
    attribute vec3 aColor;
    varying vec3 vColor;
    varying float vAlpha;
    void main() {
        float t = fract(aPath.y + uTime * aMotion.x);
        vec3 p = place(aPath.x, t, aMotion.w, aPath.z, aPath.w);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = aMotion.y * uPixelRatio * (3.0 / -mv.z);
        float ends = aMotion.w > 0.5 ? 1.0 : smoothstep(0.0, 0.1, t) * smoothstep(1.0, 0.88, t);
        vAlpha = horizon(p) * ends;
        vColor = aColor;
    }
`;

const SPLAT_FRAGMENT = /* glsl */ `
    uniform float uIntensity;
    varying vec3 vColor;
    varying float vAlpha;
    void main() {
        vec2 c = gl_PointCoord - 0.5;
        float g = exp(-dot(c, c) * 16.0);
        gl_FragColor = vec4(vColor, g * vAlpha * uIntensity);
    }
`;

function gaussian() {
    let u = 0;
    while (u === 0) u = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random());
}

/** Texture des tracés : SAMPLES colonnes × un courant par ligne (xyz du point, w libre). */
function pathTexture() {
    const data = new Float32Array(SAMPLES * CURRENTS.length * 4);
    const lengths = CURRENTS.map((current, row) => {
        const points = current.path.map(([lat, lng]) => toVector(lat, lng));
        const curve = new THREE.CatmullRomCurve3(points, Boolean(current.loop), 'centripetal');
        const spaced = curve.getSpacedPoints(SAMPLES - 1);
        spaced.forEach((p, i) => {
            p.normalize();
            data.set([p.x, p.y, p.z, 1], (row * SAMPLES + i) * 4);
        });
        return curve.getLength();
    });
    const texture = new THREE.DataTexture(data, SAMPLES, CURRENTS.length, THREE.RGBAFormat, THREE.FloatType);
    texture.needsUpdate = true;
    return { texture, lengths };
}

/**
 * Les courants marins en volume : des dizaines de milliers de traînées lumineuses qui suivent
 * les grands courants à des altitudes et largeurs variées, plus des nappes diffuses (splats).
 * Les courants profonds passent « sous » l'océan (sans test de profondeur, plus discrets).
 */
export class CurrentsLayer {
    constructor({ quality = 1 } = {}) {
        this.group = new THREE.Group();
        const { texture, lengths } = pathTexture();
        this.uniforms = {
            uPaths: { value: texture },
            uTime: { value: 0 },
            uResolution: { value: new THREE.Vector2(1, 1) },
            uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        };
        for (const deep of [false, true]) {
            const rows = CURRENTS.map((c, row) => ({ c, row, length: lengths[row] })).filter(
                ({ c }) => (c.kind === 'deep') === deep,
            );
            this.group.add(this.streaks(rows, deep, quality), this.splats(rows, deep, quality));
        }
    }

    streaks(rows, deep, quality) {
        const quad = new THREE.PlaneGeometry(1, 2, 1, 1).translate(0.5, 0, 0);
        const geometry = new THREE.InstancedBufferGeometry().copy(quad);
        const path = [];
        const motion = [];
        const color = [];
        for (const { c, row, length } of rows) {
            const count = Math.round(length * (deep ? 700 : 1100) * quality * (0.6 + c.width * 12));
            const tint = KINDS[c.kind].color;
            for (let i = 0; i < count; i++) {
                const lateral = gaussian() * c.width * 0.4;
                const height = deep ? 0.982 + gaussian() * 0.006 : SURFACE + Math.abs(gaussian()) * 0.012;
                path.push(row, Math.random(), lateral, height);
                const speed = (c.speed * (0.012 + Math.random() * 0.01)) / length;
                motion.push(
                    speed,
                    (0.05 + Math.random() * 0.07) / length,
                    deep ? 0.5 + Math.random() * 0.5 : 0.55 + Math.random() * 0.75,
                    c.loop ? 1 : 0,
                );
                const v = 0.8 + Math.random() * 0.4;
                color.push(tint[0] * v, tint[1] * v, tint[2] * v);
            }
        }
        geometry.setAttribute('aPath', new THREE.InstancedBufferAttribute(new Float32Array(path), 4));
        geometry.setAttribute('aMotion', new THREE.InstancedBufferAttribute(new Float32Array(motion), 4));
        geometry.setAttribute('aColor', new THREE.InstancedBufferAttribute(new Float32Array(color), 3));
        geometry.instanceCount = path.length / 4;
        const mesh = new THREE.Mesh(
            geometry,
            new THREE.ShaderMaterial({
                uniforms: { ...this.uniforms, uIntensity: { value: deep ? 0.2 : 0.3 } },
                vertexShader: STREAK_VERTEX,
                fragmentShader: STREAK_FRAGMENT,
                transparent: true,
                depthWrite: false,
                depthTest: !deep,
                blending: THREE.AdditiveBlending,
            }),
        );
        mesh.frustumCulled = false;
        mesh.renderOrder = deep ? 1 : 2;
        return mesh;
    }

    splats(rows, deep, quality) {
        const path = [];
        const motion = [];
        const color = [];
        for (const { c, row, length } of rows) {
            const count = Math.round(length * 160 * quality);
            const tint = KINDS[c.kind].color;
            for (let i = 0; i < count; i++) {
                const height = deep ? 0.982 : SURFACE + Math.abs(gaussian()) * 0.02;
                path.push(row, Math.random(), gaussian() * c.width * 0.6, height);
                motion.push((c.speed * 0.01) / length, 14 + Math.random() * 22, 0, c.loop ? 1 : 0);
                color.push(...tint);
            }
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
            'position',
            new THREE.Float32BufferAttribute(new Float32Array((path.length / 4) * 3), 3),
        );
        geometry.setAttribute('aPath', new THREE.Float32BufferAttribute(path, 4));
        geometry.setAttribute('aMotion', new THREE.Float32BufferAttribute(motion, 4));
        geometry.setAttribute('aColor', new THREE.Float32BufferAttribute(color, 3));
        const points = new THREE.Points(
            geometry,
            new THREE.ShaderMaterial({
                uniforms: { ...this.uniforms, uIntensity: { value: deep ? 0.035 : 0.06 } },
                vertexShader: SPLAT_VERTEX,
                fragmentShader: SPLAT_FRAGMENT,
                transparent: true,
                depthWrite: false,
                depthTest: !deep,
                blending: THREE.AdditiveBlending,
            }),
        );
        points.frustumCulled = false;
        points.renderOrder = deep ? 1 : 2;
        return points;
    }

    setSize(width, height) {
        this.uniforms.uResolution.value.set(width, height);
    }

    update(time) {
        this.uniforms.uTime.value = time;
    }

    /** Affiche ou masque une famille de courants (chauds, froids, profonds). */
    setVisible(visible) {
        this.group.visible = visible;
    }
}
