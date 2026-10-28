import { invitationSeeds } from "@/data/invitations.mock"
import { readJson, writeJson } from "@/lib/storage"
import type {
  AttendanceInput,
  AttendanceStatus,
  Guest,
  Invitation,
} from "@/types/invitation"
import type { RsvpService } from "@/services/rsvp/rsvp-service"

const STORAGE_KEY = "ka-rsvp-v1"

interface StoredResponse {
  guests: { id: string; attending: boolean }[]
  message: string
  updatedAt: string
}

type RsvpStore = Record<string, StoredResponse>

function deriveStatus(guests: Guest[]): AttendanceStatus {
  if (guests.every((guest) => guest.attending === null)) return "pending"
  if (guests.some((guest) => guest.attending)) return "confirmed"
  return "declined"
}

function materialize(token: string): Invitation | null {
  const seed = invitationSeeds.find((item) => item.token === token)
  if (!seed) return null

  const stored = readJson<RsvpStore>(STORAGE_KEY, {})[token]
  const guests = seed.guests.map((guest) => {
    const saved = stored?.guests.find((item) => item.id === guest.id)
    return {
      id: guest.id,
      name: guest.name,
      attending: saved ? saved.attending : null,
    }
  })

  return {
    token: seed.token,
    label: seed.label,
    greeting: seed.greeting,
    guests,
    message: stored?.message ?? "",
    status: deriveStatus(guests),
  }
}

function persist(data: AttendanceInput): Invitation {
  const current = materialize(data.token.trim())
  if (!current) {
    throw new Error("Convite não encontrado")
  }

  const knownIds = new Set(current.guests.map((guest) => guest.id))
  const guests = current.guests.map((guest) => {
    const incoming = data.guests.find((item) => item.id === guest.id)
    if (!incoming || !knownIds.has(guest.id)) {
      return { ...guest, attending: false }
    }
    return { ...guest, attending: incoming.attending }
  })

  const store = readJson<RsvpStore>(STORAGE_KEY, {})
  store[current.token] = {
    guests: guests.map((guest) => ({
      id: guest.id,
      attending: Boolean(guest.attending),
    })),
    message: data.message?.trim() ?? "",
    updatedAt: new Date().toISOString(),
  }
  writeJson(STORAGE_KEY, store)

  return {
    ...current,
    guests,
    message: data.message?.trim() ?? "",
    status: deriveStatus(guests),
  }
}

export const mockRsvpService: RsvpService = {
  async getInvitationByToken(token) {
    return materialize(token.trim())
  },

  async confirmAttendance(data) {
    return persist(data)
  },

  async updateAttendance(data) {
    return persist(data)
  },
}
