import { weddingConfig } from "@/config/wedding"

export function InvitationHeader({
  greeting,
  label,
}: {
  greeting: string
  label: string
}) {
  return (
    <header className="text-center">
      <p className="font-script text-5xl text-olive-dark sm:text-6xl">
        {weddingConfig.couple.displayName}
      </p>
      <p className="mx-auto mt-8 max-w-sm text-base leading-7 text-brown">{greeting}</p>
      <p className="mt-10 text-[0.68rem] tracking-[0.28em] text-brown uppercase">Convite</p>
      <h1 className="mt-2 font-serif text-4xl font-medium text-olive-dark">{label}</h1>
    </header>
  )
}
