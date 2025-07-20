import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosError } from 'axios';

@Injectable()
export class PluggyService {
  private readonly logger = new Logger(PluggyService.name);
  private readonly API_KEY = process.env.PLUGGY_API_KEY;
  async createUser(): Promise<string> {
    try {
      const res = await axios.post(
        'https://api.sandbox.pluggy.ai/users',
        {},
        {
          headers: {
            'X-API-KEY': process.env.PLUGGY_API_KEY || '',
          },
        },
      );

      this.logger.log(`User created successfully with ID: ${res.data.id}`);
      return res.data.id;
    } catch (error) {
      const errorMessage =
        error instanceof AxiosError
          ? JSON.stringify(error.response?.data || error.message)
          : String(error);

      this.logger.error('❌ Erro ao criar usuário Pluggy:', errorMessage);
      throw new Error('Failed to create user with Pluggy API');
    }
  }

  async createConnectToken(): Promise<string> {
    try {
      const res = await axios.post(
        'https://api.pluggy.ai/connect_token',
        {}, // corpo vazio ou com campos opcionais, como clientUserId
        {
          headers: {
            'X-API-KEY': process.env.PLUGGY_API_KEY || '',
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log('Connect token created successfully');
      return res.data.accessToken;
    } catch (error) {
      const errorMessage =
        error instanceof AxiosError
          ? JSON.stringify(error.response?.data || error.message)
          : String(error);

      this.logger.error('❌ Erro ao criar connect token:', errorMessage);
      throw new Error('Failed to create connect token with Pluggy API');
    }
  }
}
