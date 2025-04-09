import { getServerSideURL } from '../../utilities/getURL'

export const revalidateFooter = async (): Promise<void> => {
  try {
    // Get the base URL from server-side utility function
    const baseUrl = getServerSideURL()

    // Only proceed if we have a valid base URL
    if (!baseUrl) {
      console.warn('Unable to revalidate footer: No base URL available')
      return
    }

    // Construct the revalidation endpoint with a valid base URL
    const revalidationEndpoint = `${baseUrl}/api/revalidate`

    if (typeof fetch === 'function' && revalidationEndpoint) {
      // Validate URL before attempting to fetch
      try {
        // This will throw if the URL is invalid
        new URL(revalidationEndpoint)

        await fetch(revalidationEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            collection: 'globals',
            slug: 'footer',
          }),
        })
      } catch (urlError) {
        console.error('Invalid revalidation URL:', urlError)
      }
    }
  } catch (err) {
    console.error('Error revalidating footer:', err)
  }
}
