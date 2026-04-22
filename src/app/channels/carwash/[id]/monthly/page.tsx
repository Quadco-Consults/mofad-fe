'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  Calendar,
  ChevronRight,
  TrendingUp,
  DollarSign,
} from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import apiClient from '@/lib/apiClient'
import { formatCurrency } from '@/lib/utils'

interface Carwash {
  id: number
  name: string
  code: string
  address?: string
  state_name?: string
  manager_name?: string
  phone?: string
}

interface MonthlyData {
  year: number
  month: number
  totalRevenue: number
  totalSales: number
  totalServices: number
  profit: number
}

export default function CarwashMonthlyPage() {
  const params = useParams()
  const router = useRouter()
  const carwashId = params.id as string

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  // Fetch carwash details
  const { data: carwashData } = useQuery({
    queryKey: ['carwash', carwashId],
    queryFn: () => apiClient.get(`/carwashs/${carwashId}/`),
  })

  const carwash = carwashData as Carwash | undefined

  // Generate last 12 months
  const generateLast12Months = () => {
    const months: Array<{ year: number; month: number; label: string }> = []
    const now = new Date()

    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        label: `${monthNames[date.getMonth()]} ${date.getFullYear()}`
      })
    }

    return months
  }

  const months = generateLast12Months()

  const handleMonthClick = (year: number, month: number) => {
    router.push(`/channels/carwash/${carwashId}/monthly/${year}/${month}`)
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header with Breadcrumbs */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <Link href="/channels/carwash" className="hover:text-gray-900">
                Carwashs
              </Link>
              <span>/</span>
              <Link
                href={`/channels/carwash/${carwashId}`}
                className="hover:text-gray-900"
              >
                {carwash?.name || 'Loading...'}
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Monthly</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {carwash?.name || 'Carwash'} - Monthly Performance
            </h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Card>
            <CardHeader>
              <CardTitle>Select a Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {months.map(({ year, month, label }) => (
                  <button
                    key={`${year}-${month}`}
                    onClick={() => handleMonthClick(year, month)}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-blue-100 transition-colors">
                        <Calendar className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">{label}</p>
                        <p className="text-sm text-gray-500">View details</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats Summary (Optional) */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average Monthly Revenue</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {formatCurrency(0)}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Best Month</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">
                      N/A
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Months</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {months.length}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
