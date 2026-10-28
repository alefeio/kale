import { apiFetch } from "@/services/http"
import type { GiftService } from "@/services/gifts/gift-service"
import type { Gift } from "@/types/gift"

export const apiGiftService: GiftService = {
  async getGifts() {
    return apiFetch<Gift[]>("/api/gifts")
  },

  async reserveGift(id, data) {
    return apiFetch<Gift>(`/api/gifts/${encodeURIComponent(id)}/reserve`, {
      method: "POST",
      body: JSON.stringify({
        donorName: data.donorName,
        donorContact: data.donorContact,
        message: data.message,
      }),
    })
  },
}
