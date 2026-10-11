x = 2
y = 6
w = 2

prediction = w * x
error = prediction - y

print("w:", w, "prediction:", prediction, "error:", error)

if error < 0:
    w = w + 1
elif error > 0:
    w = w - 1
    
prediction = w * x
error = prediction - y

print("after:   w =", w, " error =", error)