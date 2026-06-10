"use client";

import { useId, useState } from "react";

type RevealItem = {
  id: string;
  label: string;
  value: string;
  note?: string;
};

type RevealPanelProps = {
  triggerLabel: string;
  items: RevealItem[];
  footer?: React.ReactNode;
};

export function RevealPanel({ triggerLabel, items, footer }: RevealPanelProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className="mt-10 border-t border-[color:var(--surface-border)]">
      <button
        type="button"
        className="reveal-trigger"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span>{triggerLabel}</span>
        <span
          aria-hidden="true"
          className="text-lg font-light transition-transform duration-300"
          style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
        >
          +
        </span>
      </button>
      <div
        id={panelId}
        className="reveal-panel"
        style={{ maxHeight: open ? "640px" : "0" }}
        aria-hidden={!open}
      >
        <dl className="space-y-8 pb-8 pt-2">
          {items.map((item) => (
            <div key={item.id}>
              <dt className="lead-whisper">{item.label}</dt>
              <dd className="stat-value mt-2">{item.value}</dd>
              {item.note ? (
                <p className="lead-whisper mt-3 max-w-prose">{item.note}</p>
              ) : null}
            </div>
          ))}
        </dl>
        {footer ? <div className="pb-6">{footer}</div> : null}
      </div>
    </div>
  );
}
