"use client"

import { useState } from "react"
import { Modal } from "@/components/ui/Modal"
import { weddingConfig } from "@/config/wedding"
import { giftService } from "@/services/gifts"
import type { Gift } from "@/types/gift"

export function GiftReservationModal({
  gift,
  onClose,
  onReserved,
}: {
  gift: Gift | null
  onClose: () => void
  onReserved: (gift: Gift) => void
}) {
  const { copy } = weddingConfig
  const [pending, setPending] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")

  function close() {
    setDone(false)
    setError("")
    setPending(false)
    onClose()
  }

  async function reserve() {
    if (!gift) return
    setPending(true)
    setError("")
    try {
      const updated = await giftService.reserveGift(gift.id, {
        reservedAt: new Date().toISOString(),
      })
      onReserved(updated)
      setDone(true)
    } catch {
      setError("Não foi possível reservar agora. Tente novamente.")
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
