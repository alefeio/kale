import assert from "node:assert/strict"
import { test } from "node:test"
import { planGiftDefaultImages } from "./gift-default-images"
import { isDisplayableGiftImage, isRemoteGiftImage } from "./gift-images"

test("remote https gift images are displayable even without local files", () => {
  assert.equal(isRemoteGiftImage("https://cdn.example.com/gift.webp"), true)
  assert.equal(isDisplayableGiftImage("https://cdn.example.com/gift.webp", []), true)
  assert.equal(isDisplayableGiftImage("/images/gifts/missing.jpg", []), false)
  assert.equal(
    isDisplayableGiftImage("/images/gifts/jogo-de-pratos.jpg", ["/images/gifts/jogo-de-pratos.jpg"]),
    true,
  )
})

test("default image seed plan is idempotent and preserves custom images", () => {
  const report = planGiftDefaultImages([
    { slug: "jogo-de-pratos", image: null },
    { slug: "jogo-de-copos", image: "/images/gifts/custom.webp" },
  ])
  assert.equal(report.updatable.includes("jogo-de-pratos"), true)
  assert.equal(report.ignoredCustom.includes("jogo-de-copos"), true)
  assert.equal(report.missing.includes("tapete-de-sala"), true)
})
