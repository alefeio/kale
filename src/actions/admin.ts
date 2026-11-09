"use server"

import { revalidatePath } from "next/cache"
import type { ZodError } from "zod"
import { requireAdmin } from "@/lib/admin"
import { createUniqueInvitationCode } from "@/lib/invitation-code"
import { invitationShareText, invitationUrl } from "@/lib/invitation-link"
import { getResolvedWeddingSettings } from "@/services/wedding-settings"
import { createInvitationToken } from "@/lib/invitation-token"
import { prisma } from "@/lib/db/prisma"
import { uploadPublicSiteImage } from "@/lib/apimg"
import { legacyCodeForCategorySlug, slugifyCategoryName } from "@/lib/gift-categories"
import {
  addGuestSchema,
  createInvitationSchema,
  giftCategoryInputSchema,
  giftInputSchema,
  recordIdSchema,
  updateGuestSchema,
  updateInvitationSchema,
} from "@/lib/validation"

export type AdminActionResult = {
  ok: boolean
  message?: string
  error?: string
  code?: string
  url?: string
  shareText?: string
}

function slugify(value: string) {
  const base = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
  return base || "presente"
}

async function uniqueCode() {
  return createUniqueInvitationCode(async (code) => {
    const existing = await prisma.invitation.findUnique({ where: { code }, select: { id: true } })
    return Boolean(existing)
  })
}

async function credentials(token: string, code: string) {
  const url = invitationUrl(token)
  const site = await getResolvedWeddingSettings()
  return {
    code,
    url,
    shareText: invitationShareText(url, code, {
      displayName: site.couple.displayName,
      dateLabel: site.event.dateLabel,
    }),
  }
}

export async function createInvitation(input: unknown): Promise<AdminActionResult> {
  await requireAdmin()
  const parsed = createInvitationSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "Revise os dados do convite." }

  const created = await prisma.invitation.create({
    data: {
      token: createInvitationToken(),
      code: await uniqueCode(),
      label: parsed.data.label,
      greeting: parsed.data.greeting,
      guests: {
        create: parsed.data.guests.map((name, index) => ({ name, sortOrder: index })),
      },
    },
    select: { token: true, code: true },
  })

  revalidatePath("/admin")
  revalidatePath("/admin/convites")
  return { ok: true, message: "Convite criado com sucesso.", ...(await credentials(created.token, created.code)) }
}

function guestInputError(error: ZodError) {
  if (error.issues.some((issue) => issue.path.includes("whatsapp"))) {
    return "Informe um WhatsApp válido ou deixe o campo vazio."
  }
  return "Informe o nome do convidado."
}

export async function updateInvitation(input: unknown): Promise<AdminActionResult> {
  await requireAdmin()
  const parsed = updateInvitationSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "Revise os dados do convite." }

  await prisma.invitation.update({
    where: { id: parsed.data.id },
    data: {
      label: parsed.data.label,
      greeting: parsed.data.greeting ?? null,
      active: parsed.data.active,
    },
  })

  revalidatePath("/admin")
  revalidatePath("/admin/convites")
  revalidatePath(`/admin/convites/${parsed.data.id}`)
  return { ok: true, message: "Convite atualizado." }
}

export async function addGuest(input: unknown): Promise<AdminActionResult> {
  await requireAdmin()
  const parsed = addGuestSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: guestInputError(parsed.error) }

  const last = await prisma.guest.findFirst({
    where: { invitationId: parsed.data.invitationId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  })

  await prisma.guest.create({
    data: {
      invitationId: parsed.data.invitationId,
      name: parsed.data.name,
      whatsapp: parsed.data.whatsapp,
      sortOrder: (last?.sortOrder ?? -1) + 1,
    },
  })

  revalidatePath("/admin/convites")
  revalidatePath(`/admin/convites/${parsed.data.invitationId}`)
  return { ok: true, message: "Convidado adicionado." }
}

