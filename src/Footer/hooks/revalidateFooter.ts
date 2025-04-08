import type { GlobalAfterChangeHook } from 'payload'

export const revalidateFooter: GlobalAfterChangeHook = async ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    try {
      // Use fetch API to call a revalidation endpoint instead of direct revalidateTag
      // This allows us to trigger revalidation without requiring the server component API
      const revalidationEndpoint = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/revalidate`
      
      if (typeof fetch === 'function' && revalidationEndpoint) {
        await fetch(revalidationEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            collection: 'globals',
            slug: 'footer',
            secret: process.env.REVALIDATION_SECRET,
          }),
        })
      } else {
        console.log('Revalidation skipped: fetch not available or endpoint not configured')
      }
    } catch (err) {
      console.error('Error revalidating footer:', err)
    }
  }
}
