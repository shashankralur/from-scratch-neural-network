import { useState } from "react";
import Chart, { BLUE, RED } from "../components/Chart";
import { Slider, Readout, fmt, span } from "../components/Controls";
import { useCall } from "../api";

export default function Stage3() {
  const [w, setW] = useState(0), [x, setX] = useState(2), [y, setY] = useState(6);
  const [lo, hi] = span(x, y);
  const c = useCall("loss-curve", { x, y, w, lo, hi });
  return (
    <>
      <Slider label="w" value={w} set={setW} min={-2} max={10} step={0.1} />
      <Slider label="x" value={x} set={setX} min={1} max={5} step={1} />
      <Slider label="y" value={y} set={setY} min={1} max={20} step={1} />
      {c && (
        <Readout>
          error = {fmt(c.error)}<br />
          loss = 0.5 * error^2 = <b className={c.loss < 0.01 ? "good" : "bad"}>{fmt(c.loss)}</b><br />
          best w = y / x = {fmt(y / x)}, where the loss is 0
        </Readout>
      )}
      <Chart xl="w (the knob)" yl="loss"
        lines={[{ pts: c ? c.curve : [], color: BLUE }]}
        dots={[{ x: w, y: c ? c.loss : NaN, color: RED }]}
        legend={[{ label: "loss for every possible w", color: BLUE }, { label: "where w is now", color: RED }]} />
      <p className="hint">Learning means sliding down this curve to the bottom.</p>
    </>
  );
}
