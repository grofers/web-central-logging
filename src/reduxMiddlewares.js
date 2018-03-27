const defaultActionLoggerOptions = {
    actionFilter: f => f,
    stateFilter: () => null,
    level: 'info',
};

const defaultCrashReporterOptions = {
    stateFilter: () => null,
    level: 'error'
}

const actionLogger = (
    logger,
    options = {},
) => store => next => (action) => {
    const { actionFilter, stateFilter, level } = Object.assign(defaultActionLoggerOptions, options);

    const filteredAction = actionFilter(action);
    const currState = stateFilter(store.getState());

    next(action);

    const nextState = stateFilter(store.getState(), action);
    const state = (currState || nextState) ? {
        before: currState,
        after: nextState,
    } : {};

    logger.report(level, filteredAction, state);
};

const crashReporter = (
    logger,
    options = {}
) => store => next => (action) => {
    const { stateFilter, level } = Object.assign(defaultCrashReporterOptions, options);

    try {
        return next(action);
    } catch (e) {
        logger.report(level, e, stateFilter(store.getState()));
        throw e;
    }
};

export { actionLogger, crashReporter };
