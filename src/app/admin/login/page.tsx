import { LoginForm } from "@/components/admin/LoginForm"

export const instant = false
import { readSession, hasAdminRole } from "@/lib/admin"
import { redirect } from "next/navigation"

export default async function LoginPage() {
  const session = await readSession()
  if (session && hasAdminRole(session.user.role)) redirect("/admin")

  return (
    <main id="conteudo" className="flex min-h-dvh items-center justify-center bg-ivory px-4 py-10">
      <section className="w-full max-w-md border border-gold/40 bg-white px-5 py-8 sm:px-8">
        <p className="text-xs tracking-[0.18em] text-brown uppercase">Karen & Alexandre</p>
        <h1 className="mt-3 font-serif text-4xl text-olive-dark">Entrar</h1>
        <p className="mt-3 text-sm leading-6 text-brown">Acesso restrito à organização do casamento.</p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </section>
    </main>
  )
}
