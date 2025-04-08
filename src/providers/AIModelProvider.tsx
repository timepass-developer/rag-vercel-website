'use client'
import React, { createContext, useContext, useState } from 'react'
import axios from 'axios'

export type ModelType = 'openai' | 'mistral' | 'anthropic' | 'local'

interface GenerateOptions {
  temperature?: number
  max_tokens?: number
  top_p?: number
  frequency_penalty?: number
  presence_penalty?: number
}

export interface AIModelContextType {
  generate: (prompt: string, options?: GenerateOptions) => Promise<string>
  generateWithMistral: (prompt: string, options?: GenerateOptions) => Promise<string>
  currentModel: ModelType
  setCurrentModel: (model: ModelType) => void
  isGenerating: boolean
  error: string | null
}

const AIModelContext = createContext<AIModelContextType>({
  generate: async () => '',
  generateWithMistral: async () => '',
  currentModel: 'openai',
  setCurrentModel: () => {},
  isGenerating: false,
  error: null,
})

export const useAIModel = () => useContext(AIModelContext)

interface AIModelProviderProps {
  children: React.ReactNode
  openaiApiKey?: string
  mistralApiKey?: string
  anthropicApiKey?: string
}

export const AIModelProvider: React.FC<AIModelProviderProps> = ({
  children,
  openaiApiKey,
  mistralApiKey,
  anthropicApiKey,
}) => {
  const [currentModel, setCurrentModel] = useState<ModelType>('openai')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Function to generate text with OpenAI
  const generateWithOpenAI = async (
    prompt: string,
    options: GenerateOptions = {},
  ): Promise<string> => {
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not provided')
    }

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: options.temperature ?? 0.7,
          max_tokens: options.max_tokens ?? 500,
          top_p: options.top_p ?? 1,
          frequency_penalty: options.frequency_penalty ?? 0,
          presence_penalty: options.presence_penalty ?? 0,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiApiKey}`,
          },
        },
      )

      return response.data.choices[0].message.content
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      throw new Error(`OpenAI generation failed: ${errorMessage}`)
    }
  }

  // Function to generate text with Mistral
  const generateWithMistral = async (
    prompt: string,
    options: GenerateOptions = {},
  ): Promise<string> => {
    if (!mistralApiKey) {
      throw new Error('Mistral API key not provided')
    }

    try {
      const response = await axios.post(
        'https://api.mistral.ai/v1/chat/completions',
        {
          model: 'mistral-medium',
          messages: [{ role: 'user', content: prompt }],
          temperature: options.temperature ?? 0.7,
          max_tokens: options.max_tokens ?? 500,
          top_p: options.top_p ?? 1,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mistralApiKey}`,
          },
        },
      )

      return response.data.choices[0].message.content
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      throw new Error(`Mistral generation failed: ${errorMessage}`)
    }
  }

  // Function to generate text with Anthropic
  const generateWithAnthropic = async (
    prompt: string,
    options: GenerateOptions = {},
  ): Promise<string> => {
    if (!anthropicApiKey) {
      throw new Error('Anthropic API key not provided')
    }

    try {
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: 'claude-2',
          messages: [{ role: 'user', content: prompt }],
          temperature: options.temperature ?? 0.7,
          max_tokens: options.max_tokens ?? 500,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': anthropicApiKey,
            'anthropic-version': '2023-06-01',
          },
        },
      )

      return response.data.content[0].text
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      throw new Error(`Anthropic generation failed: ${errorMessage}`)
    }
  }

  // Main generation function that routes to the appropriate model
  const generate = async (prompt: string, options: GenerateOptions = {}): Promise<string> => {
    setIsGenerating(true)
    setError(null)

    try {
      let result: string

      switch (currentModel) {
        case 'openai':
          result = await generateWithOpenAI(prompt, options)
          break
        case 'mistral':
          result = await generateWithMistral(prompt, options)
          break
        case 'anthropic':
          result = await generateWithAnthropic(prompt, options)
          break
        case 'local':
          // Local model implementation would go here
          result = `[Local model response] This is a placeholder for a local model response.`
          break
        default:
          // Default to OpenAI
          result = await generateWithOpenAI(prompt, options)
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      setError(errorMessage)
      console.error('AI generation error:', err)
      return `Error: ${errorMessage}`
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <AIModelContext.Provider
      value={{
        generate,
        generateWithMistral,
        currentModel,
        setCurrentModel,
        isGenerating,
        error,
      }}
    >
      {children}
    </AIModelContext.Provider>
  )
}
