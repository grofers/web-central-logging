'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var actionLogger = function actionLogger(logger) {
    var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'info';
    return function (store) {
        return function (next) {
            return function (action) {
                logger.report(level, action, store.getState());
                return next(action);
            };
        };
    };
};

var crashReporter = function crashReporter(logger) {
    var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'error';
    return function (store) {
        return function (next) {
            return function (action) {
                try {
                    return next(action);
                } catch (e) {
                    logger.report(level, e, store.getState());
                    throw e;
                }
            };
        };
    };
};

exports.actionLogger = actionLogger;
exports.crashReporter = crashReporter;
//# sourceMappingURL=reduxMiddlewares.js.map