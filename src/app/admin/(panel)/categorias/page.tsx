import { GiftCategoryManager } from "@/components/admin/AdminManagers"
import { requireAdmin } from "@/lib/admin"
import { prisma } from "@/lib/db/prisma"

export const instant = false

export default async function GiftCategoriesPage() {
  await requireAdmin()
  const categories = await prisma.giftCatalogCategory.findMany({
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      sortOrder: true,
      active: true,
      _count: { select: { gifts: true } },
    },
  })

  return (
    <div>
      <h1 className="mb-3 font-serif text-4xl text-olive-dark sm:text-5xl">Categorias</h1>
      <p className="mb-6 max-w-2xl text-brown">
        Categorias dinâmicas dos presentes. Preferimos desativar categorias com histórico em vez de
        excluí-las.
      </p>
      <GiftCategoryManager
        categories={categories.map((category) => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description ?? "",
          sortOrder: category.sortOrder,
          active: category.active,
          giftCount: category._count.gifts,
        }))}
      />
    </div>
  )
}
