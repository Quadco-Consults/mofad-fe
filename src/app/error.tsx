'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="flex flex-col items-center text-center">
          {/* Error Icon */}
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>

          {/* Error Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Something went wrong
          </h1>

          {/* Error Message */}
          <p className="text-gray-600 mb-6">
            We encountered an unexpected error. Please try again or contact support if the problem persists.
          </p>

          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV === 'development' && error.message && (
            <div className="w-full bg-red-50 border border-red-200 rounded-md p-4 mb-6 text-left">
              <p className="text-sm font-medium text-red-800 mb-1">Error Details:</p>
              <p className="text-sm text-red-700 font-mono break-all">{error.message}</p>
              {error.digest && (
                <p className="text-xs text-red-500 mt-2">Digest: {error.digest}</p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              onClick={reset}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            <Link
              href="/"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Link>
          </div>

          {/* Back Link */}
          <button
            onClick={() => window.history.back()}
            className="mt-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go back to previous page
          </button>
        </div>
      </div>
    </div>
  )
}
