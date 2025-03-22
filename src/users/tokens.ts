import { ExpiredTokenError, InvalidTokenError } from './users.service';
import {
  Algorithm,
  sign,
  TokenExpiredError as JsonWebTokenExpiredError,
  verify,
  JsonWebTokenError,
} from 'jsonwebtoken';
import { StringValue } from 'ms';
import { ITokenProvider, TokenPayload } from './users.types';

export class JwtTokenProvider implements ITokenProvider {
  constructor(
    private secret: string,
    private alg: Algorithm = 'HS256',
  ) {
    this.secret = secret;
    this.alg = alg;
  }

  create = async (payload: TokenPayload, ttl: StringValue): Promise<string> => {
    return new Promise((resolve, reject) =>
      sign(
        payload,
        this.secret,
        { expiresIn: ttl, algorithm: this.alg },
        (err, token) => (err ? reject(err) : resolve(token)),
      ),
    );
  };
  parse = async (token: string): Promise<TokenPayload> => {
    return new Promise((resolve, reject) =>
      verify(token, this.secret, (err, decoded) => {
        if (err) {
          let finalErr: Error = err;
          if (err instanceof JsonWebTokenExpiredError) {
            finalErr = new ExpiredTokenError();
          } else if (err instanceof JsonWebTokenError) {
            finalErr = new InvalidTokenError();
          }
          return reject(finalErr);
        }
        return resolve(decoded as TokenPayload);
      }),
    );
  };
}
