# ADMIN-P2 — APIMG upload review

## Contract (unchanged)

- Authenticated Admin server action only (`uploadGiftImage`)
- Formats: JPEG, PNG, WebP via magic-byte inspection
- Max size: 10 MB
- Multipart field: `file` only (no folder fields)
- Response requires `https` URL + `public_id` + format + bytes
- On failure, previous `Gift.image` / `imagePublicId` are not overwritten
- Double-submit guarded in UI with `uploadingId` state

## next/image hosts

`next.config.ts` allows:

- `apimg.com.br` / `*.apimg.com.br`
- `res.cloudinary.com` / `*.cloudinary.com`

## Test policy

No live APIMG upload is required for CI. Unit coverage lives in `src/lib/apimg` tests (body, response contract, byte validation).
