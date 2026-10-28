import { giftSeeds } from "@/data/gifts.mock"
import { readJson, writeJson } from "@/lib/storage"
import type { Gift, GiftReservationData } from "@/types/gift"
import type { GiftService } from "@/services/gifts/gift-service"

const STORAGE_KEY = "ka-gifts-v1"

type GiftStore = Record<string, { reservedAt: string }>

function mergeGifts(): Gift[] {
  const stored = readJson<GiftStore>(STORAGE_KEY, {})

  return giftSeeds.map((gift) => ({
    ...gift,
    status: gift.status === "reserved" || stored[gift.id] ? "reserved" : "available",
  }))
}

export const mockGiftService: GiftService = {
  async getGifts() {
    return mergeGifts()
  },

  async reserveGift(id, data: GiftReservationData = {}) {
    const gift = giftSeeds.find((item) => item.id === id)
    if (!gift) throw new Error("Presente não encontrado")

    if (gift.status !== "reserved") {
      const stored = readJson<GiftStore>(STORAGE_KEY, {})
      stored[id] = { reservedAt: data.reservedAt ?? new Date().toISOString() }
      writeJson(STORAGE_KEY, stored)
    }

    return { ...gift, status: "reserved" }
  },

  async cancelReservation(id) {
    const gift = giftSeeds.find((item) => item.id === id)
    if (!gift) throw new Error("Presente não encontrado")

    const stored = readJson<GiftStore>(STORAGE_KEY, {})
    delete stored[id]
    writeJson(STORAGE_KEY, stored)

    return {
      ...gift,
      status: gift.status === "reserved" ? "reserved" : "available",
    }
  },
}
