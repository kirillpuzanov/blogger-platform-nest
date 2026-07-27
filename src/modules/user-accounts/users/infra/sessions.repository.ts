import { Injectable } from '@nestjs/common';
import { SessionDocument } from '../domain/session.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SessionSqlDto } from '../domain/sql-entity-dto/session.sql-dto';
import { QueryResult } from 'pg';
import { UpdateSessionDomainDto } from '../domain/dto/update-session.domain.dto';

@Injectable()
export class SessionsRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async createSession(dto: SessionSqlDto): Promise<void> {
    const { iat, device_id, device_name, exp, ip, user_id } = dto;
    await this.dataSource.query(
      `INSERT INTO sessions (iat, device_id, device_name, exp, ip, user_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
      [iat, device_id, device_name, exp, ip, user_id],
    );
  }

  async getSession(deviceId: string): Promise<SessionSqlDto | null> {
    const result = await this.dataSource.query<SessionSqlDto[]>(
      `SELECT * FROM sessions
        WHERE device_id=$1
        LIMIT 1`,
      [deviceId],
    );

    return result[0] || null;
  }

  async updateSession(
    sessionId: string,
    dto: UpdateSessionDomainDto,
  ): Promise<void> {
    const { userId, deviceId, iat, exp } = dto;
    await this.dataSource.query<QueryResult>(
      `
      UPDATE sessions
      SET user_id=$1, device_id=$2, iat=$3, exp=$4
      WHERE id=$5
    `,
      [userId, deviceId, iat, exp, sessionId],
    );
  }

  async deleteAllUserSessions(userId: string): Promise<void> {
    /** при удалении юзера */
    await this.dataSource.query<QueryResult>(
      `
      DELETE from sessions
      WHERE user_id=$1
    `,
      [userId],
    );
  }

  async deleteOtherMySessions(userId: string, deviceId: string): Promise<void> {
    await this.dataSource.query<number[]>(
      `
      DELETE from sessions
      WHERE user_id=$1 AND device_id !=$2
    `,
      [userId, deviceId],
    );
  }

  async deleteSession(userId: string, deviceId: string): Promise<number> {
    const result: QueryResult = await this.dataSource.query(
      `
      DELETE from sessions
      WHERE user_id=$1 AND device_id=$2
    `,
      [userId, deviceId],
    );

    return result.rowCount || 0;
  }

  async save(session: SessionDocument): Promise<void> {
    await session.save();
  }
}

// Mongoose
// @Injectable()
// export class SessionsRepository {
//   constructor(
//     @InjectModel(Session.modelName) private SessionModel: SessionModelType,
//   ) {}
//
//   async getSession(deviceId: string): Promise<SessionDocument | null> {
//     return this.SessionModel.findOne({ deviceId });
//   }
//
//   async deleteOtherMySessions(userId: string, deviceId: string): Promise<void> {
//     await this.SessionModel.deleteMany({
//       userId: userId,
//       deviceId: { $ne: deviceId },
//     });
//   }
//
//   async deleteAllUserSessions(userId: string): Promise<void> {
//     /** при удалении юзера */
//     await this.SessionModel.deleteMany({ userId: userId });
//   }
//
//   async deleteSession(userId: string, deviceId: string): Promise<number> {
//     const res = await this.SessionModel.deleteOne({ deviceId, userId });
//     return res.deletedCount;
//   }
//
//   async save(session: SessionDocument): Promise<void> {
//     await session.save();
//   }
// }
