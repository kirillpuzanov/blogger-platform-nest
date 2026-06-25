import { ConfigModule } from '@nestjs/config';
import { join } from 'path';

export const configDynamicModule = ConfigModule.forRoot({
  envFilePath: [
    process.env.ENV_FILE_PATH?.trim() || '',
    join(process.cwd(), 'src', 'env', `.env.${process.env.NODE_ENV}.local`), // в конце отсюда, перезатрет предыдущие
    join(process.cwd(), 'src', 'env', `.env.${process.env.NODE_ENV}`), // затем отсюда
    join(process.cwd(), 'src', 'env', '.env.production'), // сначала возьмутся значения отсюда
  ],
  isGlobal: true,
});
