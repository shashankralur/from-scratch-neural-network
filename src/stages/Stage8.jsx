import { useState } from "react";
import Chart, { LossChart, BLUE, AMBER, GREEN } from "../components/Chart";
import { Btn, DataEditor, Num, Readout, fmt } from "../components/Controls";
import { api, useCall, useTraining } from "../api";

export default function Stage8() {
  const [rows, setRows] = useState([[1, 2, 5], [2, 1, 6], [3, 3, 10], [4, 2, 11], [2, 4, 9]]);
  const [lr, setLr] = useState(0.01), [t1, setT1] = useState(3), [t2, setT2] = useState(1);
  const xs = rows.map((r) => r.slice(0, 2)), ys = rows.map((r) => r[2]);
  const T = useTraining({ ws: [0, 0], b: 0 }, async (p, n) => {
    const r = await api("train-n", { ws: p.ws, b: p.b, xs, ys, lr, epochs: n });
    return { params: { ws: r.ws, b: r.b }, history: r.history, diverged: r.diverged };
  });
  const { ws, b } = T.params;
  const ev = useCall("predict-batch", { ws, b, xs, ys });
  const test = useCall("predict-batch", { ws, b, xs: [[t1, t2]] });
  const lo = Math.min(...ys), hi = Math.max(...ys);
  return (
    <>
      <div className="row">
        <Num label="lr" value={lr} set={setLr} />
        <Btn onClick={() => T.train(100)}>100 epochs</Btn><Btn onClick={() => T.train(1000)}>1000 epochs</Btn><Btn ghost onClick={() => T.reset()}>Reset</Btn>
      </div>
      <Readout>y = w1*x1 + w2*x2 + b<br />= {fmt(ws[0])}*x1 + {fmt(ws[1])}*x2 + {fmt(b)}   loss = <b>{ev ? fmt(ev.loss) : "..."}</b>
        {T.warn && <><br /><span className="bad">{T.warn}</span></>}</Readout>
      <Chart xl="actual y" yl="predicted y"
        lines={[{ pts: [[lo, lo], [hi, hi]], color: GREEN, dash: "5 4" }]}
        dots={ev ? ys.map((y, i) => ({ x: y, y: ev.predictions[i], color: AMBER })) : []}
        legend={[{ label: "each row", color: AMBER }, { label: "perfect (predicted = actual)", color: GREEN }]} />
      <LossChart losses={T.losses} />
      <Chart xl="parameter" yl="value" xd={[0, 4]}
        dots={[{ x: 1, y: ws[0], color: BLUE }, { x: 2, y: ws[1], color: AMBER }, { x: 3, y: b, color: GREEN }]}
        legend={[{ label: "w1 (at 1)", color: BLUE }, { label: "w2 (at 2)", color: AMBER }, { label: "b (at 3)", color: GREEN }]} />
      <h3>Your data (this one hides y = 2*x1 + x2 + 1)</h3>
      <DataEditor cols={["x1", "x2", "y"]} rows={rows} setRows={setRows} extra={[{ label: "predicted", values: ev ? ev.predictions : [] }]} />
      <h3>Test a new input</h3>
      <div className="row"><Num label="x1" value={t1} set={setT1} /><Num label="x2" value={t2} set={setT2} /><Readout>prediction = <b>{test ? fmt(test.predictions[0]) : "..."}</b></Readout></div>
    </>
  );
}
