# ADMIN-P2 — Gift categories expand/contract

## Goal

Move gift categories from a fixed Prisma enum to `GiftCatalogCategory` without inventing fake enum values for new categories.

## Migration `20261108120000_add_gift_catalog_categories`

1. Create `GiftCatalogCategory`.
2. Insert the five legacy categories with stable IDs (`gcat_*`).
3. Add `Gift.categoryId` + `Gift.imagePublicId`.
4. Backfill `categoryId` from the legacy enum column.
5. Make `categoryId` required and keep the enum column nullable as `legacyCategory`.

## Compatibility

- Older app versions can still read the nullable enum column.
- New categories exist only as catalog rows.
- A later migration may drop the enum after all environments run the new code.

## Safety

- Apply only on isolated PostgreSQL in this sprint.
- Do not run against Preview/Production shared database without explicit authorization.
