import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import GTranslate from "@/components/GTranslate"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Formulaire Adinkra Fellowship",
  description: "Formulaire de contact avec intégration Google Sheets et Drive",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
      </head>
      <body className={inter.className}>
        <GTranslate />
        {children}
        <Toaster />
      </body>
    </html>
  )
}
