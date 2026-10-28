"use client"

import { Gift, LayoutDashboard, LogOut, Mail, Menu, Package, Settings, Ticket, X } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { authClient } from "@/lib/auth-client"

const links = [
  { href: "/admin", label: "Visão geral", icon: LayoutDashboard },
  { href: "/admin/convites", label: "Convites", icon: Ticket },
  { href: "/admin/presentes", label: "Presentes", icon: Gift },
  { href: "/admin/reservas", label: "Reservas", icon: Package },
  { href: "/admin/mensagens", label: "Mensagens", icon: Mail },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
]

export function AdminShell({
  name,
  email,
  children,
}: {
  name: string
  email: string
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)

  async function logout() {
    setPending(true)
    await authClient.signOut()
    router.push("/admin/login")
    router.refresh()
  }

  const navigation = (
    <nav className="flex flex-1 flex-col gap-1" aria-label="Administração">
      {links.map((link) => {
        const active = pathname === link.href
        const Icon = link.icon
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            onClick={() => setOpen(false)}
            className={`flex min-h-11 items-center gap-3 rounded-md px-3 text-sm ${
              active ? "bg-white/10 text-ivory" : "text-ivory/75 hover:bg-white/5"
            }`}
          >
            <Icon aria-hidden="true" size={18} />
            {link.label}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <div className="min-h-dvh bg-ivory text-ink md:grid md:grid-cols-[16rem_1fr]">
      <aside className="hidden flex-col bg-olive-dark px-4 py-6 text-ivory md:flex">
        <p className="px-3 font-serif text-2xl">K&A</p>
        <p className="mt-1 px-3 text-xs tracking-[0.16em] text-ivory/60 uppercase">Administração</p>
        <div className="mt-8 flex flex-1 flex-col">{navigation}</div>
        <div className="mt-6 border-t border-white/10 pt-4">
          <p className="px-3 text-sm">{name}</p>
          <p className="mt-1 px-3 text-xs break-all text-ivory/70">{email}</p>
          <button type="button" className="btn btn-light mt-4 w-full" onClick={logout} disabled={pending}>
            <LogOut aria-hidden="true" size={16} />
            Sair
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="flex items-center justify-between border-b border-olive/10 bg-cream px-4 py-3 md:hidden">
          <p className="font-serif text-2xl text-olive-dark">K&A</p>
          <button type="button" className="btn btn-secondary" aria-expanded={open} onClick={() => setOpen(true)}>
            <Menu aria-hidden="true" size={18} />
            Menu
          </button>
        </header>
        {open ? (
          <div className="fixed inset-0 z-40 bg-ink/40 md:hidden" onClick={() => setOpen(false)}>
            <div
              className="flex h-full w-[min(100%,20rem)] flex-col bg-olive-dark px-4 py-6 text-ivory"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <p className="font-serif text-2xl">K&A</p>
                <button type="button" className="btn btn-light" onClick={() => setOpen(false)}>
                  <X aria-hidden="true" size={16} />
                  Fechar
                </button>
              </div>
              <div className="mt-8 flex flex-1 flex-col">{navigation}</div>
              <div className="border-t border-white/10 pt-4">
                <p className="text-sm">{name}</p>
                <p className="mt-1 text-xs break-all text-ivory/70">{email}</p>
                <button type="button" className="btn btn-light mt-4 w-full" onClick={logout} disabled={pending}>
                  Sair
                </button>
              </div>
            </div>
          </div>
        ) : null}
        <main id="conteudo" className="min-w-0 px-4 py-6 sm:px-8 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  )
}
