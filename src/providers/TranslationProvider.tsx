'use client'
import React, { createContext, useContext, useState } from 'react'
import { useAIModel } from './AIModelProvider'

interface TranslationResult {
  original: string
  translated: string
  sourceLanguage?: string
  targetLanguage: string
  detectedLanguage?: string
  error?: string
}

interface TranslationContextType {
  translate: (
    text: string,
    targetLanguage: string,
    sourceLanguage?: string,
  ) => Promise<TranslationResult>
  isTranslating: boolean
  error: string | null
}

const TranslationContext = createContext<TranslationContextType>({
  translate: async () => ({
    original: '',
    translated: '',
    targetLanguage: '',
  }),
  isTranslating: false,
  error: null,
})

export const useTranslation = () => useContext(TranslationContext)

interface TranslationProviderProps {
  children: React.ReactNode
  apiKey?: string
}

export const TranslationProvider: React.FC<TranslationProviderProps> = ({ children, apiKey }) => {
  const [isTranslating, setIsTranslating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { generateWithMistral } = useAIModel()

  // Function to translate text using Mistral
  const translateWithMistral = async (
    text: string,
    targetLanguage: string,
    sourceLanguage?: string,
  ): Promise<TranslationResult> => {
    try {
      // Create prompt for translation
      let prompt = ''

      if (sourceLanguage && sourceLanguage.toLowerCase() !== 'auto') {
        prompt = `Translate the following ${sourceLanguage} text to ${targetLanguage}:\n\n"${text}"`
      } else {
        prompt = `Translate the following text to ${targetLanguage}:\n\n"${text}"`
      }

      // Generate translation using Mistral
      const response = await generateWithMistral(prompt, {
        temperature: 0.2, // Lower temperature for more accurate translations
        max_tokens: text.length * 2, // Allow enough space for translation
      })

      // Extract translated text
      let translatedText = response.trim()

      // Clean up quotation marks or other formatting that might be in the response
      if (translatedText.startsWith('"') && translatedText.endsWith('"')) {
        translatedText = translatedText.slice(1, -1)
      }

      return {
        original: text,
        translated: translatedText,
        sourceLanguage: sourceLanguage || 'auto',
        targetLanguage,
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      throw new Error(`Translation failed: ${errorMessage}`)
    }
  }

  // Function to detect language using an API (as fallback)
  const detectLanguage = async (_inputText: string): Promise<string> => {
    if (!apiKey) {
      return 'unknown'
    }

    try {
      // This is a placeholder for a language detection API
      // In a real implementation, you would use a service like Google Cloud Translation API
      // or another language detection service

      // For demo purposes, we'll return a fixed value
      return 'English'
    } catch (err) {
      console.error('Language detection error:', err)
      return 'unknown'
    }
  }

  // Main translation function
  const translate = async (
    text: string,
    targetLanguage: string,
    sourceLanguage?: string,
  ): Promise<TranslationResult> => {
    setIsTranslating(true)
    setError(null)

    try {
      // Auto-detect language if not specified
      let actualSourceLanguage = sourceLanguage
      if (!actualSourceLanguage || actualSourceLanguage.toLowerCase() === 'auto') {
        actualSourceLanguage = await detectLanguage(text)
      }

      // Use Mistral for translation
      const result = await translateWithMistral(text, targetLanguage, actualSourceLanguage)

      return {
        ...result,
        detectedLanguage:
          actualSourceLanguage !== sourceLanguage ? actualSourceLanguage : undefined,
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      setError(errorMessage)
      console.error('Translation error:', err)
      return {
        original: text,
        translated: '',
        targetLanguage,
        error: errorMessage,
      }
    } finally {
      setIsTranslating(false)
    }
  }

  return (
    <TranslationContext.Provider
      value={{
        translate,
        isTranslating,
        error,
      }}
    >
      {children}
    </TranslationContext.Provider>
  )
}
