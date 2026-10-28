"use client"

import { useEffect, useState } from "react"
import { Modal } from "@/components/ui/Modal"
import { weddingConfig } from "@/config/wedding"
import { useOptionalSite } from "@/components/wedding/site-context"
import { formatBrazilianMobile } from "@/lib/phone"
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
  const site = useOptionalSite()
  const { copy } = weddingConfig
  const reserveText = site
    ? `Deseja reservar este presente para ${site.couple.bride} e ${site.couple.groom}?`
    : copy.giftReserveText
  const [pending, setPending] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")
  const [invalidCode, setInvalidCode] = useState(false)
  const [showCode, setShowCode] = useState(false)
  const [invitationCode, setInvitationCode] = useState("")
  const [donorName, setDonorName] = useState("")
  const [donorContact, setDonorContact] = useState("")
  const [donorMessage, setDonorMessage] = useState("")
  const [recognized, setRecognized] = useState(false)
  const [displayName, setDisplayName] = useState("")
  const [contextReady, setContextReady] = useState(false)
  const [formGiftId, setFormGiftId] = useState<string | null>(null)

  if ((gift?.id ?? null) !== formGiftId) {
    setFormGiftId(gift?.id ?? null)
    setDone(false)
    setError("")
    setInvalidCode(false)
    setPending(false)
    setShowCode(false)
    setInvitationCode("")
    setDonorName("")
    setDonorContact("")
    setDonorMessage("")
    setRecognized(false)
    setDisplayName("")
    setContextReady(false)
  }

  useEffect(() => {
    if (!gift) return
    let active = true
    fetch("/api/invitation-context", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { recognized?: boolean; displayName?: string }) => {
        if (!active) return
        setRecognized(Boolean(data.recognized && data.displayName))
        setDisplayName(data.displayName ?? "")
        setContextReady(true)
      })
      .catch(() => {
        if (!active) return
        setRecognized(false)
        setContextReady(true)
      })
    return () => {
      active = false
    }
  }, [gift])

  function close() {
    setDone(false)
    setError("")
    setPending(false)
    onClose()
  }

  async function reserve(omitCode = false) {
    if (!gift || !contextReady) return
    if (!recognized) {
      if (!donorName.trim()) {
        setError("Conte seu nome.")
        return
      }
      if (!donorContact.trim()) {
        setError("Informe o WhatsApp.")
        return
      }
    }
    setPending(true)
    setError("")
    setInvalidCode(false)
    try {
      const updated = await giftService.reserveGift(gift.id, recognized
        ? { message: donorMessage }
        : {
            donorName,
            donorContact,
            invitationCode: omitCode ? undefined : invitationCode,
            message: donorMessage,
          })
      onReserved(updated)
      setDone(true)
    } catch (caught) {
      if (caught instanceof ApiError && caught.code === "INVALID_INVITATION_CODE") {
        setInvalidCode(true)
        setError("Não encontramos esse código.")
      } else if (caught instanceof ApiError && caught.status === 409) {
        setError(caught.message)
        onConflict()
      } else if (caught instanceof ApiError) {
        setError(caught.message)
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
      title={done ? "Presente reservado." : copy.giftReserveTitle}
      description={done ? undefined : reserveText}
      onClose={close}
    >
      {done ? (
        <div>
          <p role="status" className="text-sm text-olive-dark">Presente reservado.</p>
          <button type="button" className="btn btn-primary mt-4" onClick={close}>
            Fechar
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {gift ? <p className="font-serif text-2xl text-olive">{gift.name}</p> : null}
          {!contextReady ? (
            <p className="text-sm text-brown">Carregando...</p>
          ) : recognized ? (
            <div>
              <p className="text-sm text-brown">Seu convite foi reconhecido.</p>
              <p className="mt-1 text-sm text-olive-dark">Reserva em nome de {displayName}</p>
            </div>
          ) : (
            <>
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
                  inputMode="numeric"
                  autoComplete="tel"
                  value={donorContact}
                  onChange={(event) => setDonorContact(formatBrazilianMobile(event.target.value))}
                  placeholder="(91) 99999-9999"
                  required
                  className="field"
                />
              </div>
              {showCode ? (
                <div>
                  <label htmlFor="reserva-codigo" className="mb-2 block text-sm text-brown">
                    Código do convite (opcional)
                  </label>
                  <input
                    id="reserva-codigo"
                    name="codigo"
                    value={invitationCode}
                    onChange={(event) => {
                      setInvitationCode(event.target.value.toUpperCase())
                      setInvalidCode(false)
                    }}
                    autoCapitalize="characters"
                    autoComplete="off"
                    spellCheck={false}
                    className="field uppercase"
                  />
                  <p className="mt-2 text-sm text-brown">
                    Se você não estiver com o código agora, pode reservar normalmente.
                  </p>
                </div>
              ) : (
                <button type="button" className="btn btn-ghost self-start" onClick={() => setShowCode(true)}>
                  Tenho um código de convite
                </button>
              )}
            </>
          )}
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
              {invalidCode ? " Você pode corrigir o código ou continuar a reserva sem ele." : ""}
            </p>
          ) : null}
          {invalidCode ? (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setInvalidCode(false)
                  setError("")
                  document.getElementById("reserva-codigo")?.focus()
                }}
              >
                Corrigir código
              </button>
              <button type="button" className="btn btn-primary" onClick={() => reserve(true)} disabled={pending}>
                {pending ? "Reservando..." : "Reservar sem código"}
              </button>
            </div>
          ) : (
            <button type="button" className="btn btn-primary" onClick={() => reserve(false)} disabled={pending || !contextReady}>
              {pending ? "Reservando..." : "Reservar este presente"}
            </button>
          )}
          <button type="button" className="btn btn-secondary" onClick={close} disabled={pending}>
            Cancelar
          </button>
        </div>
      )}
    </Modal>
  )
}
