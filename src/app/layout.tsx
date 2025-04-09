import '@/styles/globals.css'
import React from 'react'
import Script from 'next/script'
import { Providers } from '@/providers'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Use the updated script with arrow functions */}
        <Script id="toggle-block-script" strategy="afterInteractive">{`
        
          document.addEventListener('DOMContentLoaded', () => {
            const spans = document.querySelectorAll('span')
            spans.forEach((span) => {
              if (span.textContent && span.textContent.trim() === 'Toggle block') {
                span.style.display = 'none'
              }
            })
          })
        `}</Script>
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
