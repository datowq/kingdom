import { Canvas, extend, useFrame } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";
import React, { useRef, useState, useEffect } from "react";

// Create the SkyboxMaterial shader with uniforms for sun direction
const SkyboxMaterial = shaderMaterial(
  { uTime: 0, uSunDirection: new THREE.Vector3(1.0, 0.3, 0.0) },
  `// Vertex Shader
    varying vec3 vDirection;
    void main() {
      vDirection = normalize(position);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  `// Fragment Shader
    uniform vec3 uSunDirection;
    varying vec3 vDirection;

    void main() {
        // Define colors for gradient
        vec4 color0 = vec4(0.093, 0.154, 0.207, 1.0);
        vec4 color1 = vec4(0.836, 0.344, 0.344, 1.0);
        vec4 color2 = vec4(0.933, 0.695, 0.487, 1.0);
        vec4 color3 = vec4(0.946, 0.770, 0.734, 1.0);
        vec4 color4 = vec4(0.861, 0.918, 0.939, 1.0);

        // Map the Y-axis of the direction vector to the gradient
        float gradientFactor = (vDirection.y + 0.75); // Maps the range [-1, 1] to [0, 4]
        int index = int(gradientFactor);
        float mixFactor = fract(gradientFactor);

        // Interpolate between the corresponding colors
        vec4 finalColor;
        if (index == 0) finalColor = mix(color0, color1, mixFactor);
        else if (index == 1) finalColor = mix(color1, color2, mixFactor);
        else if (index == 2) finalColor = mix(color2, color3, mixFactor);
        else finalColor = mix(color3, color4, mixFactor);

        // Calculate the angle between the direction and the sun
        float sunFactor = dot(normalize(vDirection), normalize(uSunDirection));
        sunFactor = clamp(sunFactor, 0.0, 1.0); // Clamp between 0 and 1

        // Blend the final color with the sun effect to create a radial glow
        vec4 sunColor = vec4(1.0, 0.9, 0.6, 1.0) * pow(sunFactor, 6.0); // Exaggerate the glow
        // gl_FragColor = finalColor + sunColor * 0.5;
        gl_FragColor = finalColor;
    }
  `
);

extend({ SkyboxMaterial });

export function Skybox({ sunPosition }) {
  const ref = useRef();

  // Update the shader uniform with the sun's direction
  useEffect(() => {
    if (ref.current) {
      ref.current.uSunDirection = sunPosition;
    }
  }, [sunPosition]);

  return (
    <mesh scale={[-1, 1, 1]} ref={ref}>
      <boxGeometry args={[1000, 1000, 1000]} />
      <skyboxMaterial attach="material" side={THREE.BackSide} />
    </mesh>
  );
}

export function SunBox({ azimuth = 34, elevation = 35 }) {
  const lightHelperRef = useRef();
  const sunRef = useRef();

  // Convert azimuth and elevation to radians
  const az = THREE.MathUtils.degToRad(azimuth);
  const el = THREE.MathUtils.degToRad(elevation);

  // Calculate the sun's position based on azimuth and elevation
  //   const sunPosition = new THREE.Vector3(
  //     Math.cos(az) * Math.cos(el),
  //     Math.sin(el),
  //     Math.sin(az) * Math.cos(el)
  //   );

  const [sunPosition, setSunPosition] = useState(
    new THREE.Vector3(
      Math.cos(az) * Math.cos(el),
      Math.sin(el),
      Math.sin(az) * Math.cos(el)
    )
  );
  //   useEffect(() => {
  //     if (sunRef.current && lightHelperRef.current) {
  //       lightHelperRef.current.update();
  //     }
  //   }, [sunPosition]);

  useEffect(() => {
    if (sunRef.current) {
      const helper = new THREE.DirectionalLightHelper(
        sunRef.current,
        5,
        "#ffddaa"
      );
      lightHelperRef.current = helper;

      sunRef.current.parent.add(helper);

      return () => {
        if (helper) {
          helper.dispose();
          sunRef.current.parent.remove(helper);
        }
      };
    }
  }, [sunRef]);

  return (
    <>
      <Skybox sunPosition={sunPosition} />
      {/* Sun Directional Light */}
      <directionalLight
        ref={sunRef}
        position={sunPosition.multiplyScalar(30)} // Controls direction, not intensity
        intensity={5} // Adjust this value to change lighting strength
        color="#ffddaa"
        castShadow
        // shadow props
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.1}
        shadow-camera-far={50}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      >
        {/* Sun Visual Object as a Child of the Light */}
        <mesh>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial
            color="#ffddaa"
            emissive="#ffddaa"
            emissiveIntensity={2}
            roughness={0.5}
            metalness={0.1}
          />
        </mesh>
      </directionalLight>
    </>
  );
}
