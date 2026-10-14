import { useState } from "react";
import Chart, { BLUE, AMBER } from "../components/Chart";
import { Btn, Num, Readout, fmt, span } from "../components/Controls";
import { api, useCall } from "../api";

export default function Stage4() {
  const [x, setX] = useState(2), [y, setY] = useState(6), [lr, setLr] = useState(0.1);
  const [w, setW] = useState(1), [trail, setTrail] = useState([]), [last, setLast] = useState(null);
  const [lo, hi] = span(x, y);
  const c = useCall("loss-curve", { x, y, w, lo, hi });
  const reset = () => { setW(1); setTrail([]); setLast(null); };
  const go = async () => {
    const r = await api("step", { w, x, y, lr });
    setTrail([...trail, { w, loss: r.loss }]);
    setLast({ ...r, from: w });
    setW(r.w);
  };
  const path = [...trail.map((t) => [t.w, t.loss]), [w, c ? c.loss : NaN]];
  return (
    <>
      <div className="row">
        <Num label="x" value={x} set={(v) => { setX(v); reset(); }} />
        <Num label="y" value={y} set={(v) => { setY(v); reset(); }} />
        <Num label="lr" value={lr} set={setLr} />
        <Btn onClick={go}>Step</Btn><Btn ghost onClick={reset}>Reset (w = 1)</Btn>
      </div>
      <Readout>
        {last ? (
          <>
            error = {fmt(last.error)}<br />
            slope = error * x = {fmt(last.error)} * {x} = {fmt(last.slope)}<br />
            w_new = w - lr * slope = {fmt(last.from)} - {lr} * ({fmt(last.slope)}) = <b>{fmt(last.w)}</b>
          </>
        ) : "Press Step. w starts at 1."}
      </Readout>
      <Chart xl="w" yl="loss"
        lines={[{ pts: c ? c.curve : [], color: BLUE }, { pts: path, color: AMBER, dash: "4 3" }]}
        dots={[...trail.map((t) => ({ x: t.w, y: t.loss, color: AMBER, hollow: true, r: 5 })), { x: w, y: c ? c.loss : NaN, color: AMBER }]}
        legend={[{ label: "loss curve", color: BLUE }, { label: "where w has been", color: AMBER, hollow: true }, { label: "where w is now", color: AMBER }]} />
      <p className="hint">Each step moves w downhill. Near the bottom the slope shrinks, so the steps shrink.</p>
    </>
  );
}
