import { BaseLogger } from "../Logger";
import { logLevel } from "../logLevel";
import { logRecord } from "../logs/log-record";

export class ConsoleLogger extends BaseLogger {
  constructor() {
    super();

    //base formatter
    this.formatter = `[{{levelName}}] {{timestampLocalIso}} {{filePathWithLine}} {{scope}} : {{rawMessage}}`;
  }

  public log(logRecord: logRecord): void {
    var formattedLog = this.formatLog(logRecord);
    switch (logRecord.level) {
      case logLevel.Debug:
        console.debug(formattedLog);
        break;
      case logLevel.Critical:
        console.error(formattedLog);
        break;
      case logLevel.Error:
        console.error(formattedLog);
        break;
      case logLevel.Info:
        console.info(formattedLog);
        break;
      case logLevel.Warn:
        console.warn(formattedLog);
        break;
      case logLevel.Trace:
        console.trace(formattedLog);
        break;
      default:
        console.log(formattedLog);
        break;
    }
  }
}
