import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import grassShader from "@/components/grass/shaders/grass";
import grassTexture from "@/generated_texture.png";
import cloudTexture from "@/components/grass/textures/cloud.jpg";
import CustomShaderMaterial from "three-custom-shader-material";
import { useControls, folder } from "leva";

const startTime = Date.now();

const convertRange = (val, oldMin, oldMax, newMin, newMax) => {
  return ((val - oldMin) * (newMax - newMin)) / (oldMax - oldMin) + newMin;
};

export const GrassField = () => {
  const grassMaterialRef = useRef();

  const {
    planeSize,
    bladeCount,
    bladeWidth,
    bladeHeight,
    bladeHeightVariation,
    color,
    waveSpeed,
    brightness,
    contrast,
  } = useControls({
    Grass: folder({
      planeSize: {
        value: 25,
        min: 1,
        max: 100,
        step: 1,
        label: "Plane Size",
      },
      bladeCount: {
        value: 100000,
        min: 1000,
        max: 500000,
        step: 1000,
        label: "Blade Count",
      },
      bladeWidth: {
        value: 0.1,
        min: 0.01,
        max: 1,
        step: 0.01,
        label: "Blade Width",
      },
      bladeHeight: {
        value: 0.4,
        min: 0.1,
        max: 2,
        step: 0.1,
        label: "Blade Height",
      },
      bladeHeightVariation: {
        value: 0.6,
        min: 0,
        max: 1,
        step: 0.1,
        label: "Blade Height Variation",
      },
      color: { value: "#d69974", label: "Grass Color" },
      waveSpeed: {
        value: 2.0,
        min: 0.1,
        max: 5,
        step: 0.1,
        label: "Wave Speed",
      },
      brightness: {
        value: -0.2,
        min: -1,
        max: 1,
        step: 0.1,
        label: "Brightness",
      },
      contrast: {
        value: 0.2,
        min: -1,
        max: 1,
        step: 0.1,
        label: "Contrast",
      },
    }),
  });

  const adjustedColor = useMemo(() => {
    const baseColor = new THREE.Color(color);
    const contrastFactor = 1 + contrast;
    const brightnessFactor = 1 + brightness;

    baseColor.r = (baseColor.r - 0.5) * contrastFactor + 0.5;
    baseColor.g = (baseColor.g - 0.5) * contrastFactor + 0.5;
    baseColor.b = (baseColor.b - 0.5) * contrastFactor + 0.5;

    baseColor.multiplyScalar(brightnessFactor);

    baseColor.r = Math.min(Math.max(baseColor.r, 0), 1);
    baseColor.g = Math.min(Math.max(baseColor.g, 0), 1);
    baseColor.b = Math.min(Math.max(baseColor.b, 0), 1);

    return baseColor;
  }, [color, brightness, contrast]);

  const grassTextures = useMemo(() => {
    const loader = new THREE.TextureLoader();
    return [loader.load(grassTexture), loader.load(cloudTexture)];
  }, []);

  const grassUniforms = useMemo(
    () => ({
      iTime: { value: 0.0 },
    }),
    []
  );

  const grassGeometry = useMemo(
    () =>
      generateField(
        planeSize,
        bladeCount,
        bladeWidth,
        bladeHeight,
        bladeHeightVariation
      ),
    [planeSize, bladeCount, bladeWidth, bladeHeight, bladeHeightVariation]
  );

  useFrame((state) => {
    if (grassMaterialRef.current) {
      grassMaterialRef.current.uniforms.iTime.value =
        state.clock.elapsedTime * waveSpeed;
    }
  });

  return (
    <>
      <mesh geometry={grassGeometry} castShadow={true} receiveShadow={true}>
        <CustomShaderMaterial
          ref={grassMaterialRef}
          baseMaterial={THREE.MeshToonMaterial}
          uniforms={grassUniforms}
          vertexShader={grassShader.vert}
          color={adjustedColor}
          vertexColors={true}
          side={THREE.DoubleSide}
          silent
        />
      </mesh>
      <mesh position={[0, 2, 5]} castShadow={true} receiveShadow={true}>
        <boxGeometry args={[1, 4, 5]} />
        {/* <CustomShaderMaterial /> */}
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow={true}>
        <planeGeometry args={[planeSize, planeSize, 1, 1]} />
        <meshStandardMaterial color="gray" />
      </mesh>
    </>
  );
};

