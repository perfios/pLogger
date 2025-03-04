import { isError, stringifyErrorObject } from "./logs/errorObj";

export function jsonStringifyRecursive(obj: unknown) {
  const cache = new Set();
  return JSON.stringify(obj, (_, value) => {
    if (typeof value === "object" && value !== null) {
      if (cache.has(value)) {
        // Circular reference found, discard key
        // return "[Circular]"; 
      }
      // Store value in our collection
      cache.add(value);
    }
    if (isError(value)) {
      return stringifyErrorObject(value);
    }
    return value;
  });
}
