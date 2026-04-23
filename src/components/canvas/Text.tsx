import { useMutation } from "@liveblocks/react";
import { useEffect, useRef, useState } from "react";
import type { TextLayer } from "~/types";
import { colorToCss } from "~/utils";

export default function Text({
  id,
  layer,
  onPointerDown,
}: {
  id: string;
  layer: TextLayer;
  onPointerDown: (e: React.PointerEvent, layerId: string) => void;
}) {
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
  const inputRef = useRef<HTMLInputElement>(null);

  const updateText = useMutation(
    ({ storage }, newText: string) => {
      const liveLayers = storage.get("layers");
      const layer = liveLayers.get(id);
      if (layer) {
        layer.update({ text: newText });
      }
    },
    [id],
  );

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    updateText(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setIsEditing(false);
      updateText(inputValue);
    }
  };

  return (
    <g
      onDoubleClick={handleDoubleClick}
      onPointerDown={(e) => onPointerDown(e, id)}
    >
      {isEditing ? (
        <foreignObject x={x} y={y} width={width} height={height}>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
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
          onPointerDown={(e) => onPointerDown(e, id)}
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
