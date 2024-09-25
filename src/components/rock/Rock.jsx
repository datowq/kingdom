import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import model from "./rock.glb";
import * as THREE from "three";

export const Rock = (props) => {
  const { nodes, materials } = useGLTF(model);

  materials["Material.001"].color = new THREE.Color("blue");

  const material = new THREE.MeshStandardMaterial({
    color: "#a0a0a0",
    // roughness: 0.5,
    // metalness: 0.5,
  });

  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow={true}
        receiveShadow={true}
        geometry={nodes.Cube_1.geometry}
        // material={materials.Material}
        material={material}
      />
      {/* <mesh
        geometry={nodes.Cube_2.geometry}
        material={materials["Material.001"]}
        scale={0.98}
      /> */}
    </group>
  );
};

useGLTF.preload(model);
