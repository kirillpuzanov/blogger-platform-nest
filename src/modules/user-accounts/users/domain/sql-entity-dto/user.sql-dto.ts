export class UserSqlDto {
  id: string;
  login: string;
  email: string;
  password_hash: string;
  created_at: Date;

  is_confirmed: boolean;

  confirmation_code?: string | null;
  confirmation_expiration?: Date | null;
  confirmation_sent_date?: Date | null;

  recovery_code?: string | null;
  recovery_expiration?: Date | null;
  recovery_sent_code?: Date | null;
}
