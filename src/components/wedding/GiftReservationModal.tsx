"use client"

import { useState } from "react"
import { Modal } from "@/components/ui/Modal"
import { weddingConfig } from "@/config/wedding"
import { ApiError } from "@/services/http"
import { giftService } from "@/services/gifts"
import type { Gift } from "@/types/gift"

export function GiftReservationModal({
  gift,
  onClose,
  onReserved,
  onConflict,
}: {
  gift: Gift | null
  onClose: () => void
  onReserved: (gift: Gift) => void
  onConflict: () => void
}) {
  const { copy } = weddingConfig
  const [pending, setPending] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")
  const [invitationCode, setInvitationCode] = useState("")
  const [donorName, setDonorName] = useState("")
  const [donorContact, setDonorContact] = useState("")
  const [donorMessage, setDonorMessage] = useState("")
  const [formGiftId, setFormGiftId] = useState<string | null>(null)

  if ((gift?.id ?? null) !== formGiftId) {
    setFormGiftId(gift?.id ?? null)
    setDone(false)
    setError("")
    setPending(false)
    setInvitationCode("")
    setDonorName("")
    setDonorContact("")
    setDonorMessage("")
  }

  function close() {
    setDone(false)
    setError("")
    setPending(false)
    onClose()
  }

  async function reserve() {
    if (!gift) return
    if (!invitationCode.trim()) {
      setError("Informe o código do convite.")
      return
    }
    if (!donorName.trim()) {
      setError("Conte seu nome.")
      return
    }
    if (!donorContact.trim()) {
      setError("Informe o WhatsApp.")
      return
    }
    setPending(true)
    setError("")
    try {
      const updated = await giftService.reserveGift(gift.id, {
        donorName,
        donorContact,
        invitationCode,
        message: donorMessage,
      })
      onReserved(updated)
      setDone(true)
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 409) {
        setError(caught.message)
        onConflict()
      } else {
        setError("Não foi possível reservar agora. Tente novamente.")
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <Modal
      open={gift !== null}
      title={done ? copy.giftReserved : copy.giftReserveTitle}
      description={done ? undefined : copy.giftReserveText}
      onClose={close}
    >
      {done ? (
        <button type="button" className="btn btn-primary" onClick={close}>
          Fechar
        </button>
      ) : (
        <div className="flex flex-col gap-3">
          {gift ? <p className="font-serif text-2xl text-olive">{gift.name}</p> : null}
          <div>
            <label htmlFor="reserva-codigo" className="mb-2 block text-sm text-brown">
              Código do convite *
            </label>
            <input
              id="reserva-codigo"
              name="codigo"
              value={invitationCode}
              onChange={(event) => setInvitationCode(event.target.value.toUpperCase())}
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              required
              className="field uppercase"
            />
          </div>
          <div>
            <label htmlFor="reserva-nome" className="mb-2 block text-sm text-brown">
              Seu nome *
            </label>
            <input
              id="reserva-nome"
              name="nome"
              value={donorName}
              onChange={(event) => setDonorName(event.target.value)}
              autoComplete="name"
              required
              className="field"
            />
          </div>
          <div>
            <label htmlFor="reserva-contato" className="mb-2 block text-sm text-brown">
              Telefone ou WhatsApp *
            </label>
            <input
              id="reserva-contato"
              name="contato"
              value={donorContact}
              onChange={(event) => setDonorContact(event.target.value)}
              autoComplete="tel"
              required
              className="field"
            />
          </div>
          <div>
            <label htmlFor="reserva-mensagem" className="mb-2 block text-sm text-brown">
              Mensagem
            </label>
            <textarea
              id="reserva-mensagem"
              name="mensagem"
              value={donorMessage}
              onChange={(event) => setDonorMessage(event.target.value)}
              rows={3}
              className="field min-h-24 resize-y"
            />
          </div>
          {error ? (
            <p role="alert" className="text-sm text-olive-dark">
              {error}
            </p>
          ) : null}
          <button type="button" className="btn btn-primary" onClick={reserve} disabled={pending}>
            {pending ? "Reservando..." : copy.giftReserveAction}
          </button>
          <button type="button" className="btn btn-secondary" onClick={close}>
            {copy.giftReserveCancel}
          </button>
        </div>
      )}
    </Modal>
  )
}
