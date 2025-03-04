import { logLevel, logLevelType } from "./logLevel";
import { logRecord } from "./logs/log-record";


export abstract class BaseLogger {
  protected level: logLevelType | null;

  protected formatter: string | null;

  /**
   * defines the enum keys for standardized messaging.
   */
  public logEnums: unknown = {}

  public abstract log(logRecord: logRecord): void;

  constructor() {
    this.formatter = `[{{levelName}}] {{timestampLocalIso}} {{scope}} : {{rawMessage}}`;
    this.level = logLevel.Debug;
  }

  /**
   * sets the threshold level on which any log called with a higher rank / lower priority will be ignored.
   * @param log_level logLevel
   */
  public setLevel(log_level: logLevelType) {
    this.level = log_level;
  } //change this argument type to logLevelstrings

  public getLevel(): logLevelType {
    return this.level;
  }

  /**
   * sets a formatter to the log message for the browser
   * @param formatter string
   */
  public setFormatter(formatter: string) {
    this.formatter = formatter;
  }

 /**
  * Generates the formatted log message.
  * @param log - logRecord
  * @returns 
  */
  public formatLog(log: logRecord): string {
    let placeholderValues = log.getFormatPlaceholders();
    let current_formatter =
      log.formatter != null ? log.formatter : this.formatter;
    return current_formatter.replace(/{{(.+?)}}/g, (_, placeholder) => {
      return placeholderValues[placeholder] != null
        ? placeholderValues[placeholder]
        : "";
    });
  }
}
