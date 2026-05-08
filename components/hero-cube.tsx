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
      if (!active) return;

      const size = Math.min(580, window.innerWidth * 0.92);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
      camera.position.z = 4.2;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(size, size);
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      mount.appendChild(renderer.domElement);

      // Lights required by MeshPhysicalMaterial
      const purpleLight = new THREE.PointLight(0x7c3aed, 2);
      purpleLight.position.set(2, 2, 2);
      scene.add(purpleLight);

      const fillLight = new THREE.PointLight(0xffffff, 0.3);
      fillLight.position.set(-2, -1, -2);
      scene.add(fillLight);

      // Outer group — receives mouse parallax tilt
      const outerGroup = new THREE.Group();
      scene.add(outerGroup);

      // Inner group — continuous auto-rotation
      const innerGroup = new THREE.Group();
      outerGroup.add(innerGroup);

      const geo = new THREE.BoxGeometry(1.65, 1.65, 1.65);

      // Glass faces — PBR physical material
      const faceMat = new THREE.MeshPhysicalMaterial({
        color: 0x9b6dff,
        transparent: true,
        opacity: 0.08,
        roughness: 0,
        metalness: 0.1,
        side: THREE.DoubleSide,
      });
      innerGroup.add(new THREE.Mesh(geo, faceMat));

      // Primary outer edges — bright violet
      const edgesGeo = new THREE.EdgesGeometry(geo);
      const outerEdgeMat = new THREE.LineBasicMaterial({
        color: 0xc4b5fd,
        transparent: true,
        opacity: 1.0,
      });
      innerGroup.add(new THREE.LineSegments(edgesGeo, outerEdgeMat));

      // Inner ghost cube 1 — deep purple, upgraded opacity
      const innerGeo = new THREE.BoxGeometry(0.88, 0.88, 0.88);
      const innerEdgesGeo = new THREE.EdgesGeometry(innerGeo);
      const innerEdgeMat = new THREE.LineBasicMaterial({
        color: 0x9b6dff,
        transparent: true,
        opacity: 0.6,
      });
      innerGroup.add(new THREE.LineSegments(innerEdgesGeo, innerEdgeMat));

      // Inner ghost cube 2 — 0.5 scale, glass faces + lavender edges
      const innerGeo2 = new THREE.BoxGeometry(0.825, 0.825, 0.825);
      const innerFaceMat2 = new THREE.MeshPhysicalMaterial({
        color: 0x9b6dff,
        transparent: true,
        opacity: 0.15,
        roughness: 0,
        metalness: 0.1,
        side: THREE.DoubleSide,
      });
      innerGroup.add(new THREE.Mesh(innerGeo2, innerFaceMat2));
      const innerEdgesGeo2 = new THREE.EdgesGeometry(innerGeo2);
      const innerEdgeMat2 = new THREE.LineBasicMaterial({
        color: 0xa78bfa,
        transparent: true,
        opacity: 0.75,
      });
      innerGroup.add(new THREE.LineSegments(innerEdgesGeo2, innerEdgeMat2));

      // Mouse tracking
      const mouse = { x: 0, y: 0 };
      const onMouseMove = (e: MouseEvent) => {
        mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
        mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
      };
      window.addEventListener('mousemove', onMouseMove);

      let frameId = 0;
      const animate = () => {
        if (!active) return;
        frameId = requestAnimationFrame(animate);

        innerGroup.rotation.x += 0.004;
        innerGroup.rotation.y += 0.006;
        innerGroup.rotation.z += 0.002;

        outerGroup.rotation.x += (mouse.y * 0.18 - outerGroup.rotation.x) * 0.035;
        outerGroup.rotation.y += (mouse.x * 0.18 - outerGroup.rotation.y) * 0.035;

        renderer.render(scene, camera);
      };
      animate();

      cleanup = () => {
        cancelAnimationFrame(frameId);
        window.removeEventListener('mousemove', onMouseMove);
        renderer.dispose();
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
