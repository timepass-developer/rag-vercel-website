'use client'
import React, { createContext, useState, useContext, useEffect } from 'react'

type HeaderTheme = 'light' | 'dark'

interface HeaderThemeContextType {
  theme: HeaderTheme
  setTheme: (theme: HeaderTheme) => void
}

// Export the context explicitly
export const HeaderThemeContext = createContext<HeaderThemeContextType>({
  theme: 'light',
  setTheme: () => {},
})

export const HeaderThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<HeaderTheme>('light')

  // Check for system preference on mount
  useEffect(() => {
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
    setTheme(isDarkMode ? 'dark' : 'light')

    // Listen for changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return (
    <HeaderThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </HeaderThemeContext.Provider>
  )
}

// Fix the useHeaderTheme hook export
export const useHeaderTheme = () => useContext(HeaderThemeContext)
