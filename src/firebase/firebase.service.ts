import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import serviceAccount from '../../firebase-service-account.json';

dotenv.config();

@Injectable()
export class FirebaseService {
  private firebaseApp: admin.app.App;

  constructor() {
    this.firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
  }

  async verifyToken(token: string) {
    return this.firebaseApp.auth().verifyIdToken(token);
  }
}
