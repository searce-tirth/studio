"use client"

import * as React from "react"

type ColorTheme = "violet" | "zinc" | "rose" | "green" | "blue"

type ColorThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: ColorTheme
  storageKey?: string
}

type ColorThemeProviderState = {
  theme: ColorTheme
  setTheme: (theme: ColorTheme) => void
}

const initialState: ColorThemeProviderState = {
  theme: "violet",
  setTheme: () => null,
}

const ColorThemeProviderContext = React.createContext<ColorThemeProviderState>(initialState)

export function ColorThemeProvider({
  children,
  defaultTheme = "violet",
  storageKey = "ui-color-theme",
  ...props
}: ColorThemeProviderProps) {
  const [theme, setTheme] = React.useState<ColorTheme>(
    () => (typeof window !== 'undefined' ? (localStorage.getItem(storageKey) as ColorTheme) : undefined) || defaultTheme
  )

  React.useEffect(() => {
    const root = window.document.body

    root.classList.remove("theme-zinc", "theme-rose", "theme-green", "theme-blue");
    if (theme !== "violet") {
        root.classList.add(`theme-${theme}`);
    }

  }, [theme])

  const value = {
    theme,
    setTheme: (theme: ColorTheme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
  }

  return (
    <ColorThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ColorThemeProviderContext.Provider>
  )
}

export const useColorTheme = () => {
  const context = React.useContext(ColorThemeProviderContext)

  if (context === undefined)
    throw new Error("useColorTheme must be used within a ColorThemeProvider")

  return context
}
