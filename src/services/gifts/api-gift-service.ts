import { apiFetch } from "@/services/http"
import type { GiftService } from "@/services/gifts/gift-service"
import type { Gift, GiftCategoryOption } from "@/types/gift"

type GiftsApiResponse =
  | Gift[]
  | {
      gifts: Gift[]
      categories: GiftCategoryOption[]
    }

function normalizeCatalog(payload: GiftsApiResponse) {
  if (Array.isArray(payload)) {
    const categories = [...new Map(
      payload.map((gift) => [
        gift.category,
        { slug: gift.category, label: gift.categoryLabel || gift.category },
      ]),
    ).values()]
    return { gifts: payload, categories }
  }
  return {
    gifts: payload.gifts ?? [],
    categories: payload.categories ?? [],
  }
}

export const apiGiftService: GiftService = {
  async getGifts() {
    const payload = await apiFetch<GiftsApiResponse>("/api/gifts")
    return normalizeCatalog(payload)
  },

  async reserveGift(id, data) {
    return apiFetch<Gift>(`/api/gifts/${encodeURIComponent(id)}/reserve`, {
      method: "POST",
      body: JSON.stringify({
        invitationCode: data.invitationCode,
        donorName: data.donorName,
        donorContact: data.donorContact,
        message: data.message,
      }),
    })
  },
}
