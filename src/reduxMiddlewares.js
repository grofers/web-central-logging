const actionLogger = (logger, level = 'info') => store => next => (action) => {
    logger.report(level, action, store.getState());
    return next(action);
};

const crashReporter = (logger, level = 'error') => store => next => (action) => {
    try {
        return next(action);
    } catch (e) {
        logger.report(level, e, store.getState());
        throw e;
    }
};

export { actionLogger, crashReporter };
