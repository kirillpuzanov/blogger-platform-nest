import { MigrationInterface, QueryRunner } from 'typeorm';

export class CommentLike1789294606078 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // УДАЛЯЕМ СТАРЫЕ FK (с IF EXISTS)
    await queryRunner.query(
      `ALTER TABLE "comments" DROP CONSTRAINT IF EXISTS "comments_blog_id_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comments" DROP CONSTRAINT IF EXISTS "comments_post_id_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "likes" DROP CONSTRAINT IF EXISTS "likes_user_id_fkey"`,
    );

    // ИЗМЕНЯЕМ ТИП КОЛОНОК (сохраняем данные)
    await queryRunner.query(
      `ALTER TABLE "comments" ALTER COLUMN "user_login" TYPE character varying(50)`,
    );
    await queryRunner.query(
      `ALTER TABLE "comments" ALTER COLUMN "created_at" SET DEFAULT now()`,
    );

    await queryRunner.query(
      `ALTER TABLE "likes" ALTER COLUMN "user_login" TYPE character varying(50)`,
    );
    await queryRunner.query(
      `ALTER TABLE "likes" ALTER COLUMN "status" TYPE character varying(20)`,
    );
    await queryRunner.query(
      `ALTER TABLE "likes" ALTER COLUMN "created_at" SET DEFAULT now()`,
    );

    // ДОБАВЛЯЕМ НОВЫЕ FK
    await queryRunner.query(
      `ALTER TABLE "comments" 
       ADD CONSTRAINT "FK_6754bf738cb68004be154e1d1d5" 
       FOREIGN KEY ("blog_id") REFERENCES "blogs"("id") 
       ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comments" 
       ADD CONSTRAINT "FK_259bf9825d9d198608d1b46b0b5" 
       FOREIGN KEY ("post_id") REFERENCES "posts"("id") 
       ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "likes" 
       ADD CONSTRAINT "FK_3f519ed95f775c781a254089171" 
       FOREIGN KEY ("user_id") REFERENCES "users"("id") 
       ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // УДАЛЯЕМ НОВЫЕ FK (добавленные в up)
    await queryRunner.query(
      `ALTER TABLE "comments" DROP CONSTRAINT IF EXISTS "FK_6754bf738cb68004be154e1d1d5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comments" DROP CONSTRAINT IF EXISTS "FK_259bf9825d9d198608d1b46b0b5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "likes" DROP CONSTRAINT IF EXISTS "FK_3f519ed95f775c781a254089171"`,
    );

    //  ВОЗВРАЩАЕМ СТАРЫЙ ТИП КОЛОНОК
    await queryRunner.query(
      `ALTER TABLE "comments" ALTER COLUMN "user_login" TYPE character varying(100)`,
    );
    await queryRunner.query(
      `ALTER TABLE "likes" ALTER COLUMN "user_login" TYPE character varying(100)`,
    );
    await queryRunner.query(
      `ALTER TABLE "likes" ALTER COLUMN "status" TYPE text`,
    );

    // Возврат DEFAULT КОЛОНОК
    await queryRunner.query(
      `ALTER TABLE "comments" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "likes" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );

    // ВОЗВРАЩАЕМ СТАРЫЕ FK
    await queryRunner.query(
      `ALTER TABLE "comments" 
       ADD CONSTRAINT "comments_blog_id_fkey" 
       FOREIGN KEY ("blog_id") REFERENCES "blogs"("id") 
       ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comments" 
       ADD CONSTRAINT "comments_post_id_fkey" 
       FOREIGN KEY ("post_id") REFERENCES "posts"("id") 
       ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "likes" 
       ADD CONSTRAINT "likes_user_id_fkey" 
       FOREIGN KEY ("user_id") REFERENCES "users"("id") 
       ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
