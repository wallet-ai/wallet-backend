import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import admin from 'firebase-admin';
const serviceAccount = require('../../firebase-service-account.json');

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
