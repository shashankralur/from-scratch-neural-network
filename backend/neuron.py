"""neuron.py - a neural network built one piece at a time (no libraries)."""
import math

# ===== 1. A neuron is a function
def neuron(w, x):
    return w * x                      # w is the knob


# ===== 2. Error: how wrong is the prediction?
def error(w, x, y):
    return neuron(w, x) - y           # negative = too low, positive = too high


# ===== 3. Loss: turn "how wrong" into one number
def loss(w, x, y):
    return 0.5 * error(w, x, y) ** 2  # squared, so it is never negative


# ===== 4. One learning step
def step(w, x, y, lr):
    slope = error(w, x, y) * x        # if w goes up by 1, error goes up by x
    return w - lr * slope             # move AGAINST the slope


# ===== 5. Repeat the step: the training loop
def train_one(w, x, y, lr, steps):
    history = [{"w": w, "loss": loss(w, x, y)}]
    for _ in range(steps):
        w = step(w, x, y, lr)
        history.append({"w": w, "loss": loss(w, x, y)})
        if abs(w) > 1e6:              # lr too big: numbers exploding
            break
    return history


# ===== 6. Many examples (one epoch = one pass over all the data)
def train(w, data, lr, epochs):
    history = []
    for _ in range(epochs):
        for x, y in data:
            w = step(w, x, y, lr)
        history.append(sum(loss(w, x, y) for x, y in data))
        if abs(w) > 1e6:
            break
    return w, history


# ===== 7. Bias: a number added at the end, so the line need not pass through 0
def neuron_b(w, b, x):
    return w * x + b

def train_b(w, b, data, lr, epochs, use_bias=True):
    history = []
    for _ in range(epochs):
        for x, y in data:
            e = neuron_b(w, b, x) - y
            w -= lr * e * x
            if use_bias:
                b -= lr * e           # the bias input is always 1
        history.append(sum(0.5 * (neuron_b(w, b, x) - y) ** 2 for x, y in data))
        if abs(w) > 1e6 or abs(b) > 1e6:
            break
    return w, b, history


# ===== 8. Weighted sum: many inputs, one weight each
def neuron_n(ws, b, xs):
    return sum(w * x for w, x in zip(ws, xs)) + b

def train_n(ws, b, rows, lr, epochs):
    history = []
    for _ in range(epochs):
        for xs, y in rows:
            e = neuron_n(ws, b, xs) - y
            ws = [w - lr * e * x for w, x in zip(ws, xs)]
            b -= lr * e
        history.append(sum(0.5 * (neuron_n(ws, b, xs) - y) ** 2 for xs, y in rows))
        if any(abs(v) > 1e6 for v in [*ws, b]):
            break
    return ws, b, history


# ===== 9. Activation: squash the sum into 0..1 (sigmoid)
def sigmoid(z):
    z = max(-60, min(60, z))
    return 1 / (1 + math.exp(-z))

def neuron_s(ws, b, xs):
    return sigmoid(neuron_n(ws, b, xs))

def train_s(ws, b, rows, lr, epochs):
    history = []
    for _ in range(epochs):
        for xs, y in rows:
            a = neuron_s(ws, b, xs)
            dz = (a - y) * a * (1 - a)   # chain rule: error * sigmoid slope
            ws = [w - lr * dz * x for w, x in zip(ws, xs)]
            b -= lr * dz
        history.append(sum(0.5 * (neuron_s(ws, b, xs) - y) ** 2 for xs, y in rows))
    return ws, b, history
