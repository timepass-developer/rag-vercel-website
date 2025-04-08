'use client'
import React, { createContext, useContext, useState } from 'react'

export interface DocumentMetadata {
  filename: string
  fileType: string
  fileSize: number
  pageCount?: number
  createdAt?: string
  modifiedAt?: string
  author?: string
  title?: string
}

export interface ProcessedDocument {
  text: string
  metadata: DocumentMetadata
  chunks?: string[]
}

interface DocumentProcessorContextType {
  processDocument: (file: File) => Promise<ProcessedDocument>
  splitIntoChunks: (text: string, chunkSize: number, chunkOverlap: number) => string[]
  isProcessing: boolean
  error: string | null
}

const DocumentProcessorContext = createContext<DocumentProcessorContextType>({
  processDocument: async () => ({
    text: '',
    metadata: { filename: '', fileType: '', fileSize: 0 },
  }),
  splitIntoChunks: () => [''],
  isProcessing: false,
  error: null,
})

export const useDocumentProcessor = () => useContext(DocumentProcessorContext)

interface DocumentProcessorProviderProps {
  children: React.ReactNode
}

export const DocumentProcessorProvider: React.FC<DocumentProcessorProviderProps> = ({
  children,
}) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Function to extract text from a PDF file
  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      // In a real implementation, we would use pdf.js or a similar library
      // For this example, we'll simulate PDF processing
      await new Promise((resolve) => setTimeout(resolve, 1000))

      return `This is simulated extracted text from the PDF file ${file.name}.
      
In a real implementation, this would contain the actual text content extracted from the PDF.
      
PDF processing would use pdf.js or a similar library to extract text content from each page.

The extracted text would then be available for further processing, such as language detection,
chunking, vectorization, and use in RAG workflows.`
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      throw new Error(`Failed to extract text from PDF: ${errorMessage}`)
    }
  }

  // Function to extract text from a DOCX file
  const extractTextFromDOCX = async (file: File): Promise<string> => {
    try {
      // In a real implementation, we would use mammoth.js or a similar library
      // For this example, we'll simulate DOCX processing
      await new Promise((resolve) => setTimeout(resolve, 800))

      return `This is simulated extracted text from the DOCX file ${file.name}.
      
In a real implementation, this would contain the actual text content extracted from the document.
      
DOCX processing would use mammoth.js, docx4js, or a similar library to convert the document to HTML 
and then extract the text content.

The extracted text would preserve formatting where possible and be ready for further processing.`
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      throw new Error(`Failed to extract text from DOCX: ${errorMessage}`)
    }
  }

  // Function to read a plain text file
  const readTextFile = async (file: File): Promise<string> => {
    try {
      return await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => reject(new Error('Failed to read text file'))
        reader.readAsText(file)
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      throw new Error(`Failed to read text file: ${errorMessage}`)
    }
  }

  // Process document based on file type
  const processDocument = async (file: File): Promise<ProcessedDocument> => {
    setIsProcessing(true)
    setError(null)

    try {
      const fileType = file.name.split('.').pop()?.toLowerCase() || ''
      let text = ''

      // Extract text based on file type
      if (fileType === 'pdf') {
        text = await extractTextFromPDF(file)
      } else if (['docx', 'doc'].includes(fileType)) {
        text = await extractTextFromDOCX(file)
      } else if (['txt', 'md', 'csv'].includes(fileType)) {
        text = await readTextFile(file)
      } else {
        throw new Error(`Unsupported file type: ${fileType}`)
      }

      // Create metadata
      const metadata: DocumentMetadata = {
        filename: file.name,
        fileType,
        fileSize: file.size,
        createdAt: new Date().toISOString(),
      }

      return {
        text,
        metadata,
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      setError(errorMessage)
      console.error('Document processing error:', err)
      return {
        text: '',
        metadata: {
          filename: file.name,
          fileType: file.name.split('.').pop()?.toLowerCase() || '',
          fileSize: file.size,
        },
      }
    } finally {
      setIsProcessing(false)
    }
  }

  // Function to split text into chunks with optional overlap
  const splitIntoChunks = (
    text: string,
    chunkSize: number = 1000,
    chunkOverlap: number = 200,
  ): string[] => {
    if (!text) return []
    if (text.length <= chunkSize) return [text]

    const chunks: string[] = []
    let startIndex = 0

    while (startIndex < text.length) {
      // Adjust end index to prevent overflow
      let endIndex = Math.min(startIndex + chunkSize, text.length)

      // If we're not at the end of the text and this isn't the first chunk,
      // try to end at a natural boundary like a period or newline
      if (endIndex < text.length && startIndex > 0) {
        const boundaries = ['. ', '! ', '? ', '\n', '\r\n']

        // Look back for a natural break
        for (let i = endIndex; i > endIndex - 50 && i > startIndex; i--) {
          const substr = text.substring(i - 2, i)
          if (boundaries.some((b) => substr.includes(b))) {
            endIndex = i
            break
          }
        }
      }

      // Add the chunk
      chunks.push(text.substring(startIndex, endIndex))

      // Move to the next chunk with overlap
      startIndex = endIndex - chunkOverlap

      // Make sure we're making progress
      if (startIndex >= text.length || endIndex === text.length) break
      if (startIndex <= 0) startIndex = 0
    }

    return chunks
  }

  return (
    <DocumentProcessorContext.Provider
      value={{
        processDocument,
        splitIntoChunks,
        isProcessing,
        error,
      }}
    >
      {children}
    </DocumentProcessorContext.Provider>
  )
}
