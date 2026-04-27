'use client'

import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { BarChart3, Download, TrendingUp, Fuel, Truck, DollarSign } from 'lucide-react'

export default function FleetReportsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Fleet Reports</h1>
            <p className="text-gray-600">Analytics and insights on fleet performance</p>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export All Reports
          </Button>
        </div>

        {/* Report Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Fuel className="w-5 h-5 text-mofad-green" />
                Fuel Consumption Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Detailed analysis of fuel consumption across all vehicles</p>
              <Button className="bg-mofad-green hover:bg-mofad-green/90 text-white">
                <BarChart3 className="w-4 h-4 mr-2" />
                View Report
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-mofad-green" />
                Vehicle Utilization Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Track usage and efficiency of each vehicle</p>
              <Button className="bg-mofad-green hover:bg-mofad-green/90 text-white">
                <BarChart3 className="w-4 h-4 mr-2" />
                View Report
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-mofad-green" />
                Cost Analysis Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Comprehensive breakdown of fleet operating costs</p>
              <Button className="bg-mofad-green hover:bg-mofad-green/90 text-white">
                <BarChart3 className="w-4 h-4 mr-2" />
                View Report
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-mofad-green" />
                Performance Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Historical trends and performance metrics</p>
              <Button className="bg-mofad-green hover:bg-mofad-green/90 text-white">
                <BarChart3 className="w-4 h-4 mr-2" />
                View Report
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Summary Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Fleet Summary (This Month)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Vehicles</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Distance</p>
                <p className="text-2xl font-bold text-mofad-green">15,420 km</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Fuel Consumed</p>
                <p className="text-2xl font-bold text-mofad-green">2,145 L</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Operating Cost</p>
                <p className="text-2xl font-bold text-mofad-green">₦1,850,000</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
