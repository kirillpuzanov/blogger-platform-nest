import { Injectable } from '@nestjs/common';
import { SessionViewDto } from '../api/view-dto/session.view-dto';
import { SessionSqlDto } from '../domain/sql-entity-dto/session.sql-dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class SessionsQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async getUserActiveSessions(userId: string): Promise<SessionViewDto[]> {
    const sessions = await this.dataSource.query<SessionSqlDto[]>(
      `
    SELECT * FROM sessions
    WHERE user_id = $1
    `,
      [userId],
    );

    return sessions.map((session) => SessionViewDto.mapSqlToView(session));
  }
}

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
