import type {Camera, Color, Point } from "./types";

export function colorToCss(color: Color) {
  return (`#${color.r.toString(16).padStart(2, "0")}${color.g.toString(16).padStart(2, "0")}${color.b.toString(16).padStart(2, "0")}`);
}

export const pointerEventToCanvasPoint = (
    e: React.PointerEvent<SVGSVGElement>,
    camera: Camera
): Point => {
    const rect = e.currentTarget.getBoundingClientRect();

    return {
        x: (Math.round(e.clientX) - rect.left) / camera.zoom - camera.x,
        y: (Math.round(e.clientY) - rect.top) / camera.zoom - camera.y,
    };
};