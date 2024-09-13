import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import grassShader from "@/components/grass/shaders/grass";
// import grassTexture from "@/components/grass/textures/grass.jpg";
// import grassTexture from "@/components/grass/textures/grass.jpg";
import grassTexture from "@/generated_texture.png";
import cloudTexture from "@/components/grass/textures/cloud.jpg";
import CustomShaderMaterial from "three-custom-shader-material";
import { useControls } from "leva";

const PLANE_SIZE = 25;
const BLADE_COUNT = 100000;
const BLADE_WIDTH = 0.1;
const BLADE_HEIGHT = 0.4; // 0.8
const BLADE_HEIGHT_VARIATION = 0.6; // 0.6
const startTime = Date.now();

const convertRange = (val, oldMin, oldMax, newMin, newMax) => {
  return ((val - oldMin) * (newMax - newMin)) / (oldMax - oldMin) + newMin;
};

export const GrassField = () => {
  const grassMaterialRef = useRef();

  const { color, waveSpeed, brightness } = useControls({
    color: { value: "#00ff00", label: "Grass Color" }, // Color picker for grass
    waveSpeed: { value: 1.0, min: 0.1, max: 5, step: 0.1, label: "Wave Speed" }, // Speed of grass animation
    brightness: {
      value: -0.1,
      min: -1,
      max: 1,
      step: 0.1,
      label: "Brightness",
    }, // Brightness control
  });

  const grassTextures = useMemo(() => {
    const loader = new THREE.TextureLoader();
    return [loader.load(grassTexture), loader.load(cloudTexture)];
  }, []);

  // Initialize uniforms
  const grassUniforms = useMemo(
    () => ({
      textures: { value: grassTextures },
      waveSpeed: { value: waveSpeed },
      brightness: { value: brightness },
      colorPicked: { value: new THREE.Color(color) },
      iTime: { value: 0.0 },
    }),
    [grassTextures, waveSpeed]
  );

  const geometry = useMemo(() => generateField(), []);

  useFrame((state) => {
    if (grassMaterialRef.current) {
      grassMaterialRef.current.uniforms.iTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <>
      <mesh
        geometry={geometry}
        // material={material}
        castShadow={true}
        receiveShadow={true}
      >
        {/* <shadowMaterial attach="material" opacity={0.9} /> */}
        <CustomShaderMaterial
          ref={grassMaterialRef}
          baseMaterial={THREE.MeshToonMaterial}
          uniforms={grassUniforms}
          vertexShader={grassShader.vert}
          fragmentShader={grassShader.frag}
          vertexColors={true}
          side={THREE.DoubleSide}
          silent
          // flatShading
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow={true}>
        <planeGeometry args={[PLANE_SIZE, PLANE_SIZE, 1, 1]} />
        <meshStandardMaterial color="gray" />
      </mesh>
    </>
  );
};

const generateField = () => {
  const positions = [];
  const uvs = [];
  const indices = [];
  const colors = [];

  const VERTEX_COUNT = 5;
  const surfaceMin = (PLANE_SIZE / 2) * -1;
  const surfaceMax = PLANE_SIZE / 2;
  const radius = PLANE_SIZE / 2;

  for (let i = 0; i < BLADE_COUNT; i++) {
    const r = radius * Math.sqrt(Math.random());
    const theta = Math.random() * 2 * Math.PI;
    const x = r * Math.cos(theta);
    const y = r * Math.sin(theta);

    const pos = new THREE.Vector3(x, 0, y);

    const uv = [
      convertRange(pos.x, surfaceMin, surfaceMax, 0, 1),
      convertRange(pos.z, surfaceMin, surfaceMax, 0, 1),
    ];

    const blade = generateBlade(pos, i * VERTEX_COUNT, uv);
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

const generateBlade = (center, vArrOffset, uv) => {
  const MID_WIDTH = BLADE_WIDTH * 0.5;
  const TIP_OFFSET = 0.1;
  const height = BLADE_HEIGHT + Math.random() * BLADE_HEIGHT_VARIATION;

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
    new THREE.Vector3().copy(yawUnitVec).multiplyScalar((BLADE_WIDTH / 2) * 1)
  );
  const br = new THREE.Vector3().addVectors(
    center,
    new THREE.Vector3().copy(yawUnitVec).multiplyScalar((BLADE_WIDTH / 2) * -1)
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

  // Vertex Colors
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
