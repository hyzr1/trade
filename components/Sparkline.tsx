// components/Sparkline.tsx
export function Sparkline({ points, color = "#4ade80", height = 32 }: { points: number[]; color?: string; height?: number }) {
  if (points.length < 2) {
    return (
      <svg viewBox="0 0 200 32" className="w-full" style={{ height }} preserveAspectRatio="none">
        <line x1="0" x2="200" y1="18" y2="18" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="3 3" />
      </svg>
    );
  }
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * 200;
    const y = 28 - ((p - min) / range) * 24 - 2;
    return [x, y] as const;
  });
  const linePath = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L200,32 L0,32 Z`;
  const gradId = `spark-${color.replace("#", "")}`;
  return (
    <svg viewBox="0 0 200 32" className="w-full" style={{ height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.22} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path d={linePath} stroke={color} strokeWidth="1.25" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
