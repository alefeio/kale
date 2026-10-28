"use client"

import { Menu, X } from "lucide-react"
import { useCallback, useEffect, useLayoutEffect, useState } from "react"
import { weddingConfig } from "@/config/wedding"
import { useRsvpUi } from "@/components/wedding/rsvp-ui"

export function WeddingNav() {
  const { openCodeModal } = useRsvpUi()
  const [visible, setVisible] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const shown = visible || menuOpen
  const { couple, navigation, copy } = weddingConfig

  const closeMenu = useCallback(() => setMenuOpen(false), [])

  useLayoutEffect(() => {
    return () => setMenuOpen(false)
  }, [])

  useEffect(() => {
    const hero = document.getElementById("topo")
    if (!hero) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.intersectionRatio < 0.18)
      },
      { threshold: [0, 0.1, 0.15, 0.18, 0.25, 0.4, 0.6, 0.8, 1] },
    )

    observer.observe(hero)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const original = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu()
    }
    document.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = original
      document.removeEventListener("keydown", onKey)
    }
  }, [menuOpen, closeMenu])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-opacity duration-500 ${
        shown ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      inert={shown ? undefined : true}
      aria-hidden={shown ? undefined : true}
    >
      <div className="border-b border-olive/10 bg-ivory/85 pt-[env(safe-area-inset-top)] text-olive-dark backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <a href="#topo" className="font-script text-2xl text-olive-dark">
            {couple.monogram}
          </a>

          <nav className="hidden items-center gap-6 lg:flex" aria-label="Seções">
            {navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-[0.68rem] tracking-[0.16em] text-brown uppercase hover:text-olive-dark"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button type="button" onClick={openCodeModal} className="btn btn-primary nav-desktop-only min-h-10 px-5">
              Confirmar presença
            </button>
            <button
              type="button"
              className="grid h-11 w-11 place-items-center text-olive-dark lg:hidden"
              aria-expanded={menuOpen}
              aria-controls="menu-mobile"
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X aria-hidden /> : <Menu aria-hidden />}
              <span className="sr-only">{menuOpen ? "Fechar menu" : "Abrir menu"}</span>
            </button>
          </div>
        </div>
      </div>

      {menuOpen ? (
        <nav
          id="menu-mobile"
          aria-label="Menu"
          className="fixed inset-0 z-50 flex flex-col bg-ivory px-6 pt-6 pb-10 text-olive-dark lg:hidden"
        >
          <div className="flex items-center justify-between">
            <span className="font-script text-3xl">{couple.monogram}</span>
            <button type="button" className="grid h-12 w-12 place-items-center" onClick={closeMenu}>
              <X aria-hidden />
              <span className="sr-only">Fechar menu</span>
            </button>
          </div>
          <div className="mt-12 flex flex-col gap-6">
            {navigation.map((item) => (
              <a key={item.href} href={item.href} onClick={closeMenu} className="font-serif text-4xl">
                {item.label}
              </a>
            ))}
          </div>
          <button
            type="button"
            className="btn btn-primary mt-auto"
            onClick={() => {
              closeMenu()
              openCodeModal()
            }}
          >
            {copy.rsvpButton}
          </button>
        </nav>
      ) : null}
    </header>
  )
}
