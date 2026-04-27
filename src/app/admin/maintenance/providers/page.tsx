'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Users, Plus, Search, Download, Phone, Mail, MapPin, Star } from 'lucide-react'

interface ServiceProvider {
  id: number
  name: string
  service_type: string
  contact_person: string
  phone: string
  email: string
  address: string
  rating: number
  total_jobs: number
  status: 'active' | 'inactive'
}

const mockProviders: ServiceProvider[] = [
  {
    id: 1,
    name: 'QuickFix Auto Services',
    service_type: 'General Repairs',
    contact_person: 'Ahmed Ibrahim',
    phone: '+234 801 234 5678',
    email: 'info@quickfixauto.com',
    address: 'Lagos Island, Lagos',
    rating: 4.5,
    total_jobs: 45,
    status: 'active',
  },
  {
    id: 2,
    name: 'ProMech Solutions',
    service_type: 'Engine Specialist',
    contact_person: 'Chioma Okafor',
    phone: '+234 802 345 6789',
    email: 'contact@promech.ng',
    address: 'Ikeja, Lagos',
    rating: 4.8,
    total_jobs: 32,
    status: 'active',
  },
]

export default function ServiceProvidersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [providers] = useState<ServiceProvider[]>(mockProviders)
  const [selectedProviders, setSelectedProviders] = useState<number[]>([])

  const toggleProvider = (id: number) => {
    setSelectedProviders(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  const toggleAll = () => {
    if (selectedProviders.length === providers.length) {
      setSelectedProviders([])
    } else {
      setSelectedProviders(providers.map(p => p.id))
    }
  }

  const activeProviders = providers.filter(p => p.status === 'active').length

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Service Providers</h1>
            <p className="text-gray-600">Manage external maintenance service providers</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button className="bg-mofad-green hover:bg-mofad-green/90 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Provider
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Providers</p>
                  <p className="text-2xl font-bold text-gray-900">{providers.length}</p>
                </div>
                <Users className="w-8 h-8 text-mofad-green" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Providers</p>
                  <p className="text-2xl font-bold text-green-600">{activeProviders}</p>
                </div>
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Rating</p>
                  <p className="text-2xl font-bold text-mofad-green">
                    {providers.length > 0
                      ? (providers.reduce((sum, p) => sum + p.rating, 0) / providers.length).toFixed(1)
                      : '0.0'
                    }
                  </p>
                </div>
                <Star className="w-8 h-8 text-mofad-gold" />
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
                placeholder="Search providers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mofad-green focus:border-mofad-green"
              />
            </div>
          </CardContent>
        </Card>

        {/* Providers List */}
        <Card>
          <CardHeader>
            <CardTitle>All Service Providers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="w-12 px-4 py-3">
                      <Checkbox
                        checked={selectedProviders.length === providers.length && providers.length > 0}
                        onCheckedChange={toggleAll}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact Person</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jobs</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {providers.map((provider) => (
                    <tr
                      key={provider.id}
                      className={`hover:bg-gray-50 ${selectedProviders.includes(provider.id) ? 'bg-green-50' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selectedProviders.includes(provider.id)}
                          onCheckedChange={() => toggleProvider(provider.id)}
                        />
                      </td>
                      <td className="px-6 py-3">
                        <div className="text-sm font-semibold text-gray-900">{provider.name}</div>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-700">{provider.service_type}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">{provider.contact_person}</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-1 text-sm text-gray-700">
                          <Phone className="w-3 h-3" />
                          {provider.phone}
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-1 text-sm text-gray-700">
                          <Mail className="w-3 h-3" />
                          {provider.email}
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-1 text-sm text-gray-700">
                          <MapPin className="w-3 h-3" />
                          {provider.address}
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-mofad-gold fill-mofad-gold" />
                          <span className="text-sm font-medium text-gray-900">{provider.rating}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-700">{provider.total_jobs}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          provider.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {provider.status.charAt(0).toUpperCase() + provider.status.slice(1)}
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
