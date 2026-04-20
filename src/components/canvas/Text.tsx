import { useState } from "react";
import type { TextLayer } from "~/types";
import { colorToCss } from "~/utils";

export default function Text({ id, layer }: { id: string; layer: TextLayer }) {
  const {
    x,
    y,
    width,
    height,
    fill,
    stroke,
    opacity,
    fontWeight,
    fontFamily,
    fontSize,
    text,
  } = layer;

  const [isEditing, setIsEditing] = useState(true);
  const [inputValue, setInputValue] = useState(text);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <g>
      {isEditing ? (
        <foreignObject x={x} y={y} width={width} height={height}>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            style={{
              fontSize: `${fontSize}px`,
              color: colorToCss(fill),
              width: "100%",
              border: "none",
              outline: "none",
              background: "transparent",
            }}
          />
        </foreignObject>
      ) : (
        <text
          x={x}
          y={y + fontSize}
          fill={fill ? colorToCss(fill) : "#CCC"}
          stroke={stroke ? colorToCss(stroke) : "#CCC"}
          opacity={`${opacity}%`}
          fontFamily={fontFamily}
          fontWeight={fontWeight}
          fontSize={fontSize}
        >
          {text}
        </text>
      )}
    </g>
  );
}
