const config = require('../config');
const fs = require('fs-extra');
const chai = require('./helpers/chai');
const sinon = require('sinon');
const mocha = require('mocha');
const should = require('should');
const colors = require('colors');
const init = require('../controller/init');

const tempPortfolioPath = 'test/files/environment/andyn190.github.io/temp-portfolio.html';

describe('init', function () {
  afterEach(function () {
    if (console.log.restore) console.log.restore();
    if (init.portfolio.restore) init.portfolio.restore();
  });

  describe('portfolio', function () {
    it('should bail with incomplete help message if portfolio.html is not in web root', function (done) {
      var spy = sinon.spy(console, 'log');
      spy.withArgs(config.portfolio.help.incomplete.red);

      // within our test, there should be no file at portfolio.html //
      init.portfolio('portfolio.html');
      assert(spy.withArgs(config.portfolio.help.incomplete.red).calledOnce);
      done();
    });

    it('should bail with improperly id\'ed <ul> help message if <ul> with id portfolio not found in portfolio.html', function (done) {
      var spy = sinon.spy(console, 'log');
      spy.withArgs(config.portfolio.help.noPortfolioList.red);
      init.portfolio('test/files/environment/andyn190.github.io/no-portfolio-list-portfolio.html');
      assert(spy.withArgs(config.portfolio.help.noPortfolioList.red).calledOnce);
      done();
    });

    it('should load portfolio and replace end-body-tag with jQuery-cdn-script, portfolio-script and end-body-tag', function (done) {
      // for the test, make a copy of a pre-initialized portfolio.html //
      fs.copySync('test/files/environment/andyn190.github.io/portfolio.html', tempPortfolioPath);

      var html = fs.readFileSync(tempPortfolioPath, 'utf8');
      expect(html).to.not.have.string(init.jQueryCdnScript);
      expect(html).to.not.have.string(init.portfolioScript);
      init.portfolio(tempPortfolioPath);
      html = fs.readFileSync(tempPortfolioPath, 'utf8');
      expect(html).to.have.string(init.portfolioScript);
      done();
    });

    it('should bail with portfolio script exists help message if portfolio script exists', function (done) {
      var spy = sinon.spy(console, 'log');
      spy.withArgs(config.portfolio.help.portfolioScriptTagExists.red);

        var filepath = 'test/files/environment/andyn190.github.io/temp-portfolio.html';
      var html = fs.readFileSync(filepath, 'utf8');
      expect(html).to.have.string(init.jQueryCdnScript);
      expect(html).to.have.string(init.portfolioScript);
      init.portfolio(filepath);
      assert(spy.withArgs(config.portfolio.help.portfolioScriptTagExists.red).calledOnce);
      fs.unlinkSync(filepath);
      done();
    });
  });

  describe('website', function () {
    it('should download files listed in config.website.url, the portfolio.html file should include a <ul> with an id of portfolio, and the portfolio.html should be initialized', function (done) {
      init.website(function (err) {
        assert.isTrue(fs.existsSync('test/files/environment/andyn190.github.io/index.html'), 'We should have index.html in the root directory!');
        assert.isTrue(fs.existsSync('test/files/environment/andyn190.github.io/portfolio.html'), 'We should have portfolio.html in the root directory!');
        var html = fs.readFileSync('test/files/environment/andyn190.github.io/portfolio.html', 'utf8');
        expect(html).to.have.string(init.jQueryCdnScript);
        expect(html).to.have.string(init.portfolioScript);

        fs.unlinkSync('test/files/environment/andyn190.github.io/index.html');
        fs.unlinkSync('test/files/environment/andyn190.github.io/portfolio.html');
        done();
      });
    });
  });
});
