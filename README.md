# 🚀 pLogger SDK for logging to multiple Transports

## The features in the project:
    - Creates application specific loggers (pLogger) which can create subloggers for specific Transports
    - Consists of a Console and HTTP Logger by default
    - Configurability of the loggers. Configs to personalize the logs
    - Can change the formatters of the logs sent to the transports
    - can set Levels to the logs which act as a threshold for the levels to send
    - Can add enum based messages to standardize the log messages.
    -Adds, updates, and appends static parameters to the logs.
    - HTTP Logger:
        - Configurability to tune the http logs
        - Performs Batching to reduce the HTTP Requests overhead
        - Can add a "highPriority" level for which the logs with higher level rank are sent directly to the server rather than the batch.
        - Can opt to send browser cookies to the server or not in the HTTP request headers.
        - Can set our own request headers before sending the logs to the server. This also means we can send JWT authentication tokens as well.


This project has been created using **webpack-cli**, you can now also run

```
npm install 
```

to install all the dependencies used in this project

```
npm run serve
```
to test your project on the webpack server


To get a minified file that you can import in your framework's(React, Angular, etc.) index.html,

implement the command

```
npm run build: prod
```

to build the project. The `webpack.config.js` in this project is customized to automatically minify the code into a single file while creating a library entry point to import the logic from the .js file.

## Loggers Functionalities and Methods

### logLevels
Denoted the levels nested in the logging library
Log levels include (in decreasing order of priority rank):
 1. Critical
 2. Error
 3. Warn
 4. Info
 5. Trace
 6. Debug

### pLogger
```
pLogger({
  name: string,
  hideLogPositionForPerformance: boolean,
  stackDepth: number,
  minLevel: logLevel,
  formatter: string
  staticParams: Object
})
```

### pLogger Config
  - `name` : Add the name/scope for the specific logger, helps in differentiating from various application-specific loggers in the backend or console (depending on the transport).
  - `hideLogPositionForPerformance` : Set to false to send logs without the log positions (file-path, file-name, etc.), to reduce performance loads on the request calls being sent.
  - `stackDepth` : Denotes the level of the functions to consider in the stack trace call.
  - `staticParams` : Takes user defined parameters in the form of an object and adds it in the log.
  - `minLevel` : Add a default level to threshold the logs (logs with level lower than the minLevel will be sent, and won't be logger otherwise)
  - `formatter` : Configures a formatter to generate a formatted log within the given format, upon giving no format uses a default formatter present in the library.

### pLogger Methods
  -`setLevel`:
  This sets the threshold of the levels where the log level with lower priority rank will not infer any logs.
  ```
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

  ```
  pLogger.addHandler(<your-logger>);
  ```
  Once the loggers are added to the pLogger via `addHandler`, all the logs are sent through the respective transports

  To remove the handlers, you can use the `removeHandler(<logger>)` method

  ```
  pLogger.removeHandler(<your-logger>);
  ```

  -`setlogEnums`:
  pLogger supports standardizing the messages sent to the logs using Enums as keys that map to respective messages.
  The Keys are defined as object literals in the format of...
  ```
  {
    key1: "key1",
    key2: "key2",
    ...
  }
  ```
  The function can be defined as...
  ```
  pLogger.setLogEnums(<your-object-with-keys-defined>)
  ```

  -`setEnumMessages`:
  Method to add the mapped messages from the keys added in `setLogEnums`.
  Object in the format of
  ```
  {
    key1: {field1: ..., field2: ...},
    key2: {field3: ..., field4: ...},
    ...
  }
  ```
  -`updateParams`:
  Can be used to completly replace the old staticParams with new ones in the logger object
  
  For example
  ```
  //Let the staticParams be { key1: value1, key2: value2 }

  logger.updateParams({}) //This would make the staticParams as {}, useful for clearing the params

  logger.updateParams({key3: value3, key2: value2}) //Returns {key3:value3, key2: value2} 
  ```

  -`appendParams`:
  Can be used to add(/append) new parameters in the staticParams and even override the preexisting param fields if added.
  Overriding happens only if the key added is the same as any of the pre-existing param keys, else a new key-value pair will be appended.
  For example
  ```
  //Let the staticParams be { key1: value1, key2: value2 }

  logger.appendParams({ key3: value3 }) //this will result in {key1:value1, key2:value2, key3:value3}

  logger.appendParams({key1: value4}) //this will result in {key1:value4, key2:value2, key3:value3}
  ```

  -`setTimestampGenerator`:
  A callback function that takes in a function that returns a timestamp object that overrides/updates the default timestamp set in the log message

  - ***Logging Methods***:
  Consist of (In the decreasing order of logLevel rank)
    ```
    pLogger.critical(<message>) //logLevel.Critical
    pLogger.error(<message>) //logLevel.Error
    pLogger.warn(<message>) //logLevel.Warning
    pLogger.info(<message>) //logLevel.Info
    pLogger.trace(<message>) //logLevel.Trace
    pLogger.debug(<message>) //logLevel.Debug
    ```

### HttpLogger
```
HttpLogger({
  serverUrl: string,
  batchOptions: { batchSize: number, debounceTime: number },
  retryOptions: { maxRetries: number, retryDelay: number },
  highPriority: logLevel,
  setCredentials: boolean,
})
```
### HttpLogger Config

  - `serverUrl` : Stores the server url that the logs are being sent to
  - `batchOptions`: The parameters required to batch the logs. Consist of:
    - `batchSize` : Denotes the maximum batch size to be taken
    - `debounceTime` : The maximum time an incomplete batch is retained without being flushed to the serve
  - `RetryOptions` : Provides options to retry sending logs to the server in-case of failure. Consists of:
    - `maxRetries` : The number of times the request is meant to be retried
    - `retryDelay` : The time (in ms) taken between each retry.
  - `highPriority` : Takes the log level, and sets a threshold where any log with a log rank lower than the highPriority rank will be sent directly to the server, rather than being sent as batches.
  - `setCredentials` : Upon setting to true, the `credentials` header is set to "include", meaning it can accept credential data like cookies and auth tokens (JWT) in the request headers, and on false, is set to "omit", not accepting any credential data.
  - `showFormattedLog` : Upon setting to true, shows a pretty formatted log on each log set to the formatter in the pLogger config, set to False at default as it can often get harder to read with more informative logs. 

### HttpLogger Methods

 - `setHeaders()`:
 This method is used to change the headers present in a HTTP Request. This is useful to configure your HTTP request and also enable the implementation of JWTs (JSON Web Tokens) for authentication/session tokens. 

 - `setPriorityLog()`:
 This method is used to update or change the `highPriority` attribute (refer to HttpLogger Config) by passing a log level in the method argument.



### Example Code
To create a logger object and send logs, the logic should be as follows

```
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
```
<script src = 'path/to/file'> </script>
```

then in angular.json (NOTW: this is for when the above approach doesn't work)
```
...
"build":
...
scripts:
[
    "path/to/file"
],

...
```
Once imported, declare the library as 

```
declare var pLoggerSDK: any
```
and you can now import your logic components via the pLoggerSDK entry point!

For e.g.,

```
const logger = new pLoggerSDK.pLogger({
    ...
})

const logLevel = pLoggerSDK.logLevel
```