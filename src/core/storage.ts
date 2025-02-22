import { QueryFailedError } from 'typeorm';
import { DatabaseError } from 'pg-protocol';

class StorageError extends Error { }

export class AlreadyExistsError extends StorageError { }

export class FkViolationError extends StorageError { }

export enum PostgresErrorCodes {
  UNIQUE_VIOLATION = '23505',
  FK_VIOLATION = '23503',
}

export const isQueryFailed = (err: Error): boolean =>
  err instanceof QueryFailedError;

export const getErrCode = (err: QueryFailedError): string => {
  const dbErr = err.driverError as DatabaseError;
  return dbErr.code;
};
