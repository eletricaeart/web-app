import React from "react";
import "./EAText.css";
import View from "./layout/View";

export default function EAText({
  children,
  font,
  size = "2.5rem",
  color = "#ffab00",
  shadow = "#fff",
  shadowStroke = "10px",
  shadowTextColor = "#212329",
  center = false,
}) {
  const styleVariables = {
    "--text-color": color,
    "--shadow-color": shadow,
    "--shadow-stroke": shadowStroke,
    "--shadow-text-color": shadowTextColor,
    fontSize: size,
    fontFamily: font,
    textAlign: center ? "center" : "left",
    justifyContent: center ? "center" : "flex-start",
  };

  return (
    <View className="ea-text-container" style={styleVariables}>
      <span className="ea-text-main" data-text={children}>
        {children}
      </span>
    </View>
  );
}
