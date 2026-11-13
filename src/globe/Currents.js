import * as THREE from 'three/webgpu';
import {
    Fn,
    If,
    PI,
    TWO_PI,
    abs,
    asin,
    cameraPosition,
    cos,
    exp,
    float,
    fract,
    hash,
    instanceIndex,
    instancedArray,
    length,
    max,
    mix,
    sin,
    smoothstep,
    texture,
    uniform,
    uv,
    vec2,
    vec3,
    vec4,
} from 'three/tsl';

const LIMIT = 1.6; // m/s : plage d'encodage du champ (voir scripts/textures.py)

/**
 * Les courants de surface, à partir des mesures satellite NASA OSCAR.
 *
 * Des centaines de milliers de particules sont advectées sur le GPU (compute shader) par le champ de vitesse réel.
 * 1. Chaque particule laisse une traînée dans une texture équirectangulaire qui s'efface lentement :
 *    c'est elle qui est plaquée sur le globe (lignes fines, nettes à toutes les distances).
 * 2. Les particules des courants rapides sont aussi dessinées en 3D, en taches gaussiennes au-dessus de l'océan
 *    (splatting) : elles donnent du volume et de la lumière aux grands courants.
 */
export class Currents {
    constructor({ field, count, resolution }) {
        this.count = count;
        this.uDelta = uniform(0);
        this.uSeed = uniform(0);
        this.uSpeed = uniform(0.22);
        this.uFade = uniform(0.009);

        const state = instancedArray(count, 'vec4'); // x, y : position (uv) · z : âge · w : vitesse (m/s)
        this.state = state;
        const sample = (p) => texture(field, p).level(0);
        const lifeOf = (i) => hash(i).mul(8).add(6);

        const spawn = (p, seed) => {
            p.x.assign(hash(seed));
            p.y.assign(
                asin(hash(seed.add(1e6)).mul(2).sub(1))
                    .div(PI)
                    .add(0.5),
            ); // uniforme sur la sphère
            p.z.assign(0);
        };

        this.init = Fn(() => {
            const p = state.element(instanceIndex);
            spawn(p, instanceIndex.toFloat().add(12345));
            p.z.assign(hash(instanceIndex.toFloat().add(777)).mul(lifeOf(instanceIndex)));
        })().compute(count);

        this.update = Fn(() => {
            const p = state.element(instanceIndex);
            const f = sample(p.xy);
            const v = f.xy.mul(2).sub(1).mul(LIMIT);
            const lat = p.y.sub(0.5).mul(PI);
            const step = this.uDelta.mul(this.uSpeed);
            p.x.assign(fract(p.x.add(v.x.mul(step).div(max(cos(lat), 0.12).mul(TWO_PI)))));
            p.y.addAssign(v.y.mul(step).div(PI));
            p.z.addAssign(this.uDelta);
            p.w.assign(length(v));
            const dead = p.z
                .greaterThan(lifeOf(instanceIndex))
                .or(f.z.lessThan(0.4))
                .or(abs(p.y.sub(0.5)).greaterThan(0.44));
            If(dead, () => spawn(p, instanceIndex.toFloat().add(this.uSeed)));
        })().compute(count);

        // Traînées (texture équirectangulaire)
        this.target = new THREE.RenderTarget(resolution, resolution / 2, {
            type: THREE.HalfFloatType,
            generateMipmaps: true,
            minFilter: THREE.LinearMipmapLinearFilter,
            magFilter: THREE.LinearFilter,
            depthBuffer: false,
        });
        this.target.texture.wrapS = THREE.RepeatWrapping;

        const life = (i) => {
            const age = state.toAttribute().z;
            return smoothstep(0, 0.8, age).mul(smoothstep(lifeOf(i), lifeOf(i).sub(1.2), age));
        };
        const head = state.toAttribute();
        const strength = smoothstep(0.02, 0.9, head.w);

        const trailMaterial = new THREE.SpriteNodeMaterial({
            side: THREE.DoubleSide,
            transparent: true,
            depthTest: false,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        });
        trailMaterial.positionNode = vec3(head.x, head.y, 0);
        trailMaterial.scaleNode = vec2(1.4 / resolution, 2.8 / resolution);
        const g = (() => {
            const d = uv().sub(0.5).mul(2);
            return exp(d.dot(d).mul(-2.5));
        })();
        const amount = life(instanceIndex).mul(float(0.016).add(strength.mul(strength).mul(0.22)));
        trailMaterial.colorNode = vec4(vec3(amount, amount.mul(strength), 0), 1);
        trailMaterial.opacityNode = g;
        this.trails = new THREE.Sprite(trailMaterial);
        this.trails.count = count;
        this.trails.frustumCulled = false;
        this.trailScene = new THREE.Scene();
        this.trailScene.add(this.trails);
        this.trailCamera = new THREE.OrthographicCamera(0, 1, 1, 0, -1, 1);

        const fadeMaterial = new THREE.MeshBasicNodeMaterial({
            transparent: true,
            depthTest: false,
            depthWrite: false,
        });
        fadeMaterial.colorNode = vec3(0);
        fadeMaterial.opacityNode = this.uFade;
        this.fade = new THREE.QuadMesh(fadeMaterial);

        // Taches lumineuses en volume au-dessus des grands courants
        const splatMaterial = new THREE.SpriteNodeMaterial({
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        });
        const lon = head.x.mul(TWO_PI);
        const theta = float(1).sub(head.y).mul(PI);
        const radius = float(1.003).add(hash(instanceIndex.toFloat().add(31)).mul(0.005));
        const normal = vec3(lon.cos().negate().mul(sin(theta)), cos(theta), lon.sin().mul(sin(theta)));
        splatMaterial.positionNode = normal.mul(radius);
        const facing = smoothstep(0.15, 0.45, normal.dot(cameraPosition.normalize()));
        const fast = smoothstep(0.25, 0.9, head.w);
        splatMaterial.scaleNode = vec2(float(0.012).add(fast.mul(0.016)));
        splatMaterial.colorNode = vec4(mix(vec3(1, 0.78, 0.1), vec3(1, 0.95, 0.75), fast), 1);
        splatMaterial.opacityNode = g.mul(fast).mul(facing).mul(life(instanceIndex)).mul(0.07);
        this.splats = new THREE.Sprite(splatMaterial);
        this.splats.count = Math.floor(count * 0.35);
        this.splats.frustumCulled = false;
        this.splats.renderOrder = 2;
    }

