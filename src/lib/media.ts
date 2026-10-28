import fs from "node:fs"
import path from "node:path"

export function existingGiftImages() {
  const directory = path.join(process.cwd(), "public", "images", "gifts")
  if (!fs.existsSync(directory)) return []

  return fs
    .readdirSync(directory)
    .filter((file) => /\.(jpe?g|png|webp|avif)$/i.test(file))
    .map((file) => `/images/gifts/${file}`)
}
