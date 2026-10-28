function plain(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
}

function field(id: string, value: string) {
  return `${id}${String(value.length).padStart(2, "0")}${value}`
}

function crc16(value: string) {
  let crc = 0xffff
  for (let index = 0; index < value.length; index += 1) {
    crc ^= value.charCodeAt(index) << 8
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1
      crc &= 0xffff
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0")
}

export function buildPixBrCode(key: string, receiver: string, city = "BELEM") {
  const account = field("00", "br.gov.bcb.pix") + field("01", key)
  const body = [
    field("00", "01"),
    field("26", account),
    field("52", "0000"),
    field("53", "986"),
    field("58", "BR"),
    field("59", plain(receiver).slice(0, 25)),
    field("60", plain(city).slice(0, 15)),
    "6304",
  ].join("")

  return body + crc16(body)
}
