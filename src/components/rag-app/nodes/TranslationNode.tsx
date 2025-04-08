import React from 'react'
import { Handle, Position } from 'reactflow'

interface TranslationNodeProps {
  data: {
    label: string
    description?: string
    nodeData?: {
      text?: string
      sourceLanguage?: string
      targetLanguage?: string
    }
    executionResult?: {
      translatedText?: string
      error?: string
    }
    isExecuting?: boolean
    status?: 'idle' | 'processing' | 'success' | 'error'
    updateNodeData?: (data: any) => void
    executeNode?: () => void
  }
}

const LANGUAGES = [
  { code: 'auto', name: 'Auto-detect' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
]

const TranslationNode: React.FC<TranslationNodeProps> = ({ data }) => {
  const hasInputText = !!data.nodeData?.text

  return (
    <div className="relative bg-white dark:bg-gray-800 border rounded-md p-3 shadow-sm min-w-[220px]">
      {/* Input handle */}
      <Handle type="target" position={Position.Top} id="in" className="w-2 h-2 !bg-gray-500" />

      <div className="drag-handle cursor-move mb-2 font-semibold text-sm">
        {data.label || 'Translation'}
      </div>

      {data.description && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">{data.description}</div>
      )}

      <div className="mb-2">
        <label className="block text-xs font-medium mb-1">Source Text</label>
        <textarea
          value={data.nodeData?.text || ''}
          onChange={(e) => data.updateNodeData?.({ text: e.target.value })}
          className="w-full text-xs p-1 border rounded h-16"
          placeholder="Enter text to translate or connect to a previous node"
        />
      </div>

      <div className="mb-2 text-xs grid grid-cols-2 gap-2">
        <div>
          <label className="block font-medium mb-1">From:</label>
          <select
            value={data.nodeData?.sourceLanguage || 'auto'}
            onChange={(e) => data.updateNodeData?.({ sourceLanguage: e.target.value })}
            className="w-full p-1 border rounded"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">To:</label>
          <select
            value={data.nodeData?.targetLanguage || 'en'}
            onChange={(e) => data.updateNodeData?.({ targetLanguage: e.target.value })}
            className="w-full p-1 border rounded"
          >
            {LANGUAGES.filter((l) => l.code !== 'auto').map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-2">
        <button
          onClick={data.executeNode}
          disabled={data.isExecuting || !hasInputText}
          className={`px-3 py-1 rounded-md text-white text-xs ${
            hasInputText ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {data.isExecuting ? 'Translating...' : 'Translate'}
        </button>
      </div>

      {data.executionResult?.error && (
        <div className="mt-2 text-xs text-red-500 p-1 bg-red-50 rounded">
          Error: {data.executionResult.error}
        </div>
      )}

      {data.executionResult?.translatedText && (
        <div className="mt-2 text-xs">
          <div className="font-medium">Translation:</div>
          <div className="p-1 bg-gray-50 dark:bg-gray-700 rounded h-16 overflow-auto">
            {data.executionResult.translatedText}
          </div>
        </div>
      )}

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="out"
        className="w-2 h-2 !bg-indigo-500"
      />
    </div>
  )
}

export default TranslationNode
