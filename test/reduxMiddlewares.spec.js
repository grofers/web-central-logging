/* eslint-disable no-unused-expressions */

import sinon from 'sinon';
import chai, { expect } from 'chai';
import Logger from '../src/Logger';

import { actionLogger, crashReporter } from '../src/reduxMiddlewares';

const should = chai.should();

describe('actionLogger', () => {
    it('should logs actions', () => {
        const state = { key: 'value' };
        const clock = sinon.useFakeTimers();
        const store = {
            getState: sinon.stub().returns(state),
        };
        const next = sinon.spy();
        const action1 = { type: 'MOCK_ACTION' };
        const action2 = { type: 'MOCK_ACTION2' };
        const __send__ = sinon.spy();
        const logger = new Logger({
            url: 'mock',
            maxBufferLength: 2,
            __send__,
            sessionIdRequired: false,
        });
        actionLogger(logger)(store)(next)(action1);
        actionLogger(logger)(store)(next)(action2);

        const expectedLogs = [{
            timestamp: Date.now(), // fake time
            extra: {},
            state: {},
            level: 'info',
            action: action1,
        }, {
            timestamp: Date.now(),
            extra: {},
            state: {},
            level: 'info',
            action: action2,
        }];

        next.calledTwice.should.be.true;
        next.getCalls()[0].args[0].should.be.eql(action1);
        next.getCalls()[1].args[0].should.be.eql(action2);
        __send__.calledOnce.should.be.true;
        __send__.calledWith(expectedLogs).should.be.true;
        clock.restore();
    });
});

describe('Crash reporter', () => {
    let clock;
    let reportStub;
    let logger;
    const action = { type: 'MOCK_ACTION' };
    const store = {
        getState() {},
    };

    before(() => { clock = sinon.useFakeTimers(); });
    after(() => clock.restore());
    beforeEach(() => {
        reportStub = sinon.stub(Logger.prototype, 'report');
        logger = new Logger({
            url: 'mock',
            maxBufferLength: 2,
        });
    });
    afterEach(() => reportStub.restore());

    it('should do nothing if no error is thrown', () => {
        const next = sinon.spy();
        crashReporter(logger)(store)(next)(action);
        next.called.should.be.true;
        reportStub.called.should.be.false;
    });

    it('should report error and throw it', () => {
        const next = sinon.stub().throws();
        expect(() => crashReporter(logger)(store)(next)(action)).to.throw();
        next.called.should.be.true;
        reportStub.called.should.be.true;
    });
});
