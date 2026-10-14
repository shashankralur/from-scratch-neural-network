import Stage1 from "./Stage1";
import Stage2 from "./Stage2";
import Stage3 from "./Stage3";
import Stage4 from "./Stage4";
import Stage5 from "./Stage5";
import Stage6 from "./Stage6";
import Stage7 from "./Stage7";
import Stage8 from "./Stage8";
import Stage9 from "./Stage9";

export const STAGES = [
  { title: "A neuron is a function", hint: "w is the knob. Move it and watch the line tilt.", View: Stage1 },
  { title: "How wrong is it?", hint: "error = prediction - y. The gap on the graph is the error.", View: Stage2 },
  { title: "Loss: one number", hint: "Square the error to get the loss. Plot it against w and you get a bowl.", View: Stage3 },
  { title: "One learning step", hint: "Move w against the slope of the bowl. One click, one step.", View: Stage4 },
  { title: "The training loop", hint: "Repeat the step. Compare learning rates.", View: Stage5 },
  { title: "Many examples", hint: "Train on your own data and compare original vs predicted.", View: Stage6 },
  { title: "Bias", hint: "Add b so the line can move up and down.", View: Stage7 },
  { title: "Weighted sum", hint: "Several inputs, one weight each.", View: Stage8 },
  { title: "Activation (sigmoid)", hint: "Squash the sum into 0..1 for yes/no answers.", View: Stage9 },
];
