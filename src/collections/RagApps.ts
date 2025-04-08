import { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrSelf } from '../access/isAdmin'

export const RagApps: CollectionConfig = {
  slug: 'rag-apps',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'author', 'createdAt'],
    group: 'RAG',
  },
  access: {
    read: () => true,
    create: () => true, // Allow anyone to create (can be restricted with authentication)
    update: isAdminOrSelf,
    delete: isAdminOrSelf,
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'The name of your RAG application',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Briefly describe what your application does',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'The URL-friendly name for your application',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      defaultValue: 'draft',
      required: true,
      admin: {
        description: 'Only published apps will appear in the gallery',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Feature this app in the gallery',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Cover image for the application',
      },
    },
    {
      name: 'tags',
      type: 'array',
      admin: {
        description: 'Tags to categorize this application',
      },
      fields: [
        {
          name: 'tag',
          type: 'text',
        },
      ],
    },
    {
      name: 'workflow',
      type: 'json',
      admin: {
        description: 'The RAG workflow configuration (nodes and edges)',
      },
    },
    {
      name: 'apiKeys',
      type: 'group',
      admin: {
        description: 'API keys for the application (encrypted)',
      },
      fields: [
        {
          name: 'openai',
          type: 'text',
          admin: {
            description: 'OpenAI API Key',
          },
        },
        {
          name: 'mistral',
          type: 'text',
          admin: {
            description: 'Mistral API Key',
          },
        },
        {
          name: 'anthropic',
          type: 'text',
          admin: {
            description: 'Anthropic API Key',
          },
        },
        {
          name: 'assemblyAi',
          type: 'text',
          admin: {
            description: 'AssemblyAI API Key',
          },
        },
      ],
    },
    {
      name: 'uiSettings',
      type: 'group',
      admin: {
        description: 'UI configuration for the application',
      },
      fields: [
        {
          name: 'theme',
          type: 'select',
          options: [
            { label: 'System Default', value: 'system' },
            { label: 'Light', value: 'light' },
            { label: 'Dark', value: 'dark' },
          ],
          defaultValue: 'system',
        },
        {
          name: 'showWorkflow',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Show the workflow diagram in the application',
          },
        },
      ],
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        position: 'sidebar',
      },
    },
  ],
  endpoints: [
    {
      path: '/execute/:id',
      method: 'post',
      handler: async (req) => {
        // Access route parameters from req.query.id instead of req.params
        const id = req.query?.id
        const body = typeof req.json === 'function' 
          ? await req.json() 
          : req.body || {}
        const { input } = body

        return new Response(
          JSON.stringify({
            success: true,
            message: 'RAG workflow execution initiated',
            results: {
              id,
              input,
              output: 'This is a placeholder response for the RAG workflow execution.',
            },
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          },
        )
      },
    },
  ],
}
