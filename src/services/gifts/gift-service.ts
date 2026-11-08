import type { Gift, GiftCategoryOption, GiftReservationData } from "@/types/gift"

export type GiftCatalogPayload = {
  gifts: Gift[]
  categories: GiftCategoryOption[]
}

export interface GiftService {
  getGifts(): Promise<GiftCatalogPayload>
  reserveGift(id: string, data: GiftReservationData): Promise<Gift>
}
