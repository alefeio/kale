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

/**
 * Prefix values that Excel/LibreOffice may treat as formulas.
 * Leading spaces, tabs and control characters before operators are also neutralized.
 */
export function neutralizeCsvFormula(value: string): string {
  const withoutLeadingNoise = value.replace(/^[\s\u0000-\u001f\u007f\u00a0\u2000-\u200f\u2028-\u202f]+/u, "")
  if (/^[=+\-@]/.test(withoutLeadingNoise)) {
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
