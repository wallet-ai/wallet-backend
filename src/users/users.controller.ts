import { Controller, Get, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { User } from '../auth/auth.decorator';

@Controller('users')
export class UsersController {
  @UseGuards(FirebaseAuthGuard)
  @Get('me')
  getProfile(@User() user: any) {
    return {
      message: 'Usuário autenticado com sucesso!',
      uid: user.uid,
      email: user.email,
    };
  }
}
