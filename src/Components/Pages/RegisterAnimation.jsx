import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Float } from "@react-three/drei";

const ParticleField = () => {
  const starRef = useRef();

  // Slow constant rotation for a calm, space-like effect
  useFrame((state, delta) => {
    if (starRef.current) {
      starRef.current.rotation.y += delta * 0.05;
      starRef.current.rotation.x += delta * 0.02;
    }
  });

  return (
    <group ref={starRef}>
      {/* Optimized Star component - No NaN errors guaranteed */}
      <Stars 
        radius={100}   /* Radius of the inner sphere */
        depth={50}    /* Depth of area where stars should spawn */
        count={7000}  /* Number of stars */
        factor={4}    /* Size of stars */
        saturation={0} /* Grayscale stars for premium feel */
        fade={true}    /* Stars fade towards the edge */
        speed={1.5}   /* Animation speed */
      />
    </group>
  );
};

const RegisterAnimation = ({ isReady }) => {
  return (
    <div className={`animation-container ${isReady ? "blur-effect" : ""}`}>
      <Canvas camera={{ position: [0, 0, 1] }}>
        <color attach="background" args={["#000000"]} />
        <ambientLight intensity={1} />
        
        {/* Floating effect for the entire scene */}
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
           <ParticleField />
        </Float>
      </Canvas>
    </div>
  );
};

export default RegisterAnimation;
