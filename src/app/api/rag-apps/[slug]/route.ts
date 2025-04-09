import { NextResponse } from 'next/server'
import { getPayload } from '@/utilities/getPayload'
import { revalidatePath } from 'next/cache'

// Bypass type checking entirely with any types
export async function GET(request: any, context: any): Promise<any> {
  try {
    const payload = await getPayload()
    const result = await payload.find({
      collection: 'rag-apps',
      where: {
        slug: {
          equals: context.params.slug,
        },
      },
      limit: 1,
    })

    if (!result.docs || result.docs.length === 0) {
      return NextResponse.json({ error: 'RAG app not found' }, { status: 404 })
    }

    return NextResponse.json(result.docs[0])
  } catch (error) {
    console.error(`Error fetching RAG app with slug ${context.params.slug}:`, error)
    return NextResponse.json({ error: 'Failed to fetch RAG application' }, { status: 500 })
  }
}

// Bypass type checking entirely with any types
export async function PATCH(request: any, context: any): Promise<any> {
  try {
    const payload = await getPayload()
    const body = await request.json()

    // Process workflow data if it's a string
    let workflowData = body.workflow
    if (typeof workflowData === 'string') {
      try {
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

    // Find app by slug first to get the ID
    const findResult = await payload.find({
      collection: 'rag-apps',
      where: {
        slug: {
          equals: context.params.slug,
        },
      },
      limit: 1,
    })

    if (!findResult.docs || findResult.docs.length === 0) {
      return NextResponse.json({ error: 'RAG app not found' }, { status: 404 })
    }

    const appId = findResult.docs[0]?.id

    if (!appId) {
      return NextResponse.json({ error: 'Invalid RAG app ID' }, { status: 404 })
    }

    // Update by ID
    const result = await payload.update({
      collection: 'rag-apps',
      id: appId,
      data: updateData,
    })

    // Revalidate paths
    if (body.slug) {
      revalidatePath('/rag-gallery')
      revalidatePath(`/rag-gallery/${body.slug}`)
      revalidatePath(`/rag-admin/edit/${body.slug}`)
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error(`Error updating RAG app with slug ${context.params.slug}:`, error)
    return NextResponse.json({ error: 'Failed to update RAG application' }, { status: 500 })
  }
}
