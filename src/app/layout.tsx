import '@/styles/globals.css'
import React from 'react'
import Script from 'next/script'
import { Providers } from '@/providers'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Replace inline script with a more React-friendly approach */}
        <Script id="toggle-block-script" strategy="afterInteractive">{`
          // Wait for hydration to complete before manipulating the DOM
          document.addEventListener('DOMContentLoaded', function() {
            const spans = document.querySelectorAll('span');
            spans.forEach(function(span) {
              if (span.textContent && span.textContent.trim() === 'Toggle block') {
                requestAnimationFrame(function() {
                  // Use a safer way that won't cause hydration errors
                  span.style.display = 'none';
                });
              }
            });
          });
        `}</Script>
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
