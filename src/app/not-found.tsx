import { Suspense } from "react"
import Link from "next/link"
import { SiteProvider } from "@/components/wedding/site-context"
import { weddingConfig } from "@/config/wedding"
import { weddingSiteStyle } from "@/lib/site-settings"
import { getResolvedWeddingSettings } from "@/services/wedding-settings"

export default function NotFound() {
  return (
    <Suspense fallback={<MissingPage name={weddingConfig.couple.displayName} />}>
      <MissingContent />
    </Suspense>
  )
}

async function MissingContent() {
  const site = await getResolvedWeddingSettings()
  return (
    <SiteProvider site={site}>
      <MissingPage name={site.couple.displayName} style={weddingSiteStyle(site)} />
    </SiteProvider>
  )
}

function MissingPage({
  name,
  style,
}: {
  name: string
  style?: React.CSSProperties
}) {
  return (
    <main
      id="conteudo"
      className="wedding-site flex min-h-[100dvh] flex-col items-center justify-center px-5 text-center"
      style={style}
    >
      <p className="font-script text-5xl break-words text-olive-dark">{name}</p>
      <h1 className="mt-6 font-serif text-4xl text-olive-dark">Página não encontrada</h1>
      <p className="mt-4 max-w-sm leading-7 text-brown">Este endereço não faz parte do nosso grande dia.</p>
      <Link href="/" className="btn btn-primary mt-8">
        Voltar ao início
      </Link>
    </main>
  )
}
