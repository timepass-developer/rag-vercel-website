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

    // Process workflow data
    let workflowData = body.workflow

    // Fix: Properly handle workflow data regardless of format
    if (typeof workflowData === 'string') {
      try {
        // Validate JSON string before parsing
        if (!workflowData.trim().startsWith('{') && !workflowData.trim().startsWith('[')) {
          workflowData = { nodes: [], edges: [] }
        } else {
          workflowData = JSON.parse(workflowData)
        }
      } catch (e) {
        console.error('Failed to parse workflow JSON:', e)
        // Provide default empty workflow if parsing fails
        workflowData = { nodes: [], edges: [] }
      }
    } else if (!workflowData || typeof workflowData !== 'object') {
      // Ensure workflowData is a valid object
      workflowData = { nodes: [], edges: [] }
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

// Handle PATCH request to update a RAG app
export async function PATCH(request: NextRequest) {
  try {
    const payload = await getPayload()
    const body = await request.json()
    const searchParams = new URL(request.url).searchParams

    // Get where condition from query params - this will determine which app(s) to update
    const whereParam = searchParams.get('where')
    let where = {}

    if (whereParam) {
      try {
        where = JSON.parse(whereParam)
      } catch (e) {
        console.error('Failed to parse where parameter:', e)
      }
    }

    // Process workflow data if it's a string
    let workflowData = body.workflow
    if (typeof workflowData === 'string') {
      try {
        // Validate JSON string before parsing
        if (workflowData.trim().startsWith('{') || workflowData.trim().startsWith('[')) {
          workflowData = JSON.parse(workflowData)
        } else {
          workflowData = { nodes: [], edges: [] }
        }
      } catch (e) {
        console.error('Failed to parse workflow JSON:', e)
        workflowData = { nodes: [], edges: [] }
      }
    } else if (!workflowData || typeof workflowData !== 'object') {
      workflowData = { nodes: [], edges: [] }
    }

    const updateData = {
      ...body,
      workflow: workflowData,
    }

    // Remove id from updateData if present - it shouldn't be part of the update
    if ('id' in updateData) {
      delete updateData.id
    }

    // Update the RAG app(s)
    const result = await payload.update({
      collection: 'rag-apps',
      where,
      data: updateData,
    })

    // Revalidate paths
    if (body.slug) {
      revalidatePath('/rag-gallery')
      revalidatePath(`/rag-gallery/${body.slug}`)
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating RAG app:', error)
    return NextResponse.json({ error: 'Failed to update RAG application' }, { status: 500 })
  }
}

// Handle DELETE request to delete RAG app(s)
export async function DELETE(request: NextRequest) {
  try {
    const payload = await getPayload()
    const searchParams = new URL(request.url).searchParams

    // Get where condition from query params
    const whereParam = searchParams.get('where')
    let where = {}

    if (whereParam) {
      try {
        where = JSON.parse(whereParam)
      } catch (e) {
        console.error('Failed to parse where parameter:', e)
      }
    }

    // Delete the RAG app(s) matching the where condition
    const result = await payload.delete({
      collection: 'rag-apps',
      where,
    })

    // Revalidate paths
    revalidatePath('/rag-gallery')
    revalidatePath('/rag-admin')

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error deleting RAG app:', error)
    return NextResponse.json({ error: 'Failed to delete RAG application' }, { status: 500 })
  }
}
