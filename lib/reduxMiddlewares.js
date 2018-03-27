'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var defaultActionLoggerOptions = {
    actionFilter: function actionFilter(f) {
        return f;
    },
    stateFilter: function stateFilter() {
        return null;
    },
    level: 'info'
};

var defaultCrashReporterOptions = {
    stateFilter: function stateFilter() {
        return null;
    },
    level: 'error'
};

var actionLogger = function actionLogger(logger) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    return function (store) {
        return function (next) {
            return function (action) {
                var _Object$assign = Object.assign(defaultActionLoggerOptions, options),
                    actionFilter = _Object$assign.actionFilter,
                    stateFilter = _Object$assign.stateFilter,
                    level = _Object$assign.level;

                var filteredAction = actionFilter(action);
                var currState = stateFilter(store.getState());

                next(action);

                var nextState = stateFilter(store.getState(), action);
                var state = currState || nextState ? {
                    before: currState,
                    after: nextState
                } : {};

                logger.report(level, filteredAction, state);
            };
        };
    };
};

var crashReporter = function crashReporter(logger) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    return function (store) {
        return function (next) {
            return function (action) {
                var _Object$assign2 = Object.assign(defaultCrashReporterOptions, options),
                    stateFilter = _Object$assign2.stateFilter,
                    level = _Object$assign2.level;

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