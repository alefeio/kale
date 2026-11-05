"use client"

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { GiftCard } from "@/components/wedding/GiftCard"
import { GiftReservationModal } from "@/components/wedding/GiftReservationModal"
import { weddingConfig } from "@/config/wedding"
import {
  giftListFromItems,
  loadGiftListView,
  type GiftListViewState,
} from "@/lib/guest-recovery"
import { giftService } from "@/services/gifts"
import { giftCategories, giftCategoryLabels, type Gift, type GiftCategory } from "@/types/gift"

const filters = ["todos", ...giftCategories] as const
type Filter = (typeof filters)[number]

export function GiftList({ availableImages }: { availableImages: string[] }) {
  const [view, setView] = useState<GiftListViewState>({ status: "loading" })
  const [filter, setFilter] = useState<Filter>("todos")
  const [selected, setSelected] = useState<Gift | null>(null)
  const [freshId, setFreshId] = useState<string | null>(null)
  const requestId = useRef(0)
  const { copy } = weddingConfig
  const readyImages = useMemo(() => new Set(availableImages), [availableImages])
  const gifts = view.status === "loading" ? null : view.gifts

  useLayoutEffect(() => {
    return () => setSelected(null)
  }, [])

  useEffect(() => {
    const id = ++requestId.current
    void loadGiftListView(() => giftService.getGifts()).then((next) => {
      if (id !== requestId.current) return
      setView(next)
    })
    return () => {
      requestId.current += 1
    }
  }, [])

  async function reload(previous: Gift[] | null) {
    const id = ++requestId.current
    if (!previous) setView({ status: "loading" })
    const next = await loadGiftListView(() => giftService.getGifts(), previous)
    if (id !== requestId.current) return
    setView(next)
  }

  const visible = (gifts ?? []).filter((gift) => filter === "todos" || gift.category === filter)
  const showEmptyCategory = view.status === "success" && visible.length === 0
  const showEmptyList = view.status === "empty"
  const showError = view.status === "error"
  const showGrid =
    gifts !== null &&
    (view.status === "success" ||
      view.status === "empty" ||
      (view.status === "error" && gifts.length > 0))

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

        <div className="gift-filters mt-12" role="group" aria-label="Categorias">
          {filters.map((item) => {
            const selectedFilter = filter === item
            const label = item === "todos" ? "Todos" : giftCategoryLabels[item as GiftCategory]
            return (
              <button
                key={item}
                type="button"
                aria-pressed={selectedFilter}
                onClick={() => setFilter(item)}
                className={`min-h-11 shrink-0 px-1 text-[0.68rem] tracking-[0.18em] uppercase ${
                  selectedFilter ? "border-b border-olive text-olive-dark" : "text-brown"
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>

        {view.status === "loading" ? (
          <>
            <p className="sr-only">Carregando presentes</p>
            <div className="mt-14 grid gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
              {Array.from({ length: 6 }, (_, index) => (
                <div key={index}>
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
        ) : null}

        {showError ? (
          <div className="mt-10 text-center">
            <p role="alert" className="text-brown">
              {view.message}
            </p>
            <button type="button" className="btn btn-secondary mt-6" onClick={() => void reload(gifts)}>
              Tentar novamente
            </button>
          </div>
        ) : null}

        {showGrid ? (
          <div className="mt-14 grid gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
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
        ) : null}

        {showEmptyList || showEmptyCategory ? (
          <p className="mt-10 text-center text-brown">Nenhum presente nesta categoria.</p>
        ) : null}
      </div>

      <GiftReservationModal
        gift={selected}
        onClose={() => setSelected(null)}
        onReserved={(updated) => {
          setFreshId(updated.id)
          setView((current) => {
            const currentGifts =
              current.status === "loading" || current.gifts === null ? [] : current.gifts
            const nextGifts = currentGifts.map((item) =>
              item.id === updated.id ? { ...item, status: "reserved" as const } : item,
            )
            return giftListFromItems(nextGifts)
          })
        }}
        onConflict={() => {
          void reload(gifts)
        }}
      />
    </section>
  )
}