export async function updateGuest(input: unknown): Promise<AdminActionResult> {
  await requireAdmin()
  const parsed = updateGuestSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: guestInputError(parsed.error) }

  const guest = await prisma.guest.update({
    where: { id: parsed.data.id },
    data: { name: parsed.data.name, whatsapp: parsed.data.whatsapp },
    select: { invitationId: true },
  })

  revalidatePath(`/admin/convites/${guest.invitationId}`)
  return { ok: true, message: "Convidado atualizado." }
}

export async function removeGuest(id: string): Promise<AdminActionResult> {
  await requireAdmin()
  const parsed = recordIdSchema.safeParse(id)
  if (!parsed.success) return { ok: false, error: "Convidado não encontrado." }

  const guest = await prisma.guest.findUnique({
    where: { id: parsed.data },
    select: { invitationId: true, invitation: { select: { active: true } } },
  })
  if (!guest) return { ok: false, error: "Convidado não encontrado." }

  const siblings = await prisma.guest.count({ where: { invitationId: guest.invitationId } })
  if (guest.invitation.active && siblings <= 1) {
    return {
      ok: false,
      error: "Este é o último convidado deste convite. Adicione outro convidado ou exclua o convite inteiro.",
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.guest.delete({ where: { id: parsed.data } })
    const remaining = await tx.guest.findMany({
      where: { invitationId: guest.invitationId },
      select: { attending: true },
    })
    if (remaining.every((item) => item.attending === null)) {
      await tx.rsvpResponse.deleteMany({ where: { invitationId: guest.invitationId } })
    }
  })

  revalidatePath("/admin")
  revalidatePath("/admin/convites")
  revalidatePath(`/admin/convites/${guest.invitationId}`)
  return { ok: true, message: "Convidado removido." }
}

export async function deleteInvitation(id: string): Promise<AdminActionResult> {
  await requireAdmin()
  const parsed = recordIdSchema.safeParse(id)
  if (!parsed.success) return { ok: false, error: "Convite não encontrado." }

  const invitation = await prisma.invitation.findUnique({
    where: { id: parsed.data },
    select: { giftReservations: { select: { id: true }, take: 1 } },
  })
  if (!invitation) return { ok: false, error: "Convite não encontrado." }
  if (invitation.giftReservations.length > 0) {
    return {
      ok: false,
      error: "Este convite possui reserva de presente vinculada. Libere ou ajuste essas reservas antes de excluir o convite.",
    }
  }

  await prisma.invitation.delete({ where: { id: parsed.data } })
  revalidatePath("/admin")
  revalidatePath("/admin/convites")
  return { ok: true, message: "Convite excluído." }
}

export async function regenerateInvitationCode(id: string): Promise<AdminActionResult> {
  await requireAdmin()
  const parsed = recordIdSchema.safeParse(id)
  if (!parsed.success) return { ok: false, error: "Convite não encontrado." }

  const updated = await prisma.invitation.update({
    where: { id: parsed.data },
    data: { code: await uniqueCode() },
    select: { token: true, code: true },
  })

  revalidatePath("/admin/convites")
  revalidatePath(`/admin/convites/${parsed.data}`)
  return { ok: true, message: "Código regenerado.", ...(await credentials(updated.token, updated.code)) }
}

export async function regenerateInvitationLink(id: string): Promise<AdminActionResult> {
  await requireAdmin()
  const parsed = recordIdSchema.safeParse(id)
  if (!parsed.success) return { ok: false, error: "Convite não encontrado." }

  const updated = await prisma.invitation.update({
    where: { id: parsed.data },
    data: { token: createInvitationToken() },
    select: { token: true, code: true },
  })

  revalidatePath(`/admin/convites/${parsed.data}`)
  return { ok: true, message: "Link regenerado.", ...(await credentials(updated.token, updated.code)) }
}

