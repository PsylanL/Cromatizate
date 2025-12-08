"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type FontSize = "normal" | "large" | "extra-large"

interface AccessibilityContextType {
  fontSize: FontSize
  setFontSize: (size: FontSize) => void
  highContrast: boolean
  setHighContrast: (enabled: boolean) => void
  isDarkMode: boolean
  setIsDarkMode: (enabled: boolean) => void
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (!context) {
    throw new Error("useAccessibility must be used within AccessibilityProvider")
  }
  return context
}

const fontSizeClasses = {
  normal: "",
  large: "text-lg",
  "extra-large": "text-xl",
}

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [fontSize, setFontSize] = useState<FontSize>("normal")
  const [highContrast, setHighContrast] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check system preference for dark mode
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    setIsDarkMode(prefersDark)

    // Load saved preferences
    const savedFontSize = localStorage.getItem("fontSize") as FontSize
    const savedHighContrast = localStorage.getItem("highContrast") === "true"
    const savedDarkMode = localStorage.getItem("darkMode")

    if (savedFontSize) setFontSize(savedFontSize)
    if (savedHighContrast) setHighContrast(savedHighContrast)
    if (savedDarkMode !== null) setIsDarkMode(savedDarkMode === "true")
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Apply classes to document
    const html = document.documentElement

    // Dark mode
    if (isDarkMode) {
      html.classList.add("dark")
    } else {
      html.classList.remove("dark")
    }

    // High contrast
    if (highContrast) {
      html.classList.add("high-contrast")
    } else {
      html.classList.remove("high-contrast")
    }

    // Font size
    html.classList.remove("text-lg", "text-xl")
    if (fontSizeClasses[fontSize]) {
      html.classList.add(fontSizeClasses[fontSize])
    }

    // Save preferences
    localStorage.setItem("fontSize", fontSize)
    localStorage.setItem("highContrast", String(highContrast))
    localStorage.setItem("darkMode", String(isDarkMode))
  }, [fontSize, highContrast, isDarkMode, mounted])

  return (
    <AccessibilityContext.Provider
      value={{
        fontSize,
        setFontSize,
        highContrast,
        setHighContrast,
        isDarkMode,
        setIsDarkMode,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  )
}
