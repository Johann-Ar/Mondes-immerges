import{R as O,V as Y,C as X,a as M,S as K,A as z,D as R,F as H,P as Z,W as Q,H as J,T as D,b as E,M as C,c as w,d as ee,B as te,e as ie,L as $,f as oe,g as se,h as N,i as V,j,k as G,l as T,m as ne,n as ae,o as F,p as re}from"./three-DErGBpjY.js";import{g as c}from"./gsap-xHO-obUW.js";(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))i(o);new MutationObserver(o=>{for(const s of o)if(s.type==="childList")for(const n of s.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&i(n)}).observe(document,{childList:!0,subtree:!0});function t(o){const s={};return o.integrity&&(s.integrity=o.integrity),o.referrerPolicy&&(s.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?s.credentials="include":o.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(o){if(o.ep)return;o.ep=!0;const s=t(o);fetch(o.href,s)}})();const le={"grande-barriere":"/Mondes-immerges/interface/les-ombres-de-la-mer/",abysses:"/Mondes-immerges/interface/les-ombres-de-la-mer/",arctique:"/Mondes-immerges/interface/into-the-okavango/",plastique:"/Mondes-immerges/interface/into-the-okavango/","triangle-corail":"/Mondes-immerges/interface/les-ombres-de-la-mer/",requins:"/Mondes-immerges/interface/into-the-okavango/"},ce="/Mondes-immerges/accueil/";function q(r){return le[r]||ce}class de{constructor(){this.videos=new Map,this.isActive=!0,this._contextLost=!1,this._playInProgress=new Map,this.checkInterval=null}onContextLost(){this._contextLost=!0,this.stopMonitoring()}onContextRestored(){this._contextLost=!1,this.videos.forEach((e,t)=>{this._tryPlay(t)}),this.startMonitoring()}register(e,t={}){if(!e||!(e instanceof HTMLVideoElement))return;const i={shouldLoop:t.loop!==!1,shouldMute:t.muted!==!1,onError:t.onError||null,onPlay:t.onPlay||null,name:t.name||"video-"+this.videos.size};e.loop=i.shouldLoop,e.muted=i.shouldMute,e.playsInline=!0,e.preload="auto",e.setAttribute("playsinline",""),e.setAttribute("webkit-playsinline",""),this.videos.set(e,i),e.addEventListener("ended",()=>{i.shouldLoop&&this.isActive&&!this._contextLost&&(e.currentTime=0,this._tryPlay(e))}),e.addEventListener("play",()=>{i.onPlay&&i.onPlay(e)});let o=0;e.addEventListener("error",s=>{i.onError&&i.onError(s),o<2&&this.isActive&&!this._contextLost&&(o++,setTimeout(()=>{e.load(),e.addEventListener("canplay",()=>this._tryPlay(e),{once:!0})},3e3*o))})}_tryPlay(e){if(!e||!this.isActive||this._contextLost||this._playInProgress.get(e))return;this._playInProgress.set(e,!0);const t=e.play();t&&t.then?t.then(()=>{this._playInProgress.set(e,!1)}).catch(()=>{this._playInProgress.set(e,!1)}):this._playInProgress.set(e,!1)}startMonitoring(e=1e4){this.checkInterval||(this.checkInterval=setInterval(()=>{!this.isActive||this._contextLost||this.videos.forEach((t,i)=>{i.paused&&!i.ended&&t.shouldLoop&&this._tryPlay(i)})},e))}stopMonitoring(){this.checkInterval&&(clearInterval(this.checkInterval),this.checkInterval=null)}unregister(e){this.videos.delete(e),this._playInProgress.delete(e)}unregisterAll(){this.videos.clear(),this._playInProgress.clear()}disable(){this.isActive=!1,this.stopMonitoring()}enable(){this.isActive=!0,this.startMonitoring()}destroy(){this.disable(),this.unregisterAll()}}const P=new de;function x(r,...e){console.log(`[GLOBE:${r}]`,performance.now().toFixed(0)+"ms",...e)}function k(r,...e){console.warn(`[GLOBE:${r}]`,performance.now().toFixed(0)+"ms",...e)}function S(r,...e){console.error(`[GLOBE:${r}]`,performance.now().toFixed(0)+"ms",...e)}class ue{constructor(e){x("INIT","Construction GlobeManager, container:",e.containerId),this.options=e,this.container=document.getElementById(e.containerId),this.container||S("INIT","Container introuvable:",e.containerId),this.scene=null,this.camera=null,this.renderer=null,this.globe=null,this.videoElement=null,this.videoTexture=null,this.hotspotObjects=[],this.raycaster=new O,this.mouse=new Y,this.clock=new X,this.labelsVisible=!1,this.orbitParams={isOrbiting:!0,baseSpeed:4e-4,currentSpeed:4e-4,maxSpeed:.002,accelerationFactor:1.3,decelerationFactor:.9,ellipseMajorAxis:9.5,ellipseMinorAxis:6.5,inclination:Math.PI/6,orbitAngle:Math.random()*Math.PI*2,zoomLevel:1,maxZoomLevel:2,minZoomLevel:.8,inHotspotMode:!1,orbitHistory:[]},this.celestialParams={sunPosition:new M(100,20,100),moonPosition:new M(-70,30,-50)},this._savedState=null,this.currentVideoPath="/Mondes-immerges/interface/videos/globe-video.webm",this.aberrationVideoPath="/Mondes-immerges/interface/videos/globe-video-aberration.webm",this.init()}init(){this.scene=new K;const e=new z(16777215,1.2);this.scene.add(e);const t=new R(16777215,.5);t.position.set(5,10,7),this.scene.add(t),this.scene.fog=new H(0,15e-5),this.camera=new Z(60,window.innerWidth/window.innerHeight,.1,1e3),this.updateCameraPosition();try{const i=window.innerWidth<768||/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),o=i||navigator.hardwareConcurrency&&navigator.hardwareConcurrency<4;this.renderer=new Q({antialias:!i,alpha:!0,logarithmicDepthBuffer:!o,powerPreference:"high-performance",precision:i?"mediump":"highp"}),this.renderer.setSize(window.innerWidth,window.innerHeight),this.renderer.setPixelRatio(i?1:Math.min(window.devicePixelRatio,2)),this.renderer.shadowMap.enabled=!1,this.isMobile=i,this.container.appendChild(this.renderer.domElement);const s=this.renderer.domElement;s.addEventListener("webglcontextlost",n=>{n.preventDefault(),this._contextLost=!0,P.onContextLost()}),s.addEventListener("webglcontextrestored",()=>{this._contextLost=!1,P.onContextRestored()})}catch(i){this.handleWebGLError();return}this.skyboxLoaded=!1,this.setupLighting(),this.createOrbitPath(),window.addEventListener("resize",this.onWindowResize.bind(this)),this.container.addEventListener("click",this.onMouseClick.bind(this))}handleWebGLError(){const e=document.createElement("div");e.style.cssText=`
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: rgba(0, 0, 0, 0.9);
            color: #ffdd00;
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            font-family: 'Roboto Mono', monospace;
            z-index: 10000;
            border: 2px solid #ffdd00;
            max-width: 500px;
        `,e.innerHTML=`
            <h2>Erreur d'initialisation 3D</h2>
            <p>Impossible d'initialiser le rendu WebGL.</p>
            <p>Veuillez vérifier que votre navigateur supporte WebGL.</p>
            <button onclick="location.reload()" style="background: #ffdd00; color: #000; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-family: inherit; margin-top: 10px;">
                Réessayer
            </button>
        `,this.container.appendChild(e)}setupLighting(){const e=new z(4210768,.5);this.scene.add(e);const t=new R(16777215,1);t.position.copy(this.celestialParams.sunPosition),t.castShadow=!1,this.scene.add(t),this.sunLight=t;const i=new J(35071,65416,.6);this.scene.add(i)}createCelestialBodies(){const e=new D,t=e.load("/Mondes-immerges/interface/images/sun-texture.jpg"),i=new E(3,32,32),o=new C({map:t,transparent:!0,opacity:.95}),s=new w(i,o);s.position.copy(this.celestialParams.sunPosition),this.scene.add(s);const n=e.load("/Mondes-immerges/interface/images/moon-texture.jpg"),a=new E(1.5,32,32),l=new ee({map:n}),d=new w(a,l);d.position.copy(this.celestialParams.moonPosition),this.scene.add(d),this.sun=s,this.moon=d}createOrbitPath(){const e=[];for(let s=0;s<=100;s++){const n=s/100*Math.PI*2,a=this.orbitParams.ellipseMajorAxis,l=this.orbitParams.ellipseMinorAxis,d=this.orbitParams.inclination;let u=a*Math.cos(n),h=l*Math.sin(n);const p=h*Math.sin(d);h=h*Math.cos(d),e.push(new M(u,p,h))}new te().setFromPoints(e);const i=new E(.2,16,16),o=new C({color:16763904,transparent:!0,opacity:.9});this.cameraMarker=new w(i,o),this.scene.add(this.cameraMarker)}createGlobe(){return x("GLOBE","Création du globe..."),new Promise((e,t)=>{const i=document.createElement("video");x("GLOBE","Chemin vidéo:",this.currentVideoPath),i.src=this.currentVideoPath,i.loop=!0,i.muted=!0,i.autoplay=!1,i.playsInline=!0,i.crossOrigin="anonymous",i.preload="auto",this.videoElement=i;let o=!1;const s=setTimeout(()=>{o||(o=!0,e())},1e4);i.addEventListener("canplaythrough",()=>{o||(o=!0,clearTimeout(s),e())},{once:!0}),i.addEventListener("canplay",()=>{o||(o=!0,clearTimeout(s),e())},{once:!0}),i.addEventListener("error",m=>{o||(o=!0,clearTimeout(s),e())}),P.register(i,{loop:!0,muted:!0,autoRetry:!0,name:"globe-texture",onError:m=>{},onPlay:()=>{}}),this.videoTexture=new ie(i),this.videoTexture.minFilter=$,this.videoTexture.magFilter=$,this.videoTexture.format=oe,this.videoTexture.colorSpace=se;const n=new E(1.99,64,64),a=new C({color:0,transparent:!0,opacity:0,colorWrite:!1,depthWrite:!0,side:N}),l=new w(n,a);l.renderOrder=0,this.scene.add(l),this.depthSphere=l;const d=new E(2,64,64),u=new C({map:this.videoTexture,transparent:!0,opacity:1,side:N,depthTest:!0,depthWrite:!1,color:16777215,toneMapped:!1});this.globe=new w(d,u),this.globe.castShadow=!0,this.globe.receiveShadow=!0,this.globe.renderOrder=1,this.scene.add(this.globe);const h=new E(2.02,64,64),p=new C({color:16777215,transparent:!0,opacity:.4,alphaTest:.1,depthTest:!0,depthWrite:!1});this.clouds=new w(h,p),this.clouds.renderOrder=2,this.scene.add(this.clouds),i.load()})}createAtmosphere(){const e=new E(2.15,64,64),t=new V({vertexShader:`
                varying vec3 vNormal;
                varying vec3 vWorldPosition;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,fragmentShader:`
                precision mediump float;

                varying vec3 vNormal;
                varying vec3 vWorldPosition;

                void main() {
                    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
                    float fresnel = 1.0 - abs(dot(viewDirection, vNormal));

                    float distance = length(cameraPosition - vWorldPosition);
                    float attenuation = 1.0 / (1.0 + distance * 0.03);

                    vec3 atmosphereColor = vec3(0.4, 0.7, 1.0);
                    float intensity = pow(fresnel, 1.2) * attenuation;

                    gl_FragColor = vec4(atmosphereColor, intensity * 0.55);
                }
            `,blending:G,side:j,transparent:!0}),i=new w(e,t);this.scene.add(i),this.atmosphere=i}createSkybox(){return new Promise((e,t)=>{const i=new D,o="/Mondes-immerges/interface/images/night-sky.png";x("SKYBOX","Chargement texture:",o);let s=!1;const n=setTimeout(()=>{s||(k("SKYBOX","TIMEOUT 15s — fallback couleur unie"),this.scene.background=new T(17),s=!0,e())},15e3);i.load(o,a=>{if(!s){try{x("SKYBOX","Texture chargée OK, dimensions:",a.image.width,"x",a.image.height),this.renderer.toneMapping=ne,this.renderer.toneMappingExposure=.6;const l=this.isMobile?512:1024,d=Math.min(a.image.height,l);x("SKYBOX","Cubemap size:",d,"(max:",l,")");const u=new ae(d);u.fromEquirectangularTexture(this.renderer,a),this.scene.background=u.texture,x("SKYBOX","Skybox appliquée avec succès"),a.dispose(),this.scene.fog=new H(17,5e-5)}catch(l){S("SKYBOX","Erreur création cubemap:",l.message),this.scene.background=new T(17)}s=!0,clearTimeout(n),e()}},a=>{a.lengthComputable&&x("SKYBOX","Progression:",Math.round(a.loaded/a.total*100)+"%")},a=>{s||(S("SKYBOX","ERREUR chargement texture:",a),S("SKYBOX","Chemin tenté:",o),this.scene.background=new T(17),s=!0,clearTimeout(n),e())})})}preloadAllAssets(){return x("PRELOAD","Début préchargement de tous les assets..."),Promise.all([this.createGlobe(),this.createSkybox()]).then(()=>{x("PRELOAD","Tous les assets chargés OK"),this.videoElement?(x("PRELOAD","Lecture vidéo globe..."),this.videoElement.play().catch(e=>{k("PRELOAD","Erreur lecture vidéo:",e.message)})):k("PRELOAD","Pas de videoElement !"),P.startMonitoring(2e3)}).catch(e=>{S("PRELOAD","Erreur préchargement:",e),this.videoElement&&this.videoElement.play().catch(t=>{k("PRELOAD","Erreur lecture vidéo (fallback):",t.message)}),P.startMonitoring(2e3)})}updateCameraPosition(){if(!this.orbitParams.isOrbiting)return;const e=this.orbitParams.ellipseMajorAxis*this.orbitParams.zoomLevel,t=this.orbitParams.ellipseMinorAxis*this.orbitParams.zoomLevel;let i=e*Math.cos(this.orbitParams.orbitAngle),o=t*Math.sin(this.orbitParams.orbitAngle);const s=this.orbitParams.inclination,n=o*Math.sin(s);o=o*Math.cos(s),this.camera.position.set(i,n,o),this.camera.lookAt(0,0,0),this.cameraMarker&&this.cameraMarker.position.set(i,n,o),this.orbitParams.orbitAngle+=this.orbitParams.currentSpeed,this.orbitParams.orbitHistory.push(new M(i,n,o)),this.orbitParams.orbitHistory.length>100&&this.orbitParams.orbitHistory.shift()}_updateCameraPositionManual(){const e=this.orbitParams.ellipseMajorAxis*this.orbitParams.zoomLevel,t=this.orbitParams.ellipseMinorAxis*this.orbitParams.zoomLevel;let i=e*Math.cos(this.orbitParams.orbitAngle),o=t*Math.sin(this.orbitParams.orbitAngle);const s=this.orbitParams.inclination,n=o*Math.sin(s);o=o*Math.cos(s),this.camera.position.set(i,n,o),this.camera.lookAt(0,0,0),this.cameraMarker&&this.cameraMarker.position.copy(this.camera.position)}addHotspots(e){this.hotspotObjects.forEach(t=>{if(this.scene.remove(t),t.userData.label&&t.userData.labelHandlers){const{onMouseEnter:i,onMouseLeave:o,onClick:s}=t.userData.labelHandlers;t.userData.label.removeEventListener("mouseenter",i),t.userData.label.removeEventListener("mouseleave",o),t.userData.label.removeEventListener("click",s)}t.userData.label&&t.userData.label.parentNode&&t.userData.label.parentNode.removeChild(t.userData.label),t.userData.connectorSvg&&t.userData.connectorSvg.parentNode&&t.userData.connectorSvg.parentNode.removeChild(t.userData.connectorSvg),t.userData.labelContainer&&t.userData.labelContainer.parentNode&&t.userData.labelContainer.parentNode.removeChild(t.userData.labelContainer)}),this.hotspotObjects=[],document.querySelectorAll(".hotspot-label").forEach(t=>t.remove()),document.querySelectorAll(".hotspot-label-container").forEach(t=>t.remove()),document.querySelectorAll(".connector-line").forEach(t=>t.remove()),e.forEach(t=>{const{position:i,title:o}=t,s=i.lat*(Math.PI/180),n=i.lng*(Math.PI/180),d=2+.15,u=d*Math.cos(s)*Math.cos(n),h=d*Math.sin(s),p=d*Math.cos(s)*Math.sin(n),m=new E(.05,16,16),b=new C({color:16768256,transparent:!0,opacity:0,depthTest:!0,depthWrite:!0,toneMapped:!1}),f=new w(m,b);f.position.set(u,h,p),f.userData={hotspot:t};const y=new E(.08,16,16),I=new C({color:16768256,transparent:!0,opacity:0,side:j,depthTest:!0,depthWrite:!1,toneMapped:!1}),B=new w(y,I);f.add(B),f.userData.materials=[b,I],this.addHotspotLabel(f,o,new M(u,h,p)),this.scene.add(f),this.hotspotObjects.push(f)})}addHotspotLabel(e,t,i){const o=document.createElement("div");o.className="hotspot-label",o.textContent=t,o.style.cssText=`
            position: fixed;
            background-color: rgba(0, 0, 0, 0.85);
            color: #ffdd00;
            padding: 6px 12px;
            border-radius: 4px;
            font-family: 'Roboto Mono', monospace;
            font-size: 12px;
            white-space: nowrap;
            opacity: 0;
            border: 1px solid rgba(255, 204, 0, 0.7);
            z-index: 1000;
            pointer-events: auto;
            cursor: pointer;
            transition: opacity 0.3s ease;
        `;const s=document.createElementNS("http://www.w3.org/2000/svg","svg");s.classList.add("hotspot-connector"),s.style.cssText=`
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 50;
            opacity: 0;
        `;const n=document.createElementNS("http://www.w3.org/2000/svg","line");n.setAttribute("stroke","rgba(255, 204, 0, 0.6)"),n.setAttribute("stroke-width","1.5"),n.setAttribute("stroke-dasharray","4, 4"),s.appendChild(n),document.body.appendChild(o),document.body.appendChild(s);const a=()=>{o.style.backgroundColor="rgba(255, 204, 0, 0.9)",o.style.color="#000",o.style.transform="scale(1.05)"},l=()=>{o.style.backgroundColor="rgba(0, 0, 0, 0.8)",o.style.color="#ffdd00",o.style.transform="scale(1)"},d=u=>{u.stopPropagation();const h=e.userData.hotspot;h&&this.activateHotspot(h)};o.addEventListener("mouseenter",a),o.addEventListener("mouseleave",l),o.addEventListener("click",d),e.userData.label=o,e.userData.connectorSvg=s,e.userData.connectorLine=n,e.userData.worldPosition=i.clone(),e.userData.labelHandlers={onMouseEnter:a,onMouseLeave:l,onClick:d},e.userData.labelText=t}onMouseClick(e){if(this.orbitParams.inHotspotMode)return;this.mouse.x=e.clientX/window.innerWidth*2-1,this.mouse.y=-(e.clientY/window.innerHeight)*2+1,this.raycaster.setFromCamera(this.mouse,this.camera);const t=this.raycaster.intersectObject(this.globe);if(t.length>0){const o=t[0].point,n=Math.acos(o.y/2),a=Math.atan2(o.z,o.x),l=90-n*180/Math.PI,d=a*180/Math.PI-180,u=this._findNearestHotspot(l,d,10);if(u){this.activateHotspot(u);return}}const i=this.raycaster.intersectObjects(this.hotspotObjects);if(i.length>0){const o=i[0].object.userData.hotspot;this.activateHotspot(o)}}_findNearestHotspot(e,t,i){let o=null,s=i;const n=this.hotspotObjects.map(a=>a.userData.hotspot).filter(Boolean);for(const a of n){const l=a.position.lat,d=a.position.lng,u=Math.sqrt(Math.pow(l-e,2)+Math.pow(d-t,2));u<s&&(s=u,o=a)}return o}activateHotspot(e){if(this.orbitParams.inHotspotMode)return;const t=e.position.lat*(Math.PI/180),i=e.position.lng*(Math.PI/180),o=2.1,s=o*Math.cos(t)*Math.cos(i),n=o*Math.sin(t),a=o*Math.cos(t)*Math.sin(i),l=new M(s,n,a);this.orbitParams.isOrbiting=!1;const d=this.camera.position.clone(),p=l.clone().normalize().multiplyScalar(5.2),m=new M().addVectors(d,p).multiplyScalar(.5);m.normalize().multiplyScalar(m.length()+1.8);const f=c.timeline();f.to(this.camera.position,{x:m.x,y:m.y,z:m.z,duration:1,ease:"power1.inOut",onUpdate:()=>{this.camera.lookAt(0,0,0)}});let y=document.getElementById("fade-overlay");y||(y=document.createElement("div"),y.id="fade-overlay",y.style.cssText=`
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: #000;
                opacity: 0;
                z-index: 98000;
                pointer-events: none;
            `,document.body.appendChild(y)),f.to(this.camera.position,{x:p.x,y:p.y,z:p.z,duration:1.2,ease:"power2.out",onUpdate:()=>{this.camera.lookAt(0,0,0)},onComplete:()=>{this.orbitParams.inHotspotMode=!0,this._redirectToExternalPage(e)}},"-=0.3"),f.to(y,{opacity:1,duration:.8,ease:"power2.in"},"-=0.8"),f.to(this.camera,{fov:55,duration:1.2,ease:"power2.out",onUpdate:()=>{this.camera.updateProjectionMatrix()}},"-=1.2")}_redirectToExternalPage(e){this.playTransitionVideoAndRedirect(e.id)}playTransitionVideoAndRedirect(e){const t=document.getElementById("transition-video-out");if(!t){const i=q(e);window.location.href=i;return}t.classList.add("active"),t.currentTime=0,t.play().then(()=>{t.addEventListener("ended",()=>{const i=q(e);window.location.href=i},{once:!0})}).catch(i=>{const o=q(e);window.location.href=o}),setTimeout(()=>{const i=q(e);window.location.href=i},1e4)}createScanEffect(e){const t=(90-e.lat)*(Math.PI/180),i=(e.lng+180)*(Math.PI/180),o=-(2.1*Math.sin(t)*Math.cos(i)),s=2.1*Math.cos(t),n=2.1*Math.sin(t)*Math.sin(i),a=new F(0,.3,32),l=new V({uniforms:{color:{value:new T(16763904)},time:{value:0}},vertexShader:`
               varying vec2 vUv;
               void main() {
                   vUv = uv;
                   gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
               }
           `,fragmentShader:`
               precision mediump float;

               uniform vec3 color;
               uniform float time;
               varying vec2 vUv;

               void main() {
                   float distance = length(vUv - vec2(0.5, 0.5)) * 2.0;
                   float alpha = smoothstep(0.8, 1.0, distance) * 0.8;

                   alpha *= (sin(time * 10.0) * 0.2 + 0.8);

                   gl_FragColor = vec4(color, alpha);
               }
           `,side:re,transparent:!0,blending:G,depthWrite:!1}),d=new w(a,l);d.position.set(o,s,n),d.lookAt(0,0,0),this.scene.add(d);let u=performance.now();const h=()=>{const p=(performance.now()-u)/1e3;l.uniforms.time.value=p,p<2?requestAnimationFrame(h):(this.scene.remove(d),d.geometry.dispose(),l.dispose())};h(),c.to(d.scale,{x:4,y:4,z:1,duration:2,ease:"power1.out"}),c.to(l.uniforms.color.value,{r:1,g:.8,b:.2,duration:2,ease:"power1.out"})}exitHotspotMode(){this.orbitParams.inHotspotMode&&(this.orbitParams.inHotspotMode=!1,c.to(this.camera,{fov:60,duration:1,ease:"power2.out",onUpdate:()=>{this.camera.updateProjectionMatrix()}}),setTimeout(()=>{this.orbitParams.isOrbiting=!0,this.orbitParams.currentSpeed=this.orbitParams.baseSpeed},500))}exitHotspotModeExternal(){this.exitHotspotMode()}handleVideoError(){new D().load("/Mondes-immerges/interface/images/video-placeholder.jpg",t=>{this.globe&&this.globe.material&&(this.globe.material.uniforms&&this.globe.material.uniforms.map?this.globe.material.uniforms.map.value=t:this.globe.material.map=t,this.globe.material.needsUpdate=!0)})}zoom(e){const t=e?.85:1.15,i=this.orbitParams.zoomLevel*t;this.orbitParams.zoomLevel=Math.min(Math.max(i,this.orbitParams.minZoomLevel),this.orbitParams.maxZoomLevel),c.to(this.camera.position,{x:this.camera.position.x*t,y:this.camera.position.y*t,z:this.camera.position.z*t,duration:.5,ease:"back.out(1.2)",onUpdate:()=>{this.camera.lookAt(0,0,0)}})}resetView(){this.orbitParams.zoomLevel=1,this.orbitParams.currentSpeed=this.orbitParams.baseSpeed;const e=this.orbitParams.ellipseMajorAxis,t=this.orbitParams.ellipseMinorAxis,i=this.orbitParams.inclination,o=this.orbitParams.orbitAngle,s=e*Math.cos(o),n=t*Math.sin(o),a=n*Math.sin(i),l=n*Math.cos(i);c.to(this.camera.position,{x:s,y:a,z:l,duration:1,ease:"elastic.out(1, 0.7)",onUpdate:()=>{this.camera.lookAt(0,0,0)}})}onWindowResize(){this.camera.aspect=window.innerWidth/window.innerHeight,this.camera.updateProjectionMatrix(),this.renderer.setSize(window.innerWidth,window.innerHeight)}setHotspotSelectCallback(e){this.onHotspotSelect=e}setHotspotExitCallback(e){this.onHotspotExit=e}updateHotspotLabels(){if(this.orbitParams.inHotspotMode){this.hotspotObjects.forEach(e=>{e.userData.label&&(e.userData.label.style.opacity="0"),e.userData.connectorSvg&&(e.userData.connectorSvg.style.opacity="0")});return}this.hotspotObjects.forEach(e=>{if(!e.userData.label||!e.userData.worldPosition)return;const t=e.userData.worldPosition,i=t.clone().project(this.camera);if(i.z>1||i.x<-1||i.x>1||i.y<-1||i.y>1){e.userData.label.style.opacity="0",e.userData.connectorSvg.style.opacity="0";return}const o=new M().subVectors(t,this.camera.position).normalize(),n=new O(this.camera.position,o).intersectObject(this.globe);if(n.length>0){const y=n[0].distance,I=this.camera.position.distanceTo(t);if(y<I-.1){e.userData.label.style.opacity="0",e.userData.connectorSvg.style.opacity="0";return}}const a=(i.x*.5+.5)*window.innerWidth,l=(-i.y*.5+.5)*window.innerHeight,d=e.userData.labelText.length*7,u=40,h=-15;let p=a+u,m=l+h;const b=10;p+d>window.innerWidth-b&&(p=a-u-d),p<b&&(p=b),m<b&&(m=b),m>window.innerHeight-b&&(m=window.innerHeight-b),e.userData.label.style.left=`${p}px`,e.userData.label.style.top=`${m}px`,this.labelsVisible&&(e.userData.label.style.opacity="1");const f=e.userData.connectorLine;f&&(f.setAttribute("x1",a),f.setAttribute("y1",l),f.setAttribute("x2",p),f.setAttribute("y2",m+10),this.labelsVisible&&(e.userData.connectorSvg.style.opacity="1"))})}showLabels(){this.labelsVisible=!0,this.hotspotObjects.forEach((e,t)=>{e.userData.materials&&e.userData.materials.forEach((i,o)=>{const s=o===0?.8:.5;c.to(i,{opacity:s,duration:.8,delay:t*.1,ease:"power2.out"})})})}animate(){if(requestAnimationFrame(this.animate.bind(this)),this._contextLost)return;const e=this.clock.getDelta(),t=this.clock.getElapsedTime()*1e3;this.orbitParams.isOrbiting&&!this.orbitParams.inHotspotMode&&this.updateCameraPosition(),this.updateSkyboxTime&&this.updateSkyboxTime(t),this.hotspotObjects.forEach(i=>{const o=i.userData.waveRings;o&&o.forEach(s=>{s.userData.waveTime+=e;const n=s.userData.waveTime-s.userData.initialDelay;if(n>0){const l=n%2.5/2.5,d=.05,h=d+(.18-d)*l;s.geometry.dispose(),s.geometry=new F(h,h+.02,32),s.material.opacity=.7*(1-l)}})}),this.updateHotspotLabels(),this.clouds&&(this.clouds.rotation.y+=1e-4),this.globe&&!this.orbitParams.inHotspotMode&&(this.globe.rotation.y+=2e-4),this.globe&&this.globe.material.uniforms&&this.globe.material.uniforms.time&&(this.globe.material.uniforms.time.value=t),this.renderer.render(this.scene,this.camera)}}class pe{constructor(e){this.container=e.container,this.effectsContainer=null,this.notificationContainer=null,this.init()}init(){this.effectsContainer=document.createElement("div"),this.effectsContainer.classList.add("effects-container"),this.effectsContainer.style.position="absolute",this.effectsContainer.style.top="0",this.effectsContainer.style.left="0",this.effectsContainer.style.width="100%",this.effectsContainer.style.height="100%",this.effectsContainer.style.pointerEvents="none",this.effectsContainer.style.zIndex="5",this.container.appendChild(this.effectsContainer),this.createNotificationContainer()}createNotificationContainer(){this.notificationContainer=document.createElement("div"),this.notificationContainer.className="notification-container",this.notificationContainer.style.cssText=`
            position: absolute;
            bottom: 30px;
            right: 30px;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 10px;
            z-index: 100;
            pointer-events: none;
            max-width: 400px;
        `,this.container.appendChild(this.notificationContainer)}transitionIn(){const e=document.createElement("div");e.classList.add("transition-overlay"),e.style.position="absolute",e.style.top="0",e.style.left="0",e.style.width="100%",e.style.height="100%",e.style.backgroundColor="#000000",e.style.zIndex="10",this.effectsContainer.appendChild(e),c.fromTo(e,{opacity:1},{opacity:0,duration:1.5,ease:"power2.out",onComplete:()=>{e.remove()}})}transitionOut(e){const t=document.createElement("div");t.classList.add("transition-overlay"),t.style.position="absolute",t.style.top="0",t.style.left="0",t.style.width="100%",t.style.height="100%",t.style.backgroundColor="#000000",t.style.zIndex="10",t.style.opacity="0",this.effectsContainer.appendChild(t),c.to(t,{opacity:1,duration:1,ease:"power2.in",onComplete:()=>{e&&e()}})}createOrbitalLoaderEffect(e,t=4,i=null){const o=document.createElement("div");o.className="orbital-loader",i?o.style.cssText=`
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 50;
                background-color: transparent;
            `:o.style.cssText=`
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 50;
                background-color: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(5px);
            `;const s=document.createElement("div");s.style.cssText=`
            width: 200px;
            height: 200px;
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
        `;for(let u=0;u<3;u++){const h=document.createElement("div");h.style.cssText=`
                position: absolute;
                border-radius: 50%;
                border: 2px solid rgba(255, 204, 0, ${.7-u*.2});
                width: ${120+u*40}px;
                height: ${120+u*40}px;
                animation: orbit${u} ${4-u*.5}s linear infinite;
            `;for(let p=0;p<3+u;p++){const m=document.createElement("div"),b=360/(3+u)*p;m.style.cssText=`
                    position: absolute;
                    width: ${8-u}px;
                    height: ${8-u}px;
                    background-color: #ffcc00;
                    border-radius: 50%;
                    top: 50%;
                    left: 50%;
                    box-shadow: 0 0 10px #ffcc00;
                    transform: translate(-50%, -50%) rotate(${b}deg) translateX(${60+u*20}px);
                `,h.appendChild(m)}s.appendChild(h)}const n=document.createElement("div");n.style.cssText=`
            width: 20px;
            height: 20px;
            background-color: #ffcc00;
            border-radius: 50%;
            box-shadow: 0 0 20px #ffcc00;
            animation: pulse 2s ease-in-out infinite;
        `,s.appendChild(n);const a=document.createElement("div");a.className="orbital-loading-text",a.style.cssText=`
            position: absolute;
            bottom: -60px;
            left: 50%;
            transform: translateX(-50%);
            color: #ffcc00;
            font-family: 'Roboto Mono', monospace;
            font-size: 14px;
            white-space: nowrap;
            letter-spacing: 1px;
        `,a.innerHTML=`
            Initialisation du système<span class="loading-dots"><span>.</span><span>.</span><span>.</span></span>
        `,s.appendChild(a),o.appendChild(s);const l=document.createElement("style");l.textContent=`
            @keyframes orbit0 {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            @keyframes orbit1 {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(-360deg); }
            }
            @keyframes orbit2 {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            @keyframes pulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.3); opacity: 0.7; }
            }

            /* Animation des points de chargement */
            .loading-dots span {
                opacity: 0;
                animation: dotFade 1.5s infinite;
            }
            .loading-dots span:nth-child(1) {
                animation-delay: 0s;
            }
            .loading-dots span:nth-child(2) {
                animation-delay: 0.5s;
            }
            .loading-dots span:nth-child(3) {
                animation-delay: 1s;
            }

            @keyframes dotFade {
                0%, 100% { opacity: 0; }
                50% { opacity: 1; }
            }
        `,document.head.appendChild(l),(i||this.effectsContainer).appendChild(o),c.fromTo(o,{opacity:0},{opacity:1,duration:.5,onComplete:()=>{i&&e&&e()}}),setTimeout(()=>{i?(o.remove(),l.remove()):c.to(o,{opacity:0,duration:1,onComplete:()=>{o.remove(),l.remove(),e&&e()}})},t*1e3)}highlightSelection(e){const t=document.createElement("div");t.classList.add("highlight-effect"),t.style.position="absolute",t.style.width="100px",t.style.height="100px",t.style.borderRadius="50%",t.style.border="2px solid #ffcc00",t.style.boxShadow="0 0 20px rgba(255, 204, 0, 0.5)",t.style.transform="translate(-50%, -50%)",t.style.pointerEvents="none",t.style.top="50%",t.style.left="50%",this.effectsContainer.appendChild(t),c.fromTo(t,{scale:.5,opacity:0},{scale:1.5,opacity:.8,duration:.8,ease:"elastic.out(1, 0.3)",onComplete:()=>{c.to(t,{scale:2,opacity:0,duration:.5,delay:.3,onComplete:()=>{t.remove()}})}})}createRadarScanEffect(e,t={}){const o={...{radius:50,duration:1,color:"rgba(255, 204, 0, 0.4)",pulseCount:1},...t};for(let s=0;s<o.pulseCount;s++)setTimeout(()=>{const n=document.createElement("div");n.style.cssText=`
                    position: absolute;
                    top: ${e.y}px;
                    left: ${e.x}px;
                    width: 10px;
                    height: 10px;
                    background-color: transparent;
                    border: 2px solid ${o.color};
                    border-radius: 50%;
                    transform: translate(-50%, -50%);
                    z-index: 100;
                    pointer-events: none;
                `,this.effectsContainer.appendChild(n),c.to(n,{width:o.radius*2,height:o.radius*2,opacity:0,duration:o.duration,ease:"power2.out",onComplete:()=>{n.remove()}})},s*(o.duration*300))}flashScreen(e="#ffffff"){const t=document.createElement("div");t.style.position="absolute",t.style.top="0",t.style.left="0",t.style.width="100%",t.style.height="100%",t.style.backgroundColor=e,t.style.pointerEvents="none",t.style.zIndex="20",t.style.opacity="0",this.effectsContainer.appendChild(t),c.timeline().to(t,{opacity:.7,duration:.1}).to(t,{opacity:0,duration:.3,onComplete:()=>{t.remove()}})}showNotification(e,t="info",i=3e3){this.notificationContainer||this.createNotificationContainer();const o=document.createElement("div");o.className="notification";let s="",n="#2196F3";switch(t){case"success":s="✓",n="#4CAF50";break;case"warning":s="!",n="#FF9800";break;case"error":s="✗",n="#F44336";break;default:s="i",n="#2196F3"}o.innerHTML=`
            <div class="notification-icon" style="background-color: ${n};">${s}</div>
            <div class="notification-message">${e}</div>
        `,o.style.cssText=`
            display: flex;
            align-items: center;
            gap: 12px;
            background-color: rgba(0, 10, 30, 0.85);
            color: #ffffff;
            padding: 12px 16px;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            font-family: 'Roboto Mono', monospace;
            font-size: 14px;
            max-width: 100%;
            pointer-events: all;
            transform: translateX(50px);
            opacity: 0;
            border-left: 3px solid ${n};
            backdrop-filter: blur(5px);
        `;const a=o.querySelector(".notification-icon");a&&(a.style.cssText=`
                display: flex;
                align-items: center;
                justify-content: center;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                color: white;
                font-weight: bold;
                flex-shrink: 0;
            `);const l=o.querySelector(".notification-message");l&&(l.style.cssText=`
                flex: 1;
                line-height: 1.4;
            `),this.notificationContainer.appendChild(o),c.fromTo(o,{opacity:0,x:50},{opacity:1,x:0,duration:.4,ease:"power2.out"}),setTimeout(()=>{c.to(o,{opacity:0,x:50,duration:.4,ease:"power2.in",onComplete:()=>{o.remove()}})},i)}showSystemMessage(e){const t=document.createElement("div");t.className="system-message",t.textContent=e,t.style.cssText=`
            position: absolute;
            bottom: 20px;
            right: 20px;
            background-color: rgba(0, 10, 30, 0.8);
            color: #ffffff;
            padding: 10px 15px;
            border-radius: 6px;
            border-left: 3px solid #ffcc00;
            font-family: 'Roboto Mono', monospace;
            font-size: 12px;
            max-width: 400px;
            text-align: left;
            transform: translateY(20px);
            opacity: 0;
            z-index: 100;
            pointer-events: none;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(3px);
        `,this.effectsContainer.appendChild(t),c.timeline().to(t,{y:0,opacity:1,duration:.5,ease:"power2.out"}).to(t,{y:-10,opacity:0,duration:.5,delay:3,ease:"power2.in",onComplete:()=>{t.remove()}})}addBackgroundParticles(e={}){const i={...{count:50,container:this.container},...e},o=document.createElement("div");o.className="background-particles",o.style.cssText=`
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            z-index: 1;
            pointer-events: none;
        `;for(let s=0;s<i.count;s++){const n=document.createElement("div"),a=Math.random()*3+1,l=Math.random()*100,d=Math.random()*100,u=Math.random()*5,h=Math.random()*10+10,p=Math.random()*.5+.1;n.style.cssText=`
                position: absolute;
                width: ${a}px;
                height: ${a}px;
                background-color: rgba(255, 255, 255, ${p});
                border-radius: 50%;
                top: ${d}%;
                left: ${l}%;
                box-shadow: 0 0 ${a*2}px rgba(255, 255, 255, ${p*.8});
            `,c.to(n,{y:`${Math.random()*20-10}%`,x:`${Math.random()*20-10}%`,opacity:Math.random()*.5+.1,duration:h,delay:u,repeat:-1,yoyo:!0,ease:"sine.inOut"}),o.appendChild(n)}i.container.appendChild(o)}}function he(...r){console.log("[INTERACTION]",...r)}class me{constructor(e){this.globeManager=e.globeManager,this.visualEffects=e.visualEffects,this.isDragging=!1,this.lastTouchTime=0,this.touchTimeout=null,this.mouseStartY=0,this.mouseStartX=0,this.scrollAmount=0,this.lastPosition={x:0,y:0},this.scrollTimerId=null,this.scrollSpeed=0,this.lastScrollTime=0,this.scrollAccumulator=0,this.orbitVelocity=0,this.inclinationVelocity=0,this.orbitAnimationId=null,this.initialDistance=0,this.currentDistance=0,this.isPinching=!1,this.movementThreshold=5,this.swipeThreshold=80,this.hasMoved=!1,this.interfaceVisible=!0,this.autoHideTimeout=null,he("Initialisation des interactions (drag désactivé, molette = orbite fluide)"),this.init()}init(){const e=this.globeManager.container;e.addEventListener("wheel",this.handleMouseWheel.bind(this),{passive:!1}),e.addEventListener("mousedown",this.handleMouseDown.bind(this)),document.addEventListener("mousemove",this.handleMouseMove.bind(this)),document.addEventListener("mouseup",this.handleMouseUp.bind(this)),e.addEventListener("touchstart",this.handleTouchStart.bind(this),{passive:!1}),e.addEventListener("touchmove",this.handleTouchMove.bind(this),{passive:!1}),e.addEventListener("touchend",this.handleTouchEnd.bind(this)),document.addEventListener("keydown",this.handleKeyDown.bind(this)),document.addEventListener("mousemove",this.resetInterfaceAutoHide.bind(this)),this.startInterfaceAutoHide()}handleMouseDown(e){this.hasMoved=!1,this.mouseStartX=e.clientX,this.mouseStartY=e.clientY}handleMouseMove(e){const t=e.clientX-this.mouseStartX,i=e.clientY-this.mouseStartY;(Math.abs(t)>this.movementThreshold||Math.abs(i)>this.movementThreshold)&&(this.hasMoved=!0)}handleMouseUp(e){}animateOrbitInertia(){if(this.orbitVelocity*=.92,this.inclinationVelocity*=.92,Math.abs(this.orbitVelocity)<5e-5&&Math.abs(this.inclinationVelocity)<5e-5){this.orbitAnimationId=null;return}if(this.globeManager.orbitParams.orbitAngle+=this.orbitVelocity,Math.abs(this.inclinationVelocity)>1e-5){const t=this.globeManager.orbitParams.inclination+this.inclinationVelocity;this.globeManager.orbitParams.inclination=Math.max(.1,Math.min(Math.PI/3,t))}typeof this.globeManager._updateCameraPositionManual=="function"&&this.globeManager._updateCameraPositionManual(),this.orbitAnimationId=requestAnimationFrame(()=>this.animateOrbitInertia())}handleTouchStart(e){e.touches.length===1?(this.hasMoved=!1,this.mouseStartX=e.touches[0].clientX,this.mouseStartY=e.touches[0].clientY,this.scrollAmount=0):e.touches.length===2&&(this.isPinching=!0,this.initialDistance=this.getTouchDistance(e.touches))}getTouchDistance(e){const t=e[0].clientX-e[1].clientX,i=e[0].clientY-e[1].clientY;return Math.sqrt(t*t+i*i)}handleTouchEnd(e){this.isPinching&&e.touches.length<2&&(this.isPinching=!1)}handleTouchMove(e){if(e.preventDefault(),this.isPinching&&e.touches.length===2){this.currentDistance=this.getTouchDistance(e.touches);const t=this.currentDistance/this.initialDistance;t>1.05?(this.globeManager.zoom(!0),this.initialDistance=this.currentDistance):t<.95&&(this.globeManager.zoom(!1),this.initialDistance=this.currentDistance);return}if(e.touches.length===1&&this.globeManager.orbitParams.inHotspotMode){const t=e.touches[0].clientY,i=t-this.mouseStartY;this.scrollAmount+=i,this.scrollAmount>150&&(this.globeManager.exitHotspotModeExternal(),this.scrollAmount=0),this.mouseStartY=t}}handleMouseWheel(e){e.preventDefault(),this.showInterface(),this.resetInterfaceAutoHide();let t=e.deltaY;if(e.deltaMode===1&&(t*=40),e.deltaMode===2&&(t*=800),this.orbitVelocity+=t*15e-5,e.deltaX!==0){let i=e.deltaX;e.deltaMode===1&&(i*=40),e.deltaMode===2&&(i*=800),this.inclinationVelocity-=i*1e-4}this.orbitAnimationId||(this.orbitAnimationId=requestAnimationFrame(()=>this.animateOrbitInertia()))}handleKeyDown(e){switch(this.showInterface(),this.resetInterfaceAutoHide(),e.key){case"Escape":this.globeManager.orbitParams.inHotspotMode&&(this.globeManager.exitHotspotModeExternal(),this.visualEffects&&(this.visualEffects.flashScreen("rgba(0, 0, 0, 0.4)"),this.visualEffects.showNotification("Retour à l'exploration globale","info",2e3)));break;case"ArrowUp":case"ArrowDown":case"ArrowLeft":case"ArrowRight":e.preventDefault(),this.globeManager.orbitParams.inHotspotMode&&e.key==="ArrowDown"?(this.globeManager.exitHotspotModeExternal(),this.visualEffects&&(this.visualEffects.flashScreen("rgba(0, 0, 0, 0.4)"),this.visualEffects.showNotification("Retour à l'exploration globale","info",2e3))):this.handleArrowNavigation(e.key);break;case"+":case"=":this.globeManager.zoom(!0);break;case"-":case"_":this.globeManager.zoom(!1);break;case"r":case"R":this.globeManager.resetView(),this.visualEffects&&(this.visualEffects.flashScreen("rgba(255, 255, 255, 0.2)"),this.visualEffects.showNotification("Vue réinitialisée","info",2e3));break;case"h":case"H":this.toggleInterface();break}}handleArrowNavigation(e){try{const t=this.globeManager.orbitParams.orbitAngle,i=this.globeManager.orbitParams.isOrbiting;switch(this.globeManager.orbitParams.isOrbiting=!1,e){case"ArrowLeft":this.globeManager.orbitParams.orbitAngle+=.05;break;case"ArrowRight":this.globeManager.orbitParams.orbitAngle-=.05;break;case"ArrowUp":this.globeManager.orbitParams.inHotspotMode||(this.globeManager.orbitParams.inclination=Math.min(this.globeManager.orbitParams.inclination+.03,Math.PI/3));break;case"ArrowDown":this.globeManager.orbitParams.inHotspotMode||(this.globeManager.orbitParams.inclination=Math.max(this.globeManager.orbitParams.inclination-.03,.1));break}typeof this.globeManager._updateCameraPositionManual=="function"&&this.globeManager._updateCameraPositionManual(),setTimeout(()=>{this.globeManager.orbitParams.isOrbiting=i},500)}catch(t){this.globeManager&&this.globeManager.orbitParams&&(this.globeManager.orbitParams.isOrbiting=!0)}}startInterfaceAutoHide(){this.autoHideTimeout&&clearTimeout(this.autoHideTimeout),this.autoHideTimeout=setTimeout(()=>{this.hideInterface()},1e4)}resetInterfaceAutoHide(){this.showInterface(),this.startInterfaceAutoHide()}hideInterface(){if(!this.interfaceVisible)return;this.interfaceVisible=!1;const e=document.getElementById("ui-controls"),t=document.querySelectorAll(".satellite-hud, .coordinates-display"),i=document.querySelector(".satellite-crosshair");c.to(e,{opacity:0,y:20,duration:.5,ease:"power2.inOut"}),c.to([...t,i],{opacity:0,duration:.5,ease:"power2.inOut"}),setTimeout(()=>{this.interfaceVisible||(e.style.pointerEvents="none")},500)}showInterface(){if(this.interfaceVisible)return;this.interfaceVisible=!0;const e=document.getElementById("ui-controls"),t=document.querySelectorAll(".satellite-hud, .coordinates-display"),i=document.querySelector(".satellite-crosshair");e.style.pointerEvents="auto",c.to(e,{opacity:1,y:0,duration:.5,ease:"power2.out"}),c.to([...t,i],{opacity:1,duration:.5,ease:"power2.out"})}toggleInterface(){this.interfaceVisible?this.hideInterface():(this.showInterface(),this.startInterfaceAutoHide())}}class fe{constructor(e){this.options=e,this.zoomInBtn=e.zoomInBtn,this.zoomOutBtn=e.zoomOutBtn,this.resetViewBtn=e.resetViewBtn,this.infoBtn=e.infoBtn,this.closeInfoBtn=e.closeInfoBtn,this.infoOverlay=e.infoOverlay,this.globeManager=e.globeManager,this.isInfoVisible=!1,this.buttons=[],this.notificationContainer=null,this.init()}init(){this.applyEnhancedStyles(),this.buttons=[this.zoomInBtn,this.zoomOutBtn,this.resetViewBtn,this.infoBtn],this.zoomInBtn.addEventListener("click",()=>{this.globeManager.zoom(!0),this.animateButtonClick(this.zoomInBtn)}),this.zoomOutBtn.addEventListener("click",()=>{this.globeManager.zoom(!1),this.animateButtonClick(this.zoomOutBtn)}),this.resetViewBtn.addEventListener("click",()=>{this.globeManager.resetView(),this.animateButtonClick(this.resetViewBtn)}),this.infoBtn.addEventListener("click",()=>{this.toggleInfoOverlay(),this.animateButtonClick(this.infoBtn)}),this.closeInfoBtn.addEventListener("click",()=>{this.hideInfoOverlay()}),this.createNotificationContainer(),this.animateButtonsIn()}applyEnhancedStyles(){const e=document.getElementById("ui-controls");e&&(e.style.cssText=`
                position: absolute;
                bottom: 30px;
                left: 30px;
                z-index: 50;
                transition: opacity 0.3s ease, transform 0.3s ease;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 15px;
            `);const t=document.getElementById("navigation-controls");if(t&&(t.style.cssText=`
				display: flex;
				flex-direction: column;
				gap: 20px; /* espace plus large entre les boutons */
				background: none;
				padding: 0;
				border: none;
				box-shadow: none;
`),(t?t.querySelectorAll("button"):[]).forEach(o=>{o.style.cssText=`
                width: 70px;
                height: 70px;
                border: 2px solid rgba(255, 204, 0, 0.7);              
                border-radius: 50%;
                cursor: pointer;
                transition: all 0.3s ease;
                font-family: 'Roboto Mono', monospace;
                letter-spacing: 1px;
                font-size: 23px;
                font-weight: bold;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0), 0 0 4px rgba(255, 204, 0, 0.4);
            `,o.addEventListener("mouseenter",()=>{c.to(o,{backgroundColor:"rgba(255, 204, 0, 0.9)",color:"#000000",borderColor:"#ffcc00",boxShadow:"0 2px 15px rgba(255, 204, 0, 0.5), 0 0 8px rgba(255, 204, 0, 0.7)",duration:.25})}),o.addEventListener("mouseleave",()=>{c.to(o,{backgroundColor:"rgba(0, 10, 30, 0.7)",color:"#ffcc00",borderColor:"rgba(255, 204, 0, 0.7)",boxShadow:"0 2px 10px rgba(0, 0, 0, 0.3), 0 0 4px rgba(255, 204, 0, 0.4)",duration:.3})})}),this.infoBtn&&(this.infoBtn.style.cssText=`
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background-color: rgba(0, 10, 30, 0.7);
                color: #ffcc00;
                border: 2px solid rgba(255, 204, 0, 0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                cursor: pointer;
                transition: all 0.3s ease;
                font-family: 'Roboto Mono', monospace;
                font-size: 18px;
                font-weight: bold;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3), 0 0 4px rgba(255, 204, 0, 0.4);
            `,this.infoBtn.addEventListener("mouseenter",()=>{c.to(this.infoBtn,{backgroundColor:"rgba(255, 204, 0, 0.9)",color:"#000000",borderColor:"#ffcc00",boxShadow:"0 2px 15px rgba(255, 204, 0, 0.5), 0 0 8px rgba(255, 204, 0, 0.7)",duration:.3})}),this.infoBtn.addEventListener("mouseleave",()=>{c.to(this.infoBtn,{backgroundColor:"rgba(0, 10, 30, 0.7)",color:"#ffcc00",borderColor:"rgba(255, 204, 0, 0.7)",boxShadow:"0 2px 10px rgba(0, 0, 0, 0.3), 0 0 4px rgba(255, 204, 0, 0.4)",duration:.3})})),this.infoOverlay){this.infoOverlay.style.cssText=`
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.85);
                backdrop-filter: blur(10px);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 200;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.5s ease;
            `;const o=this.infoOverlay.querySelector(".overlay-content");if(o){o.style.cssText=`
                    background: linear-gradient(to bottom, rgba(0, 40, 94, 0.9), rgba(0, 20, 47, 0.9));
                    padding: 40px;
                    border-radius: 10px;
                    max-width: 700px;
                    text-align: center;
                    position: relative;
                    border: 1px solid var(--nat-geo-yellow);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 15px rgba(255, 204, 0, 0.3);
                `;const s=o.querySelector("h3");if(s&&(s.style.cssText=`
                        font-size: 2rem;
                        margin-bottom: 30px;
                        color: #ffcc00;
                        letter-spacing: 2px;
                        text-transform: uppercase;
                        font-family: 'Roboto Mono', monospace;
                        font-weight: 700;
                        text-shadow: 0 0 10px rgba(255, 204, 0, 0.5);
                    `),o.querySelectorAll("p").forEach(a=>{a.style.cssText=`
                        margin-bottom: 25px;
                        line-height: 1.8;
                        color: #e0e0e0;
                        font-size: 1.1rem;
                        font-family: 'Merriweather Sans', 'Source Sans Pro', sans-serif;
                        text-align: justify;
                    `}),this.closeInfoBtn){this.closeInfoBtn.style.cssText=`
                        padding: 12px 32px;
                        background-color: transparent;
                        color: #ffcc00;
                        border: 2px solid #ffcc00;
                        border-radius: 30px;
                        cursor: pointer;
                        font-weight: 600;
                        transition: all 0.3s ease;
                        font-family: 'Roboto Mono', monospace;
                        letter-spacing: 1px;
                        position: relative;
                        overflow: hidden;
                        z-index: 1;
                        font-size: 16px;
                    `;const a=document.createElement("style");a.textContent=`
                        #close-info::before {
                            content: "";
                            position: absolute;
                            left: -100%;
                            top: 0;
                            width: 100%;
                            height: 100%;
                            background-color: #ffcc00;
                            transition: all 0.3s ease;
                            z-index: -1;
                        }
                        
                        #close-info:hover {
                            color: #000000;
                            box-shadow: 0 0 15px rgba(255, 204, 0, 0.5);
                        }
                        
                        #close-info:hover::before {
                            left: 0;
                        }
                    `,document.head.appendChild(a)}}}}createNotificationContainer(){this.notificationContainer=document.createElement("div"),this.notificationContainer.className="notifications-container",this.notificationContainer.style.cssText=`
            position: absolute;
            bottom: 30px;
            right: 30px;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 10px;
            z-index: 100;
            pointer-events: none;
            max-width: 400px;
        `,document.getElementById("main-container").appendChild(this.notificationContainer)}animateButtonsIn(){this.buttons.forEach(e=>{c.set(e,{opacity:0,y:20,scale:.8})}),this.buttons.forEach((e,t)=>{c.to(e,{opacity:1,y:0,scale:1,duration:.7,delay:1.5+t*.15,ease:"back.out(1.7)"})})}animateButtonClick(e){c.timeline().to(e,{scale:.85,duration:.15,ease:"power2.in"}).to(e,{scale:1,duration:.4,ease:"elastic.out(1.2, 0.5)"})}toggleInfoOverlay(){this.isInfoVisible?this.hideInfoOverlay():this.showInfoOverlay()}showInfoOverlay(){if(this.isInfoVisible)return;this.isInfoVisible=!0,this.infoOverlay.classList.add("visible"),c.to(this.infoOverlay,{opacity:1,duration:.4,ease:"power2.out",onStart:()=>{this.infoOverlay.style.pointerEvents="all"}});const e=this.infoOverlay.querySelector(".overlay-content");c.fromTo(e,{opacity:0,y:30,scale:.95},{opacity:1,y:0,scale:1,duration:.6,delay:.1,ease:"back.out(1.7)"}),e.querySelectorAll("h3, p, button").forEach((i,o)=>{c.fromTo(i,{opacity:0,y:20},{opacity:1,y:0,duration:.5,delay:.3+o*.1,ease:"power2.out"})})}hideInfoOverlay(){if(!this.isInfoVisible)return;this.isInfoVisible=!1;const e=this.infoOverlay.querySelector(".overlay-content");c.to(e,{opacity:0,y:30,scale:.95,duration:.4,ease:"power3.in"}),c.to(this.infoOverlay,{opacity:0,duration:.5,delay:.2,ease:"power2.in",onComplete:()=>{this.infoOverlay.classList.remove("visible"),this.infoOverlay.style.pointerEvents="none"}})}showNotification(e,t="info",i=3e3){const o=document.createElement("div");o.classList.add("notification",`notification-${t}`);let s="",n="#2196F3";switch(t){case"success":s="✓",n="#4CAF50";break;case"warning":s="!",n="#FF9800";break;case"error":s="✗",n="#F44336";break;default:s="i",n="#2196F3"}o.innerHTML=`
            <div class="notification-icon" style="background-color: ${n};">${s}</div>
            <div class="notification-message">${e}</div>
        `,o.style.cssText=`
            display: flex;
            align-items: center;
            gap: 12px;
            background-color: rgba(0, 10, 30, 0.85);
            color: #ffffff;
            padding: 12px 16px;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            font-family: 'Roboto Mono', monospace;
            font-size: 14px;
            max-width: 100%;
            pointer-events: all;
            transform: translateX(50px);
            opacity: 0;
            border-left: 3px solid ${n};
            backdrop-filter: blur(5px);
        `;const a=`
            display: flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            color: white;
            font-weight: bold;
            flex-shrink: 0;
        `;o.querySelector(".notification-icon").style.cssText=a,o.querySelector(".notification-message").style.cssText=`
            flex: 1;
            line-height: 1.4;
        `,this.notificationContainer.appendChild(o),c.fromTo(o,{opacity:0,x:50},{opacity:1,x:0,duration:.4,ease:"power2.out"}),setTimeout(()=>{c.to(o,{opacity:0,x:50,duration:.4,ease:"power2.in",onComplete:()=>{o.remove()}})},i)}setUIVisibility(e){const t=e?1:0,i=e?0:20,o=e?"auto":"none",s=document.getElementById("ui-controls");s&&c.to(s,{opacity:t,y:i,duration:.4,ease:e?"power2.out":"power2.in",onComplete:()=>{s.style.pointerEvents=o}}),document.querySelectorAll(".satellite-hud, .coordinates-display").forEach(a=>{c.to(a,{opacity:t,duration:.4,ease:e?"power2.out":"power2.in"})})}showTooltip(e,t,i={}){const s={...{position:"top",duration:3e3,offset:10,className:""},...i},n=document.createElement("div");n.className=`tooltip ${s.className}`,n.textContent=t,n.style.cssText=`
            position: absolute;
            background-color: rgba(0, 10, 30, 0.9);
            color: #ffffff;
            padding: 8px 12px;
            border-radius: 4px;
            font-family: 'Roboto Mono', monospace;
            font-size: 12px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
            pointer-events: none;
            z-index: 1000;
            white-space: nowrap;
            opacity: 0;
            transform: scale(0.9);
            border: 1px solid rgba(255, 204, 0, 0.5);
        `,document.body.appendChild(n);const a=e.getBoundingClientRect();switch(s.position){case"top":n.style.bottom=`${window.innerHeight-a.top+s.offset}px`,n.style.left=`${a.left+a.width/2}px`,n.style.transform="translateX(-50%) scale(0.9)";break;case"bottom":n.style.top=`${a.bottom+s.offset}px`,n.style.left=`${a.left+a.width/2}px`,n.style.transform="translateX(-50%) scale(0.9)";break;case"left":n.style.top=`${a.top+a.height/2}px`,n.style.right=`${window.innerWidth-a.left+s.offset}px`,n.style.transform="translateY(-50%) scale(0.9)";break;case"right":n.style.top=`${a.top+a.height/2}px`,n.style.left=`${a.right+s.offset}px`,n.style.transform="translateY(-50%) scale(0.9)";break}return c.to(n,{opacity:1,scale:1,duration:.3,ease:"back.out(1.7)"}),setTimeout(()=>{c.to(n,{opacity:0,scale:.9,duration:.2,ease:"power2.in",onComplete:()=>{n.remove()}})},s.duration),{hide:()=>{c.to(n,{opacity:0,scale:.9,duration:.2,ease:"power2.in",onComplete:()=>{n.remove()}})}}}createMinimap(e,t){const i=document.createElement("div");i.className="minimap",i.style.cssText=`
            position: absolute;
            bottom: 30px;
            right: 30px;
            width: 200px;
            height: 100px;
            background-color: rgba(0, 10, 30, 0.7);
            border: 1px solid rgba(255, 204, 0, 0.5);
            border-radius: 6px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 50;
        `;const o=document.createElement("div");o.style.cssText=`
            width: 100%;
            height: 100%;
            background-image: url('/Mondes-immerges/interface/images/map-outline.png');
            background-size: cover;
            background-position: center;
            opacity: 0.7;
        `,i.appendChild(o),[{id:"grande-barriere",x:150,y:70,name:"Grande Barrière"},{id:"abysses",x:50,y:60,name:"Abysses"},{id:"arctique",x:100,y:20,name:"Arctique"},{id:"plastique",x:80,y:50,name:"Pollution"},{id:"triangle-corail",x:130,y:60,name:"Triangle Corail"},{id:"requins",x:70,y:40,name:"Requins"}].forEach(l=>{const d=document.createElement("div");d.className="minimap-dot",d.dataset.id=l.id,d.title=l.name,d.style.cssText=`
                position: absolute;
                top: ${l.y}px;
                left: ${l.x}px;
                width: 6px;
                height: 6px;
                background-color: #ffcc00;
                border-radius: 50%;
                cursor: pointer;
                transform: translate(-50%, -50%);
                box-shadow: 0 0 5px rgba(255, 204, 0, 0.7);
                transition: all 0.3s ease;
            `,d.addEventListener("mouseenter",()=>{c.to(d,{width:10,height:10,boxShadow:"0 0 10px rgba(255, 204, 0, 0.9)",duration:.3}),this.showTooltip(d,l.name,{position:"top",duration:2e3})}),d.addEventListener("mouseleave",()=>{c.to(d,{width:6,height:6,boxShadow:"0 0 5px rgba(255, 204, 0, 0.7)",duration:.3})}),d.addEventListener("click",()=>{t&&t(l.id)}),i.appendChild(d)});const n=document.createElement("div");n.className="minimap-toggle",n.innerHTML="−",n.style.cssText=`
            position: absolute;
            top: 5px;
            right: 5px;
            width: 20px;
            height: 20px;
            background-color: rgba(0, 0, 0, 0.5);
            color: #ffcc00;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
            z-index: 1;
        `;let a=!1;return n.addEventListener("click",()=>{a?(c.to(i,{height:100,duration:.3,ease:"power2.out"}),n.innerHTML="−"):(c.to(i,{height:30,duration:.3,ease:"power2.out"}),n.innerHTML="+"),a=!a}),i.appendChild(n),e.appendChild(i),c.fromTo(i,{y:50,opacity:0},{y:0,opacity:1,duration:.5,ease:"power2.out"}),{highlight:l=>{const d=i.querySelector(`.minimap-dot[data-id="${l}"]`);d&&c.to(d,{width:12,height:12,backgroundColor:"#ffffff",boxShadow:"0 0 15px rgba(255, 255, 255, 0.9)",duration:.5,repeat:3,yoyo:!0})},hide:()=>{c.to(i,{y:50,opacity:0,duration:.3,ease:"power2.in",onComplete:()=>{i.remove()}})},element:i}}}class ge{constructor(e){this.panel=e.panel,this.closeBtn=e.closeBtn,this.titleElement=e.titleElement,this.descriptionElement=e.descriptionElement,this.videoElement=e.videoElement,this.globeManager=e.globeManager,this.isVisible=!1,this.drawerToggle=null,this.drawer=null,this.drawerContent=null,this.isDrawerOpen=!1,this.panel&&this.closeBtn&&this.titleElement&&this.descriptionElement?this.init():(this.show=()=>{},this.hide=()=>{},this.update=()=>{})}init(){this.applyDesignSystem(),this.closeBtn&&this.closeBtn.addEventListener("click",()=>{this.hide(),this.globeManager.exitHotspotModeExternal()}),this.videoElement&&(this.videoElement.addEventListener("loadeddata",()=>{c.fromTo(this.videoElement,{opacity:0},{opacity:1,duration:.8,ease:"power2.out"})}),this.videoElement.addEventListener("error",()=>{this.videoElement.style.display="none";const e=document.createElement("img");e.src="/Mondes-immerges/interface/images/video-placeholder.jpg",e.alt="Vidéo non disponible",e.style.width="100%",e.style.borderRadius="3px";const t=this.videoElement.parentElement;t&&t.appendChild(e)})),this.createDrawerElements()}applyDesignSystem(){if(!this.panel)return;this.panel.style.cssText=`
            position: absolute;
            top: 5%;
            right: 5%;
            width: 380px;
            max-width: 33.33%; /* Règle du tiers */
            max-height: 90%;
            background-color: rgba(0, 0, 0, 0.85);
            border: 1px solid rgba(255, 204, 0, 0.7);
            border-radius: 5px;
            overflow: hidden;
            transition: transform 0.5s cubic-bezier(0.19, 1, 0.22, 1), opacity 0.5s cubic-bezier(0.19, 1, 0.22, 1);
            transform: translateX(100%);
            z-index: 10;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 15px rgba(255, 204, 0, 0.2);
        `;const e=this.panel.querySelector(".panel-header");if(e){e.style.cssText=`
                padding: 16px 20px;
                background: linear-gradient(to bottom, rgba(0, 30, 60, 0.9), rgba(0, 15, 30, 0.9));
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid rgba(255, 204, 0, 0.5);
                position: relative;
            `;const o=document.createElement("div");o.style.cssText=`
                position: absolute;
                top: 0;
                left: 0;
                width: 4px;
                height: 100%;
                background-color: #ffcc00;
            `,e.insertBefore(o,e.firstChild)}this.titleElement&&(this.titleElement.style.cssText=`
                margin: 0;
                font-size: 1.2rem;
                font-weight: 600;
                color: #ffcc00;
                letter-spacing: 1px;
                font-family: 'Roboto Mono', monospace;
                text-transform: uppercase;
                line-height: 1.3;
            `),this.closeBtn&&(this.closeBtn.style.cssText=`
                background: none;
                border: none;
                color: #ffffff;
                font-size: 1.5rem;
                cursor: pointer;
                opacity: 0.7;
                transition: all 0.3s ease;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
            `,this.closeBtn.addEventListener("mouseenter",()=>{this.closeBtn.style.opacity="1",this.closeBtn.style.color="#ffcc00",this.closeBtn.style.backgroundColor="rgba(255, 255, 255, 0.1)"}),this.closeBtn.addEventListener("mouseleave",()=>{this.closeBtn.style.opacity="0.7",this.closeBtn.style.color="#ffffff",this.closeBtn.style.backgroundColor="transparent"}));const t=this.panel.querySelector(".panel-content");if(t){t.style.cssText=`
                padding: 20px;
                max-height: calc(90vh - 60px);
                overflow-y: auto;
                scrollbar-width: thin;
                scrollbar-color: rgba(255, 204, 0, 0.7) rgba(0, 0, 0, 0.3);
            `;const o=document.createElement("style");o.textContent=`
                .panel-content::-webkit-scrollbar {
                    width: 6px;
                }
                
                .panel-content::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 3px;
                }
                
                .panel-content::-webkit-scrollbar-thumb {
                    background-color: rgba(255, 204, 0, 0.7);
                    border-radius: 3px;
                }
                
                .panel-content::-webkit-scrollbar-thumb:hover {
                    background-color: rgba(255, 204, 0, 0.9);
                }
            `,document.head.appendChild(o)}const i=this.panel.querySelector("#video-container");if(i&&(i.style.cssText=`
                width: 100%;
                margin-bottom: 24px;
                border: 1px solid rgba(255, 204, 0, 0.3);
                position: relative;
                overflow: hidden;
                border-radius: 4px;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            `),this.videoElement&&(this.videoElement.style.cssText=`
                width: 100%;
                border-radius: 3px;
                display: block;
                background-color: #000;
            `,this.videoElement.controls=!0),this.descriptionElement){this.descriptionElement.style.cssText=`
                font-size: 0.95rem;
                line-height: 1.6;
                color: #e0e0e0;
                font-family: 'Merriweather Sans', 'Source Sans Pro', sans-serif;
            `;const o=document.createElement("style");o.textContent=`
                #hotspot-description p {
                    margin-bottom: 16px;
                    text-align: justify;
                }
                
                #hotspot-description p:last-child {
                    margin-bottom: 0;
                }
                
                #hotspot-description .coordinates {
                    background: linear-gradient(to right, rgba(0, 40, 80, 0.5), rgba(0, 20, 40, 0.5));
                    padding: 10px 15px;
                    border-radius: 4px;
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-left: 3px solid #ffcc00;
                    font-family: 'Roboto Mono', monospace;
                }
                
                #hotspot-description .coordinates-label {
                    font-weight: bold;
                    color: #ffcc00;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                    font-size: 0.85rem;
                }
                
                #hotspot-description .coordinates-value {
                    font-family: 'Roboto Mono', monospace;
                    letter-spacing: 1px;
                }
            `,document.head.appendChild(o)}}createDrawerElements(){if(!this.panel)return;this.drawerToggle=document.createElement("div"),this.drawerToggle.className="drawer-toggle",this.drawerToggle.innerHTML='<span class="arrow up"></span>',this.drawerToggle.style.cssText=`
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 44px;
            height: 28px;
            background-color: rgba(0, 0, 0, 0.7);
            border-top-left-radius: 5px;
            border-top-right-radius: 5px;
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
            box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.2);
            border-top: 1px solid rgba(255, 204, 0, 0.5);
            border-left: 1px solid rgba(255, 204, 0, 0.5);
            border-right: 1px solid rgba(255, 204, 0, 0.5);
            z-index: 101;
        `;const e=document.createElement("style");e.textContent=`
            .arrow {
                width: 12px;
                height: 12px;
                border-style: solid;
                border-color: #ffcc00;
                border-width: 0 2px 2px 0;
                display: inline-block;
                transition: transform 0.3s cubic-bezier(0.19, 1, 0.22, 1);
            }
            
            .up {
                transform: rotate(-135deg) translateY(-2px);
            }
            
            .down {
                transform: rotate(45deg) translateY(-2px);
            }
            
            .drawer-toggle:hover .arrow {
                border-color: #ffffff;
            }
        `,document.head.appendChild(e),this.panel.appendChild(this.drawerToggle),this.drawer=document.createElement("div"),this.drawer.className="info-drawer",this.drawer.style.cssText=`
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 70%;
            background: linear-gradient(to bottom, rgba(0, 40, 80, 0.97) 0%, rgba(0, 10, 30, 0.97) 100%);
            transform: translateY(100%);
            transition: transform 0.5s cubic-bezier(0.19, 1, 0.22, 1);
            z-index: 100;
            box-shadow: 0 -5px 15px rgba(0, 0, 0, 0.3);
            overflow-y: auto;
            padding: 20px;
            box-sizing: border-box;
            color: white;
            display: none;
            border-top: 1px solid rgba(255, 204, 0, 0.7);
            backdrop-filter: blur(10px);
            scrollbar-width: thin;
            scrollbar-color: rgba(255, 204, 0, 0.7) rgba(0, 0, 0, 0.3);
        `,this.drawerContent=document.createElement("div"),this.drawerContent.className="drawer-content",this.drawerContent.style.cssText=`
            max-width: 1200px;
            margin: 0 auto;
            padding: 30px;
            display: grid;
            grid-template-columns: repeat(12, 1fr);
            grid-gap: 24px;
        `,this.drawer.appendChild(this.drawerContent),document.body.appendChild(this.drawer),this.drawerToggle.addEventListener("click",()=>{this.toggleDrawer()})}toggleDrawer(){this.isDrawerOpen?this.closeDrawer():this.openDrawer()}openDrawer(){if(this.isDrawerOpen||!this.drawer)return;this.isDrawerOpen=!0,this.drawer.style.display="block",c.to(this.drawer,{y:0,duration:.7,ease:"back.out(1.2)"});const e=this.drawerToggle.querySelector(".arrow");e&&(e.classList.remove("up"),e.classList.add("down")),this.drawerToggle&&c.to(this.drawerToggle,{bottom:"auto",top:-28,duration:.5}),this.panel&&c.to(this.panel,{scale:.95,opacity:.85,duration:.5,ease:"power2.out"})}closeDrawer(){if(!this.isDrawerOpen||!this.drawer)return;this.isDrawerOpen=!1,c.to(this.drawer,{y:"100%",duration:.5,ease:"power3.in",onComplete:()=>{this.drawer.style.display="none"}});const e=this.drawerToggle.querySelector(".arrow");e&&(e.classList.remove("down"),e.classList.add("up")),this.drawerToggle&&c.to(this.drawerToggle,{top:"auto",bottom:0,duration:.5}),this.panel&&c.to(this.panel,{scale:1,opacity:1,duration:.5,ease:"power2.out"})}update(e){if(!this.titleElement||!this.descriptionElement)return;this.titleElement.textContent=e.title||"Information";let t=e.description||"";if(e.coordinates&&(t=`
                <div class="coordinates">
                    <span class="coordinates-label">GPS:</span>
                    <span class="coordinates-value">${e.coordinates.lat.toFixed(4)}° N, ${e.coordinates.lng.toFixed(4)}° E</span>
                </div>
                ${t}
            `),this.descriptionElement.innerHTML=t,this.videoElement&&e.videoSrc){if(this.videoElement.style.display="block",this.videoElement.querySelector("source"))this.videoElement.querySelector("source").src=e.videoSrc;else{const i=document.createElement("source");i.src=e.videoSrc,i.type="video/mp4",this.videoElement.appendChild(i)}this.videoElement.load()}else this.videoElement&&(this.videoElement.style.display="none");if((e.detailedInfo||e.links)&&this.drawerContent){let i="";i+="<h3>INFORMATIONS COMPLÉMENTAIRES</h3>",e.detailedInfo&&(i+=`
                    <div class="detailed-info">
                        ${e.detailedInfo}
                    </div>
                `),e.links&&e.links.length>0&&(i+=`
                    <div class="external-links">
                        <h4>RESSOURCES SCIENTIFIQUES</h4>
                        <ul>
                `,e.links.forEach(o=>{i+=`<li><a href="${o.url}" target="_blank">${o.title}</a></li>`}),i+=`
                        </ul>
                    </div>
                `),this.drawerContent.innerHTML=i,this.drawerToggle&&(this.drawerToggle.style.display="flex")}else this.drawerToggle&&(this.drawerToggle.style.display="none")}show(){if(this.isVisible||!this.panel)return;this.isVisible=!0,this.panel.classList.remove("hidden"),this.panel.classList.add("visible"),this.closeDrawer(),c.fromTo(this.panel,{x:"100%",opacity:0,scale:.95},{x:"0%",opacity:1,scale:1,duration:.7,ease:"back.out(1.2)"});const e=document.getElementById("main-container");e&&c.to(e.querySelectorAll(":not(#content-panel)"),{filter:"blur(2px)",opacity:.8,duration:.5,ease:"power2.out"})}hide(){if(!this.isVisible||!this.panel)return;this.isVisible=!1,this.isDrawerOpen&&this.closeDrawer(),c.to(this.panel,{x:"100%",opacity:0,scale:.95,duration:.5,ease:"power3.in",onComplete:()=>{this.panel.classList.remove("visible"),this.panel.classList.add("hidden"),this.videoElement&&this.videoElement.pause()}});const e=document.getElementById("main-container");e&&c.to(e.querySelectorAll(":not(#content-panel)"),{filter:"blur(0px)",opacity:1,duration:.5,ease:"power2.out"})}}const U=[{id:"grande-barriere",title:"Grande Barrière de Corail",position:{lat:-18.2871,lng:147.6992},description:`
            <p>La Grande Barrière de Corail représente le plus grand récif corallien du monde. Située au large du Queensland en Australie, elle s'étend sur plus de 2 300 kilomètres et abrite une biodiversité exceptionnelle avec plus de 1 500 espèces de poissons et 400 types de coraux.</p>
            <p>Ce site classé au patrimoine mondial de l'UNESCO est aujourd'hui gravement menacé par le changement climatique, la pollution et la surpêche. Les scientifiques observent un blanchissement massif des coraux dû à l'augmentation de la température des océans, avec cinq épisodes majeurs depuis 1998, dont trois entre 2016 et 2020.</p>
        `,videoSrc:"/Mondes-immerges/interface/videos/grande-barriere.mp4",scientificData:{depth:{min:15,max:45,avg:35},temperature:{min:23.5,max:28.5,avg:25.7},biodiversity:"Exceptionnelle",conservationStatus:"En danger critique",area:"348,000 km²",discoveryYear:1770,phValue:{min:8.1,max:8.4},salinity:"34-35‰"},detailedInfo:`
            <p>La Grande Barrière de Corail est le plus vaste écosystème corallien du monde. Elle abrite plus de 1 500 espèces de poissons, 4 000 types de mollusques, 240 espèces d'oiseaux et de nombreux mammifères marins en danger. Le réchauffement océanique a provoqué cinq épisodes massifs de blanchissement des coraux depuis 1998, dont trois entre 2016 et 2020, affectant gravement cet écosystème unique.</p>
            <p>Selon les dernières études, plus de 50% des coraux de la Grande Barrière ont été perdus depuis 1995, principalement en raison du réchauffement des océans. La hausse des températures provoque l'expulsion des algues symbiotiques qui donnent aux coraux leur couleur et leur principale source d'énergie, entraînant leur blanchissement et, souvent, leur mort.</p>
            <p>Le site est également menacé par l'acidification des océans, qui réduit la capacité des coraux à construire leurs squelettes calcaires, les rendant plus vulnérables aux tempêtes et aux prédateurs. Les scientifiques estiment que si la tendance actuelle se poursuit, nous pourrions assister à la disparition de la majorité des récifs coralliens du monde d'ici 2050.</p>
        `,evolutionData:[{year:2e3,healthIndex:.85},{year:2005,healthIndex:.79},{year:2010,healthIndex:.72},{year:2015,healthIndex:.61},{year:2020,healthIndex:.47},{year:2025,healthIndex:.43,projected:!0}],sources:[{title:"État des récifs coralliens 2024 (UNESCO)",url:"https://whc.unesco.org/en/list/154/"},{title:"Études sur le blanchissement des coraux (AIMS)",url:"https://www.aims.gov.au/research-topics/coral-reefs"},{title:"Stratégies de conservation marine (GBRMPA)",url:"https://www.gbrmpa.gov.au/"}]},{id:"abysses",title:"Les Abysses",position:{lat:-10.9638,lng:-176.6333},description:`
            <p>Les abysses constituent les zones les plus profondes des océans, situées entre 3 000 et 11 000 mètres de profondeur. Ces environnements extrêmes, caractérisés par une pression écrasante, l'absence de lumière et des températures avoisinant 2°C, abritent pourtant une vie extraordinaire.</p>
            <p>Les créatures abyssales ont développé des adaptations fascinantes : organes bioluminescents, corps transparents, dents démesurées ou encore capacité à résister à des pressions plusieurs centaines de fois supérieures à celle de la surface. Notre connaissance de ces écosystèmes reste limitée, avec moins de 5% des fonds marins ayant été explorés à ce jour.</p>
        `,videoSrc:"/Mondes-immerges/interface/videos/abysses.mp4",scientificData:{depth:{min:3e3,max:11e3,avg:5e3},temperature:{min:1.5,max:3,avg:2.3},biodiversity:"Rare et spécialisée",conservationStatus:"Zone peu explorée",pressure:"Jusqu'à 1100 atmosphères",lightPenetration:"Nulle",oxygenLevel:"Très faible",microbialDensity:"Élevée dans certaines zones hydrothermales"},detailedInfo:`
            <p>Les abysses, zones des océans situées entre 3 000 et 11 000 mètres de profondeur, sont parmi les environnements les moins explorés de notre planète. La fosse des Mariannes, point le plus profond de la Terre (10 994 mètres), abrite une biodiversité étonnamment riche malgré une pression 1 100 fois supérieure à celle du niveau de la mer. Les créatures abyssales ont développé des adaptations uniques comme la bioluminescence pour communiquer et attirer leurs proies dans l'obscurité totale.</p>
            <p>Ces écosystèmes fonctionnent différemment des environnements de surface. Sans photosynthèse, ils s'appuient sur la "neige marine" (particules organiques tombant des eaux supérieures) et sur les sources hydrothermales comme sources d'énergie. Ces cheminées, découvertes en 1977, ont révolutionné notre compréhension de la vie sur Terre, montrant qu'elle peut exister sans lumière solaire, basée sur la chimiosynthèse.</p>
            <p>Les abysses abritent une biodiversité unique : poissons comme le dragon des mers ou le poisson-ogre, calmars géants, vers tubicoles géants, et diverses espèces bioluminescentes. Paradoxalement, bien que très hostiles à la vie humaine, ces environnements font preuve d'une remarquable stabilité climatique, à l'abri des variations affectant la surface des océans, ce qui en fait des témoins privilégiés de l'évolution.</p>
        `,evolutionData:[{year:2e3,discoveryIndex:.12},{year:2005,discoveryIndex:.15},{year:2010,discoveryIndex:.19},{year:2015,discoveryIndex:.25},{year:2020,discoveryIndex:.32},{year:2025,discoveryIndex:.38,projected:!0}],sources:[{title:"Exploration des grands fonds (NOAA)",url:"https://oceanexplorer.noaa.gov/explorations/deepwater-exploration.html"},{title:"Biodiversité des abysses (DOSI)",url:"https://www.dosi-project.org/"},{title:"Adaptations aux milieux extrêmes (MBARI)",url:"https://www.mbari.org/science/seafloor-processes/"}]},{id:"arctique",title:"Océan Arctique",position:{lat:78.9634,lng:12.5847},description:`
            <p>L'océan Arctique, en grande partie recouvert de glace, constitue un écosystème unique abritant des espèces parfaitement adaptées aux conditions extrêmes, comme l'ours polaire, le phoque annelé et le narval.</p>
            <p>Le réchauffement climatique affecte cet environnement deux fois plus rapidement que le reste de la planète. La fonte de la banquise estivale, qui a diminué de plus de 40% depuis 1979, transforme radicalement les habitats et menace la survie de nombreuses espèces qui dépendent de la glace pour leur alimentation et leur reproduction.</p>
        `,videoSrc:"/Mondes-immerges/interface/videos/arctique.mp4",scientificData:{temperature:{min:-1.8,max:3,avg:-.5},iceExtent:{winter:"15 millions km²",summer:"5 millions km²"},biodiversity:"Modérée",conservationStatus:"Vulnérable",depth:{max:5567,avg:1038},salinity:"30-34‰",iceThickness:{min:.5,max:4,avg:1.8},iceRetreatRate:"13% par décennie"},detailedInfo:`
            <p>L'Océan Arctique subit le réchauffement le plus rapide de la planète, avec des températures augmentant à un rythme deux fois plus élevé que la moyenne mondiale. La banquise estivale a diminué de 40% depuis 1979, ce qui modifie radicalement l'écosystème régional. Des espèces tempérées migrent vers le nord, entrant en compétition avec les espèces arctiques comme le phoque annelé, le narval et l'ours polaire, dont la survie dépend directement de la glace de mer.</p>
            <p>L'effet d'amplification arctique, causé par la réduction de l'albédo (réflexion de la lumière solaire) lorsque la glace blanche est remplacée par l'eau sombre qui absorbe la chaleur, accélère le réchauffement dans un cycle de rétroaction positive. Les mesures de l'épaisseur de la glace montrent également une diminution drastique, avec une perte de 65% depuis 1975.</p>
            <p>Cette transformation a des conséquences planétaires : modification des courants océaniques, perturbation de la circulation atmosphérique globale et libération potentielle de grandes quantités de méthane piégé dans le pergélisol. Les prévisions actuelles suggèrent que l'océan Arctique pourrait être pratiquement libre de glace en été dès les années 2030-2040, soit quelques décennies plus tôt que ce qui était prévu par les modèles climatiques précédents.</p>
        `,evolutionData:[{year:1980,iceExtent:7.85},{year:1990,iceExtent:6.74},{year:2e3,iceExtent:6.32},{year:2010,iceExtent:4.9},{year:2020,iceExtent:3.74},{year:2025,iceExtent:3.2,projected:!0}],sources:[{title:"Évolution de la banquise arctique (NSIDC)",url:"https://nsidc.org/arcticseaicenews/"},{title:"Impact du changement climatique sur l'écosystème arctique (WWF)",url:"https://arcticwwf.org/work/climate/"},{title:"Rapport sur l'état de l'Arctique (NOAA)",url:"https://arctic.noaa.gov/Report-Card"}]},{id:"plastique",title:"Pollution Plastique",position:{lat:28.3699,lng:-144.4089},description:`
            <p>Le "Great Pacific Garbage Patch" est une zone d'accumulation de déchets plastiques située dans le Pacifique Nord. Cette "soupe de plastique" s'étend sur une surface équivalente à trois fois la France et contient plus de 1,8 trillion de morceaux de plastique.</p>
            <p>Ces débris se fragmentent en microplastiques qui sont ingérés par la faune marine et entrent dans la chaîne alimentaire. Chaque année, plus de 8 millions de tonnes de plastique sont déversées dans les océans, avec des conséquences désastreuses pour les écosystèmes marins et potentiellement la santé humaine.</p>
        `,videoSrc:"/Mondes-immerges/interface/videos/plastique.mp4",scientificData:{area:"Environ 1,6 million km²",plasticDensity:{min:"10 kg/km²",max:"100 kg/km²"},biodiversity:"Dégradée",conservationStatus:"Zone fortement dégradée",microplasticConcentration:"Jusqu'à 1 million de particules/km²",originOfWaste:"80% terrestre, 20% maritime",degradationTime:"450 ans pour une bouteille plastique",annualInput:"8 millions de tonnes/an"},detailedInfo:`
            <p>Le "Great Pacific Garbage Patch" (vortex de déchets du Pacifique nord) est la plus grande des cinq zones d'accumulation de plastiques océaniques. D'une superficie de 1,6 million de km², elle contient environ 1,8 trillion de fragments plastiques. Plus de 80% de cette pollution provient d'activités terrestres. Les microplastiques (&lt;5mm) sont particulièrement dangereux car ils sont ingérés par les organismes marins et s'accumulent dans la chaîne alimentaire. On estime que d'ici 2050, il y aura plus de plastique que de poissons dans les océans (en poids).</p>
            <p>La durée de vie des plastiques en milieu marin peut atteindre plusieurs centaines d'années. Loin de se décomposer complètement, ils se fragmentent en particules de plus en plus petites qui deviennent impossibles à récupérer. Ces microplastiques sont désormais présents dans tous les océans, des fosses les plus profondes jusqu'à l'Arctique, et ont été détectés dans plus de 700 espèces marines.</p>
            <p>Les impacts sur la faune sont multiples : enchevêtrement (tortues, mammifères marins), ingestion causant des occlusions intestinales, faux sentiment de satiété, et absorption de polluants toxiques concentrés sur les microplastiques. De récentes études ont également mis en évidence la présence de microplastiques dans le poisson et les fruits de mer consommés par les humains, soulevant de sérieuses questions de santé publique. Les estimations actuelles suggèrent qu'un être humain ingère en moyenne l'équivalent d'une carte de crédit en plastique par semaine.</p>
        `,evolutionData:[{year:1990,plasticAmount:.8},{year:2e3,plasticAmount:1.5},{year:2010,plasticAmount:2.8},{year:2020,plasticAmount:4.5},{year:2025,plasticAmount:5.7,projected:!0}],sources:[{title:"Étude globale sur la pollution plastique (The Ocean Cleanup)",url:"https://theoceancleanup.com/great-pacific-garbage-patch/"},{title:"Impact des microplastiques sur les écosystèmes marins (PNUE)",url:"https://www.unep.org/explore-topics/oceans-seas/what-we-do/addressing-land-based-pollution/marine-plastics-issue"},{title:"Solutions pour réduire la pollution plastique (Plastic Pollution Coalition)",url:"https://www.plasticpollutioncoalition.org/"}]},{id:"triangle-corail",title:"Triangle de Corail",position:{lat:.7893,lng:127.8641},description:`
            <p>Le Triangle de Corail, situé entre l'Indonésie, la Malaisie, les Philippines, la Papouasie-Nouvelle-Guinée, les Îles Salomon et le Timor-Leste, représente l'épicentre de la biodiversité marine mondiale.</p>
            <p>Cette région abrite 76% des espèces de coraux connues et plus de 3 000 espèces de poissons. Véritable nurserie des océans, le Triangle de Corail joue un rôle crucial dans l'équilibre des écosystèmes marins de la planète et assure la subsistance de plus de 120 millions de personnes.</p>
        `,videoSrc:"/Mondes-immerges/interface/videos/triangle-corail.mp4",scientificData:{area:"5,7 millions km²",depth:{min:10,max:200,avg:53},temperature:{min:26,max:29,avg:27.6},biodiversity:"Exceptionnelle",conservationStatus:"En danger",coralSpecies:"605 (76% du total mondial)",fishSpecies:"2228+",economicValue:"1,2 billion USD/an"},detailedInfo:`
            <p>Le Triangle de Corail, épicentre de la biodiversité marine mondiale, abrite 76% des espèces de coraux connues et plus de 2 200 espèces de poissons récifaux. Chaque année, 30% des espèces marines de ce triangle disparaissent à cause de la surpêche, de la pollution et du changement climatique. Cette région couvre seulement 1,5% de la surface océanique totale mais contient le plus grand nombre d'espèces marines par unité de surface au monde, ce qui en fait un véritable "Amazon de la mer".</p>
            <p>Cette richesse exceptionnelle s'explique par la rencontre de facteurs géologiques et océanographiques favorables : eaux chaudes et peu profondes, complexité topographique sous-marine, et position au carrefour des courants marins principaux. Au-delà des coraux et poissons, on y trouve 6 des 7 espèces de tortues marines, des dugongs, des requins-baleines et d'innombrables invertébrés, dont beaucoup restent à découvrir.</p>
            <p>Le Triangle de Corail fournit des services écosystémiques vitaux : barrière naturelle contre les tempêtes, puits de carbone, nurserie pour de nombreuses espèces commerciales, et source de nourriture pour plus de 120 millions de personnes. Sa valeur économique est estimée à 1,2 billion de dollars annuels. Les efforts de conservation impliquent six nations et des dizaines d'ONG, avec un objectif de protection effective de 20% des récifs d'ici 2030, contre moins de 10% actuellement.</p>
        `,evolutionData:[{year:2e3,coralCover:.65},{year:2005,coralCover:.61},{year:2010,coralCover:.58},{year:2015,coralCover:.53},{year:2020,coralCover:.49},{year:2025,coralCover:.45,projected:!0}],sources:[{title:"Initiative pour le Triangle de Corail (CTI)",url:"https://www.coraltriangleinitiative.org/"},{title:"Stratégies de conservation marine (WWF)",url:"https://www.worldwildlife.org/places/coral-triangle"},{title:"Biodiversité du Triangle de Corail (Nature Conservancy)",url:"https://www.nature.org/en-us/about-us/where-we-work/asia-pacific/asia-and-the-pacific-coral-triangle/"}]},{id:"requins",title:"Requins en Danger",position:{lat:24.287,lng:-77.6843},description:`
            <p>Les requins, prédateurs au sommet de la chaîne alimentaire marine depuis plus de 400 millions d'années, sont aujourd'hui gravement menacés. Plus d'un tiers des espèces de requins et de raies sont en danger d'extinction.</p>
            <p>La surpêche, notamment pour le commerce des ailerons, et les prises accessoires sont les principales menaces. En tant que régulateurs des écosystèmes marins, leur déclin a des effets en cascade sur la santé des océans et l'équilibre des populations de poissons.</p>
        `,videoSrc:"/Mondes-immerges/interface/videos/requins.mp4",scientificData:{speciesCount:"500+ espèces",depth:{min:0,max:2e3,avg:150},temperature:{min:4,max:26,avg:21.5},biodiversity:"Élevée",conservationStatus:"En danger",annualDeath:"~100 millions d'individus",evolutionTime:"450 millions d'années",threatLevel:"37% des espèces menacées"},detailedInfo:`
            <p>Les requins, prédateurs au sommet des écosystèmes marins depuis plus de 400 millions d'années, sont aujourd'hui gravement menacés. Chaque année, environ 100 millions de requins sont tués, principalement pour leurs ailerons. Plus de 37% des espèces de requins et de raies dans le monde sont menacées d'extinction. En tant que régulateurs des populations de proies, leur disparition a un effet en cascade sur l'ensemble de l'écosystème marin, avec des conséquences sur les stocks de poissons commerciaux et la santé des récifs coralliens.</p>
            <p>Le commerce des ailerons, notamment pour la soupe d'aileron en Asie, est particulièrement dévastateur car il implique souvent la pratique du "finning" où seuls les ailerons sont prélevés et le requin, encore vivant, est rejeté à la mer où il meurt lentement. Bien que des réglementations existent dans certains pays, le commerce illégal reste répandu.</p>
            <p>Les requins sont particulièrement vulnérables à la surpêche en raison de leur maturité sexuelle tardive et de leur faible taux de reproduction. Une femelle de requin blanc, par exemple, n'atteint sa maturité sexuelle qu'à l'âge de 33 ans et ne produit qu'un petit nombre de jeunes. Cette biologie "lente" signifie que les populations mettent des décennies à se reconstituer après avoir été décimées. Des zones marines protégées dédiées, comme le sanctuaire de requins des Bahamas, montrent qu'une protection efficace peut permettre aux populations de se maintenir, tout en générant des revenus importants grâce à l'écotourisme.</p>
        `,evolutionData:[{year:1970,sharkPopulation:1},{year:1990,sharkPopulation:.8},{year:2e3,sharkPopulation:.68},{year:2010,sharkPopulation:.55},{year:2020,sharkPopulation:.44},{year:2025,sharkPopulation:.39,projected:!0}],sources:[{title:"État des populations de requins (IUCN Shark Specialist Group)",url:"https://www.iucnssg.org/"},{title:"Impact de la disparition des grands prédateurs marins (Shark Trust)",url:"https://www.sharktrust.org/"},{title:"Sanctuaires de requins et protection (PEW Charitable Trusts)",url:"https://www.pewtrusts.org/en/projects/global-shark-conservation"}]}];function be(r){return U.find(e=>e.id===r)||null}class ye{constructor(){this.globeManager=null,this.visualEffects=null,this.interaction=null,this.interfaceUI=null,this.contentPanel=null,this.isInitialized=!1,this.isExploring=!1,this.currentHotspot=null,this.explorationHistory=[],this.welcomeScreen=document.getElementById("welcome-screen"),this.mainContainer=document.getElementById("main-container"),this.loadingScreen=document.getElementById("loading-screen")}init(){if(this.isInitialized)return;this.isInitialized=!0,this.visualEffects=new pe({container:this.mainContainer}),this.globeManager=new ue({containerId:"globe-container",videoPath:"/Mondes-immerges/interface/videos/globe-video.mp4",skyTexturePath:"/Mondes-immerges/interface/images/night-sky.png"}),this.interaction=new me({globeManager:this.globeManager,visualEffects:this.visualEffects}),this.interfaceUI=new fe({zoomInBtn:document.getElementById("zoom-in"),zoomOutBtn:document.getElementById("zoom-out"),resetViewBtn:document.getElementById("reset-view"),infoBtn:document.getElementById("info-button"),closeInfoBtn:document.getElementById("close-info"),infoOverlay:document.getElementById("info-overlay"),globeManager:this.globeManager});const e={panel:document.getElementById("content-panel"),closeBtn:document.getElementById("close-panel"),titleElement:document.getElementById("hotspot-title"),descriptionElement:document.getElementById("hotspot-description"),videoElement:document.getElementById("hotspot-video"),globeManager:this.globeManager};e.panel&&e.closeBtn&&e.titleElement&&e.descriptionElement?this.contentPanel=new ge(e):this.contentPanel={show:()=>{},hide:()=>{},update:()=>{}},this.globeManager.setHotspotSelectCallback(this.handleHotspotSelect.bind(this)),this.globeManager.setHotspotExitCallback(this.handleHotspotExit.bind(this)),this.globeManager.animate(),this.globeManager.addHotspots(U),this.initSatelliteInterface(),this.setupEventListeners(),this.addNatGeoLogo()}setupEventListeners(){const e=document.getElementById("explore-btn");e&&e.addEventListener("click",()=>{this.startExploration()}),document.addEventListener("keydown",t=>{t.key===" "&&!this.isExploring&&this.startExploration(),t.key==="Escape"&&(this.currentHotspot?(this.globeManager.exitHotspotModeExternal(),this.currentHotspot=null):this.isExploring)}),window.addEventListener("resize",this.handleResize.bind(this))}startExploration(e=!1){this.isExploring||(this.welcomeScreen&&this.welcomeScreen.classList.add("hidden"),this.mainContainer&&this.mainContainer.classList.remove("hidden"),e?this.isExploring=!0:(this.visualEffects.transitionIn(),setTimeout(()=>{this.startupSequence()},1e3),this.isExploring=!0))}returnToWelcomeScreen(){this.isExploring&&this.visualEffects.transitionOut(()=>{this.mainContainer&&this.mainContainer.classList.add("hidden"),this.welcomeScreen&&this.welcomeScreen.classList.remove("hidden"),this.isExploring=!1,this.currentHotspot=null,this.contentPanel&&this.contentPanel.hide&&this.contentPanel.hide(),this.globeManager&&this.globeManager.resetView()})}handleResize(){this.globeManager&&this.globeManager.renderer&&this.globeManager.onWindowResize()}addNatGeoLogo(){if(this.mainContainer.querySelector(".nat-geo-logo-container"))return;const t=document.createElement("div");t.className="nat-geo-logo-container",t.style.cssText=`
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1000;
        `;const i=document.createElement("img");i.src="/Mondes-immerges/interface/images/nat-geo-logo.png",i.alt="National Geographic",i.className="nat-geo-logo",i.style.cssText=`
            height: 50px;
            width: auto;
            display: block;
            filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.5));
        `,t.appendChild(i),this.mainContainer.appendChild(t)}initSatelliteInterface(){const e=document.getElementById("coord-lat"),t=document.getElementById("coord-lng"),i=document.getElementById("zoom-level"),o=document.getElementById("orbit-status"),s=document.getElementById("altitude-value"),n=document.getElementById("current-date"),a=document.getElementById("current-time");setInterval(()=>{const l=new Date,d={day:"2-digit",month:"2-digit",year:"numeric"};n&&(n.textContent=l.toLocaleDateString("fr-FR",d));const u=String(l.getUTCHours()).padStart(2,"0"),h=String(l.getUTCMinutes()).padStart(2,"0"),p=String(l.getUTCSeconds()).padStart(2,"0");if(a&&(a.textContent=`${u}:${h}:${p}`),this.globeManager&&this.globeManager.camera){const m=this.globeManager.camera.position,b=Math.sqrt(m.x*m.x+m.z*m.z),f=Math.atan2(m.z,m.x)*(180/Math.PI),y=Math.atan2(m.y,b)*(180/Math.PI);e&&(e.textContent=Math.abs(y).toFixed(4)+(y>=0?"":"-")),t&&(t.textContent=Math.abs(f).toFixed(4)+(f>=0?"":"-"));const _=(m.length()-2)*100;s&&(s.textContent=_.toFixed(2)),i&&this.globeManager.orbitParams&&(i.textContent=this.globeManager.orbitParams.zoomLevel.toFixed(1)),o&&this.globeManager.orbitParams&&(this.globeManager.orbitParams.inHotspotMode?(o.textContent="FIXÉE",o.style.color="#ffcc00"):this.globeManager.orbitParams.currentSpeed>this.globeManager.orbitParams.baseSpeed*1.5?(o.textContent="ACCÉLÉRÉE",o.style.color="#ff9900"):this.globeManager.orbitParams.currentSpeed<this.globeManager.orbitParams.baseSpeed?(o.textContent="RALENTIE",o.style.color="#66ccff"):(o.textContent="NORMALE",o.style.color="#ffffff"))}},100)}startupSequence(e){const t=document.getElementById("loading-screen");this.visualEffects.createOrbitalLoaderEffect(()=>{this.finalizeStartup(),e&&typeof e=="function"&&e()},3,t)}finalizeStartup(){this.showSystemMessages(),setTimeout(()=>{this.visualEffects.showNotification("Bienvenue dans l'exploration des Mondes Immergés","info",4e3)},1e3)}showSystemMessages(){}handleHotspotSelect(e){this.currentHotspot=e,this.explorationHistory.push({id:e.id,title:e.title,timestamp:Date.now()}),this.visualEffects.highlightSelection(e.position),this.visualEffects.flashScreen("rgba(255, 204, 0, 0.2)");const t=document.querySelector(".coordinates-display");t&&(t.style.backgroundColor="rgba(255, 204, 0, 0.2)",t.style.borderColor="rgba(255, 204, 0, 0.8)");const i=be(e.id),o=this.generateDetailedInfoHTML(i),s=i.sources||[{title:"Étude scientifique de référence (National Geographic)",url:"https://www.nationalgeographic.com/environment/oceans"},{title:"Base de données océanographiques (NOAA)",url:"https://www.noaa.gov/oceans-coasts"},{title:"Conservation marine (UNESCO)",url:"https://en.unesco.org/themes/ocean"}];this.contentPanel&&this.contentPanel.update&&(this.contentPanel.update({title:e.title,description:e.description,videoSrc:e.videoSrc,coordinates:e.position,detailedInfo:o,links:s}),this.contentPanel.show()),this.interfaceUI&&this.interfaceUI.setUIVisibility&&this.interfaceUI.setUIVisibility(!1)}generateDetailedInfoHTML(e){if(!e||!e.scientificData)return"<p>Informations détaillées non disponibles pour cette zone.</p>";const t=e.scientificData;let i=`
            <div class="scientific-data">
                <strong>Profondeur moyenne:</strong> ${t.depth?typeof t.depth=="object"?`${t.depth.min}-${t.depth.max} m (moy. ${t.depth.avg} m)`:t.depth:"Non disponible"}<br>
                <strong>Température de l'eau:</strong> ${t.temperature?typeof t.temperature=="object"?`${t.temperature.min}-${t.temperature.max}°C (moy. ${t.temperature.avg}°C)`:t.temperature:"Non disponible"}<br>
                <strong>Biodiversité:</strong> ${t.biodiversity||"Non classifiée"}<br>
                <strong>Statut de conservation:</strong> ${t.conservationStatus||"Non déterminé"}<br>
        `;t.area&&(i+=`<strong>Superficie:</strong> ${t.area}<br>`),t.iceExtent&&(i+=`<strong>Étendue de glace:</strong> ${typeof t.iceExtent=="object"?`Hiver: ${t.iceExtent.winter}, Été: ${t.iceExtent.summer}`:t.iceExtent}<br>`),t.annualInput&&(i+=`<strong>Apport annuel:</strong> ${t.annualInput}<br>`),t.economicValue&&(i+=`<strong>Valeur économique:</strong> ${t.economicValue}<br>`),i+="</div>";let o="";e.detailedInfo&&(o=`
                <div class="detailed-text">
                    ${e.detailedInfo}
                </div>
            `);let s="";return e.evolutionData&&e.evolutionData.length>0&&(s=`
                <div class="data-visualization">
                    <h4>Évolution sur ${e.evolutionData[e.evolutionData.length-1].year-e.evolutionData[0].year} ans</h4>
                    <div class="chart-placeholder" style="width: 100%; height: 200px; background-color: rgba(0, 30, 60, 0.5); border-radius: 5px; display: flex; justify-content: center; align-items: center;">
                        <span>Graphique de tendance (à implémenter)</span>
                    </div>
                </div>
            `),`
            ${i}
            ${o}
            ${s}
        `}handleHotspotExit(){this.contentPanel&&this.contentPanel.hide&&this.contentPanel.hide();const e=document.querySelector(".coordinates-display");e&&(e.style.backgroundColor="rgba(0, 0, 0, 0.7)",e.style.borderColor="rgba(255, 204, 0, 0.3)"),this.interfaceUI&&this.interfaceUI.setUIVisibility&&this.interfaceUI.setUIVisibility(!0),this.currentHotspot=null}}const W=new ye;function xe(){W.init()}function ve(){return W}function g(r,...e){console.log(`[MI:${r}]`,performance.now().toFixed(0)+"ms",...e)}function A(r,...e){console.warn(`[MI:${r}]`,performance.now().toFixed(0)+"ms",...e)}function L(r,...e){console.error(`[MI:${r}]`,performance.now().toFixed(0)+"ms",...e)}g("BOOT","Script principal chargé");const v={initialized:!1,webGLChecked:!1,domReady:!1,appStarted:!1,cleanupDone:!1};function we(){if(v.webGLChecked)return g("WEBGL","Déjà vérifié"),!0;try{const r=document.createElement("canvas"),e=r.getContext("webgl")||r.getContext("experimental-webgl");if(!e)return L("WEBGL","WebGL non supporté"),Ee(),v.webGLChecked=!1,!1;v.webGLChecked=!0,g("WEBGL","WebGL OK — renderer:",e.getParameter(e.RENDERER));const t=e.getExtension("WEBGL_lose_context");return t&&t.loseContext(),!0}catch(r){return L("WEBGL","Erreur vérification WebGL:",r),!1}}function Ee(){const r=document.getElementById("loading-screen");r&&(r.innerHTML=`
            <div style="text-align: center; color: #ffcc00; font-family: 'Roboto Mono', monospace;">
                <div style="font-size: 3em; margin-bottom: 20px;">⚠️</div>
                <h2 style="margin-bottom: 20px;">WebGL Non Supporté</h2>
                <p style="margin-bottom: 20px;">Votre navigateur ne supporte pas WebGL.</p>
                <button onclick="location.reload()" style="background: #ffcc00; color: #000; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-weight: bold;">
                    🔄 Réessayer
                </button>
            </div>
        `)}function Me(){if(window.innerWidth<768||/Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent))return;const e=document.querySelector(".cursor"),t=document.querySelector(".cursor-follower");if(!e||!t)return;let i=0,o=0,s=0,n=0,a=null,l=0;const d=16,u=p=>{const m=performance.now();m-l<d||(l=m,i=p.clientX,o=p.clientY)};document.addEventListener("mousemove",u,{passive:!0});function h(){e.style.transform=`translate(${i}px, ${o}px)`,s+=(i-s)*.1,n+=(o-n)*.1,t.style.transform=`translate(${s}px, ${n}px)`,a=requestAnimationFrame(h)}a=requestAnimationFrame(h),window.addEventListener("beforeunload",()=>{a&&cancelAnimationFrame(a),document.removeEventListener("mousemove",u)},{once:!0})}async function Ce(){return new Promise(r=>{const e=document.querySelector("l-jelly"),t=document.getElementById("transition-video-in"),i=document.getElementById("loading-screen"),o=document.getElementById("main-container");if(!t){r();return}e&&(e.style.transition="opacity 0.3s ease",e.style.opacity="0",setTimeout(()=>e.remove(),300)),o&&(o.style.opacity="1"),i&&(i.style.background="transparent"),P.register(t,{loop:!1,muted:!0,autoRetry:!0,name:"transition-video-in"}),t.classList.add("active"),t.currentTime=0,t.play().then(()=>{t.addEventListener("ended",function(){t.classList.remove("active"),i&&(i.style.display="none",i.classList.add("hidden")),setTimeout(()=>r(),300)},{once:!0})}).catch(s=>{t.classList.remove("active"),r()}),t.addEventListener("loadedmetadata",function(){const s=t.duration;setTimeout(()=>{t.classList.contains("active")&&(t.classList.remove("active"),r())},(s+2)*1e3)},{once:!0}),setTimeout(()=>{t.classList.contains("active")&&(t.classList.remove("active"),r())},15e3)})}async function Pe(){if(v.appStarted){g("APP","Déjà démarré, skip");return}v.appStarted=!0,g("APP","=== DÉMARRAGE APPLICATION ===");try{g("APP","initApp()..."),xe();const r=ve();if(!r)throw new Error("Instance application non disponible");g("APP","Instance app OK, globeManager:",!!r.globeManager),Le(),r.globeManager&&r.globeManager.preloadAllAssets?(g("APP","Préchargement assets..."),await r.globeManager.preloadAllAssets(),g("APP","Assets préchargés OK")):A("APP","preloadAllAssets non disponible"),g("APP","Lancement vidéo de transition..."),await Ce(),g("APP","Vidéo de transition terminée"),g("APP","Démarrage exploration..."),r.startExploration(!0),g("APP","Affichage éléments interface..."),Ie(r),g("APP","=== APPLICATION PRÊTE ===")}catch(r){L("APP","ERREUR CRITIQUE:",r),Se()}}function Le(){const r=document.getElementById("main-container");if(!r)return;r.classList.remove("hidden"),r.style.opacity="0",r.style.transition="opacity 1s cubic-bezier(0.19, 1, 0.22, 1)";const e=document.getElementById("ui-controls"),t=document.querySelectorAll(".satellite-hud, .coordinates-display"),i=document.querySelector(".satellite-crosshair"),o=document.querySelector(".scanner-effect");e&&(e.style.opacity="0",e.style.transform="translateY(20px)",e.style.pointerEvents="none"),t.forEach(s=>{s.style.opacity="0"}),i&&(i.style.opacity="0"),o&&(o.style.opacity="0")}function Ie(r){const e=document.getElementById("ui-controls"),t=document.querySelectorAll(".satellite-hud, .coordinates-display"),i=document.querySelector(".satellite-crosshair"),o=document.querySelectorAll(".hotspot-label"),s=document.querySelectorAll("svg"),n=document.querySelector(".scanner-effect");r&&r.globeManager&&r.globeManager.showLabels(),e&&(e.style.pointerEvents="auto"),window.gsap?(e&&gsap.to(e,{opacity:1,y:0,duration:.8,ease:"power2.out"}),gsap.to([...t,i,n].filter(Boolean),{opacity:1,duration:.8,ease:"power2.out"}),gsap.to([...o,...s],{opacity:1,duration:.8,ease:"power2.out"})):(e&&(e.style.transition="all 0.8s ease",e.style.opacity="1",e.style.transform="translateY(0)"),t.forEach(a=>{a.style.transition="opacity 0.8s ease",a.style.opacity="1"}),i&&(i.style.transition="opacity 0.8s ease",i.style.opacity="1"),n&&(n.style.transition="opacity 0.8s ease",n.style.opacity="1"),o.forEach(a=>{a.style.transition="opacity 0.8s ease",a.style.opacity="1"}),s.forEach(a=>{a.style.transition="opacity 0.8s ease",a.style.opacity="1"}))}function Se(r){const e=document.getElementById("loading-screen");e&&(e.innerHTML=`
        <div style="text-align: center; color: #ff6b6b; font-family: 'Roboto Mono', monospace; padding: 40px;">
            <div style="font-size: 2em; margin-bottom: 20px;">💥</div>
            <h2 style="margin-bottom: 20px;">Erreur</h2>
            <p style="margin-bottom: 20px;">Une erreur s'est produite.</p>
            <button onclick="location.reload()" style="background: #ff6b6b; color: #fff; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer;">
                🔄 Recharger
            </button>
        </div>
    `)}function Te(){const r=document.getElementById("welcome-screen");r&&(r.style.display="none",r.classList.add("hidden"));const e=document.getElementById("main-container");e&&(e.classList.add("hidden"),e.style.opacity="0");const t=document.createElement("style");t.textContent=`
        #main-container, #globe-container, canvas {
            user-select: none !important;
            touch-action: none !important;
            -webkit-user-drag: none !important;
            pointer-events: auto !important;
            cursor: none !important;
        }
    `,document.head.appendChild(t)}function qe(){if(v.initialized){g("INIT","Déjà initialisé, skip");return}if(v.initialized=!0,g("INIT","=== INITIALISATION ==="),!we()){L("INIT","WebGL incompatible, arrêt");return}g("INIT","Préparation environnement..."),Te(),["loading-screen","main-container","globe-container","app"].forEach(i=>{document.getElementById(i)?g("INIT",`#${i} OK`):A("INIT",`Élément manquant: #${i}`)});let e=0;const t=setInterval(()=>{e+=12.5,e>=100&&(clearInterval(t),g("INIT","Chargement simulé terminé, démarrage app..."),setTimeout(()=>{Pe()},300))},200)}function ke(){v.cleanupDone||(v.cleanupDone=!0)}document.addEventListener("DOMContentLoaded",()=>{if(g("DOM","DOMContentLoaded déclenché"),v.domReady){A("DOM","DOMContentLoaded déjà traité, skip");return}v.domReady=!0,Me(),setTimeout(()=>{qe()},100)});window.addEventListener("error",r=>{if(r.target!==window&&(r.target.tagName==="IMG"||r.target.tagName==="SCRIPT")){A("ERR","Ressource non chargée:",r.target.tagName,r.target.src||r.target.href);return}L("ERR","Erreur globale:",r.message,r.filename,"ligne",r.lineno)},{once:!1,capture:!0});window.addEventListener("unhandledrejection",r=>{L("PROMISE","Promise rejetée:",r.reason),r.preventDefault()},{once:!1});window.addEventListener("beforeunload",ke,{once:!0});window.addEventListener("pageshow",r=>{(r.persisted||window.performance&&window.performance.navigation.type===2)&&window.location.reload()});
