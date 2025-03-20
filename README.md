# 🚀 pLogger SDK for logging to multiple Transports

## Installation

You can install the package via npm:

```bash
npm install plogger-sdk
```
## Key Features

- **Multiple Transport Methods**: Console and HTTP logging built-in
- **Configurable Log Levels**: Six severity levels with customizable thresholds 
- **HTTP Transport with Batching**: Reduce network overhead with intelligent log batching
- **Retry Mechanism**: Automatically retry failed HTTP log transmissions
- **Priority-based Transmission**: Send critical logs immediately
- **Authentication Support**: Include auth tokens in HTTP headers
- **Static Parameters**: Add, update, and append static data to all logs
- **Performance Optimization**: Options to control stack trace collection
- **Customizable Formatting**: Format logs to suit your needs
## Comparison with Other JavaScript Logging Libraries

pLogger was designed to address common limitations in existing logging libraries while providing unique capabilities for modern web applications.

### Feature Comparison

| Feature | pLogger | loglevel | Pino (Browser) | browser-bunyan | js-Logger | tslog | lumberjack |
|---------|---------|----------|--------------|----------------|-----------|-------|-----------|
| Browser Support | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Configurable Log Levels | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| HTTP/Remote Logging | ✅ | ⚠️ | ✅ | ✅ | ⚠️ | ⚠️ | ✅ |
| Named Loggers/Scopes | ✅ | ✅ | ⚠️ | ✅ | ✅ | ✅ | ✅ |
| Custom Formatting | ✅ | ⚠️ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Extensibility/Plugins | ✅ | ✅ | ⚠️ | ⚠️ | ✅ | ✅ | ✅ |
| Static Parameters | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Log Batching (HTTP) | ✅ | ❌ | ⚠️ | ✅ | ❌ | ⚠️ | ❌ |
| Error Handling | ✅ | ✅ | ⚠️ | ✅ | ⚠️ | ✅ | ✅ |
| Stack Trace Preservation | ✅ | ✅ | ❌ | ⚠️ | ⚠️ | ✅ | ⚠️ |
| Retry Mechanisms | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Authentication Support | ✅ | ❌ | ❌ | ⚠️ | ❌ | ❌ | ⚠️ |
| High Priority Logging | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Framework Compatibility | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌* |
| Performance Optimization | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ✅ | ❌ |
| Size | Moderate | Very Small | Small | Small | Very Small | Moderate | Moderate |

\* Only compatible with Angular
<br>
⚠️ Requires additional plugins or custom implementation


### Why Choose pLogger?

pLogger stands out with its combination of:

1. **Advanced HTTP transport capabilities** including batching, retry logic, and priority-based transmission
2. **Performance optimization options** with configurable stack trace collection
3. **Comprehensive static parameter manipulation** for contextual logging
4. **Built-in support for authentication** in HTTP logging

While smaller libraries like loglevel and js-Logger offer simplicity, and libraries like lumberjack provide framework-specific features, pLogger offers a balanced approach with advanced features needed for robust production applications.

## Logger Configuration

### Log Levels

pLogger includes six log levels in decreasing order of severity:
 1. Critical
 2. Error
 3. Warn
 4. Info
 5. Trace
 6. Debug

### pLogger Configuration Options

```ts
const logger = new pLogger({
  name: string,                          // Logger name/scope
  hideLogPositionForPerformance: boolean, // Disable stack trace for better performance
  stackDepth: number,                    // Configure stack trace depth
  minLevel: logLevel,                    // Set minimum log level threshold
  formatter: string,                     // Custom log format
  staticParams: Object                   // Static parameters to include in all logs
})
```

