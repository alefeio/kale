/** Escape a CSV field for Excel-friendly `;` delimited output. */
export function escapeCsvField(value: string, delimiter = ";"): string {
  const neutralized = neutralizeCsvFormula(value)
  if (
    neutralized.includes('"') ||
    neutralized.includes(delimiter) ||
    neutralized.includes("\n") ||
    neutralized.includes("\r")
  ) {
    return `"${neutralized.replaceAll('"', '""')}"`
  }
  return neutralized
}

/** Prefix values that Excel may treat as formulas. */
export function neutralizeCsvFormula(value: string): string {
  if (/^[=+\-@]/.test(value) || value.startsWith("\t") || value.startsWith("\r")) {
    return `'${value}`
  }
  return value
}

export function toCsv(
  headers: string[],
  rows: string[][],
  options?: { delimiter?: string; bom?: boolean },
): string {
  const delimiter = options?.delimiter ?? ";"
  const bom = options?.bom ?? true
  const lines = [
    headers.map((header) => escapeCsvField(header, delimiter)).join(delimiter),
    ...rows.map((row) => row.map((cell) => escapeCsvField(cell, delimiter)).join(delimiter)),
  ]
  const body = `${lines.join("\r\n")}\r\n`
  return bom ? `\uFEFF${body}` : body
}
