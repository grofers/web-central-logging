/* eslint-disable no-unused-expressions */
import { expect } from 'chai';

import Buffer from '../src/Buffer';

describe('Buffer', () => {
    let buffer;

    beforeEach(() => {
        // eslint-disable-next-line no-buffer-constructor
        buffer = new Buffer(10);
    });

    it('should insert a value in buffer', () => {
        const item = { key: 'item' };
        expect(buffer.isEmpty()).to.be.true;
        buffer.push(item);
        expect(buffer.isEmpty()).to.be.false;
    });

    it('should shift the buffer', () => {
        const one = 1;
        const two = 2;
        const three = 3;

        buffer.push(one);
        buffer.push(two);
        expect(buffer.getBuffer()).to.be.eql([one, two]);
        buffer.shift();
        buffer.push(three);
        expect(buffer.getBuffer()).to.be.eql([two, three]);
    });

    it('should flush the buffer', () => {
        buffer.push(1);
        buffer.push(2);
        expect(buffer.isEmpty()).to.be.false;
        buffer.flush();
        expect(buffer.isEmpty()).to.be.true;
    });

    it('should not push new items when overflow', () => {
        const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        arr.forEach(curr => buffer.push(curr));
        expect(buffer.isFull()).to.be.true;
        expect(buffer.getBuffer()).to.be.eql(arr);
        buffer.push(11);
        expect(buffer.getBuffer()).to.be.eql(arr);
    });
});
