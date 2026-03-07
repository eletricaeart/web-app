const _ = (...v) => console.log(...v),
  x = "this is$ a te$st!";
_(x.split("$").join(""));
_(x.replace(/\$/g, ""));
_(x.replaceAll("$", ""));

//exports.replaceStr = ( text2BReplaced, text2BInserted ) => {
//   return(  );
//};
