import { apiFetch } from "@/services/http"
import type { MessageService } from "@/services/messages/message-service"

export const apiMessageService: MessageService = {
  async sendMessage(data) {
    return apiFetch<{ ok: true }>("/api/messages", {
      method: "POST",
      body: JSON.stringify({
        name: data.name,
        message: data.message,
      }),
    })
  },
}
