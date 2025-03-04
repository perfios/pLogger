import { logObj } from "../logs/logObj";

//interface to structure the HttpLogger logs
export interface httpLog {
  formattedLog?: string;

  readonly logData: logObj;
}
