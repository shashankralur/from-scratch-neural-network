# API layer: thin wrappers around neuron.py. All the learning logic is in neuron.py.
import math
from fastapi import FastAPI
import neuron as N

app = FastAPI()
LIMIT = 5000


def blown(history, *params):
    vals = [history[-1] if history else 0, *params]
    return any(not math.isfinite(v) or abs(v) > 1e6 for v in vals)


@app.get("/api/health")
def health():
    return {"ok": True}


@app.post("/api/forward")
def forward(b: dict):
    return {"prediction": N.neuron(b["w"], b["x"]) + b.get("b", 0)}


@app.post("/api/error")
def error(b: dict):
    e = N.error(b["w"], b["x"], b["y"])
    return {"prediction": N.neuron(b["w"], b["x"]), "error": e,
            "direction": "up" if e < 0 else "down" if e > 0 else "stay"}


@app.post("/api/loss-curve")
def loss_curve(b: dict):
    lo, hi, x, y = b["lo"], b["hi"], b["x"], b["y"]
    curve = [[lo + (hi - lo) * i / 80, N.loss(lo + (hi - lo) * i / 80, x, y)] for i in range(81)]
    return {"curve": curve, "loss": N.loss(b["w"], x, y), "error": N.error(b["w"], x, y)}


@app.post("/api/step")
def step(b: dict):
    w, x, y, lr = b["w"], b["x"], b["y"], b["lr"]
    e = N.error(w, x, y)
    return {"w": N.step(w, x, y, lr), "loss": N.loss(w, x, y), "error": e, "slope": e * x}


@app.post("/api/train-one")
def train_one(b: dict):
    return {"history": N.train_one(b["w"], b["x"], b["y"], b["lr"], min(b["steps"], LIMIT))}


@app.post("/api/train")
def train(b: dict):
    w, h = N.train(b["w"], b["data"], b["lr"], min(b["epochs"], LIMIT))
    return {"w": w, "history": h, "diverged": blown(h, w)}


@app.post("/api/train-b")
def train_b(b: dict):
    w, bias, h = N.train_b(b["w"], b["b"], b["data"], b["lr"], min(b["epochs"], LIMIT), b.get("use_bias", True))
    return {"w": w, "b": bias, "history": h, "diverged": blown(h, w, bias)}


@app.post("/api/train-n")
def train_n(b: dict):
    rows = list(zip(b["xs"], b["ys"]))
    fn = N.train_s if b.get("activation") == "sigmoid" else N.train_n
    ws, bias, h = fn(b["ws"], b["b"], rows, b["lr"], min(b["epochs"], LIMIT))
    return {"ws": ws, "b": bias, "history": h, "diverged": blown(h, *ws, bias)}


@app.post("/api/predict-batch")
def predict_batch(b: dict):
    act = b.get("activation", "none")
    zs = [N.neuron_n(b["ws"], b.get("b", 0), xs) for xs in b["xs"]]
    preds = [N.sigmoid(z) if act == "sigmoid" else z for z in zs]
    loss = sum(0.5 * (p - y) ** 2 for p, y in zip(preds, b.get("ys", [])))
    return {"zs": zs, "predictions": preds, "loss": loss}


@app.post("/api/sigmoid")
def sigmoid(b: dict):
    lo, hi = b["lo"], b["hi"]
    return {"curve": [[lo + (hi - lo) * i / 100, N.sigmoid(lo + (hi - lo) * i / 100)] for i in range(101)]}
