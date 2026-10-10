w = 3

def neuron(w, x):
    return w * x


# predict the error
x = 2
y = 6

prediction = neuron(x)

error = prediction - y
print("prediction:", prediction)
print("error:", error)
