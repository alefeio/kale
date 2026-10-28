export class ApiError extends Error {
  status: number
  code?: string

  constructor(status: number, message: string, code?: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    cache: "no-store",
    headers: {
      "content-type": "application/json",
      ...init?.headers,
    },
  })

  const body = (await response.json().catch(() => null)) as { error?: string; code?: string } | null
  if (!response.ok) {
    throw new ApiError(
      response.status,
      typeof body?.error === "string" ? body.error : "Não foi possível concluir agora.",
      typeof body?.code === "string" ? body.code : undefined,
    )
  }

  return body as T
}
