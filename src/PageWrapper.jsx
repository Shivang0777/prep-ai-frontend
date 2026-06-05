import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import { Points } from "@react-three/drei";
import * as THREE from "three";

const Particles = () => {
  const pointsRef = useRef();
  const count = 8000;

  // Positions + Colors (dark theme friendly)
  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 25;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;

      // Bright blue/cyan colors for dark background
      col[i * 3] = 8;   // R
      col[i * 3 + 1] = 1; // G
      col[i * 3 + 2] = 1; // B
      
    }

    return { positions: pos, colors: col };
  }, []);

  // Animate rotation + slow hue shift
  useFrame(({ clock }) => {
    if (pointsRef.current) {
      const t = clock.getElapsedTime();

      // Rotation animation
      pointsRef.current.rotation.y = t * 0.2;
      pointsRef.current.rotation.x = t * 0.1;

      // Optional: slow hue shift
      pointsRef.current.material.color.offsetHSL(0.0002, 0, 0);
    }
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false } colors={colors}>
      <pointsMaterial
        vertexColors
        size={0.08}
        sizeAttenuation
        transparent
        opacity={0.9}
        toneMapped={false} // keeps colors bright
      />
    </Points>
  );
};

const PageWrapper = ({ children }) => {
  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <Canvas
        camera={{ position: [0, 0, 15], fov: 75 }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          background: "#000d1a", 
        }}
      >
        <ambientLight intensity={0.5} />
        <Particles />
      </Canvas>

      <div style={{ position: "relative", zIndex: 10 }}>{children}</div>
    </div>
  );
};

export default PageWrapper;
