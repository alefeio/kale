"use client"

import { useEffect, useState } from "react"
import { GuestSelector } from "@/components/invitation/GuestSelector"
import { InvalidInvitation } from "@/components/invitation/InvalidInvitation"
import { InvitationHeader } from "@/components/invitation/InvitationHeader"
import { InvitationSkeleton } from "@/components/invitation/InvitationSkeleton"
import { RSVPConfirmation } from "@/components/invitation/RSVPConfirmation"
import { weddingConfig } from "@/config/wedding"
import { rsvpService } from "@/services/rsvp"
import type { Invitation } from "@/types/invitation"

export function InvitationExperience({ token }: { token: string }) {
  const [invitation, setInvitation] = useState<Invitation | null | undefined>(undefined)
  const [editing, setEditing] = useState(false)
  const [selection, setSelection] = useState<Record<string, boolean>>({})
  const [note, setNote] = useState("")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")
  const { copy } = weddingConfig

  useEffect(() => {
    let active = true
    rsvpService.getInvitationByToken(token).then((data) => {
      if (!active) return
      setInvitation(data)
      if (data) {
        setSelection(
          Object.fromEntries(data.guests.map((guest) => [guest.id, Boolean(guest.attending)])),
        )
        setNote(data.message)
      }
    })
    return () => {
      active = false
    }
  }, [token])

  if (invitation === undefined) return <InvitationSkeleton />
  if (!invitation) return <InvalidInvitation />

  const showForm = invitation.status === "pending" || editing

  async function save(nextSelection: Record<string, boolean>) {
    setPending(true)
    setError("")
    const payload = {
      token: invitation!.token,
      guests: invitation!.guests.map((guest) => ({
        id: guest.id,
        attending: Boolean(nextSelection[guest.id]),
      })),
      message: note,
    }

    try {
      const updated =
        invitation!.status === "pending"
          ? await rsvpService.confirmAttendance(payload)
          : await rsvpService.updateAttendance(payload)
      setInvitation(updated)
      setSelection(
        Object.fromEntries(updated.guests.map((guest) => [guest.id, Boolean(guest.attending)])),
      )
      setNote(updated.message)
      setEditing(false)
    } catch {
      setError("Não foi possível guardar a confirmação agora.")
    } finally {
      setPending(false)
    }
  }

  function confirm() {
    const someone = invitation!.guests.some((guest) => selection[guest.id])
    if (!someone) {
      setError("Selecione quem poderá estar conosco ou informe que não poderão comparecer.")
      return
    }
    void save(selection)
  }

  function decline() {
    const none = Object.fromEntries(invitation!.guests.map((guest) => [guest.id, false]))
    setSelection(none)
    void save(none)
  }

  return (
    <div className="mx-auto w-full max-w-lg px-5 py-16 sm:py-20">
      <InvitationHeader greeting={invitation.greeting} label={invitation.label} />

      {showForm ? (
        <form
          className="mt-4"
          onSubmit={(event) => {
            event.preventDefault()
            confirm()
          }}
        >
          <GuestSelector
            guests={invitation.guests}
            selection={selection}
            onToggle={(id) => {
              setError("")
              setSelection((current) => ({ ...current, [id]: !current[id] }))
            }}
          />

          <label htmlFor="recado" className="mt-10 block text-sm text-brown">
            {copy.invitationNote}
          </label>
          <textarea
            id="recado"
            name="recado"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={4}
            className="field mt-2 min-h-32 resize-y"
          />

          {error ? (
            <p role="alert" className="mt-4 text-sm text-olive-dark">
              {error}
            </p>
          ) : null}

          <div className="mt-8 flex flex-col gap-3">
            <button type="submit" className="btn btn-primary" disabled={pending}>
              {pending ? "Guardando..." : copy.invitationConfirm}
            </button>
            <button type="button" className="btn btn-ghost" onClick={decline} disabled={pending}>
              {copy.invitationDecline}
            </button>
          </div>
        </form>
      ) : (
        <RSVPConfirmation
          status={invitation.status === "declined" ? "declined" : "confirmed"}
          onEdit={() => setEditing(true)}
        />
      )}
    </div>
  )
}
