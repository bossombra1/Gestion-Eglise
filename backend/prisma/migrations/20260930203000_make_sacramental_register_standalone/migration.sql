-- Convert sacramental acts from User-linked records to self-contained registry records.
-- Existing names and birth dates are copied before the User foreign key is removed.

ALTER TABLE "sacramental_acts"
  ADD COLUMN "person_first_name" TEXT,
  ADD COLUMN "person_last_name" TEXT,
  ADD COLUMN "person_birth_date" TIMESTAMP(3);

UPDATE "sacramental_acts" sa
SET
  "person_first_name" = u."firstName",
  "person_last_name" = u."lastName",
  "person_birth_date" = f."birthDate"
FROM "users" u
LEFT JOIN "faithful" f ON f."userId" = u."id"
WHERE sa."person_id" = u."id";

ALTER TABLE "sacramental_acts"
  ALTER COLUMN "person_first_name" SET NOT NULL,
  ALTER COLUMN "person_last_name" SET NOT NULL;

ALTER TABLE "sacramental_acts"
  DROP CONSTRAINT IF EXISTS "sacramental_acts_person_id_fkey";

DROP INDEX IF EXISTS "sacramental_acts_person_id_idx";

ALTER TABLE "sacramental_acts"
  DROP COLUMN "person_id";
