const keyTypes = ["PHONE", "EMAIL", "CPF", "CNPJ", "EVP"] as const

export type PixKeyType = (typeof keyTypes)[number]

export function isPixKeyType(value: string): value is PixKeyType {
  return keyTypes.some((type) => type === value)
}

function digits(value: string) {
  return value.replace(/\D/g, "")
}

function repeated(value: string) {
  return /^(\d)\1+$/.test(value)
}

function cpfCheck(value: string) {
  if (value.length !== 11 || repeated(value)) return false
  const digit = (length: number) => {
    let sum = 0
    for (let index = 0; index < length; index += 1) sum += Number(value[index]) * (length + 1 - index)
    const mod = (sum * 10) % 11
    return mod === 10 ? 0 : mod
  }
  return digit(9) === Number(value[9]) && digit(10) === Number(value[10])
}

function cnpjCheck(value: string) {
  if (value.length !== 14 || repeated(value)) return false
  const digit = (base: string) => {
    const weights = base.length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    const sum = base.split("").reduce((total, item, index) => total + Number(item) * weights[index], 0)
    const mod = sum % 11
    return mod < 2 ? 0 : 11 - mod
  }
  return digit(value.slice(0, 12)) === Number(value[12]) && digit(value.slice(0, 13)) === Number(value[13])
}

export function normalizePixKey(type: PixKeyType, raw: string) {
  const value = raw.trim()
  if (value.length > 77) return { ok: false as const, error: "A chave PIX pode ter no máximo 77 caracteres." }

  if (type === "PHONE") {
    const numbers = digits(value)
    const national = numbers.startsWith("55") && numbers.length === 13 ? numbers.slice(2) : numbers
    if (national.length !== 11 || national[2] !== "9") {
      return { ok: false as const, error: "Informe um telefone válido com DDD." }
    }
    return { ok: true as const, value: `+55${national}` }
  }

  if (type === "EMAIL") {
    const email = value.toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { ok: false as const, error: "Informe um e-mail válido." }
    }
    return { ok: true as const, value: email }
  }

  if (type === "CPF") {
    const cpf = digits(value)
    if (!cpfCheck(cpf)) return { ok: false as const, error: "Informe um CPF válido." }
    return { ok: true as const, value: cpf }
  }

  if (type === "CNPJ") {
    const cnpj = digits(value)
    if (!cnpjCheck(cnpj)) return { ok: false as const, error: "Informe um CNPJ válido." }
    return { ok: true as const, value: cnpj }
  }

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
    return { ok: false as const, error: "Informe uma chave aleatória válida." }
  }
  return { ok: true as const, value }
}

function plainLength(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").length
}

export function validatePixSettings(input: {
  pixEnabled: boolean
  pixKeyType: string
  pixKey: string
  pixReceiver: string
  pixCity: string
}) {
  const receiver = input.pixReceiver.trim()
  const city = input.pixCity.trim()
  const key = input.pixKey.trim()
  const type = input.pixKeyType.trim()

  if (receiver && plainLength(receiver) > 25) {
    return { ok: false as const, error: "O nome do recebedor pode ter no máximo 25 caracteres." }
  }
  if (city && (plainLength(city) > 15 || plainLength(city) === 0)) {
    return { ok: false as const, error: "A cidade pode ter no máximo 15 caracteres." }
  }

  if (!input.pixEnabled) {
    if (!key && !type) {
      return {
        ok: true as const,
        data: {
          pixEnabled: false,
          pixKeyType: null,
          pixKey: null,
          pixReceiver: receiver || null,
          pixCity: city || null,
        },
      }
    }
    if (!key || !isPixKeyType(type)) {
      return { ok: false as const, error: "Informe o tipo e uma chave PIX válida, ou deixe os dois vazios." }
    }
    const normalized = normalizePixKey(type, key)
    if (!normalized.ok) return normalized
    return {
      ok: true as const,
      data: {
        pixEnabled: false,
        pixKeyType: type,
        pixKey: normalized.value,
        pixReceiver: receiver || null,
        pixCity: city || null,
      },
    }
  }

  if (!isPixKeyType(type) || !key || !receiver || !city) {
    return { ok: false as const, error: "Preencha todos os dados do PIX antes de ativá-lo." }
  }
  const normalized = normalizePixKey(type, key)
  if (!normalized.ok) return normalized
  return {
    ok: true as const,
    data: {
      pixEnabled: true,
      pixKeyType: type,
      pixKey: normalized.value,
      pixReceiver: receiver,
      pixCity: city,
    },
  }
}
