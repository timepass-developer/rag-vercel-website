import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { collection, slug, secret } = req.body

    // Validate the request has the necessary data
    if (!collection || !slug) {
      return res.status(400).json({ message: 'Missing collection or slug parameter' })
    }

    // Validate the secret to prevent unauthorized revalidations
    if (secret !== process.env.REVALIDATION_SECRET) {
      return res.status(401).json({ message: 'Invalid token' })
    }

    // Construct a tag based on the collection and slug
    const tag = `${collection}_${slug}`

    // Use the Pages Router revalidation method
    await res.revalidate(`/`)

    // If we have specific paths that use the footer, revalidate them too
    // For example:
    // await res.revalidate(`/about`)
    // await res.revalidate(`/contact`)

    return res.json({ revalidated: true, tag })
  } catch (err) {
    // If there was an error, Next.js will continue to show
    // the last successfully generated page
    return res.status(500).send({ message: 'Error revalidating', error: err })
  }
}
