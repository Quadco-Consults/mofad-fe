'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { ToastProvider } from '@/components/ui/Toast'
import { RouteTracker } from '@/components/RouteTracker'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
            gcTime: 10 * 60 * 1000, // 10 minutes - cache time (formerly cacheTime)
            retry: (failureCount, error) => {
              // Don't retry on 404s or 401s
              const status = (error as any)?.response?.status
              if (status === 404 || status === 401) return false
              // Retry up to 2 times for other errors
              return failureCount < 2
            },
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
          },
          mutations: {
            retry: 1, // Retry mutations once on failure
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <RouteTracker />
        {children}
      </ToastProvider>
    </QueryClientProvider>
  )
}