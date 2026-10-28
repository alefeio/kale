import { weddingConfig } from "@/config/wedding"
import type { AttendanceStatus } from "@/types/invitation"

export function RSVPConfirmation({
  status,
  onEdit,
}: {
  status: Exclude<AttendanceStatus, "pending">
  onEdit: () => void
}) {
  const { copy } = weddingConfig
  const confirmed = status === "confirmed"
  const title = confirmed ? copy.invitationConfirmedTitle : copy.invitationDeclinedTitle
  const detail = confirmed ? copy.invitationConfirmedText : copy.invitationDeclinedText

  return (
    <div className="mt-12 border border-olive/15 px-6 py-10 text-center" role="status">
      <p className="font-serif text-3xl leading-snug text-olive-dark">{title}</p>
      {detail ? <p className="mt-4 leading-7 text-brown">{detail}</p> : null}
      <button type="button" className="btn btn-secondary mt-8" onClick={onEdit}>
        {copy.invitationEdit}
      </button>
    </div>
  )
}
