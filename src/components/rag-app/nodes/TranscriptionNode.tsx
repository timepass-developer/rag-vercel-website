import React, { useCallback } from 'react'
import { Handle, Position } from 'reactflow'

interface TranscriptionNodeProps {
  data: {
    label: string
    description?: string
    nodeData?: {
      files?: File[]
      speakerDiarization?: boolean
      speakers?: number
    }
    executionResult?: {
      text?: string
      segments?: any[]
      speakers?: any[]
      error?: string
    }
    isExecuting?: boolean
    status?: 'idle' | 'processing' | 'success' | 'error'
    updateNodeData?: (data: any) => void
    executeNode?: () => void
  }
}

const TranscriptionNode: React.FC<TranscriptionNodeProps> = ({ data }) => {
  const hasFiles = data.nodeData?.files && data.nodeData.files.length > 0

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        data.updateNodeData?.({ files: Array.from(e.target.files) })
      }
    },
    [data.updateNodeData],
  )

  return (
    <div className="relative bg-white dark:bg-gray-800 border rounded-md p-3 shadow-sm min-w-[220px]">
      {/* Input handle */}
      <Handle type="target" position={Position.Top} id="in" className="w-2 h-2 !bg-gray-500" />

      <div className="drag-handle cursor-move mb-2 font-semibold text-sm">
        {data.label || 'Audio Transcription'}
      </div>

      {data.description && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">{data.description}</div>
      )}

      <div className="mb-2">
        <label className="block text-xs font-medium mb-1">Upload Audio/Video</label>
        <input
          type="file"
          onChange={handleFileUpload}
          accept="audio/*,video/*"
          className="text-xs w-full"
        />
      </div>

      {hasFiles && (
        <div className="mb-2 text-xs">
          <div className="font-medium">Selected files:</div>
          <ul className="list-disc pl-4">
            {data.nodeData?.files?.map((file, i) => (
              <li key={i} className="truncate">
                {file.name}
              </li>
            ))}
          </ul>

          <div className="mt-2">
            <label className="flex items-center text-xs">
              <input
                type="checkbox"
                checked={data.nodeData?.speakerDiarization || false}
                onChange={(e) => data.updateNodeData?.({ speakerDiarization: e.target.checked })}
                className="mr-2"
              />
              Speaker Diarization
            </label>

            {data.nodeData?.speakerDiarization && (
              <div className="mt-1">
                <label className="block text-xs font-medium">Number of speakers:</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={data.nodeData?.speakers || 2}
                  onChange={(e) => data.updateNodeData?.({ speakers: parseInt(e.target.value) })}
                  className="w-full text-xs p-1 border rounded"
                />
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-2">
        <button
          onClick={data.executeNode}
          disabled={data.isExecuting || !hasFiles}
          className={`px-3 py-1 rounded-md text-white text-xs ${
            hasFiles ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {data.isExecuting ? 'Transcribing...' : 'Transcribe Audio'}
        </button>
      </div>

      {data.executionResult?.error && (
        <div className="mt-2 text-xs text-red-500 p-1 bg-red-50 rounded">
          Error: {data.executionResult.error}
        </div>
      )}

      {data.executionResult?.text && (
        <div className="mt-2 text-xs">
          <div className="font-medium">Transcription:</div>
          <div className="p-1 bg-gray-50 dark:bg-gray-700 rounded h-20 overflow-auto">
            {data.executionResult.text.substring(0, 150)}
            {data.executionResult.text.length > 150 && '...'}
          </div>
        </div>
      )}

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="out"
        className="w-2 h-2 !bg-yellow-500"
      />
    </div>
  )
}

export default TranscriptionNode
