import { User } from '@entities/user.entity';
import { Request } from 'express';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';

export interface RequestWithUser extends Request {
  user: DecodedIdToken;
  userEntity: User;
}
