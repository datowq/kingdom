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

const MainScene = ({ maskCanvas }) => {
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
          files="src/assets/sky_linekotsi_05_b_HDRI.hdr"
          background 
        /> */}
        {/* <Stage
          intensity={1}
          environment="sunset"
          contactShadow={{ opacity: 0.5, blur: 2 }}
          shadows={{ type: "soft" }}
          adjustCamera={1}
        > */}
        {/* <Rock position={[0, 1, 0]} scale={2} /> */}
        <GrassField maskCanvas={maskCanvas} />
        {/* <AsciiRenderer /> */}
        <OrbitControls />
      </Suspense>
    </>
  );
};

export default MainScene;
