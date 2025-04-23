const roundTo = require("round-to");

//小数第３位を四捨五入
var padding = function (value) {
  if (isNaN(parseFloat(value))) {
    return "-";
  }
  return roundTo(value, 2).toPrecision(3);
};

var round = function (value) {
  return roundTo(value, 2);
};

module.exports = {
  padding,
  round,
};
