import type { Gift, GiftReservationData } from "@/types/gift"

export interface GiftService {
  getGifts(): Promise<Gift[]>
  reserveGift(id: string, data: GiftReservationData): Promise<Gift>
}
