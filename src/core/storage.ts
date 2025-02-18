class StorageError extends Error {}

export class AlreadyExistsError extends StorageError {}

export class FkViolationError extends StorageError {}

export enum PostgresErrorCodes {
  UNIQUE_VIOLATION = '23505',
  FK_VIOLATION = '23503',
}
