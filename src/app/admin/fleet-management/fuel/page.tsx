'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Fuel, Plus, Search, Download, TrendingUp, TrendingDown, Calendar } from 'lucide-react'

interface FuelRecord {
  id: number
  date: string
  vehicle_registration: string
  driver_name: string
  liters: number
  cost_per_liter: number
  total_cost: number
  odometer_reading: number
  fuel_type: 'petrol' | 'diesel'
  station: string
}

const mockFuelRecords: FuelRecord[] = [
  {
    id: 1,
    date: '2024-04-27',
    vehicle_registration: 'ABC-123-XY',
    driver_name: 'John Doe',
    liters: 45,
    cost_per_liter: 750,
    total_cost: 33750,
    odometer_reading: 45000,
    fuel_type: 'diesel',
    station: 'NNPC Mega Station',
  },
  {
    id: 2,
    date: '2024-04-26',
    vehicle_registration: 'DEF-456-ZY',
    driver_name: 'Jane Smith',
    liters: 60,
    cost_per_liter: 720,
    total_cost: 43200,
    odometer_reading: 78500,
    fuel_type: 'petrol',
    station: 'Total Filling Station',
  },
]

const formatCurrency = (amount: number) => {
  return `₦${amount.toLocaleString()}`
}

export default function FuelManagementPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [fuelRecords] = useState<FuelRecord[]>(mockFuelRecords)

  const totalCost = fuelRecords.reduce((sum, record) => sum + record.total_cost, 0)
  const totalLiters = fuelRecords.reduce((sum, record) => sum + record.liters, 0)
  const avgCostPerLiter = totalLiters > 0 ? totalCost / totalLiters : 0

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Fuel Management</h1>
            <p className="text-gray-600">Track and manage fuel consumption across the fleet</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button className="bg-mofad-green hover:bg-mofad-green/90 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Record Fuel
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalCost)}</p>
                  <p className="text-xs text-gray-500 mt-1">This month</p>
                </div>
                <TrendingUp className="w-8 h-8 text-mofad-green" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Liters</p>
                  <p className="text-2xl font-bold text-gray-900">{totalLiters}L</p>
                  <p className="text-xs text-gray-500 mt-1">This month</p>
                </div>
                <Fuel className="w-8 h-8 text-mofad-green" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Price/Liter</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(Math.round(avgCostPerLiter))}</p>
                  <p className="text-xs text-gray-500 mt-1">This month</p>
                </div>
                <TrendingDown className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Fuel Records</p>
                  <p className="text-2xl font-bold text-gray-900">{fuelRecords.length}</p>
                  <p className="text-xs text-gray-500 mt-1">This month</p>
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
                placeholder="Search by vehicle, driver, or station..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mofad-green focus:border-mofad-green"
              />
            </div>
          </CardContent>
        </Card>

        {/* Fuel Records */}
        <Card>
          <CardHeader>
            <CardTitle>Fuel Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fuel Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Liters</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost/Liter</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Cost</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Odometer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Station</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {fuelRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm text-gray-900">{record.date}</td>
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">{record.vehicle_registration}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">{record.driver_name}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          record.fuel_type === 'diesel' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {record.fuel_type.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-900">{record.liters}L</td>
                      <td className="px-6 py-3 text-sm text-gray-900">{formatCurrency(record.cost_per_liter)}</td>
                      <td className="px-6 py-3 text-sm font-semibold text-mofad-green">{formatCurrency(record.total_cost)}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">{record.odometer_reading.toLocaleString()} km</td>
                      <td className="px-6 py-3 text-sm text-gray-700">{record.station}</td>
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
