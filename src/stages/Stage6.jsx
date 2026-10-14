import { useState } from "react";
import Chart, { LossChart, BLUE, AMBER, RED, GREEN } from "../components/Chart";
import { Btn, DataEditor, Num, Readout, fmt } from "../components/Controls";
import { api, useCall, useTraining } from "../api";

export default function Stage6() {
  const [data, setData] = useState([[1, 3], [2, 7], [3, 9]]);
  const [lr, setLr] = useState(0.05), [tx, setTx] = useState(10);
  const T = useTraining({ w: 1 }, async (p, n) => {
    const r = await api("train", { w: p.w, data, lr, epochs: n });
    return { params: { w: r.w }, history: r.history, diverged: r.diverged };
  });
  const w = T.params.w;
  const ev = useCall("predict-batch", { ws: [w], b: 0, xs: data.map((r) => [r[0]]), ys: data.map((r) => r[1]) });
  const test = useCall("forward", { w, x: tx });
  const pr = ev ? ev.predictions : [];
  const xm = Math.max(4, ...data.map((r) => r[0]), tx) + 1;
  return (
    <>
      <div className="row">
        <Num label="lr" value={lr} set={setLr} />
        <Btn onClick={() => T.train(1)}>1 epoch</Btn><Btn onClick={() => T.train(50)}>50 epochs</Btn><Btn onClick={() => T.train(500)}>500 epochs</Btn>
        <Btn ghost onClick={() => T.reset()}>Reset w</Btn>
      </div>
      <Readout>w = <b>{fmt(w)}</b>   loss = <b className={ev && ev.loss < 0.5 ? "good" : "bad"}>{ev ? fmt(ev.loss) : "..."}</b>   epochs = {T.losses.length}
        {T.warn && <><br /><span className="bad">{T.warn}</span></>}</Readout>
      <Chart xd={[0, xm]} xl="x" yl="y"
        lines={[{ pts: [[0, 0], [xm, w * xm]], color: AMBER }]}
        segs={data.map((r, i) => ({ x1: r[0], y1: r[1], x2: r[0], y2: pr[i] }))}
        dots={[...data.map((r) => ({ x: r[0], y: r[1], color: BLUE })), ...data.map((r, i) => ({ x: r[0], y: pr[i], color: AMBER, hollow: true, r: 5 })),
          { x: tx, y: test ? test.prediction : NaN, color: GREEN, r: 4 }]}
        legend={[{ label: "original y", color: BLUE }, { label: "predicted", color: AMBER, hollow: true }, { label: "error", color: RED }, { label: "test x", color: GREEN }]} />
      <LossChart losses={T.losses} />
      <h3>Your data (add or remove rows)</h3>
      <DataEditor cols={["x", "y"]} rows={data} setRows={setData} extra={[{ label: "predicted", values: pr }]} />
      <h3>Test a new input</h3>
      <div className="row"><Num label="x" value={tx} set={setTx} /><Readout>prediction = {fmt(w)} * {tx} = <b>{test ? fmt(test.prediction) : "..."}</b></Readout></div>
      <p className="hint">One w cannot fit all three points exactly, so the loss stays above 0.</p>
    </>
  );
}
