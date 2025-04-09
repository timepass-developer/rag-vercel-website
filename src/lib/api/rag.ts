'use server' // Mark this file as a server component

import { Payload, Where } from 'payload'
import { getPayload } from '@/utilities/getPayload'

export type FetchRagAppsParams = {
  page?: number
  limit?: number
  sort?: string
  where?: Where
}

export const fetchRagApps = async (params: FetchRagAppsParams = {}) => {
  try {
    const payload: Payload = await getPayload()

    const { page = 1, limit = 10, sort = '-createdAt', where = {} } = params

    // Build query options
    const options = {
      page,
      limit,
      sort,
      where,
    }

    // Fetch RAG apps from the collection
    const ragApps = await payload.find({
      collection: 'rag-apps',
      ...options,
    })

    return ragApps
  } catch (error) {
    console.error('Error fetching RAG apps:', error)
    return null
  }
}

export const fetchRagAppBySlug = async (slug: string) => {
  try {
    const payload: Payload = await getPayload()

    // Try to differentiate between numeric IDs and string slugs
    const isNumericId = /^\d+$/.test(slug)

    // Create where object with properly typed structure
    let whereClause: Where = {}

    if (isNumericId) {
      // If it looks like an ID, search by ID
      whereClause = {
        id: {
          equals: slug,
        },
      } as Where
    } else {
      // Otherwise search by slug
      whereClause = {
        slug: {
          equals: slug,
        },
      } as Where
    }

    // Fetch the RAG app by slug or ID
    const ragApp = await payload.find({
      collection: 'rag-apps',
      where: whereClause,
      limit: 1,
    })

    if (ragApp.docs && ragApp.docs.length > 0) {
      return ragApp.docs[0]
    }

    // If not found and it looks like an ID, try as a slug (fallback)
    if (isNumericId && ragApp.docs?.length === 0) {
      const bySlugResult = await payload.find({
        collection: 'rag-apps',
        where: {
          slug: {
            equals: slug,
          },
        } as Where,
        limit: 1,
      })

      if (bySlugResult.docs?.length > 0) {
        return bySlugResult.docs[0]
      }
    }

    return null
  } catch (error) {
    console.error('Error fetching RAG app by slug/id:', error)
    return null
  }
}

export const executeRagWorkflow = async (slug: string, input: any) => {
  try {
    const payload: Payload = await getPayload()

    // Call the custom endpoint to execute the RAG workflow
    const result = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/rag-apps/execute/${slug}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input }),
      },
    ).then((res) => res.json())

    return result
  } catch (error) {
    console.error('Error executing RAG workflow:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}
