import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const createSoftCircleTexture = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d")!;
  
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
  gradient.addColorStop(0.4, "rgba(255, 255, 255, 0.3)");
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
};

const FlowingParticles = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const texture = useMemo(() => createSoftCircleTexture(), []);

  const size = 60;
  const separation = 0.18;

  const count = size * size;
  const positions = useMemo(() => new Float32Array(count * 3), []);
  const scales = useMemo(() => new Float32Array(count), []);

  useMemo(() => {
    let i = 0;
    const offset = (size * separation) / 2;

    for (let x = 0; x < size; x++) {
      for (let z = 0; z < size; z++) {
        positions[i * 3] = x * separation - offset;
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] = z * separation - offset;
        
        scales[i] = Math.random() * 0.5 + 0.5; 
        i++;
      }
    }
  }, [positions, scales, size, separation]);

  const vertexShader = `
    uniform float uTime;
    uniform float uSeparation;
    uniform float uSize;
    
    attribute float scale;
    
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      vec3 pos = position;
      
      float time = uTime * 0.6;
      
      float waveX = sin(pos.x * 0.6 + time);
      float waveZ = cos(pos.z * 0.6 + time * 0.8);
      
      float waveDetail = sin(pos.x * 1.2 + pos.z * 1.2 + time * 1.5) * 0.3;
      
      pos.y = (waveX + waveZ + waveDetail) * 0.4;
      
      float dist = length(pos.xz);
      float fade = 1.0 - smoothstep(3.0, 5.5, dist);
      
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      
      gl_Position = projectionMatrix * mvPosition;
      
      gl_PointSize = scale * uSize * (2.0 / -mvPosition.z) * fade;
    }
  `;

  const fragmentShader = `
    uniform sampler2D uTexture;
    
    void main() {
      gl_FragColor = texture2D(uTexture, gl_PointCoord);
    }
  `;

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uTexture: { value: texture },
    uSeparation: { value: separation },
    uSize: { value: 14.0 },
  }), [texture, separation]);

  useFrame((state) => {
    if (pointsRef.current) {
      uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-scale" args={[scales, 1]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export const AuthBackground = () => {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", background: "#000000" }}>
      <Canvas camera={{ position: [0, 4, 6], fov: 45 }} dpr={[1, 1.5]}>
        <FlowingParticles />
      </Canvas>
    </div>
  );
};