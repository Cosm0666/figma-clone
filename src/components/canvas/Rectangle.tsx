import type { RectangleLayer } from "~/types";
import { colorToCss } from "~/utils";

export default function Rectangle({
  id,
  layer,
}: {
  id: string;
  layer: RectangleLayer;
}) {
  const { x, y, width, height, fill, stroke, opacity, cornerRadius } = layer;
  return (
    <g>
      <rect
        style={{ transform: `translate(${x}px, ${y}px)` }}
        width={width}
        height={height}
        fill={fill ? colorToCss(fill) : "#CCC"}
        strokeWidth={1}
        stroke={stroke ? colorToCss(stroke) : "#CCC"} 
        opacity={`${opacity ?? 100}%`}
        rx={cornerRadius ?? 0}
        ry={cornerRadius ?? 0}
      />
    </g>
  );
}
