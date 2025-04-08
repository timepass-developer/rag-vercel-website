'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'

const PageClient: React.FC = () => {
  /* Force the header to be light mode */
  const { setTheme } = useHeaderTheme()

  useEffect(() => {
    setTheme('light')
  }, [setTheme])

  return <React.Fragment />
}

export default PageClient
