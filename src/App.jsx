import { useEffect, useState } from "react";

const f = (n, d = 3) => (Number.isFinite(n) ? Number(n.toFixed(d)) : "diverged");

const api = (path, body) =>
  fetch("/api/" + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then((r) => r.json());

const CODE = [
`# backend/main.py  (Stage 1: a neuron is a function)
w = 2                 # the knob

def neuron(w, x):
    return w * x      # prediction

@app.post("/api/forward")
def forward(b):
    return {"prediction": neuron(b.w, b.x)}`,
`# Stage 2: how wrong is it?
def get_error(w, x, y):
    return neuron(w, x) - y

@app.post("/api/error")
def error(b):
    e = get_error(b.w, b.x, b.y)
    if e < 0:   direction = "up"    # too low
    elif e > 0: direction = "down"  # too high
    else:       direction = "stay"  # perfect
    return {"error": e, "direction": direction}`,
`# Stage 3: learn from ONE example
def update(w, x, y, lr):
    error = get_error(w, x, y)
    slope = error * x          # "why 2": error moves by x
    return w - lr * slope, error, slope

@app.post("/api/step")
def step(b):
    new_w, e, slope = update(b.w, b.x, b.y, b.lr)
    return {"w": new_w, "error": e, "slope": slope}`,
`# Stage 4: learn from MANY examples
@app.post("/api/train")
def train(b):
    w = b.w
    for _ in range(b.epochs):
        for p in b.data:
            w, _, _ = update(w, p.x, p.y, b.lr)
    return {"w": w}

@app.post("/api/evaluate")
def evaluate(b):
    preds = [neuron(b.w, p.x) for p in b.data]
    loss = sum((q - p.y) ** 2 for q, p in zip(preds, b.data))
    return {"predictions": preds, "loss": loss}`,
];

const INFO = [
  ["A neuron is a function", "Move the sliders. Same machine, different w, different output."],
  ["Measure the error", "error = prediction - y. The sign tells you which way to turn w."],
  ["Learn from one example", "Press Step. Watch w move toward the value that makes error 0."],
  ["Many examples, your data", "Add noisy points, train, and compare original vs predicted."],
];

function Slider({ label, value, set, min = -5, max = 10, step = 0.5 }) {
  return (
    <div className="row">
      <label>{label}</label>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => set(+e.target.value)} />
      <span className="val">{value}</span>
    </div>
  );
}

function Stage1() {
  const [w, setW] = useState(2);
  const [x, setX] = useState(3);
  const [pred, setPred] = useState(null);
  useEffect(() => { api("forward", { w, x }).then((r) => setPred(r.prediction)).catch(() => {}); }, [w, x]);
  return (
    <>
      <Slider label="w" value={w} set={setW} />
      <Slider label="x" value={x} set={setX} />
      <div className="big">prediction = {w} * {x} = <b>{pred === null ? "..." : f(pred)}</b> <br />(computed by the backend)</div>
    </>
  );
}

function Stage2() {
  const [w, setW] = useState(1);
  const [x, setX] = useState(2);
  const [y, setY] = useState(6);
  const [r, setR] = useState(null);
  useEffect(() => { api("error", { w, x, y }).then(setR).catch(() => {}); }, [w, x, y]);
  return (
    <>
      <Slider label="w" value={w} set={setW} />
      <Slider label="x" value={x} set={setX} />
      <Slider label="y (truth)" value={y} set={setY} min={-10} max={20} step={1} />
      {r && (
        <div className="big">
          prediction = {f(r.prediction)}<br />
          error = {f(r.prediction)} - {y} = <b className={r.error === 0 ? "good" : "bad"}>{f(r.error)}</b><br />
          {r.direction === "up" && "too low, so move w UP"}
          {r.direction === "down" && "too high, so move w DOWN"}
          {r.direction === "stay" && "perfect, so stay"}
        </div>
      )}
    </>
  );
}

