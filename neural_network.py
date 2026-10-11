x = 2
y = 10
w = 1

for step in range(5):
    prediction = w * x
    error = prediction - y
    print(f"step {step}: w = {w}, prediction = {prediction}, error = {error}")
    if error == 0:
        print(f"Found perfect at w = {w}")
        break
    w = w - error / x