export type AttendanceStatus = "pending" | "confirmed" | "declined"

export interface Guest {
  id: string
  name: string
  attending: boolean | null
}

export interface Invitation {
  token: string
  label: string
  greeting: string
  guests: Guest[]
  message: string
  status: AttendanceStatus
}

export interface AttendanceInput {
  token: string
  guests: { id: string; attending: boolean }[]
  message?: string
}

export interface InvitationSeed {
  token: string
  label: string
  greeting: string
  guests: { id: string; name: string }[]
}
