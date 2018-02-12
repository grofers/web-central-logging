const actionLogger = (
    logger,
    actionFilter = f => f,
    stateFilter = () => null,
    level = 'info',
) => store => next => (action) => {
    const filteredAction = actionFilter(action);
    const currState = stateFilter(store.getState());

    next(action);

    const nextState = stateFilter(store.getState());
    const state = (currState || nextState) ? {
        before: currState,
        after: nextState,
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
