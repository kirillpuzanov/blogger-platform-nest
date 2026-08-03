import { SessionDocument } from '../../domain/session.entity';
import { SessionSqlDto } from '../../domain/sql-entity-dto/session.sql-dto';

export class SessionViewDto {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;

  static mapToView(session: SessionDocument): SessionViewDto {
    const dto = new SessionViewDto();

    dto.ip = session.ip;
    dto.title = session.deviceName;
    dto.lastActiveDate = new Date(session.iat).toISOString();
    dto.deviceId = session.deviceId;

    return dto;
  }

  static mapSqlToView(session: SessionSqlDto): SessionViewDto {
    const dto = new SessionViewDto();

    dto.ip = session.ip;
    dto.title = session.device_name;
    dto.lastActiveDate = new Date(session.iat).toISOString();
    dto.deviceId = session.device_id;

    return dto;
  }
}
