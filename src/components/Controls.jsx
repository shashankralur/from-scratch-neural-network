import { useState } from "react";

export const fmt = (n, d = 3) => (Number.isFinite(n) ? Number(n.toFixed(d)) : "huge");
// w-range to draw for the loss curve, around the best w = y / x
export const span = (x, y) => { const t = x ? y / x : 3; return [Math.min(-2, t - 3), Math.max(6, t + 3)]; };

export const Slider = ({ label, value, set, min, max, step = 0.5 }) => (
  <div className="row">
    <label>{label}</label>
    <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => set(+e.target.value)} />
    <span className="val">{value}</span>
  </div>
);
export const Num = ({ label, value, set, step = "any" }) => (
  <label className="num">{label}<input type="number" step={step} value={value} onChange={(e) => set(+e.target.value)} /></label>
);
export const Readout = ({ children }) => <div className="big">{children}</div>;
export const Btn = ({ ghost, ...p }) => <button className={"act" + (ghost ? " ghost" : "")} {...p} />;

// Editable table. rows are arrays of numbers; extra = [{label, values}] shown read-only.
export function DataEditor({ cols, rows, setRows, extra = [] }) {
  const [d, setD] = useState(cols.map(() => 0));
  return (
    <>
      <table>
        <thead><tr>{cols.map((c) => <th key={c}>{c}</th>)}{extra.map((e) => <th key={e.label}>{e.label}</th>)}<th /></tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((v, j) => <td key={j}>{v}</td>)}
              {extra.map((e) => <td key={e.label}>{e.values?.[i] === undefined ? "" : fmt(e.values[i])}</td>)}
              <td><button className="x" aria-label="Remove row" onClick={() => setRows(rows.filter((_, k) => k !== i))}>x</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="row addrow">
        {cols.map((c, j) => <Num key={c} label={c} value={d[j]} set={(v) => setD(d.map((o, k) => (k === j ? v : o)))} />)}
        <Btn onClick={() => setRows([...rows, d])}>Add row</Btn>
      </div>
    </>
  );
}
