import assert from "node:assert/strict"
import { test } from "node:test"
import { planGiftDefaultImages } from "./gift-default-images"
import {
  isDisplayableGiftImage,
  isRemoteGiftImage,
  resolveGiftImagePresentation,
  resolvePublicGiftImage,
} from "./gift-images"

test("remote https gift images are displayable even without local files", () => {
  assert.equal(isRemoteGiftImage("https://cdn.example.com/gift.webp"), true)
  assert.equal(isDisplayableGiftImage("https://cdn.example.com/gift.webp", []), true)
  assert.equal(isDisplayableGiftImage("/images/gifts/missing.webp", []), false)
  assert.equal(
    isDisplayableGiftImage("/images/gifts/jogo-de-pratos.webp", ["/images/gifts/jogo-de-pratos.webp"]),
    true,
  )
})

test("public image resolution prefers custom then default manifest", () => {
  const available = ["/images/gifts/jogo-de-pratos.webp"]
  assert.equal(
    resolvePublicGiftImage("jogo-de-pratos", "https://cdn.example.com/custom.webp", available),
    "https://cdn.example.com/custom.webp",
  )
  assert.equal(
    resolvePublicGiftImage("jogo-de-pratos", "/images/gifts/custom.webp", available),
    "/images/gifts/custom.webp",
  )
  assert.equal(
    resolvePublicGiftImage("jogo-de-pratos", null, available),
    "/images/gifts/jogo-de-pratos.webp",
  )
  assert.equal(resolvePublicGiftImage("jogo-de-pratos", "", ["/images/gifts/other.webp"]), "")
})

test("admin presentation distinguishes custom, default and none", () => {
  const available = ["/images/gifts/jogo-de-pratos.webp"]
  assert.deepEqual(resolveGiftImagePresentation("jogo-de-pratos", null, available), {
    storedImage: "",
    displayImage: "/images/gifts/jogo-de-pratos.webp",
    defaultImage: "/images/gifts/jogo-de-pratos.webp",
    imageSource: "default",
  })
  assert.deepEqual(
    resolveGiftImagePresentation("jogo-de-pratos", "https://cdn.example.com/a.webp", available),
    {
      storedImage: "https://cdn.example.com/a.webp",
      displayImage: "https://cdn.example.com/a.webp",
      defaultImage: "/images/gifts/jogo-de-pratos.webp",
      imageSource: "custom",
    },
  )
  assert.deepEqual(resolveGiftImagePresentation("presente-sem-manifesto", null, available), {
    storedImage: "",
    displayImage: "",
    defaultImage: "",
    imageSource: "none",
  })
  assert.deepEqual(
    resolveGiftImagePresentation("jogo-de-pratos", null, ["/images/gifts/other.webp"]),
    {
      storedImage: "",
      displayImage: "",
      defaultImage: "",
      imageSource: "none",
    },
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
