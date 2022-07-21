/* global describe it expect before beforeEach afterEach */
require("mocha");
require("should");
const clc = require("cli-color");
const fs = require("fs");
const _ = require("lodash");
const util = require("util");
const sinon = require("sinon");
const prompt = require("prompt");
const rimraf = require("rimraf");
const process = require("process");
const fsJson = require("fs-json")();
const expect = require("chai").expect;
const bddStdin = require("bdd-stdin");
const proxyquire = require("proxyquire");
const changeCase = require("change-case");

const fakeHelpers = require("./helpers/fakeHelpers");

const {
  dummySession,
  dummySessions,
  dummySessions3,
} = require("./helpers/dummyData");

const sessions = proxyquire("../controller/sessions", {
  "./helpers": fakeHelpers,
  "./github": fakeHelpers,
  "./env": {
    home: fakeHelpers.home,
  },
});

describe("sessions", function () {
  describe("#pluckSession()", function () {
    it("should pluck desired session", function () {
      const name = dummySessions[0].title;
      const pluckedSession = sessions.pluckSession(name, dummySessions);
      expect(pluckedSession).to.eql(dummySessions[0]);
    });

    it("should pluck desired session", function () {
      const name = dummySessions[1].title;
      const pluckedSession = sessions.pluckSession(name, dummySessions);
      expect(pluckedSession).to.eql(dummySessions[1]);
    });

    it("should pluck desired session", function () {
      const name = dummySessions[2].title;
      const pluckedSession = sessions.pluckSession(name, dummySessions);
      expect(pluckedSession).to.eql(dummySessions[2]);
    });
  });

  describe("#selectSession()", function () {
    it("should select session", function (done) {
      bddStdin(bddStdin.keys.left, "\n", "y\n");
      sessions
        .selectSession(JSON.stringify(dummySessions))
        .then(function (response) {
          console.log(response);
          expect(response).to.be.an.object;
          expect(response.session).to.eql(dummySessions[0]);
          done();
        });
    });

    it("should select correct session", function (done) {
      bddStdin(bddStdin.keys.left, bddStdin.keys.down, "\n", "y\n");
      sessions
        .selectSession(JSON.stringify(dummySessions))
        .then(function (response) {
          expect(response).to.be.an.object;
          expect(response.session).to.eql(dummySessions[1]);
          done();
        });
    });
  });

  describe("#pluckSession()", function () {
    it("should pluck desired fsd session", function () {
      console.log(dummySessions);
      const name = dummySessions[2].title;
      const pluckedSession = sessions.pluckSession(name, dummySessions);
      expect(pluckedSession).to.eql(dummySessions[2]);
    });

    it("should not pluck desired fsd session", function () {
      const name = dummySessions[0].title;
      const pluckedSession = sessions.pluckSession(name, dummySessions);
      expect(pluckedSession).to.eql(dummySessions[0]);
    });
  });

  describe("#selectSession#()", function () {
    it("should select session", function (done) {
      bddStdin(bddStdin.keys.left, "\n", "y\n");
      sessions
        .selectSession(JSON.stringify(dummySessions3))
        .then(function (response) {
          console.log(response);
          expect(response).to.be.an.object;
          expect(response.session).to.eql(dummySessions3[0]);
          done();
        });
    });

    it("should select correct session", function (done) {
      bddStdin(bddStdin.keys.left, bddStdin.keys.down, "\n", "y\n");
      sessions
        .selectSession(JSON.stringify(dummySessions3))
        .then(function (response) {
          expect(response).to.be.an.object;
          expect(response.session).to.eql(dummySessions3[1]);
          done();
        });
    });
  });
});
