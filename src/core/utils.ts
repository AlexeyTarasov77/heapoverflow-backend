import { HttpExceptionBodyMessage } from '@nestjs/common';

type FailedResponse = {
  success: false;
  message: HttpExceptionBodyMessage;
};

type SuccededResponse<T> = {
  success: true;
  data: T;
};

export const getFailedResponse = (
  message: HttpExceptionBodyMessage,
): FailedResponse => ({ success: false, message });

export const getSuccededResponse = <T>(data: T): SuccededResponse<T> => ({
  success: true,
  data,
});
