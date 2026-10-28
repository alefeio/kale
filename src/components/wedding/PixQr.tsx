function hash(value: string) {
  let result = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index)
    result = Math.imul(result, 16777619)
  }
  return result >>> 0
}

function finder(x: number, y: number) {
  const localX = x < 7 ? x : x >= 18 ? x - 18 : -1
  const localY = y < 7 ? y : y >= 18 ? y - 18 : -1
  const inCorner =
    (x < 7 && y < 7) || (x >= 18 && y < 7) || (x < 7 && y >= 18)
  if (!inCorner || localX < 0 || localY < 0) return null
  if (localX === 0 || localY === 0 || localX === 6 || localY === 6) return true
  if (localX >= 2 && localX <= 4 && localY >= 2 && localY <= 4) return true
  return false
}

export function buildDemoQrMatrix(payload: string) {
  const size = 25
  const seed = hash(payload || "demonstrativo")
  const matrix: boolean[][] = []

  for (let y = 0; y < size; y += 1) {
    const row: boolean[] = []
    for (let x = 0; x < size; x += 1) {
      const marker = finder(x, y)
      if (marker !== null) {
        row.push(marker)
        continue
      }
      const bit = (seed ^ Math.imul(x + 3, y + 11)) & 3
      row.push(bit === 0 || bit === 1)
    }
    matrix.push(row)
  }

  return matrix
}

export function PixQr({ payload }: { payload: string }) {
  const matrix = buildDemoQrMatrix(payload)
  const size = matrix.length

  return (
    <div className="mx-auto w-full max-w-[240px] bg-white p-3">
      <svg viewBox={`0 0 ${size} ${size}`} role="img" aria-label="QR Code demonstrativo" className="h-auto w-full">
        {matrix.map((row, y) =>
          row.map((cell, x) =>
            cell ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#2F3928" /> : null,
          ),
        )}
      </svg>
    </div>
  )
}
