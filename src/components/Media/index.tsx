import React from 'react'

export const Media: React.FC<{
  resource: any
  width?: number
  height?: number
  className?: string
  imgClassName?: string
  priority?: boolean
}> = ({ resource, width, height, className, imgClassName, priority }) => {
  if (!resource || !resource.url) {
    return null
  }

  return (
    <div className={className}>
      <img
        src={resource.url}
        alt={resource.alt || ''}
        width={width}
        height={height}
        className={imgClassName}
        loading={priority ? undefined : 'lazy'}
      />
    </div>
  )
}
