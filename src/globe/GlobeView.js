import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Planet } from './Planet.js';
import { CurrentsLayer } from './CurrentsLayer.js';
import { toVector } from './geo.js';

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/**
 * Le globe interactif : rendu three.js, rotation à la souris ou au doigt,
 * marqueurs HTML (un par documentaire) recalés à chaque image, survol caméra vers un lieu.
 */
export class GlobeView {
    constructor({ canvas, markers, textureUrl, onReady }) {
        this.canvas = canvas;
        this.markers = markers; // [{ element, lat, lng }]
        this.reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
        const mobile = matchMedia('(max-width: 700px)').matches;

        this.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
        });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);
        this.camera.position.copy(toVector(18, -30, mobile ? 5.2 : 4.6));

        this.controls = new OrbitControls(this.camera, canvas);
        Object.assign(this.controls, {
            enableDamping: true,
            dampingFactor: 0.06,
            enablePan: false,
            minDistance: 1.6,
            maxDistance: 6,
            rotateSpeed: 0.45,
            zoomSpeed: 0.6,
            autoRotate: !this.reducedMotion,
            autoRotateSpeed: 0.35,
        });
        this.controls.addEventListener('start', () => this.hold());

        this.planet = new Planet();
        const loading = this.planet.load(textureUrl); // la texture se télécharge pendant la construction des courants
        this.currents = new CurrentsLayer({ quality: mobile ? 0.55 : 1 });
        this.scene.add(this.planet.group, this.currents.group);
        loading.then(() => {
            this.renderer.compile(this.scene, this.camera);
            onReady();
        });

        this.clock = new THREE.Clock();
        this.flight = null;
        this.idleTimer = 0;
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.renderer.setAnimationLoop(() => this.frame());
    }

    /** L'utilisateur prend la main : on coupe la rotation automatique un moment. */
    hold(seconds = 8) {
        this.controls.autoRotate = false;
        this.flight = null;
        clearTimeout(this.idleTimer);
        if (!this.reducedMotion)
            this.idleTimer = setTimeout(() => (this.controls.autoRotate = true), seconds * 1000);
    }

    /** Vol de caméra vers un lieu, en conservant la distance (un peu plus près). */
    flyTo(lat, lng, distance = 3.3) {
        this.hold(14);
        const from = this.camera.position.clone();
        const to = toVector(lat, lng, distance);
        const start = performance.now();
        const duration = this.reducedMotion ? 1 : 1600;
        const fromDir = from.clone().normalize();
        const toDir = to.clone().normalize();
        const q = new THREE.Quaternion().setFromUnitVectors(fromDir, toDir);
        const identity = new THREE.Quaternion();
        this.flight = () => {
            const t = easeInOut(Math.min((performance.now() - start) / duration, 1));
            const step = identity.clone().slerp(q, t);
            const radius = THREE.MathUtils.lerp(from.length(), distance, t);
            this.camera.position.copy(fromDir).applyQuaternion(step).multiplyScalar(radius);
            if (t >= 1) this.flight = null;
        };
    }

    resize() {
        const { clientWidth: w, clientHeight: h } = this.canvas.parentElement;
        this.renderer.setSize(w, h, false);
        this.camera.aspect = w / h;
        // Sur écran étroit, le globe recule pour rester entier
        this.camera.fov = w / h < 0.8 ? 50 : 38;
        this.camera.updateProjectionMatrix();
        this.currents.setSize(w, h);
        this.size = { w, h };
        this.shiftCurrent = null; // recalcule le décalage à la prochaine image
    }

    /** Décale le globe à droite (titre) ou à gauche (fiche ouverte) sur grand écran. */
    setShift(shift) {
        this.shiftTarget = shift;
    }

    applyShift() {
        const { w, h } = this.size;
        const target = w > 760 ? (this.shiftTarget ?? 1) * 0.12 : 0;
        const current = this.shiftCurrent ?? target;
        const next = current + (target - current) * 0.06;
        if (this.shiftCurrent !== null && Math.abs(next - current) < 1e-5) return;
        this.shiftCurrent = Math.abs(target - next) < 1e-4 ? target : next;
        if (this.shiftCurrent === 0) this.camera.clearViewOffset();
        else this.camera.setViewOffset(w, h, -w * this.shiftCurrent, 0, w, h);
        this.camera.updateProjectionMatrix();
    }

    frame() {
        if (document.hidden) return;
        const time = this.clock.getElapsedTime();
        if (this.flight) this.flight();
        this.applyShift();
        this.controls.update();
        this.planet.setSun(this.camera);
        this.currents.update(this.reducedMotion ? time * 0.3 : time);
        this.renderer.render(this.scene, this.camera);
        this.placeMarkers();
    }

    /** Recale les marqueurs HTML sur leur lieu ; masqués derrière le globe. */
    placeMarkers() {
        const v = new THREE.Vector3();
        const cam = this.camera.position;
        for (const m of this.markers) {
            toVector(m.lat, m.lng, 1.01, v);
            const facing = v.clone().normalize().dot(cam.clone().sub(v).normalize());
            v.project(this.camera);
            const x = (v.x * 0.5 + 0.5) * this.size.w;
            const y = (-v.y * 0.5 + 0.5) * this.size.h;
            m.element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
            const visible = facing > 0.08;
            if (visible !== m.visible) {
                m.visible = visible;
                m.element.classList.toggle('is-hidden', !visible);
                m.element.tabIndex = visible ? 0 : -1;
            }
        }
    }

    setCurrentsVisible(visible) {
        this.currents.setVisible(visible);
    }
}
