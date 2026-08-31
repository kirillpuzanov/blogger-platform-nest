import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateSessionDomainDto } from '../domain/dto/update-session.domain.dto';
import { SessionTypeOrm } from '../domain/session.entity';

@Injectable()
export class SessionsRepository {
  constructor(
    @InjectRepository(SessionTypeOrm)
    private sessionRepo: Repository<SessionTypeOrm>,
  ) {}

  async save(session: SessionTypeOrm): Promise<string> {
    const savedSession = await this.sessionRepo.save<SessionTypeOrm>(session);
    return savedSession.id;
  }

  async getSession(deviceId: string): Promise<SessionTypeOrm | null> {
    const result = await this.sessionRepo.findOneBy({ device_id: deviceId });
    return result || null;
  }

  async updateSession(
    sessionId: string,
    dto: UpdateSessionDomainDto,
  ): Promise<void> {
    const { userId, deviceId, iat, exp } = dto;
    await this.sessionRepo.update(
      { id: sessionId },
      {
        user_id: userId,
        device_id: deviceId,
        iat: iat,
        exp: exp,
      },
    );
  }

  async deleteAllUserSessions(userId: string): Promise<void> {
    /** при удалении юзера */
    await this.sessionRepo.delete({ user_id: userId });
  }

  async deleteOtherMySessions(userId: string, deviceId: string): Promise<void> {
    await this.sessionRepo
      .createQueryBuilder()
      .delete()
      .from(SessionTypeOrm)
      .where('user_id = :userId', { userId })
      .andWhere('device_id != :deviceId', { deviceId: deviceId })
      .execute();
  }

  async deleteSession(userId: string, deviceId: string): Promise<number> {
    const result = await this.sessionRepo.delete({
      user_id: userId,
      device_id: deviceId,
    });
    return result.affected ?? 0;
  }
}

// row sql

// @Injectable()
// export class SessionsRepository {
//   constructor(@InjectDataSource() protected dataSource: DataSource) {}
//
//   async createSession(dto: SessionSqlDto): Promise<void> {
//     const { iat, device_id, device_name, exp, ip, user_id } = dto;
//     await this.dataSource.query(
//       `INSERT INTO sessions (iat, device_id, device_name, exp, ip, user_id)
//          VALUES ($1, $2, $3, $4, $5, $6)
//          RETURNING id`,
//       [iat, device_id, device_name, exp, ip, user_id],
//     );
//   }
//
//   async getSession(deviceId: string): Promise<SessionSqlDto | null> {
//     const result = await this.dataSource.query<SessionSqlDto[]>(
//       `SELECT * FROM sessions
//         WHERE device_id=$1
//         LIMIT 1`,
//       [deviceId],
//     );
//
//     return result[0] || null;
//   }
//
//   async updateSession(
//     sessionId: string,
//     dto: UpdateSessionDomainDto,
//   ): Promise<void> {
//     const { userId, deviceId, iat, exp } = dto;
//     await this.dataSource.query<QueryResult>(
//       `
//       UPDATE sessions
//       SET user_id=$1, device_id=$2, iat=$3, exp=$4
//       WHERE id=$5
//     `,
//       [userId, deviceId, iat, exp, sessionId],
//     );
//   }
//
//   async deleteAllUserSessions(userId: string): Promise<void> {
//     /** при удалении юзера */
//     await this.dataSource.query<QueryResult>(
//       `
//       DELETE from sessions
//       WHERE user_id=$1
//     `,
//       [userId],
//     );
//   }
//
//   async deleteOtherMySessions(userId: string, deviceId: string): Promise<void> {
//     await this.dataSource.query<number[]>(
//       `
//       DELETE from sessions
//       WHERE user_id=$1 AND device_id !=$2
//     `,
//       [userId, deviceId],
//     );
//   }
//
//   async deleteSession(userId: string, deviceId: string): Promise<number> {
//     const result: QueryResult = await this.dataSource.query(
//       `
//       DELETE from sessions
//       WHERE user_id=$1 AND device_id=$2
//     `,
//       [userId, deviceId],
//     );
//
//     return result.rowCount || 0;
//   }
// }

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
