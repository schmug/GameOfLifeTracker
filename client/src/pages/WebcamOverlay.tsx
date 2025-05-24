import { useEffect, useRef, useState } from "react";
import {
  Cell,
  createEmptyGrid,
  calculateNextGeneration,
  rotateGridColors,
  getRandomColor,
} from "@/lib/gameOfLife";

// Simple grid size. Larger values give finer detail
const GRID_SIZE = 50;
const COLOR_ROTATION_DEG = 2;

export default function WebcamOverlay() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gridRef = useRef<Cell[][]>(createEmptyGrid(GRID_SIZE));
  const [ready, setReady] = useState(false);

  // Start webcam
  useEffect(() => {
    async function startCam() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setReady(true);
        }
      } catch (e) {
        console.error("Error accessing webcam", e);
      }
    }
    startCam();
  }, []);

  // Load face detection library lazily
  const faceApiRef = useRef<any>(null);
  useEffect(() => {
    async function load() {
      try {
        const m = await import("@vladmandic/face-api");
        await m.nets.tinyFaceDetector.loadFromUri("/models");
        faceApiRef.current = m;
      } catch (e) {
        console.error("Failed to load face-api", e);
      }
    }
    load();
    return () => {};
  }, []);

  // Main animation loop
  useEffect(() => {
    if (!ready) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const cellSize = canvas.width / GRID_SIZE;

    async function tick() {
      if (videoRef.current && faceApiRef.current) {
        const detections = await faceApiRef.current.detectAllFaces(
          videoRef.current,
          new faceApiRef.current.TinyFaceDetectorOptions()
        );
        detections.forEach((det: any) => {
          const { x, y, width, height } = det.box;
          const startRow = Math.floor(y / cellSize);
          const endRow = Math.floor((y + height) / cellSize);
          const startCol = Math.floor(x / cellSize);
          const endCol = Math.floor((x + width) / cellSize);
          for (let r = startRow; r <= endRow; r++) {
            if (r < 0 || r >= GRID_SIZE) continue;
            if (startCol >= 0 && startCol < GRID_SIZE) {
              gridRef.current[r][startCol] = { alive: true, color: getRandomColor() };
            }
            if (endCol >= 0 && endCol < GRID_SIZE) {
              gridRef.current[r][endCol] = { alive: true, color: getRandomColor() };
            }
          }
          for (let c = startCol; c <= endCol; c++) {
            if (c < 0 || c >= GRID_SIZE) continue;
            if (startRow >= 0 && startRow < GRID_SIZE) {
              gridRef.current[startRow][c] = { alive: true, color: getRandomColor() };
            }
            if (endRow >= 0 && endRow < GRID_SIZE) {
              gridRef.current[endRow][c] = { alive: true, color: getRandomColor() };
            }
          }
        });
      }

      // Game of Life step and color rotation
      gridRef.current = calculateNextGeneration(gridRef.current);
      gridRef.current = rotateGridColors(gridRef.current, COLOR_ROTATION_DEG);

      // Draw
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
          const cell = gridRef.current[i][j];
          if (cell.alive) {
            ctx.fillStyle = cell.color;
            ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
          }
        }
      }

      requestAnimationFrame(tick);
    }

    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [ready]);

  return (
    <div className="flex items-center justify-center w-full h-screen bg-black relative">
      <video ref={videoRef} className="absolute w-full h-full object-cover" muted />
      <canvas ref={canvasRef} width={640} height={480} className="absolute" />
    </div>
  );
}

