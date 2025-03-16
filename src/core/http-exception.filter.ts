import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  HttpExceptionBodyMessage,
} from '@nestjs/common';
import { getFailedResponse } from './utils';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): void {
    console.log("EXCEPTION", exception)
    const ctx = host.switchToHttp();
    const resp = ctx.getResponse<Response>()
    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: HttpExceptionBodyMessage = "Unexpected error"
    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus()
      console.log("message", exception.getResponse()["message"])
      message = exception.getResponse()["message"]
    }
    resp.status(httpStatus).json(getFailedResponse(message))
  }
}
