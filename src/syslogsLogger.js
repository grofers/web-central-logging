import bunyan from 'bunyan';
import bsyslog from 'bunyan-syslog';

const getSyslogStream = (level, name, facility) => ({
    level,
    type: 'raw',
    stream: bsyslog.createBunyanStream({
        type: 'sys',
        name,
        facility: facility || bsyslog.local4
    })
});

export function sendLogs({ message, sessionId }, logger) {
    if (!Array.isArray(message) && typeof message === 'object') {
        const level = message.level || 'debug';

        if (['info', 'error', 'debug'].indexOf(level) !== -1) {
            logger[level]({ message, sessionId });
        } else {
            logger.error({
                message,
                sessionId,
                providedLevel: level,
                error: 'invalid level',
            });
        }
    } else if (Array.isArray(message)) {
        message.forEach(logLine => sendLogs({ message: logLine, sessionId }, logger));
    } else throw new Error('Invalid messgae');
}

const syslogsLogger = (
    name,
    level = 'debug',
    facility,
    streams = [],
) => {
    if (!name) {
        throw new Error('name is required');
    }
    const logger = bunyan.createLogger({
        name,
        streams: [
            ...streams,
            getSyslogStream(level, name, facility)
        ],
    });

    return (req, res, next) => {
        const { message, sessionId } = req.body;
        if (!message) {
            res.sendStatus(422);
            return;
        }
        try {
            sendLogs({ message, sessionId }, logger);
            res.sendStatus(200);
        } catch (e) {
            next(e);
        }
    };
};

export default syslogsLogger;
