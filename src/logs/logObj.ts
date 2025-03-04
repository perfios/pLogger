import { levelInfo } from "../logLevel";
import { IStackFrame } from "./errorObj";

export interface logObj {
  readonly level: levelInfo;

  readonly timestamp: string;

  readonly log: unknown;

  readonly scope?: string;

  readonly metaData?: IStackFrame | IStackFrame[] | null;
}
