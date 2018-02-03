const actionLogger = (
    logger,
    actionFilter = f => f,
    stateFilter = () => null,
    level = 'info',
) => store => next => (action) => {
    const filteredAction = actionFilter(action);
    const filteredStateBA = stateFilter(store.getState());

    next(action);

    const filteredStateAA = stateFilter(store.getState());
    const state = (filteredStateBA || filteredStateAA) ? {
        before: filteredStateBA,
        after: filteredStateAA,
    } : {};

    logger.report(level, filteredAction, state);
};

const crashReporter = (
    logger,
    stateFilter = () => null,
    level = 'error'
) => store => next => (action) => {
    try {
        return next(action);
    } catch (e) {
        logger.report(level, e, stateFilter(store.getState()));
        throw e;
    }
};

export { actionLogger, crashReporter };
