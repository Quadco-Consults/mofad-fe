'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function LubebayDetailPage() {
  const params = useParams()
  const router = useRouter()
  const lubebayId = params.id as string

  useEffect(() => {
    // Redirect to current month's dashboard
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1 // JavaScript months are 0-indexed
    router.replace(`/channels/lubebays/${lubebayId}/monthly/${year}/${month}`)
  }, [lubebayId, router])

  return null
}
