import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

/**
 * AppLayout - Server component that guards all (app) routes behind authentication.
 * Redirects unauthenticated users to /login.
 */
export default async function AppLayout({
  children,
}: {
  readonly children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect("/login")
  return <>{children}</>
}
