import React, { useState, useEffect } from 'react'
import { X, ImagePlus, FileImage } from 'lucide-react'

interface AppFormData {
  title: string
  description: string
  slug: string
  status: 'draft' | 'published'
  featured?: boolean
  image?: string | File
  tags?: string[]
  author?: string
  apiKeys?: Record<string, string>
  uiSettings?: {
    theme?: 'light' | 'dark' | 'system'
    showWorkflow?: boolean
  }
}

interface SaveAppModalProps {
  isOpen: boolean
  initialData: AppFormData
  onClose: () => void
  onSave: (data: AppFormData) => void
  isSaving: boolean
}

const SaveAppModal: React.FC<SaveAppModalProps> = ({
  isOpen,
  initialData,
  onClose,
  onSave,
  isSaving,
}) => {
  const [formData, setFormData] = useState<AppFormData>(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState('basic')
  const [tagInput, setTagInput] = useState('')
  const [imageMode, setImageMode] = useState<'upload' | 'existing'>('upload')

  // Reset form when initialData changes
  useEffect(() => {
    if (isOpen) {
      setFormData(initialData)
      setErrors({})
    }
  }, [initialData, isOpen])

  if (!isOpen) return null

  // Form field change handler
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  // Generate slug from title
  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Remove consecutive hyphens
      .trim()

    setFormData((prev) => ({
      ...prev,
      slug,
    }))
  }

  // Handle nested uiSettings changes
  const handleUiSettingChange = (setting: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      uiSettings: {
        ...(prev.uiSettings || {}),
        [setting]: value,
      },
    }))
  }

  // Handle API key changes
  const handleApiKeyChange = (provider: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      apiKeys: {
        ...prev.apiKeys,
        [provider]: value,
      },
    }))
  }

  // Handle tag input
  const handleAddTag = () => {
    if (tagInput.trim() !== '') {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()],
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: (prev.tags || []).filter((t) => t !== tag),
    }))
  }

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({
        ...prev,
        image: e.target.files![0],
      }))
    }
  }

  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required'
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      onSave(formData)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Save RAG Application</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="flex border-b mb-4 overflow-x-auto">
            <button
              className={`px-4 py-2 whitespace-nowrap ${activeTab === 'basic' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('basic')}
            >
              Basic Info
            </button>
            <button
              className={`px-4 py-2 whitespace-nowrap ${activeTab === 'image' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('image')}
            >
              Image & Tags
            </button>
            <button
              className={`px-4 py-2 whitespace-nowrap ${activeTab === 'settings' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('settings')}
            >
              Settings
            </button>
            <button
              className={`px-4 py-2 whitespace-nowrap ${activeTab === 'apikeys' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('apikeys')}
            >
              API Keys
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="PhotoBooth"
                  />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                  <p className="text-xs text-gray-500 mt-1">The name of your RAG application</p>
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="This app translate image data into texts and stores in Knowledgebase for querying"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Briefly describe what your application does
                  </p>
                </div>

                <div>
                  <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                    URL Slug *
                  </label>
                  <div className="flex items-center">
                    <span className="text-gray-500 bg-gray-100 px-3 py-2 border border-r-0 border-gray-300 rounded-l-md">
                      /rag-gallery/
                    </span>
                    <input
                      type="text"
                      id="slug"
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      className={`flex-1 px-3 py-2 border rounded-r-md ${errors.slug ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="photo-booth"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug}</p>}
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mt-1">
                        The URL-friendly name for your application
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={generateSlug}
                      className="text-xs text-indigo-600 hover:text-indigo-800 mt-1"
                    >
                      Generate from title
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Only published apps will appear in the gallery
                  </p>
                </div>

                <div className="flex items-center mt-4">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured || false}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, featured: e.target.checked }))
                    }
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                    Feature this app in the gallery
                  </label>
                </div>

                <div>
                  <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
                    Author
                  </label>
                  <input
                    type="text"
                    id="author"
                    name="author"
                    value={formData.author || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, author: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Enter a name"
                  />
                </div>
              </div>
            )}

            {/* Image & Tags Tab */}
            {activeTab === 'image' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                  <div className="space-y-2">
                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={() => setImageMode('upload')}
                        className={`px-3 py-2 text-sm ${imageMode === 'upload' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'} rounded-md`}
                      >
                        Create New
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageMode('existing')}
                        className={`px-3 py-2 text-sm ${imageMode === 'existing' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'} rounded-md`}
                      >
                        Choose from existing
                      </button>
                    </div>

                    {imageMode === 'upload' ? (
                      <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                          <ImagePlus className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500"
                            >
                              <span>Upload a file</span>
                              <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                className="sr-only"
                                accept="image/*"
                                onChange={handleImageUpload}
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 grid grid-cols-3 gap-3">
                        <button
                          type="button"
                          className="relative flex items-center justify-center border border-gray-300 rounded-md p-2 hover:bg-gray-50"
                        >
                          <FileImage className="h-10 w-10 text-gray-400" />
                        </button>
                        {/* Add more image options as needed */}
                      </div>
                    )}
                    <p className="text-xs text-gray-500">Cover image for the application</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <div className="flex">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      className="flex-1 px-3 py-2 border border-r-0 border-gray-300 rounded-l-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Add a tag"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddTag()
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-3 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700"
                    >
                      Add
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(formData.tags || []).map((tag) => (
                      <span
                        key={tag}
                        className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full flex items-center"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 text-indigo-600 hover:text-indigo-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Tags to categorize this application</p>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-1">
                    Theme
                  </label>
                  <select
                    id="theme"
                    value={formData.uiSettings?.theme || 'system'}
                    onChange={(e) => handleUiSettingChange('theme', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="showWorkflow"
                    checked={formData.uiSettings?.showWorkflow || false}
                    onChange={(e) => handleUiSettingChange('showWorkflow', e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="showWorkflow" className="ml-2 block text-sm text-gray-700">
                    Show workflow visualization to users
                  </label>
                </div>
              </div>
            )}

            {/* API Keys Tab */}
            {activeTab === 'apikeys' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500 mb-4">
                  API keys for the application (encrypted)
                </p>

                <div>
                  <label htmlFor="openai" className="block text-sm font-medium text-gray-700 mb-1">
                    OpenAI
                  </label>
                  <input
                    type="password"
                    id="openai"
                    value={formData.apiKeys?.openai || ''}
                    onChange={(e) => handleApiKeyChange('openai', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="sk-..."
                  />
                  <p className="text-xs text-gray-500 mt-1">OpenAI API Key</p>
                </div>

                <div>
                  <label htmlFor="mistral" className="block text-sm font-medium text-gray-700 mb-1">
                    Mistral
                  </label>
                  <input
                    type="password"
                    id="mistral"
                    value={formData.apiKeys?.mistral || ''}
                    onChange={(e) => handleApiKeyChange('mistral', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="..."
                  />
                  <p className="text-xs text-gray-500 mt-1">Mistral API Key</p>
                </div>

                <div>
                  <label
                    htmlFor="anthropic"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Anthropic
                  </label>
                  <input
                    type="password"
                    id="anthropic"
                    value={formData.apiKeys?.anthropic || ''}
                    onChange={(e) => handleApiKeyChange('anthropic', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="..."
                  />
                  <p className="text-xs text-gray-500 mt-1">Anthropic API Key</p>
                </div>

                <div>
                  <label
                    htmlFor="assemblyai"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Assembly AI
                  </label>
                  <input
                    type="password"
                    id="assemblyai"
                    value={formData.apiKeys?.assemblyai || ''}
                    onChange={(e) => handleApiKeyChange('assemblyai', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="..."
                  />
                  <p className="text-xs text-gray-500 mt-1">AssemblyAI API Key</p>
                </div>

                <div>
                  <label
                    htmlFor="huggingface"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Hugging Face
                  </label>
                  <input
                    type="password"
                    id="huggingface"
                    value={formData.apiKeys?.huggingface || ''}
                    onChange={(e) => handleApiKeyChange('huggingface', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="hf_..."
                  />
                  <p className="text-xs text-gray-500 mt-1">Hugging Face API Key</p>
                </div>

                <div>
                  <label
                    htmlFor="pinecone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Pinecone
                  </label>
                  <input
                    type="password"
                    id="pinecone"
                    value={formData.apiKeys?.pinecone || ''}
                    onChange={(e) => handleApiKeyChange('pinecone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="xxxxx-xxxx-xxxx"
                  />
                  <p className="text-xs text-gray-500 mt-1">Pinecone API Key</p>
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="p-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 mr-2"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SaveAppModal
