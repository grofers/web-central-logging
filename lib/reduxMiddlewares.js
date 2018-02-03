'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var actionLogger = function actionLogger(logger) {
    var actionFilter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function (f) {
        return f;
    };
    var stateFilter = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function () {
        return null;
    };
    var level = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'info';
    return function (store) {
        return function (next) {
            return function (action) {
                var filteredAction = actionFilter(action);
                var filteredStateBA = stateFilter(store.getState());

                next(action);

                var filteredStateAA = stateFilter(store.getState());
                var state = filteredStateBA || filteredStateAA ? {
                    before: filteredStateBA,
                    after: filteredStateAA
                } : {};

                logger.report(level, filteredAction, state);
            };
        };
    };
};

var crashReporter = function crashReporter(logger) {
    var stateFilter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {
        return null;
    };
    var level = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'error';
    return function (store) {
        return function (next) {
            return function (action) {
                try {
                    return next(action);
                } catch (e) {
                    logger.report(level, e, stateFilter(store.getState()));
                    throw e;
                }
            };
        };
    };
};

exports.actionLogger = actionLogger;
exports.crashReporter = crashReporter;
//# sourceMappingURL=reduxMiddlewares.js.map