'use client'

import React, { useState, useRef } from 'react'

interface FileUploaderProps {
  onFileSelected: (files: File[]) => void
  acceptedFileTypes?: string
  maxFiles?: number
  maxSizeInMB?: number
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelected,
  acceptedFileTypes = '*',
  maxFiles = 5,
  maxSizeInMB = 10,
}) => {
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const maxSizeInBytes = maxSizeInMB * 1024 * 1024

  // Handle drag events
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  // Handle file validation
  const validateFiles = (files: File[]): { valid: File[]; errors: string[] } => {
    const validFiles: File[] = []
    const errors: string[] = []
    const acceptedTypes = acceptedFileTypes.split(',').map((type) => type.trim())

    // Check if we're already at the max number of files
    if (uploadedFiles.length + files.length > maxFiles) {
      errors.push(`You can upload a maximum of ${maxFiles} files.`)
      return { valid: validFiles, errors }
    }

    // Validate each file
    for (const file of files) {
      // Check file type
      if (
        acceptedFileTypes !== '*' &&
        !acceptedTypes.some(
          (type) =>
            file.name.toLowerCase().endsWith(type.replace('*', '')) ||
            file.type.includes(type.replace('.', '').replace('*', '')),
        )
      ) {
        errors.push(`File "${file.name}" is not a supported file type.`)
        continue
      }

      // Check file size
      if (file.size > maxSizeInBytes) {
        errors.push(`File "${file.name}" exceeds the maximum file size of ${maxSizeInMB}MB.`)
        continue
      }

      validFiles.push(file)
    }

    return { valid: validFiles, errors }
  }

  // Handle dropped files
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const fileArray = Array.from(e.dataTransfer.files)
      processFiles(fileArray)
    }
  }

  // Handle file input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()

    if (e.target.files && e.target.files.length > 0) {
      const fileArray = Array.from(e.target.files)
      processFiles(fileArray)
    }
  }

  // Process the selected files
  const processFiles = (fileArray: File[]) => {
    setError(null)

    const { valid, errors } = validateFiles(fileArray)

    if (errors.length > 0) {
      setError(errors.join(' '))
      return
    }

    if (valid.length > 0) {
      const newFiles = [...uploadedFiles, ...valid]
      setUploadedFiles(newFiles)
      onFileSelected(newFiles)
    }
  }

  // Remove a file from the list
  const removeFile = (index: number) => {
    const newFiles = [...uploadedFiles]
    newFiles.splice(index, 1)
    setUploadedFiles(newFiles)
    onFileSelected(newFiles)
  }

  return (
    <div className="file-uploader">
      {/* File upload area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 ${
          dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          onChange={handleChange}
          type="file"
          id="file-upload"
          multiple
          accept={acceptedFileTypes}
          className="hidden"
        />

        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 14v20c0 4.418 7.163 8 16 8 1.381 0 2.721-.087 4-.252M8 14c0 4.418 7.163 8 16 8s16-3.582 16-8M8 14c0-4.418 7.163-8 16-8s16 3.582 16 8m0 0v14m0-4c0 4.418-7.163 8-16 8S8 28.418 8 24m32 10v6m0 0v6m0-6h6m-6 0h-6"
            />
          </svg>
          <p className="mt-1 text-sm text-gray-600">Click to upload or drag and drop</p>
          <p className="mt-1 text-xs text-gray-500">
            {acceptedFileTypes !== '*'
              ? `Accepted file types: ${acceptedFileTypes}`
              : 'All file types accepted'}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Max {maxFiles} files, up to {maxSizeInMB}MB each
          </p>
        </div>
      </div>

      {/* Error message */}
      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}

      {/* File list */}
      {uploadedFiles.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700">Uploaded files</h4>
          <ul className="mt-2 divide-y divide-gray-200 border rounded-md">
            {uploadedFiles.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="flex items-center justify-between py-2 px-4 text-sm"
              >
                <div className="flex items-center">
                  <span className="truncate">{file.name}</span>
                  <span className="ml-2 text-xs text-gray-500">
                    ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  type="button"
                  className="text-red-600 hover:text-red-800"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(index)
                  }}
                >
                  Remove
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
