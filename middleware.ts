import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const pathname = req.nextUrl.pathname

  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register")
  const isApiAuth = pathname.startsWith("/api/v1/auth")
  const isPublicApi = pathname.startsWith("/api/v1/users") && req.method === "POST"

  if (isApiAuth || isPublicApi) return NextResponse.next()
  if (isAuthRoute) return NextResponse.next()
  if (!isLoggedIn) return NextResponse.redirect(new URL("/login", req.nextUrl))

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