export async function copyInvitation(id: string): Promise<AdminActionResult> {
  await requireAdmin()
  const parsed = recordIdSchema.safeParse(id)
  if (!parsed.success) return { ok: false, error: "Convite não encontrado." }

  const invitation = await prisma.invitation.findUnique({
    where: { id: parsed.data },
    select: { token: true, code: true },
  })
  if (!invitation) return { ok: false, error: "Convite não encontrado." }
  return { ok: true, ...(await credentials(invitation.token, invitation.code)) }
}

async function resolveGiftCategory(categoryId: string) {
  return prisma.giftCatalogCategory.findUnique({
    where: { id: categoryId },
    select: { id: true, slug: true, active: true },
  })
}

export async function saveGift(input: unknown, id?: string): Promise<AdminActionResult> {
  await requireAdmin()
  const parsed = giftInputSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "Revise os dados do presente." }

  const category = await resolveGiftCategory(parsed.data.categoryId)
  if (!category) return { ok: false, error: "Categoria não encontrada." }
  const legacyCategory = legacyCodeForCategorySlug(category.slug)

  if (id) {
    const parsedId = recordIdSchema.safeParse(id)
    if (!parsedId.success) return { ok: false, error: "Presente não encontrado." }
    await prisma.gift.update({
      where: { id: parsedId.data },
      data: {
        name: parsed.data.name,
        categoryId: category.id,
        legacyCategory,
        sortOrder: parsed.data.sortOrder,
        active: parsed.data.active,
        description: parsed.data.description ?? null,
      },
    })
  } else {
    const base = slugify(parsed.data.name)
    let slug = base
    for (let attempt = 1; attempt < 6; attempt += 1) {
      const existing = await prisma.gift.findUnique({ where: { slug }, select: { id: true } })
      if (!existing) break
      slug = `${base}-${attempt + 1}`
    }
    await prisma.gift.create({
      data: {
        slug,
        name: parsed.data.name,
        categoryId: category.id,
        legacyCategory,
        sortOrder: parsed.data.sortOrder,
        active: parsed.data.active,
        description: parsed.data.description ?? null,
      },
    })
  }

  revalidatePath("/admin/presentes")
  revalidatePath("/admin/categorias")
  revalidatePath("/")
  revalidatePath("/admin")
  return { ok: true, message: "Presente atualizado." }
}

export async function uploadGiftImage(formData: FormData): Promise<AdminActionResult & { url?: string }> {
  await requireAdmin()
  const giftId = recordIdSchema.safeParse(String(formData.get("giftId") ?? ""))
  if (!giftId.success) return { ok: false, error: "Presente não encontrado." }
  const file = formData.get("file")
  if (!(file instanceof File)) return { ok: false, error: "Selecione uma imagem." }

  const gift = await prisma.gift.findUnique({
    where: { id: giftId.data },
    select: { id: true, image: true, imagePublicId: true },
  })
  if (!gift) return { ok: false, error: "Presente não encontrado." }

  const uploaded = await uploadPublicSiteImage(file)
  if (!uploaded.ok) return { ok: false, error: uploaded.error }

  await prisma.gift.update({
    where: { id: gift.id },
    data: {
      image: uploaded.url,
      imagePublicId: uploaded.publicId,
    },
  })

  revalidatePath("/admin/presentes")
  revalidatePath("/")
  return { ok: true, message: "Foto atualizada.", url: uploaded.url }
}

export async function removeGiftImage(id: string): Promise<AdminActionResult> {
  await requireAdmin()
  const parsed = recordIdSchema.safeParse(id)
  if (!parsed.success) return { ok: false, error: "Presente não encontrado." }

  await prisma.gift.update({
    where: { id: parsed.data },
    data: { image: null, imagePublicId: null },
  })

  revalidatePath("/admin/presentes")
  revalidatePath("/")
  return { ok: true, message: "Foto removida. O presente voltará à imagem padrão quando aplicável." }
}

