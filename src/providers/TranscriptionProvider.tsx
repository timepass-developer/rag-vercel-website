"use client"
import React, { createContext, useContext, useState } from 'react'
import axios from 'axios'

interface TranscriptionContextType {
  transcribeAudio: (audioFile: File) => Promise<string>
  transcribeVideo: (videoFile: File) => Promise<string>
  isTranscribing: boolean
  error: string | null
}

const TranscriptionContext = createContext<TranscriptionContextType>({
  transcribeAudio: async () => '',
  transcribeVideo: async () => '',
  isTranscribing: false,
  error: null,
})

export const useTranscription = () => useContext(TranscriptionContext)

interface TranscriptionProviderProps {
  children: React.ReactNode
  assemblyAiApiKey?: string
}

export const TranscriptionProvider: React.FC<TranscriptionProviderProps> = ({
  children,
  assemblyAiApiKey,
}) => {
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Helper function to upload media to AssemblyAI
  const uploadMediaToAssemblyAI = async (file: File): Promise<string> => {
    if (!assemblyAiApiKey) {
      throw new Error('AssemblyAI API key not provided')
    }

    try {
      // Get upload URL from AssemblyAI
      const uploadResponse = await axios.post(
        'https://api.assemblyai.com/v2/upload',
        {},
        {
          headers: {
            Authorization: assemblyAiApiKey,
          },
        },
      )

      const uploadUrl = uploadResponse.data.upload_url

      // Upload the file to the provided URL
      const fileData = await file.arrayBuffer()
      await axios.put(uploadUrl, fileData, {
        headers: {
          'Content-Type': 'application/octet-stream',
        },
      })

      return uploadUrl
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      throw new Error(`Failed to upload media: ${errorMessage}`)
    }
  }

  // Helper function to start transcription and poll for results
  const startTranscriptionAndPoll = async (audioUrl: string): Promise<string> => {
    if (!assemblyAiApiKey) {
      throw new Error('AssemblyAI API key not provided')
    }

    try {
      // Start the transcription
      const transcriptionResponse = await axios.post(
        'https://api.assemblyai.com/v2/transcript',
        {
          audio_url: audioUrl,
          language_detection: true,
        },
        {
          headers: {
            Authorization: assemblyAiApiKey,
            'Content-Type': 'application/json',
          },
        },
      )

      const transcriptionId = transcriptionResponse.data.id

      // Poll for transcription completion
      let transcriptionComplete = false
      let transcript = ''

      while (!transcriptionComplete) {
        const pollingResponse = await axios.get(
          `https://api.assemblyai.com/v2/transcript/${transcriptionId}`,
          {
            headers: {
              Authorization: assemblyAiApiKey,
            },
          },
        )

        const status = pollingResponse.data.status

        if (status === 'completed') {
          transcriptionComplete = true
          transcript = pollingResponse.data.text
        } else if (status === 'error') {
          throw new Error(`Transcription error: ${pollingResponse.data.error}`)
        } else {
          // Wait before polling again
          await new Promise((resolve) => setTimeout(resolve, 3000))
        }
      }

      return transcript
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      throw new Error(`Transcription failed: ${errorMessage}`)
    }
  }

  // Function to transcribe audio files
  const transcribeAudio = async (audioFile: File): Promise<string> => {
    setIsTranscribing(true)
    setError(null)

    try {
      const audioUrl = await uploadMediaToAssemblyAI(audioFile)
      const transcript = await startTranscriptionAndPoll(audioUrl)
      return transcript
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      setError(errorMessage)
      console.error('Audio transcription error:', err)
      return `Error: ${errorMessage}`
    } finally {
      setIsTranscribing(false)
    }
  }

  // Function to transcribe video files
  const transcribeVideo = async (videoFile: File): Promise<string> => {
    // The process is the same as audio transcription with AssemblyAI
    return transcribeAudio(videoFile)
  }

  return (
    <TranscriptionContext.Provider
      value={{
        transcribeAudio,
        transcribeVideo,
        isTranscribing,
        error,
      }}
    >
      {children}
    </TranscriptionContext.Provider>
  )
}
