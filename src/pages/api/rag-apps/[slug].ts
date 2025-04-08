import { NextApiRequest, NextApiResponse } from 'next'
import { getPayload } from '@/utilities/getPayload'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { slug } = req.query
    const payload = await getPayload()

    const result = await payload.find({
      collection: 'rag-apps',
      where: {
        slug: {
          equals: slug,
        },
      },
      limit: 1,
    })

    if (result.docs && result.docs.length > 0) {
      return res.status(200).json(result.docs[0])
    }

    return res.status(404).json({ error: 'RAG application not found' })
  } catch (error) {
    console.error('Error in RAG App slug API:', error)
    return res.status(500).json({ error: 'Failed to fetch RAG application' })
  }
}
