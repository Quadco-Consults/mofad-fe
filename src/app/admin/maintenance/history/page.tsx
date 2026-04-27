'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { BookOpen, Search, Download, Calendar } from 'lucide-react'

interface MaintenanceHistory {
  id: number
  date: string
  vehicle_registration: string
  maintenance_type: string
  description: string
  cost: number
  performed_by: string
  status: 'completed'
}

const mockHistory: MaintenanceHistory[] = [
  {
    id: 1,
    date: '2024-04-20',
    vehicle_registration: 'ABC-123-XY',
    maintenance_type: 'Oil Change',
    description: 'Regular oil and filter replacement',
    cost: 25000,
    performed_by: 'Mechanic Team A',
    status: 'completed',
  },
  {
    id: 2,
    date: '2024-04-15',
    vehicle_registration: 'DEF-456-ZY',
    maintenance_type: 'Brake Service',
    description: 'Brake pad replacement and system check',
    cost: 45000,
    performed_by: 'Mechanic Team B',
    status: 'completed',
  },
]

export default function EquipmentHistoryPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [history] = useState<MaintenanceHistory[]>(mockHistory)

  const totalCost = history.reduce((sum, h) => sum + h.cost, 0)

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Equipment History</h1>
            <p className="text-gray-600">Complete maintenance history and records</p>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export History
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Records</p>
                  <p className="text-2xl font-bold text-gray-900">{history.length}</p>
                </div>
                <BookOpen className="w-8 h-8 text-mofad-green" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-mofad-green">₦{totalCost.toLocaleString()}</p>
                </div>
                <Calendar className="w-8 h-8 text-mofad-green" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Cost</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₦{history.length > 0 ? Math.round(totalCost / history.length).toLocaleString() : 0}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-mofad-green" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search maintenance history..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mofad-green focus:border-mofad-green"
              />
            </div>
          </CardContent>
        </Card>

        {/* History */}
        <Card>
          <CardHeader>
            <CardTitle>Maintenance History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performed By</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {history.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm text-gray-900">{record.date}</td>
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">{record.vehicle_registration}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">{record.maintenance_type}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">{record.description}</td>
                      <td className="px-6 py-3 text-sm font-semibold text-mofad-green">₦{record.cost.toLocaleString()}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">{record.performed_by}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
