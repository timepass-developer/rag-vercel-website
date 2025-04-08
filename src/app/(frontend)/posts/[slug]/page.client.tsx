'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'

const PageClient: React.FC = () => {
  /* Force the header to be dark mode while we have an image behind it */
  const { theme, setTheme } = useHeaderTheme()

  useEffect(() => {
    setTheme('dark')
  }, [setTheme])

  return <React.Fragment />
}

export default PageClient
