import { logLevel, logLevelType } from "./logLevel";

export interface logPayload {
  /**
   * custom data for the logs
   */

  readonly [property: string]: unknown;
}

export interface Config {
  name?: string;
  hideLogPositionForPerformance?: boolean;
  stackDepth?: number;
  minLevel?: logLevelType;
  formatter?: string;
  staticParams?: logPayload;
}
