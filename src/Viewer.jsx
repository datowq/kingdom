import { Canvas } from "@react-three/fiber";
import { Perf } from "r3f-perf";
import MainScene from "./MainScene";

export const Viewer = () => {
  return (
    <Canvas
      className="h-full"
      camera={{ position: [0, 5, 5], fov: 90 }}
      shadows={"soft"}
    >
      <Perf position="top-left" showGraph={false} />
      <MainScene />
    </Canvas>
  );
};
