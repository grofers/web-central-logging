/* eslint-disable no-unused-expressions */

import sinon from 'sinon';
import chai from 'chai';

const should = chai.should();

import Timer from '../src/Timer';

describe('Timer', () => {
    let timer;
    let clock;
    let cb;
    const ms = 20000;
    before(() => clock = sinon.useFakeTimers());
    after(() => clock.restore());
    beforeEach(() => {
        cb = sinon.spy();
        timer = new Timer(cb, ms);
    });
    it('should start the timer', () => {
        const args = {key1: 'arg1', key2: 'arg2'};
        timer.start(...args);
        clock.tick(10);
        cb.called.should.be.false;
        clock.tick(20000);
        cb.called.should.be.true;
        cb.calledWith(...args).should.be.true;
    });
    it('should not call will new args', () => {
        const arg1 = ['arg1', 'arg2'];
        const arg2 = ['arg1', 'arg12', 'arg3'];
        timer.start(...arg1);
        timer.start(...arg2);
        clock.tick(20000);
        cb.calledOnce.should.be.true;
        cb.calledWith(...arg1).should.be.true;
        cb.calledWith(...arg2).should.not.be.true;
    });
    it('should stop the timer', () => {
        timer.start();
        timer.stop();
        clock.tick(20000);
        cb.called.should.be.false;
    });
    it('should restart timer', () => {
        timer.stop();
        timer.start();
        clock.tick(20000);
        cb.called.should.be.true;
    })
});