#### Configuration Parameters:
  - **name** : Add the name/scope for the specific logger, helps in differentiating from various application-specific loggers in the backend or console (depending on the transport).
  - **hideLogPositionForPerformance** : Set to false to send logs without the log positions (file-path, file-name, etc.), to reduce performance loads on the request calls being sent.
  - **stackDepth** : Denotes the level of the functions to consider in the stack trace call.
  - **staticParams** : Takes user defined parameters in the form of an object and adds it in the log.
  - **minLevel** : Add a default level to threshold the logs (logs with level lower than the minLevel will be sent, and won't be logger otherwise)
  - **formatter** : Configures a formatter to generate a formatted log within the given format, upon giving no format uses a default formatter present in the library.


### HTTP Logger Configuration

```ts
const httpLogger = new HttpLogger({ 
  serverUrl: string,                     // URL to send logs to
  batchOptions: {                        // Batching configuration
    batchSize: number,                   // Maximum logs per batch
    debounceTime: number                 // Maximum time to wait before sending
  },
  retryOptions: {                        // Retry configuration
    maxRetries: number,                  // Maximum retry attempts
    retryDelay: number                   // Delay between retries (ms)
  },
  highPriority: logLevel,                // Level at which to bypass batching
  setCredentials: boolean,               // Include credentials (cookies)
  showFormattedLog: boolean              // Show formatted logs in console
})
```

### pLogger Methods
  -`setLevel`:
  This sets the threshold of the levels where the log level with lower priority rank will not infer any logs.
  ```ts
  pLogger.setLevel(logLevel.<your-log-level>)
  ```

  -`setFormatter()`:
  Adds a formatter to configure a formatted log upon the format specified by the user in string format.
  Formatter parameters include:
  
    -`{{ levelName }}` : Specifies the name of the log level
    -`{{ levelRank }}` : Specifies the rank of the log level
    -`{{ timestampEpoch }}` : Specifies the timestamp generated in POSIX time format
    -`{{ timestampISO }}` : specifies the timestamp generated in ISO format
    -`{{ scope }}` : Specifies the name/scope of the pLogger object
    -`{{ message }}` : Specifies the message entered by the user, either the raw string or the enum messages mapped to the key specified by the user via `setLogEnums` and `setEnumMessages`
    -`{{ rawMessage }}` : Specifies the raw string of the message given by the user.
    -`{{ timestampLocalIso }}` : Gets the local timestamp value of the system it is being run on.
    -`{{ fileNameWithLine }}` : Gets the filename at which the og is located at, gets it from the stack trace call
    -`{{ filePathWithLine }}` : Gets the filepath at which the og is located at, gets it from the stack trace call
    -`{{ method }}` : Gets the method at which the log is being called from, gets it from the stack trace call.

  -`addHandler`:
  pLogger consists of a base logger which can be extended to create custom loggers for various transports (browser, server by default)

  To do this we use the `addHandler` method

  ```ts
  pLogger.addHandler(<your-logger>);
  ```
  Once the loggers are added to the pLogger via `addHandler`, all the logs are sent through the respective transports

  To remove the handlers, you can use the `removeHandler(<logger>)` method

  ```ts
  pLogger.removeHandler(<your-logger>);
  ```

  -`setlogEnums`:
  pLogger supports standardizing the messages sent to the logs using Enums as keys that map to respective messages.
  The Keys are defined as object literals in the format of...
  ```ts
  {
    key1: "key1",
    key2: "key2",
    ...
  }
  ```
  The function can be defined as...
  ```ts
  pLogger.setLogEnums(<your-object-with-keys-defined>)
  ```

  -`setEnumMessages`:
  Method to add the mapped messages from the keys added in `setLogEnums`.
  Object in the format of
  ```ts
  {
    key1: {field1: ..., field2: ...},
    key2: {field3: ..., field4: ...},
    ...
  }
  ```
  -`updateParams`:
  Can be used to completly replace the old staticParams with new ones in the logger object
  
  For example
  ```ts
  //Let the staticParams be { key1: value1, key2: value2 }

  logger.updateParams({}) //This would make the staticParams as {}, useful for clearing the params

  logger.updateParams({key3: value3, key2: value2}) //Returns {key3:value3, key2: value2} 
  ```

  -`appendParams`:
  Can be used to add(/append) new parameters in the staticParams and even override the preexisting param fields if added.
  Overriding happens only if the key added is the same as any of the pre-existing param keys, else a new key-value pair will be appended.
  For example
  ```ts
  //Let the staticParams be { key1: value1, key2: value2 }

  logger.appendParams({ key3: value3 }) //this will result in {key1:value1, key2:value2, key3:value3}

  logger.appendParams({key1: value4}) //this will result in {key1:value4, key2:value2, key3:value3}
  ```

  -`setTimestampGenerator`:
  A callback function that takes in a function that returns a timestamp object that overrides/updates the default timestamp set in the log message

  - ***Logging Methods***:
  Consist of (In the decreasing order of logLevel rank)
    ```ts
    pLogger.critical(<message>) //logLevel.Critical
    pLogger.error(<message>) //logLevel.Error
    pLogger.warn(<message>) //logLevel.Warning
    pLogger.info(<message>) //logLevel.Info
    pLogger.trace(<message>) //logLevel.Trace
    pLogger.debug(<message>) //logLevel.Debug
    ```

### HttpLogger Methods

 - `setHeaders()`:
 This method is used to change the headers present in a HTTP Request. This is useful to configure your HTTP request and also enable the implementation of JWTs (JSON Web Tokens) for authentication/session tokens. 

 - `setPriorityLog()`:
 This method is used to update or change the `highPriority` attribute (refer to HttpLogger Config) by passing a log level in the method argument.



### Example Code
To create a logger object and send logs, the logic should be as follows

```ts
...

import { ConsoleLogger } from "./console/console-logger";
import { HttpLogger } from "./http/http-logger";
import { pLogger, logLevel } from "./p-logger/p-logger";

...

//initialize logger
const logger = new pLogger({
  name: "plogger",
  hideLogPositionForPerformance: false,
  stackDepth: 5,
  minLevel: "Debug",
  staticParams: {}
})

// set log level threshold (if level rank of log sent greater than setLevel, then ignore the log sent)
logger.setLevel(logLevel.Debug);

//set a formatter for the logs to have a pretty formatted message.
logger.setFormatter("{{levelName}} {{timestampEpoch}} {{scope}} -> {{rawMessage}}")

//create a ConsoleLogger object
const console_logger = new ConsoleLogger();

// create a HttpLogger Object
const http_logger = new HttpLogger({ 
    serverUrl: "http://127.0.0.1:5000/api/logs",
    batchOptions: {
        batchSize: 3,
        debounceTime: 3000 //calculated in ms
    },
    retryOptions: {
        maxRetries: 3,
        retryDelay: 1000 //calculated in ms

    },
    highPriority: "Warn",
    setCredentials: true,
    showFormattedLog: false
 });


//set custom user defined headers
http_logger.setHeaders({
   ... 
});

//add the loggers as pLogger Handlers to send logs to each handler.
logger.addHandler(console_logger);
logger.addHandler(http_logger);

//define the keys for the enum messages
const keys = {
  key1: "key1"
  key2: "key2"
  key3: "key3"
}

//define the object to map the enums.
const messages = {
  key1: {
    message1: "message",
    index: 1
  },
  key2 : {
    message2: "random-message",
    index: 2
  },
  key3: {
    message3: "message-three",
    index: 3
  }
}
logger.setLogEnums(keys); 


logger.setEnumMessages(messages); 

//now your logger is ready to send logs
logger.warn("this is a warn log");
logger.appendParams({ ... });
logger.critical("this is a critical log");

...


```

## Angular Integration
After minification, add the .js file into your angular project

via browser
```ts
<script src = 'path/to/file'> </script>
```

then in angular.json (NOTW: this is for when the above approach doesn't work)
```json
{
    "build": {
        "scripts":[
            "path/to/file"
        ]
    }
}
```
Once imported, declare the library as 

```
declare var pLoggerSDK: any
```
and you can now import your logic components via the pLoggerSDK entry point!

For e.g.,

```ts
const logger = new pLoggerSDK.pLogger({
    ...
})
Comparison
const logLevel = pLoggerSDK.logLevel
```

## License

This project is licensed under the GPL-3.0 License - see the LICENSE file for details.
