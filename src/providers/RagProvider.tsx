'use client'
import React, { createContext, useContext, useState } from 'react'
import { useAIModel } from './AIModelProvider'
import { useMemgraph } from './MemgraphProvider'

interface Document {
  id: string
  content: string
  metadata: Record<string, any>
}

interface SearchResult {
  documents: Document[]
  relevanceScores: number[]
}

interface RagContextType {
  indexDocument: (content: string, metadata?: Record<string, any>) => Promise<string>
  searchDocuments: (query: string, limit?: number) => Promise<SearchResult>
  generateAnswerFromContext: (query: string, context: string[]) => Promise<string>
  simplifyAnswer: (text: string) => Promise<string>
  executeWorkflowNode: (nodeType: string, inputs: any, apiKeys?: any) => Promise<any>
  isProcessing: boolean
  error: string | null
}

const RagContext = createContext<RagContextType>({
  indexDocument: async () => '',
  searchDocuments: async () => ({ documents: [], relevanceScores: [] }),
  generateAnswerFromContext: async () => '',
  simplifyAnswer: async () => '',
  executeWorkflowNode: async () => ({}),
  isProcessing: false,
  error: null,
})

export const useRAG = () => useContext(RagContext)

interface RagProviderProps {
  children: React.ReactNode
}

export const RagProvider: React.FC<RagProviderProps> = ({ children }) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { generate } = useAIModel()
  const { runQuery } = useMemgraph()

  // Generate a completion using the AI model
  const generateCompletion = async (prompt: string, systemPrompt: string = '') => {
    try {
      const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt
      const response = await generate(fullPrompt)
      return { content: response }
    } catch (error) {
      console.error('Error generating completion:', error)
      throw error
    }
  }

  // Explain text in simpler terms
  const explainInSimpleTerms = async (text: string) => {
    try {
      const response = await generate(`Explain the following text in simpler terms:\n\n${text}`)
      return { content: response }
    } catch (error) {
      console.error('Error simplifying text:', error)
      throw error
    }
  }

  // Execute a workflow node based on its type and inputs
  const executeWorkflowNode = async (nodeType: string, inputs: any, apiKeys?: any) => {
    setIsProcessing(true)
    setError(null)

    try {
      let result = {}

      // Execute different node types
      switch (nodeType) {
        case 'documentProcessing':
          // Process document data
          if (inputs.file) {
            const text = `Processed content from ${inputs.file.name}`
            result = { text, metadata: { filename: inputs.file.name } }
          }
          break

        case 'imageProcessing':
          // Process image data
          if (inputs.file) {
            const text = `Extracted text from image ${inputs.file.name}`
            result = { text, caption: `Image showing: ${inputs.file.name}` }
          }
          break

        case 'llmQuery':
          // Generate LLM response
          if (inputs.query) {
            const context = inputs.context || []
            const response = await generateAnswerFromContext(inputs.query, context)
            result = { response }
          }
          break

        case 'vectorStore':
          // Store document in vector database
          if (inputs.text) {
            const docId = await indexDocument(inputs.text, inputs.metadata || {})
            result = { documentId: docId }
          }
          break

        // Add more node type handlers as needed

        default:
          // Pass through data for unknown node types
          result = { ...inputs }
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      setError(`Execution error: ${errorMessage}`)
      console.error('Node execution error:', err)
      throw err
    } finally {
      setIsProcessing(false)
    }
  }

  // Store a document in Memgraph
  const indexDocument = async (
    content: string,
    metadata: Record<string, any> = {},
  ): Promise<string> => {
    setIsProcessing(true)
    setError(null)

    try {
      // Generate a summary for the document
      const summaryResponse = await generateCompletion(
        'Generate a concise summary (max 100 words) of the following text.',
        content,
      )

      const summary = summaryResponse.content

      // Create a unique ID for the document
      const id = `doc_${Date.now()}_${Math.floor(Math.random() * 1000)}`

      // Store the document in Memgraph with vector embedding
      // Note: In a real implementation, you would use a vector embedding API

      const query = `
        CREATE (d:Document {
          id: $id,
          content: $content,
          summary: $summary,
          timestamp: datetime(),
          metadata: $metadata
        })
        RETURN d.id as id
      `

      const result = await runQuery(query, {
        id,
        content,
        summary,
        metadata: JSON.stringify(metadata),
      })

      return result[0]?.id || id
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      setError(`Failed to index document: ${errorMessage}`)
      console.error('Document indexing error:', err)
      throw err
    } finally {
      setIsProcessing(false)
    }
  }

  // Search for documents in Memgraph
  const searchDocuments = async (query: string, limit = 5): Promise<SearchResult> => {
    setIsProcessing(true)
    setError(null)

    try {
      // In a production implementation, you would:
      // 1. Create an embedding for the query
      // 2. Perform a similarity search using vector operations in Memgraph

      // Simplified query-based search using document content matching
      const searchQuery = `
        MATCH (d:Document)
        WHERE d.content CONTAINS $queryText OR d.summary CONTAINS $queryText
        RETURN d.id as id, d.content as content, d.summary as summary, d.metadata as metadata
        LIMIT $limit
      `

      const results = await runQuery(searchQuery, {
        queryText: query,
        limit,
      })

      interface SearchResultItem {
        id: string;
        content: string;
        summary: string;
        metadata: string;
      }

      const documents: Document[] = (results as SearchResultItem[]).map((result) => ({
        id: result.id,
        content: result.content,
        summary: result.summary,
        metadata: result.metadata ? JSON.parse(result.metadata) : {},
      }))

      // Calculate dummy relevance scores (1.0 to 0.5)
      const relevanceScores = documents.map((_, index) => 1 - index / (documents.length * 2))

      return {
        documents,
        relevanceScores,
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      setError(`Search error: ${errorMessage}`)
      console.error('Document search error:', err)
      return { documents: [], relevanceScores: [] }
    } finally {
      setIsProcessing(false)
    }
  }

  // Generate an answer using RAG approach
  const generateAnswerFromContext = async (
    query: string,
    contextTexts: string[],
  ): Promise<string> => {
    setIsProcessing(true)
    setError(null)

    try {
      // Combine the context
      const context = contextTexts.join('\n\n---\n\n')

      // Generate an answer based on the provided context
      const response = await generateCompletion(
        query,
        `You are a helpful assistant that answers questions based on the provided context. 
         If you don't know the answer based on the context, say so - don't make up information.
         
         Context:
         ${context}`,
      )

      return response.content
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      setError(`Answer generation error: ${errorMessage}`)
      console.error('Answer generation error:', err)
      return ''
    } finally {
      setIsProcessing(false)
    }
  }

  // Simplify text to be more understandable
  const simplifyAnswer = async (text: string): Promise<string> => {
    try {
      const response = await explainInSimpleTerms(text)
      return response.content
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      setError(`Simplification error: ${errorMessage}`)
      console.error('Simplification error:', err)
      return text
    }
  }

  return (
    <RagContext.Provider
      value={{
        indexDocument,
        searchDocuments,
        generateAnswerFromContext,
        simplifyAnswer,
        isProcessing,
        error,
        executeWorkflowNode,
      }}
    >
      {children}
    </RagContext.Provider>
  )
}
