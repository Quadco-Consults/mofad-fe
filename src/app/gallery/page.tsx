'use client'

import { useState } from 'react'
import PublicNavigation from '@/components/PublicNavigation'
import {
  Camera,
  Play,
  Award,
  Building,
  Zap,
  Users,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Share2
} from 'lucide-react'

export default function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedImage, setSelectedImage] = useState<number | null>(null)

  const categories = [
    { id: 'all', name: 'All Projects', count: 29 },
    { id: 'energy', name: 'Energy Infrastructure', count: 8 },
    { id: 'erp', name: 'ERP Implementations', count: 6 },
    { id: 'events', name: 'Corporate Events', count: 5 },
    { id: 'partnerships', name: 'Strategic Partnerships', count: 5 },
    { id: 'awards', name: 'Awards & Recognition', count: 5 }
  ]

  const galleryItems = [
    {
      id: 1,
      title: 'MOFAD Energy Solutions Facility',
      category: 'energy',
      type: 'image',
      thumbnail: '/mofad 1.jpg',
      description: 'MOFAD Energy Solutions main facility and operations center',
      location: 'Nigeria',
      year: '2024'
    },
    {
      id: 2,
      title: 'MOFAD Corporate Operations',
      category: 'events',
      type: 'image',
      thumbnail: '/mofad2.jpg',
      description: 'MOFAD team and corporate operations overview',
      location: 'Nigeria',
      year: '2024'
    },
    {
      id: 3,
      title: 'Wind Energy Project',
      category: 'energy',
      type: 'video',
      thumbnail: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      description: 'Wind turbine installation and commissioning',
      location: 'Kaduna, Nigeria',
      year: '2023'
    },
    {
      id: 4,
      title: 'Excellence in Innovation Award',
      category: 'awards',
      type: 'image',
      thumbnail: 'https://images.unsplash.com/photo-1624969862293-b749659ccc4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      description: 'National Energy Innovation Award 2024',
      location: 'Abuja, Nigeria',
      year: '2024'
    },
    {
      id: 5,
      title: 'Annual Conference 2024',
      category: 'events',
      type: 'image',
      thumbnail: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      description: 'MOFAD Annual Energy Solutions Conference',
      location: 'Lagos, Nigeria',
      year: '2024'
    },
    {
      id: 6,
      title: 'Power Grid Modernization',
      category: 'energy',
      type: 'image',
      thumbnail: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      description: 'Smart grid infrastructure upgrade project',
      location: 'Port Harcourt, Nigeria',
      year: '2024'
    },
    {
      id: 7,
      title: 'Team Building Workshop',
      category: 'events',
      type: 'image',
      thumbnail: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      description: 'Annual team building and strategy workshop',
      location: 'Abuja, Nigeria',
      year: '2024'
    },
    {
      id: 8,
      title: 'Manufacturing ERP Implementation',
      category: 'erp',
      type: 'image',
      thumbnail: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      description: 'Complete ERP system for manufacturing facility',
      location: 'Kano, Nigeria',
      year: '2023'
    },
    {
      id: 9,
      title: 'NNPC Partnership',
      category: 'partnerships',
      type: 'image',
      thumbnail: '/Nigerian_National_Petroleum_Company_logo.svg.png',
      description: 'Strategic partnership with Nigerian National Petroleum Company',
      location: 'Nigeria',
      year: '2024'
    },
    {
      id: 10,
      title: 'Shell Collaboration',
      category: 'partnerships',
      type: 'image',
      thumbnail: '/shell-2020.png',
      description: 'Long-term partnership with Shell for energy solutions',
      location: 'Nigeria',
      year: '2024'
    },
    {
      id: 11,
      title: 'Castrol Partnership',
      category: 'partnerships',
      type: 'image',
      thumbnail: '/castrol-logo-png_seeklogo-27069.png',
      description: 'Lubricant distribution partnership with Castrol',
      location: 'West Africa',
      year: '2023'
    },
    {
      id: 12,
      title: 'Eterna Energy Alliance',
      category: 'partnerships',
      type: 'image',
      thumbnail: '/eterna logo.png',
      description: 'Strategic alliance with Eterna for energy distribution',
      location: 'Nigeria',
      year: '2024'
    },
    {
      id: 13,
      title: 'UBA Financial Partnership',
      category: 'partnerships',
      type: 'image',
      thumbnail: '/uba logo.png',
      description: 'Financial services partnership with United Bank for Africa',
      location: 'Nigeria',
      year: '2023'
    }
  ]

  const filteredItems = selectedCategory === 'all'
    ? galleryItems
    : galleryItems.filter(item => item.category === selectedCategory)

  const nextImage = () => {
    if (selectedImage === null) return
    const currentIndex = filteredItems.findIndex(item => item.id === selectedImage)
    const nextIndex = (currentIndex + 1) % filteredItems.length
    setSelectedImage(filteredItems[nextIndex].id)
  }

  const prevImage = () => {
    if (selectedImage === null) return
    const currentIndex = filteredItems.findIndex(item => item.id === selectedImage)
    const prevIndex = (currentIndex - 1 + filteredItems.length) % filteredItems.length
    setSelectedImage(filteredItems[prevIndex].id)
  }

  const selectedImageData = selectedImage
    ? galleryItems.find(item => item.id === selectedImage)
    : null

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#0170B9] via-[#015aa0] to-[#014080] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <Camera className="w-16 h-16 mx-auto mb-6 text-blue-100" />
            <h1
              className="text-4xl md:text-5xl font-bold mb-6"
              style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
            >
              Project Gallery
            </h1>
            <p
              className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed"
              style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
            >
              Showcasing our commitment to excellence through successful projects and memorable milestones
            </p>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-16 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#0170B9] mb-2">50+</div>
              <div className="text-[#4B4F58] font-medium">Projects Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#0170B9] mb-2">15+</div>
              <div className="text-[#4B4F58] font-medium">Major Clients</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#0170B9] mb-2">5</div>
              <div className="text-[#4B4F58] font-medium">Industry Awards</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#0170B9] mb-2">100%</div>
              <div className="text-[#4B4F58] font-medium">Client Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-[#0170B9] text-white shadow-lg'
                    : 'bg-gray-100 text-[#4B4F58] hover:bg-gray-200'
                }`}
                style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
              >
                {category.name}
                <span className="ml-2 text-sm opacity-75">({category.count})</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group relative bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedImage(item.id)}
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {item.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                  )}
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3
                      className="font-bold text-lg mb-1"
                      style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                    >
                      {item.title}
                    </h3>
                    <p className="text-sm opacity-90">{item.location} • {item.year}</p>
                  </div>
                </div>

                <div className="p-4">
                  <h3
                    className="font-semibold text-[#3a3a3a] mb-2"
                    style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="text-sm text-[#4B4F58] mb-2"
                    style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                  >
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{item.location}</span>
                    <span>{item.year}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Image Modal */}
      {selectedImage && selectedImageData && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative max-w-6xl max-h-[90vh] mx-4">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
            >
              <X className="w-6 h-6" />
            </button>

            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <div className="bg-white rounded-lg overflow-hidden max-h-[90vh]">
              <img
                src={selectedImageData.thumbnail}
                alt={selectedImageData.title}
                className="w-full max-h-[70vh] object-contain"
              />

              <div className="p-6">
                <h2
                  className="text-2xl font-bold text-[#3a3a3a] mb-2"
                  style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                >
                  {selectedImageData.title}
                </h2>
                <p
                  className="text-[#4B4F58] mb-4"
                  style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                >
                  {selectedImageData.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    <span>{selectedImageData.location} • {selectedImageData.year}</span>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors">
                      <Download className="w-5 h-5" />
                    </button>
                    <button className="p-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-[#0170B9] to-[#015aa0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2
            className="text-3xl md:text-4xl font-bold text-white mb-6"
            style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
          >
            Ready to Start Your Project?
          </h2>
          <p
            className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto"
            style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
          >
            Join our growing list of satisfied clients and let us help bring your vision to life
          </p>
          <button
            className="px-8 py-4 bg-white text-[#0170B9] font-semibold rounded-sm hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl"
            style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', borderRadius: '2px' }}
          >
            Get Started Today
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#3a3a3a] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3
                className="text-xl font-bold mb-4"
                style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
              >
                MOFAD Energy Solutions
              </h3>
              <p
                className="text-gray-300 leading-relaxed"
                style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
              >
                Leading provider of energy solutions, ERP systems, and business intelligence services across Nigeria and West Africa.
              </p>
            </div>
            <div>
              <h4
                className="text-lg font-semibold mb-4"
                style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
              >
                Quick Links
              </h4>
              <ul className="space-y-2 text-gray-300">
                <li style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>Home</li>
                <li style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>About Us</li>
                <li style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>Business Divisions</li>
                <li style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>Gallery</li>
              </ul>
            </div>
            <div>
              <h4
                className="text-lg font-semibold mb-4"
                style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
              >
                Contact Us
              </h4>
              <p
                className="text-gray-300"
                style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
              >
                info@mofadenergysolutions.com<br />
                +234 XXX XXX XXXX
              </p>
            </div>
          </div>
          <div className="border-t border-gray-600 mt-8 pt-8 text-center">
            <p
              className="text-gray-400"
              style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
            >
              © 2024 MOFAD Energy Solutions. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}