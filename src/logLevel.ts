
export interface levelInfo{
    rank: number;
    name: string; 
}


export enum logLevel{
    Critical = "Critical",
    Error = "Error",
    Warn = "Warn",
    Info = "Info",
    Trace = "Trace",
    Debug = "Debug"
}

export type logLevelType = logLevel | keyof typeof logLevel;

export const logLevels: Record<logLevelType, levelInfo> = {
    [logLevel.Critical]: { rank: 0, name: "CRITICAL" },
    [logLevel.Error]: { rank: 1, name: "ERROR" },
    [logLevel.Warn]: { rank: 2, name: "WARN" },
    [logLevel.Info]: { rank: 3, name: "INFO" },
    [logLevel.Trace]: { rank: 4, name: "TRACE" },
    [logLevel.Debug]: { rank: 5, name: "DEBUG" }
};