function Stage3() {
  const init = { w: 1, rows: [] };
  const [s, setS] = useState(init);
  const [x, setX] = useState(2);
  const [y, setY] = useState(6);
  const [lr, setLr] = useState(0.1);
  const stepOnce = async (st) => {
    const r = await api("step", { w: st.w, x, y, lr });
    return { w: r.w, rows: [...st.rows, { n: st.rows.length, w: st.w, p: r.prediction, e: r.error, slope: r.slope }].slice(-12) };
  };
  const run = async (n) => { let t = s; for (let i = 0; i < n; i++) t = await stepOnce(t); setS(t); };
  return (
    <>
      <div className="row">
        <label>x</label><input type="number" value={x} onChange={(e) => setX(+e.target.value)} />
        <label>y</label><input type="number" value={y} onChange={(e) => setY(+e.target.value)} />
        <label>lr</label><input type="number" step="0.01" value={lr} onChange={(e) => setLr(+e.target.value)} />
      </div>
      <button className="act" onClick={() => run(1)}>Step</button>
      <button className="act" onClick={() => run(10)}>Step x10</button>
      <button className="act ghost" onClick={() => setS(init)}>Reset (w = 1)</button>
      <div className="big">w now = <b>{f(s.w)}</b>   target w = {f(y / x)}</div>
      <table>
        <thead><tr><th>step</th><th>w</th><th>prediction</th><th>error</th><th>slope</th></tr></thead>
        <tbody>{s.rows.map((r) => (
          <tr key={r.n}><td>{r.n}</td><td>{f(r.w)}</td><td>{f(r.p)}</td><td>{f(r.e)}</td><td>{f(r.slope)}</td></tr>
        ))}</tbody>
      </table>
      <p className="hint">Try lr = 0.5 (jumps too far, error flips sign).</p>
    </>
  );
}

function Chart({ data, w }) {
  const W = 480, H = 300, P = 36;
  const mx = Math.max(4, ...data.map((d) => d.x)) + 1;
  const vals = data.flatMap((d) => [d.y, w * d.x]).filter(Number.isFinite);
  const my = Math.max(10, ...vals) * 1.1;
  const sx = (v) => P + (v / mx) * (W - 2 * P);
  const sy = (v) => H - P - (Math.max(0, Math.min(v, my)) / my) * (H - 2 * P);
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Original and predicted data">
        <line x1={P} y1={H - P} x2={W - P} y2={H - P} stroke="#9aa7b4" />
        <line x1={P} y1={P} x2={P} y2={H - P} stroke="#9aa7b4" />
        <text x={W - P} y={H - 10} fontSize="12" textAnchor="end" fill="#5d6b78">x</text>
        <text x={8} y={P} fontSize="12" fill="#5d6b78">y</text>
        <line x1={sx(0)} y1={sy(0)} x2={sx(mx)} y2={sy(w * mx)} stroke="#b7791f" strokeWidth="2" />
        {data.map((d, i) => (
          <g key={i}>
            <line x1={sx(d.x)} y1={sy(d.y)} x2={sx(d.x)} y2={sy(w * d.x)} stroke="#c2362b" strokeDasharray="3 3" />
            <circle cx={sx(d.x)} cy={sy(d.y)} r="6" fill="#2457d6" />
            <circle cx={sx(d.x)} cy={sy(w * d.x)} r="5" fill="#fff" stroke="#b7791f" strokeWidth="2" />
          </g>
        ))}
      </svg>
      <div className="legend">
        <span><i style={{ background: "#2457d6" }} />original y</span>
        <span><i style={{ background: "#fff", border: "2px solid #b7791f" }} />predicted (w * x)</span>
        <span><i style={{ background: "#c2362b" }} />error</span>
      </div>
    </>
  );
}

