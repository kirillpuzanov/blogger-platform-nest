import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { configValidation } from '../setup/config-validation.utility';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
} from 'class-validator';
import type { StringValue } from 'ms';

export enum Environments {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TESTING = 'testing',
}

@Injectable()
export class CoreConfig {
  @IsNumber({}, { message: 'Set Env variable PORT, example: 3000' })
  port: number;

  @IsNotEmpty({ message: 'Set Env variable MONGO_URL' })
  mongoUrl: string;

  @IsNotEmpty({ message: 'Set Env variable DB_NAME' })
  dbName: string;

  @IsNumber({}, { message: 'Set Env variable SQL_PORT, example: 3000' })
  sqlPort: number;

  @IsNotEmpty({ message: 'Set Env variable SQL_USER_NAME' })
  sqlUserName: string;

  @IsNotEmpty({ message: 'Set Env variable SQL_DB_NAME' })
  sqlDbName: string;

  @IsBoolean({ message: 'Set Env variable IS_SWAGGER_ENABLED' })
  isSwaggerEnabled: boolean;

  @IsBoolean({ message: 'Set Env variable INCLUDE_TESTING_MODULE' })
  isIncludeTestingModule: boolean;

  @IsNotEmpty({ message: 'Set Env variable JWT_SECRET_ACCESS' })
  jwtSecretAccess: string;

  @IsNotEmpty({ message: 'Set Env variable JWT_SECRET_REFRESH' })
  jwtSecretRefresh: string;

  @IsEmail({}, { message: 'Set Env variable EMAIL' })
  email: string;

  @IsNotEmpty({ message: 'Set Env variable emailPass' })
  emailPass: string;

  @IsBoolean({ message: 'Set Env variable sendInternalServerErrorDetails' })
  sendInternalServerErrorDetails: boolean;

  @IsEnum(Environments, {
    message:
      'Set Env variable NODE_ENV, available values: ' +
      configValidation.getEnumValues(Environments).join(', '),
  })
  env: string;

  @IsNotEmpty({ message: 'Set Env variable ACCESS_TOKEN_EXPIRE_IN' })
  accessExpireIn: StringValue;

  @IsNotEmpty({ message: 'Set Env variable REFRESH_TOKEN_EXPIRE_IN' })
  refreshExpireIn: StringValue;

  @IsBoolean({ message: 'Set Env variable ENABLE_IP_RESTRICTION' })
  isEnableIpRestriction: boolean;

  constructor(private configService: ConfigService<any, true>) {
    this.port = Number(this.configService.get('PORT'));
    this.mongoUrl = this.configService.get('MONGO_URL');
    this.dbName = this.configService.get('DB_NAME');
    this.isSwaggerEnabled = configValidation.convertToBoolean(
      this.configService.get('IS_SWAGGER_ENABLED'),
    );
    this.isIncludeTestingModule = configValidation.convertToBoolean(
      this.configService.get('INCLUDE_TESTING_MODULE'),
    );
    this.jwtSecretAccess = this.configService.get('JWT_SECRET_ACCESS');
    this.jwtSecretRefresh = this.configService.get('JWT_SECRET_REFRESH');
    this.email = this.configService.get('EMAIL');
    this.emailPass = this.configService.get('EMAIL_PASS');
    this.env = this.configService.get('NODE_ENV');
    this.sendInternalServerErrorDetails = configValidation.convertToBoolean(
      this.configService.get('SEND_INTERNAL_SERVER_ERROR_DETAILS'),
    );

    this.accessExpireIn = this.configService.get('ACCESS_TOKEN_EXPIRE_IN');
    this.refreshExpireIn = this.configService.get('REFRESH_TOKEN_EXPIRE_IN');

    this.sqlPort = Number(this.configService.get('SQL_PORT'));
    this.sqlUserName = this.configService.get('SQL_USER_NAME');
    this.sqlDbName = this.configService.get('SQL_DB_NAME');
    this.isEnableIpRestriction = configValidation.convertToBoolean(
      this.configService.get('ENABLE_IP_RESTRICTION'),
    );
    configValidation.validateConfig(this);
  }
}
