import { readJson, writeJson } from "@/lib/storage"
import type { GuestMessageInput } from "@/types/message"
import type { MessageService } from "@/services/messages/message-service"

const STORAGE_KEY = "ka-messages-v1"

interface StoredMessage extends GuestMessageInput {
  createdAt: string
}

export const mockMessageService: MessageService = {
  async sendMessage(data) {
    const name = data.name.trim()
    const message = data.message.trim()
    if (!name || !message) {
      throw new Error("Preencha o nome e a mensagem.")
    }

    const current = readJson<StoredMessage[]>(STORAGE_KEY, [])
    current.push({
      name,
      message,
      createdAt: new Date().toISOString(),
    })
    writeJson(STORAGE_KEY, current)

    return { ok: true as const }
  },
}
