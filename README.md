[![Build Status](https://www.travis-ci.org/grofers/logster.svg?branch=master)](https://www.travis-ci.org/grofers/logster)
[![Coverage Status](https://coveralls.io/repos/github/grofers/logster/badge.svg?branch=master)](https://coveralls.io/github/grofers/logster?branch=master)
[![Maintainability](https://api.codeclimate.com/v1/badges/4b8fd727d32ff49f9f4b/maintainability)](https://codeclimate.com/github/grofers/logster/maintainability)

# web-central-logging

Utilities for aggregating frontend logs

- Automatically send logs to syslogs/rsyslog
- Redux middlewares for logging actions and crashes
- Highly customizable

## Installation

```npm install web-central-logging```

or

```yarn add web-central-logging```

## Usage with Redux

```js
import { applyMiddleware, createStore, compose } from 'redux';

import WebCLS, { crashReporter, actionLogger } from 'web-central-logging';

const logger = new WebCLS({ url: '/logs', maxBufferLength: 10 });

const store = createStore(
  reducer,
  initialState,
  applyMiddleware([
    crashReporter(logger),
    // ...
    actionLogger(logger)
  ])
);
```

## Usage without redux

```js
import WebCLS from 'web-central-logging';

const logger = new WebCLS({ url: '/logs', maxBufferLength: 10 });

logger.info({ message: 'User has logged in' });

someCallback((err) => {
    if(err) {
        logger.error(err);
    }
});
```

WebCLS will send the buffered logs in a POST request to the backend.

check [server](#server) config for more details.

### ActionLogger

`actionLogger(logger [, options])` is a redux middleware that adds redux actions into the WebCLS's buffer as `info` level logs.

| Property | Required | Type | Default | Description |
|----------|----------|------|---------|-------------|
| actionFilter | No | Function | `f => f` | function to filter actions [See more](#actionfilter)
| stateFilter | No | Function | `() => null` | function to filter state [See more](#statefilter)
| level | No | String | `info` | syslog level

**actionFilters** and **stateFilters** can be applied to filter out what is logged. [see more](#filters)

### CrashReporter

`crashReporter(logger [, options])` is a redux middleware which reports any crash, uncaught errors & uncaught promises to WebCLS.

| Property | Required | Type | Default | Description |
|----------|----------|------|---------|-------------|
| stateFilter | No | Function | `() => null` | function to filter state [See more](#statefilter)
| level | No | String | `info` | syslog level

## WebCLS

### `WebCLS(config)`

| Property | Required | Type | Default | Description |
|----------|----------|------|---------|-------------|
| url | Yes | String | _ | Url at with logs should be sent
| maxBufferLength | No | Number | 100 | size of buffer after which logs will be flushed to the server
| sessionIdRequired | No | Bool | `true` | Logs will only be sent if a session has been made by setting a sessionId using `logger.setSessionId`
| interval | No | Number | none | Logs will be sent if Buffer is full or Timer has passed the interval
| overwriteBuffer | No | Bool | `true` | if set `false`  old logs will not be overwritten unless logs are flushed explicitly using `logger.flush()` 
| automaticFlush | No | Bool | `flush` | automatically flushes logs if buffer is full or interval has passed
| fetchConfig | No | Object | `{}` | send extra fetch parameters like headers, cookies etc. This follows TC39 standard
| extraParams | No | Object | `{}` | send extra fields with each log
| fireOnGlobalErrors | No | Bool | `true` | This will flush all the logs to the server if there is an uncaught error
| \_\_send_\_ | No | Function | _ | Setting this will overwrite the default Flushing behaviour.

##### Methods

##### `logger.info(log[, state])`

##### `logger.warn(log[, state])`

##### `logger.error(log[, state])`

##### `logger.debug(log[, state])`

##### `logger.emerg(log[, state])`

*NOTE: state can be anything that represents the state of application at time of log*

##### `logger.flush()`

Calling flush will flush all the current logs to the server.
`return` a fetch promise.

##### `logger.addHooks(function)`

Hooks are functions that receives the Buffered logs and sessionId

Note: Hooks are automatically called before `flush` so mutating the logs array will result in mutation in subsequent hooks call and flush call as well.

###### Example

  Register WebCLS's sessionId with Sentry

```js
    logger.addHook((logs, sessionId) => {
        if (typeof Raven !== 'undefined') {
            Raven.setDataCallback((data) => {
                data.extra.sessionURL = sessionId;
                return data;
            });
        }
    });
```

##### `logger.setSessionId(string)`

It is used to set session Id.
eg: when a user logs in, `logger.setSessionId(string)` can be called inside a reducer to create a session

##### `logger.setExtraDataCallback(function)`

This can be used to pass extra fields to every single log line.

It is called before every logging.

## Filters

Filters are pure functions which filters the data to be logged. They are highly useful when you want to hide sensitive data in logs or reduce the payload size.
Filters should be pure functions.

There are two types of Filters

#### ActionFilter

This is used to filter Actions. By default everything in action is logged

##### Example

```js
// Filter.js

function actionFilter(action) {
  switch (action.type) {
    // do not log actions that starts with @@
    case /^@@/.test(action.type): 
      return null; // return null to Skip logging
    case action.type === 'PAYMENT_INIT': 
      // trim userCardInfo field from action
      const newAction = JSON.parse(JSON.stringify(action)); // As filters are pure
      delete newAction.userCardInfo;
      return newAction;
    default:
      return action;
  }
}
```
#### StateFilter

This is used to filter state. By default state is not logged but if you want to log state this filter can be used.

##### Example

```js
// Filter.js

function stateFilter(state, action) {
    const newState = JSON.parse(JSON.stringify(state));
    switch (action.type) {
        case 'ADD_TO_CART':
            return {
                products: newState.products
            };
        case 'USER_LOGGED_IN':
            // let's say we don't want to log access token
            newState.user.accessToken = null;
            return {
                user: state.user
            };
        default:
            return null; // don't log state
    }
}
```

## Server

By default WebCLS will send a fetch request to `url` field provided in the config.

#### Integration with Express
WebCLS comes with a middleware for express that send logs to syslogs

```js
// app.js 

const express = require('express');
const bodyparser = require('body-parser');
const syslogsLogger = require('web-central-logging/lib/syslogsLogger');

const app = express();

app.use(bodyParser.json());
app.use('/logs', syslogsLogger({ name: 'myApp' }));

//...

module.exports = app;
```

#### `syslogsLogger(name [,level, facility, streams])`

| Property | Required | Type | Default | Description |
|----------|----------|------|---------|-------------|
| name | Yes | String | _ | Your app's name which will be reflected in syslogs
| level | No | String | `debug` | Minimum allowed Stream level. eg: if level is `error` then only `error` or higher level logs will pass through and lower level logs like `info`, `debug` will not appear in syslogs
| facility | No | `bsyslog` facility | `bsyslog.local4` | [see here](https://github.com/joyent/node-bunyan-syslog)
| streams | No | `[bunyan stream]` | _ | [see here](https://github.com/trentm/node-bunyan#streams)


### Request Body
In case you are not using express as backend or want to do something different with logs, you can easily do that as WebCLS sends a POST request to provided `url`.

##### Example
```json
    {
        "message": [{
            "timestamp": 1514311801722,
            "action" : {
                "type": "MY_FIRST_ACTION",
                "payload": "Some payload",
            },
            "level": "info",
            "extra" : {},
            "state": {
                "before": {
                    "key": "i am the filtered state before action"
                },
                "after": {
                    "key": "i am the filtered state after action"
                }
            },
        }],
         "sessionId": "ua78bxj34",
    }

```

- `message` is an Array of logs
- `sessionId` can be set using `logger.setSessionId(id)`, if not set this field will be undefined.
- `timestamp` is the time at which log was registered.
- `action` is a filtered or default redux action.
- `state` is a filtered or default redux state. By default it is `{}`
- `extra` this field can be used to send extra params with each logs by setting `extraParams` object in WebCLS config
- `level` is syslog level, actionLogger sets level `info` for each log and crashReporter sets `error` level for each log.

## How to Contribute

1. ```yarn``` or ```npm install``` to install npm development dependencies.
2. ```yarn build``` or ```npm run build``` will compile the source into dist.
3. ```yarn test``` or  ```npm run test``` will run the unit test suit.

## License

[MIT](LICENSE)
