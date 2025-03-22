import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  NestMiddleware,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import { Observable } from 'rxjs';
import { ExpiredTokenError, InvalidTokenError } from 'src/users/users.service';
import { ITokenProvider, ITokenProviderToken, IUsersRepository, IUsersRepositoryToken } from 'src/users/users.types';
import { Reflector } from '@nestjs/core';
import { UserRole } from 'src/users/entities/user.entity';

export const MinRole = Reflector.createDecorator<UserRole>();

export class AuthMiddleware implements NestMiddleware {
  @Inject(ITokenProviderToken) private tokenProvider: ITokenProvider;
  @Inject(ConfigService) private configService: ConfigService;

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return next();
    }
    const [schema, token] = authHeader.split(' ');
    if (schema.toLowerCase() !== 'bearer' || !token) {
      return next();
    }
    try {
      var payload = await this.tokenProvider.parse(
        token,
        this.configService.get('jwt_secret'),
      );
    } catch (err) {
      // suppress token related errors, otherwise - throw
      if (
        err instanceof ExpiredTokenError ||
        err instanceof InvalidTokenError
      ) {
        return next();
      }
      throw err;
    }
    res.locals.userId = Number(payload.uid);
    return next();
  }
}

const checkIsReqAuthorized = (req: Request): number => {
  const userId = req.res.locals.userId
  if (!userId) {
    throw new HttpException(
      'Unathorized',
      HttpStatus.UNAUTHORIZED,
    );
  }
  return userId
}

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean {
    const req: Request = context.switchToHttp().getRequest();
    checkIsReqAuthorized(req)
    return true;
  }
}

@Injectable()
export class RolesGuard implements CanActivate {
  @Inject(IUsersRepositoryToken) private usersRepo: IUsersRepository;
  @Inject() private reflector: Reflector;
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const userId = checkIsReqAuthorized(req)
    const minRoleRequired = this.reflector.get(MinRole, context.getHandler());
    const userRole = await this.usersRepo.getUserRole(
      userId,
    );
    return userRole >= minRoleRequired;
  }
}
