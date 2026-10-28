import type { AttendanceInput, Invitation } from "@/types/invitation"

export interface RsvpService {
  getInvitationByToken(token: string): Promise<Invitation | null>
  confirmAttendance(data: AttendanceInput): Promise<Invitation>
  updateAttendance(data: AttendanceInput): Promise<Invitation>
}
