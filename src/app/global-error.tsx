'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertOctagon, RefreshCw, Home } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global application error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
            <div className="flex flex-col items-center text-center">
              {/* Critical Error Icon */}
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <AlertOctagon className="w-10 h-10 text-red-600" />
              </div>

              {/* Error Title */}
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Critical Error
              </h1>

              {/* Error Message */}
              <p className="text-gray-600 mb-6">
                A critical error has occurred that prevented the application from loading properly.
                Please try refreshing the page or contact support if the issue persists.
              </p>

              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === 'development' && error.message && (
                <div className="w-full bg-red-50 border border-red-200 rounded-md p-4 mb-6 text-left">
                  <p className="text-sm font-medium text-red-800 mb-1">Error Details:</p>
                  <p className="text-sm text-red-700 font-mono break-all">{error.message}</p>
                  {error.digest && (
                    <p className="text-xs text-red-500 mt-2">Digest: {error.digest}</p>
                  )}
                  {error.stack && (
                    <details className="mt-2">
                      <summary className="text-xs text-red-600 cursor-pointer">Stack Trace</summary>
                      <pre className="text-xs text-red-600 mt-2 overflow-auto max-h-32 p-2 bg-red-100 rounded">
                        {error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <button
                  onClick={reset}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reload Application
                </button>
                <Link
                  href="/"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
                >
                  <Home className="w-4 h-4" />
                  Return Home
                </Link>
              </div>

              {/* Support Info */}
              <p className="mt-6 text-xs text-gray-500">
                If this problem continues, please contact technical support with the error details above.
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
