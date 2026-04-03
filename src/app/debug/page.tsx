'use client'

export default function DebugPage() {
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Debug Information</h1>
      <p><strong>NEXT_PUBLIC_API_BASE_URL:</strong> {baseURL}</p>
      <p><strong>Window location:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
      <p><strong>Build time:</strong> {new Date().toISOString()}</p>
    </div>
  )
}
