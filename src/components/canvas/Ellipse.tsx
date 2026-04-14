import type { EllipseLayer } from "~/types";
import { colorToCss } from "~/utils";

export default function Ellipse({
  id,
  layer,
}: {
  id: string;
  layer: EllipseLayer;
}) {
  const { x, y, width, height, fill, stroke, opacity } = layer;
  return (
    <g>
      <ellipse
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
