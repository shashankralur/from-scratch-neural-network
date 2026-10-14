import { useId } from "react";

export const BLUE = "#2457d6", AMBER = "#b7791f", RED = "#c2362b", GREEN = "#1f8a5b";
const fin = Number.isFinite;

function niceStep(r) {
  const p = 10 ** Math.floor(Math.log10(r || 1));
  const m = r / p;
  return (m < 1.5 ? 1 : m < 3 ? 2 : m < 7 ? 5 : 10) * p;
}
function ticks(lo, hi) {
  const s = niceStep((hi - lo) / 5), out = [];
  for (let v = Math.ceil(lo / s) * s; v <= hi + 1e-9; v += s) out.push(+v.toFixed(10));
  return out;
}
function dom(vals, given) {
  if (given) return given;
  const v = vals.filter(fin);
  if (!v.length) return [0, 1];
  let lo = Math.min(...v), hi = Math.max(...v);
  if (lo === hi) { lo -= 1; hi += 1; }
  const pad = (hi - lo) * 0.08;
  return [lo - pad, hi + pad];
}

// lines: [{pts:[[x,y]], color, dash}]  dots: [{x,y,color,hollow,r}]  segs: [{x1,y1,x2,y2,color}]
export default function Chart({ lines = [], dots = [], segs = [], xd, yd, xl = "x", yl = "y", legend = [] }) {
  const id = useId().replace(/:/g, "");
  const W = 520, H = 270, L = 54, R = 14, T = 14, B = 40;
  const xs = [...lines.flatMap((l) => l.pts.map((p) => p[0])), ...dots.map((d) => d.x), ...segs.flatMap((s) => [s.x1, s.x2])];
  const ys = [...lines.flatMap((l) => l.pts.map((p) => p[1])), ...dots.map((d) => d.y), ...segs.flatMap((s) => [s.y1, s.y2])];
  const [x0, x1] = dom(xs, xd), [y0, y1] = dom(ys, yd);
  const X = (v) => L + ((v - x0) / (x1 - x0)) * (W - L - R);
  const Y = (v) => H - B - ((v - y0) / (y1 - y0)) * (H - T - B);
  return (
    <figure className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${yl} versus ${xl}`}>
        <defs><clipPath id={id}><rect x={L} y={T} width={W - L - R} height={H - T - B} /></clipPath></defs>
        {ticks(x0, x1).map((v) => (
          <g key={"x" + v}>
            <line x1={X(v)} x2={X(v)} y1={T} y2={H - B} className="grid" />
            <text x={X(v)} y={H - B + 16} textAnchor="middle" className="tick">{v}</text>
          </g>
        ))}
        {ticks(y0, y1).map((v) => (
          <g key={"y" + v}>
            <line x1={L} x2={W - R} y1={Y(v)} y2={Y(v)} className="grid" />
            <text x={L - 6} y={Y(v) + 4} textAnchor="end" className="tick">{v}</text>
          </g>
        ))}
        <line x1={L} x2={L} y1={T} y2={H - B} className="axis" />
        <line x1={L} x2={W - R} y1={H - B} y2={H - B} className="axis" />
        <g clipPath={`url(#${id})`}>
          {segs.filter((s) => fin(s.y1) && fin(s.y2)).map((s, i) => (
            <line key={i} x1={X(s.x1)} y1={Y(s.y1)} x2={X(s.x2)} y2={Y(s.y2)} stroke={s.color || RED} strokeDasharray="4 3" strokeWidth="1.5" />
          ))}
          {lines.map((l, i) => (
            <polyline key={i} fill="none" stroke={l.color} strokeWidth="2" strokeDasharray={l.dash}
              points={l.pts.filter((p) => fin(p[0]) && fin(p[1])).map((p) => X(p[0]) + "," + Y(p[1])).join(" ")} />
          ))}
          {dots.filter((d) => fin(d.x) && fin(d.y)).map((d, i) => (
            <circle key={i} cx={X(d.x)} cy={Y(d.y)} r={d.r || 6} fill={d.hollow ? "#fff" : d.color} stroke={d.color} strokeWidth="2" />
          ))}
        </g>
        <text x={(L + W - R) / 2} y={H - 6} textAnchor="middle" className="lab">{xl}</text>
        <text transform={`translate(13 ${(T + H - B) / 2}) rotate(-90)`} textAnchor="middle" className="lab">{yl}</text>
      </svg>
      {legend.length > 0 && (
        <figcaption className="legend">
          {legend.map((g) => (
            <span key={g.label}><i style={{ background: g.hollow ? "#fff" : g.color, borderColor: g.color }} />{g.label}</span>
          ))}
        </figcaption>
      )}
    </figure>
  );
}

export const LossChart = ({ losses, xl = "epoch" }) => (
  <Chart xl={xl} yl="loss" lines={[{ pts: losses.map((l, i) => [i + 1, l]), color: RED }]}
    legend={[{ label: "loss (lower is better)", color: RED }]} />
);
