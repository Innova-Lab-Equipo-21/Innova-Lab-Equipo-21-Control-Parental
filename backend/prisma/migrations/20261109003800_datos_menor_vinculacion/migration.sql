-- CreateEnum
CREATE TYPE "public"."PersonType" AS ENUM ('MENOR', 'ADULTO');

-- AlterTable
ALTER TABLE "public"."devices" ADD COLUMN     "birth_date" DATE,
ADD COLUMN     "gender" "public"."Gender",
ADD COLUMN     "person_type" "public"."PersonType",
ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "public"."device_pairings" ADD COLUMN     "birth_date" DATE,
ADD COLUMN     "child_name" TEXT,
ADD COLUMN     "gender" "public"."Gender",
ADD COLUMN     "person_type" "public"."PersonType",
ADD COLUMN     "phone" TEXT,
ALTER COLUMN "expires_at" DROP NOT NULL;