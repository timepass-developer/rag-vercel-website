import React from 'react'
import Link from 'next/link'

export const RagBuilderCTA: React.FC = () => {
  return (
    <section className="mb-16">
      <div className="bg-gradient-to-r from-purple-700 to-indigo-600 rounded-2xl overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row">
          {/* Left side - Text content */}
          <div className="p-8 md:p-12 flex-1">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Build Your Own RAG Application
            </h2>
            <p className="text-purple-100 text-lg mb-6">
              Create powerful AI applications that connect to your data sources without writing
              code. Our visual workflow builder makes it easy to design, test, and deploy RAG
              applications in minutes.
            </p>
            <ul className="mb-8 space-y-2 text-purple-100">
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-indigo-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                Upload your documents, images, or audio
              </li>
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-indigo-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                Connect to various AI models
              </li>
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-indigo-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                Customize the RAG workflow to your needs
              </li>
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-indigo-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                Share and publish your application
              </li>
            </ul>
            <Link
              href="/rag-admin"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50"
            >
              Start Building
            </Link>
          </div>

          {/* Right side - Visual element */}
          <div className="bg-indigo-800 flex-1 p-6 hidden md:flex items-center justify-center">
            <div className="w-full max-w-sm relative">
              {/* Simple workflow diagram illustration */}
              <div className="bg-white/10 rounded-lg p-4 mb-3 relative">
                <div className="h-6 w-28 bg-white/20 rounded mb-2"></div>
                <div className="h-16 w-full bg-white/5 rounded"></div>
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-4 h-8 bg-indigo-800 flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>
              </div>

              <div className="bg-white/10 rounded-lg p-4 mb-3 relative">
                <div className="h-6 w-36 bg-white/20 rounded mb-2"></div>
                <div className="h-20 w-full bg-white/5 rounded"></div>
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-4 h-8 bg-indigo-800 flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>
              </div>

              <div className="bg-white/10 rounded-lg p-4">
                <div className="h-6 w-24 bg-white/20 rounded mb-2"></div>
                <div className="h-16 w-full bg-white/5 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
