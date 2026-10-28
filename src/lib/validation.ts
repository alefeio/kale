import { z } from "zod"

const tokenPattern = /^[A-Za-z0-9_-]{1,200}$/
const idPattern = /^[A-Za-z0-9_-]{1,40}$/

export const invitationTokenSchema = z.string().trim().regex(tokenPattern)
export const recordIdSchema = z.string().trim().regex(idPattern)

function emptyToUndefined(value: unknown) {
  if (typeof value !== "string") return value
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

export const rsvpSchema = z.object({
  guests: z
    .array(
      z.object({
        id: recordIdSchema,
        attending: z.boolean(),
      }),
    )
    .min(1)
    .max(30),
  message: z.preprocess(emptyToUndefined, z.string().max(1000).optional()),
})

export const reserveGiftSchema = z.object({
  donorName: z.string().trim().min(1).max(120),
  donorContact: z.preprocess(emptyToUndefined, z.string().max(120).optional()),
  message: z.preprocess(emptyToUndefined, z.string().max(500).optional()),
})

export const coupleMessageSchema = z.object({
  name: z.string().trim().min(1).max(120),
  message: z.string().trim().min(1).max(2000),
})
