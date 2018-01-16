/* eslint-disable no-unused-expressions */

import express from 'express';
import bodyParser from 'body-parser';
import chai from 'chai';
import request from 'supertest';
import sinon from 'sinon';

import syslogsLogger, { sendLogs } from '../src/syslogsLogger';


const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/logs', syslogsLogger('myApp'));


const expect = chai.expect;

describe('syslogsLogger', () => {
    it('should send a status of 422 if no message is sent', (done) => {

        request(app)
            .post('/logs')
            .send({}) // no message
            .expect(422, done);
    });
    it('should send a status of 200 if correct body is sent', (done) => {
        request(app)
            .post('/logs')
            .send({
                message: [{
                    level: 'info',
                    action: 'MOCK_ACTION',
                }],
                sessionId: 'uxirbi35',
            })
            .expect(200, done);
    });
    it('should thow an error if name is not provided', () => {
        expect(() => syslogsLogger()).to.throw();
    });
    it('should call next with error if wrong message is sent', () => {
        const next = sinon.spy();
        const sysLogger = syslogsLogger('mylogger');
        const req = { body: { message: 4 } };
        sysLogger(req, {}, next);
        expect(next.calledOnce).to.be.true;
        expect(next.getCalls()[0].args[0]).to.be.a('Error');
    });
});

describe('sendLogs', () => {
    it('should send a error if wrong level is sent', () => {
        const logger = {
            error: sinon.spy(),
        }
        sendLogs({ message: { level: 'asd' } }, logger);
        expect(logger.error.called).to.be.true;
    });
    it('should send a debug log if no level is set', () => {
        const logger = {
            debug: sinon.spy(),
        }
        sendLogs({ message: { } }, logger);
        expect(logger.debug.called).to.be.true;
    });
    it('should throw an error if message is not a object', () => {
        expect(() => sendLogs({})).to.throw();
    });
});
