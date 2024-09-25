import React, { useRef, useEffect, useState } from "react";

const PathCanvas = ({ width, height, onMaskChange, style }) => {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const currentMode = useRef("draw");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, width, height);

    const startDrawing = (e) => {
      e.preventDefault();
      isDrawing.current = true;

      if (e.type === "mousedown") {
        if (e.button === 0) {
          currentMode.current = "draw";
        } else if (e.button === 2) {
          currentMode.current = "erase";
        }
      }

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

      if (currentMode.current === "draw") {
        ctx.strokeStyle = "black";
      } else if (currentMode.current === "erase") {
        ctx.strokeStyle = "white";
      }

      ctx.lineWidth = 15;
      ctx.lineCap = "round";

      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
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

    canvas.addEventListener("contextmenu", handleContextMenu);

    return () => {
      canvas.removeEventListener("mousedown", startDrawing);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", stopDrawing);
      canvas.removeEventListener("mouseout", stopDrawing);

      canvas.removeEventListener("touchstart", startDrawing);
      canvas.removeEventListener("touchmove", draw);
      canvas.removeEventListener("touchend", stopDrawing);

      canvas.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [width, height, onMaskChange]);

  return (
    <div>
      <div className="flex flex-col absolute top-20 left-10 z-10">
        <div className={`${isVisible ? "hidden" : ""}`}>
          <canvas
            className="border-2 border-black bg-white"
            ref={canvasRef}
            width={width}
            height={height}
            style={style}
          />
          <button
            className="z-10 border-2 text-black border-black bg-white mt-2 w-full"
            onClick={() => {
              const canvas = canvasRef.current;
              const ctx = canvas.getContext("2d");
              ctx.fillStyle = "white";
              ctx.fillRect(0, 0, width, height);
              onMaskChange(canvas.toDataURL());
            }}
          >
            Clear
          </button>
        </div>
        <button
          className="z-10 px-2 border-2 text-black border-black bg-white mt-2"
          onClick={() => setIsVisible(!isVisible)}
        >
          {isVisible ? "Show" : "Hide"} Mask Editor
        </button>
      </div>
    </div>
  );
};

export default PathCanvas;
