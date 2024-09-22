import React, { useRef, useEffect } from "react";

const PathCanvas = ({ width, height, onMaskChange, style }) => {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, width, height);

    const startDrawing = (e) => {
      isDrawing.current = true;
      draw(e);
    };

    const stopDrawing = () => {
      if (isDrawing.current) {
        isDrawing.current = false;
        ctx.beginPath();
        onMaskChange(canvas.toDataURL());
      }
    };

    const draw = (e) => {
      if (!isDrawing.current) return;

      let x, y;
      if (e.touches) {
        const rect = canvas.getBoundingClientRect();
        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;
      } else {
        const rect = canvas.getBoundingClientRect();
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
      }

      ctx.lineWidth = 15;
      ctx.lineCap = "round";
      ctx.strokeStyle = "black";

      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
    };

    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseout", stopDrawing);

    canvas.addEventListener("touchstart", (e) => {
      e.preventDefault();
      startDrawing(e);
    });
    canvas.addEventListener("touchmove", (e) => {
      e.preventDefault();
      draw(e);
    });
    canvas.addEventListener("touchend", (e) => {
      e.preventDefault();
      stopDrawing(e);
    });

    return () => {
      canvas.removeEventListener("mousedown", startDrawing);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", stopDrawing);
      canvas.removeEventListener("mouseout", stopDrawing);

      canvas.removeEventListener("touchstart", startDrawing);
      canvas.removeEventListener("touchmove", draw);
      canvas.removeEventListener("touchend", stopDrawing);
    };
  }, [width, height, onMaskChange]);

  return (
    <div className="flex flex-col absolute top-10 left-10 z-10">
      <canvas
        className=" border-2 border-black bg-white"
        ref={canvasRef}
        width={width}
        height={height}
        style={style}
      />
      <button
        className="z-10 border-2 text-black border-black bg-white"
        onClick={() => {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, width, height);
          onMaskChange(canvas.toDataURsL());
        }}
      >
        Clear
      </button>
    </div>
  );
};

export default PathCanvas;
