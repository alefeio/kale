"use client"

import Image from "next/image"
import { useState } from "react"
import { GiftArt } from "@/components/wedding/GiftArt"
import { weddingConfig } from "@/config/wedding"
import { giftCategoryLabels, type Gift } from "@/types/gift"

export function GiftCard({
  gift,
  imageReady,
  freshlyReserved,
  onReserve,
}: {
  gift: Gift
  imageReady: boolean
  freshlyReserved: boolean
  onReserve: (gift: Gift) => void
}) {
  const [failed, setFailed] = useState(false)
  const reserved = gift.status === "reserved"
  const showPhoto = imageReady && !failed
  const { copy } = weddingConfig

  return (
    <article className="flex h-full flex-col">
      <div className="relative aspect-[4/3] overflow-hidden bg-cream">
        {showPhoto ? (
          <Image
            src={gift.image}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            onError={() => setFailed(true)}
          />
        ) : (
          <GiftArt category={gift.category} />
        )}
      </div>
      <div className="flex flex-1 flex-col pt-5">
        <p className="text-[0.65rem] tracking-[0.22em] text-brown uppercase">
          {giftCategoryLabels[gift.category]}
        </p>
        <h3 className="mt-2 font-serif text-2xl text-olive-dark">{gift.name}</h3>
        <p className="mt-2 min-h-6 text-sm leading-6 text-brown">{gift.description}</p>
        <p className={`mt-4 text-sm ${reserved ? "text-brown" : "text-olive"}`}>
          {reserved ? copy.giftReservedStatus : copy.giftAvailableStatus}
        </p>
        <div className="mt-4">
          {reserved ? (
            <p className="text-[0.72rem] tracking-[0.16em] text-brown uppercase">
              {freshlyReserved ? copy.giftReserved : copy.giftReservedStatus}
            </p>
          ) : (
            <button
              type="button"
              className="min-h-11 self-start text-[0.72rem] tracking-[0.16em] text-olive-dark uppercase underline decoration-gold underline-offset-[6px]"
              onClick={() => onReserve(gift)}
            >
              {copy.giftWant}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
