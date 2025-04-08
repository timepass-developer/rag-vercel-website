import React from 'react'
import { Providers } from '@/providers'

export default function RagGalleryLayout({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>
}
