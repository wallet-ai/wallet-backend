import { FirebaseService } from '@modules/firebase/firebase.service';
import { UserService } from '@modules/users/user.service';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { RequestWithUser } from 'types/request-with-user';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    private firebaseService: FirebaseService,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestWithUser>();

    if (process.env.NODE_ENV === 'development') {
      const decoded: DecodedIdToken = {
        uid: 'fake-uid-dev',
        email: 'dev@local.com',
        name: 'Dev User',
        aud: 'dev',
        auth_time: Date.now(),
        exp: Date.now() + 100000,
        iat: Date.now(),
        iss: '',
        sub: '',
        firebase: {
          identities: {},
          sign_in_provider: 'custom',
        },
      };

      const userEntity =
        await this.userService.findOrCreateFromFirebase(decoded);

      req['user'] = decoded;
      req['userEntity'] = userEntity;

      return true;
    }

    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token ausente');
    }

    const token = authHeader.split('Bearer ')[1];

    try {
      const decoded = await this.firebaseService.verifyToken(token);

      const userEntity =
        await this.userService.findOrCreateFromFirebase(decoded);

      req['user'] = decoded;
      req['userEntity'] = userEntity;

      return true;
    } catch (err) {
      throw new UnauthorizedException('Token inválido');
    }
  }
}
