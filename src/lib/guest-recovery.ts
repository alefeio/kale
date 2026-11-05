import { ApiError } from "@/services/http"
import type { Gift } from "@/types/gift"
import type { Invitation } from "@/types/invitation"

export const TEMPORARY_INVITE_LOOKUP_MESSAGE =
  "Não conseguimos consultar seu convite agora. Verifique sua conexão e tente novamente."

export const TEMPORARY_INVITE_LOAD_MESSAGE =
  "Não conseguimos abrir seu convite agora. Verifique sua conexão e tente novamente."

export const TEMPORARY_GIFT_LOAD_MESSAGE =
  "Não conseguimos carregar os presentes agora. Verifique sua conexão e tente novamente."

export const GIFT_REFRESH_FAILED_MESSAGE =
  "A lista não pôde ser atualizada agora. Os presentes já carregados foram mantidos."

export const RSVP_SAVE_FAILED_MESSAGE =
  "Não foi possível guardar a confirmação agora. Suas escolhas foram mantidas."

export const RSVP_UNKNOWN_OUTCOME_HINT =
  "Se a conexão caiu após o envio, atualize o estado do convite antes de tentar novamente."

export type InvitationAccessResult =
  | { kind: "empty"; message: string }
  | { kind: "invalid"; message: string }
  | { kind: "temporary"; message: string }
  | { kind: "success"; token: string }

export type InvitationViewState =
  | { status: "loading" }
  | { status: "success"; invitation: Invitation }
  | { status: "not-found" }
  | { status: "error"; message: string }

export type GiftListViewState =
  | { status: "loading" }
  | { status: "success"; gifts: Gift[] }
  | { status: "empty"; gifts: [] }
  | { status: "error"; gifts: Gift[] | null; message: string; refreshFailed?: boolean }

export function canStartGuestWrite(pending: boolean) {
  return !pending
}

export function invitationFromLoad(
  data: Invitation | null,
): Extract<InvitationViewState, { status: "success" | "not-found" }> {
  return data ? { status: "success", invitation: data } : { status: "not-found" }
}

export function invitationLoadFailure(): Extract<InvitationViewState, { status: "error" }> {
  return { status: "error", message: TEMPORARY_INVITE_LOAD_MESSAGE }
}

export function classifyInvitationLoadError(error: unknown): "not-found" | "error" {
  if (error instanceof ApiError && error.status === 404) return "not-found"
  return "error"
}

export function giftListFromItems(items: Gift[]): Extract<GiftListViewState, { status: "success" | "empty" }> {
  if (items.length === 0) return { status: "empty", gifts: [] }
  return { status: "success", gifts: items }
}

export function giftListLoadFailure(previous: Gift[] | null): Extract<GiftListViewState, { status: "error" }> {
  return {
    status: "error",
    gifts: previous,
    message: previous ? GIFT_REFRESH_FAILED_MESSAGE : TEMPORARY_GIFT_LOAD_MESSAGE,
    refreshFailed: Boolean(previous),
  }
}

export async function lookupInvitationAccess(
  code: string,
  invalidMessage: string,
  fetchImpl: typeof fetch = fetch,
): Promise<InvitationAccessResult> {
  const entered = code.trim()
  if (!entered) {
    return { kind: "empty", message: invalidMessage }
  }

  try {
    const response = await fetchImpl("/api/invitations/access", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code: entered }),
      cache: "no-store",
    })

    if (response.status === 404 || response.status === 400 || response.status === 401) {
      return { kind: "invalid", message: invalidMessage }
    }

    if (!response.ok) {
      return { kind: "temporary", message: TEMPORARY_INVITE_LOOKUP_MESSAGE }
    }

    let data: { token?: unknown } | null = null
    try {
      data = (await response.json()) as { token?: unknown }
    } catch {
      return { kind: "temporary", message: TEMPORARY_INVITE_LOOKUP_MESSAGE }
    }

    if (typeof data?.token !== "string" || !data.token.trim()) {
      return { kind: "invalid", message: invalidMessage }
    }

    return { kind: "success", token: data.token }
  } catch {
    return { kind: "temporary", message: TEMPORARY_INVITE_LOOKUP_MESSAGE }
  }
}

export async function loadInvitationView(
  token: string,
  getByToken: (value: string) => Promise<Invitation | null>,
): Promise<InvitationViewState> {
  try {
    const data = await getByToken(token)
    return invitationFromLoad(data)
  } catch (error) {
    if (classifyInvitationLoadError(error) === "not-found") {
      return { status: "not-found" }
    }
    return invitationLoadFailure()
  }
}

export async function loadGiftListView(
  getGifts: () => Promise<Gift[]>,
  previous: Gift[] | null = null,
): Promise<GiftListViewState> {
  try {
    return giftListFromItems(await getGifts())
  } catch {
    return giftListLoadFailure(previous)
  }
}
