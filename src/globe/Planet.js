import * as THREE from 'three';

const SURFACE_VERTEX = /* glsl */ `
    varying vec3 vNormal;
    varying vec3 vWorld;
    void main() {
        vNormal = normalize(position);
        vec4 world = modelMatrix * vec4(position, 1.0);
        vWorld = world.xyz;
        gl_Position = projectionMatrix * viewMatrix * world;
    }
`;

// Parti pris : un océan lumineux qui s'éclaircit sur les plateaux continentaux,
// des terres couleur sable et papier, des pôles nacrés. Un globe de carte ancienne, éclairé de face.
const SURFACE_FRAGMENT = /* glsl */ `
    uniform sampler2D uMap;
    uniform vec3 uSun;
    varying vec3 vNormal;
    varying vec3 vWorld;
    const float PI = 3.14159265;

    vec2 toUv(vec3 n) {
        return vec2(fract(atan(n.z, -n.x) / (2.0 * PI)), 1.0 - acos(clamp(n.y, -1.0, 1.0)) / PI);
    }

    void main() {
        vec3 n = normalize(vNormal);
        vec2 uv = toUv(n);
        vec4 e = texture2D(uMap, uv);
        float water = smoothstep(0.35, 0.65, e.r);
        float relief = e.g;
        float shelf = e.b;
        float lat = abs(asin(n.y));

        // Océan : abysses bleu nuit, talus bleu, plateaux turquoise
        vec3 ocean = mix(vec3(0.016, 0.075, 0.17), vec3(0.03, 0.22, 0.38), smoothstep(0.0, 0.45, shelf));
        ocean = mix(ocean, vec3(0.13, 0.55, 0.62), smoothstep(0.55, 1.0, shelf));
        ocean = mix(ocean, vec3(0.72, 0.84, 0.92), smoothstep(1.2, 1.35, lat)); // banquise

        // Relief ombré (estompage) à partir des pixels voisins
        vec2 px = vec2(1.0 / 2048.0, 1.0 / 1024.0);
        float rx = texture2D(uMap, uv + vec2(px.x, 0.0)).g - texture2D(uMap, uv - vec2(px.x, 0.0)).g;
        float ry = texture2D(uMap, uv + vec2(0.0, px.y)).g - texture2D(uMap, uv - vec2(0.0, px.y)).g;
        float shade = clamp(0.5 + (-rx + ry) * 3.0, 0.0, 1.0);

        vec3 land = mix(vec3(0.93, 0.86, 0.7), vec3(0.74, 0.6, 0.45), smoothstep(0.04, 0.55, relief));
        land *= 0.82 + shade * 0.36;
        land = mix(land, vec3(0.95, 0.97, 1.0), smoothstep(1.08, 1.22, lat)); // glaces polaires

        vec3 color = mix(land, ocean, water);
        // Trait de côte crème, très fin
        color = mix(color, vec3(1.0, 0.94, 0.78), (1.0 - abs(water - 0.5) * 2.0) * 0.35);

        vec3 view = normalize(cameraPosition - vWorld);
        float light = 0.55 + 0.55 * max(dot(n, uSun), 0.0);
        color *= light;
        // Reflet du soleil sur l'eau
        float glint = pow(max(dot(reflect(-uSun, n), view), 0.0), 90.0) * water;
        color += vec3(0.75, 0.9, 1.0) * glint * 0.18;
        // Bord du globe : l'atmosphère commence
        float rim = pow(1.0 - max(dot(n, view), 0.0), 3.0);
        color = mix(color, vec3(0.45, 0.8, 1.0), rim * 0.4);
        gl_FragColor = vec4(color, 1.0);
    }
`;

const HALO_FRAGMENT = /* glsl */ `
    varying vec3 vNormal;
    varying vec3 vWorld;
    void main() {
        vec3 view = normalize(cameraPosition - vWorld);
        // Face arrière de la coquille : maximum au bord de la planète, nul au bord extérieur
        float d = dot(normalize(vNormal), view);
        float glow = pow(smoothstep(0.0, -0.5, d), 2.5) * 0.6;
        gl_FragColor = vec4(vec3(0.35, 0.75, 1.0) * glow, glow);
    }
`;

/** Le globe : surface stylisée, halo atmosphérique et ciel étoilé discret. */
export class Planet {
    constructor() {
        this.group = new THREE.Group();
        this.uniforms = { uMap: { value: null }, uSun: { value: new THREE.Vector3(0, 0, 1) } };

        this.surface = new THREE.Mesh(
            new THREE.SphereGeometry(1, 160, 96),
            new THREE.ShaderMaterial({
                uniforms: this.uniforms,
                vertexShader: SURFACE_VERTEX,
                fragmentShader: SURFACE_FRAGMENT,
            }),
        );
        this.surface.visible = false; // affiché quand la texture est prête

        const halo = new THREE.Mesh(
            new THREE.SphereGeometry(1.12, 96, 64),
            new THREE.ShaderMaterial({
                vertexShader: SURFACE_VERTEX,
                fragmentShader: HALO_FRAGMENT,
                side: THREE.BackSide,
                transparent: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
            }),
        );
        this.group.add(this.surface, halo, this.stars());
    }

    /** Charge la carte (R : eau, G : relief, B : plateaux continentaux). */
    load(url) {
        return new THREE.TextureLoader().loadAsync(url).then((texture) => {
            texture.colorSpace = THREE.NoColorSpace;
            texture.minFilter = THREE.LinearFilter; // pas de mipmaps : aucune couture à la ligne de date
            texture.generateMipmaps = false;
            texture.anisotropy = 4;
            this.uniforms.uMap.value = texture;
            this.surface.visible = true;
        });
    }

    stars(count = 2500) {
        const positions = new Float32Array(count * 3);
        const v = new THREE.Vector3();
        for (let i = 0; i < count; i++) {
            v.randomDirection().multiplyScalar(40 + Math.random() * 20);
            positions.set([v.x, v.y, v.z], i * 3);
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        return new THREE.Points(
            geometry,
            new THREE.PointsMaterial({
                color: 0xcfe4ff,
                size: 1.4,
                sizeAttenuation: false,
                transparent: true,
                opacity: 0.55,
                depthWrite: false,
            }),
        );
    }

    /** Soleil fixé par rapport à la caméra : le globe est toujours éclairé de face, en biais. */
    setSun(camera) {
        this.uniforms.uSun.value.set(-0.45, 0.55, 0.7).normalize().applyQuaternion(camera.quaternion);
    }
}
