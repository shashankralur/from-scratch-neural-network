import { useEffect, useRef } from "react";
import raw from "../../backend/neuron.py?raw";

// The panel shows the REAL backend/neuron.py, split at the "# =====" markers.
const [head, ...parts] = raw.split(/^# ===== /m);
const sections = parts.map((p) => {
  const i = p.indexOf("\n");
  return { title: p.slice(0, i).trim(), body: p.slice(i + 1).trimEnd() };
});

export default function CodePanel({ stage }) {
  const box = useRef(null), cur = useRef(null);
  useEffect(() => {
    if (box.current && cur.current) box.current.scrollTo({ top: cur.current.offsetTop - 44, behavior: "smooth" });
  }, [stage]);
  return (
    <section className="code" ref={box} aria-label="Code">
      <div className="fname">backend/neuron.py <span>the real file, it grows each stage</span></div>
      <pre className="head">{head.trim()}</pre>
      {sections.slice(0, stage + 1).map((s, i) => (
        <div key={i} ref={i === stage ? cur : null} className={"sec" + (i === stage ? " now" : "")}>
          <div className="sectitle">{i === stage && <em>NEW</em>}{i + 1}. {s.title}</div>
          <pre>{s.body}</pre>
        </div>
      ))}
    </section>
  );
}
