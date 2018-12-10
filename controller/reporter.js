// https://github.com/mochajs/mocha/wiki/Using-mocha-programmatically

const Mocha = require('mocha');
const fs = require('fs');
const path = require('path');

const mocha = new Mocha({
  reporter: 'json',
});

function report(testDir) {
  return new Promise((res, rej) => {
    const testFiles = fs.readdirSync(testDir);

    testFiles
      .filter(file => /.js$/.test(file))
      .forEach(file => mocha.addFile(path.join(testDir, file)));

    /*
     * Mocha writes reporter output to process.stdout.write,
     * but we don't want them outputting to the os tool.
     * https://github.com/mochajs/mocha/issues/138#issuecomment-82727410
     */
    const stdoutWriteCopy = process.stdout.write;
    process.stdout.write = () => {};

    const runner = mocha.run(() => {
      process.stdout.write = stdoutWriteCopy;
      res(runner.testResults);
    });
  });
}

module.exports = report;
