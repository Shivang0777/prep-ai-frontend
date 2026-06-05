import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const LivingUI = () => {
  const mesh = useRef();
  
  // Custom Shader Logic for "Next-Level" Visuals
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    mesh.current.material.uniforms.uTime.value = t;
  });

  const shaderArgs = {
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color("#3b82f6") }
    },
    vertexShader: `
      varying vec2 vUv;
      uniform float uTime;
      void main() {
        vUv = uv;
        vec3 pos = position;
        pos.z += sin(pos.x * 5.0 + uTime) * 0.2;
        pos.y += cos(pos.z * 3.0 + uTime) * 0.1;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float uTime;
      uniform vec3 uColor;
      void main() {
        float alpha = 0.5 + 0.5 * sin(vUv.y * 10.0 + uTime);
        gl_FragColor = vec4(uColor, alpha * 0.2);
      }
    `
  };

  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
      <planeGeometry args={[20, 20, 64, 64]} />
      <shaderMaterial args={[shaderArgs]} transparent={true} side={THREE.DoubleSide} />
    </mesh>
  );
};

export default LivingUI;