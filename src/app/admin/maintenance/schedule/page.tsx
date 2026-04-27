'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Calendar, Plus, Search, Download, Clock, CheckCircle, AlertTriangle } from 'lucide-react'

interface MaintenanceSchedule {
  id: number
  vehicle_registration: string
  maintenance_type: string
  scheduled_date: string
  status: 'upcoming' | 'overdue' | 'completed'
  last_service: string
  next_service: string
}

const mockSchedules: MaintenanceSchedule[] = [
  {
    id: 1,
    vehicle_registration: 'ABC-123-XY',
    maintenance_type: 'Oil Change',
    scheduled_date: '2024-05-15',
    status: 'upcoming',
    last_service: '2024-02-15',
    next_service: '2024-05-15',
  },
  {
    id: 2,
    vehicle_registration: 'DEF-456-ZY',
    maintenance_type: 'Tire Rotation',
    scheduled_date: '2024-04-25',
    status: 'overdue',
    last_service: '2024-01-25',
    next_service: '2024-04-25',
  },
]

export default function MaintenanceSchedulePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [schedules] = useState<MaintenanceSchedule[]>(mockSchedules)

  const upcomingCount = schedules.filter(s => s.status === 'upcoming').length
  const overdueCount = schedules.filter(s => s.status === 'overdue').length

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Maintenance Schedule</h1>
            <p className="text-gray-600">Planned maintenance activities and schedules</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button className="bg-mofad-green hover:bg-mofad-green/90 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Schedule Maintenance
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Upcoming</p>
                  <p className="text-2xl font-bold text-gray-900">{upcomingCount}</p>
                </div>
                <Clock className="w-8 h-8 text-mofad-green" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">{overdueCount}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Scheduled</p>
                  <p className="text-2xl font-bold text-gray-900">{schedules.length}</p>
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
                placeholder="Search schedules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mofad-green focus:border-mofad-green"
              />
            </div>
          </CardContent>
        </Card>

        {/* Schedule List */}
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Maintenance Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scheduled Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Service</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Service</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {schedules.map((schedule) => (
                    <tr key={schedule.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">{schedule.vehicle_registration}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">{schedule.maintenance_type}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">{schedule.scheduled_date}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">{schedule.last_service}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">{schedule.next_service}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          schedule.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                          schedule.status === 'overdue' ? 'bg-red-100 text-red-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {schedule.status === 'upcoming' && <Clock className="w-3 h-3" />}
                          {schedule.status === 'overdue' && <AlertTriangle className="w-3 h-3" />}
                          {schedule.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                          {schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
                        </span>
                      </td>
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