    async start(renderer) {
        // WebGPU range les textures de rendu origine en haut, WebGL origine en bas : on garde le nord en v = 1
        if (renderer.backend.isWebGPUBackend) {
            Object.assign(this.trailCamera, { top: 0, bottom: 1 });
            this.trailCamera.updateProjectionMatrix();
        }
        await renderer.computeAsync(this.init);
        renderer.setRenderTarget(this.target);
        renderer.setClearColor(0x000000, 0);
        renderer.clear();
        renderer.setRenderTarget(null);
        this.advance(renderer, 1 / 60); // compile les pipelines avant la première image
    }

    step(renderer, delta) {
        // Au démarrage, plusieurs pas par image : les courants se dessinent en une seconde
        const warm = (this.frames = (this.frames ?? 0) + 1) < 70 ? 4 : 1;
        for (let i = 1; i < warm; i++) this.advance(renderer, delta);
        this.advance(renderer, delta);
    }

    advance(renderer, delta) {
        this.uDelta.value = Math.min(delta, 1 / 20);
        this.uSeed.value = Math.floor(Math.random() * 65536);
        renderer.compute(this.update);
        const autoClear = renderer.autoClear;
        renderer.autoClear = false;
        renderer.setRenderTarget(this.target);
        this.fade.render(renderer);
        renderer.render(this.trailScene, this.trailCamera);
        renderer.setRenderTarget(null);
        renderer.autoClear = autoClear;
    }
}
