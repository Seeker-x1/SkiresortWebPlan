"use client";

import { useCallback, useEffect, useState } from "react";
import type { MapStatusPayload } from "./types";

const SSE_URL = "/api/public/map-status/stream";
/** G4: 30s fallback when SSE unavailable */
const FALLBACK_POLL_MS = 30_000;

async function fetchMapStatus(endpoint: string): Promise<MapStatusPayload> {
  const res = await fetch(endpoint, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as MapStatusPayload;
}

export type MapStatusTransport = "sse" | "poll" | "idle";

export function useMapStatus(endpoint = "/api/public/map-status") {
  const [data, setData] = useState<MapStatusPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [transport, setTransport] = useState<MapStatusTransport>("idle");

  const applyPayload = useCallback((json: MapStatusPayload) => {
    setData(json);
    setError(null);
    setLoading(false);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const json = await fetchMapStatus(endpoint);
      applyPayload(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "fetch_failed");
    } finally {
      setLoading(false);
    }
  }, [endpoint, applyPayload]);

  useEffect(() => {
    let active = true;
    let es: EventSource | null = null;
    let pollId: number | null = null;

    const startPolling = () => {
      if (!active || pollId !== null) return;
      setTransport("poll");
      void refresh();
      pollId = window.setInterval(() => void refresh(), FALLBACK_POLL_MS);
    };

    const stopPolling = () => {
      if (pollId !== null) {
        window.clearInterval(pollId);
        pollId = null;
      }
    };

    if (typeof EventSource !== "undefined") {
      try {
        es = new EventSource(SSE_URL);
        es.onopen = () => {
          if (active) setTransport("sse");
        };
        es.onmessage = (event) => {
          if (!active) return;
          try {
            const msg = JSON.parse(event.data) as {
              type: string;
              payload?: MapStatusPayload;
            };
            if (msg.type === "update" && msg.payload) {
              applyPayload(msg.payload);
            }
          } catch {
            /* ignore malformed */
          }
        };
        es.onerror = () => {
          es?.close();
          es = null;
          startPolling();
        };
      } catch {
        startPolling();
      }
    } else {
      startPolling();
    }

    return () => {
      active = false;
      es?.close();
      stopPolling();
    };
  }, [applyPayload, refresh]);

  return { data, error, loading, refresh, transport };
}
