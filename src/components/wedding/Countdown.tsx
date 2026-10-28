"use client"

import { useEffect, useState } from "react"
import { weddingConfig } from "@/config/wedding"
import { useOptionalSite } from "@/components/wedding/site-context"

const UNITS = [
  { key: "days", label: "Dias" },
  { key: "hours", label: "Horas" },
  { key: "minutes", label: "Minutos" },
  { key: "seconds", label: "Segundos" },
] as const

interface Remaining {
  days: number
  hours: number
  minutes: number
  seconds: number
  finished: boolean
}

function getRemaining(target: number, now: number): Remaining {
  const distance = target - now
  if (distance <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, finished: true }
  }

  const totalSeconds = Math.floor(distance / 1000)
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    finished: false,
  }
}

function pad(value: number) {
  return String(value).padStart(2, "0")
}

export function Countdown() {
  const site = useOptionalSite()
  const target = new Date(site?.event.isoDate ?? weddingConfig.ceremony.isoDate).getTime()
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    const tick = () => setNow(Date.now())
    tick()
    const timer = window.setInterval(tick, 1000)
    return () => window.clearInterval(timer)
  }, [])

  if (now === null) {
    return (
      <div>
        <div aria-hidden="true" className="grid grid-cols-4 gap-2 sm:gap-6">
          {UNITS.map((unit) => (
            <div key={unit.key} className="flex flex-col items-center gap-2">
              <span className="h-10 w-12 bg-white/15 sm:h-14 sm:w-16" />
              <span className="h-2 w-10 bg-white/20" />
            </div>
          ))}
        </div>
        <span className="sr-only">Carregando a contagem regressiva</span>
      </div>
    )
  }

  const remaining = getRemaining(target, now)

  if (remaining.finished) {
    return (
      <p className="font-serif text-2xl leading-snug text-ivory sm:text-3xl">
        {weddingConfig.copy.countdownFinished}
      </p>
    )
  }

  const spoken = `${remaining.days} dias, ${remaining.hours} horas, ${remaining.minutes} minutos e ${remaining.seconds} segundos`

  return (
    <div>
      <p className="mb-1 text-[0.58rem] tracking-[0.28em] text-ivory/80 uppercase sm:text-[0.62rem]">
        {weddingConfig.copy.countdownLabel}
      </p>
      <div className="grid grid-cols-4 gap-3 sm:gap-6" role="timer" aria-label={spoken}>
        {UNITS.map((unit) => (
          <div key={unit.key} className="flex flex-col items-center">
            <span className="font-serif text-[1.7rem] leading-none text-ivory tabular-nums sm:text-[2.15rem]">
              {pad(remaining[unit.key])}
            </span>
            <span className="mt-1 text-[0.52rem] tracking-[0.16em] text-ivory/75 uppercase sm:text-[0.58rem] sm:tracking-[0.18em]">
              {unit.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
