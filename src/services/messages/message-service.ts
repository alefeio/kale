import type { GuestMessageInput, GuestMessageResult } from "@/types/message"

export interface MessageService {
  sendMessage(data: GuestMessageInput): Promise<GuestMessageResult>
}
