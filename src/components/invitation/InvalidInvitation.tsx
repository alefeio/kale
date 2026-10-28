import Link from "next/link"
import { weddingConfig } from "@/config/wedding"

export function InvalidInvitation() {
  const { copy } = weddingConfig

  return (
    <div className="mx-auto max-w-lg px-5 py-24 text-center">
      <p className="font-script text-4xl text-olive-dark">{weddingConfig.couple.displayName}</p>
      <h1 className="mt-8 font-serif text-4xl text-olive-dark">{copy.invitationInvalidTitle}</h1>
      <p className="mt-4 leading-7 text-brown">{copy.invitationInvalidText}</p>
      <Link href="/" className="btn btn-primary mt-10">
        Voltar ao início
      </Link>
    </div>
  )
}
