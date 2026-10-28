import { pixQrModules, pixQuietZone } from "@/lib/pix-qr"

export function PixQr({ payload }: { payload: string }) {
  const modules = pixQrModules(payload)
  const size = modules.size + pixQuietZone * 2
  const cells = []

  for (let row = 0; row < modules.size; row += 1) {
    for (let column = 0; column < modules.size; column += 1) {
      if (!modules.get(row, column)) continue
      cells.push(
        <rect
          key={`${column}-${row}`}
          x={column + pixQuietZone}
          y={row + pixQuietZone}
          width="1"
          height="1"
          fill="#000000"
        />,
      )
    }
  }

  return (
    <div className="mx-auto w-full max-w-[240px] bg-white p-3">
      <svg viewBox={`0 0 ${size} ${size}`} role="img" aria-label="QR Code PIX" className="h-auto w-full">
        <rect width={size} height={size} fill="#ffffff" />
        {cells}
      </svg>
    </div>
  )
}
