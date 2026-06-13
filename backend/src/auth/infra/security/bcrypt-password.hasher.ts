import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { SiglPasswordHasher } from '../../domain/contracts/sigl-password.hasher';

@Injectable()
export class BcryptPasswordHasher extends SiglPasswordHasher {
    async hash(plain: string): Promise<string> {
        return bcrypt.hash(plain, 10);
    }

    async compare(plain: string, hash: string): Promise<boolean> {
        return bcrypt.compare(plain, hash);
    }
}
