"use client"

import { useState, useTransition } from "react"
import { savePixSettings } from "@/actions/settings"
import { PixQr } from "@/components/wedding/PixQr"
import { buildPixBrCode } from "@/lib/pix-brcode"
import { validatePixSettings, type PixKeyType } from "@/lib/pix-key"
import { formatBrazilianMobile } from "@/lib/phone"
import type { WeddingSettingsView } from "@/services/wedding-settings"

const keyTypes: { value: PixKeyType; label: string }[] = [
  { value: "PHONE", label: "Telefone" },
  { value: "EMAIL", label: "E-mail" },
  { value: "CPF", label: "CPF" },
  { value: "CNPJ", label: "CNPJ" },
  { value: "EVP", label: "Chave aleatória" },
]

function maskPixPhone(value: string) {
  let digits = value.replace(/\D/g, "")
  if (digits.startsWith("55") && digits.length > 11) digits = digits.slice(2)
  return formatBrazilianMobile(digits)
}

function initialKey(settings: WeddingSettingsView) {
  if (!settings.pixKey) return ""
  if (settings.pixKeyType !== "PHONE") return settings.pixKey
  return maskPixPhone(settings.pixKey)
}

export function PixSettingsForm({ initial }: { initial: WeddingSettingsView }) {
  const [pixEnabled, setPixEnabled] = useState(initial.pixEnabled)
  const [pixKeyType, setPixKeyType] = useState(initial.pixKeyType ?? "")
  const [pixKey, setPixKey] = useState(initialKey(initial))
  const [pixReceiver, setPixReceiver] = useState(initial.pixReceiver ?? "")
  const [pixCity, setPixCity] = useState(initial.pixCity || "BELEM")
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [pending, startTransition] = useTransition()

  const preview = validatePixSettings({
    pixEnabled: true,
    pixKeyType,
    pixKey,
    pixReceiver,
    pixCity,
  })

  function onKeyChange(value: string) {
    setPixKey(pixKeyType === "PHONE" ? maskPixPhone(value) : value)
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        setError("")
        setMessage("")
        startTransition(async () => {
          const response = await savePixSettings({ pixEnabled, pixKeyType, pixKey, pixReceiver, pixCity })
          if (!response.ok) {
            setError(response.error)
            return
          }
          setMessage(response.message)
        })
      }}
    >
      <label className="flex min-h-11 items-center gap-3 text-sm text-brown">
        <input
          type="checkbox"
          checked={pixEnabled}
          onChange={(event) => setPixEnabled(event.target.checked)}
        />
        Ativar PIX no site
      </label>

      <label className="text-sm text-brown" htmlFor="pix-key-type">
        Tipo da chave
        <select
          id="pix-key-type"
          className="field mt-2"
          value={pixKeyType}
          onChange={(event) => {
            const next = event.target.value
            setPixKeyType(next)
            if (next === "PHONE") setPixKey((current) => maskPixPhone(current))
          }}
        >
          <option value="">Selecione</option>
          {keyTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </label>

      <label className="text-sm text-brown" htmlFor="pix-key">
        Chave PIX
        <input
          id="pix-key"
          className="field mt-2"
          value={pixKey}
          maxLength={77}
          autoComplete="off"
          onChange={(event) => onKeyChange(event.target.value)}
        />
      </label>

      <label className="text-sm text-brown" htmlFor="pix-receiver">
        Nome do recebedor
        <input
          id="pix-receiver"
          className="field mt-2"
          value={pixReceiver}
          autoComplete="off"
          onChange={(event) => setPixReceiver(event.target.value)}
        />
      </label>

      <label className="text-sm text-brown" htmlFor="pix-city">
        Cidade
        <input
          id="pix-city"
          className="field mt-2"
          value={pixCity}
          onChange={(event) => setPixCity(event.target.value)}
        />
      </label>

      <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={pending}>
        Salvar configurações
      </button>
      {message ? (
        <p role="status" className="text-sm text-olive-dark">
          {message}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="text-sm text-olive-dark">
          {error}
        </p>
      ) : null}

      <div className="mt-4 border border-olive/10 bg-ivory p-4">
        <h3 className="font-serif text-2xl text-olive-dark">Prévia</h3>
        {preview.ok && preview.data.pixKey && preview.data.pixReceiver && preview.data.pixCity ? (
          <div className="mt-4 text-center">
            <p className="text-sm tracking-[0.14em] text-brown uppercase">{preview.data.pixReceiver}</p>
            <p className="mt-2 font-serif text-2xl break-all text-ink">{preview.data.pixKey}</p>
            <div className="mt-4">
              <PixQr payload={buildPixBrCode(preview.data.pixKey, preview.data.pixReceiver, preview.data.pixCity)} />
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm text-brown">Preencha os dados para visualizar o QR Code.</p>
        )}
      </div>
    </form>
  )
}
