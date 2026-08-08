"use client";

import React from "react";

/**
 * VerifiedBadge — Displays a tier-coloured checkmark badge next to a username.
 *
 * Props:
 *  tier    — "STUDENT" | "EDUCATOR" | "ORGANIZATION"
 *  size    — "xs" | "sm" | "md" | "lg"  (default "sm")
 *  showTooltip — boolean (default true)
 *  className   — extra CSS classes
 */

const TIER_CONFIG = {
  STUDENT: {
    label: "Verified Student",
    color: "#2563eb", // Solid blue
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
        <path d="M12 2L14.8 4.4L18.4 4L19.5 7.4L22.4 9.1L21 12.5L22.4 15.9L19.5 17.6L18.4 21L14.8 20.6L12 23L9.2 20.6L5.6 21L4.5 17.6L1.6 15.9L3 12.5L1.6 9.1L4.5 7.4L5.6 4L9.2 4.4L12 2Z" fill="#2563eb" />
        <path d="M7.5 12.5L10.5 15.5L17 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  EDUCATOR: {
    label: "Verified Educator",
    color: "#ea580c", // Solid orange
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
        <path d="M12 2L14.8 4.4L18.4 4L19.5 7.4L22.4 9.1L21 12.5L22.4 15.9L19.5 17.6L18.4 21L14.8 20.6L12 23L9.2 20.6L5.6 21L4.5 17.6L1.6 15.9L3 12.5L1.6 9.1L4.5 7.4L5.6 4L9.2 4.4L12 2Z" fill="#ea580c" />
        <path d="M7.5 12.5L10.5 15.5L17 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  ORGANIZATION: {
    label: "Verified Organization",
    color: "#6d28d9", // Solid purple
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
        <path d="M12 1.5L15.2 4L19.2 4L20.2 8L23.5 10.5L22 14.2L23.5 18L20.2 20.5L19.2 24.5L15.2 24.5L12 27L8.8 24.5L4.8 24.5L3.8 20.5L0.5 18L2 14.2L0.5 10.5L3.8 8L4.8 4L8.8 4L12 1.5Z" fill="#6d28d9" transform="scale(0.85) translate(2.5, 2.5)" />
        <path d="M7.5 12.5L10.5 15.5L17 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
};

const SIZE_MAP = {
  xs: { px: 14, margin: "0 2px" },
  sm: { px: 18, margin: "0 3px" },
  md: { px: 22, margin: "0 4px" },
  lg: { px: 28, margin: "0 5px" },
};

export default function VerifiedBadge({ tier, size = "sm", showTooltip = true, className = "" }) {
  const [hovered, setHovered] = React.useState(false);

  if (!tier || !TIER_CONFIG[tier]) return null;

  const config = TIER_CONFIG[tier];
  const { px, margin } = SIZE_MAP[size] || SIZE_MAP.sm;

  return (
    <span
      className={`verified-badge-wrapper ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        position: "relative",
        margin,
        verticalAlign: "middle",
        cursor: showTooltip ? "default" : "inherit",
        flexShrink: 0,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={config.label}
      title={showTooltip ? undefined : config.label}
    >
      {/* Badge icon */}
      <span
        style={{
          display: "inline-flex",
          width: px,
          height: px,
          transform: hovered ? "scale(1.1)" : "scale(1)",
          transition: "transform 0.15s ease",
        }}
      >
        {config.icon}
      </span>

      {/* Tooltip */}
      {showTooltip && hovered && (
        <span
          style={{
            position: "absolute",
            bottom: "calc(100% + 6px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#1e293b", // Slate 800
            border: "1px solid #334155",
            color: "#f8fafc", // Slate 50
            padding: "6px 12px",
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 500,
            whiteSpace: "nowrap",
            zIndex: 9999,
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            letterSpacing: "0.02em",
            pointerEvents: "none",
          }}
        >
          <span style={{ color: config.color }}>✓</span> {config.label}
          {/* Tooltip arrow */}
          <span
            style={{
              position: "absolute",
              top: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "5px solid transparent",
              borderRight: "5px solid transparent",
              borderTop: `5px solid ${config.color}40`,
            }}
          />
        </span>
      )}
    </span>
  );
}
