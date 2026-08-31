import { CreateSessionDomainDto } from './dto/create-session.domain.dto';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { UserTypeOrm } from './user.entity';

@Entity({ name: 'sessions' })
/** device_id - должен быть уникален среди всех пользователей */
@Unique(['device_id'])
export class SessionTypeOrm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false, unique: true })
  device_id: string;

  @Column({ type: 'varchar', nullable: false })
  device_name: string;
  @Column({ type: 'varchar', nullable: false })
  ip: string;

  @Column({ type: 'timestamp', nullable: false })
  iat: Date;
  @Column({ type: 'timestamp', nullable: false })
  exp: Date;

  @Column({ type: 'varchar', nullable: false })
  user_id: string;

  /** создаем связь с пользователем */
  /** несколько сессий у одного пользователя - ManyToOne */
  @ManyToOne(() => UserTypeOrm, (user) => user.sessions)
  @JoinColumn({ name: 'user_id' })
  user: UserTypeOrm;

  static createSession(dto: CreateSessionDomainDto): SessionTypeOrm {
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

// export class SessionSql implements SessionSqlDto {
//   id: string;
//   user_id: string;
//   device_id: string;
//   device_name: string;
//   ip: string;
//   iat: Date;
//   exp: Date;
//
//   static createSession(dto: CreateSessionDomainDto): SessionSqlDto {
//     const session = new this();
//
//     session.user_id = dto.userId;
//     session.device_id = dto.deviceId;
//     session.device_name = dto.deviceName;
//
//     session.ip = dto.ip;
//     session.iat = dto.iat;
//     session.exp = dto.exp;
//
//     return session;
//   }
// }

// @Schema({
//   timestamps: true,
//   collection: 'authDeviceSessions',
// })
// export class Session {
//   @Prop({ type: String, required: true })
//   userId: string;
//
//   @Prop({ type: String, required: true, unique: true })
//   deviceId: string;
//
//   @Prop({ type: String, required: true })
//   deviceName: string;
//
//   @Prop({ type: String, required: true })
//   ip: string;
//
//   @Prop({ type: Number, required: true })
//   iat: Date;
//
//   @Prop({ type: Number, required: true })
//   exp: Date;
//
//   static modelName = 'SessionModel';
//   static collectionName = 'authDeviceSessions';
//
//   static createSession(dto: CreateSessionDomainDto): SessionDocument {
//     const session = new this();
//
//     session.userId = dto.userId;
//     session.deviceId = dto.deviceId;
//     session.deviceName = dto.deviceName;
//
//     session.ip = dto.ip;
//     session.iat = dto.iat;
//     session.exp = dto.exp;
//
//     return session as SessionDocument;
//   }
//
//   updateSession(dto: UpdateSessionDomainDto) {
//     this.deviceId = dto.deviceId;
//     this.userId = dto.userId;
//     this.iat = dto.iat;
//     this.exp = dto.exp;
//   }
// }
//
// export const SessionSchema = SchemaFactory.createForClass(Session);
// //регистрирует методы сущности в схеме
// SessionSchema.loadClass(Session);
//
// //Типизация документа
// export type SessionDocument = HydratedDocument<Session>;
//
// //Типизация модели + статические методы
// export type SessionModelType = Model<SessionDocument> & typeof Session;
