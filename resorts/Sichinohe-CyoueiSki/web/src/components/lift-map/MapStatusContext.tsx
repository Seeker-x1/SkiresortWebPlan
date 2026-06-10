"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useMapStatus } from "./useMapStatus";

type MapStatusContextValue = ReturnType<typeof useMapStatus>;

const MapStatusContext = createContext<MapStatusContextValue | null>(null);

export function MapStatusProvider({ children }: { children: ReactNode }) {
  const value = useMapStatus();
  return (
    <MapStatusContext.Provider value={value}>{children}</MapStatusContext.Provider>
  );
}

export function useMapStatusContext(): MapStatusContextValue {
  const ctx = useContext(MapStatusContext);
  if (!ctx) {
    throw new Error("useMapStatusContext must be used within MapStatusProvider");
  }
  return ctx;
}
