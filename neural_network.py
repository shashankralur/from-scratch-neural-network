x = 2
y = 6
w = 1

for step in range(5):
    prediction = w * x
    error = prediction - y
    print(f"step {step} and prediction: {prediction} and error is {error}")
    if error < 0:
        w = w + 1
    elif error > 0:
        w = w - 1
    else:
        print(f"Found perfect at w = {w}")