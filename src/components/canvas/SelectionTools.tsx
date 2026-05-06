import useSelectionBounds from "~/hooks/useSelectionBounds";
import { CanvasMode, type Camera } from "~/types";
import { BsArrowDown, BsArrowUp } from "react-icons/bs";

export default function SelectionTools({
  camera,
  canvasMode
}: {
  camera: Camera;
  canvasMode: CanvasMode;
}) {
  const selectionBounds = useSelectionBounds();
  if (!selectionBounds) {
    return null;
  }

  const x = selectionBounds.width / 2 + selectionBounds.x + camera.x;
  const y = selectionBounds.y + camera.y;

  if (canvasMode !== CanvasMode.RightCLick) return null;
  return (
    <div
      style={{
        transform: `translate(calc(${x}px - 50%), calc(${y - 16}px - 100%))`,
      }}
      className="absolute flex min-w-37.5 flex-col rounded-xl bg-[#1e1e1e] p-2 shadow-lg"
    >
      <button className="flex w-full items-center justify-between rounded-md px-1 py-1 text-white hover:to-blue-500">
        <span>Trazer para frente</span>
        <BsArrowDown className="mr-2 h-4 w-4" />
      </button>
      <button className="flex w-full items-center justify-between rounded-md px-1 py-1 text-white hover:to-blue-500">
        <span>Mandar para tras</span>
        <BsArrowUp className="mr-2 h-4 w-4" />
      </button>
    </div>
  );
}
