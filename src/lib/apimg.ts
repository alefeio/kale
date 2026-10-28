const MAX_IMAGE_BYTES = 10 * 1024 * 1024

const formats = new Set(["jpg", "jpeg", "png", "webp"])

export function publicSiteUploadScope() {
  return {
    kind: "site" as const,
    folder: process.env.APIMG_SITE_UPLOAD_FOLDER?.trim() || "kale/site",
  }
}

export function projectUploadScope() {
  return {
    kind: "project" as const,
    folder: process.env.APIMG_UPLOAD_FOLDER?.trim() || "kale/uploads",
  }
}

export function apimgEnvStatus() {
  return {
    APIMG_API_KEY: process.env.APIMG_API_KEY?.trim() ? "SET" : "NOT SET",
    APIMG_UPLOAD_URL: process.env.APIMG_UPLOAD_URL?.trim() ? "SET" : "NOT SET",
    APIMG_UPLOAD_FOLDER: process.env.APIMG_UPLOAD_FOLDER?.trim() ? "SET" : "NOT SET",
    APIMG_SITE_UPLOAD_FOLDER: process.env.APIMG_SITE_UPLOAD_FOLDER?.trim() ? "SET" : "NOT SET",
  } as const
}

export function inspectImage(bytes: Uint8Array, mime: string, size: number) {
  if (size <= 0) return { ok: false as const, error: "Selecione uma imagem." }
  if (size > MAX_IMAGE_BYTES) return { ok: false as const, error: "A imagem pode ter no máximo 10 MB." }
  const kind = imageKind(bytes)
  const expected = kind === "jpeg" ? "image/jpeg" : kind === "png" ? "image/png" : kind === "webp" ? "image/webp" : null
  if (!kind || mime !== expected) return { ok: false as const, error: "Envie uma imagem JPEG, PNG ou WebP." }
  return { ok: true as const, kind }
}

function imageKind(bytes: Uint8Array) {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpeg" as const
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "png" as const
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "webp" as const
  }
  return null
}

export function createApimgFormData(file: Blob) {
  const site = publicSiteUploadScope()
  const project = projectUploadScope()
  if (site.kind !== "site" || !site.folder || !project.folder) {
    throw new Error("A foto do Hero pertence à mídia pública do site.")
  }
  const body = new FormData()
  body.append("file", file)
  return body
}

export function parseApimgUploadResponse(payload: unknown) {
  if (!payload || typeof payload !== "object") return { ok: false as const, error: "invalid" }
  const data = payload as Record<string, unknown>
  if (typeof data.url !== "string" || !data.url.startsWith("https://")) return { ok: false as const, error: "invalid" }
  if (typeof data.public_id !== "string" || !data.public_id.trim()) return { ok: false as const, error: "invalid" }
  if (typeof data.format !== "string" || !formats.has(data.format.toLowerCase())) return { ok: false as const, error: "invalid" }
  if (typeof data.bytes !== "number" || !Number.isFinite(data.bytes) || data.bytes < 0) {
    return { ok: false as const, error: "invalid" }
  }
  return {
    ok: true as const,
    url: data.url,
    publicId: data.public_id,
    format: data.format.toLowerCase(),
    bytes: data.bytes,
  }
}

function safeErrorCode(payload: unknown) {
  if (!payload || typeof payload !== "object") return undefined
  const data = payload as Record<string, unknown>
  const value = data.error ?? data.code ?? data.message
  if (typeof value !== "string") return undefined
  return value.replace(/[\r\n]/g, " ").slice(0, 120)
}

export async function uploadPublicSiteImage(file: File) {
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer())
  const inspected = inspectImage(bytes, file.type, file.size)
  if (!inspected.ok) return inspected

  const uploadUrl = process.env.APIMG_UPLOAD_URL?.trim()
  const apiKey = process.env.APIMG_API_KEY?.trim()
  if (!uploadUrl || !apiKey) {
    console.error("APIMG upload failed", { reason: "configuration missing" })
    return { ok: false as const, error: "Não foi possível enviar a imagem. Tente novamente." }
  }

  const body = createApimgFormData(file)
  let response: Response
  try {
    response = await fetch(uploadUrl, {
      method: "POST",
      headers: { "X-API-Key": apiKey },
      body,
    })
  } catch (error) {
    console.error("APIMG upload failed", { reason: error instanceof Error ? error.name : "fetch" })
    return { ok: false as const, error: "Não foi possível enviar a imagem. Tente novamente." }
  }

  const raw = await response.text()
  let payload: unknown = null
  try {
    payload = raw ? JSON.parse(raw) : null
  } catch {
    payload = null
  }

  if (!response.ok) {
    console.error("APIMG upload failed", { status: response.status, code: safeErrorCode(payload) })
    return { ok: false as const, error: "Não foi possível enviar a imagem. Tente novamente." }
  }

  const parsed = parseApimgUploadResponse(payload)
  if (!parsed.ok) {
    console.error("APIMG upload failed", { status: response.status, code: "invalid-response" })
    return { ok: false as const, error: "Não foi possível enviar a imagem. Tente novamente." }
  }
  return parsed
}
