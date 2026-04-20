import type { Color } from "~/types";
import { getSvgPathFromStroke, colorToCss } from "~/utils";
import { getStroke } from "perfect-freehand";

export default function Path({
  x,
  y,
  stroke,
  fill,
  opacity,
  points,
}: {
  x: number;
  y: number;
  stroke?: string;
  fill: string;
  opacity: number;
  points: number[][];
}) {
  const pathData = getSvgPathFromStroke(
    getStroke(points, {
      size: 10,
      thinning: 0.5,
      smoothing: 0.5,
      streamline: 0.5,
    }),
  );
  return (
    <path
      style={{ transform: `translate(${x}px, ${y}px)` }}
      d={pathData}
      stroke={stroke ?? "#CCC"}
      fill={fill}
      strokeWidth={1}
      opacity={`${opacity ?? 100}%`}
    />
  );
}
