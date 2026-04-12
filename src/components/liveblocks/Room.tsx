"use client";

import { LiveList, LiveMap, LiveObject } from "@liveblocks/client";
import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
} from "@liveblocks/react";
import type { ReactNode } from "react";
import type { Layer } from "~/types";

export function Room({
  children,
  roomId,
}: {
  children: ReactNode;
  roomId: string;
}) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider
        id={roomId}
        initialPresence={{
          selection: [],
          cursor: null,
          penColor: null,
          pencilDraft: null,
        }}
        initialStorage={{
          roomColor: { r: 30, g: 30, b: 30 },
          layers: new LiveMap<string, LiveObject<Layer>>(),
          layerIds: new LiveList([]),
        }}
      >
        
        <ClientSideSuspense
          fallback={
            <div className="flex h-screen items-center justify-center gap-2">
              <img
                src="/figma-logo.svg"
                alt="Figma logo"
                className="h-12.5 w-12.5 animate-bounce"
                
              />
              <h1 className="text-sm font-normal">Loading</h1>
            </div>
          }
        >
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}
