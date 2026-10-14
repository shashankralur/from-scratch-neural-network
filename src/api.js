import { useEffect, useState } from "react";

export const api = (path, body) =>
  fetch("/api/" + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then((r) => {
    if (!r.ok) throw new Error(r.status);
    return r.json();
  });

// Calls the backend whenever the request body changes.
export function useCall(path, body) {
  const [res, setRes] = useState(null);
  const key = JSON.stringify(body);
  useEffect(() => {
    let live = true;
    api(path, body).then((d) => live && setRes(d)).catch(() => {});
    return () => { live = false; };
  }, [path, key]);
  return res;
}

// Holds parameters + loss history; train(n) asks the backend to train n epochs.
export function useTraining(init, call) {
  const [params, setParams] = useState(init);
  const [losses, setLosses] = useState([]);
  const [warn, setWarn] = useState("");
  const train = async (n) => {
    try {
      const r = await call(params, n);
      if (r.diverged) { setWarn("Numbers blew up, so that run was rejected. Lower lr."); return; }
      setWarn("");
      setParams(r.params);
      setLosses((l) => [...l, ...r.history]);
    } catch { setWarn("Backend not reachable."); }
  };
  const reset = (p = init) => { setParams(p); setLosses([]); setWarn(""); };
  return { params, losses, warn, train, reset };
}
