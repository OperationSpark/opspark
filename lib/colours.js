const cliColor = require('cli-color');

const colours = {
  red: cliColor.red,
  green: cliColor.green,
  blue: cliColor.blue,
  yellow: cliColor.yellow,
  magenta: cliColor.magenta,
  cyan: cliColor.cyan,
  white: cliColor.white,
  black: cliColor.black,
  bgRed: cliColor.bgRed,
  bgGreen: cliColor.bgGreen,
  bgBlue: cliColor.bgBlue,
  bgYellow: cliColor.bgYellow,
  bgMagenta: cliColor.bgMagenta,
  bgCyan: cliColor.bgCyan,
  bgWhite: cliColor.bgWhite,
  bgBlack: cliColor.bgBlack,
};

Object.entries(colours).forEach(([colorName, method]) => {
  // eslint-disable-next-line no-extend-native
  String.prototype[colorName] = function () {
    return method(this);
  };
});
