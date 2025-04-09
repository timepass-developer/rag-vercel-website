'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

type Theme = 'dark' | 'light' | 'system'

interface HeaderThemeContextType {
  theme: Theme
  setHeaderTheme: (theme: Theme) => void
}

// Create context with default implementations to prevent "is not a function" errors
const defaultSetHeaderTheme = (theme: Theme) => {
  console.warn('setHeaderTheme was called before being properly initialized')
}

const HeaderThemeContext = createContext<HeaderThemeContextType>({
  theme: 'system',
  setHeaderTheme: defaultSetHeaderTheme,
})

export const useHeaderTheme = () => useContext(HeaderThemeContext)

export const HeaderThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('system')

  const setHeaderTheme = useCallback((newTheme: Theme) => {
    setTheme(newTheme)
    // Apply theme changes to document if needed
    if (typeof window !== 'undefined') {
      document.documentElement.dataset.headerTheme = newTheme
    }
  }, [])

  return (
    <HeaderThemeContext.Provider value={{ theme, setHeaderTheme }}>
      {children}
    </HeaderThemeContext.Provider>
  )
}
