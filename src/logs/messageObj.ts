import {logLevel} from '../logLevel';


export interface messageObj {
  [key: string]: unknown
  } 

export interface enumObj{
  [key: string]: string
}

export interface messageDict{
    [key: string]: messageObj;
  }