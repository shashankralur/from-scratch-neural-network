# Backend: the neuron lives here in plain Python (same code as our lessons).
import math
from typing import List
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class Point(BaseModel):
    x: float
    y: float


class ForwardIn(BaseModel):
    w: float
    x: float


class ErrorIn(ForwardIn):
    y: float


class StepIn(ErrorIn):
    lr: float


class DataIn(BaseModel):
    w: float
    data: List[Point]


class TrainIn(DataIn):
    lr: float
    epochs: int


# ---- the neuron, built piece by piece ----
def neuron(w, x):
    return w * x                       # Lesson 1


def get_error(w, x, y):
    return neuron(w, x) - y            # Lesson 2


def update(w, x, y, lr):
    error = get_error(w, x, y)
    slope = error * x                  # Lesson 3/4: error moves by x
    return w - lr * slope, error, slope


# ---- API ----
@app.get("/api/health")
def health():
    return {"ok": True}


@app.post("/api/forward")
def forward(b: ForwardIn):
    return {"prediction": neuron(b.w, b.x)}


@app.post("/api/error")
def error(b: ErrorIn):
    e = get_error(b.w, b.x, b.y)
    direction = "up" if e < 0 else "down" if e > 0 else "stay"
    return {"prediction": neuron(b.w, b.x), "error": e, "direction": direction}


@app.post("/api/step")
def step(b: StepIn):
    new_w, e, slope = update(b.w, b.x, b.y, b.lr)
    if not math.isfinite(new_w):
        new_w = b.w
    return {"w": new_w, "prediction": neuron(b.w, b.x), "error": e, "slope": slope}


@app.post("/api/train")
def train(b: TrainIn):
    w, diverged = b.w, False
    for _ in range(max(0, min(b.epochs, 5000))):
        for p in b.data:
            w, _, _ = update(w, p.x, p.y, b.lr)
        if abs(w) > 1e9:               # learning rate too big
            diverged = True
            break
    return {"w": b.w if diverged else w, "diverged": diverged}


@app.post("/api/evaluate")
def evaluate(b: DataIn):
    preds = [neuron(b.w, p.x) for p in b.data]
    loss = sum((q - p.y) ** 2 for q, p in zip(preds, b.data))
    return {"predictions": preds, "loss": loss}
