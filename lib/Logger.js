'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _isomorphicFetch = require('isomorphic-fetch');

var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

var _Buffer = require('./Buffer');

var _Buffer2 = _interopRequireDefault(_Buffer);

var _Timer = require('./Timer');

var _Timer2 = _interopRequireDefault(_Timer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Logger = function () {
    function Logger(_ref) {
        var url = _ref.url,
            _ref$maxBufferLength = _ref.maxBufferLength,
            maxBufferLength = _ref$maxBufferLength === undefined ? 100 : _ref$maxBufferLength,
            _ref$automaticFlush = _ref.automaticFlush,
            automaticFlush = _ref$automaticFlush === undefined ? true : _ref$automaticFlush,
            _ref$overwriteBuffer = _ref.overwriteBuffer,
            overwriteBuffer = _ref$overwriteBuffer === undefined ? true : _ref$overwriteBuffer,
            _ref$fetchConfig = _ref.fetchConfig,
            fetchConfig = _ref$fetchConfig === undefined ? {} : _ref$fetchConfig,
            _ref$sessionIdRequire = _ref.sessionIdRequired,
            sessionIdRequired = _ref$sessionIdRequire === undefined ? true : _ref$sessionIdRequire,
            __send__ = _ref.__send__,
            _ref$fireOnGlobalErro = _ref.fireOnGlobalErrors,
            fireOnGlobalErrors = _ref$fireOnGlobalErro === undefined ? true : _ref$fireOnGlobalErro,
            interval = _ref.interval;

        _classCallCheck(this, Logger);

        if (!(this instanceof Logger)) {
            return new Logger({});
        }
        if (typeof url === 'undefined' && typeof __send__ === 'undefined') {
            throw new Error('either set url or __send__');
        }

        this.maxBufferLength = maxBufferLength;
        this.automaticFlush = automaticFlush;
        this.overwriteBuffer = overwriteBuffer;
        this.interval = interval;
        this.fetchConfig = fetchConfig;
        this.url = url;
        this.sessionIdRequired = sessionIdRequired;
        this.extraParams = {};
        this.flush = this.flush.bind(this);
        this._onErrorHandlerInstalled = false;

        // eslint-disable-next-line no-buffer-constructor
        this.buffer = new _Buffer2.default(maxBufferLength);
        this.hooks = [];
        this.timer = new _Timer2.default(this.flush, interval);

        if (fireOnGlobalErrors) this.registerErrorHandler();
        if (__send__ && typeof __send__ === 'function') this.__send__ = __send__;
    }

    _createClass(Logger, [{
        key: '_bufferUp',
        value: function _bufferUp(log, state, level, extra) {
            var buffer = this.buffer,
                overwriteBuffer = this.overwriteBuffer;


            if (buffer.isFull()) {
                // if overwriteBuffer set to false, silently drop all new logs
                if (overwriteBuffer) buffer.shift();
            }

            if (log) {
                buffer.push({
                    timestamp: Date.now(),
                    state: state,
                    extra: extra,
                    level: level,
                    action: log
                });
            }
        }
    }, {
        key: 'registerErrorHandler',
        value: function registerErrorHandler() {
            if (typeof window !== 'undefined') {
                if (this._onErrorHandlerInstalled) {
                    return;
                }
                var self = this;
                this._oldOnerrorHandler = window.error;
                window.onerror = function handleGlobalError() {
                    self.flush();
                    if (self._oldOnerrorHandler) {
                        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                            args[_key] = arguments[_key];
                        }

                        return self._oldOnerrorHandler.apply(this, args);
                    }
                    return false;
                };
                this._onErrorHandlerInstalled = true;
            }
        }
    }, {
        key: 'report',
        value: function report(level, log, state) {
            var automaticFlush = this.automaticFlush,
                interval = this.interval,
                buffer = this.buffer,
                extraParams = this.extraParams;

            this._bufferUp(log, state, level, extraParams);
            if (automaticFlush) {
                if (buffer.isFull()) {
                    this.flush();
                } else if (interval) {
                    this.timer.start();
                }
            }
        }
    }, {
        key: 'setSessionId',
        value: function setSessionId(id) {
            this.sessionId = id;
            return this;
        }
    }, {
        key: 'unsetSessionId',
        value: function unsetSessionId() {
            this.sessionId = undefined;
        }
    }, {
        key: 'setExtraParams',
        value: function setExtraParams(key, value) {
            if (!key) throw new Error('Key is undefined');
            this.extraParams[key] = value;
        }
    }, {
        key: 'getFetchConfig',
        value: function getFetchConfig(message) {
            return _extends({
                method: 'POST',
                body: JSON.stringify({
                    message: message,
                    sessionId: this.sessionId
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            }, this.fetchConfig);
        }
        // these will be called before sending logs

    }, {
        key: 'addHook',
        value: function addHook(hook) {
            if (typeof hook !== 'function') throw new Error('Invalid Hook');
            this.hooks.push(hook);
            return this;
        }
    }, {
        key: 'runHooks',
        value: function runHooks() {
            var _this = this;

            this.hooks.forEach(function (hook) {
                return hook(_this.buffer.getBuffer(), _this.sessionId);
            });
        }
    }, {
        key: 'flush',
        value: function flush() {
            if (!this.sessionIdRequired || this.sessionId) {
                var logs = this.buffer.getBuffer();
                if (logs.length === 0) return Promise.resolve('No logs to send');
                var config = this.getFetchConfig(logs);
                this.runHooks();
                this.buffer.flush();
                if (this.__send__) return Promise.resolve(this.__send__(logs, this.sessionId));
                return (0, _isomorphicFetch2.default)(this.url, config);
            }
            return Promise.resolve('Required sessionId not set');
        }
    }, {
        key: 'info',
        value: function info(log, state) {
            this.report('info', log, state);
        }
    }, {
        key: 'warn',
        value: function warn(log, state) {
            this.report('warn', log, state);
        }
    }, {
        key: 'error',
        value: function error(log, state) {
            this.report('error', log, state);
        }
    }, {
        key: 'debug',
        value: function debug(log, state) {
            this.report('debug', log, state);
        }
    }, {
        key: 'emerg',
        value: function emerg(log, state) {
            this.report('emerg', log, state);
        }
    }]);

    return Logger;
}();

exports.default = Logger;
//# sourceMappingURL=Logger.js.map