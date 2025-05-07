import { createContext, useContext, useEffect } from "react"

type Theme = "light"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "light",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  ...props
}: ThemeProviderProps) {
  // No state needed as we're enforcing light theme only

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("dark")
    root.classList.add("light")
  }, [])

  const value: ThemeProviderState = {
    theme: "light",
    setTheme: () => {
      // Light theme is enforced, no theme switching allowed
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
