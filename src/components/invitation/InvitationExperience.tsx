"use client"

import { useEffect, useRef, useState } from "react"
import { GuestSelector } from "@/components/invitation/GuestSelector"
import { InvalidInvitation } from "@/components/invitation/InvalidInvitation"
import { InvitationEventSchedule } from "@/components/invitation/InvitationEventSchedule"
import { InvitationHeader } from "@/components/invitation/InvitationHeader"
import { InvitationSkeleton } from "@/components/invitation/InvitationSkeleton"
import { RSVPConfirmation } from "@/components/invitation/RSVPConfirmation"
import { weddingConfig } from "@/config/wedding"
import {
  canStartGuestWrite,
  loadInvitationView,
  RSVP_SAVE_FAILED_MESSAGE,
  RSVP_UNKNOWN_OUTCOME_HINT,
  type InvitationViewState,
} from "@/lib/guest-recovery"
import { recordInvitationVisit } from "@/lib/invitation-visit-client"
import { shouldRecordInvitationVisit } from "@/lib/invitation-visits"
import { rsvpService } from "@/services/rsvp"
import type { Invitation } from "@/types/invitation"

function selectionFromInvitation(invitation: Invitation) {
  return Object.fromEntries(invitation.guests.map((guest) => [guest.id, Boolean(guest.attending)]))
}

export function InvitationExperience({ token }: { token: string }) {
  const [view, setView] = useState<InvitationViewState>({ status: "loading" })
  const [editing, setEditing] = useState(false)
  const [selection, setSelection] = useState<Record<string, boolean>>({})
  const [note, setNote] = useState("")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")
  const [needsRefresh, setNeedsRefresh] = useState(false)
  const requestId = useRef(0)
  const visitAttempted = useRef(false)
  const { copy } = weddingConfig

  function applyLoaded(next: InvitationViewState) {
    setView(next)
    if (next.status === "success") {
      setSelection(selectionFromInvitation(next.invitation))
      setNote(next.invitation.message)
      setEditing(false)
    }
  }

  useEffect(() => {
    const id = ++requestId.current
    visitAttempted.current = false
    void loadInvitationView(token, (value) => rsvpService.getInvitationByToken(value)).then((next) => {
      if (id !== requestId.current) return
      applyLoaded(next)
      setError("")
      setNeedsRefresh(false)
    })
    return () => {
      requestId.current += 1
    }
  }, [token])

  useEffect(() => {
    if (view.status !== "success") return
    if (view.invitation.token !== token) return
    if (visitAttempted.current) return

    function maybeRecord() {
      if (visitAttempted.current) return
      if (view.status !== "success") return
      if (
        !shouldRecordInvitationVisit({
          viewStatus: view.status,
          visibilityState: document.visibilityState,
          routeToken: token,
          invitationToken: view.invitation.token,
        })
      ) {
        return
      }
      visitAttempted.current = true
      void recordInvitationVisit(token)
    }

    maybeRecord()
    document.addEventListener("visibilitychange", maybeRecord)
    return () => document.removeEventListener("visibilitychange", maybeRecord)
  }, [token, view])

  async function retryLoad() {
    const id = ++requestId.current
    setView({ status: "loading" })
    setError("")
    setNeedsRefresh(false)
    const next = await loadInvitationView(token, (value) => rsvpService.getInvitationByToken(value))
    if (id !== requestId.current) return
    applyLoaded(next)
  }

  if (view.status === "loading") return <InvitationSkeleton />
  if (view.status === "not-found") return <InvalidInvitation />
  if (view.status === "error") {
    return (
      <div className="mx-auto max-w-lg px-5 py-24 text-center">
        <h1 className="font-serif text-4xl text-olive-dark">Convite temporariamente indisponível</h1>
        <p className="mt-4 leading-7 text-brown" role="alert">
          {view.message}
        </p>
        <button type="button" className="btn btn-primary mt-10" onClick={() => void retryLoad()}>
          Tentar novamente
        </button>
      </div>
    )
  }

  const invitation = view.invitation
  const showForm = invitation.status === "pending" || editing

  async function save(nextSelection: Record<string, boolean>) {
    if (!canStartGuestWrite(pending)) return
    setPending(true)
    setError("")
    setNeedsRefresh(false)
    const payload = {
      token: invitation.token,
      guests: invitation.guests.map((guest) => ({
        id: guest.id,
        attending: Boolean(nextSelection[guest.id]),
      })),
      message: note,
    }

    try {
      const updated =
        invitation.status === "pending"
          ? await rsvpService.confirmAttendance(payload)
          : await rsvpService.updateAttendance(payload)
      setView({ status: "success", invitation: updated })
      setSelection(selectionFromInvitation(updated))
      setNote(updated.message)
      setEditing(false)
    } catch {
      setError(RSVP_SAVE_FAILED_MESSAGE)
      setNeedsRefresh(true)
    } finally {
      setPending(false)
    }
  }

  function confirm() {
    if (!canStartGuestWrite(pending) || needsRefresh) return
    const someone = invitation.guests.some((guest) => selection[guest.id])
    if (!someone) {
      setError("Selecione quem poderá estar conosco ou informe que não poderão comparecer.")
      return
    }
    void save(selection)
  }

  function decline() {
    if (!canStartGuestWrite(pending) || needsRefresh) return
    const none = Object.fromEntries(invitation.guests.map((guest) => [guest.id, false]))
    setSelection(none)
    void save(none)
  }

  async function refreshPersistedState() {
    if (!canStartGuestWrite(pending)) return
    setPending(true)
    setError("")
    try {
      const next = await loadInvitationView(token, (value) => rsvpService.getInvitationByToken(value))
      if (next.status === "success") {
        setView(next)
        setSelection(selectionFromInvitation(next.invitation))
        setNote(next.invitation.message)
        setEditing(next.invitation.status === "pending")
        setNeedsRefresh(false)
      } else if (next.status === "not-found") {
        setView(next)
      } else if (next.status === "error") {
        setError(next.message)
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl px-5 py-16 sm:py-20">
      <InvitationHeader greeting={invitation.greeting} label={invitation.label} />
      <InvitationEventSchedule />

      {showForm ? (
        <form
          className="mt-10"
          onSubmit={(event) => {
            event.preventDefault()
            confirm()
          }}
        >
          <GuestSelector
            guests={invitation.guests}
            selection={selection}
            onToggle={(id) => {
              if (!needsRefresh) setError("")
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
              {needsRefresh ? ` ${RSVP_UNKNOWN_OUTCOME_HINT}` : ""}
            </p>
          ) : null}

          <div className="mt-8 flex flex-col gap-3">
            {needsRefresh ? (
              <button
                type="button"
                className="btn btn-secondary"
                disabled={pending}
                onClick={() => void refreshPersistedState()}
              >
                {pending ? "Atualizando..." : "Atualizar estado do convite"}
              </button>
            ) : null}
            <button type="submit" className="btn btn-primary" disabled={pending || needsRefresh}>
              {pending ? "Guardando..." : copy.invitationConfirm}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={decline}
              disabled={pending || needsRefresh}
            >
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

      <p className="mt-12 text-xs leading-5 text-brown/80">{copy.invitationVisitPrivacyNote}</p>
    </div>
  )
}
