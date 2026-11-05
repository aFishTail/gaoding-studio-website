"use client";

import React from "react";
import { iconNodes } from "./icons.generated";

const TONE_COLORS: Record<string, string> = {
  ink: "#252A28",
  "ink-2": "#4E554F",
  muted: "#6B6D65",
  faint: "#6B6D65",
  accent: "#B9472F",
  amber: "#805C22",
  coral: "#A63235",
  green: "#30634F",
  inverse: "#FFFFFF",
};

export interface MateIconProps {
  name: string;
  size?: number | string;
  color?: string;
  tone?: string;
  weight?: number | string;
  className?: string;
}

export function MateIcon({
  name,
  size = 24,
  color = "#252A28",
  tone = "",
  weight = 1.75,
  className = "",
}: MateIconProps) {
  const numSize = Number(size);
  const renderSize = Number.isFinite(numSize) && numSize > 0 ? Math.min(numSize, 512) : 24;
  const nodes = Object.prototype.hasOwnProperty.call(iconNodes, name) ? iconNodes[name] : undefined;
  if (!nodes) return null;

  const stroke = (tone && TONE_COLORS[tone]) || color || "#252A28";
  const numWeight = Number(weight);
  const strokeWidth = Number.isFinite(numWeight) && numWeight > 0 ? Math.min(numWeight, 4) : 1.75;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={renderSize}
      height={renderSize}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ? `mate-icon ${className}` : "mate-icon"}
      aria-hidden="true"
    >
      {nodes.map(([tag, attrs], idx) =>
        React.createElement(tag, { key: idx, ...attrs }),
      )}
    </svg>
  );
}
