"use client"

import { useEffect, useLayoutEffect, useMemo, useState } from "react"
import { GiftCard } from "@/components/wedding/GiftCard"
import { GiftReservationModal } from "@/components/wedding/GiftReservationModal"
import { weddingConfig } from "@/config/wedding"
import { giftService } from "@/services/gifts"
import { giftCategories, giftCategoryLabels, type Gift, type GiftCategory } from "@/types/gift"

const filters = ["todos", ...giftCategories] as const
type Filter = (typeof filters)[number]

export function GiftList({ availableImages }: { availableImages: string[] }) {
  const [gifts, setGifts] = useState<Gift[] | null>(null)
  const [filter, setFilter] = useState<Filter>("todos")
  const [selected, setSelected] = useState<Gift | null>(null)
  const [freshId, setFreshId] = useState<string | null>(null)
  const { copy } = weddingConfig
  const readyImages = useMemo(() => new Set(availableImages), [availableImages])

  useLayoutEffect(() => {
    return () => setSelected(null)
  }, [])

  useEffect(() => {
    let active = true
    giftService.getGifts().then((items) => {
      if (active) setGifts(items)
    })
    return () => {
      active = false
    }
  }, [])

  const visible = (gifts ?? []).filter((gift) => filter === "todos" || gift.category === filter)

  return (
    <section id="presentes" className="section-anchor px-5 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-4xl leading-tight font-medium text-olive-dark sm:text-6xl">
            {copy.giftsTitle}
          </h2>
          <p className="mt-6 text-base leading-8 whitespace-pre-line text-brown sm:text-lg">
            {copy.giftsText}
          </p>
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-x-4 gap-y-3" role="group" aria-label="Categorias">
          {filters.map((item) => {
            const selectedFilter = filter === item
            const label = item === "todos" ? "Todos" : giftCategoryLabels[item as GiftCategory]
            return (
              <button
                key={item}
                type="button"
                aria-pressed={selectedFilter}
                onClick={() => setFilter(item)}
                className={`min-h-11 px-1 text-[0.68rem] tracking-[0.18em] uppercase ${
                  selectedFilter ? "border-b border-olive text-olive-dark" : "text-brown"
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>

        {gifts === null ? (
          <>
            <p className="sr-only">Carregando presentes</p>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="border border-olive/10">
                <div className="aspect-[4/3] bg-cream" />
                <div className="space-y-3 px-4 py-5">
                  <div className="h-3 w-16 bg-cream" />
                  <div className="h-6 w-40 bg-cream" />
                  <div className="h-10 w-full bg-cream" />
                </div>
              </div>
            ))}
          </div>
          </>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((gift) => (
              <GiftCard
                key={gift.id}
                gift={gift}
                imageReady={readyImages.has(gift.image)}
                freshlyReserved={freshId === gift.id}
                onReserve={setSelected}
              />
            ))}
          </div>
        )}

        {gifts !== null && visible.length === 0 ? (
          <p className="mt-10 text-center text-brown">Nenhum presente nesta categoria.</p>
        ) : null}
      </div>

      <GiftReservationModal
        gift={selected}
        onClose={() => setSelected(null)}
        onReserved={(updated) => {
          setFreshId(updated.id)
          setGifts((current) =>
            current?.map((item) => (item.id === updated.id ? { ...item, status: "reserved" } : item)) ?? current,
          )
        }}
      />
    </section>
  )
}
