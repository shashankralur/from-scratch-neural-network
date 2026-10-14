import { useEffect, useState } from "react";
import CodePanel from "./components/CodePanel";
import { STAGES } from "./stages";

export default function App() {
  const [i, setI] = useState(0);
  const [up, setUp] = useState(true);
  useEffect(() => { fetch("/api/health").then((r) => setUp(r.ok)).catch(() => setUp(false)); }, [i]);
  const { View, title, hint } = STAGES[i];
  return (
    <>
      <header>
        <h1>Neural Lab: one neuron, built step by step</h1>
        <div className="tabs" role="tablist">
          {STAGES.map((s, k) => (
            <button key={k} role="tab" aria-selected={k === i} title={s.title} className={"tab" + (k === i ? " on" : "")} onClick={() => setI(k)}>{k + 1}</button>
          ))}
        </div>
      </header>
      {!up && <div className="banner">Backend not reachable. Start it: <code>cd backend && uvicorn main:app --reload --port 8000</code></div>}
      <main>
        <CodePanel stage={i} />
        <section className="play">
          <h2>Stage {i + 1}: {title}</h2>
          <p className="hint">{hint}</p>
          <View key={i} />
          <div className="nav">
            <button className="act ghost" disabled={i === 0} onClick={() => setI(i - 1)}>Previous</button>
            <button className="act" disabled={i === STAGES.length - 1} onClick={() => setI(i + 1)}>Next stage</button>
          </div>
        </section>
      </main>
    </>
  );
}
