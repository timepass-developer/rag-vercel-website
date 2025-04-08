import React from 'react'

import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'
import { AIModelProvider } from './AIModelProvider'
import { TranslationProvider } from './TranslationProvider'
import { TranscriptionProvider } from './TranscriptionProvider'
import { RectFlowProvider } from './RectFlowProvider'
import { MemgraphProvider } from './MemgraphProvider'
import { RagProvider } from './RagProvider'
import { DocumentProcessorProvider } from './DocumentProcessor'
import { ImageProcessingProvider } from './ImageProcessingProvider'

// Get API keys from environment or passed in props
const getApiKeys = () => {
  return {
    openai: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
    mistral: process.env.NEXT_PUBLIC_MISTRAL_API_KEY || '',
    anthropic: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || '',
    assemblyAi: process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY || '',
  }
}

// Get Memgraph configuration
const getMemgraphConfig = () => {
  return {
    serverUrl: process.env.NEXT_PUBLIC_MEMGRAPH_URL || 'bolt://localhost:7687',
    username: process.env.NEXT_PUBLIC_MEMGRAPH_USERNAME || '',
    password: process.env.NEXT_PUBLIC_MEMGRAPH_PASSWORD || '',
  }
}

export const Providers: React.FC<{
  children: React.ReactNode
  apiKeys?: {
    openai?: string
    mistral?: string
    anthropic?: string
    assemblyAi?: string
  }
  memgraphConfig?: {
    serverUrl: string
    username?: string
    password?: string
  }
}> = ({ children, apiKeys = getApiKeys(), memgraphConfig = getMemgraphConfig() }) => {
  return (
    <ThemeProvider>
      <HeaderThemeProvider>
        <AIModelProvider
          openaiApiKey={apiKeys.openai}
          mistralApiKey={apiKeys.mistral}
          anthropicApiKey={apiKeys.anthropic}
        >
          <MemgraphProvider
            serverUrl={memgraphConfig.serverUrl}
            username={memgraphConfig.username}
            password={memgraphConfig.password}
          >
            <RagProvider>
              <DocumentProcessorProvider>
                <ImageProcessingProvider>
                  <TranslationProvider apiKey={apiKeys.mistral}>
                    <TranscriptionProvider assemblyAiApiKey={apiKeys.assemblyAi}>
                      <RectFlowProvider>{children}</RectFlowProvider>
                    </TranscriptionProvider>
                  </TranslationProvider>
                </ImageProcessingProvider>
              </DocumentProcessorProvider>
            </RagProvider>
          </MemgraphProvider>
        </AIModelProvider>
      </HeaderThemeProvider>
    </ThemeProvider>
  )
}

// Simplified provider for client components that only need basic functionality
export const SimpleProviders: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ThemeProvider>
      <HeaderThemeProvider>{children}</HeaderThemeProvider>
    </ThemeProvider>
  )
}
