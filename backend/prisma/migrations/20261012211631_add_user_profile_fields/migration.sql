/*
  Warnings:

  - You are about to drop the column `password_hash` on the `users` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MASCULINO', 'FEMENINO', 'OTRO', 'NO_INFORMADO');

-- AlterTable
ALTER TABLE "users" DROP COLUMN "password_hash",
ADD COLUMN     "birth_date" DATE,
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "phone" TEXT;
