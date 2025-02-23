import { CanActivate, Injectable, ExecutionContext, HttpException, HttpStatus, Inject, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import { Observable } from 'rxjs';
import { ExpiredTokenError, InvalidTokenError, ITokenProvider, ITokenProviderToken } from 'src/users/users.service';

export class AuthMiddleware implements NestMiddleware {
  @Inject(ITokenProviderToken) private tokenProvider: ITokenProvider;
  @Inject(ConfigService) private configService: ConfigService

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return next()
    }
    const [schema, token] = authHeader.split(" ")
    if (schema.toLowerCase() !== "bearer" || !token) {
      return next();
    }
    try {
      var payload = await this.tokenProvider.parse(token, this.configService.get("jwt_secret"))
    } catch (err) {
      // suppress token related errors, otherwise - throw
      if (err instanceof ExpiredTokenError || err instanceof InvalidTokenError) {
        return next()
      }
      throw err
    }
    res.locals.userId = Number(payload.uid)
    return next()
  }
}


@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    if (!request.res.locals.userId) {
      throw new HttpException({ success: false, message: "Unathorized" }, HttpStatus.UNAUTHORIZED)
    }
    return true
  }
}
