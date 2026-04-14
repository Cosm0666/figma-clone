import { useEffect, useRef, useState } from "react";
import { BiPointer } from "react-icons/bi";
import { RiHand } from "react-icons/ri";
import { CanvasMode, LayerType, type CanvasState } from "../../types";
import IconButton from "./IconButton";
import { IoEllipseOutline, IoSquareOutline } from "react-icons/io5";

export default function ShapesSelectionButton({
  isActive,
  onClick,
  canvasState,
}: {
  isActive: boolean;
  onClick: (layerType: LayerType.Ellipse | LayerType.Rectangle) => void;
  canvasState: CanvasState;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClick = (layerType: LayerType.Ellipse | LayerType.Rectangle) => {
    onClick(layerType);
    setIsOpen(false);
  };
  return (
    <div className="relative flex" ref={menuRef}>
      <IconButton
        isActive={isActive}
        onClick={() => onClick(LayerType.Rectangle)}
      >
        {canvasState.mode !== CanvasMode.Inserting && (
          <IoSquareOutline className="h-5 w-5" />
        )}
        {canvasState.mode === CanvasMode.Inserting &&
          canvasState.layerType === LayerType.Rectangle && (
            <IoSquareOutline className="h-5 w-5" />
          )}
        {canvasState.mode === CanvasMode.Inserting &&
          canvasState.layerType === LayerType.Ellipse && (
            <IoEllipseOutline className="h-5 w-5" />
          )}
      </IconButton>
      <button onClick={() => setIsOpen(!isOpen)} className="ml-1">
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="min-2-[150px] absolute -top-20 mt-1 min-w-37.5 rounded-xl bg-[#1e1e1e] p-2 shadow-lg">
          <button
            className={`flex w-full items-center rounded-md p-1 text-white hover:bg-blue-500 ${canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Rectangle ? "bg-blue-500" : ""}`}
            onClick={() => handleClick(LayerType.Rectangle)}
          >
            <span className="w-5 text-sm">
              {canvasState.mode === CanvasMode.Inserting &&
                canvasState.layerType === LayerType.Rectangle &&
                "✓"}
            </span>
            <IoSquareOutline className="mr-2 h-4 w-4" />
            <span className="text-xs">Retangulo</span>
          </button>
          <button
            className={`flex w-full items-center rounded-md p-1 text-white hover:bg-blue-500 ${canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Ellipse ? "bg-blue-500" : ""}`}
            onClick={() => handleClick(LayerType.Ellipse)}
          >
            <span className="w-5 text-sm">
              {canvasState.mode === CanvasMode.Inserting &&
                canvasState.layerType === LayerType.Ellipse &&
                "✓"}
            </span>
            <IoEllipseOutline className="mr-2 h-4 w-4" />
            <span className="text-xs">Elipse</span>
          </button>
        </div>
      )}
    </div>
  );
}