export async function saveGiftCategory(input: unknown, id?: string): Promise<AdminActionResult> {
  await requireAdmin()
  const parsed = giftCategoryInputSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "Revise os dados da categoria." }

  if (id) {
    const parsedId = recordIdSchema.safeParse(id)
    if (!parsedId.success) return { ok: false, error: "Categoria não encontrada." }
    await prisma.giftCatalogCategory.update({
      where: { id: parsedId.data },
      data: {
        name: parsed.data.name,
        description: parsed.data.description ?? null,
        sortOrder: parsed.data.sortOrder,
        active: parsed.data.active,
      },
    })
  } else {
    const base = slugifyCategoryName(parsed.data.name)
    let slug = base
    for (let attempt = 1; attempt < 6; attempt += 1) {
      const existing = await prisma.giftCatalogCategory.findUnique({ where: { slug }, select: { id: true } })
      if (!existing) break
      slug = `${base}-${attempt + 1}`
    }
    await prisma.giftCatalogCategory.create({
      data: {
        name: parsed.data.name,
        slug,
        description: parsed.data.description ?? null,
        sortOrder: parsed.data.sortOrder,
        active: parsed.data.active,
      },
    })
  }

  revalidatePath("/admin/categorias")
  revalidatePath("/admin/presentes")
  revalidatePath("/")
  return { ok: true, message: "Categoria atualizada." }
}

export async function removeGiftCategory(id: string): Promise<AdminActionResult> {
  await requireAdmin()
  const parsed = recordIdSchema.safeParse(id)
  if (!parsed.success) return { ok: false, error: "Categoria não encontrada." }

  const category = await prisma.giftCatalogCategory.findUnique({
    where: { id: parsed.data },
    select: { _count: { select: { gifts: true } } },
  })
  if (!category) return { ok: false, error: "Categoria não encontrada." }
  if (category._count.gifts > 0) {
    return {
      ok: false,
      error: "Esta categoria possui presentes vinculados. Desative-a ou mova os presentes antes de excluir.",
    }
  }

  await prisma.giftCatalogCategory.delete({ where: { id: parsed.data } })
  revalidatePath("/admin/categorias")
  revalidatePath("/admin/presentes")
  revalidatePath("/")
  return { ok: true, message: "Categoria removida." }
}

export async function removeGift(id: string): Promise<AdminActionResult> {
  await requireAdmin()
  const parsed = recordIdSchema.safeParse(id)
  if (!parsed.success) return { ok: false, error: "Presente não encontrado." }

  const gift = await prisma.gift.findUnique({
    where: { id: parsed.data },
    select: { reservation: { select: { id: true } } },
  })
  if (!gift) return { ok: false, error: "Presente não encontrado." }
  if (gift.reservation) {
    return { ok: false, error: "Este presente já foi reservado. Desative-o em vez de excluir." }
  }

  await prisma.gift.delete({ where: { id: parsed.data } })
  revalidatePath("/admin/presentes")
  return { ok: true, message: "Presente removido." }
}

export async function releaseReservation(id: string): Promise<AdminActionResult> {
  await requireAdmin()
  const parsed = recordIdSchema.safeParse(id)
  if (!parsed.success) return { ok: false, error: "Reserva não encontrada." }

  await prisma.giftReservation.delete({ where: { id: parsed.data } })
  revalidatePath("/admin/reservas")
  revalidatePath("/admin/presentes")
  revalidatePath("/admin")
  return { ok: true, message: "Reserva liberada." }
}

export async function removeMessage(id: string): Promise<AdminActionResult> {
  await requireAdmin()
  const parsed = recordIdSchema.safeParse(id)
  if (!parsed.success) return { ok: false, error: "Mensagem não encontrada." }

  await prisma.message.delete({ where: { id: parsed.data } })
  revalidatePath("/admin/mensagens")
  revalidatePath("/admin")
  return { ok: true, message: "Mensagem excluída." }
}
