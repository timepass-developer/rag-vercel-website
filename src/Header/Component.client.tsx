'use client'

import React from 'react'
import { Header as HeaderType } from '../payload-types'
import { HeaderNav } from './Nav'

export const HeaderComponent: React.FC<{
  header: HeaderType
}> = ({ header }) => {
  const navItems = header?.navItems || []

  return (
    <header>
      <HeaderNav navItems={navItems} />
    </header>
  )
}
