w = 5
data = [(1, 3), (2, 6), (3, 9)]

for x, y in data:
    prediction = w * x
    error = prediction - y
    print(f"x = {x}, y = {y}, w = {w}, prediction = {prediction}, error = {error}")
    w = w - error / x