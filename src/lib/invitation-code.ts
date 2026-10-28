import { randomBytes } from "node:crypto"

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

export function generateInvitationCode() {
  const bytes = randomBytes(10)
  let code = ""
  for (const byte of bytes) code += alphabet[byte % alphabet.length]
  return code
}

export async function createUniqueInvitationCode(isTaken: (code: string) => Promise<boolean>) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = generateInvitationCode()
    if (!(await isTaken(code))) return code
  }
  throw new Error("Não foi possível gerar um código único.")
}
