'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { AppLayout } from '@/components/layout/AppLayout'
import ServicesTab from '@/components/settings/lubebay-catalog/ServicesTab'
import CarWashServicesTab from '@/components/settings/lubebay-catalog/CarWashServicesTab'
import ProductsTab from '@/components/settings/lubebay-catalog/ProductsTab'
import FiltersTab from '@/components/settings/lubebay-catalog/FiltersTab'

export default function LubebayCatalogPage() {
  const [activeTab, setActiveTab] = useState('services')

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Lubebay Catalog Management</h1>
            <p className="text-gray-600 mt-1">
              Manage services and products offered at lubebays
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-3xl grid-cols-4">
            <TabsTrigger value="services">All Services</TabsTrigger>
            <TabsTrigger value="car-wash">Car Wash</TabsTrigger>
            <TabsTrigger value="filters">Filters</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="mt-6">
            <ServicesTab />
          </TabsContent>

          <TabsContent value="car-wash" className="mt-6">
            <CarWashServicesTab />
          </TabsContent>

          <TabsContent value="filters" className="mt-6">
            <FiltersTab />
          </TabsContent>

          <TabsContent value="products" className="mt-6">
            <ProductsTab />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
