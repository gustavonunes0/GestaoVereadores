import { Injectable } from '@nestjs/common';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { PasswordHasher } from '../../application/contracts/password-hasher';

const scrypt = promisify(scryptCallback);

@Injectable()
export class ScryptPasswordHasher implements PasswordHasher {
    async hash(value: string): Promise<string> {
        const salt = randomBytes(16).toString('hex');
        const derivedKey = (await scrypt(value, salt, 64)) as Buffer;
        return `${salt}:${derivedKey.toString('hex')}`;
    }

    async compare(value: string, hash: string): Promise<boolean> {
        const [salt, storedHash] = hash.split(':');
        if (!salt || !storedHash) {
            return false;
        }

        const derivedKey = (await scrypt(value, salt, 64)) as Buffer;
        const storedBuffer = Buffer.from(storedHash, 'hex');

        return timingSafeEqual(derivedKey, storedBuffer);
    }
}
