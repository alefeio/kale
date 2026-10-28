"use client"

import { downloadWeddingIcs } from "@/lib/calendar"
import { weddingConfig } from "@/config/wedding"

export function AddToCalendar() {
  return (
    <button type="button" className="btn btn-secondary" onClick={() => downloadWeddingIcs()}>
      {weddingConfig.copy.addToCalendar}
    </button>
  )
}
