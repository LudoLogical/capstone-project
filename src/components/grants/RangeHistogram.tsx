"use client";

import { useEffect, useMemo, useRef } from "react";
import { Minus } from "lucide-react";

const BINS = 32;

function formatMoney(value: number, max: number): string {
  if (value >= max) return `$${Math.round(max / 1000)}K+`;
  if (value >= 1000) return `$${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}K`;
  return `$${value}`;
}

/**
 * A dual-handle range slider layered over a histogram of the underlying data.
 * Dragging either handle (or editing the Min/Max inputs) drives `onChange`.
 * Bars whose bucket falls inside the selected range are highlighted; the rest
 * are muted, so the selection reads at a glance.
 */
export default function RangeHistogram({
  min,
  max,
  step = 1000,
  valueMin,
  valueMax,
  amounts,
  onChange,
}: {
  min: number;
  max: number;
  step?: number;
  valueMin: number;
  valueMax: number;
  amounts: number[];
  onChange: (nextMin: number, nextMax: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  // Refs keep drag handlers reading the latest values without re-binding.
  const stateRef = useRef({ valueMin, valueMax, onChange });
  useEffect(() => {
    stateRef.current = { valueMin, valueMax, onChange };
  });

  const range = max - min;
  const pct = (v: number) => ((v - min) / range) * 100;

  const bins = useMemo(() => {
    const counts = new Array(BINS).fill(0);
    for (const a of amounts) {
      const clamped = Math.max(min, Math.min(max, a));
      let idx = Math.floor(((clamped - min) / range) * BINS);
      if (idx >= BINS) idx = BINS - 1;
      counts[idx] += 1;
    }
    const peak = Math.max(1, ...counts);
    return counts.map((c) => c / peak);
  }, [amounts, min, max, range]);

  const startDrag = (which: "min" | "max") => (e: React.PointerEvent) => {
    e.preventDefault();
    const valueFromClientX = (clientX: number) => {
      const rect = trackRef.current?.getBoundingClientRect();
      if (!rect) return min;
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return Math.round((min + ratio * range) / step) * step;
    };
    const move = (ev: PointerEvent) => {
      const v = valueFromClientX(ev.clientX);
      const s = stateRef.current;
      if (which === "min") s.onChange(Math.min(v, s.valueMax), s.valueMax);
      else s.onChange(s.valueMin, Math.max(v, s.valueMin));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const onKey = (which: "min" | "max") => (e: React.KeyboardEvent) => {
    const delta =
      e.key === "ArrowLeft" || e.key === "ArrowDown"
        ? -step
        : e.key === "ArrowRight" || e.key === "ArrowUp"
          ? step
          : 0;
    if (!delta) return;
    e.preventDefault();
    if (which === "min") {
      onChange(Math.max(min, Math.min(valueMin + delta, valueMax)), valueMax);
    } else {
      onChange(valueMin, Math.min(max, Math.max(valueMax + delta, valueMin)));
    }
  };

  const parseInput = (raw: string, fallback: number) => {
    const n = Number(raw.replace(/[^0-9]/g, ""));
    return raw.trim() === "" || Number.isNaN(n) ? fallback : n;
  };

  return (
    <div className="select-none">
      {/* Histogram */}
      <div className="flex h-20 items-end gap-px px-2.5">
        {bins.map((h, i) => {
          const center = min + ((i + 0.5) / BINS) * range;
          const inRange = center >= valueMin && center <= valueMax;
          return (
            <div
              key={i}
              className={`flex-1 rounded-t-sm ${
                inRange ? "bg-accent" : "bg-divider-2"
              }`}
              style={{ height: `${8 + h * 92}%` }}
            />
          );
        })}
      </div>

      {/* Track + handles */}
      <div className="relative mx-2.5 mt-1 mb-2.5 h-6">
        <div
          ref={trackRef}
          className="absolute top-1/2 right-0 left-0 h-1 -translate-y-1/2 rounded-full bg-border-strong"
        />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-accent"
          style={{ left: `${pct(valueMin)}%`, right: `${100 - pct(valueMax)}%` }}
        />
        <button
          type="button"
          role="slider"
          aria-label="Minimum funding amount"
          aria-valuemin={min}
          aria-valuemax={valueMax}
          aria-valuenow={valueMin}
          aria-valuetext={formatMoney(valueMin, max)}
          onPointerDown={startDrag("min")}
          onKeyDown={onKey("min")}
          className="absolute top-1/2 z-10 h-6 w-6 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none rounded-full border border-border-strong bg-white shadow-float active:cursor-grabbing"
          style={{ left: `${pct(valueMin)}%` }}
        />
        <button
          type="button"
          role="slider"
          aria-label="Maximum funding amount"
          aria-valuemin={valueMin}
          aria-valuemax={max}
          aria-valuenow={valueMax}
          aria-valuetext={formatMoney(valueMax, max)}
          onPointerDown={startDrag("max")}
          onKeyDown={onKey("max")}
          className="absolute top-1/2 z-10 h-6 w-6 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none rounded-full border border-border-strong bg-white shadow-float active:cursor-grabbing"
          style={{ left: `${pct(valueMax)}%` }}
        />
      </div>

      <div className="mb-3.5 flex justify-between text-xs font-semibold text-ink-muted">
        <span>{formatMoney(min, max)}</span>
        <span>{formatMoney(max, max)}</span>
      </div>

      {/* Min / Max inputs */}
      <div className="flex items-end gap-2.5">
        <label className="flex-1">
          <span className="mb-1.5 block text-xs font-bold text-ink-muted">
            Min
          </span>
          <input
            inputMode="numeric"
            value={valueMin === min ? "" : valueMin}
            placeholder="No min"
            aria-label="Minimum funding amount"
            onChange={(e) => {
              const v = parseInput(e.target.value, min);
              onChange(Math.max(min, Math.min(v, valueMax)), valueMax);
            }}
            className="w-full rounded-lg border border-border-strong bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-accent"
          />
        </label>
        <span className="pb-2.5 text-ink-muted">
          <Minus size={16} />
        </span>
        <label className="flex-1">
          <span className="mb-1.5 block text-xs font-bold text-ink-muted">
            Max
          </span>
          <input
            inputMode="numeric"
            value={valueMax === max ? "" : valueMax}
            placeholder="No max"
            aria-label="Maximum funding amount"
            onChange={(e) => {
              const v = parseInput(e.target.value, max);
              onChange(valueMin, Math.min(max, Math.max(v, valueMin)));
            }}
            className="w-full rounded-lg border border-border-strong bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-accent"
          />
        </label>
      </div>
    </div>
  );
}
