import * as THREE from 'three/webgpu';
import {
    Fn,
    atan,
    cameraPosition,
    cos,
    dot,
    exp,
    float,
    fract,
    length,
    max,
    mix,
    normalWorld,
    normalize,
    positionWorld,
    pow,
    smoothstep,
    texture,
    time,
    uniform,
    uv,
    vec2,
    vec3,
    vec4,
} from 'three/tsl';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Currents } from './Currents.js';
import { createSky } from './Sky.js';
import { dither } from './dither.js';
import { toVector } from './geo.js';

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const YELLOW = new THREE.Color('#ffcc00');
const UP = new THREE.Vector3(0, 1, 0);

const load = (url, colorSpace) =>
    new THREE.TextureLoader().loadAsync(url).then((t) => {
        t.colorSpace = colorSpace;
        t.anisotropy = 8;
        return t;
    });

/**
 * Le globe : WebGPU (repli automatique sur WebGL 2), relief ETOPO, courants NASA OSCAR simulés sur le GPU,
 * micro-splats dorés, marqueurs HTML recalés à chaque image.
 */
export class Globe {
    static async create(options) {
        const globe = new Globe(options);
        await globe.ready;
        return globe;
    }

    constructor({ canvas, markers, base, mobile }) {
        this.canvas = canvas;
        this.markers = markers;
        this.mobile = mobile;
        this.reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

        this.renderer = new THREE.WebGPURenderer({ canvas, antialias: true, alpha: false });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.75 : 2));
        this.renderer.setClearColor(0x000000, 1);
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(32, 1, 0.1, 200);
        this.camera.position.copy(toVector(20, 10, 4.2));

        this.controls = new OrbitControls(this.camera, canvas);
        Object.assign(this.controls, {
            enableDamping: true,
            dampingFactor: 0.07,
            enablePan: false,
            minDistance: 2.15, // au-delà, le relief (4096 px) devient flou
            maxDistance: 7,
            rotateSpeed: 0.4,
            zoomSpeed: 0.6,
            autoRotate: !this.reducedMotion,
            autoRotateSpeed: 0.25,
        });
        this.controls.addEventListener('start', () => this.hold());

        // La molette fait voyager la caméra sur une orbite elliptique (voir orbit) ; le pincement zoome
        this.spin = 0;
        addEventListener(
            'wheel',
            (e) => {
                if (e.ctrlKey || e.target.closest?.('dialog')) return;
                e.preventDefault();
                e.stopPropagation();
                const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
                this.spin += d * (e.deltaMode === 1 ? 16 : 1) * 0.0009;
                this.hold(6);
            },
            { capture: true, passive: false },
        );

        this.shift = { target: 0, current: 0 };
        this.flight = null;
        this.idleTimer = 0;
        this.clock = new THREE.Timer();

        // Survol : le curseur remue l'encre (voir Currents) ; intersection rayon-sphère analytique, sans maillage
        this.pointer = { on: false, ndc: new THREE.Vector2(), last: null };
        canvas.addEventListener('pointermove', (e) => {
            const r = canvas.getBoundingClientRect();
            this.pointer.ndc.set(
                ((e.clientX - r.left) / r.width) * 2 - 1,
                -((e.clientY - r.top) / r.height) * 2 + 1,
            );
            this.pointer.on = true;
        });
        canvas.addEventListener('pointerleave', () => (this.pointer.on = false));
        // Espace : les micro-éléments en anneau deviennent pleins, puis creux à nouveau
        addEventListener('keydown', (e) => {
            if (e.code !== 'Space' || e.repeat) return;
            if (e.target.closest?.('input, textarea, select, button, a, [contenteditable]')) return;
            e.preventDefault();
            this.fill = !this.fill;
        });

        this.ready = this.build(base);
    }

    async build(base) {
        await this.renderer.init();
        const [relief, depthMap, rivers, seeds, field] = await Promise.all([
            load(`${base}textures/relief.jpg`, THREE.SRGBColorSpace),
            load(`${base}textures/depth.jpg`, THREE.NoColorSpace),
            load(`${base}textures/rivers.png`, THREE.NoColorSpace),
            // départs des splats fluviaux (uint16 x, y en uv), voir scripts/hydro.py
            fetch(`${base}textures/river-seeds.bin`)
                .then((r) => r.arrayBuffer())
                .then((b) => Float32Array.from(new Uint16Array(b), (v) => v / 65535)),
            load(`${base}textures/currents.png`, THREE.NoColorSpace).then((t) => {
                t.generateMipmaps = false;
                t.minFilter = THREE.LinearFilter;
                t.wrapS = THREE.RepeatWrapping;
                return t;
            }),
        ]);
        for (const t of [depthMap, rivers]) t.wrapS = THREE.RepeatWrapping;

        this.currents = new Currents({
            field,
            rivers,
            depth: depthMap,
            seeds,
            count: this.mobile ? 110_000 : 300_000,
            resolution: this.mobile ? 2048 : 4096,
        });

        // Surface : relief + traînées des courants, lumière douce venue de la caméra, liseré atmosphérique
        this.uSun = uniform(new THREE.Vector3(0, 0, 1));
        this.uCurrents = uniform(1);
        const c = this.currents;
        // tourbillon du survol : centre (uv) et torsion, pilotés par eddy() ; l'encre et les splats le suivent
        this.uEddy = c.uEddy;
        this.uTwist = c.uTwist;
        // Survol, purement visuel (la simulation n'est jamais touchée) : un doigt dans l’eau. Sous le curseur,
        // l'encre s'enroule dans le sens horaire (une torsion qui décroît avec la distance, comme dans les
        // tourbillons océaniques) et se laisse entraîner dans le sens du geste ; le tourbillon suit la main avec
        // l’inertie d’un liquide, puis se fond dans le dessin d'origine quand elle quitte le globe.
        const k = cos(uv().y.sub(0.5).mul(Math.PI)).mul(2); // écart isotrope malgré la projection
        const ox = fract(uv().x.sub(this.uEddy.x).add(0.5)).sub(0.5).mul(k);
        const oy = uv().y.sub(this.uEddy.y);
        const { shift, core } = c.finger(ox, oy, 1);
        const lens = uv().add(vec2(shift.x.div(max(k, 0.05)), shift.y));
        const trail = mix(c.trailNode, c.reader(lens), c.uEddyOn);
        const surface = new THREE.MeshBasicNodeMaterial();
        surface.colorNode = Fn(() => {
            const n = normalize(normalWorld);
            const view = normalize(cameraPosition.sub(positionWorld));
            const ground = texture(relief, uv()).rgb;
            const facing = max(dot(n, view), 0);
            // Nuit (pas totale) : un clair de lune bas qui modèle la sphère, assez sombre pour que les courants
            // soient la vraie source de lumière
            const diffuse = smoothstep(-0.3, 1, dot(n, this.uSun));
            const light = float(0.12).add(diffuse.mul(0.5));
            // assombrissement du bord : la sphère s'arrondit, le centre semble avancer vers nous
            const limb = mix(float(0.5), float(1), pow(facing, 0.45));
            // trait de côte fin (bathymétrie), le même que celui de la simulation
            const water = smoothstep(0.012, 0.045, texture(depthMap, uv()).r);
            const sea = water.mul(this.uCurrents);
            // Profondeur : plus l'eau est profonde, plus elle est sombre et dense ; les plateaux restent clairs
            const depth = texture(depthMap, uv()).r;
            // encre : un voile translucide là où elle est diluée, dense et lumineuse dans les filaments ;
            // un peu étouffée au-dessus des abysses, comme vue à travers une eau épaisse
            // sous le doigt, l'eau est écartée : un léger creux dans l'encre
            const ink = smoothstep(0.03, 0.95, trail.r).mul(float(1).sub(core.mul(0.55)));
            const glow = pow(ink, 0.8)
                .mul(1.15)
                .mul(sea)
                .mul(mix(float(1.1), float(0.78), depth));
            // cœurs chauds : seulement au large (contre les côtes, ils faisaient des points blancs)
            const hot = smoothstep(0.15, 1.2, trail.g)
                .min(0.6)
                .mul(sea)
                .mul(smoothstep(0.03, 0.18, depth));
            // mers d'autant plus noires et froides qu'elles sont profondes
            const abyss = mix(vec3(1.25, 1.22, 1.15), vec3(0.32, 0.36, 0.46), pow(depth, 0.8));
            // terres claires, d'un gris de pierre à peine bleuté
            const land = ground.mul(vec3(0.9, 0.93, 1)).mul(1.3);
            const night = mix(land, ground.mul(0.55).mul(abyss), water);
            let color = night.mul(light).mul(limb).mul(0.62);
            const Y = vec3(YELLOW.r, YELLOW.g, YELLOW.b);
            // jaune National Geographic posé tel quel (lumière propre : l'encre ne passe pas dans l'ombre),
            // cœur des courants rapides jaune clair
            // Fleuves et rivières : un trait fin et continu, où l'encre descend vers la mer par vagues
            // (phase = distance à la mer le long du réseau, voir scripts/hydro.py)
            const rv = texture(rivers, uv());
            const line = smoothstep(0.02, 0.28, rv.r).mul(float(1).sub(water)).mul(this.uCurrents);
            const ph = vec2(rv.g, rv.b).mul(2).sub(1);
            const wave = fract(
                atan(ph.x, ph.y)
                    .div(Math.PI * 2)
                    .add(time.mul(0.18)),
            );
            const pulse = exp(wave.sub(0.5).mul(5).pow(2).negate()).mul(smoothstep(0.3, 0.7, length(ph)));
            color = mix(color, Y.mul(0.9), line.mul(pulse.mul(0.5).add(0.5)));
            color = mix(color, Y, glow.mul(1.25).min(1)).add(vec3(1, 0.9, 0.35).mul(hot).mul(0.9));
            return vec4(dither(color), 1);
        })();
        this.surface = new THREE.Mesh(new THREE.SphereGeometry(1, 256, 160), surface);

        this.scene.add(this.surface, this.currents.splats, createSky({ count: this.mobile ? 2500 : 5000 }));

        await this.currents.start(this.renderer);
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.renderer.setAnimationLoop(() => this.frame());
    }

    /**
     * Défilement : la caméra suit une orbite elliptique qui précesse. En plus de tourner autour du globe,
     * elle s'approche et s'éloigne (une boucle par ~15 crans de molette) tout en montant et descendant à une
     * autre cadence (×0,62) : le point le plus proche ne tombe jamais deux fois au même endroit.
     * Les trois mouvements dérivent d'une même phase : revenir en arrière refait le chemin à l'envers.
     */
    orbit(d) {
        this.spin *= 0.88;
        this.phase = (this.phase ?? 0) + d * 4;
        const p = this.camera.position;
        p.applyAxisAngle(UP, d);
        const { minDistance, maxDistance } = this.controls;
        const r = THREE.MathUtils.clamp(
            p.length() * Math.exp(-d * 0.42 * Math.cos(this.phase)),
            minDistance,
            maxDistance,
        );
        const lat = THREE.MathUtils.clamp(
            Math.asin(p.y / p.length()) + d * 0.7 * Math.cos(this.phase * 0.62),
            -1.05,
            1.05,
        );
        const flat = new THREE.Vector3(p.x, 0, p.z).normalize();
        p.copy(flat.multiplyScalar(Math.cos(lat) * r)).addScaledVector(UP, Math.sin(lat) * r);
    }

    /** Le curseur sur l'océan : position en uv de la texture, vitesse lissée, présence qui monte et retombe. */
    stir(delta) {
        const c = this.currents;
        const p = this.pointer;
        let hit = null;
        if (p.on && document.body.dataset.mode === 'explore') {
            const ray = (this.ray ??= new THREE.Raycaster());
            ray.setFromCamera(p.ndc, this.camera);
            const o = ray.ray.origin;
            const d = ray.ray.direction;
            const b = o.dot(d);
            const disc = b * b - (o.lengthSq() - 1);
            if (disc > 0) {
                const n = o.clone().addScaledVector(d, -b - Math.sqrt(disc)); // point de la sphère (rayon 1)
                const x = (((Math.atan2(n.z, -n.x) / (2 * Math.PI)) % 1) + 1) % 1;
                hit = new THREE.Vector2(x, 1 - Math.acos(THREE.MathUtils.clamp(n.y, -1, 1)) / Math.PI);
            }
        }
        const on = c.uPointerOn.value;
        c.uPointerOn.value = on + ((hit ? 1 : 0) - on) * Math.min(1, delta * 6);
        if (!hit) {
            p.last = null;
            c.uPointerVel.value.multiplyScalar(0.9);
            this.eddy(delta, null);
            return;
        }
        if (p.last && delta > 0) {
            let dx = hit.x - p.last.x;
            dx -= Math.round(dx);
            const cosLat = Math.cos((hit.y - 0.5) * Math.PI);
            const v = new THREE.Vector2((dx * 2 * cosLat) / delta, (hit.y - p.last.y) / delta).clampLength(
                0,
                0.08,
            );
            c.uPointerVel.value.lerp(v, Math.min(1, delta * 10));
        }
        p.last = hit;
        c.uPointer.value.copy(hit);
        this.eddy(delta, hit);
    }

    /**
     * La main dans l'eau. Le tourbillon apparaît dès que le curseur touche le globe, le suit avec un léger
     * retard (l'inertie d'un liquide) et s'enroule dans le sens horaire, vite puis de plus en plus lentement.
     * Le geste entraîne l'eau dans sa direction. Quand le curseur quitte le globe, rien ne se déroule à
     * l'envers : le tourbillon se fond dans le dessin d'origine.
     */
    eddy(delta, hit) {
        const c = this.currents;
        const k = (rate) => Math.min(1, delta * rate);
        const on = c.uEddyOn.value;
        c.uEddyOn.value = on + ((hit ? 1 : 0) - on) * k(hit ? 6 : 2.5);
        if (!hit && c.uEddyOn.value < 0.01) this.uTwist.value = 0;
        else if (hit && !this.reducedMotion)
            this.uTwist.value += delta * 4.5 * Math.max(0, 1 - this.uTwist.value / 5.5); // le doigt plonge : vite, puis de plus en plus lentement
        // sillage : la vitesse du geste, lissée comme une eau qui suit puis se repose
        const wake = this.reducedMotion
            ? new THREE.Vector2()
            : c.uPointerVel.value.clone().multiplyScalar(0.5);
        c.uWake.value.lerp(hit ? wake : new THREE.Vector2(), k(4));
        if (hit) {
            const e = this.uEddy.value;
            if (on < 0.02) e.copy(hit);
            else {
                e.x = (e.x + (((hit.x - e.x + 1.5) % 1) - 0.5) * k(14) + 1) % 1;
                e.y += (hit.y - e.y) * k(14);
            }
        }
        // Espace : cellules creuses ↔ pleines, en fondu
        c.uFill.value += ((this.fill ? 1 : 0) - c.uFill.value) * k(6);
    }

    /** L'utilisateur prend la main : la rotation automatique s'arrête un moment. */
    hold(seconds = 10) {
        this.controls.autoRotate = false;
        this.flight = null;
        clearTimeout(this.idleTimer);
        if (!this.reducedMotion)
            this.idleTimer = setTimeout(() => (this.controls.autoRotate = true), seconds * 1000);
    }

    /** Vol de caméra vers un lieu (ou simple changement de distance si lat/lng sont omis). */
    flyTo({ lat, lng, distance, duration = 1800 }) {
        const from = this.camera.position.clone();
        const fromDir = from.clone().normalize();
        const toDir = lat === undefined ? fromDir.clone() : toVector(lat, lng, 1).normalize();
        const q = new THREE.Quaternion().setFromUnitVectors(fromDir, toDir);
        const identity = new THREE.Quaternion();
        const start = performance.now();
        const span = this.reducedMotion ? 1 : duration;
        const target = distance ?? from.length();
        return new Promise((resolve) => {
            this.flight = () => {
                const t = easeInOut(Math.min((performance.now() - start) / span, 1));
                const step = identity.clone().slerp(q, t);
                this.camera.position
                    .copy(fromDir)
                    .applyQuaternion(step)
                    .multiplyScalar(THREE.MathUtils.lerp(from.length(), target, t));
                if (t >= 1) {
                    this.flight = null;
                    resolve();
                }
            };
        });
    }

    /** Place immédiatement la caméra face à un lieu. */
    face(lat, lng, distance) {
        this.camera.position.copy(toVector(lat, lng, distance));
        this.camera.lookAt(0, 0, 0);
    }

    /** Décale le globe horizontalement, en fraction de la largeur de l'écran (0 : centré). */
    setShift(value, instant = false) {
        this.shift.target = value;
        if (instant) {
            this.shift.current = value;
            this.applyShift(true);
        }
    }

    setCurrents(visible) {
        this.uCurrents.value = visible ? 1 : 0;
    }

    resize() {
        const { clientWidth: w, clientHeight: h } = this.canvas.parentElement;
        this.renderer.setSize(w, h, false);
        this.camera.aspect = w / h;
        this.camera.fov = w / h < 0.8 ? 46 : 32;
        this.size = { w, h };
        this.applyShift(true);
    }

    applyShift(force = false) {
        const s = this.shift;
        const next = s.current + (s.target - s.current) * 0.05;
        if (!force && Math.abs(next - s.current) < 1e-5) return;
        s.current = Math.abs(s.target - next) < 1e-4 ? s.target : next;
        const { w, h } = this.size;
        if (s.current === 0) this.camera.clearViewOffset();
        else this.camera.setViewOffset(w, h, -w * s.current, 0, w, h);
        this.camera.updateProjectionMatrix();
    }

    frame() {
        if (document.hidden) return;
        this.clock.update();
        const delta = Math.min(this.clock.getDelta(), 1 / 20); // retour sur un onglet caché : pas de saut
        if (this.flight) this.flight();
        if (Math.abs(this.spin) > 1e-5) this.orbit(this.spin * 0.12);
        this.applyShift();
        this.controls.update(delta);
        this.uSun.value.set(-0.4, 0.5, 0.75).normalize().applyQuaternion(this.camera.quaternion);
        this.stir(delta);
        this.currents.step(this.renderer, this.reducedMotion ? delta * 0.3 : delta);
        this.renderer.render(this.scene, this.camera);
        this.placeMarkers();
    }

    /** Recale les marqueurs HTML ; masqués derrière le globe, étiquettes qui se chevauchent effacées. */
    placeMarkers() {
        const v = new THREE.Vector3();
        const cam = this.camera.position;
        const placed = [];
        const order = this.markers
            .map((m) => {
                toVector(m.lat, m.lng, 1.005, v);
                const facing = v.clone().normalize().dot(cam.clone().sub(v).normalize());
                v.project(this.camera);
                return { m, facing, x: (v.x * 0.5 + 0.5) * this.size.w, y: (-v.y * 0.5 + 0.5) * this.size.h };
            })
            .sort((a, b) => b.facing - a.facing);
        for (const { m, facing, x, y } of order) {
            m.element.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
            const visible = facing > 0.12;
            if (visible !== m.visible) {
                m.visible = visible;
                m.element.classList.toggle('is-hidden', !visible);
                m.element.tabIndex = visible ? 0 : -1;
            }
            m.width ??= m.element.querySelector('.marker-label')?.offsetWidth ?? 120;
            const box = { x0: x, x1: x + m.width + 30, y0: y - 16, y1: y + 16 }; // étiquette toujours à droite
            const overlaps =
                visible &&
                placed.some((b) => box.x0 < b.x1 && box.x1 > b.x0 && box.y0 < b.y1 && box.y1 > b.y0);
            m.element.classList.toggle('is-crowded', overlaps);
            if (visible && !overlaps) placed.push(box);
        }
    }
}
