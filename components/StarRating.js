"use client";

import { useState } from "react";

export default function StarRating({ value = 0, onRate, disabled = false, size = 32 }) {
  const [hover, setHover] = useState(0);
  const display = hover || value;

  const onLeave = () => {
    if (!disabled) setHover(0);
  };

  return (
    <div className="flex items-center gap-1" onMouseLeave={onLeave}>
      {[1, 2, 3, 4, 5].map((n) => {
        const fill = Math.max(0, Math.min(1, display - (n - 1)));
        const scaleHover =
          !disabled && hover && hover >= n - 0.5 && hover <= n
            ? "scale-110"
            : "";
        return (
          <div
            key={n}
            className={`relative transition-transform ${scaleHover} ${disabled ? "opacity-70" : ""}`}
            style={{ width: size, height: size, lineHeight: 1 }}
          >
            <span
              className="absolute inset-0 leading-none text-white/95 select-none pointer-events-none"
              style={{ fontSize: size }}
            >
              ☆
            </span>
            <span
              className="absolute inset-0 overflow-hidden leading-none text-[#f5a524] drop-shadow select-none pointer-events-none"
              style={{ fontSize: size, width: `${fill * 100}%` }}
            >
              ★
            </span>
            {!disabled && (
              <>
                <button
                  type="button"
                  onMouseEnter={() => setHover(n - 0.5)}
                  onClick={() => onRate?.(n - 0.5)}
                  className="absolute left-0 top-0 h-full w-1/2 cursor-pointer"
                  aria-label={`${n - 0.5} estrellas`}
                />
                <button
                  type="button"
                  onMouseEnter={() => setHover(n)}
                  onClick={() => onRate?.(n)}
                  className="absolute right-0 top-0 h-full w-1/2 cursor-pointer"
                  aria-label={`${n} estrellas`}
                />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
