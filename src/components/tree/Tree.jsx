import { Clone, useGLTF } from "@react-three/drei";
import { FoliageMaterial } from "./shaders/FoliageMaterial";

export function Tree({ position, rotation }) {
  const tree = useGLTF("https://douges.dev/static/tree.glb");

  return (
    <group name="tree" rotation={rotation} position={position}>
      <Clone
        receiveShadow
        castShadow
        object={tree.nodes.trunk}
        inject={<meshBasicMaterial color="black" />}
      />
      <Clone
        receiveShadow
        castShadow
        object={tree.nodes.foliage}
        inject={<FoliageMaterial />}
      />
    </group>
  );
}
