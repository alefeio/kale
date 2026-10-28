import QRCode from "qrcode"

export const pixQuietZone = 4

export function pixQrModules(payload: string) {
  return QRCode.create(payload, { errorCorrectionLevel: "M" }).modules
}
