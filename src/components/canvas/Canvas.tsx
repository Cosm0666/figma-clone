"use client";

import { useMutation, useStorage } from "@liveblocks/react/suspense";
import LayerComponent from "./LayerComponent";
import { colorToCss, pointerEventToCanvasPoint } from "~/utils";
import {
  CanvasMode,
  LayerType,
  type Camera,
  type CanvasState,
  type EllipseLayer,
  type Layer,
  type Point,
  type RectangleLayer,
} from "~/types";
import { nanoid } from "nanoid";
import { LiveObject } from "@liveblocks/client";
import { useCallback, useEffect, useState } from "react";
import Toolsbar from "../toolsbar/Toolsbar";
import { set } from "zod";

const MAX_LAYERS = 100;
const DRAG_SPEED = 0.25;
const WHEEL_PAN_SPEED = 0.12;

export default function Canvas() {
  const roomColor = useStorage((root) => root.roomColor);
  const layerIds = useStorage((root) => root.layerIds);
  const [canvasState, setState] = useState<CanvasState>({
    mode: CanvasMode.None,
  });
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, zoom: 1 });
  const insertLayer = useMutation(
    (
      { storage, setMyPresence },
      layerType: LayerType.Ellipse | LayerType.Rectangle | LayerType.Text,
      position: Point,
    ) => {
      const liveLayers = storage.get("layers");
      if (liveLayers.size >= MAX_LAYERS) {
        return;
      }

      const liveLayersIds = storage.get("layerIds");
      const layerId = nanoid();
      let layer: LiveObject<Layer> | null = null;

      if (layerType === LayerType.Rectangle) {
        layer = new LiveObject<RectangleLayer>({
          type: LayerType.Rectangle,
          x: position.x,
          y: position.y,
          height: 100,
          width: 100,
          fill: { r: 217, g: 217, b: 217 },
          stroke: { r: 217, g: 217, b: 217 },
          opacity: 100,
        });
      } else if (layerType === LayerType.Ellipse) {
        layer = new LiveObject<EllipseLayer>({
          type: LayerType.Ellipse,
          x: position.x,
          y: position.y,
          height: 100,
          width: 100,
          fill: { r: 217, g: 217, b: 217 },
          stroke: { r: 217, g: 217, b: 217 },
          opacity: 100,
        });
      }

      if (layer) {
        liveLayersIds.push(layerId);
        liveLayers.set(layerId, layer);
        setMyPresence({ selection: [layerId] }, { addToHistory: true });
      }
    },
    [],
  );
  const onWheel = useCallback((e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();

    const deltaY = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
    const clientX = e.clientX;
    const clientY = e.clientY;
    const rect = e.currentTarget.getBoundingClientRect();

    setCamera((camera) => {
      const point = {
        x: (Math.round(clientX) - rect.left) / camera.zoom - camera.x,
        y: (Math.round(clientY) - rect.top) / camera.zoom - camera.y,
      };
      const nextZoom = Math.min(
        3,
        Math.max(0.3, camera.zoom * (1 - deltaY * 0.0012)),
      );
      const zoomFactor = nextZoom / camera.zoom;

      return {
        x: camera.x - point.x * (zoomFactor - 1),
        y: camera.y - point.y * (zoomFactor - 1),
        zoom: nextZoom,
      };
    });
  }, []);

  const onPointerDown = useMutation(
    ({}, e: React.PointerEvent<SVGSVGElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      const point = pointerEventToCanvasPoint(e, camera);

      if (canvasState.mode === CanvasMode.None) {
        setState({ mode: CanvasMode.Dragging, origin: point });
      }
    },
    [camera, canvasState.mode, setState],
  );

  const onPointerMove = useMutation(
    ({}, e: React.PointerEvent<SVGSVGElement>) => {
      const point = pointerEventToCanvasPoint(e, camera);

      if (
        canvasState.mode === CanvasMode.Dragging &&
        canvasState.origin !== null
      ) {
        const deltaX = (point.x - canvasState.origin.x) * DRAG_SPEED;
        const deltaY = (point.y - canvasState.origin.y) * DRAG_SPEED;
        setCamera((camera) => ({
          x: camera.x + deltaX,
          y: camera.y + deltaY,
          zoom: camera.zoom,
        }));
      }
    },
    [canvasState, setState, insertLayer],
  );

  const onPointerUp = useMutation(
    ({}, e: React.PointerEvent<SVGSVGElement>) => {
      e.currentTarget.releasePointerCapture(e.pointerId);
      const point = pointerEventToCanvasPoint(e, camera);

      if (canvasState.mode === CanvasMode.None) {
        setState({ mode: CanvasMode.None });
      } else if (canvasState.mode === CanvasMode.Inserting) {
        insertLayer(canvasState.layerType, point);
      } else if (canvasState.mode === CanvasMode.Dragging) {
        setState({ mode: CanvasMode.None });
      }
    },
    [canvasState, setState, insertLayer],
  );
  return (
    <div className="flex h-screen w-full">
      <main className="fixed right-0 left-0 h-screen overflow-y-auto">
        <div
          style={{
            backgroundColor: roomColor ? colorToCss(roomColor) : "#1e1e1e",
          }}
          className="h-full w-full touch-none"
        >
          <svg
            onWheel={onWheel}
            onPointerUp={onPointerUp}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            className="h-full w-full"
            style={{ touchAction: "none" }}
          >
            <g
              style={{
                transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.zoom})`,
              }}
            >
              {layerIds?.map((layerIds) => (
                <LayerComponent key={layerIds} id={layerIds} />
              ))}
            </g>
          </svg>
        </div>
      </main>
      <Toolsbar
        canvasState={canvasState}
        setCanvasState={(newState) => setState(newState)}
        zoomIn={() => setCamera({ ...camera, zoom: camera.zoom * 1.1 })}
        zoomOut={() => setCamera({ ...camera, zoom: camera.zoom * 0.9 })}
        canZoomIn={camera.zoom < 3}
        canZoomOut={camera.zoom > 0.3}
      />
    </div>
  );
}
