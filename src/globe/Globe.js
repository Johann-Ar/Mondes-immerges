import * as THREE from 'three/webgpu';
import {
    Fn,
    cameraPosition,
    dot,
    exp,
    float,
    max,
    mix,
    normalWorld,
    normalize,
    positionWorld,
    pow,
    smoothstep,
    texture,
    uniform,
    uv,
    vec3,
    vec4,
} from 'three/tsl';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Currents } from './Currents.js';
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
        this.camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
        this.camera.position.copy(toVector(20, 10, 4.2));

        this.controls = new OrbitControls(this.camera, canvas);
        Object.assign(this.controls, {
            enableDamping: true,
            dampingFactor: 0.07,
            enablePan: false,
            minDistance: 2.15, // au-delà, le relief (4096 px) devient flou
            maxDistance: 5.5,
            rotateSpeed: 0.4,
            zoomSpeed: 0.6,
            autoRotate: !this.reducedMotion,
            autoRotateSpeed: 0.25,
        });
        this.controls.addEventListener('start', () => this.hold());

        // La molette fait tourner le globe ; le pincement (pavé tactile, écran) zoome
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

        this.ready = this.build(base);
    }

    async build(base) {
        await this.renderer.init();
        const [relief, field] = await Promise.all([
            load(`${base}textures/relief.jpg`, THREE.SRGBColorSpace),
            load(`${base}textures/currents.png`, THREE.NoColorSpace).then((t) => {
                t.generateMipmaps = false;
                t.minFilter = THREE.LinearFilter;
                t.wrapS = THREE.RepeatWrapping;
                return t;
            }),
        ]);

        this.currents = new Currents({
            field,
            count: this.mobile ? 90_000 : 240_000,
            resolution: this.mobile ? 2048 : 4096,
        });

        // Surface : relief + traînées des courants, lumière douce venue de la caméra, liseré atmosphérique
        this.uSun = uniform(new THREE.Vector3(0, 0, 1));
        this.uCurrents = uniform(1);
        const surface = new THREE.MeshBasicNodeMaterial();
        surface.colorNode = Fn(() => {
            const n = normalize(normalWorld);
            const view = normalize(cameraPosition.sub(positionWorld));
            const ground = texture(relief, uv()).rgb;
            const light = float(0.48).add(max(dot(n, this.uSun), 0).mul(0.42));
            const trail = texture(this.currents.target.texture, uv());
            const sea = smoothstep(0.45, 0.85, texture(field, uv()).b).mul(this.uCurrents); // jamais sur les terres
            const glow = float(1)
                .sub(exp(trail.r.mul(-1.1)))
                .mul(smoothstep(0.03, 0.18, trail.r))
                .mul(sea);
            const hot = smoothstep(0.25, 1.6, trail.g).mul(sea);
            let color = ground.mul(light).mul(0.82);
            color = color.add(vec3(YELLOW.r, YELLOW.g, YELLOW.b).mul(glow).mul(1.1));
            color = color.add(vec3(1, 0.96, 0.8).mul(hot).mul(0.9));
            const rim = pow(float(1).sub(max(dot(n, view), 0)), 5);
            color = mix(color, vec3(0.42, 0.4, 0.36), rim.mul(0.12));
            return vec4(color, 1);
        })();
        this.surface = new THREE.Mesh(new THREE.SphereGeometry(1, 256, 160), surface);

        // Pas de halo ni de bloom : la seule lumière est celle des courants, posée sur la surface
        this.scene.add(this.surface, this.currents.splats, this.stars());

        await this.currents.start(this.renderer);
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.renderer.setAnimationLoop(() => this.frame());
    }

    stars(count = 1800) {
        const positions = new Float32Array(count * 3);
        const v = new THREE.Vector3();
        for (let i = 0; i < count; i++) {
            v.randomDirection().multiplyScalar(30 + Math.random() * 20);
            positions.set([v.x, v.y, v.z], i * 3);
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const material = new THREE.PointsNodeMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.45,
            depthWrite: false,
        });
        return new THREE.Points(geometry, material);
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
        if (Math.abs(this.spin) > 1e-5) {
            this.camera.position.applyAxisAngle(UP, this.spin * 0.12);
            this.spin *= 0.88;
        }
        this.applyShift();
        this.controls.update(delta);
        this.uSun.value.set(-0.4, 0.5, 0.75).normalize().applyQuaternion(this.camera.quaternion);
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
            const box = { x0: x, x1: x + m.width + 30, y0: y - 16, y1: y + 16 };
            const overlaps =
                visible &&
                placed.some((b) => box.x0 < b.x1 && box.x1 > b.x0 && box.y0 < b.y1 && box.y1 > b.y0);
            m.element.classList.toggle('is-crowded', overlaps);
            if (visible && !overlaps) placed.push(box);
        }
    }
}
