import { User } from '@entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import admin from 'firebase-admin';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findOrCreateFromFirebase(
    decoded: admin.auth.DecodedIdToken,
  ): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { firebase_uuid: decoded.uid },
    });

    if (existingUser) {
      return existingUser;
    }

    const newUser = this.userRepository.create({
      firebase_uuid: decoded.uid,
      name: decoded.name ?? '',
      email: decoded.email ?? '',
    });

    return this.userRepository.save(newUser);
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async update(id: number, data: Partial<User>): Promise<User | null> {
    await this.userRepository.update(id, data);
    return this.findById(id);
  }

  async updateByFirebaseUid(
    firebaseUid: string,
    data: Partial<User>,
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { firebase_uuid: firebaseUid },
    });
    if (!user) throw new Error('User not found');
    Object.assign(user, data);
    return this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  async removeByFirebaseUid(firebaseUid: string): Promise<void> {
    await this.userRepository.delete({ firebase_uuid: firebaseUid });
  }
}
