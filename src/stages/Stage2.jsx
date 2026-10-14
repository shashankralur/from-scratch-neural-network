import { useState } from "react";
import Chart, { BLUE, AMBER, RED } from "../components/Chart";
import { Slider, Readout, fmt } from "../components/Controls";
import { useCall } from "../api";

export default function Stage2() {
  const [w, setW] = useState(1), [x, setX] = useState(2), [y, setY] = useState(6);
  const r = useCall("error", { w, x, y });
  const p = r ? r.prediction : NaN;
  return (
    <>
      <Slider label="w" value={w} set={setW} min={-2} max={8} />
      <Slider label="x" value={x} set={setX} min={0} max={10} />
      <Slider label="y (truth)" value={y} set={setY} min={0} max={20} step={1} />
      {r && (
        <Readout>
          error = prediction - y = {fmt(p)} - {y} = <b className={r.error === 0 ? "good" : "bad"}>{fmt(r.error)}</b><br />
          {r.direction === "up" && "too low, so move w UP"}
          {r.direction === "down" && "too high, so move w DOWN"}
          {r.direction === "stay" && "perfect, so stay"}
        </Readout>
      )}
      <Chart xd={[0, 10]} yd={[-20, 60]} xl="x" yl="y"
        lines={[{ pts: [[0, 0], [10, w * 10]], color: AMBER }]}
        segs={[{ x1: x, y1: y, x2: x, y2: p }]}
        dots={[{ x, y, color: BLUE }, { x, y: p, color: AMBER, hollow: true }]}
        legend={[{ label: "truth y", color: BLUE }, { label: "prediction", color: AMBER, hollow: true }, { label: "error (the gap)", color: RED }]} />
    </>
  );
}
