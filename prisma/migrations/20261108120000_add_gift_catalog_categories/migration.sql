-- Expand: dynamic gift categories + optional image public id.
-- Legacy GiftCategory enum column is kept (nullable) for compatibility with older deploys.
-- New categories must be GiftCatalogCategory rows only — never fake enum values.

CREATE TABLE "GiftCatalogCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "GiftCatalogCategory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "GiftCatalogCategory_slug_key" ON "GiftCatalogCategory"("slug");

INSERT INTO "GiftCatalogCategory" ("id", "name", "slug", "description", "sortOrder", "active", "createdAt", "updatedAt")
VALUES
  ('gcat_cozinha', 'Cozinha', 'cozinha', NULL, 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('gcat_mesa', 'Mesa', 'mesa', NULL, 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('gcat_casa', 'Casa', 'casa', NULL, 3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('gcat_eletros', 'Eletros', 'eletros', NULL, 4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('gcat_banho', 'Banho', 'banho', NULL, 5, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

ALTER TABLE "Gift" ADD COLUMN "categoryId" TEXT;
ALTER TABLE "Gift" ADD COLUMN "imagePublicId" TEXT;

UPDATE "Gift" SET "categoryId" = CASE "category"
  WHEN 'KITCHEN' THEN 'gcat_cozinha'
  WHEN 'TABLE' THEN 'gcat_mesa'
  WHEN 'HOME' THEN 'gcat_casa'
  WHEN 'APPLIANCES' THEN 'gcat_eletros'
  WHEN 'BATH' THEN 'gcat_banho'
END
WHERE "categoryId" IS NULL;

ALTER TABLE "Gift" ALTER COLUMN "categoryId" SET NOT NULL;
ALTER TABLE "Gift" ALTER COLUMN "category" DROP NOT NULL;

CREATE INDEX "Gift_categoryId_idx" ON "Gift"("categoryId");

ALTER TABLE "Gift"
  ADD CONSTRAINT "Gift_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "GiftCatalogCategory"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
