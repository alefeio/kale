import type { GiftCategory } from "@/types/gift"

export function GiftArt({ category }: { category: GiftCategory }) {
  return (
    <svg viewBox="0 0 320 240" className="h-full w-full" aria-hidden="true">
      <rect width="320" height="240" fill="#EFE7D8" />
      <g fill="none" stroke="#48563A" strokeWidth="1.2">
        {category === "cozinha" ? (
          <>
            <ellipse cx="160" cy="150" rx="70" ry="22" />
            <path d="M100 150c6-48 28-72 60-72s54 24 60 72" />
            <path d="M128 78c8-18 24-28 32-28" />
          </>
        ) : null}
        {category === "mesa" ? (
          <>
            <ellipse cx="160" cy="132" rx="54" ry="18" />
            <path d="M118 132c4 36 18 58 42 58s38-22 42-58" />
            <path d="M146 86h28" />
          </>
        ) : null}
        {category === "casa" ? (
          <>
            <rect x="84" y="96" width="152" height="78" />
            <path d="M84 122h152M160 96v78" />
          </>
        ) : null}
        {category === "eletros" ? (
          <>
            <rect x="112" y="78" width="96" height="110" rx="6" />
            <path d="M128 104h64M128 124h64" />
            <circle cx="160" cy="160" r="10" />
          </>
        ) : null}
        {category === "banho" ? (
          <>
            <path d="M104 86h112v92H104z" />
            <path d="M104 112h112M132 86v92M188 86v92" />
          </>
        ) : null}
      </g>
      <path d="M46 188c18-8 28-6 36 6" fill="none" stroke="#B28A45" strokeWidth="1" />
    </svg>
  )
}
