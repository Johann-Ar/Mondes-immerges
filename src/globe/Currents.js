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
    time,
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
 * 2. Les particules des courants rapides sont aussi dessinées en micro-splats dorés posés sur la surface.
 */
export class Currents {
    constructor({ field, count, resolution }) {
        this.count = count;
        this.uDelta = uniform(0);
        this.uSeed = uniform(0);
        this.uSpeed = uniform(0.22);
        this.uFade = uniform(0.009);
        this.uTone = uniform(0.75); // 0 : or, ambre · 1 : jaune National Geographic

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

        const g = (() => {
            const d = uv().sub(0.5).mul(2);
            return exp(d.dot(d).mul(-2.5));
        })();
        const amount = life(instanceIndex).mul(float(0.006).add(strength.mul(strength).mul(0.42)));
        // Deux passes : la traînée, et sa copie de l'autre côté du méridien 180° (aucune couture visible)
        const trail = (shift) => {
            const material = new THREE.SpriteNodeMaterial({
                side: THREE.DoubleSide, // la caméra retournée inverse le sens des faces
                transparent: true,
                depthTest: false,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
            });
            material.positionNode = vec3(
                shift ? head.x.add(head.x.lessThan(0.5).select(1, -1)) : head.x,
                head.y,
                0,
            );
            material.scaleNode = vec2(1.4 / resolution, 2.8 / resolution);
            material.colorNode = vec4(vec3(amount, amount.mul(strength), 0), 1);
            material.opacityNode = g;
            const sprite = new THREE.Sprite(material);
            sprite.count = count;
            sprite.frustumCulled = false;
            return sprite;
        };
        this.trailScene = new THREE.Scene();
        this.trailScene.add(trail(false), trail(true));
        this.trailCamera = new THREE.OrthographicCamera(0, 1, 1, 0, -1, 1);

        const fadeMaterial = new THREE.MeshBasicNodeMaterial({
            transparent: true,
            depthTest: false,
            depthWrite: false,
        });
        fadeMaterial.colorNode = vec3(0);
        fadeMaterial.opacityNode = this.uFade;
        this.fade = new THREE.QuadMesh(fadeMaterial);

        // Micro-splats : chaque particule des courants rapides est un minuscule point doré posé sur la surface.
        // Ils bougent avec le courant ; la lumière reste sur eux (testés en profondeur, aucun halo en volume).
        const splatMaterial = new THREE.SpriteNodeMaterial({
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        });
        const lon = head.x.mul(TWO_PI);
        const theta = float(1).sub(head.y).mul(PI);
        const normal = vec3(lon.cos().negate().mul(sin(theta)), cos(theta), lon.sin().mul(sin(theta)));
        splatMaterial.positionNode = normal.mul(1.0012);
        const facing = smoothstep(0.18, 0.45, normal.dot(cameraPosition.normalize()));
        const fast = smoothstep(0.04, 0.7, head.w);
        const seed = hash(instanceIndex.add(31));
        // scintillement : chaque splat a sa propre phase
        const twinkle = sin(time.mul(seed.mul(2.5).add(1.5)).add(seed.mul(TWO_PI)))
            .mul(0.35)
            .add(0.65);
        // des grains : petits, nets, nombreux, même sur les courants lents
        splatMaterial.scaleNode = vec2(float(0.0024).add(fast.mul(0.0032)).mul(seed.mul(0.7).add(0.6)));
        splatMaterial.colorNode = vec4(
            mix(
                mix(vec3(1, 0.66, 0.06), vec3(1, 0.96, 0.78), fast.mul(fast)), // or
                mix(vec3(1, 0.6, 0), vec3(1, 0.85, 0.3), fast.mul(fast)), // jaune #ffcc00 (linéaire)
                this.uTone,
            ),
            1,
        );
        const d = uv().sub(0.5).mul(2);
        splatMaterial.opacityNode = exp(d.dot(d).mul(-4.5))
            .mul(fast.mul(0.75).add(0.25))
            .mul(facing)
            .mul(life(instanceIndex))
            .mul(twinkle)
            .mul(1.4);
        this.splats = new THREE.Sprite(splatMaterial);
        this.splats.count = count;
        this.splats.frustumCulled = false;
        this.splats.renderOrder = 2;
    }

    async start(renderer) {
        // Les textures de rendu sont lues origine en haut (WebGPU, et le repli WebGL l'imite) : nord en v = 1
        Object.assign(this.trailCamera, { top: 0, bottom: 1 });
        this.trailCamera.updateProjectionMatrix();
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
