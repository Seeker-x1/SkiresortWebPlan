"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type RefObject,
  type WheelEvent,
} from "react";
import { mapDefaultView, MAP_FIT_SCALE } from "./map-default-view";

const MAX_SCALE = 4;

export type MapDefaultView = { scale: number; x: number; y: number };

export type PanBounds = {
  containerWidth: number;
  containerHeight: number;
  contentWidth: number;
  contentHeight: number;
};

export function clampTranslate(
  tx: number,
  ty: number,
  scale: number,
  bounds: PanBounds | null,
  baseView: MapDefaultView,
): { x: number; y: number } {
  if (scale <= baseView.scale + 0.001) {
    return { x: baseView.x, y: baseView.y };
  }
  if (!bounds) {
    return { x: tx, y: ty };
  }

  const { containerWidth: cw, containerHeight: ch, contentWidth, contentHeight } = bounds;
  const scaledW = contentWidth * scale;
  const scaledH = contentHeight * scale;
  const maxX = Math.max(0, (scaledW - cw) / 2);
  const maxY = Math.max(0, (scaledH - ch) / 2);

  return {
    x: Math.min(baseView.x + maxX, Math.max(baseView.x - maxX, tx)),
    y: Math.min(baseView.y + maxY, Math.max(baseView.y - maxY, ty)),
  };
}

type UsePanZoomOptions = {
  containerRef: RefObject<HTMLElement | null>;
  contentRef: RefObject<HTMLElement | null>;
  railOverlay?: boolean;
};

export function usePanZoom({ containerRef, contentRef, railOverlay = false }: UsePanZoomOptions) {
  const baseViewRef = useRef<MapDefaultView>({ scale: MAP_FIT_SCALE, x: 0, y: 0 });
  const [scale, setScale] = useState(MAP_FIT_SCALE);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const boundsRef = useRef<PanBounds | null>(null);
  const dragRef = useRef<{
    active: boolean;
    lastX: number;
    lastY: number;
    pointerId: number | null;
  }>({ active: false, lastX: 0, lastY: 0, pointerId: null });

  const measureBounds = useCallback((): PanBounds | null => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return null;
    const rect = container.getBoundingClientRect();
    return {
      containerWidth: rect.width,
      containerHeight: rect.height,
      contentWidth: content.offsetWidth,
      contentHeight: content.offsetHeight,
    };
  }, [containerRef, contentRef]);

  const applyClampedTranslate = useCallback(
    (tx: number, ty: number, nextScale: number) => {
      const bounds = measureBounds();
      boundsRef.current = bounds;
      return clampTranslate(tx, ty, nextScale, bounds, baseViewRef.current);
    },
    [measureBounds],
  );

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const syncBounds = () => {
      const rect = container.getBoundingClientRect();
      const nextBase = mapDefaultView(rect.width, railOverlay);
      baseViewRef.current = nextBase;
      boundsRef.current = measureBounds();
      setScale(nextBase.scale);
      setTranslate({ x: nextBase.x, y: nextBase.y });
    };

    const observer = new ResizeObserver(syncBounds);
    observer.observe(container);
    observer.observe(content);
    syncBounds();

    return () => observer.disconnect();
  }, [containerRef, contentRef, measureBounds, railOverlay]);

  const clampScale = (s: number) =>
    Math.min(MAX_SCALE, Math.max(baseViewRef.current.scale, s));

  const zoomBy = useCallback(
    (delta: number, origin?: { x: number; y: number }) => {
      setScale((prev) => {
        const next = clampScale(prev + delta);
        if (next === prev) return next;

        setTranslate((t) => {
          if (next <= baseViewRef.current.scale + 0.001) {
            return { x: baseViewRef.current.x, y: baseViewRef.current.y };
          }
          if (!origin) {
            return applyClampedTranslate(t.x, t.y, next);
          }
          const ratio = next / prev;
          const raw = {
            x: origin.x - (origin.x - t.x) * ratio,
            y: origin.y - (origin.y - t.y) * ratio,
          };
          return applyClampedTranslate(raw.x, raw.y, next);
        });
        return next;
      });
    },
    [applyClampedTranslate],
  );

  const resetView = useCallback(() => {
    const base = baseViewRef.current;
    setScale(base.scale);
    setTranslate({ x: base.x, y: base.y });
  }, []);

  const onWheel = useCallback(
    (e: WheelEvent<HTMLDivElement>) => {
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      zoomBy(e.deltaY < 0 ? 0.15 : -0.15, {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    },
    [zoomBy],
  );

  const onPointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0 || scale <= baseViewRef.current.scale + 0.001) return;
      dragRef.current = {
        active: true,
        lastX: e.clientX,
        lastY: e.clientY,
        pointerId: e.pointerId,
      };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [scale],
  );

  const onPointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (
        !dragRef.current.active ||
        dragRef.current.pointerId !== e.pointerId ||
        scale <= baseViewRef.current.scale + 0.001
      ) {
        return;
      }
      const dx = e.clientX - dragRef.current.lastX;
      const dy = e.clientY - dragRef.current.lastY;
      dragRef.current.lastX = e.clientX;
      dragRef.current.lastY = e.clientY;
      setTranslate((t) => applyClampedTranslate(t.x + dx, t.y + dy, scale));
    },
    [applyClampedTranslate, scale],
  );

  const onPointerUp = useCallback((e: PointerEvent<HTMLDivElement>) => {
    if (dragRef.current.pointerId === e.pointerId) {
      dragRef.current.active = false;
      dragRef.current.pointerId = null;
    }
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
  }, []);

  return {
    scale,
    canPan: scale > baseViewRef.current.scale + 0.001,
    transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
    zoomIn: () => zoomBy(0.2),
    zoomOut: () => zoomBy(-0.2),
    resetView,
    onWheel,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  };
}
