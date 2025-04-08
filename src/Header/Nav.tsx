import React, { Fragment, useContext, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Transition, Menu } from '@headlessui/react'
import { FiChevronDown } from 'react-icons/fi'

import { Header as HeaderType } from '../payload-types'
import { headerSyncNav } from './headerSyncNav'
import { Gutter } from '../components/Gutter'
import { HeaderThemeContext } from '../providers/HeaderTheme'

import classes from './index.module.scss'

type NavItems = HeaderType['navItems']

export const HeaderNav: React.FC<{
  navItems: NavItems
  className?: string
  children?: React.ReactNode
}> = ({ navItems, className, children }) => {
  const { theme, setTheme } = useContext(HeaderThemeContext)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  // Ensure fetch request only on client side
  const pathname = usePathname()

  // Sync header theme
  headerSyncNav(theme)

  return (
    <nav
      className={[
        classes.nav,
        className,
        theme === 'dark' ? classes.navThemeDark : classes.navThemeLight,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Gutter className={classes.navGutter}>
        <div className={classes.navWrap}>
          <div className="flex items-center gap-6">
            {navItems?.map((navItem) => {
              // Fix destructuring to access the label from inside link object
              const { id } = navItem
              const link =
                typeof navItem.link === 'string' ? navItem.link : navItem.link?.url || '/'
              const label = typeof navItem.link === 'string' ? '' : navItem.link?.label || ''

              return (
                <Link
                  key={id}
                  href={link}
                  className={[classes.navItem, pathname === link ? classes.navLinkActive : '']
                    .filter(Boolean)
                    .join(' ')}
                >
                  {label}
                </Link>
              )
            })}

            {/* RAG Applications Menu */}
            <Menu as="div" className="relative inline-block text-left">
              <Menu.Button
                className={[
                  classes.navItem,
                  pathname?.includes('/rag') ? classes.navLinkActive : '',
                  'inline-flex items-center gap-1',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setDropdownOpen(true)}
              >
                RAG Apps
                <FiChevronDown className="w-4 h-4" aria-hidden="true" />
              </Menu.Button>

              <Transition
                show={dropdownOpen}
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
                beforeLeave={() => setDropdownOpen(false)}
              >
                <Menu.Items
                  static
                  className="absolute left-0 mt-2 w-56 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                >
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="/rag-gallery"
                          className={`${
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                          } block px-4 py-2 text-sm`}
                        >
                          RAG Gallery
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="/rag-admin"
                          className={`${
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                          } block px-4 py-2 text-sm`}
                        >
                          Build RAG App
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="/rag-admin/docs"
                          className={`${
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                          } block px-4 py-2 text-sm`}
                        >
                          Documentation
                        </Link>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>

          {children}
        </div>
      </Gutter>
    </nav>
  )
}
