"use client";

import {
  useCanRedo,
  useCanUndo,
  useHistory,
  useMutation,
  useMyPresence,
  useSelf,
  useStorage,
} from "@liveblocks/react/suspense";
import LayerComponent from "./LayerComponent";
import {
  colorToCss,
  findIntersectionLayers,
  penPointsToPathLayer,
  pointerEventToCanvasPoint,
  resizeBounds,
} from "~/utils";
import {
  CanvasMode,
  LayerType,
  Side,
  type Camera,
  type CanvasState,
  type EllipseLayer,
  type Layer,
  type Point,
  type RectangleLayer,
  type TextLayer,
  type XYWH,
} from "~/types";
import { nanoid } from "nanoid";
import { LiveObject } from "@liveblocks/client";
import { useCallback, useEffect, useState } from "react";
import Toolsbar from "../toolsbar/Toolsbar";
import Path from "./Path";
import SelectionBox from "./SelectionBox";
import useDeleteLayers from "~/hooks/useDeleteLayers";
import SelectionTools from "./SelectionTools";
import Sidebars from "../sidebars/Sidebars";

const MAX_LAYERS = 100;
const DRAG_SPEED = 0.55;
const MOVE_SPEED = 0.6;
const WHEEL_PAN_SPEED = 0.12;

