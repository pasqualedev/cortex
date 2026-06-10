import type { Metadata } from "next"
import { Public_Sans } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"

const publicSans = Public_Sans({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Cortex ENEM",
  description: "Transformando estudo em progressão.",
}

export default function RootLayout({
  children,
}: {
  readonly children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={`${publicSans.className} bg-zinc-950 text-zinc-100 antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
