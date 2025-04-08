'use client'

// Client-side version that fetches from API endpoints instead of direct Payload imports
export type FetchRagAppsParams = {
  page?: number
  limit?: number
  sort?: string
  where?: Record<string, unknown>
}

export const fetchRagAppsClient = async (params: FetchRagAppsParams = {}) => {
  try {
    const searchParams = new URLSearchParams()
    if (params.page) searchParams.append('page', params.page.toString())
    if (params.limit) searchParams.append('limit', params.limit.toString())
    if (params.sort) searchParams.append('sort', params.sort)
    if (params.where) searchParams.append('where', JSON.stringify(params.where))

    const url = `/api/rag-apps?${searchParams.toString()}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching RAG apps:', error)
    return { docs: [], totalDocs: 0 }
  }
}

export const fetchRagAppBySlugClient = async (slug: string) => {
  try {
    const response = await fetch(`/api/rag-apps/${slug}`)

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching RAG app by slug:', error)
    return null
  }
}
