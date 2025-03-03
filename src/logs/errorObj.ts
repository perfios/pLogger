export interface IStackFrame {
  fullFilePath?: string;
  fileName?: string;
  fileNameWithLine?: string;
  filePath?: string;
  fileLine?: string;
  fileColumn?: string;
  filePathWithLine?: string;
  method?: string;
}

export interface IErrorObject {
  /** Name of the error*/
  name: string;
  /** Error message */
  message: string;
  /** native Error object */
  nativeError: Error;
  /** Stack trace of the error */
  stack: IStackFrame[];
}

export function isError(e: Error | unknown): boolean {
  return e instanceof Error;
}

export function stringifyErrorObject(e: any) {
  const newValue = Object.getOwnPropertyNames(e).reduce(
    (obj: { [key: string]: string }, propName) => {
      obj[propName] = e[propName];
      return obj;
    },
    { name: e.name }
  );
  return newValue;
}

export function toErrorObject(error: Error): IErrorObject {
  return {
    nativeError: error,
    name: error.name ?? "Error",
    message: error.message,
    stack: _getErrorTrace(error),
  };
}

function _getErrorTrace(error: Error): IStackFrame[] {
  return (error as Error)?.stack
    ?.split("\n")
    ?.filter((line: string) => !line.includes("Error: "))
    ?.reduce((result: IStackFrame[], line: string) => {
      let stackData = stackLineToStackFrame(line);
      if (!Object.values(stackData).every((el) => el === undefined)) {
        result.push(stackData);
      }
      return result;
    }, []) as IStackFrame[];
}

function stackLineToStackFrame(line?: string): IStackFrame {
  const pathRegexes = [
    /^\s?((?:at)\s)?(?:(?<method>[\w.]*)(?:\s|@))?\(?(?:file|https|http|webpack|[^@]+)?(?:file:)?:\/?\/?\w*:?\d*\/(?<fileName>[\w./-]+)\??(?::(?<lineNumber>\d+))?(?::(?<colNumber>\d+))?/,
    /(?:(?:file|https?|global code|[^@]+)@)?(?:file:)?(?<fileName>(?:\/[^:/]+){2,})(?::(?<lineNumber>\d+))?(?::(?<colNumber>\d+))?/,
  ];
  const href = globalThis.location.origin;
  const pathResult: IStackFrame = {
    fullFilePath: undefined,
    fileName: undefined,
    fileNameWithLine: undefined,
    fileColumn: undefined,
    fileLine: undefined,
    filePath: undefined,
    filePathWithLine: undefined,
    method: undefined,
  };
  if (line != null) {
    for (var i = 0; i < pathRegexes.length; i++) {
      var pathRegex = pathRegexes[i];
      const match = line.trim().match(pathRegex);
      if (match) {
        let match_group = match["groups"];
        pathResult.filePath = match_group["fileName"].replace(/\?.*$/, "");
        pathResult.fullFilePath = `${href}${pathResult.filePath}`;
        const pathParts = pathResult.filePath.split("/");
        pathResult.fileName = pathParts[pathParts.length - 1];
        pathResult.fileLine = match_group["lineNumber"];
        pathResult.fileColumn = match_group["colNumber"];
        pathResult.method = match_group["method"];
        pathResult.filePathWithLine = `${pathResult.filePath}:${pathResult.fileLine}`;
        pathResult.fileNameWithLine = `${pathResult.fileName}:${pathResult.fileLine}`;
        break;
      }
    }
  }

  return pathResult;
}

export function getCallerStackFrame(
  stackDepthLevel: number,
  error: Error = Error()
): IStackFrame {
  let userAgentString = navigator?.userAgent || "";
  let _stackDepthLevel = userAgentString.match(/.*Firefox.*/)
    ? stackDepthLevel - 1
    : stackDepthLevel;
  return stackLineToStackFrame(
    (error as Error | undefined)?.stack?.split("\n")?.filter((line: string) => {
      return !line.includes("Error: ");
    })?.[_stackDepthLevel]
  );
}
