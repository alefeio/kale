import { weddingConfig } from "@/config/wedding"

export function siteOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || process.env.BETTER_AUTH_URL || "http://localhost:3000"
  return configured.replace(/\/$/, "")
}

export function invitationUrl(token: string) {
  return `${siteOrigin()}/convite/${encodeURIComponent(token)}`
}

export function invitationShareText(url: string, code: string) {
  return `${weddingConfig.couple.displayName}
${weddingConfig.ceremony.dateLabel}

Preparamos nosso convite com carinho:
${url}

Código: ${code}`
}
