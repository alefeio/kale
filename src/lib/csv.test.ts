import assert from "node:assert/strict"
import { test } from "node:test"
import { escapeCsvField, neutralizeCsvFormula, toCsv } from "./csv"

test("csv escapes quotes, delimiters and newlines", () => {
  assert.equal(escapeCsvField('a"b'), '"a""b"')
  assert.equal(escapeCsvField("a;b"), '"a;b"')
  assert.equal(escapeCsvField("a\nb"), '"a\nb"')
})

test("csv formula injection is neutralized", () => {
  assert.equal(neutralizeCsvFormula("=CMD()"), "'=CMD()")
  assert.equal(neutralizeCsvFormula("+1"), "'+1")
  assert.equal(neutralizeCsvFormula("-2"), "'-2")
  assert.equal(neutralizeCsvFormula("@sum"), "'@sum")
  assert.equal(neutralizeCsvFormula("Maria"), "Maria")
  assert.equal(neutralizeCsvFormula(" =CMD()"), "' =CMD()")
  assert.equal(neutralizeCsvFormula("\t=CMD()"), "'\t=CMD()")
  assert.equal(neutralizeCsvFormula("\r\n=1+1"), "'\r\n=1+1")
  assert.equal(neutralizeCsvFormula("\u0000+cmd"), "'\u0000+cmd")
})

test("toCsv uses BOM and Brazilian delimiter", () => {
  const csv = toCsv(["Nome", "Status"], [["Ana", "Confirmado"], ["=Hack", "Pendente"]])
  assert.equal(csv.startsWith("\uFEFF"), true)
  assert.equal(csv.includes("Nome;Status"), true)
  assert.equal(csv.includes("'=Hack"), true)
})
