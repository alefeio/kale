export function digitsOnly(value: string) {
  return value.replace(/\D/g, "")
}

export function normalizeBrazilianMobile(value: string) {
  return digitsOnly(value)
}

export function formatBrazilianMobile(value: string) {
  const digits = digitsOnly(value).slice(0, 11)
  if (digits.length <= 1) return digits
  if (digits.length === 2) return `(${digits})`
  const ddd = digits.slice(0, 2)
  const subscriber = digits.slice(2)
  if (subscriber.length <= 5) return `(${ddd}) ${subscriber}`
  return `(${ddd}) ${subscriber.slice(0, 5)}-${subscriber.slice(5)}`
}

export function normalizeWhatsapp(value: string) {
  return normalizeBrazilianMobile(value)
}
