import { weddingConfig } from "@/config/wedding"
import type { Guest } from "@/types/invitation"

export function GuestSelector({
  guests,
  selection,
  onToggle,
}: {
  guests: Guest[]
  selection: Record<string, boolean>
  onToggle: (id: string) => void
}) {
  return (
    <fieldset className="mt-12">
      <legend className="font-serif text-2xl text-olive-dark sm:text-3xl">
        {weddingConfig.copy.invitationQuestion}
      </legend>
      <div className="mt-4">
        {guests.map((guest) => {
          const checked = Boolean(selection[guest.id])
          return (
            <label
              key={guest.id}
              className="flex min-h-14 cursor-pointer items-center gap-4 border-b border-olive/15"
            >
              <input
                type="checkbox"
                className="h-5 w-5 accent-olive"
                checked={checked}
                onChange={() => onToggle(guest.id)}
              />
              <span className="font-serif text-2xl text-ink">{guest.name}</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
