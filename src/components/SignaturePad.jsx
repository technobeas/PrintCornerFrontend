import { useRef, useEffect, useState } from "react";

export default function SignaturePad({ onSave }) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const [drawing, setDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const lastPointRef = useRef(null);

  const setupCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;

    const ctx = canvas.getContext("2d");

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#111827";

    ctxRef.current = ctx;
  };

  useEffect(() => {
    requestAnimationFrame(() => {
      setupCanvas();
    });
  }, []);

  // useEffect(() => {
  //   const handleResize = () => setupCanvas();

  //   window.addEventListener("resize", handleResize);

  //   return () => window.removeEventListener("resize", handleResize);
  // }, []);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;

    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    canvas.setPointerCapture(e.pointerId);
    e.preventDefault(); // ✅ add
    const point = getPos(e);
    lastPointRef.current = point;

    ctxRef.current.beginPath();
    ctxRef.current.moveTo(point.x, point.y);

    setDrawing(true);
  };

  const draw = (e) => {
    if (!drawing) return;
    e.preventDefault(); // ✅ add
    const newPoint = getPos(e);
    const last = lastPointRef.current;

    const midPoint = {
      x: (last.x + newPoint.x) / 2,
      y: (last.y + newPoint.y) / 2,
    };

    ctxRef.current.quadraticCurveTo(last.x, last.y, midPoint.x, midPoint.y);

    ctxRef.current.stroke();

    lastPointRef.current = newPoint;
    setHasSigned(true);
  };

  const stopDrawing = (e) => {
    const canvas = canvasRef.current;

    if (e?.pointerId) {
      canvas.releasePointerCapture(e.pointerId);
    }

    ctxRef.current.closePath();
    lastPointRef.current = null;
    setDrawing(false);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    ctxRef.current.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  const save = () => {
    if (!hasSigned) return;
    const dataURL = canvasRef.current.toDataURL("image/png");
    onSave(dataURL);
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        onPointerDown={startDrawing}
        onPointerMove={draw}
        onPointerUp={stopDrawing}
        onPointerCancel={stopDrawing} // ✅ add this
        onPointerLeave={stopDrawing}
        style={{
          width: "100%",
          height: "160px",
          borderRadius: "10px",
          touchAction: "none",
          cursor: "default",
          border: "1px solid #e2e8f0",
          background: "#fff",
        }}
      />

      <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
        <button
          onClick={clear}
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            background: "#f8fafc",
          }}
        >
          Clear
        </button>

        <button
          onClick={save}
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: "8px",
            border: "none",
            background: "#6366f1",
            color: "white",
          }}
        >
          Save
        </button>
      </div>
    </>
  );
}
