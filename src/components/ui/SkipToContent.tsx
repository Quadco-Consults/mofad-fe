/**
 * Skip to Content Link
 *
 * Provides a keyboard-accessible link for screen reader and keyboard users
 * to skip repetitive navigation and jump directly to the main content.
 *
 * WCAG 2.1 Success Criterion 2.4.1 (Level A)
 */

'use client'

export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-mofad-green focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-mofad-green focus:ring-offset-2"
    >
      Skip to main content
    </a>
  )
}
