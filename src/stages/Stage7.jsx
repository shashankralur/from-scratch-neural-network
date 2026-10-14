import { useState } from "react";
import Chart, { LossChart, BLUE, AMBER, RED } from "../components/Chart";
import { Btn, DataEditor, Num, Readout, fmt } from "../components/Controls";
import { api, useCall, useTraining } from "../api";

export default function Stage7() {
  const [data, setData] = useState([[0, 3], [1, 5.2], [2, 6.8], [3, 9.1], [4, 11]]);
  const [lr, setLr] = useState(0.02), [useBias, setUseBias] = useState(true), [tx, setTx] = useState(6);
  const T = useTraining({ w: 1, b: 0 }, async (p, n) => {
    const r = await api("train-b", { w: p.w, b: p.b, data, lr, epochs: n, use_bias: useBias });
    return { params: { w: r.w, b: r.b }, history: r.history, diverged: r.diverged };
  });
  const { w, b } = T.params;
  const ev = useCall("predict-batch", { ws: [w], b, xs: data.map((r) => [r[0]]), ys: data.map((r) => r[1]) });
  const test = useCall("forward", { w, b, x: tx });
  const pr = ev ? ev.predictions : [];
  const xm = Math.max(5, ...data.map((r) => r[0]), tx) + 1;
  return (
    <>
      <div className="row">
        <label style={{ width: "auto" }}><input type="checkbox" checked={useBias} onChange={(e) => { setUseBias(e.target.checked); T.reset(); }} /> use bias</label>
        <Num label="lr" value={lr} set={setLr} />
        <Btn onClick={() => T.train(50)}>50 epochs</Btn><Btn onClick={() => T.train(500)}>500 epochs</Btn><Btn ghost onClick={() => T.reset()}>Reset</Btn>
      </div>
      <Readout>y = w * x + b = {fmt(w)} * x + {fmt(b)}   loss = <b>{ev ? fmt(ev.loss) : "..."}</b>
        {T.warn && <><br /><span className="bad">{T.warn}</span></>}</Readout>
      <Chart xd={[0, xm]} xl="x" yl="y"
        lines={[{ pts: [[0, b], [xm, w * xm + b]], color: AMBER }]}
        segs={data.map((r, i) => ({ x1: r[0], y1: r[1], x2: r[0], y2: pr[i] }))}
        dots={[...data.map((r) => ({ x: r[0], y: r[1], color: BLUE })), ...data.map((r, i) => ({ x: r[0], y: pr[i], color: AMBER, hollow: true, r: 5 }))]}
        legend={[{ label: "original y", color: BLUE }, { label: "predicted", color: AMBER, hollow: true }, { label: "error", color: RED }]} />
      <LossChart losses={T.losses} />
      <h3>Your data</h3>
      <DataEditor cols={["x", "y"]} rows={data} setRows={setData} extra={[{ label: "predicted", values: pr }]} />
      <h3>Test a new input</h3>
      <div className="row"><Num label="x" value={tx} set={setTx} /><Readout>prediction = <b>{test ? fmt(test.prediction) : "..."}</b></Readout></div>
      <p className="hint">Untick "use bias", train, and watch the line stuck through 0. That is why the bias exists.</p>
    </>
  );
}
