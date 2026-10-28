export function Branch({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 180 320" className={className} aria-hidden="true">
      <path
        d="M92 310c8-48 6-92-8-132-12-34-8-74 10-112"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.8"
      />
      <path
        d="M88 250c28-8 48-2 62 16M80 210c-30-2-48 10-58 28M96 168c26-14 42-12 58 2M78 132c-24-16-36-14-48 4M102 96c22-18 34-16 46 2"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.8"
      />
      <path
        d="M148 270c10 6 14 8 16 16-10-2-16-6-22-12 2-2 4-3 6-4Z"
        fill="currentColor"
        opacity="0.35"
      />
      <path
        d="M24 242c-8 8-10 12-8 20 8-6 14-10 22-14-4-2-8-4-14-6Z"
        fill="currentColor"
        opacity="0.35"
      />
      <path
        d="M154 174c12 2 18 8 20 16-8-2-14-6-22-8 0-3 1-6 2-8Z"
        fill="currentColor"
        opacity="0.4"
      />
      <path
        d="M32 140c-12 4-16 12-14 20 8-6 14-8 24-8-2-4-6-8-10-12Z"
        fill="currentColor"
        opacity="0.4"
      />
      <path
        d="M146 92c10-4 16-2 22 6-8 0-14-2-20-6-1-2-1 0-2 0Z"
        fill="currentColor"
        opacity="0.45"
      />
    </svg>
  )
}

export function BotanicalFrame() {
  return (
    <>
      <Branch className="leaf-in pointer-events-none absolute -left-6 top-10 hidden w-28 text-olive/25 md:block" />
      <Branch className="leaf-in pointer-events-none absolute -right-8 bottom-6 hidden w-32 -scale-x-100 text-olive/20 md:block" />
    </>
  )
}
