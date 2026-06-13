import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenIssuer } from '../../domain/contracts/token-issuer';
import { JwtPayload } from '../../domain/types/jwt-payload.type';

@Injectable()
export class JwtTokenIssuer extends TokenIssuer {
    constructor(private readonly jwt: JwtService) {
        super();
    }

    sign(payload: JwtPayload): string {
        return this.jwt.sign(payload);
    }
}
