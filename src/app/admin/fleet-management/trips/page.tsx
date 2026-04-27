'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { MapPin, Plus, Search, Download, Calendar, TrendingUp } from 'lucide-react'

interface TripLog {
  id: number
  trip_date: string
  vehicle_registration: string
  driver_name: string
  start_location: string
  end_location: string
  start_odometer: number
  end_odometer: number
  distance_km: number
  purpose: string
  fuel_consumed?: number
}

const mockTrips: TripLog[] = [
  {
    id: 1,
    trip_date: '2024-04-27',
    vehicle_registration: 'ABC-123-XY',
    driver_name: 'John Doe',
    start_location: 'Lagos Office',
    end_location: 'Ibadan Client',
    start_odometer: 44800,
    end_odometer: 45000,
    distance_km: 200,
    purpose: 'Client delivery',
    fuel_consumed: 25,
  },
]

export default function TripLogsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [trips] = useState<TripLog[]>(mockTrips)

  const totalDistance = trips.reduce((sum, trip) => sum + trip.distance_km, 0)

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Trip Logs</h1>
            <p className="text-gray-600">Track vehicle trips and journeys</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button className="bg-mofad-green hover:bg-mofad-green/90 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Log Trip
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Trips</p>
                  <p className="text-2xl font-bold text-gray-900">{trips.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-mofad-green" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Distance</p>
                  <p className="text-2xl font-bold text-gray-900">{totalDistance.toLocaleString()} km</p>
                </div>
                <TrendingUp className="w-8 h-8 text-mofad-green" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Distance/Trip</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {trips.length > 0 ? Math.round(totalDistance / trips.length) : 0} km
                  </p>
                </div>
                <MapPin className="w-8 h-8 text-mofad-green" />
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
                placeholder="Search trips..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mofad-green focus:border-mofad-green"
              />
            </div>
          </CardContent>
        </Card>

        {/* Trip Logs */}
        <Card>
          <CardHeader>
            <CardTitle>All Trips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">From</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">To</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Distance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fuel Used</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purpose</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {trips.map((trip) => (
                    <tr key={trip.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm text-gray-900">{trip.trip_date}</td>
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">{trip.vehicle_registration}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">{trip.driver_name}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">{trip.start_location}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">{trip.end_location}</td>
                      <td className="px-6 py-3 text-sm font-semibold text-mofad-green">{trip.distance_km} km</td>
                      <td className="px-6 py-3 text-sm text-gray-700">{trip.fuel_consumed ? `${trip.fuel_consumed}L` : '-'}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">{trip.purpose}</td>
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
