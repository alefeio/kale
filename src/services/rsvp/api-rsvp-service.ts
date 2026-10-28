import { apiFetch, ApiError } from "@/services/http"
import type { RsvpService } from "@/services/rsvp/rsvp-service"
import type { Invitation } from "@/types/invitation"

export const apiRsvpService: RsvpService = {
  async getInvitationByToken(token) {
    try {
      return await apiFetch<Invitation>(`/api/invitations/${encodeURIComponent(token)}`)
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null
      throw error
    }
  },

  async confirmAttendance(data) {
    return saveAttendance(data)
  },

  async updateAttendance(data) {
    return saveAttendance(data)
  },
}

function saveAttendance(data: Parameters<RsvpService["confirmAttendance"]>[0]) {
  return apiFetch<Invitation>(`/api/invitations/${encodeURIComponent(data.token)}/rsvp`, {
    method: "PUT",
    body: JSON.stringify({
      guests: data.guests,
      message: data.message,
    }),
  })
}
