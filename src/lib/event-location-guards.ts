export type PrimaryMutationAction = "update" | "deactivate" | "delete"

const primaryErrors: Record<PrimaryMutationAction, string> = {
  update: "O evento principal não pode ser alterado por esta ação.",
  deactivate: "O evento principal não pode ser desativado.",
  delete: "O evento principal não pode ser excluído.",
}

/** Primary ceremony lives on WeddingSettings and must never be mutated via additional-location actions. */
export function guardAdditionalLocationId(id: string, action: PrimaryMutationAction) {
  if (!id || id === "primary") {
    return { ok: false as const, error: primaryErrors[action], code: "PRIMARY_LOCKED" as const }
  }
  return { ok: true as const }
}

export function guardReorderAdditionalLocationIds(orderedIds: unknown) {
  if (!Array.isArray(orderedIds)) {
    return { ok: false as const, error: "Ordem inválida." }
  }
  if (orderedIds.some((id) => typeof id !== "string" || !id || id === "primary")) {
    return { ok: false as const, error: "Ordem inválida." }
  }
  const ids = orderedIds as string[]
  if (new Set(ids).size !== ids.length) {
    return { ok: false as const, error: "Ordem inválida." }
  }
  return { ok: true as const, ids }
}

export function assertServiceAdditionalLocationId(id: string) {
  if (!id || id === "primary") throw new Error("PRIMARY_LOCKED")
}
