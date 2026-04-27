'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { UserCheck, Plus, Search, Download, Truck, Users, CheckCircle } from 'lucide-react'

interface Assignment {
  id: number
  vehicle_registration: string
  assigned_to: string
  assigned_by: string
  start_date: string
  end_date?: string
  status: 'active' | 'completed' | 'cancelled'
  purpose: string
}

const mockAssignments: Assignment[] = [
  {
    id: 1,
    vehicle_registration: 'ABC-123-XY',
    assigned_to: 'John Doe',
    assigned_by: 'Fleet Manager',
    start_date: '2024-04-01',
    status: 'active',
    purpose: 'Sales Route - Lagos Zone',
  },
  {
    id: 2,
    vehicle_registration: 'DEF-456-ZY',
    assigned_to: 'Jane Smith',
    assigned_by: 'Fleet Manager',
    start_date: '2024-03-15',
    end_date: '2024-04-26',
    status: 'completed',
    purpose: 'Delivery - Abuja Region',
  },
]

export default function VehicleAssignmentsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [assignments] = useState<Assignment[]>(mockAssignments)

  const activeAssignments = assignments.filter(a => a.status === 'active').length

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vehicle Assignments</h1>
            <p className="text-gray-600">Manage vehicle assignments to drivers and staff</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button className="bg-mofad-green hover:bg-mofad-green/90 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Assignment
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Assignments</p>
                  <p className="text-2xl font-bold text-gray-900">{activeAssignments}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Assignments</p>
                  <p className="text-2xl font-bold text-gray-900">{assignments.length}</p>
                </div>
                <UserCheck className="w-8 h-8 text-mofad-green" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Assigned Vehicles</p>
                  <p className="text-2xl font-bold text-gray-900">{activeAssignments}</p>
                </div>
                <Truck className="w-8 h-8 text-mofad-green" />
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
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mofad-green focus:border-mofad-green"
              />
            </div>
          </CardContent>
        </Card>

        {/* Assignments List */}
        <Card>
          <CardHeader>
            <CardTitle>All Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purpose</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned By</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assignments.map((assignment) => (
                    <tr key={assignment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">{assignment.vehicle_registration}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">{assignment.assigned_to}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">{assignment.purpose}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">{assignment.start_date}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">{assignment.end_date || '-'}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          assignment.status === 'active' ? 'bg-green-100 text-green-800' :
                          assignment.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-700">{assignment.assigned_by}</td>
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
