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

      const size = Math.min(400, window.innerWidth * 0.78);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
      camera.position.z = 4.2;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(size, size);
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      mount.appendChild(renderer.domElement);

      // Outer group — receives mouse parallax tilt
      const outerGroup = new THREE.Group();
      scene.add(outerGroup);

      // Inner group — continuous auto-rotation
      const innerGroup = new THREE.Group();
      outerGroup.add(innerGroup);

      const geo = new THREE.BoxGeometry(1.65, 1.65, 1.65);

      // Transparent faces
      const faceMat = new THREE.MeshBasicMaterial({
        color: 0x7c3aed,
        transparent: true,
        opacity: 0.035,
        side: THREE.DoubleSide,
      });
      innerGroup.add(new THREE.Mesh(geo, faceMat));

      // Primary outer edges — bright lavender
      const edgesGeo = new THREE.EdgesGeometry(geo);
      const outerEdgeMat = new THREE.LineBasicMaterial({
        color: 0xb09ef0,
        transparent: true,
        opacity: 0.92,
      });
      innerGroup.add(new THREE.LineSegments(edgesGeo, outerEdgeMat));

      // Secondary inner ghost cube — deep purple, subtle
      const innerGeo = new THREE.BoxGeometry(0.88, 0.88, 0.88);
      const innerEdgesGeo = new THREE.EdgesGeometry(innerGeo);
      const innerEdgeMat = new THREE.LineBasicMaterial({
        color: 0x7c3aed,
        transparent: true,
        opacity: 0.38,
      });
      innerGroup.add(new THREE.LineSegments(innerEdgesGeo, innerEdgeMat));

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

        // Continuous slow rotation on all axes
        innerGroup.rotation.x += 0.003;
        innerGroup.rotation.y += 0.005;
        innerGroup.rotation.z += 0.0015;

        // Lerp outer group toward mouse tilt — subtle parallax
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
        width: 'min(400px, 78vw)',
        height: 'min(400px, 78vw)',
      }}
    />
  );
}
