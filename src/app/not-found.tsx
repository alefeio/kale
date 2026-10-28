import Link from "next/link"
import { weddingConfig } from "@/config/wedding"

export default function NotFound() {
  return (
    <main id="conteudo" className="flex min-h-[100dvh] flex-col items-center justify-center px-5 text-center">
      <p className="font-script text-5xl text-olive-dark">{weddingConfig.couple.displayName}</p>
      <h1 className="mt-6 font-serif text-4xl text-olive-dark">Página não encontrada</h1>
      <p className="mt-4 max-w-sm leading-7 text-brown">
        Este endereço não faz parte do nosso grande dia.
      </p>
      <Link href="/" className="btn btn-primary mt-8">
        Voltar ao início
      </Link>
    </main>
  )
}
