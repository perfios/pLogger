import { logLevel, logLevelType} from "../logLevel";

//interface to define the configuration object of the HttpLogger()
export interface httpConfig {
  serverUrl: string;

  batchOptions?: batchOptions;

  retryOptions?: retryOptions;

  highPriority?: logLevelType;

  setCredentials?: boolean;

  showFormattedLog?: boolean;
}

//interface to define the batchOptions
export interface batchOptions {
  batchSize: number;

  debounceTime: number;
}

//interface to define the retryOptions
export interface retryOptions {
  maxRetries: number;

  retryDelay: number;
}