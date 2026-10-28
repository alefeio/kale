"use client"

import { Menu, X } from "lucide-react"
import { useCallback, useEffect, useLayoutEffect, useState } from "react"
import { weddingConfig } from "@/config/wedding"
import { useRsvpUi } from "@/components/wedding/rsvp-ui"

export function WeddingNav() {
  const { openCodeModal } = useRsvpUi()
  const [solid, setSolid] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { couple, navigation, copy } = weddingConfig

  const closeMenu = useCallback(() => setMenuOpen(false), [])

  useLayoutEffect(() => {
    return () => setMenuOpen(false)
  }, [])

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
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

  const bar = solid
    ? "border-b border-olive/10 bg-ivory/85 text-olive-dark backdrop-blur-sm"
    : "bg-transparent text-ivory"

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <div className={`pt-[env(safe-area-inset-top)] transition-colors duration-300 ${bar}`}>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <a
            href="#topo"
            className={`font-script text-2xl ${solid ? "text-olive-dark" : "text-ivory drop-shadow-[0_1px_8px_rgba(20,16,10,0.45)]"}`}
          >
            {couple.monogram}
          </a>

          <nav className="hidden items-center gap-6 lg:flex" aria-label="Seções">
            {navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`text-[0.68rem] tracking-[0.16em] uppercase ${
                  solid
                    ? "text-brown hover:text-olive-dark"
                    : "text-ivory drop-shadow-[0_1px_6px_rgba(20,16,10,0.7)] hover:text-ivory"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openCodeModal}
              className="btn btn-primary nav-desktop-only min-h-10 px-5"
            >
              Confirmar presença
            </button>
            <button
              type="button"
              className={`grid h-11 w-11 place-items-center lg:hidden ${solid ? "text-olive-dark" : "text-ivory"}`}
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
              <a
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className="font-serif text-4xl"
              >
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
