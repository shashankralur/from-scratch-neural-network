x = 2
y = 6
w = 1

prediction = w * x
error = prediction - y

print("w:", w, "prediction:", prediction, "error:", error)

if error < 0:
    print("too low, so move w UP")
elif error > 0:
    print("too high, so move w DOWN")
else:
    print("perfect, so stay")