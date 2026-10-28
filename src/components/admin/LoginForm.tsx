"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { authClient } from "@/lib/auth-client"

export function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setPending(true)
    setError("")
    const result = await authClient.signIn.email({
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    })
    setPending(false)
    if (result.error) {
      setError("E-mail ou senha inválidos.")
      return
    }
    router.push("/admin")
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <div>
        <label htmlFor="admin-email" className="mb-2 block text-sm text-brown">
          E-mail
        </label>
        <input id="admin-email" name="email" type="email" autoComplete="username" required className="field" />
      </div>
      <div>
        <label htmlFor="admin-senha" className="mb-2 block text-sm text-brown">
          Senha
        </label>
        <input
          id="admin-senha"
          name="password"
          type="password"
          autoComplete="current-password"
          minLength={12}
          required
          className="field"
        />
      </div>
      {error ? (
        <p role="alert" className="text-sm text-olive-dark">
          {error}
        </p>
      ) : null}
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  )
}
