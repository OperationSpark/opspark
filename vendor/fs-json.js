const fs = require('fs');
// https://github.com/OperationSpark/fs-json/blob/master/index.js
module.exports = function () {
  const _util = {
    /**
     *
     * @param {string} filepath Relative path to file
     * @param {object|Array} data
     */
    saveSync(filepath, data) {
      fs.writeFileSync(filepath, JSON.stringify(data));
      return _util;
    },

    /**
     *
     * @param {string} filepath
     * @returns *
     */
    loadSync(filepath) {
      let parsed;
      if (fs.existsSync(filepath)) {
        const data = fs.readFileSync(filepath, 'utf8');
        try {
          parsed = JSON.parse(data);
        } catch (err) {
          return onErr(`Error parsing JSON: ${err}`);
        }
      }
      return parsed;
    }
  };
  return _util;
};

/**
 * Error handler
 * @param {string} err
 * @returns {number} exit code
 */
function onErr(err) {
  console.log(err);
  return 1;
}
