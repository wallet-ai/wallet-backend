import { FirebaseService } from '@firebase/firebase.service';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '@users/user.service';
import { RequestWithUser } from 'types/request-with-user';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    private firebaseService: FirebaseService,
    private userService: UserService, // 👈 injeta o service
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestWithUser>();
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
