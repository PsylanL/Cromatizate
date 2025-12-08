import type React from "react"
import type { Metadata, Viewport } from "next"
import { Atkinson_Hyperlegible } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { AccessibilityProvider } from "@/components/AccesibilityProvider"

const atkinson = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-atkinson",
})

export const metadata: Metadata = {
  title: "Cromatizate - Accesibilidad Visual para Daltonismo",
  description:
    "Plataforma que adapta dinámicamente el contenido visual para diferentes tipos de daltonismo usando inteligencia artificial semántica.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${atkinson.variable} font-sans antialiased`}>
        <a href="#main-content" className="skip-link">
          Saltar al contenido principal
        </a>
        <AccessibilityProvider>{children}</AccessibilityProvider>
        <Analytics />
      </body>
    </html>
  )
}
