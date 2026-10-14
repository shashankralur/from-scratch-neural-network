import { useState } from "react";
import Chart, { LossChart, BLUE, RED } from "../components/Chart";
import { Btn, DataEditor, Num, Readout, fmt } from "../components/Controls";
import { api, useCall, useTraining } from "../api";

export default function Stage9() {
  const [rows, setRows] = useState([[0.9, 0.8, 1], [0.2, 0.7, 0], [0.8, 0.2, 1], [0.1, 0.1, 0]]);
  const [lr, setLr] = useState(2), [t1, setT1] = useState(0.7), [t2, setT2] = useState(0.5);
  const xs = rows.map((r) => r.slice(0, 2)), ys = rows.map((r) => r[2]);
  const T = useTraining({ ws: [0, 0], b: 0 }, async (p, n) => {
    const r = await api("train-n", { ws: p.ws, b: p.b, xs, ys, lr, epochs: n, activation: "sigmoid" });
    return { params: { ws: r.ws, b: r.b }, history: r.history, diverged: r.diverged };
  });
  const { ws, b } = T.params;
  const ev = useCall("predict-batch", { ws, b, xs, ys, activation: "sigmoid" });
  const test = useCall("predict-batch", { ws, b, xs: [[t1, t2]], activation: "sigmoid" });
  const curve = useCall("sigmoid", { lo: -8, hi: 8 });
  return (
    <>
      <div className="row">
        <Num label="lr" value={lr} set={setLr} />
        <Btn onClick={() => T.train(100)}>100 epochs</Btn><Btn onClick={() => T.train(1000)}>1000 epochs</Btn><Btn ghost onClick={() => T.reset()}>Reset</Btn>
      </div>
      <Readout>z = w1*x1 + w2*x2 + b = {fmt(ws[0])}*x1 + {fmt(ws[1])}*x2 + {fmt(b)}<br />prediction = sigmoid(z)   loss = <b>{ev ? fmt(ev.loss) : "..."}</b>
        {T.warn && <><br /><span className="bad">{T.warn}</span></>}</Readout>
      <Chart xd={[-8, 8]} yd={[-0.05, 1.05]} xl="z (the weighted sum)" yl="sigmoid(z) = chance of pass"
        lines={[{ pts: curve ? curve.curve : [], color: "#8795a3" }]}
        dots={ev ? ys.map((y, i) => ({ x: ev.zs[i], y: ev.predictions[i], color: y === 1 ? BLUE : RED })) : []}
        legend={[{ label: "passed (should go up-right)", color: BLUE }, { label: "failed (should go down-left)", color: RED }]} />
      <LossChart losses={T.losses} />
      <h3>Students (inputs are hours divided by 10, passed is 1 or 0)</h3>
      <DataEditor cols={["studied", "slept", "passed"]} rows={rows} setRows={setRows} extra={[{ label: "chance", values: ev ? ev.predictions : [] }]} />
      <h3>Test a new student</h3>
      <div className="row"><Num label="studied" value={t1} set={setT1} /><Num label="slept" value={t2} set={setT2} />
        <Readout>chance of passing = <b>{test ? fmt(test.predictions[0]) : "..."}</b></Readout></div>
    </>
  );
}
