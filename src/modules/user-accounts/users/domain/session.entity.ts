import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreateSessionDomainDto } from './dto/create-session.domain.dto';
import { UpdateSessionDomainDto } from './dto/update-session.domain.dto';
import { SessionSqlDto } from './sql-entity-dto/session.sql-dto';

export class SessionSql implements SessionSqlDto {
  id: string;
  user_id: string;
  device_id: string;
  device_name: string;
  ip: string;
  iat: number;
  exp: number;

  static createSession(dto: CreateSessionDomainDto): SessionSqlDto {
    const session = new this();

    session.user_id = dto.userId;
    session.device_id = dto.deviceId;
    session.device_name = dto.deviceName;

    session.ip = dto.ip;
    session.iat = dto.iat;
    session.exp = dto.exp;

    return session;
  }
}

@Schema({
  timestamps: true,
  collection: 'authDeviceSessions',
})
export class Session {
  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true, unique: true })
  deviceId: string;

  @Prop({ type: String, required: true })
  deviceName: string;

  @Prop({ type: String, required: true })
  ip: string;

  @Prop({ type: Number, required: true })
  iat: number;

  @Prop({ type: Number, required: true })
  exp: number;

  static modelName = 'SessionModel';
  static collectionName = 'authDeviceSessions';

  static createSession(dto: CreateSessionDomainDto): SessionDocument {
    const session = new this();

    session.userId = dto.userId;
    session.deviceId = dto.deviceId;
    session.deviceName = dto.deviceName;

    session.ip = dto.ip;
    session.iat = dto.iat;
    session.exp = dto.exp;

    return session as SessionDocument;
  }

  updateSession(dto: UpdateSessionDomainDto) {
    this.deviceId = dto.deviceId;
    this.userId = dto.userId;
    this.iat = dto.iat;
    this.exp = dto.exp;
  }
}

export const SessionSchema = SchemaFactory.createForClass(Session);
//регистрирует методы сущности в схеме
SessionSchema.loadClass(Session);

//Типизация документа
export type SessionDocument = HydratedDocument<Session>;

//Типизация модели + статические методы
export type SessionModelType = Model<SessionDocument> & typeof Session;
