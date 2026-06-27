import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Session, type SessionModelType } from '../domain/session.entity';
import { SessionViewDto } from '../api/view-dto/session.view-dto';

@Injectable()
export class SessionsQueryRepository {
  constructor(
    @InjectModel(Session.modelName) private SessionModel: SessionModelType,
  ) {}

  async getUserActiveSessions(userId: string): Promise<SessionViewDto[]> {
    const sessions = await this.SessionModel.find({
      userId: userId,
      exp: { $gt: Date.now() },
    }).lean();

    return sessions.map((session) => SessionViewDto.mapToView(session));
  }
}
