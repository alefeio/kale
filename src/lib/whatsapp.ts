import { formatBrazilianMobile } from "@/lib/phone"

export function whatsappInternationalNumber(value: string | null | undefined) {
  if (!value) return null
  const digits = value.replace(/\D/g, "")
  if (digits.length === 13 && digits.startsWith("55") && digits[4] === "9") return digits
  if (digits.length === 11 && digits[2] === "9") return `55${digits}`
  return null
}

export function whatsappShareUrl({ phone, text }: { phone?: string | null; text: string }) {
  const encoded = encodeURIComponent(text)
  if (phone) return `https://wa.me/${phone}?text=${encoded}`
  return `https://wa.me/?text=${encoded}`
}

export function whatsappDestinations(guests: { name: string; whatsapp: string | null }[]) {
  const groups = new Map<string, string[]>()

  for (const guest of guests) {
    const phone = whatsappInternationalNumber(guest.whatsapp)
    if (!phone) continue
    const names = groups.get(phone) ?? []
    if (!names.includes(guest.name)) names.push(guest.name)
    groups.set(phone, names)
  }

  return [...groups.entries()].map(([phone, names]) => ({
    phone,
    label: names.join(" / "),
    display: formatBrazilianMobile(phone.slice(2)),
  }))
}
