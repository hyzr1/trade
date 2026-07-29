// components/Avatar.tsx
type Props = {
  initials: string;
  kind: "politician" | "llm";
  size?: number;
};

export function Avatar({ initials, kind, size = 40 }: Props) {
  // Quiet, monochrome look. Politicians use a neutral graphite tile; AI uses
  // the same tile with a thin blue ring to mark the distinction without
  // shouting.
  const bg = kind === "llm"
    ? "linear-gradient(180deg, #1a1d24, #0f1115)"
    : "linear-gradient(180deg, #14161a, #0a0b0d)";
  const ring = kind === "llm"
    ? "ring-1 ring-blue-400/30"
    : "ring-1 ring-white/[0.08]";
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-medium text-zinc-200 shrink-0 ${ring}`}
      style={{ width: size, height: size, background: bg, fontSize: Math.max(11, Math.round(size * 0.36)) }}
    >
      {initials}
    </span>
  );
}
