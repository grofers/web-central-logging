'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.sendLogs = sendLogs;

var _bunyan = require('bunyan');

var _bunyan2 = _interopRequireDefault(_bunyan);

var _bunyanSyslog = require('bunyan-syslog');

var _bunyanSyslog2 = _interopRequireDefault(_bunyanSyslog);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var getSyslogStream = function getSyslogStream(level, name, facility) {
    return {
        level: level,
        type: 'raw',
        stream: _bunyanSyslog2.default.createBunyanStream({
            type: 'sys',
            name: name,
            facility: facility || _bunyanSyslog2.default.local4
        })
    };
};

function sendLogs(_ref, logger) {
    var message = _ref.message,
        sessionId = _ref.sessionId;

    if (!Array.isArray(message) && (typeof message === 'undefined' ? 'undefined' : _typeof(message)) === 'object') {
        var level = message.level || 'debug';

        if (['info', 'error', 'debug'].indexOf(level) !== -1) {
            logger[level]({ message: message, sessionId: sessionId });
        } else {
            logger.error({
                message: message,
                sessionId: sessionId,
                providedLevel: level,
                error: 'invalid level'
            });
        }
    } else if (Array.isArray(message)) {
        message.forEach(function (logLine) {
            return sendLogs({ message: logLine, sessionId: sessionId }, logger);
        });
    } else throw new Error('Invalid messgae');
}

var syslogsLogger = function syslogsLogger(name) {
    var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'debug';
    var facility = arguments[2];
    var streams = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];

    if (!name) {
        throw new Error('name is required');
    }
    var logger = _bunyan2.default.createLogger({
        name: name,
        streams: [].concat(_toConsumableArray(streams), [getSyslogStream(level, name, facility)])
    });

    return function (req, res, next) {
        var _req$body = req.body,
            message = _req$body.message,
            sessionId = _req$body.sessionId;

        if (!message) {
            res.sendStatus(422);
            return;
        }
        try {
            sendLogs({ message: message, sessionId: sessionId }, logger);
            res.sendStatus(200);
        } catch (e) {
            next(e);
        }
    };
};

exports.default = syslogsLogger;
//# sourceMappingURL=syslogsLogger.js.map