export default function Canvas() {
  const roomColor = useStorage((root) => root.roomColor);
  const [leftIsMinimized, setLeftIsMinimized] = useState(false);
  const layerIds = useStorage((root) => root.layerIds);
  const pencilDraft = useSelf((me) => me.presence.pencilDraft);
  const deleteLayers = useDeleteLayers();
  const [canvasState, setState] = useState<CanvasState>({
    mode: CanvasMode.None,
  });
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, zoom: 1 });
  const history = useHistory();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  const selectAllLayers = useMutation(
    ({ setMyPresence }) => {
      if (layerIds) {
        setMyPresence({ selection: [...layerIds] }, { addToHistory: true });
      }
    },
    [layerIds],
  );

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const activeElement = document.activeElement;
      const isInputField =
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA");

      if (isInputField) return;

      switch (e.key) {
        case "Backspace":
          deleteLayers();
          break;
        case "z":
          if (e.ctrlKey || e.metaKey) {
            if (e.shiftKey) {
              history.redo();
            } else {
              history.undo();
            }
          }
          break;
        case "a":
          if (e.ctrlKey || e.metaKey) {
            selectAllLayers();
            break;
          }
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [deleteLayers]);

  const onLayerPointerDown = useMutation(
    ({ self, setMyPresence }, e: React.PointerEvent, layerId: string) => {
      if (
        canvasState.mode === CanvasMode.Pencil ||
        canvasState.mode === CanvasMode.Inserting
      ) {
        return;
      }

      history.pause();
      e.stopPropagation();
      if (!self.presence.selection?.includes(layerId)) {
        setMyPresence({ selection: [layerId] }, { addToHistory: true });
      }

      if (e.nativeEvent.button === 2) {
        setState({ mode: CanvasMode.RightCLick });
      } else {
        const point = pointerEventToCanvasPoint(
          e as React.PointerEvent<SVGSVGElement>,
          camera,
        );
        setState({ mode: CanvasMode.Translating, current: point });
      }
    },
    [canvasState.mode, camera, history],
  );

  const onResizeHandlePointerDown = useCallback(
    (corner: Side, initialBuild: XYWH) => {
      history.pause();
      setState({ mode: CanvasMode.Resizing, corner, initialBuild });
    },
    [history],
  );

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
      } else if (layerType === LayerType.Text) {
        layer = new LiveObject<TextLayer>({
          type: LayerType.Text,
          x: position.x,
          y: position.y,
          height: 100,
          width: 100,
          fontSize: 16,
          text: "Text",
          fontWeight: 400,
          fontFamily: "Inter, sans-serif",
          stroke: { r: 210, g: 210, b: 210 },
          fill: { r: 210, g: 210, b: 210 },
          opacity: 100,
        });
      }

      if (layer) {
        liveLayersIds.push(layerId);
        liveLayers.set(layerId, layer);
        setMyPresence({ selection: [layerId] }, { addToHistory: true });
        setState({ mode: CanvasMode.None });
      }
    },
    [],
  );

  const insertPath = useMutation(({ storage, self, setMyPresence }) => {
    const liveLayers = storage.get("layers");
    const { pencilDraft } = self.presence;

    if (
      pencilDraft === null ||
      pencilDraft.length < 2 ||
      liveLayers.size >= MAX_LAYERS
    ) {
      setMyPresence({ pencilDraft: null });
      return;
    }

    const id = nanoid();
    liveLayers.set(
      id,
      new LiveObject(
        penPointsToPathLayer(pencilDraft, { r: 210, g: 210, b: 210 }),
      ),
    );

    const liveLayersIds = storage.get("layerIds");
    liveLayersIds.push(id);
    setMyPresence({ pencilDraft: null });
  }, []);

  const translateSlectedLayers = useMutation(
    ({ storage, self }, point: Point) => {
      if (canvasState.mode !== CanvasMode.Translating) {
        return;
      }

      const offset = {
        x: (point.x - canvasState.current.x) * MOVE_SPEED,
        y: (point.y - canvasState.current.y) * MOVE_SPEED,
      };

      const liveLayers = storage.get("layers");
      for (const id of self.presence.selection) {
        const layer = liveLayers.get(id);
        if (layer) {
          layer.update({
            x: layer.get("x") + offset.x,
            y: layer.get("y") + offset.y,
          });
        }
      }

      setState({ mode: CanvasMode.Translating, current: point });
    },
    [canvasState],
  );

  const resizeSelectedLayer = useMutation(
    ({ self, storage }, point: Point) => {
      if (canvasState.mode !== CanvasMode.Resizing) {
        return;
      }
      const bounds = resizeBounds(
        canvasState.initialBuild,
        canvasState.corner,
        point,
      );

      const liveLayers = storage.get("layers");

      if (self.presence.selection?.length > 0) {
        const layer = liveLayers.get(self.presence.selection[0]!);
        if (layer) {
          layer.update(bounds);
        }
      }
    },
    [canvasState],
  );

  const unselectLayers = useMutation(({ self, setMyPresence }) => {
    if (self.presence.selection?.length > 0) {
      setMyPresence({ selection: [] }, { addToHistory: true });
    }
  }, []);

  const startDrawing = useMutation(
    ({ setMyPresence }, point: Point, pressure: number) => {
      setMyPresence({
        pencilDraft: [[point.x, point.y, pressure]],
        penColor: { r: 210, g: 210, b: 210 },
      });
    },
    [],
  );

  const continueDrawing = useMutation(
    ({ self, setMyPresence }, point: Point, e: React.PointerEvent) => {
      const { pencilDraft } = self.presence;

      if (
        canvasState.mode !== CanvasMode.Pencil ||
        e.buttons !== 1 ||
        pencilDraft === null
      ) {
        return;
      }

      setMyPresence({
        pencilDraft: [...pencilDraft, [point.x, point.y, e.pressure]],
      });
    },
    [canvasState.mode],
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

      if (canvasState.mode === CanvasMode.Inserting) {
        insertLayer(canvasState.layerType, point);
        return;
      }

      if (canvasState.mode === CanvasMode.None) {
        setState({ mode: CanvasMode.Dragging, origin: point });
        return;
      }

      if (canvasState.mode === CanvasMode.Pencil) {
        startDrawing(point, e.pressure);
        return;
      }

      setState({ mode: CanvasMode.Pressing, origin: point });
    },
    [camera, canvasState.mode, setState, startDrawing],
  );

  const startMultiSelection = useCallback((current: Point, origin: Point) => {
    if (Math.abs(current.x - origin.x) + Math.abs(current.y - origin.y) > 5) {
      setState({ mode: CanvasMode.SelectionNet, origin, current });
    }
  }, []);

  const updateSelectionNet = useMutation(
    ({ storage, setMyPresence }, current: Point, origin: Point) => {
      if (layerIds) {
        const layers = storage.get("layers").toImmutable();
        setState({
          mode: CanvasMode.SelectionNet,
          origin,
          current,
        });
        const ids = findIntersectionLayers(layerIds, layers, origin, current);
        setMyPresence({ selection: ids }, { addToHistory: true });
      }
    },
    [layerIds],
  );

  const onPointerMove = useMutation(
    ({}, e: React.PointerEvent<SVGSVGElement>) => {
      const point = pointerEventToCanvasPoint(e, camera);

      if (canvasState.mode === CanvasMode.Pressing) {
        startMultiSelection(canvasState.origin, point);
      } else if (canvasState.mode === CanvasMode.SelectionNet) {
        updateSelectionNet(point, canvasState.origin);
      } else if (
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
      } else if (canvasState.mode === CanvasMode.Translating) {
        translateSlectedLayers(point);
      } else if (canvasState.mode === CanvasMode.Pencil) {
        continueDrawing(point, e);
      } else if (canvasState.mode === CanvasMode.Resizing) {
        resizeSelectedLayer(point);
      }
    },
    [
      camera,
      canvasState,
      setState,
      insertLayer,
      continueDrawing,
      resizeSelectedLayer,
      translateSlectedLayers,
      updateSelectionNet,
      startMultiSelection,
    ],
  );

  const onPointerUp = useMutation(
    ({}, e: React.PointerEvent<SVGSVGElement>) => {
      if (canvasState.mode === CanvasMode.RightCLick) return;

      e.currentTarget.releasePointerCapture(e.pointerId);
      const point = pointerEventToCanvasPoint(e, camera);

      if (
        canvasState.mode === CanvasMode.None ||
        canvasState.mode === CanvasMode.Pressing
      ) {
        unselectLayers();
        setState({ mode: CanvasMode.None });
      } else if (canvasState.mode === CanvasMode.Inserting) {
        insertLayer(canvasState.layerType, point);
      } else if (canvasState.mode === CanvasMode.Dragging) {
        setState({ mode: CanvasMode.None });
      } else if (canvasState.mode === CanvasMode.Pencil) {
        insertPath();
      } else {
        setState({ mode: CanvasMode.None });
      }
      history.resume();
    },
    [camera, canvasState, setState, insertLayer, unselectLayers, history],
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
          <SelectionTools camera={camera} canvasMode={canvasState.mode} />
          <svg
            onWheel={onWheel}
            onPointerUp={onPointerUp}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            className="h-full w-full"
            style={{ touchAction: "none" }}
            onContextMenu={(e) => e.preventDefault()}
          >
            <g
              style={{
                transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.zoom})`,
              }}
            >
              {layerIds?.map((layerIds) => (
                <LayerComponent
                  key={layerIds}
                  id={layerIds}
                  onLayerPointerDown={onLayerPointerDown}
                />
              ))}
              <SelectionBox
                onResizeHandlePointerDown={onResizeHandlePointerDown}
              />
              {canvasState.mode === CanvasMode.SelectionNet &&
                canvasState.current != null && (
                  <rect
                    className="fill-blue-600/5 stroke-blue-600 stroke-[0.5]"
                    x={Math.min(canvasState.origin.x, canvasState.current.x)}
                    y={Math.min(canvasState.origin.y, canvasState.current.y)}
                    width={Math.abs(
                      canvasState.current.x - canvasState.origin.x,
                    )}
                    height={Math.abs(
                      canvasState.current.y - canvasState.origin.y,
                    )}
                  />
                )}
              {pencilDraft != null && pencilDraft.length > 0 && (
                <Path
                  x={0}
                  y={0}
                  opacity={100}
                  fill={colorToCss({ r: 210, g: 210, b: 210 })}
                  points={pencilDraft}
                />
              )}
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
        redo={() => history.redo()}
        undo={() => history.undo()}
        canUndo={canUndo}
        canRedo={canRedo}
      />
      <Sidebars
        leftIsMinimized={leftIsMinimized}
        setLeftIsMinimized={setLeftIsMinimized}
      />
    </div>
  );
}
