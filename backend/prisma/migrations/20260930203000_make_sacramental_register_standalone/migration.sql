-- Convert sacramental acts from User-linked records to self-contained registry records.
-- Existing names and birth dates are copied before the User foreign key is removed.

ALTER TABLE "sacramental_acts"
  ADD COLUMN "personFirstName" TEXT,
  ADD COLUMN "personLastName" TEXT,
  ADD COLUMN "personBirthDate" TIMESTAMP(3);

UPDATE "sacramental_acts" sa
SET
  "personFirstName" = u."firstName",
  "personLastName" = u."lastName",
  "personBirthDate" = f."birthDate"
FROM "users" u
LEFT JOIN "faithful" f ON f."userId" = u."id"
WHERE sa."personId" = u."id";

ALTER TABLE "sacramental_acts"
  ALTER COLUMN "personFirstName" SET NOT NULL,
  ALTER COLUMN "personLastName" SET NOT NULL;

ALTER TABLE "sacramental_acts"
  DROP CONSTRAINT IF EXISTS "sacramental_acts_personId_fkey";

DROP INDEX IF EXISTS "sacramental_acts_personId_idx";

ALTER TABLE "sacramental_acts"
  DROP COLUMN "personId";
