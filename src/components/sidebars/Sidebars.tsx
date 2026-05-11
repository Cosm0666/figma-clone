"use client";

import {
  useMutation,
  useOthers,
  useSelf,
  useStorage,
} from "@liveblocks/react/suspense";
import { PiPathLight, PiSidebarSimpleThin } from "react-icons/pi";
import Link from "next/link";
import { hexToRgb } from "~/utils";
import { LayerType } from "~/types";
import { IoEllipseOutline, IoSquareOutline } from "react-icons/io5";
import { AiOutlineFontSize } from "react-icons/ai";
import LayerButton from "./LayerButton";
export default function Sidebars({
  leftIsMinimized,
  setLeftIsMinimized,
}: {
  leftIsMinimized: boolean;
  setLeftIsMinimized: (value: boolean) => void;
}) {
  const me = useSelf();
  const others = useOthers();

  const selectedLayer = useSelf((me) => {
    const selection = me.presence.selection;
    return selection.length === 1 ? selection[0] : null;
  });

  const layer = useStorage((root) => {
    if (!selectedLayer) {
      return null;
    }

    return root.layers.get(selectedLayer);
  });

  const roomColor = useStorage((root) => root.roomColor);
  const layerIds = useStorage((root) => root.layerIds);
  const layers = useStorage((root) => root.layers);
  const reversedLayerIds = [...(layerIds ?? [])].reverse();

  const selection = useSelf((me) => me.presence.selection);

  const updateLayer = useMutation(
    (
      { storage },
      updates: {
        x?: number;
        y?: number;
        width?: number;
        height?: number;
        opacity?: number;
        cornerRadius?: number;
        fill?: string;
        stroke?: string;
        fontSise?: number;
        fontWeight?: string;
        fontFamily?: string;
      },
    ) => {
      if (!selectedLayer) {
        return;
      }

      const liveLayers = storage.get("layers");
      const layer = liveLayers.get(selectedLayer);

      if (layer) {
        layer.update({
          ...(updates.x !== undefined && { x: updates.x }),
          ...(updates.y !== undefined && { y: updates.y }),
          ...(updates.width !== undefined && { width: updates.width }),
          ...(updates.height !== undefined && { height: updates.height }),
          ...(updates.opacity !== undefined && { opacity: updates.opacity }),
          ...(updates.cornerRadius !== undefined && {
            cornerRadius: updates.cornerRadius,
          }),
          ...(updates.fill !== undefined && { fill: hexToRgb(updates.fill) }),
          ...(updates.stroke !== undefined && {
            stroke: hexToRgb(updates.stroke),
          }),
          ...(updates.fontSise !== undefined && { fontSize: updates.fontSise }),
          ...(updates.fontWeight !== undefined && {
            fontWeight: updates.fontWeight,
          }),
          ...(updates.fontFamily !== undefined && {
            fontFamily: updates.fontFamily,
          }),
        });
      }
    },
    [selectedLayer],
  );

  return (
    <>
      {!leftIsMinimized ? (
        <div className="fixed left-0 flex h-screen w-60 flex-col border-r border-gray-200 bg-white">
          <div className="p-4">
            <div className="flex justify-between">
              <Link href="/dashboard">
                <img
                  src="/figma-logo.svg"
                  alt="Figma Logo"
                  className="h-10 w-10"
                />
              </Link>
              <PiSidebarSimpleThin
                onClick={() => setLeftIsMinimized(true)}
                className="h-5 w-5 cursor-pointer"
              />
            </div>
            <h2 className="mt-2 scroll-m-20 text-[13px] font-medium">
              Roomname
            </h2>
          </div>
          <div className="border-b border-gray-200" />
          <div className="flex flex-col gap-1 p-4">
            <span className="mb-2 text-[11px] font-medium">Layers</span>
            {layerIds &&
              reversedLayerIds.map((id) => {
                const layer = layers?.get(id);
                const isSelected = selection.includes(id);
                if (layer?.type === LayerType.Rectangle) {
                  return (
                    <LayerButton
                      key={id}
                      layerId={id}
                      text="Rectángulo"
                      isSelected={isSelected ?? false}
                      icon={
                        <IoSquareOutline className="h-3 w-3 text-gray-500" />
                      }
                    />
                  );
                } else if (layer?.type === LayerType.Ellipse) {
                  return (
                    <LayerButton
                      key={id}
                      layerId={id}
                      text="Elipse"
                      isSelected={isSelected ?? false}
                      icon={
                        <IoEllipseOutline className="h-3 w-3 text-gray-500" />
                      }
                    />
                  );
                } else if (layer?.type === LayerType.Path) {
                  return (
                    <LayerButton
                      key={id}
                      layerId={id}
                      text="Drawing"
                      isSelected={isSelected ?? false}
                      icon={<PiPathLight className="h-3 w-3 text-gray-500" />}
                    />
                  );
                } else if (layer?.type === LayerType.Text) {
                  return (
                    <LayerButton
                      key={id}
                      layerId={id}
                      text="Texto"
                      isSelected={isSelected ?? false}
                      icon={
                        <AiOutlineFontSize className="h-3 w-3 text-gray-500" />
                      }
                    />
                  );
                }
              })}
          </div>
        </div>
      ) : (
        <div className="fixed top-3 left-3 flex h-12 w-62.5 items-center justify-between rounded-xl border bg-white p-4">
          <Link href="/dashboard">
            <img src="/figma-logo.svg" alt="Figma Logo" className="h-10 w-10" />
          </Link>
          <h2 className="scroll-m-20 text-[13px] font-medium">Roomname</h2>
          <PiSidebarSimpleThin
            onClick={() => setLeftIsMinimized(false)}
            className="h-5 w-5 cursor-pointer"
          />
        </div>
      )}
    </>
  );
}
