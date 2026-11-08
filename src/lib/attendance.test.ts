import assert from "node:assert/strict"
import { test } from "node:test"
import {
  buildAttendanceRows,
  filterAttendanceRows,
  guestAttendanceStatus,
  parseAttendanceQuery,
  summarizeAttendance,
} from "./attendance"

const invitations = [
  {
    id: "inv-1",
    label: "Família Silva",
    active: true,
    response: { updatedAt: new Date("2026-11-01T15:00:00.000Z") },
    guests: [
      { id: "g1", name: "Ana", attending: true, sortOrder: 0 },
      { id: "g2", name: "Bruno", attending: false, sortOrder: 1 },
      { id: "g3", name: "Carla", attending: null, sortOrder: 2 },
    ],
  },
  {
    id: "inv-2",
    label: "Casal Demo",
    active: false,
    response: null,
    guests: [
      { id: "g4", name: "Diego", attending: null, sortOrder: 0 },
      { id: "g5", name: "Elena", attending: true, sortOrder: 1 },
    ],
  },
]

test("guest attendance follows attending boolean nullability", () => {
  assert.equal(guestAttendanceStatus(true), "confirmed")
  assert.equal(guestAttendanceStatus(false), "declined")
  assert.equal(guestAttendanceStatus(null), "pending")
})

test("family invitation rows keep per-guest statuses and shared response date", () => {
  const rows = buildAttendanceRows([invitations[0]])
  assert.equal(rows.length, 3)
  assert.deepEqual(
    rows.map((row) => row.status),
    ["confirmed", "declined", "pending"],
  )
  assert.equal(
    rows.every((row) => row.lastResponseAt?.toISOString() === "2026-11-01T15:00:00.000Z"),
    true,
  )
})

test("summary reconciles guest totals from individual attending values", () => {
  const rows = buildAttendanceRows([invitations[0]])
  const summary = summarizeAttendance(rows, [invitations[0]])
  assert.equal(summary.guests, 3)
  assert.equal(summary.confirmed + summary.declined + summary.pending, summary.guests)
  assert.equal(summary.invitations, 1)
  assert.equal(summary.invitationsResponded, 1)
})

test("filters combine status, active scope and search", () => {
  const query = parseAttendanceQuery({ status: "confirmed", active: "all", q: "silva" })
  assert.equal(query.status, "confirmed")
  assert.equal(query.active, "all")
  const rows = filterAttendanceRows(buildAttendanceRows(invitations), query)
  assert.equal(rows.length, 1)
  assert.equal(rows[0].guestName, "Ana")
})

test("default active filter excludes inactive invitations in query parsing", () => {
  assert.equal(parseAttendanceQuery({}).active, "active")
  assert.equal(parseAttendanceQuery({ active: "inactive" }).active, "inactive")
})
