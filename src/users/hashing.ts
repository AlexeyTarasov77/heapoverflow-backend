import { IHasher } from './users.types';
import { hash, compare } from 'bcrypt';

export class BcryptHasher implements IHasher {
  private saltRounds: number = 10;

  hash = async (s: string): Promise<string> => {
    return await hash(s, this.saltRounds);
  };
  compare = async (plain: string, hash: string): Promise<boolean> => {
    return await compare(plain, hash);
  };
}
