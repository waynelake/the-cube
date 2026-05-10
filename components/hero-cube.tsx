'use client';

import { useEffect, useRef } from 'react';

export default function HeroCube() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let active = true;
    let cleanup = () => {};

    (async () => {
      const THREE = await import('three');
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);
      if (!active) return;

      const size = Math.min(580, window.innerWidth * 0.92);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
      camera.position.z = 4.2;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(size, size);
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      mount.appendChild(renderer.domElement);

      // --- Environment map (baked gradient — no external loader needed) ---
      const pmrem = new THREE.PMREMGenerator(renderer);
      pmrem.compileEquirectangularShader();

      const envSize = 64;
      const envData = new Float32Array(envSize * envSize * 4);
      for (let i = 0; i < envSize; i++) {
        for (let j = 0; j < envSize; j++) {
          const idx = (i * envSize + j) * 4;
          const phi = (i / envSize) * Math.PI;
          const theta = (j / envSize) * 2 * Math.PI;
          const upper = phi < Math.PI * 0.45;
          const horizon = phi >= Math.PI * 0.44 && phi < Math.PI * 0.56;
          if (upper) {
            envData[idx] = 0.03; envData[idx+1] = 0.03; envData[idx+2] = 0.10; envData[idx+3] = 1;
          } else if (horizon) {
            envData[idx] = 0.5; envData[idx+1] = 0.6; envData[idx+2] = 0.85; envData[idx+3] = 1;
          } else {
            envData[idx] = 0.75; envData[idx+1] = 0.82; envData[idx+2] = 0.92; envData[idx+3] = 1;
          }
          // Key light — warm white top-right
          const keyAngle = Math.abs(theta - Math.PI * 0.3);
          if (keyAngle < 0.35 && phi < 0.9) {
            const s = 1 - keyAngle / 0.35;
            envData[idx] += s * 4.0; envData[idx+1] += s * 4.0; envData[idx+2] += s * 4.0;
          }
          // Rim light — cool blue left
          const rimAngle = Math.abs(theta - Math.PI * 1.7);
          if (rimAngle < 0.5 && phi < 1.3) {
            const s = 1 - rimAngle / 0.5;
            envData[idx] += s * 0.3; envData[idx+1] += s * 0.4; envData[idx+2] += s * 0.9;
          }
          // Purple accent — matches brand
          const purpleAngle = Math.abs(theta - Math.PI * 0.9);
          if (purpleAngle < 0.6 && phi > 0.8) {
            const s = 1 - purpleAngle / 0.6;
            envData[idx] += s * 0.4; envData[idx+1] += s * 0.1; envData[idx+2] += s * 0.6;
          }
        }
      }
      const envTex = new THREE.DataTexture(envData, envSize, envSize, THREE.RGBAFormat, THREE.FloatType);
      envTex.needsUpdate = true;
      const envMap = pmrem.fromEquirectangular(envTex).texture;
      scene.environment = envMap;

      // --- Noise bump texture ---
      const noiseSize = 128;
      const noiseData = new Uint8Array(noiseSize * noiseSize * 4);
      function noise2d(x: number, y: number): number {
        let v = 0, amp = 1, freq = 1, max = 0;
        for (let o = 0; o < 5; o++) {
          const xi = Math.floor(x * freq) & 255;
          const yi = Math.floor(y * freq) & 255;
          const xf = x * freq - Math.floor(x * freq);
          const yf = y * freq - Math.floor(y * freq);
          const h00 = ((xi * 127 + yi * 311 + xi * yi * 53) % 256) / 256;
          const h10 = (((xi+1)*127 + yi*311 + (xi+1)*yi*53) % 256) / 256;
          const h01 = ((xi*127 + (yi+1)*311 + xi*(yi+1)*53) % 256) / 256;
          const h11 = (((xi+1)*127 + (yi+1)*311 + (xi+1)*(yi+1)*53) % 256) / 256;
          const bx = xf * xf * (3 - 2 * xf);
          const by = yf * yf * (3 - 2 * yf);
          v += (h00 + bx*(h10-h00) + by*(h01-h00) + bx*by*(h00+h11-h10-h01)) * amp;
          max += amp; amp *= 0.5; freq *= 2.1;
        }
        return v / max;
      }
      for (let i = 0; i < noiseSize; i++) {
        for (let j = 0; j < noiseSize; j++) {
          const idx = (i * noiseSize + j) * 4;
          const n = Math.floor(128 + noise2d(i / noiseSize * 4, j / noiseSize * 4) * 60);
          noiseData[idx] = n; noiseData[idx+1] = n; noiseData[idx+2] = n; noiseData[idx+3] = 255;
        }
      }
      const noiseTex = new THREE.DataTexture(noiseData, noiseSize, noiseSize, THREE.RGBAFormat);
      noiseTex.wrapS = noiseTex.wrapT = THREE.RepeatWrapping;
      noiseTex.needsUpdate = true;

      // --- Lights ---
      scene.add(new THREE.AmbientLight(0xffffff, 0.25));

      const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
      keyLight.position.set(3, 4, 2);
      scene.add(keyLight);

      const purpleLight = new THREE.PointLight(0x7c3aed, 1.8);
      purpleLight.position.set(-2, 2, 1);
      scene.add(purpleLight);

      const rimLight = new THREE.DirectionalLight(0x88ccff, 1.0);
      rimLight.position.set(-3, 1, -2);
      scene.add(rimLight);

      const fillLight = new THREE.PointLight(0xaaddff, 0.6, 10);
      fillLight.position.set(0, -2, 3);
      scene.add(fillLight);

      // --- Groups (same pattern as original) ---
      const outerGroup = new THREE.Group();
      scene.add(outerGroup);
      const innerGroup = new THREE.Group();
      outerGroup.add(innerGroup);

      // --- Ice material ---
      const iceMaterial = new THREE.MeshPhysicalMaterial({
        transmission: 0.92,
        thickness: 1.8,
        roughness: 0.12,
        metalness: 0.0,
        ior: 1.31,
        envMapIntensity: 1.4,
        transparent: true,
        opacity: 0.88,
        color: new THREE.Color(0xd4eeff),
        attenuationColor: new THREE.Color(0x7c3aed),  // brand purple bleeds into refraction
        attenuationDistance: 2.5,
        clearcoat: 0.4,
        clearcoatRoughness: 0.1,
        bumpMap: noiseTex,
        bumpScale: 0.022,
      });

      // --- Rounded cube geometry ---
      const cubeGeo = new THREE.BoxGeometry(1.65, 1.65, 1.65, 10, 10, 10);
      const pos = cubeGeo.attributes.position;
      const r = 0.825;
      const cornerRadius = 0.16;
      for (let i = 0; i < pos.count; i++) {
        let x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
        const dx = Math.max(0, Math.abs(x) - (r - cornerRadius));
        const dy = Math.max(0, Math.abs(y) - (r - cornerRadius));
        const dz = Math.max(0, Math.abs(z) - (r - cornerRadius));
        const d = Math.sqrt(dx*dx + dy*dy + dz*dz);
        if (d > 0) {
          const scale = (r - cornerRadius + cornerRadius * (d / (d + 0.001))) / (Math.sqrt(
            (Math.abs(x) > r - cornerRadius ? dx : 0)**2 +
            (Math.abs(y) > r - cornerRadius ? dy : 0)**2 +
            (Math.abs(z) > r - cornerRadius ? dz : 0)**2
          ) + r - cornerRadius);
          if (Math.abs(x) > r - cornerRadius) x = Math.sign(x) * (r - cornerRadius + dx * (cornerRadius / (d + 0.001)));
          if (Math.abs(y) > r - cornerRadius) y = Math.sign(y) * (r - cornerRadius + dy * (cornerRadius / (d + 0.001)));
          if (Math.abs(z) > r - cornerRadius) z = Math.sign(z) * (r - cornerRadius + dz * (cornerRadius / (d + 0.001)));
          pos.setXYZ(i, x, y, z);
        }
      }
      cubeGeo.computeVertexNormals();

      const cube = new THREE.Mesh(cubeGeo, iceMaterial);
      innerGroup.add(cube);

      // --- Bright edge outline (preserved from original) ---
      const edgesGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(1.65, 1.65, 1.65));
      const edgeMat = new THREE.LineBasicMaterial({
        color: 0xc4b5fd,
        transparent: true,
        opacity: 0.55,
      });
      innerGroup.add(new THREE.LineSegments(edgesGeo, edgeMat));

      // Inner ghost cube (preserved from original)
      const ghostGeo = new THREE.BoxGeometry(0.88, 0.88, 0.88);
      const ghostEdgeMat = new THREE.LineBasicMaterial({
        color: 0x9b6dff,
        transparent: true,
        opacity: 0.45,
      });
      innerGroup.add(new THREE.LineSegments(new THREE.EdgesGeometry(ghostGeo), ghostEdgeMat));

      // --- LatheGeometry drips ---
      const dripMaterial = new THREE.MeshPhysicalMaterial({
        transmission: 0.94,
        thickness: 0.25,
        roughness: 0.04,
        ior: 1.33,
        envMapIntensity: 1.8,
        transparent: true,
        opacity: 0.80,
        color: new THREE.Color(0xc8eaff),
        attenuationColor: new THREE.Color(0x7c3aed),
        attenuationDistance: 0.4,
        clearcoat: 0.9,
        clearcoatRoughness: 0.04,
      });

      type DripMesh = any;

      function createDrip(offsetX: number, offsetZ: number, baseScale: number): DripMesh {
        const points = [
          new THREE.Vector2(0,     0.00),
          new THREE.Vector2(0.038, 0.06),
          new THREE.Vector2(0.062, 0.18),
          new THREE.Vector2(0.070, 0.32),
          new THREE.Vector2(0.058, 0.48),
          new THREE.Vector2(0.042, 0.62),
          new THREE.Vector2(0.054, 0.76),
          new THREE.Vector2(0.068, 0.88),
          new THREE.Vector2(0.052, 0.98),
          new THREE.Vector2(0.028, 1.06),
          new THREE.Vector2(0.010, 1.11),
          new THREE.Vector2(0,     1.13),
        ];
        const geo = new THREE.LatheGeometry(points, 16);
        const drip = new THREE.Mesh(geo, dripMaterial) as DripMesh;
        drip.scale.set(baseScale, 0, baseScale);
        drip.position.set(offsetX, -0.825, offsetZ);
        drip.rotation.x = Math.PI;
        drip.userData = { baseScaleY: baseScale, targetProgress: 0, currentProgress: 0 };
        return drip;
      }

      const dripConfigs = [
        { x:  0.00, z:  0.00, scale: 0.22 },
        { x: -0.32, z:  0.18, scale: 0.16 },
        { x:  0.35, z: -0.14, scale: 0.19 },
        { x: -0.08, z: -0.35, scale: 0.13 },
        { x:  0.20, z:  0.32, scale: 0.15 },
      ];

      const drips = dripConfigs.map(c => {
        const d = createDrip(c.x, c.z, c.scale);
        innerGroup.add(d);
        return d;
      });

      // --- GSAP ScrollTrigger ---
      // Ties drip extension to scroll position of the landing page
      const scrollState = { progress: 0 };

      ScrollTrigger.create({
        trigger: document.body,
        start: 'top top',
        end: '30% top',
        scrub: 1.2,
        onUpdate: (self) => {
          scrollState.progress = self.progress;
        },
      });

      // Stagger each drip's reveal across the scroll range
      drips.forEach((drip, i) => {
        const dripStart = i * 0.12;
        const dripEnd = dripStart + 0.55;
        gsap.to(drip.userData, {
          targetProgress: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: document.body,
            start: `${dripStart * 30}% top`,
            end: `${dripEnd * 30}% top`,
            scrub: 1.5,
            onUpdate: (self) => {
              drip.userData.targetProgress = self.progress;
            },
          },
        });
      });

      // Subtle camera push-in on scroll
      gsap.to(camera.position, {
        z: 3.6,
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: '40% top',
          scrub: 2,
        },
      });

      // --- Mouse tracking (same as original) ---
      const mouse = { x: 0, y: 0 };
      const onMouseMove = (e: MouseEvent) => {
        mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
        mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
      };
      window.addEventListener('mousemove', onMouseMove);

      // --- Animate ---
      let frameId = 0;
      const animate = () => {
        if (!active) return;
        frameId = requestAnimationFrame(animate);

        // Same rotation as original
        innerGroup.rotation.x += 0.003;
        innerGroup.rotation.y += 0.004;
        innerGroup.rotation.z += 0.002;

        // Same parallax as original
        outerGroup.rotation.x += (mouse.y * 0.18 - outerGroup.rotation.x) * 0.035;
        outerGroup.rotation.y += (mouse.x * 0.18 - outerGroup.rotation.y) * 0.035;

        // Drip animation — lerp toward GSAP-driven target
        drips.forEach((drip) => {
          drip.userData.currentProgress +=
            (drip.userData.targetProgress - drip.userData.currentProgress) * 0.06;
          const p = drip.userData.currentProgress;
          drip.scale.set(
            drip.userData.baseScaleY,
            p * drip.userData.baseScaleY,
            drip.userData.baseScaleY
          );
          drip.position.y = -0.825 - p * 0.10;
          drip.visible = p > 0.01;
        });

        renderer.render(scene, camera);
      };
      animate();

      cleanup = () => {
        active = false;
        cancelAnimationFrame(frameId);
        window.removeEventListener('mousemove', onMouseMove);
        ScrollTrigger.getAll().forEach(st => st.kill());
        renderer.dispose();
        pmrem.dispose();
        if (mount.contains(renderer.domElement)) {
          mount.removeChild(renderer.domElement);
        }
      };
    })();

    return () => {
      active = false;
      cleanup();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        width: 'min(580px, 92vw)',
        height: 'min(580px, 92vw)',
      }}
    />
  );
}
