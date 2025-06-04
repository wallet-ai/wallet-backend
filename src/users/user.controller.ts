import { UserAuth } from '@auth/auth.decorator';
import { FirebaseAuthGuard } from '@auth/firebase-auth.guard';
import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UpdateUserDto } from '@users/dtos/update-user.dto';
import { UserService } from '@users/user.service';
import * as admin from 'firebase-admin';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';

@Controller('users')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @UseGuards(FirebaseAuthGuard)
  @Get('me')
  getProfile(@UserAuth() user: admin.auth.DecodedIdToken) {
    return this.usersService.findOrCreateFromFirebase(user);
  }

  @UseGuards(FirebaseAuthGuard)
  @Patch('me')
  updateMe(@UserAuth() user: DecodedIdToken, @Body() body: UpdateUserDto) {
    return this.usersService.updateByFirebaseUid(user.uid, body);
  }

  @UseGuards(FirebaseAuthGuard)
  @Delete('me')
  deleteMe(@UserAuth() user: DecodedIdToken) {
    return this.usersService.removeByFirebaseUid(user.uid);
  }
}
