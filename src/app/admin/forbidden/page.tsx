export const instant = false

export default function ForbiddenPage() {
  return (
    <main id="conteudo" className="flex min-h-dvh items-center justify-center bg-ivory px-4">
      <section className="max-w-md text-center">
        <h1 className="font-serif text-4xl text-olive-dark">Acesso negado</h1>
        <p className="mt-3 text-brown">Esta conta não administra o casamento.</p>
      </section>
    </main>
  )
}
