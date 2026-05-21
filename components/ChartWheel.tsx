"use client";

import { Chart } from "@/lib/astrology";

const aspectColors: Record<string, string> = {
  コンジャンクション: "#e2be67",
  セクスタイル: "#7dc7c5",
  スクエア: "#d38a8a",
  トライン: "#9ccc8d",
  オポジション: "#d38a8a"
};

function point(longitude: number, radius: number) {
  const angle = (longitude - 90) * (Math.PI / 180);
  return { x: 200 + Math.cos(angle) * radius, y: 200 + Math.sin(angle) * radius };
}

export function ChartWheel({ chart }: { chart: Chart }) {
  const planetByName = new Map(chart.planets.map((p) => [p.name, p]));

  return (
    <svg className="wheel" viewBox="0 0 400 400" role="img" aria-label="ホロスコープチャート">
      <circle cx="200" cy="200" r="184" fill="#08101d" stroke="#e2be67" strokeWidth="1.5" />
      <circle cx="200" cy="200" r="142" fill="none" stroke="rgba(226,190,103,.35)" />
      <circle cx="200" cy="200" r="92" fill="none" stroke="rgba(226,190,103,.18)" />
      {Array.from({ length: 12 }).map((_, index) => {
        const p1 = point(index * 30, 184);
        const p2 = point(index * 30, 92);
        const label = point(index * 30 + 15, 166);
        return (
          <g key={index}>
            <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="rgba(226,190,103,.22)" />
            <text x={label.x} y={label.y} textAnchor="middle" dominantBaseline="middle" fill="#b9b2a1" fontSize="12">
              {index + 1}
            </text>
          </g>
        );
      })}
      {chart.aspects.map((aspect) => {
        const from = planetByName.get(aspect.from);
        const to = planetByName.get(aspect.to);
        if (!from || !to) return null;
        const p1 = point(from.longitude, 86);
        const p2 = point(to.longitude, 86);
        return <line key={`${aspect.from}-${aspect.to}-${aspect.type}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={aspectColors[aspect.type]} strokeOpacity="0.5" />;
      })}
      {chart.planets.map((planet) => {
        const p = point(planet.longitude, 126);
        const text = point(planet.longitude, 108);
        return (
          <g key={planet.key}>
            <circle cx={p.x} cy={p.y} r="5" fill="#e2be67" />
            <text x={text.x} y={text.y} textAnchor="middle" dominantBaseline="middle" fill="#f7f1df" fontSize="12">
              {planet.name}
            </text>
          </g>
        );
      })}
      {chart.ascendant ? (
        <text x={point(chart.ascendant.longitude, 188).x} y={point(chart.ascendant.longitude, 188).y} textAnchor="middle" fill="#7dc7c5" fontSize="13">
          ASC
        </text>
      ) : null}
      <circle cx="200" cy="200" r="3" fill="#f7f1df" />
    </svg>
  );
}
