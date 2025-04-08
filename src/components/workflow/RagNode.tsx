import React, { useState } from 'react'
import { Handle, Position } from 'reactflow'
import { RagNodeData, useRectFlow } from '@/providers/RectFlowProvider'
import { AlertCircle, Check, ChevronDown, ChevronUp, Loader2, X } from 'lucide-react'

interface RagNodeProps {
  id: string
  data: RagNodeData
  selected?: boolean
}

const NodeStatusIndicator = ({ status }: { status: string }) => {
  switch (status) {
    case 'processing':
      return <Loader2 size={16} className="animate-spin text-blue-500" />
    case 'success':
      return <Check size={16} className="text-green-500" />
    case 'error':
      return <X size={16} className="text-red-500" />
    default:
      return null
  }
}

const RagNode: React.FC<RagNodeProps> = ({ id, data, selected }) => {
  const { executeNode, deleteNode } = useRectFlow()
  const [expanded, setExpanded] = useState(false)

  const handleExecute = () => {
    executeNode(id)
  }

  const handleDelete = () => {
    deleteNode(id)
  }

  // Render different content based on node type
  const renderNodeContent = () => {
    switch (data.type) {
      case 'imageUpload':
        return (
          <div className="p-3">
            <input
              type="file"
              className="w-full text-xs"
              accept="image/*"
              onChange={(e) => {
                // Handle file upload logic
                console.log(e.target.files?.[0])
              }}
            />
          </div>
        )

      case 'audioUpload':
      case 'videoUpload':
        return (
          <div className="p-3">
            <input
              type="file"
              className="w-full text-xs"
              accept={data.type === 'audioUpload' ? 'audio/*' : 'video/*'}
              onChange={(e) => {
                // Handle media file upload logic
                console.log(e.target.files?.[0])
              }}
            />
          </div>
        )

      case 'documentUpload':
        return (
          <div className="p-3">
            <input
              type="file"
              className="w-full text-xs"
              accept=".pdf,.doc,.docx,.txt,.md,.csv"
              onChange={(e) => {
                // Handle document upload logic
                console.log(e.target.files?.[0])
              }}
            />
            <div className="mt-2 text-xs text-gray-500">Supported: PDF, DOCX, TXT, MD, CSV</div>
          </div>
        )

      case 'audioTranscription':
      case 'videoTranscription':
        return (
          <div className="p-3 space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`diarization-${id}`}
                checked={
                  typeof data.inputs.speakerDiarization === 'boolean'
                    ? data.inputs.speakerDiarization
                    : false
                }
                onChange={() => {
                  // Toggle speaker diarization
                }}
              />
              <label htmlFor={`diarization-${id}`} className="text-xs">
                Speaker Diarization
              </label>
            </div>

            {typeof data.inputs.speakerDiarization === 'boolean' &&
              data.inputs.speakerDiarization && (
                <div className="flex items-center">
                  <label className="text-xs mr-2">Speakers:</label>
                  <input
                    type="number"
                    className="w-12 p-1 text-xs border rounded"
                    min="2"
                    max="10"
                    value={typeof data.inputs.speakers === 'number' ? data.inputs.speakers : 2}
                    onChange={() => {
                      // Update speaker count
                    }}
                  />
                </div>
              )}

            {typeof data.status === 'string' && data.status === 'processing' && (
              <div className="text-xs text-blue-600">Transcribing... Please wait</div>
            )}

            {typeof data.status === 'string' &&
              data.status === 'success' &&
              typeof data.outputs === 'object' &&
              data.outputs !== null &&
              typeof data.outputs.text === 'string' && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-xs max-h-20 overflow-y-auto">
                  {data.outputs.text.substring(0, 100)}
                  {data.outputs.text.length > 100 ? '...' : ''}
                </div>
              )}
          </div>
        )

      case 'mistralTranslation':
        return (
          <div className="p-3 space-y-2">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center">
                <label className="text-xs w-20">Source Lang:</label>
                <select
                  className="w-full p-1 text-xs border rounded"
                  value={
                    typeof data.inputs.sourceLanguage === 'string'
                      ? data.inputs.sourceLanguage
                      : 'auto'
                  }
                  onChange={() => {
                    // Handle language selection
                  }}
                >
                  <option value="auto">Auto-detect</option>
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Chinese">Chinese</option>
                  <option value="Japanese">Japanese</option>
                </select>
              </div>

              <div className="flex items-center">
                <label className="text-xs w-20">Target Lang:</label>
                <select
                  className="w-full p-1 text-xs border rounded"
                  value={
                    typeof data.inputs.targetLanguage === 'string'
                      ? data.inputs.targetLanguage
                      : 'English'
                  }
                  onChange={() => {
                    // Handle language selection
                  }}
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Chinese">Chinese</option>
                  <option value="Japanese">Japanese</option>
                </select>
              </div>
            </div>

            {typeof data.status === 'string' && data.status === 'processing' && (
              <div className="text-xs text-blue-600">Translating with Mistral... Please wait</div>
            )}
          </div>
        )

      case 'documentProcessing':
        return (
          <div className="p-3 space-y-2">
            {typeof data.status === 'string' && data.status === 'processing' && (
              <div className="text-xs text-blue-600">Processing document...</div>
            )}
            {typeof data.status === 'string' && data.status === 'success' && (
              <div className="text-xs text-green-600">
                Document processed:{' '}
                {(() => {
                  // Use an IIFE to calculate and return the filename as a string
                  if (
                    typeof data.outputs === 'object' &&
                    data.outputs !== null &&
                    typeof data.outputs.metadata === 'object' &&
                    data.outputs.metadata !== null &&
                    'filename' in data.outputs.metadata
                  ) {
                    return String(data.outputs.metadata.filename)
                  }
                  return 'Unknown'
                })()}
              </div>
            )}
          </div>
        )

      case 'documentChunking':
        return (
          <div className="p-3 space-y-2">
            <div className="flex items-center">
              <label className="text-xs w-20">Chunk size:</label>
              <input
                type="number"
                className="w-20 p-1 text-xs border rounded"
                value={typeof data.inputs.chunkSize === 'number' ? data.inputs.chunkSize : 0}
                onChange={() => {
                  // Update chunk size
                }}
              />
            </div>
            <div className="flex items-center">
              <label className="text-xs w-20">Overlap:</label>
              <input
                type="number"
                className="w-20 p-1 text-xs border rounded"
                value={typeof data.inputs.chunkOverlap === 'number' ? data.inputs.chunkOverlap : 0}
                onChange={() => {
                  // Update chunk overlap
                }}
              />
            </div>
          </div>
        )

      case 'vectorization':
        return (
          <div className="p-3 space-y-2">
            {data.status === 'processing' && (
              <div className="text-xs text-blue-600">Generating embeddings...</div>
            )}
            {data.status === 'success' &&
              typeof data.outputs === 'object' &&
              data.outputs !== null && (
                <div className="text-xs text-green-600">
                  {`${Array.isArray(data.outputs.vectorizedChunks) ? data.outputs.vectorizedChunks.length : 0} chunks vectorized`}
                </div>
              )}
          </div>
        )

      case 'questionAnswering':
        return (
          <div className="p-3">
            <input
              type="text"
              placeholder="Enter your question"
              className="w-full p-2 text-xs border rounded"
              value={typeof data.inputs.question === 'string' ? data.inputs.question : ''}
              onChange={() => {
                // Update question
              }}
            />
            {data.status === 'success' &&
              data.outputs &&
              typeof data.outputs.answer !== 'undefined' && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-xs max-h-32 overflow-y-auto">
                  {String(data.outputs.answer)}
                </div>
              )}
          </div>
        )

      default:
        return null
    }
  }

  // Determine if this node type has inputs
  const hasInputs = !['imageUpload', 'audioUpload', 'videoUpload', 'documentUpload'].includes(
    data.type,
  )

  // Determine if this node type has outputs
  const hasOutputs = true

  return (
    <div
      className={`rounded-md border shadow-sm overflow-hidden ${
        selected ? 'border-blue-500 shadow-md' : 'border-gray-200'
      }`}
      style={{ minWidth: 250, background: 'white' }}
    >
      {/* Input handle */}
      {hasInputs && (
        <Handle
          type="target"
          position={Position.Left}
          id="in"
          style={{
            background: '#4F46E5',
            width: 8,
            height: 8,
            left: -4,
          }}
        />
      )}

      {/* Node header */}
      <div className="drag-handle flex items-center justify-between p-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center">
          <div className="font-medium text-sm text-gray-800">{data.label}</div>
          <div className="ml-2">
            <NodeStatusIndicator status={data.status} />
          </div>
        </div>
        <div className="flex items-center space-x-1">
          {data.error && (
            <div title={data.error} className="text-xs text-red-500">
              <AlertCircle size={14} />
            </div>
          )}
          <button className="p-1 hover:bg-gray-200 rounded" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Node details when expanded */}
      {expanded && (
        <div className="text-xs p-2 bg-gray-50 border-b border-gray-200">
          <div className="text-gray-600">{data.description}</div>
        </div>
      )}

      {/* Node content */}
      <div className="bg-white">
        {renderNodeContent()}

        {/* Node footer */}
        <div className="flex justify-between p-2 bg-gray-50 border-t border-gray-200">
          <button
            className="px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
            onClick={handleExecute}
            disabled={data.status === 'processing'}
          >
            {data.status === 'processing' ? 'Running...' : 'Run'}
          </button>
          <button
            className="px-2 py-1 text-xs text-gray-600 hover:text-red-600"
            onClick={handleDelete}
          >
            Remove
          </button>
        </div>
      </div>

      {/* Output handle */}
      {hasOutputs && (
        <Handle
          type="source"
          position={Position.Right}
          id="out"
          style={{
            background: '#4F46E5',
            width: 8,
            height: 8,
            right: -4,
          }}
        />
      )}
    </div>
  )
}

export default RagNode
