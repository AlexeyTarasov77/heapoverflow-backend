import { ITokenProvider, TokenPayload } from "./users.service";
import { Algorithm, sign, verify } from "jsonwebtoken";
import { StringValue } from 'ms'

export class JwtTokenProvider implements ITokenProvider {

  constructor(private secret: string, private alg: Algorithm = "HS256") {
    console.log("initializing with ", secret, alg)
    this.secret = secret
    this.alg = alg
  }

  create = async (payload: TokenPayload, ttl: StringValue): Promise<string> => {
    return new Promise((resolve, reject) =>
      sign(payload, this.secret, { expiresIn: ttl, algorithm: this.alg }, (err, token) =>
        err ? reject(err) : resolve(token)
      )
    )
  }
  parse = async (token: string): Promise<TokenPayload> => {
    return new Promise((resolve, reject) => verify(token, this.secret, (err, decoded) =>
      err ? reject(err) : resolve(decoded as TokenPayload)
    ))
  }
}
