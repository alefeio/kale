import assert from "node:assert/strict"
import { test } from "node:test"
import {
  categoryIdForLegacyCode,
  LEGACY_GIFT_CATEGORIES,
  legacyCodeForCategorySlug,
  slugifyCategoryName,
} from "./gift-categories"

test("legacy categories map to stable catalog ids and public slugs", () => {
  assert.equal(LEGACY_GIFT_CATEGORIES.length, 5)
  assert.equal(categoryIdForLegacyCode("TABLE"), "gcat_mesa")
  assert.equal(legacyCodeForCategorySlug("cozinha"), "KITCHEN")
  assert.equal(legacyCodeForCategorySlug("nova-categoria"), null)
})

test("category slugify stays ascii and stable", () => {
  assert.equal(slugifyCategoryName("Mesa Posta"), "mesa-posta")
  assert.equal(slugifyCategoryName("  "), "categoria")
})
