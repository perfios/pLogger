import { httpLog } from "./http-log";


//interface to define the logBucket/logBuffer 
export interface batchLog {
  readonly logBuffer: httpLog[];
}
