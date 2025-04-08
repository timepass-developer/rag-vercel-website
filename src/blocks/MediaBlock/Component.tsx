import type { StaticImageData } from 'next/image'
import Image from 'next/image'

import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'

import type { MediaBlock as MediaBlockProps } from '@/payload-types'

import { Media } from '../../components/Media'

type Props = MediaBlockProps & {
  breakout?: boolean
  captionClassName?: string
  className?: string
  enableGutter?: boolean
  imgClassName?: string
  staticImage?: StaticImageData
  disableInnerContainer?: boolean
}

export const MediaBlock: React.FC<Props> = (props) => {
  const {
    captionClassName,
    className,
    enableGutter = true,
    imgClassName,
    media,
    staticImage,
    disableInnerContainer,
  } = props

  let caption
  if (media && typeof media === 'object') caption = media.caption

  return (
    <div
      className={cn(
        '',
        {
          container: enableGutter,
        },
        className,
      )}
    >
      {media && (
        <Media
          imgClassName={cn('border border-border rounded-[0.8rem]', imgClassName)}
          resource={media}
        />
      )}
      {staticImage && !media && (
        <Image
          src={staticImage}
          alt={typeof caption === 'string' ? caption : 'Media image'}
          className={cn('border border-border rounded-[0.8rem] w-full h-auto', imgClassName)}
        />
      )}
      {caption && (
        <figcaption
          className={cn(
            'mt-2 text-center text-sm text-gray-600 dark:text-gray-400 container mx-auto',
            captionClassName,
          )}
        >
          {typeof caption === 'string' ? caption : <RichText data={caption as any} />}
        </figcaption>
      )}
    </div>
  )
}
