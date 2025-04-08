// Client-side version for fetching RAG apps data

/**
 * Client-side version of RAG API functions that use standard fetch instead of Payload
 */
export const fetchRagAppsClient = async () => {
  try {
    const response = await fetch('/api/rag-apps')
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`)
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
      throw new Error(`HTTP Error: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error(`Error fetching RAG app ${slug}:`, error)
    return null
  }
}
