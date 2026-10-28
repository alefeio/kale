"use client"

import { useState } from "react"
import { Modal } from "@/components/ui/Modal"
import { whatsappDestinations, whatsappShareUrl } from "@/lib/whatsapp"

export function InvitationWhatsAppShare({
  shareText,
  guests,
  label,
}: {
  shareText: string
  guests: { name: string; whatsapp: string | null }[]
  label: string
}) {
  const [open, setOpen] = useState(false)
  const destinations = whatsappDestinations(guests)
  const className = "btn btn-secondary w-full sm:w-auto"

  if (destinations.length <= 1) {
    const phone = destinations[0]?.phone
    return (
      <a
        className={className}
        href={whatsappShareUrl({ phone, text: shareText })}
        target="_blank"
        rel="noopener noreferrer"
      >
        {label}
      </a>
    )
  }

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {label}
      </button>
      <Modal open={open} title="Para quem deseja enviar?" onClose={() => setOpen(false)}>
        <ul className="flex flex-col gap-2">
          {destinations.map((destination) => (
            <li key={destination.phone}>
              <a
                className="flex min-h-11 w-full flex-col items-start justify-center border border-olive/15 bg-white px-4 py-3 text-left text-ink"
                href={whatsappShareUrl({ phone: destination.phone, text: shareText })}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>{destination.label}</span>
                <span className="text-sm text-brown">{destination.display}</span>
              </a>
            </li>
          ))}
        </ul>
        <a
          className="btn btn-ghost mt-4 w-full"
          href={whatsappShareUrl({ text: shareText })}
          target="_blank"
          rel="noopener noreferrer"
        >
          Escolher outro contato
        </a>
      </Modal>
    </>
  )
}
