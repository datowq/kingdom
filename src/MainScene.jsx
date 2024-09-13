import React, { useState, useRef, useEffect, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  AsciiRenderer,
  OrbitControls,
  Stage,
  Sky,
  Environment,
} from "@react-three/drei";
import { checkWebGLVersions } from "@/utils/utils";
import { Rock } from "@/components/rock/Rock";
import { GrassField } from "@/components/grass/Grass";
import { DirectionalLightHelper, DirectionalLight } from "three";
import { Skybox, SunBox } from "./components/sky/Sky";

const MainScene = () => {
  // useEffect(() => {
  //   checkWebGLVersions();
  // }, []);
  return (
    <>
      <Suspense fallback={null}>
        <ambientLight intensity={0.5} />
        <hemisphereLight intensity={0.5} />
        {/* <Sky /> */}
        <SunBox />
        {/* <Environment
          files="src/assets/sky_linekotsi_05_b_HDRI.hdr" // Path to your HDRI file
          background // This sets the HDRI as the scene background
        /> */}
        {/* <Stage
          intensity={1} // Adjusts the overall brightness of the lighting
          environment="sunset" // Sets the environment map for reflections (can be set to various presets)
          contactShadow={{ opacity: 0.5, blur: 2 }} // Configures contact shadows
          shadows={{ type: "soft" }} // Sets shadow quality
          adjustCamera={1} // Adjusts camera distance to fit the content
        > */}
        <Rock position={[0, 1, 0]} scale={2} />
        <GrassField />
        {/* <AsciiRenderer />  */}
        <OrbitControls />
      </Suspense>
    </>
  );
};

export default MainScene;
