import type { CanvasState } from "~/types";

export default function Toolsbar({
  canvasState,
  setCanvasState,
}: {
  canvasState: CanvasState;
  setCanvasState: (newState: CanvasState) => void;
}) {
  return (
    <div className="bg-white fixed bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center justify-center rounded-lg p-1 shadow-[0_0_3px_rgb(0,0,0,0.18)]">
        <h1>Hello</h1>
    </div>
  );
}
