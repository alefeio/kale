export function InvitationSkeleton() {
  return (
    <div className="mx-auto w-full max-w-lg px-5 py-16" aria-busy="true" aria-live="polite">
      <p className="sr-only">Carregando convite</p>
      <div className="mx-auto h-10 w-56 bg-cream" />
      <div className="mx-auto mt-8 h-16 w-full bg-cream" />
      <div className="mx-auto mt-10 h-8 w-40 bg-cream" />
      <div className="mt-12 space-y-3">
        <div className="h-14 bg-cream" />
        <div className="h-14 bg-cream" />
        <div className="h-14 bg-cream" />
      </div>
    </div>
  )
}
