"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Timer = function () {
    function Timer(cb, ms) {
        _classCallCheck(this, Timer);

        this.cb = cb;
        this.ms = ms;
    }
    /**
     * once started it will not start new unless previous is canceled or finished
     * @param {*} args
     */


    _createClass(Timer, [{
        key: "start",
        value: function start() {
            var _this = this;

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            if (!this.ref) {
                this.ref = setTimeout(function () {
                    _this.cb.apply(_this, args);
                    _this.ref = undefined;
                }, this.ms);
            }
        }
    }, {
        key: "stop",
        value: function stop() {
            if (this.ref) clearTimeout(this.ref);
            this.ref = undefined;
        }
    }]);

    return Timer;
}();

exports.default = Timer;
//# sourceMappingURL=Timer.js.map