"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Buffer = function () {
    function Buffer(len) {
        _classCallCheck(this, Buffer);

        this.len = len;
        this.buffer = [];
    }

    _createClass(Buffer, [{
        key: "isEmpty",
        value: function isEmpty() {
            return !this.buffer.length;
        }
    }, {
        key: "isFull",
        value: function isFull() {
            return this.len <= this.buffer.length;
        }
    }, {
        key: "getBuffer",
        value: function getBuffer() {
            return this.buffer;
        }
    }, {
        key: "push",
        value: function push(val) {
            if (this.buffer.length < this.len) {
                this.buffer.push(val);
                return true;
            }
            return false;
        }
    }, {
        key: "shift",
        value: function shift() {
            this.buffer.shift();
        }
    }, {
        key: "flush",
        value: function flush() {
            this.buffer = [];
        }
    }]);

    return Buffer;
}();

exports.default = Buffer;
//# sourceMappingURL=Buffer.js.map