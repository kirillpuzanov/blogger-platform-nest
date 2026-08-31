import { Injectable } from '@nestjs/common';
import { SessionViewDto } from '../api/view-dto/session.view-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SessionTypeOrm } from '../domain/session.entity';

@Injectable()
export class SessionsQueryRepository {
  constructor(
    @InjectRepository(SessionTypeOrm)
    private sessionsRepo: Repository<SessionTypeOrm>,
  ) {}

  async getUserActiveSessions(userId: string): Promise<SessionViewDto[]> {
    const sessions = await this.sessionsRepo.find({
      where: { user_id: userId },
    });

    return sessions.map((session) => SessionViewDto.mapSqlToView(session));
  }
}

// row sql
// @Injectable()
// export class SessionsQueryRepository {
//   constructor(@InjectDataSource() protected dataSource: DataSource) {}
//
//   async getUserActiveSessions(userId: string): Promise<SessionViewDto[]> {
//     const sessions = await this.dataSource.query<SessionSqlDto[]>(
//       `
//     SELECT * FROM sessions
//     WHERE user_id = $1
//     `,
//       [userId],
//     );
//
//     return sessions.map((session) => SessionViewDto.mapSqlToView(session));
//   }
// }

// Mongoose
// @Injectable()
// export class SessionsQueryRepository {
//   constructor(
//     @InjectModel(Session.modelName) private SessionModel: SessionModelType,
//   ) {}
//
//   async getUserActiveSessions(userId: string): Promise<SessionViewDto[]> {
//     const sessions = await this.SessionModel.find({
//       userId: userId,
//       exp: { $gt: Date.now() },
//     }).lean();
//
//     return sessions.map((session) => SessionViewDto.mapToView(session));
//   }
// }
