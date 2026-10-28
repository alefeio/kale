"use client"

import { weddingConfig } from "@/config/wedding"
import { useRsvpUi } from "@/components/wedding/rsvp-ui"

export function RSVPCallToAction() {
  const { openCodeModal } = useRsvpUi()
  const { copy } = weddingConfig

  return (
    <section id="presenca" className="section-anchor bg-cream px-5 py-24 sm:py-32">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="font-serif text-4xl leading-tight font-medium text-olive-dark sm:text-6xl">
          {copy.rsvpTitle}
        </h2>
        <p className="mt-6 text-base leading-8 whitespace-pre-line text-brown sm:text-lg">
          {copy.rsvpText}
        </p>
        <button type="button" className="btn btn-primary mt-10" onClick={openCodeModal}>
          {copy.rsvpButton}
        </button>
      </div>
    </section>
  )
}
