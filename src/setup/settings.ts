export const settings = {
  PORT: process.env.PORT ?? 3001,
  MONGO_URL:
    process.env.MONGO_URL ??
    'mongodb+srv://kirillpuzanov_db_user:X1VQvnWnM2iwW5jU@clusterblogpost.xxbx4oy.mongodb.net/?appName=ClusterBlogPost',
  DB_NAME: process.env.DB_NAME ?? 'blockPostDb',
  JWT_SECRET: process.env.JWT_SECRET ?? 'jwt_secret',
  EMAIL: process.env.EMAIL ?? '',
  EMAIL_PASS: process.env.EMAIL_PASS ?? '',
  APP_GLOBAL_PREFIX: 'api',
};
