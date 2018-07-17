import fetch from 'isomorphic-fetch';

import Buffer from './Buffer';
import Timer from './Timer';


class Logger {
    constructor({
        url,
        maxBufferLength = 100,
        automaticFlush = true,
        overwriteBuffer = true,
        fetchConfig = {},
        sessionIdRequired = true,
        __send__,
        fireOnGlobalErrors = true,
        interval, // if interval is not set (  ), timer will not start
    }) {
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
        this.buffer = new Buffer(maxBufferLength);
        this.hooks = [];
        this.timer = new Timer(this.flush, interval);

        if (fireOnGlobalErrors) this.registerErrorHandler();
        if (__send__ && typeof __send__ === 'function') this.__send__ = __send__;
    }

    _bufferUp(log, state, level, extra) {
        const {
            buffer,
            overwriteBuffer,
        } = this;

        if (buffer.isFull()) {
            // if overwriteBuffer set to false, silently drop all new logs
            if (overwriteBuffer) buffer.shift();
        }

        if (log) {
            buffer.push({
                timestamp: Date.now(),
                state,
                extra,
                level,
                action: log,
            });
        }
    }

    registerErrorHandler() {
        if (typeof window !== 'undefined') {
            if (this._onErrorHandlerInstalled) {
                return;
            }
            const self = this;
            this._oldOnerrorHandler = window.error;
            window.onerror = function handleGlobalError(errorMsg, url, lineNumber, column, errorObj) {
                self.error(`Error: ${errorMsg} Script: ${url} Line: ${lineNumber} Column: ${column} StackTrace: ${errorObj}`);
                self.flush();
                if (self._oldOnerrorHandler) {
                    // eslint-disable-next-line
                    return self._oldOnerrorHandler.apply(this, arguments);
                }
                return false;
            };
            window.addEventListener('unhandledRejection', (event) => {
                self.error(`Unhandled promise rejection: ${event.reason}`);
            });
            this._onErrorHandlerInstalled = true;
        }
    }

    report(level, log, state) {
        const {
            automaticFlush,
            interval,
            buffer,
            extraParams,
        } = this;
        this._bufferUp(log, state, level, extraParams);
        if (automaticFlush) {
            if (buffer.isFull()) {
                this.flush();
            } else if (interval) {
                this.timer.start();
            }
        }
    }

    setSessionId(id) {
        this.sessionId = id;
        return this;
    }

    unsetSessionId() {
        this.sessionId = undefined;
    }

    setExtraParams(key, value) {
        if (!key) throw new Error('Key is undefined');
        this.extraParams[key] = value;
    }

    getFetchConfig(message) {
        return {
            method: 'POST',
            body: JSON.stringify({
                message,
                sessionId: this.sessionId,
            }),
            headers: {
                'Content-Type': 'application/json',
            },
            ...this.fetchConfig,
        };
    }
    // these will be called before sending logs
    addHook(hook) {
        if (typeof hook !== 'function') throw new Error('Invalid Hook');
        this.hooks.push(hook);
        return this;
    }

    runHooks() {
        this.hooks.forEach(hook => hook(this.buffer.getBuffer(), this.sessionId));
    }

    flush() {
        if (!this.sessionIdRequired || this.sessionId) {
            const logs = this.buffer.getBuffer();
            if (logs.length === 0) return Promise.resolve('No logs to send');
            const config = this.getFetchConfig(logs);
            this.runHooks();
            this.buffer.flush();
            if (this.__send__) return Promise.resolve(this.__send__(logs, this.sessionId));
            return fetch(this.url, config);
        }
        return Promise.resolve('Required sessionId not set');
    }

    info(log, state) { this.report('info', log, state); }
    warn(log, state) { this.report('warn', log, state); }
    error(log, state) { this.report('error', log, state); }
    debug(log, state) { this.report('debug', log, state); }
    emerg(log, state) { this.report('emerg', log, state); }
}

export default Logger;
