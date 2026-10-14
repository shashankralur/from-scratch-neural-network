# neural_network.py: one neuron learning from noisy data

data = [(1, 3), (2, 7), (3, 9)]   # (x, y) pairs
w = 1.0                            # starting guess
lr = 0.05                          # learning rate: how big a step we take

for epoch in range(50):            # 50 passes over the data
    total_loss = 0

    for x, y in data:
        prediction = w * x         # forward: run the neuron
        error = prediction - y     # how wrong
        total_loss += error ** 2   # collect loss for printing

        slope = error * x          # how much the error changes if w changes
        w = w - lr * slope         # small step against the slope

    if epoch % 5 == 0:
        print(f"epoch {epoch:2d}  w = {w:.3f}  loss = {total_loss:.3f}")

print(f"final w = {w:.3f}")
print("prediction for x=10:", round(w * 10, 2))