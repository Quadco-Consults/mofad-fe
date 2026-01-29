import Link from 'next/link'
import { FileQuestion, Home, ArrowLeft, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="flex flex-col items-center text-center">
          {/* 404 Icon */}
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
            <FileQuestion className="w-8 h-8 text-yellow-600" />
          </div>

          {/* 404 Number */}
          <p className="text-6xl font-bold text-gray-200 mb-2">404</p>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Page Not Found
          </h1>

          {/* Description */}
          <p className="text-gray-600 mb-6">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved, deleted, or never existed.
          </p>

          {/* Suggestions */}
          <div className="w-full bg-gray-50 rounded-md p-4 mb-6 text-left">
            <p className="text-sm font-medium text-gray-700 mb-2">You can try:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                Checking the URL for typos
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                Going back to the previous page
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                Starting from the dashboard
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Link
              href="/dashboard"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              <Home className="w-4 h-4" />
              Go to Dashboard
            </Link>
            <Link
              href="/"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Search className="w-4 h-4" />
              Go to Home
            </Link>
          </div>

          {/* Back Link */}
          <Link
            href="javascript:history.back()"
            className="mt-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go back to previous page
          </Link>
        </div>
      </div>
    </div>
  )
}
