import { useState } from "react";
import Chart, { BLUE, AMBER } from "../components/Chart";
import { Slider, Readout, fmt } from "../components/Controls";
import { useCall } from "../api";

export default function Stage1() {
  const [w, setW] = useState(2), [x, setX] = useState(3);
  const r = useCall("forward", { w, x });
  return (
    <>
      <Slider label="w" value={w} set={setW} min={-5} max={5} />
      <Slider label="x" value={x} set={setX} min={0} max={10} />
      <Readout>prediction = w * x = {w} * {x} = <b>{r ? fmt(r.prediction) : "..."}</b></Readout>
      <Chart xd={[0, 10]} yd={[-50, 50]} xl="x (input)" yl="prediction"
        lines={[{ pts: [[0, 0], [10, w * 10]], color: BLUE }]}
        dots={[{ x, y: r ? r.prediction : NaN, color: AMBER }]}
        legend={[{ label: "prediction = w * x (w is the slope)", color: BLUE }, { label: "your x", color: AMBER }]} />
    </>
  );
}
