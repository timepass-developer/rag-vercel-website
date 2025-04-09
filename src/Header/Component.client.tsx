'use client'
import React, { useEffect } from 'react'
import { useHeaderTheme } from '@/providers/HeaderTheme'

export const HeaderClient: React.FC<{ defaultTheme?: string }> = ({ defaultTheme = 'system' }) => {
  const { setTheme: setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    try {
      // Only set theme if function exists to prevent errors
      if (typeof setHeaderTheme === 'function') {
        setHeaderTheme(defaultTheme as any)
      }
    } catch (error) {
      console.error('Error setting header theme:', error)
    }
  }, [defaultTheme, setHeaderTheme])

  return null // This is just for theme management, no UI needed
}
