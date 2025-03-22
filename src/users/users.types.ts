import { SignUpDTO } from './dto/signup.dto';
import { StringValue } from 'ms';
import { User, UserRole } from './entities/user.entity';

export interface IUsersRepository {
  insert(dto: SignUpDTO, passwordHash: string, role?: UserRole): Promise<User>;
  getByEmail(email: string): Promise<User>;
  getById(userId: number): Promise<User>;
  getUserRole(userId: number): Promise<UserRole>;
}

export type TokenPayload = Record<string, any>;

export interface ITokenProvider {
  create(payload: TokenPayload, ttl: StringValue): Promise<string>;
  parse(token: string, secret: string): Promise<TokenPayload>;
}

export interface IHasher {
  hash(s: string): Promise<string>;
  compare(plain: string, hash: string): Promise<boolean>;
}

export const IUsersRepositoryToken = Symbol('IUsersRepository');
export const IHasherToken = Symbol('IHasher');
export const ITokenProviderToken = Symbol('ITokenProvider');
