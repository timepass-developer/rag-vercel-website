import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/utilities/getPayload'
import { revalidatePath } from 'next/cache'

// Handle GET request to fetch RAG apps
export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload()
    const searchParams = request.nextUrl.searchParams

    const page = Number(searchParams.get('page')) || 1
    const limit = Number(searchParams.get('limit')) || 10
    const sort = searchParams.get('sort')?.toString() || '-createdAt'

    let where = {}
    const whereParam = searchParams.get('where')
    if (whereParam) {
      try {
        where = JSON.parse(whereParam)
      } catch (e) {
        console.error('Failed to parse where parameter:', e)
      }
    }

    const result = await payload.find({
      collection: 'rag-apps',
      page,
      limit,
      sort,
      where,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching RAG apps:', error)
    return NextResponse.json({ error: 'Failed to fetch RAG applications' }, { status: 500 })
  }
}

// Handle POST request to create a new RAG app
export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload()
    const body = await request.json()

    // Process workflow data if it's a JSON string
    let workflowData = body.workflow
    if (typeof workflowData === 'string') {
      try {
        workflowData = JSON.parse(workflowData)
      } catch (e) {
        console.error('Failed to parse workflow:', e)
        workflowData = { nodes: [], edges: [] }
      }
    }

    const result = await payload.create({
      collection: 'rag-apps',
      data: {
        title: body.title,
        description: body.description,
        slug: body.slug,
        status: body.status || 'draft',
        workflow: workflowData,
        apiKeys: body.apiKeys || {},
        uiSettings: body.uiSettings || { theme: 'system', showWorkflow: false },
        author: body.author,
      },
    })

    // Revalidate related paths after creating a new RAG app
    revalidatePath('/rag-gallery')
    revalidatePath(`/rag-gallery/${body.slug}`)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error creating RAG app:', error)
    return NextResponse.json({ error: 'Failed to create RAG application' }, { status: 500 })
  }
}