function Stage4() {
  const start = [{ x: 1, y: 3 }, { x: 2, y: 7 }, { x: 3, y: 9 }];
  const [data, setData] = useState(start);
  const [w, setW] = useState(1);
  const [lr, setLr] = useState(0.05);
  const [epochs, setEpochs] = useState(0);
  const [nx, setNx] = useState(4);
  const [ny, setNy] = useState(12);
  const [tx, setTx] = useState(10);
  const [ev, setEv] = useState({ predictions: [], loss: 0 });
  const [tp, setTp] = useState(null);
  const [warn, setWarn] = useState("");
  useEffect(() => { api("evaluate", { w, data }).then(setEv).catch(() => {}); }, [w, data]);
  useEffect(() => { api("forward", { w, x: tx }).then((r) => setTp(r.prediction)).catch(() => {}); }, [w, tx]);
  const train = async (n) => {
    const r = await api("train", { w, data, lr, epochs: n });
    setWarn(r.diverged ? "w blew up, so the backend stopped. Lower lr." : "");
    if (!r.diverged) { setW(r.w); setEpochs(epochs + n); }
  };
  return (
    <>
      <Chart data={data} w={w} />
      <div className="big">
        epoch {epochs}   w = <b>{f(w)}</b>   loss = <b className={ev.loss < 1 ? "good" : "bad"}>{f(ev.loss)}</b>
        {warn && <><br /><span className="bad">{warn}</span></>}
      </div>
      <button className="act" onClick={() => train(1)}>1 epoch</button>
      <button className="act" onClick={() => train(50)}>50 epochs</button>
      <button className="act ghost" onClick={() => { setW(1); setEpochs(0); setWarn(""); }}>Reset w</button>
      <div className="row"><label>lr</label><input type="number" step="0.01" value={lr} onChange={(e) => setLr(+e.target.value)} /></div>
      <h2>Add a data point</h2>
      <div className="row">
        <label>x</label><input type="number" value={nx} onChange={(e) => setNx(+e.target.value)} />
        <label>y</label><input type="number" value={ny} onChange={(e) => setNy(+e.target.value)} />
        <button className="act" onClick={() => setData([...data, { x: nx, y: ny }])}>Add</button>
        <button className="act ghost" onClick={() => { setData(start); setW(1); setEpochs(0); setWarn(""); }}>Reset data</button>
      </div>
      <table>
        <thead><tr><th>x</th><th>y original</th><th>predicted</th><th>error</th><th /></tr></thead>
        <tbody>{data.map((d, i) => {
          const p = ev.predictions[i];
          return (
            <tr key={i}><td>{d.x}</td><td>{d.y}</td><td>{p === undefined ? "" : f(p)}</td><td>{p === undefined ? "" : f(p - d.y)}</td>
              <td><button className="x" aria-label="Remove" onClick={() => setData(data.filter((_, j) => j !== i))}>x</button></td></tr>
          );
        })}</tbody>
      </table>
      <h2 style={{ marginTop: 14 }}>Test a new input</h2>
      <div className="row">
        <label>x</label><input type="number" value={tx} onChange={(e) => setTx(+e.target.value)} />
        <span className="big" style={{ margin: 0 }}>prediction = {f(w)} * {tx} = <b>{tp === null ? "..." : f(tp)}</b></span>
      </div>
    </>
  );
}

export default function App() {
  const [i, setI] = useState(0);
  const [up, setUp] = useState(true);
  useEffect(() => { fetch("/api/health").then((r) => setUp(r.ok)).catch(() => setUp(false)); }, [i]);
  const Stage = [Stage1, Stage2, Stage3, Stage4][i];
  return (
    <>
      <header>
        <h1>Neural Lab: one neuron, built step by step</h1>
        <div className="tabs">
          {INFO.map((t, k) => (
            <button key={k} className={"tab" + (k === i ? " on" : "")} onClick={() => setI(k)}>
              {k + 1}. {t[0]}
            </button>
          ))}
        </div>
      </header>
      {!up && <div className="banner">Backend not reachable. Start it: <code>cd backend && uvicorn main:app --reload --port 8000</code></div>}
      <main>
        <section className="code">
          <h2>Backend code (Python)</h2>
          <p>{INFO[i][1]}</p>
          <pre>{CODE[i]}</pre>
        </section>
        <section className="play">
          <h2>Play area</h2>
          <p className="hint">Change values and see the result instantly.</p>
          <Stage key={i} />
        </section>
      </main>
    </>
  );
}
