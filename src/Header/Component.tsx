'use client'

import React from 'react'
import { Header as HeaderType } from '../payload-types'
import { HeaderNav } from './Nav'

// Named export for the Header component
export const Header: React.FC<{
  header?: HeaderType
}> = ({ header }) => {
  const navItems = header?.navItems || []

  return (
    <header>
      <HeaderNav navItems={navItems} />
    </header>
  )
}

// Default export as well for flexibility
export default Header
