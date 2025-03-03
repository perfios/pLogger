import { BaseLogger } from "../Logger";
import { Config, logPayload } from "../ILogger";
import { logLevel, logLevelType, logLevels } from "../logLevel";
import { logRecord } from "../logs/log-record";
import { messageObj, messageDict, enumObj } from "../logs/messageObj";
import { HttpLogger } from "../http/http-logger";

/**
 * The main library abstraction
 * @param name string
 * @param hideLogPositionForPerformance boolean
 * @param stackDepth number
 * @param minLevel logLevel
 * @param formatter string
 * @param staticParams Object
 */
export class pLogger extends BaseLogger {
  private handlers: BaseLogger[] = [];

  private hideLogPositionForPerformance: boolean;
  private stackDepth: number;

  private name: string;
  private staticParams: logPayload;
  public logEnums: enumObj;
  public enumMessages: messageDict;
  public timestamp: Date | null;

  public timestampGenerator: () => Date;

  constructor({
    name = "Root",
    minLevel = null,
    formatter = null,
    staticParams = {},
    hideLogPositionForPerformance = true,
    stackDepth = 0,
  }: Config) {
    super();
    this.level = minLevel;
    this.formatter = formatter;
    this.name = name;
    this.hideLogPositionForPerformance = hideLogPositionForPerformance;
    this.stackDepth = stackDepth;
    this.staticParams = staticParams;
    this.logEnums = {};
    this.enumMessages = {};
    this.timestampGenerator = null;
  }

  /**
   * Add the logger to send the logs to respective transports.
   * @param logger BaseLogger
   */
  public addHandler(logger: BaseLogger): void {
    const index = this.handlers.indexOf(logger, 0);
    if(index == -1){
      this.handlers.push(logger);
    }
  }

  public removeHandler(logger: BaseLogger): void{
    const index = this.handlers.indexOf(logger, 0);
    if (index > -1){
      this.handlers.splice(index, 1)
    }
  }

  public checkHandlers(): void{
    //using this method for debugging purposes
    console.trace("pLoggerSDK Handlers: ", this.handlers);
  }

  public setTimestampGenerator(timestampGenerator: () => Date): void{
    this.timestampGenerator = timestampGenerator;
  }

  // setLevel log threshold
  private verify_log_level(
    threshold: logLevelType | null,
    incoming_level: logLevelType
  ): boolean {
    if (
      threshold != null &&
      logLevels[incoming_level].rank > logLevels[threshold].rank
    ) {
      return false;
    }
    return true;
  }

  /**
   * 
   * @param logEnums - user defined object keys
   * defined in format
   * {
   * key1 : "key1",
   * key2 : "key2"
   * ...
   * }
   */
  
  public setLogEnums(logEnums: enumObj): void {
    this.logEnums = logEnums;
  }

  /**
   * 
   * @param enumMessages - user defined object consisting of message object literals mapped to logEnums
   */
  public setEnumMessages(enumMessages: messageDict): void {
    this.enumMessages = enumMessages;
  }

  /**
   * define new staticParams for pLogger
   * @param newParams - dynamic object literal
   */
  public updateParams(newParams: logPayload): void{
    this.staticParams = newParams;
  }

  /**
   * add on new staticParams or override preexisting staticParams.
   * @param newParams - dynamic object literal
   */
  public appendParams(newParams: logPayload): void{
    var buffer = {...this.staticParams, ...newParams}
    this.staticParams = buffer;
  }

  public log(logRecord: logRecord) {
    return;
  }
  public _log(message: unknown, log_level: logLevelType, staticParams: logPayload = null) {
    //taking log based enum if the string message is in the enum keys.
    const logData =
      this.enumMessages[message as keyof typeof this.enumMessages];
    let enum_message: messageObj;
    if (logData) {
      enum_message = { ...logData };
    } else {
      enum_message = null;
    }

    let currentParams: logPayload;
    if(staticParams != null){
      currentParams = {...this.staticParams, ...staticParams};
    }
    else{
      currentParams = this.staticParams;
    }

    let current_log = new logRecord(
      log_level,
      this.name,
      message,
      this.formatter,
      currentParams,
      enum_message,
      this.timestampGenerator
    );

    if (
      (!this.hideLogPositionForPerformance && this.stackDepth > 0) ||
      logLevels[log_level].rank <= logLevels[logLevel.Error].rank
    ) {
      current_log.fetchCallStack(this.stackDepth);
    }
    if (!this.verify_log_level(this.level, log_level)) {
      return;
    }
    
    //sending log to each handler.
    this.handlers.forEach((handler) => {
      if (!this.verify_log_level(handler.getLevel(), log_level)) {
        return;
      }
      handler.log(current_log);
    });
  }

  public critical(message: unknown, staticParams: logPayload = null) {
    this._log(message, logLevel.Critical, staticParams);
  }

  public error(message: unknown, staticParams: logPayload = null) {
    this._log(message, logLevel.Error, staticParams);
  }

  public info(message: unknown, staticParams: logPayload = null) {
    this._log(message, logLevel.Info, staticParams);

  }

  public debug(message: unknown, staticParams: logPayload = null) {
    this._log(message, logLevel.Debug, staticParams);
  }

  public warn(message: unknown, staticParams: logPayload = null) {
    this._log(message, logLevel.Warn, staticParams);
  }

  public trace(message: unknown, staticParams: logPayload = null) {
    this._log(message, logLevel.Trace, staticParams);
  }
}

export { logLevel, Config };
