import { JwtPayload } from '../types/jwt-payload.type';

export abstract class TokenIssuer {
    abstract sign(payload: JwtPayload): string;
}
