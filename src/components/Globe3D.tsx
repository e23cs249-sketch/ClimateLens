import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface Globe3DProps {
  selectedLocation: { label: string; latitude: number; longitude: number };
  onSelectCity: (city: { label: string; latitude: number; longitude: number }) => void;
  className?: string;
}

const NOTABLE_HUBS = [
  { label: 'Chennai, Tamil Nadu, India', latitude: 13.0827, longitude: 80.2707, risk: 'Moderate Coastal Heat', color: '#19B8A5' },
  { label: 'Delhi, India', latitude: 28.6139, longitude: 77.209, risk: 'Elevated AQI / Particulate', color: '#FFBF69' },
  { label: 'Mumbai, Maharashtra, India', latitude: 19.076, longitude: 72.8777, risk: 'Monsoon Surge / Tidal Alert', color: '#8CE6E0' },
  { label: 'Bengaluru, Karnataka, India', latitude: 12.9716, longitude: 77.5946, risk: 'Moderate Rainfall Runoff', color: '#19B8A5' },
  { label: 'London, United Kingdom', latitude: 51.5074, longitude: -0.1278, risk: 'Temperate Atlantic Front', color: '#8CE6E0' },
  { label: 'Tokyo, Japan', latitude: 35.6762, longitude: 139.6503, risk: 'Coastal Pacific Barometry', color: '#19B8A5' },
  { label: 'New York, USA', latitude: 40.7128, longitude: -74.006, risk: 'Urban Heat Island State', color: '#8CE6E0' },
];

export const Globe3D: React.FC<Globe3DProps> = ({
  selectedLocation,
  onSelectCity,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activePin, setActivePin] = useState<string>(selectedLocation.label.split(',')[0]);
  const [isInteractive, setIsInteractive] = useState(true);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 480;
    const height = container.clientHeight || 480;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 2.6;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Globe Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Base Sphere
    const sphereGeometry = new THREE.SphereGeometry(1, 64, 64);
    const sphereMaterial = new THREE.MeshPhongMaterial({
      color: new THREE.Color('#071E2B'),
      emissive: new THREE.Color('#04121B'),
      specular: new THREE.Color('#19B8A5'),
      shininess: 25,
      transparent: true,
      opacity: 0.94,
    });
    const globeMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    globeGroup.add(globeMesh);

    // Continental Wireframe / Grid
    const wireframeGeometry = new THREE.WireframeGeometry(new THREE.SphereGeometry(1.002, 28, 28));
    const wireframeMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color('#19B8A5'),
      transparent: true,
      opacity: 0.18,
    });
    const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
    globeGroup.add(wireframe);

    // Luminous Atmospheric Outer Halo
    const atmosphereGeometry = new THREE.SphereGeometry(1.15, 48, 48);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          gl_FragColor = vec4(0.1, 0.72, 0.65, 1.0) * intensity * 0.85;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);

    // Helper: Convert Lat/Lon to 3D Cartesian coordinates
    const latLonToVector3 = (lat: number, lon: number, radius: number) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);
      return new THREE.Vector3(x, y, z);
    };

    // Add city pins and pulsating radar rings
    const pinGroup = new THREE.Group();
    globeGroup.add(pinGroup);

    NOTABLE_HUBS.forEach((hub) => {
      const pos = latLonToVector3(hub.latitude, hub.longitude, 1.01);

      // Marker sphere
      const markerGeo = new THREE.SphereGeometry(0.024, 16, 16);
      const markerMat = new THREE.MeshBasicMaterial({ color: hub.color });
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.copy(pos);
      pinGroup.add(marker);

      // Outer ripple ring
      const ringGeo = new THREE.RingGeometry(0.028, 0.042, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: hub.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(pos);
      ring.lookAt(new THREE.Vector3(0, 0, 0));
      pinGroup.add(ring);
    });

    // Orbital Climate Observation Ring
    const orbitCurve = new THREE.EllipseCurve(0, 0, 1.35, 1.35, 0, 2 * Math.PI, false, 0);
    const orbitPoints = orbitCurve.getPoints(100);
    const orbitGeo = new THREE.BufferGeometry().setFromPoints(
      orbitPoints.map((p) => new THREE.Vector3(p.x, 0, p.y))
    );
    const orbitMat = new THREE.LineBasicMaterial({ color: '#8CE6E0', transparent: true, opacity: 0.25 });
    const orbitLine = new THREE.Line(orbitGeo, orbitMat);
    orbitLine.rotation.x = Math.PI / 4;
    scene.add(orbitLine);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x8ce6e0, 1.8);
    dirLight.position.set(5, 3, 5);
    scene.add(dirLight);

    // Initial rotation toward selected city
    const targetVector = latLonToVector3(selectedLocation.latitude, selectedLocation.longitude, 1);
    globeGroup.rotation.y = -targetVector.x * 0.8;
    globeGroup.rotation.x = targetVector.y * 0.5;

    // Mouse / Touch Interaction Controls
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let autoRotate = true;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      autoRotate = false;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      globeGroup.rotation.y += deltaX * 0.006;
      globeGroup.rotation.x += deltaY * 0.006;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
      setTimeout(() => {
        autoRotate = true;
      }, 3500);
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Touch support
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        autoRotate = false;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMouseX;
      const deltaY = e.touches[0].clientY - prevMouseY;
      globeGroup.rotation.y += deltaX * 0.006;
      globeGroup.rotation.x += deltaY * 0.006;
      prevMouseX = e.touches[0].clientX;
      prevMouseY = e.touches[0].clientY;
    };
    const onTouchEnd = () => {
      isDragging = false;
      setTimeout(() => {
        autoRotate = true;
      }, 3500);
    };

    dom.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (autoRotate) {
        globeGroup.rotation.y += 0.0018;
      }

      // Gentle wobble of orbit
      orbitLine.rotation.z = Math.sin(elapsedTime * 0.3) * 0.05;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      if (container.contains(dom)) {
        container.removeChild(dom);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      {/* 3D WebGL Canvas Container */}
      <div
        ref={mountRef}
        className="w-full h-[380px] sm:h-[440px] md:h-[480px] cursor-grab active:cursor-grabbing relative"
        title="Click and drag to rotate the interactive Climate Intelligence globe"
      />

      {/* Floating Active Hub Indicator */}
      <div className="absolute bottom-3 left-4 right-4 sm:left-auto sm:right-4 z-10 flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg liquid-glass border border-white/10 text-xs text-[#A7BAC4]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#19B8A5] animate-ping" />
          <span className="font-semibold text-[#F3F8FA]">Interactive 3D Grid</span>
          <span className="hidden sm:inline text-white/40">·</span>
          <span className="text-[11px] text-[#8CE6E0]">Click hubs or drag to rotate</span>
        </div>

        {/* Quick Hub Pins */}
        <div className="flex flex-wrap items-center gap-1.5">
          {NOTABLE_HUBS.slice(0, 4).map((hub) => (
            <button
              key={hub.label}
              onClick={() => {
                onSelectCity({
                  label: hub.label,
                  latitude: hub.latitude,
                  longitude: hub.longitude,
                });
                setActivePin(hub.label.split(',')[0]);
              }}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all ${
                selectedLocation.label.startsWith(hub.label.split(',')[0])
                  ? 'bg-[#19B8A5] text-[#071722] font-bold shadow-xs'
                  : 'bg-white/5 hover:bg-white/10 text-[#A7BAC4] hover:text-[#F3F8FA]'
              }`}
            >
              {hub.label.split(',')[0]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
