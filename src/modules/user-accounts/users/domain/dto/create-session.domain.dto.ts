export class CreateSessionDomainDto {
  ip: string;
  exp: Date;
  iat: Date;
  userId: string;
  deviceId: string;
  deviceName: string;
}