const generateField = (
  planeSize,
  bladeCount,
  bladeWidth,
  bladeHeight,
  bladeHeightVariation
) => {
  const positions = [];
  const uvs = [];
  const indices = [];
  const colors = [];

  const VERTEX_COUNT = 5;
  const surfaceMin = (planeSize / 2) * -1;
  const surfaceMax = planeSize / 2;
  const radius = planeSize / 2;

  for (let i = 0; i < bladeCount; i++) {
    const r = radius * Math.sqrt(Math.random());
    const theta = Math.random() * 2 * Math.PI;
    const x = r * Math.cos(theta);
    const y = r * Math.sin(theta);

    const pos = new THREE.Vector3(x, 0, y);

    const uv = [
      convertRange(pos.x, surfaceMin, surfaceMax, 0, 1),
      convertRange(pos.z, surfaceMin, surfaceMax, 0, 1),
    ];

    const blade = generateBlade(
      pos,
      i * VERTEX_COUNT,
      uv,
      bladeWidth,
      bladeHeight,
      bladeHeightVariation
    );
    blade.verts.forEach((vert) => {
      positions.push(...vert.pos);
      uvs.push(...vert.uv);
      colors.push(...vert.color);
    });
    blade.indices.forEach((indice) => indices.push(indice));
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(positions), 3)
  );
  geom.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(uvs), 2));
  geom.setAttribute(
    "color",
    new THREE.BufferAttribute(new Float32Array(colors), 3)
  );
  geom.setIndex(indices);
  geom.computeVertexNormals();

  return geom;
};

const generateBlade = (
  center,
  vArrOffset,
  uv,
  bladeWidth,
  bladeHeight,
  bladeHeightVariation
) => {
  const MID_WIDTH = bladeWidth * 0.5;
  const TIP_OFFSET = 0.1;
  const height = bladeHeight + Math.random() * bladeHeightVariation;

  const yaw = Math.random() * Math.PI * 2;
  const yawUnitVec = new THREE.Vector3(Math.sin(yaw), 0, -Math.cos(yaw));
  const tipBend = Math.random() * Math.PI * 2;
  const tipBendUnitVec = new THREE.Vector3(
    Math.sin(tipBend),
    0,
    -Math.cos(tipBend)
  );

  const bl = new THREE.Vector3().addVectors(
    center,
    new THREE.Vector3().copy(yawUnitVec).multiplyScalar((bladeWidth / 2) * 1)
  );
  const br = new THREE.Vector3().addVectors(
    center,
    new THREE.Vector3().copy(yawUnitVec).multiplyScalar((bladeWidth / 2) * -1)
  );
  const tl = new THREE.Vector3().addVectors(
    center,
    new THREE.Vector3().copy(yawUnitVec).multiplyScalar((MID_WIDTH / 2) * 1)
  );
  const tr = new THREE.Vector3().addVectors(
    center,
    new THREE.Vector3().copy(yawUnitVec).multiplyScalar((MID_WIDTH / 2) * -1)
  );
  const tc = new THREE.Vector3().addVectors(
    center,
    new THREE.Vector3().copy(tipBendUnitVec).multiplyScalar(TIP_OFFSET)
  );

  tl.y += height / 2;
  tr.y += height / 2;
  tc.y += height;

  // vertex Colors
  const black = [0, 0, 0];
  const gray = [0.5, 0.5, 0.5];
  const white = [1.0, 1.0, 1.0];

  const verts = [
    { pos: bl.toArray(), uv: uv, color: black },
    { pos: br.toArray(), uv: uv, color: black },
    { pos: tr.toArray(), uv: uv, color: gray },
    { pos: tl.toArray(), uv: uv, color: gray },
    { pos: tc.toArray(), uv: uv, color: white },
  ];

  const indices = [
    vArrOffset,
    vArrOffset + 1,
    vArrOffset + 2,
    vArrOffset + 2,
    vArrOffset + 4,
    vArrOffset + 3,
    vArrOffset + 3,
    vArrOffset,
    vArrOffset + 2,
  ];

  return { verts, indices };
};
