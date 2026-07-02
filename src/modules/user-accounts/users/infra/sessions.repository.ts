import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Session,
  SessionDocument,
  type SessionModelType,
} from '../domain/session.entity';

@Injectable()
export class SessionsRepository {
  constructor(
    @InjectModel(Session.modelName) private SessionModel: SessionModelType,
  ) {}

  async getSession(deviceId: string): Promise<SessionDocument | null> {
    return this.SessionModel.findOne({ deviceId });
  }

  async deleteOtherMySessions(userId: string, deviceId: string): Promise<void> {
    await this.SessionModel.deleteMany({
      userId: userId,
      deviceId: { $ne: deviceId },
    });
  }

  async deleteAllUserSessions(userId: string): Promise<void> {
    /** при удалении юзера */
    await this.SessionModel.deleteMany({ userId: userId });
  }

  async deleteSession(userId: string, deviceId: string): Promise<number> {
    const res = await this.SessionModel.deleteOne({ deviceId, userId });
    return res.deletedCount;
  }

  async save(session: SessionDocument): Promise<void> {
    await session.save();
  }
}
