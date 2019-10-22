const chai = require("chai");
const chaiHttp = require('chai-http');
const nock = require("nock");
const mocha = require("mocha");
const expect = chai.expect;
const should = chai.should();

const server = require("../src/index.js");

// const data = require("./mock.json");
chai.use(chaiHttp);

describe('Index.js', () => {

    //sample test
    describe('GET /', () => {
        it('it should send the index.html page', () => {
          chai.request(server)
              .get('/') 
              .end((err, res) => {
                    res.should.have.status(200);
              });
        });
    });
})


