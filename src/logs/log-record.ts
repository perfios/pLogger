import { logPayload } from "../ILogger";
import { logLevels, logLevelType } from "../logLevel";
import { messageObj } from "../logs/messageObj";
// import {LogHelper} from './log-helper'
import { jsonStringifyRecursive } from "../helperMethods";
import {
  getCallerStackFrame,
  IErrorObject,
  isError,
  IStackFrame,
  toErrorObject,
} from "./errorObj";

export class logRecord {
  public level: logLevelType;
  public timestamp: Date | null;
  public scope: string;
  public log: unknown;
  public formatter: string | null;
  public rawMessage: unknown;
  public metaData: IStackFrame | IStackFrame[] | null = null;
  private formatPlaceholders: { [key: string]: any };
  public enumMessage: messageObj;
  public timestampGenerator: () => null| Date

  constructor(
    level: logLevelType,
    scope: string,
    message: unknown,
    formatter: string | null,
    staticParams: logPayload,
    enumMessage: messageObj,
    timestampGenerator: () =>  Date
  ) {
    this.level = level;
    this.scope = scope;

    if (this.timestampGenerator){
      this.timestamp = this.timestampGenerator();
    }
    else{
      this.timestamp = new Date();
    }
    

    let current_enumMessage = enumMessage;
    // checking if message is an error object
    let current_message = null;
    if (isError(message as Error)) {
      let error_obj = toErrorObject(message as Error) as IErrorObject;
      let { stack: _, ...temp_curr_message } = error_obj;
      this.metaData = error_obj.stack;
      current_message = temp_curr_message;
    } else {
      current_message = {
        message: message,
      };
    }

    this.log = { ...current_message, staticParams, ...current_enumMessage };
    this.rawMessage = message;
    this.formatter = formatter;
  }

  public fetchCallStack(stackDepth: number) {
    this.metaData = getCallerStackFrame(stackDepth);
  }

  public generateFormatPlaceholders() {
    this.formatPlaceholders = {};

    //denotes log level name
    this.formatPlaceholders["levelName"] = logLevels[this.level].name;
    //denotes the log level rank
    this.formatPlaceholders["levelRank"] = logLevels[this.level].rank;
    //denotes the timestamp in POSIX format
    this.formatPlaceholders["timestampEpoch"] = this.timestamp;
    //denotes the timestamp in ISO format
    this.formatPlaceholders["timestampISO"] = this.timestamp.toISOString();
    //the scope of the logger, also defined as "name" in pLogger constructor
    this.formatPlaceholders["scope"] = this.scope;
    //the message entered by the user, could be a raw string or a enum message mapped to the string/key (check setLogEnums() and setEnumMessages())
    this.formatPlaceholders["message"] = jsonStringifyRecursive(this.log);
    //the string message entered by the user
    this.formatPlaceholders["rawMessage"] = jsonStringifyRecursive(
      this.rawMessage
    );
    //Return the time value of the system
    this.formatPlaceholders["timestampLocalIso"] = new Date(
      this.timestamp.getTime() - this.timestamp.getTimezoneOffset() * 60000
    ).toISOString();
    let metaData: IStackFrame = null;
    if (Array.isArray(this.metaData)) {
      metaData = this.metaData[0];
    } else {
      metaData = this.metaData;
    }
    //Returns the filename where the log is present along with the line number
    this.formatPlaceholders["fileNameWithLine"] =
      metaData?.fileNameWithLine ?? "";
    //Return the filepath where the log is present along with the line number 
    this.formatPlaceholders["filePathWithLine"] =
      metaData?.filePathWithLine ?? "";
    //Return the full file path
    this.formatPlaceholders["fullFilePath"] = metaData?.fullFilePath ?? "";
    //Return the method in which the log is being called.
    this.formatPlaceholders["method"] = metaData?.method ?? "";
  }

  public getFormatPlaceholders() {
    if (this.formatPlaceholders === undefined) {
      this.generateFormatPlaceholders();
    }
    return this.formatPlaceholders;
  }
}
