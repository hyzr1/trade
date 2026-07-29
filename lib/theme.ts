// lib/theme.ts
export const BG          = "#08060F";
export const BG_2        = "#0E0B1A";
export const VIOLET      = "#7C5FFF";
export const VIOLET_2    = "#A78BFA";
export const VIOLET_DEEP = "#4F39D8";
export const YELLOW      = "#F7D24A";
export const YELLOW_DIM  = "#E5BD2F";
export const POSITIVE    = "#4ADE80";
export const NEGATIVE    = "#F87171";
export const TICKER_AMBER = "#F0B429";
export const TEXT_HI  = "rgba(255,255,255,0.95)";
export const TEXT_MID = "rgba(255,255,255,0.65)";
export const TEXT_LOW = "rgba(255,255,255,0.45)";
export const TEXT_DIM = "rgba(255,255,255,0.30)";
export const LINE   = "rgba(255,255,255,0.06)";
export const LINE_2 = "rgba(255,255,255,0.10)";

export const VIOLET_GRAD = `linear-gradient(135deg, ${VIOLET} 0%, ${VIOLET_DEEP} 100%)`;
export const VIOLET_GLOW = `0 18px 50px -14px ${VIOLET}99, inset 0 1px 0 rgba(255,255,255,0.20)`;

export const cardSurface = {
  background: `linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)`,
  border: `1px solid ${LINE_2}`,
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
} as const;

export const elevatedSurface = {
  background: `linear-gradient(180deg, ${BG_2} 0%, ${BG} 100%)`,
  boxShadow:
    "0 100px 220px -50px rgba(0,0,0,0.95), 0 40px 120px -30px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 0 rgba(255,255,255,0.06)",
} as const;
