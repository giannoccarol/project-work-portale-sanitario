import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1787500000000 implements MigrationInterface {
  name = 'InitialSchema1787500000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    // Consente di adottare le migration su un database demo gia creato da synchronize.
    if (await queryRunner.hasTable('structure')) return;

    await queryRunner.query(`CREATE TABLE "structure" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar(200) NOT NULL, "address" varchar(300), "phone" varchar(50), "is_active" boolean NOT NULL DEFAULT (1), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`);
    await queryRunner.query(`CREATE TABLE "user" ("id" varchar PRIMARY KEY NOT NULL, "email" varchar(200) NOT NULL, "password_hash" varchar NOT NULL, "role" varchar(20) NOT NULL, "first_name" varchar(100), "last_name" varchar(100), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_user_email" UNIQUE ("email"))`);
    await queryRunner.query(`CREATE TABLE "patient" ("id" varchar PRIMARY KEY NOT NULL, "fiscal_code" varchar(16), "birth_date" date, "anamnesi" text, "allergie" text, "user_id" varchar, "structure_id" varchar, CONSTRAINT "UQ_patient_user" UNIQUE ("user_id"), CONSTRAINT "FK_patient_user" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE RESTRICT, CONSTRAINT "FK_patient_structure" FOREIGN KEY ("structure_id") REFERENCES "structure" ("id") ON DELETE RESTRICT)`);
    await queryRunner.query(`CREATE UNIQUE INDEX "UQ_patient_fiscal_code" ON "patient" ("fiscal_code")`);
    await queryRunner.query(`CREATE TABLE "specialization" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar(150) NOT NULL, "description" text, "is_active" boolean NOT NULL DEFAULT (1), "structure_id" varchar, CONSTRAINT "FK_specialization_structure" FOREIGN KEY ("structure_id") REFERENCES "structure" ("id") ON DELETE RESTRICT)`);
    await queryRunner.query(`CREATE TABLE "doctor" ("id" varchar PRIMARY KEY NOT NULL, "bio" text, "is_active" boolean NOT NULL DEFAULT (1), "user_id" varchar, "structure_id" varchar, "specialization_id" varchar, CONSTRAINT "UQ_doctor_user" UNIQUE ("user_id"), CONSTRAINT "FK_doctor_user" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE RESTRICT, CONSTRAINT "FK_doctor_structure" FOREIGN KEY ("structure_id") REFERENCES "structure" ("id") ON DELETE RESTRICT, CONSTRAINT "FK_doctor_specialization" FOREIGN KEY ("specialization_id") REFERENCES "specialization" ("id") ON DELETE RESTRICT)`);
    await queryRunner.query(`CREATE TABLE "appointment" ("id" varchar PRIMARY KEY NOT NULL, "startTime" datetime NOT NULL, "endTime" datetime NOT NULL, "status" varchar(20) NOT NULL DEFAULT ('booked'), "reason" text, "clinical_data_access_granted" boolean NOT NULL DEFAULT (0), "patient_id" varchar, "doctor_id" varchar, "structure_id" varchar, CONSTRAINT "FK_appointment_patient" FOREIGN KEY ("patient_id") REFERENCES "patient" ("id") ON DELETE RESTRICT, CONSTRAINT "FK_appointment_doctor" FOREIGN KEY ("doctor_id") REFERENCES "doctor" ("id") ON DELETE RESTRICT, CONSTRAINT "FK_appointment_structure" FOREIGN KEY ("structure_id") REFERENCES "structure" ("id") ON DELETE RESTRICT)`);
    await queryRunner.query(`CREATE UNIQUE INDEX "UQ_appointment_doctor_start_booked" ON "appointment" ("doctor_id", "startTime") WHERE "status" = 'booked'`);
    await queryRunner.query(`CREATE TABLE "report" ("id" varchar PRIMARY KEY NOT NULL, "diagnosis" text NOT NULL, "prescriptions" text, "notes" text, "status" varchar(20) NOT NULL DEFAULT ('draft'), "attachment_path" varchar(500), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "appointment_id" varchar, "patient_id" varchar, "doctor_id" varchar, "structure_id" varchar, CONSTRAINT "UQ_report_appointment" UNIQUE ("appointment_id"), CONSTRAINT "FK_report_appointment" FOREIGN KEY ("appointment_id") REFERENCES "appointment" ("id") ON DELETE RESTRICT, CONSTRAINT "FK_report_patient" FOREIGN KEY ("patient_id") REFERENCES "patient" ("id") ON DELETE RESTRICT, CONSTRAINT "FK_report_doctor" FOREIGN KEY ("doctor_id") REFERENCES "doctor" ("id") ON DELETE RESTRICT, CONSTRAINT "FK_report_structure" FOREIGN KEY ("structure_id") REFERENCES "structure" ("id") ON DELETE RESTRICT)`);
    await queryRunner.query(`CREATE TABLE "review" ("id" varchar PRIMARY KEY NOT NULL, "rating" integer NOT NULL, "comment" text, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "patient_id" varchar, "doctor_id" varchar, "appointment_id" varchar, CONSTRAINT "FK_review_patient" FOREIGN KEY ("patient_id") REFERENCES "patient" ("id") ON DELETE RESTRICT, CONSTRAINT "FK_review_doctor" FOREIGN KEY ("doctor_id") REFERENCES "doctor" ("id") ON DELETE RESTRICT, CONSTRAINT "FK_review_appointment" FOREIGN KEY ("appointment_id") REFERENCES "appointment" ("id") ON DELETE RESTRICT)`);
    await queryRunner.query(`CREATE UNIQUE INDEX "UQ_review_appointment" ON "review" ("appointment_id")`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    for (const table of ['review', 'report', 'appointment', 'doctor', 'specialization', 'patient', 'user', 'structure']) {
      if (await queryRunner.hasTable(table)) await queryRunner.dropTable(table, true, true, true);
    }
  }
}
