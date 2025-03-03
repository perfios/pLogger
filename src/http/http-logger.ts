import { BaseLogger } from "../Logger";
import { jsonStringifyRecursive } from "../helperMethods";
import { logLevel, logLevelType, logLevels } from "../logLevel";
import { batchLog } from "./batch-log";
import { httpConfig, batchOptions, retryOptions } from "./http-config";
import { httpLog } from "./http-log";
import { logRecord } from "../logs/log-record";
import { logObj } from "../logs/logObj";

/**
 * HttpLogger -> defines the logger to infer logs to the remote server
 */
export class HttpLogger extends BaseLogger {
  /**define the timeout object to flush the last log batch*/
  private timeoutRef: any = null;

  /**takes the url of the remote server */
  public serverUrl: string;

  /**define the batch options */
  public batchOptions: batchOptions;

  /**define the retry options */
  public retryOptions: retryOptions;

  /**define the level threshold on which the logs can be directly sent to the server rather than a batch */
  public highPriority: logLevelType;
  private headers: Object; //specify headers for the fetch request...

  /**sets cookies and other auth tokens to the request headers */
  private setCredentials: boolean;

  public showFormattedLog: boolean;

  logBucket: httpLog[] = [];
  config: httpConfig;
  constructor({
    serverUrl = "api/url",
    batchOptions = null,
    retryOptions = { maxRetries: 3, retryDelay: 1000 },
    highPriority = logLevel.Critical,
    setCredentials = false,
    showFormattedLog = false,
  }: httpConfig) {
    super();
    // this.config = config;
    this.serverUrl = serverUrl;
    this.batchOptions = batchOptions;
    this.retryOptions = retryOptions;
    this.highPriority = highPriority;
    this.setCredentials = setCredentials;
    this.showFormattedLog = showFormattedLog;

    //out of the config
    this.headers = {}; //default headers
  }

  private _buildLogObject(log: logRecord): logObj {
    return {
      level: logLevels[log.level],
      timestamp: log.timestamp.toISOString(),
      log: log.log,
      scope: log.scope,
      metaData: log.metaData,
    };
  }

  public setPriorityLog(priority_level: logLevelType) {
    this.highPriority = priority_level;
  }

  /**
   * Set custom headers to your Http Request
   * @param headers Headers()
   */
  public setHeaders(headers: Object): void {
    this.headers = headers;
  }

  public log(logRecord: logRecord): void {
    const http_log: httpLog = {
      logData: this._buildLogObject(logRecord),
    };

    if (this.showFormattedLog) {
      http_log.formattedLog = this.formatLog(logRecord);
    }

    //if batchOptions doesn't exist
    if (this.batchOptions == null) {
      //batchOptions doesn't exist
      this.sendBatchRequest([http_log]);
      return;
    }

    //HighPriority threshold
    if (logLevels[this.highPriority].rank >= http_log.logData.level.rank) {
      //push this log directly to the server instead of the batch.
      this.sendBatchRequest([http_log]);
    } else {
      this.logBucket.push(http_log);
    }

    // log batch flush upon exceeding batchSize
    if (this.logBucket.length >= this.batchOptions.batchSize) {
      this.sendBatchRequest();
    }

    if (this.timeoutRef != null) {
      return;
    }
    // log batch flush upon not fulfilling batchSize
    this.timeoutRef = setTimeout(() => {
      clearTimeout(this.timeoutRef);
      this.timeoutRef = null;
      if (this.logBucket.length > 0) {
        this.sendBatchRequest();
      }
    }, this.batchOptions.debounceTime);
  }

  private sendBatchRequest(batchPayload: httpLog[] = null) {
    let _tempBuffer: httpLog[] = batchPayload;
    if (batchPayload == null) {
      _tempBuffer = this.logBucket;
      this.logBucket = [];
    }
    // this.logBucket = [];
    const _emitBatch: batchLog = { logBuffer: _tempBuffer };
    this.sendRequest(
      this.serverUrl,
      _emitBatch,
      this.retryOptions.maxRetries,
      this.retryOptions.retryDelay,
      this.setCredentials,
      this.headers
    );
  }
  private sendRequest(
    serverUrl: string,
    requestData: unknown,
    maxRetries: number,
    backoffTimeout: number,
    setCredentials: boolean,
    headers: Object
  ) {
    // "Accept": "application/json",
    const retryCodes = [408, 500, 502, 503, 504, 522, 404, 400, 405];
    const fetchHeaders = new Headers({
      "Content-Type": "application/json",
    });
    const credentialHeader: RequestCredentials = setCredentials
      ? "include"
      : "omit";

    for (const [key, value] of Object.entries(headers)) {
      fetchHeaders.append(key, value);
    }

    fetch(serverUrl, {
      method: "POST",
      credentials: credentialHeader,
      headers: fetchHeaders,
      body: jsonStringifyRecursive(requestData),
    }).then((response) => {
      // return response.json();
      if (response.ok) {
        return response.json();
      }

      if (maxRetries > 0 && retryCodes.includes(response.status)) {
        setTimeout(() => {
          return this.sendRequest(
            serverUrl,
            requestData,
            maxRetries - 1,
            backoffTimeout * 2,
            setCredentials,
            headers
          );
        }, backoffTimeout);
      } else {
        throw new Error(`Response error occured...${response}`);
      }
    });
  }
}
