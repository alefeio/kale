import { z } from "zod"
import { normalizeWhatsapp } from "@/lib/phone"

const tokenPattern = /^[A-Za-z0-9_-]{1,200}$/
const idPattern = /^[A-Za-z0-9_-]{1,40}$/
const invitationCodePattern = /^[A-HJ-NP-Z2-9]{10}$/

export const invitationTokenSchema = z.string().trim().regex(tokenPattern)
export const recordIdSchema = z.string().trim().regex(idPattern)
export const invitationCodeSchema = z.string().trim().toUpperCase().regex(invitationCodePattern)
export const brazilianMobileSchema = z
  .string()
  .trim()
  .transform(normalizeWhatsapp)
  .refine((value) => value.length === 11 && value[2] === "9")

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

const reservationMessageSchema = z.preprocess(emptyToUndefined, z.string().max(500).optional())

export const recognizedReserveSchema = z.object({
  message: reservationMessageSchema,
})

export const publicReserveSchema = z.object({
  donorName: z.string().trim().min(1).max(120),
  donorContact: brazilianMobileSchema,
  invitationCode: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  message: reservationMessageSchema,
})

export const coupleMessageSchema = z.object({
  name: z.string().trim().min(1).max(120),
  message: z.string().trim().min(1).max(2000),
})

export const createInvitationSchema = z.object({
  label: z.string().trim().min(1).max(120),
  greeting: z.preprocess(emptyToUndefined, z.string().max(500).optional()),
  guests: z.array(z.string().trim().min(1).max(120)).min(1).max(30),
})

export const updateInvitationSchema = z.object({
  id: recordIdSchema,
  label: z.string().trim().min(1).max(120),
  greeting: z.preprocess(emptyToUndefined, z.string().max(500).optional()),
  active: z.boolean(),
})

export const guestNameSchema = z.object({
  id: recordIdSchema,
  name: z.string().trim().min(1).max(120),
})

export const addGuestSchema = z.object({
  invitationId: recordIdSchema,
  name: z.string().trim().min(1).max(120),
})

export const giftCategorySchema = z.enum(["KITCHEN", "TABLE", "HOME", "APPLIANCES", "BATH"])

export const giftInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  category: giftCategorySchema,
  sortOrder: z.number().int().min(0).max(9999),
  active: z.boolean(),
  description: z.preprocess(emptyToUndefined, z.string().max(500).optional()),
})
