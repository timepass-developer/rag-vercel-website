import React from 'react'
import Link from 'next/link'

interface AppPageHeroProps {
  title: string
  description: string
  backgroundImage?: string
}

export const AppPageHero: React.FC<AppPageHeroProps> = ({
  title,
  description,
  backgroundImage,
}) => {
  return (
    <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 py-12 md:py-16">
      {/* Overlay Pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />

      {backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">{title}</h1>
          <p className="text-lg md:text-xl text-indigo-100 max-w-2xl mx-auto">{description}</p>

          <div className="mt-8">
            <Link
              href="/rag-admin"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-indigo-700 bg-white hover:bg-indigo-50 mr-4"
            >
              Create Your Own
            </Link>
            <Link
              href="#learn-more"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-800 bg-opacity-50 hover:bg-opacity-70"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
