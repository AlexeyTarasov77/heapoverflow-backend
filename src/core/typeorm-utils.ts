import { QueryFailedError } from 'typeorm';
import { DatabaseError } from 'pg-protocol';

export const isQueryFailed = (err: Error): boolean =>
  err instanceof QueryFailedError;

export const getErrCode = (err: QueryFailedError): string => {
  const dbErr = err.driverError as DatabaseError;
  return dbErr.code;
};
