class Timer {
    constructor(cb, ms) {
        this.cb = cb;
        this.ms = ms;
    }
    /**
     * once started it will not start new unless previous is canceled or finished
     * @param {*} args
     */
    start(...args) {
        if (!this.ref) {
            this.ref = setTimeout(() => {
                this.cb(...args);
                this.ref = undefined;
            }, this.ms);
        }
    }
    stop() {
        if (this.ref) clearTimeout(this.ref);
        this.ref = undefined;
    }
}

export default Timer;
