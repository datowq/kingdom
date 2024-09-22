import { Canvas } from "@react-three/fiber";
import { Perf } from "r3f-perf";
import MainScene from "./MainScene";
import PathCanvas from "@/components/pathcanvas/PathCanvas";
import { useEffect, useState, useCallback } from "react";

export const Viewer = () => {
  const [maskDataURL, setMaskDataURL] = useState(null);
  const [maskCanvas, setMaskCanvas] = useState(null);

  const handleMaskChange = useCallback((dataURL) => {
    console.log("Mask updated");
    setMaskDataURL(dataURL);
  }, []);

  useEffect(() => {
    if (!maskDataURL) return;

    const img = new Image();
    img.src = maskDataURL;
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      setMaskCanvas(imageData);
    };
  }, [maskDataURL]);

  return (
    <>
      <Canvas
        className="h-full"
        camera={{ position: [0, 5, 5], fov: 90 }}
        shadows={"soft"}
      >
        <Perf position="top-left" showGraph={false} />
        <MainScene maskCanvas={maskCanvas} />
      </Canvas>
      <PathCanvas width={512} height={512} onMaskChange={handleMaskChange} />
    </>
  );
};
