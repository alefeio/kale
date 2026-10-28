"use server"

import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/admin"
import { createUniqueInvitationCode } from "@/lib/invitation-code"
import { invitationShareText, invitationUrl } from "@/lib/invitation-link"
import { createInvitationToken } from "@/lib/invitation-token"
import { prisma } from "@/lib/db/prisma"
import {
  addGuestSchema,
  createInvitationSchema,
  giftInputSchema,
  guestNameSchema,
  recordIdSchema,
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

function credentials(token: string, code: string) {
  const url = invitationUrl(token)
  return { code, url, shareText: invitationShareText(url, code) }
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
  return { ok: true, message: "Convite criado.", ...credentials(created.token, created.code) }
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
  if (!parsed.success) return { ok: false, error: "Informe o nome do convidado." }

  const last = await prisma.guest.findFirst({
    where: { invitationId: parsed.data.invitationId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  })

  await prisma.guest.create({
    data: {
      invitationId: parsed.data.invitationId,
      name: parsed.data.name,
      sortOrder: (last?.sortOrder ?? -1) + 1,
    },
  })

  revalidatePath("/admin/convites")
  revalidatePath(`/admin/convites/${parsed.data.invitationId}`)
  return { ok: true, message: "Convidado adicionado." }
}

export async function renameGuest(input: unknown): Promise<AdminActionResult> {
  await requireAdmin()
  const parsed = guestNameSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "Informe o nome do convidado." }

  const guest = await prisma.guest.update({
    where: { id: parsed.data.id },
    data: { name: parsed.data.name },
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
  return { ok: true, message: "Código regenerado.", ...credentials(updated.token, updated.code) }
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
  return { ok: true, message: "Link regenerado.", ...credentials(updated.token, updated.code) }
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
  return { ok: true, ...credentials(invitation.token, invitation.code) }
}

export async function saveGift(input: unknown, id?: string): Promise<AdminActionResult> {
  await requireAdmin()
  const parsed = giftInputSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "Revise os dados do presente." }

  if (id) {
    const parsedId = recordIdSchema.safeParse(id)
    if (!parsedId.success) return { ok: false, error: "Presente não encontrado." }
    await prisma.gift.update({
      where: { id: parsedId.data },
      data: {
        name: parsed.data.name,
        category: parsed.data.category,
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
        category: parsed.data.category,
        sortOrder: parsed.data.sortOrder,
        active: parsed.data.active,
        description: parsed.data.description ?? null,
      },
    })
  }

  revalidatePath("/admin/presentes")
  revalidatePath("/admin")
  return { ok: true, message: "Presente atualizado." }
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
