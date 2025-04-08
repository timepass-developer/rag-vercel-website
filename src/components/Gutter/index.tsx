import React from 'react'

type Props = {
  children: React.ReactNode
  className?: string
  left?: boolean
  right?: boolean
}

export const Gutter: React.FC<Props> = ({ left = true, right = true, className, children }) => {
  const gutterClasses = [
    left && 'pl-6 md:pl-10 lg:pl-12',
    right && 'pr-6 md:pr-10 lg:pr-12',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return <div className={gutterClasses}>{children}</div>
}
