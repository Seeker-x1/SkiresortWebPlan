"use client";

import { useEffect, type ReactNode } from "react";

/** §E P1: /map 専用フルビューポートシェル（サイト chrome を覆う） */
export function MapPageShell({
  children,
  header,
}: {
  children: ReactNode;
  header?: ReactNode;
}) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-[color:var(--map-stage-bg)]">
      {header}
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}
