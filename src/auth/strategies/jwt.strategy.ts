import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { jwtConstants } from '../constants';

@Injectable()
export class JwtService {
    private readonly secret = jwtConstants.secret;

    sign(payload: any): string {
        return jwt.sign(payload, this.secret, { expiresIn: '1h' });
    }

    verify(token: string): any {
        try {
            return jwt.verify(token, this.secret);
        } catch (e) {
            throw new Error('Invalid token');
        }
    }
}
