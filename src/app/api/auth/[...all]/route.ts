import { toNextJsHandler } from "better-auth/next-js"
import { connection } from "next/server"
import { auth } from "@/lib/auth"

const handlers = toNextJsHandler(auth)

export async function GET(request: Request) {
  await connection()
  return handlers.GET(request)
}

export async function POST(request: Request) {
  await connection()
  return handlers.POST(request)
}
