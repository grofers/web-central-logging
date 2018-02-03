/* eslint-disable no-unused-expressions */

import sinon from 'sinon';
import chai, { expect } from 'chai';
import Logger from '../src/Logger';

import { actionLogger, crashReporter } from '../src/reduxMiddlewares';

const should = chai.should();

const action1 = { type: 'MOCK_ACTION' };
const action2 = { type: 'MOCK_ACTION2' };
const state = { key: 'value' };
const state2 = { key: 'value2' };

describe('actionLogger', () => {
    let clock;
    let store;
    let next;
    let logger;
    let getState;

    beforeEach(() => {
        clock = sinon.useFakeTimers();
        getState = sinon
            .stub()
            .onCall(0)
            .returns(state)
            .onCall(1)
            .returns(state2);
        store = {
            getState
        };
        next = sinon.spy();

        logger = new Logger({
            url: 'mock',
        });
    });

    after(() => {
        clock.restore();
    });

    it('should logs actions', () => {
        actionLogger(logger)(store)(next)(action1);
        getState.resetHistory();
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

        logger.buffer.getBuffer().should.be.eql(expectedLogs);
        clock.restore();
    });

    it('should add filters properly', () => {
        actionLogger(logger, () => null)(store)(next)(action1);
        actionLogger(logger, () => null)(store)(next)(action2);

        let expectedBuffer = [];
        logger.buffer.getBuffer().should.be.eql(expectedBuffer);

        const actionFilter = f => f;
        const stateFilter = f => f;

        getState.resetHistory();
        actionLogger(logger, actionFilter, stateFilter)(store)(next)(action1);

        getState.resetHistory();
        actionLogger(logger, actionFilter, stateFilter)(store)(next)(action1);

        expectedBuffer = [{
            timestamp: Date.now(), // fake time
            extra: {},
            state: {
                before: state,
                after: state2,
            },
            level: 'info',
            action: action1,
        }, {
            timestamp: Date.now(),
            extra: {},
            state: {
                before: state,
                after: state2,
            },
            level: 'info',
            action: action1,
        }];
        logger.buffer.getBuffer().should.be.eql(expectedBuffer);
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
