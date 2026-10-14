import { useState } from "react";
import Chart, { LossChart, BLUE, GREEN } from "../components/Chart";
import { Btn, Num, Readout, fmt } from "../components/Controls";
import { api } from "../api";

export default function Stage5() {
  const [x, setX] = useState(2), [y, setY] = useState(6), [lr, setLr] = useState(0.1);
  const [hist, setHist] = useState([]);
  const run = async (n) => {
    const w0 = hist.length ? hist[hist.length - 1].w : 1;
    const r = await api("train-one", { w: w0, x, y, lr, steps: n });
    setHist(hist.length ? [...hist, ...r.history.slice(1)] : r.history);
  };
  const reset = () => setHist([]);
  const t = y / x, n = Math.max(hist.length - 1, 1);
  const lastLoss = hist.length ? hist[hist.length - 1].loss : 0;
  return (
    <>
      <div className="row">
        <Num label="x" value={x} set={(v) => { setX(v); reset(); }} />
        <Num label="y" value={y} set={(v) => { setY(v); reset(); }} />
        <Num label="lr" value={lr} set={(v) => { setLr(v); reset(); }} />
      </div>
      <div className="row">
        <Btn onClick={() => run(5)}>Run 5 steps</Btn><Btn onClick={() => run(20)}>Run 20 steps</Btn><Btn ghost onClick={reset}>Reset</Btn>
        <span>presets:</span>
        {[0.02, 0.1, 0.25, 0.6].map((v) => <Btn key={v} ghost onClick={() => { setLr(v); reset(); }}>lr {v}</Btn>)}
      </div>
      <Readout>
        steps = {Math.max(hist.length - 1, 0)}   w = <b>{hist.length ? fmt(hist[hist.length - 1].w) : 1}</b>   target w = {fmt(t)}<br />
        {lastLoss > 1e3 ? <span className="bad">loss is exploding: lr is too big</span> : "try the presets: too small is slow, too big explodes"}
      </Readout>
      <LossChart losses={hist.map((h) => h.loss)} xl="step" />
      <Chart xl="step" yl="w"
        lines={[{ pts: hist.map((h, i) => [i, h.w]), color: BLUE }, { pts: [[0, t], [n, t]], color: GREEN, dash: "5 4" }]}
        legend={[{ label: "w", color: BLUE }, { label: "target w", color: GREEN }]} />
    </>
  );
}
