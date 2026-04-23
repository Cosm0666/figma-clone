import type { EllipseLayer } from "~/types";
import { colorToCss } from "~/utils";

export default function Ellipse({
  id,
  layer,
  onPointerDown,
}: {
  id: string;
  layer: EllipseLayer;
  onPointerDown: (e: React.PointerEvent, layerId: string) => void;
}) {
  const { x, y, width, height, fill, stroke, opacity } = layer;
  return (
    <g>
      <ellipse
        onPointerDown={(e) => onPointerDown(e, id)}
        cx={x + width / 2}
        cy={y + height / 2}
        rx={width / 2}
        ry={height / 2}
        fill={fill ? colorToCss(fill) : "#CCC"}
        stroke={stroke ? colorToCss(stroke) : "#CCC"}
        strokeWidth={1}
        opacity={(opacity ?? 100) / 100}
      />
    </g>
  );
}
