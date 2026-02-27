import React from "react";

export default function View({
  tag: Tag = "div",
  bg,
  flex,
  grid,
  w,
  h,
  m,
  pd,
  children,
  ...props
}) {
  const style = {
    ...(bg && { background: bg }),
    ...(flex && { display: "flex" }),
    ...(grid && { display: "grid" }),
    ...(w && { width: w }),
    ...(h && { height: h }),
    ...(m && { margin: m }),
    ...(pd && { padding: pd }),
    ...props.style,
  };

  return (
    <>
      <Tag style={style} {...props}>
        {children}
      </Tag>
    </>
  );
}
