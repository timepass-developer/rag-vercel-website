'use client'
import React, { createContext, useContext, useState } from 'react'
import { useAIModel, AIModelContextType } from './AIModelProvider'

interface ImageProcessingContextType {
  extractTextFromImage: (file: File) => Promise<string>
  analyzeImageContent: (file: File) => Promise<string>
  isProcessing: boolean
  error: string | null
}

const ImageProcessingContext = createContext<ImageProcessingContextType>({
  extractTextFromImage: async () => '',
  analyzeImageContent: async () => '',
  isProcessing: false,
  error: null,
})

export const useImageProcessing = () => useContext(ImageProcessingContext)

interface ImageProcessingProviderProps {
  children: React.ReactNode
}

export const ImageProcessingProvider: React.FC<ImageProcessingProviderProps> = ({ children }) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { generate } = useAIModel()

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  const extractTextFromImage = async (file: File): Promise<string> => {
    setIsProcessing(true)
    setError(null)

    try {
      const base64Image = await convertImageToBase64(file)

      const systemPrompt = `The user has provided an image for text extraction. The image is included as a base64 string: ${base64Image}`
      const response = await generate(
        `${systemPrompt}\n\nExtract all visible text from this image. Return only the extracted text, without any additional comments or analysis.`,
      )

      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      setError(`Failed to extract text from image: ${errorMessage}`)
      console.error('Image text extraction error:', err)
      return ''
    } finally {
      setIsProcessing(false)
    }
  }

  const analyzeImageContent = async (file: File): Promise<string> => {
    setIsProcessing(true)
    setError(null)

    try {
      const base64Image = await convertImageToBase64(file)

      const systemPrompt = `The user has provided an image for analysis. The image is included as a base64 string: ${base64Image}`
      const response = await generate(
        `${systemPrompt}\n\nProvide a detailed analysis of the contents of this image. Describe what you see, including any text, objects, people, scenes, and other relevant details.`,
      )

      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      setError(`Failed to analyze image content: ${errorMessage}`)
      console.error('Image analysis error:', err)
      return ''
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <ImageProcessingContext.Provider
      value={{
        extractTextFromImage,
        analyzeImageContent,
        isProcessing,
        error,
      }}
    >
      {children}
    </ImageProcessingContext.Provider>
  )
}
