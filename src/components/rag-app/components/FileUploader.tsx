'use client'

import React, { useState, useRef } from 'react'
import { Upload, X, File as FileIcon } from 'lucide-react'

interface FileUploaderProps {
  onFileSelected: (files: File[]) => void
  acceptedFileTypes?: string
  multiple?: boolean
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelected,
  acceptedFileTypes = '*',
  multiple = true,
}) => {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  // Handles drop event
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files)
    }
  }

  // Triggered when user selects files using the file dialog
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files)
    }
  }

  // Process the selected files
  const processFiles = (fileList: FileList) => {
    const files = Array.from(fileList)
    setSelectedFiles((prev) => (multiple ? [...prev, ...files] : files))
    onFileSelected(multiple ? [...selectedFiles, ...files] : files)
  }

  // Remove a file from the selection
  const removeFile = (index: number) => {
    setSelectedFiles((prev) => {
      const newFiles = [...prev]
      newFiles.splice(index, 1)
      onFileSelected(newFiles)
      return newFiles
    })
  }

  // Get the file extension for icon display
  const getFileExtension = (filename: string) => {
    return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2)
  }

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="mx-auto h-10 w-10 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          Drag and drop files here or <span className="text-indigo-500 font-medium">browse</span>
        </p>
        <p className="mt-1 text-xs text-gray-500">
          {acceptedFileTypes !== '*'
            ? `Accepted formats: ${acceptedFileTypes.split(',').join(', ')}`
            : 'All file types accepted'}
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple={multiple}
        accept={acceptedFileTypes}
        onChange={handleChange}
      />

      {/* Display selected files */}
      {selectedFiles.length > 0 && (
        <div className="mt-4">
          <ul className="space-y-2">
            {selectedFiles.map((file, index) => (
              <li key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded flex items-center justify-center text-xs uppercase font-bold text-gray-500">
                    <FileIcon size={16} />
                  </div>
                  <div className="ml-2">
                    <p className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB • {getFileExtension(file.name)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(index)
                  }}
                  className="p-1 rounded-full hover:bg-gray-200"
                >
                  <X size={16} className="text-gray-500" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default FileUploader
