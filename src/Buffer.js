class Buffer {
    constructor(len) {
        this.len = len;
        this.buffer = [];
    }

    isEmpty() {
        return !this.buffer.length;
    }

    isFull() {
        return this.len <= this.buffer.length;
    }

    getBuffer() {
        return this.buffer;
    }

    push(val) {
        if (this.buffer.length < this.len) {
            this.buffer.push(val);
            return true;
        }
        return false;
    }

    shift() {
        this.buffer.shift();
    }

    flush() {
        this.buffer = [];
    }
}

export default Buffer;
