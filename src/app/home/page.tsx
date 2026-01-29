'use client'

import PublicNavigation from '@/components/PublicNavigation'
import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  Package,
  Truck,
  Shield,
  Globe,
  CheckCircle,
  TrendingUp,
  Zap,
  Database,
  Target,
  Activity,
  Play
} from 'lucide-react'

// Statistics data
const stats = [
  { number: '15+', label: 'Distribution Centers', description: 'Nigeria & West Africa' },
  { number: '500+', label: 'Lubricant Products', description: 'Synthetic & Mineral' },
  { number: '99.9%', label: 'System Uptime', description: 'Reliable operations' }
]

// Service offerings
const services = [
  {
    title: 'Lubricant Distribution',
    description: 'Leading supplier of synthetic and mineral lubricants across Nigeria and West Africa.',
    icon: Package,
    features: ['Premium Quality Products', 'Wide Product Range', 'Reliable Supply Chain']
  },
  {
    title: 'Industrial Solutions',
    description: 'Comprehensive industrial lubricant solutions for manufacturing and heavy industry.',
    icon: Truck,
    features: ['Custom Solutions', 'Technical Support', 'On-site Services']
  },
  {
    title: 'Automotive Products',
    description: 'High-performance automotive lubricants for passenger and commercial vehicles.',
    icon: BarChart3,
    features: ['Engine Protection', 'Performance Enhancement', 'Fuel Efficiency']
  }
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNavigation />

      {/* Hero Section */}
      <section className="relative bg-white overflow-hidden">
        {/* Background image - industrial/energy themed */}
        <div className="absolute inset-0" style={{
          backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600"><rect width="1200" height="600" fill="%23f5f5f5"/><path d="M0,400 Q300,350 600,400 T1200,400 L1200,600 L0,600 Z" fill="%230170B9" opacity="0.1"/><circle cx="200" cy="150" r="50" fill="%230170B9" opacity="0.05"/><circle cx="800" cy="200" r="80" fill="%230170B9" opacity="0.03"/><circle cx="1000" cy="100" r="60" fill="%230170B9" opacity="0.04"/></svg>')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-40">
          <div className="text-center space-y-8">
            {/* Company name and branding */}
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-black text-[#3a3a3a] leading-tight" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                MOFAD Energy Solution Limited
              </h1>

              <h2 className="text-2xl lg:text-4xl font-bold text-[#0170B9] leading-tight" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                We Are Ready To Grow Your Business
              </h2>

              <p className="text-lg text-[#4B4F58] font-medium leading-relaxed max-w-4xl mx-auto" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                Nigeria&apos;s leading distributor of synthetic and mineral lubricants, serving the West African market with premium quality products and exceptional service.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                href="/business-divisions"
                className="group flex items-center justify-center space-x-3 px-8 py-4 bg-[#0170B9] text-white font-semibold text-base rounded-sm hover:bg-[#015aa0] transition-all duration-300 shadow-lg hover:shadow-xl"
                style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', borderRadius: '2px', fontSize: '15px', padding: '15px 30px' }}
              >
                <span>Our Services</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/about"
                className="group flex items-center justify-center space-x-3 px-8 py-4 bg-white border-2 border-[#0170B9] text-[#0170B9] font-semibold text-base rounded-sm hover:bg-[#0170B9] hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl"
                style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', borderRadius: '2px', fontSize: '15px', padding: '13px 30px' }}
              >
                <span>Learn More</span>
              </Link>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-8 pt-12 border-t border-gray-200">
              {stats.map((stat, index) => (
                <div key={index} className="text-center bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg">
                  <div className="text-3xl font-black text-[#0170B9] mb-2" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>{stat.number}</div>
                  <div className="text-[#3a3a3a] font-semibold text-sm mb-1" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>{stat.label}</div>
                  <div className="text-[#4B4F58] text-xs" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>{stat.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview Section */}
      <section className="py-24 bg-[#F5F5F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-3 h-3 bg-[#0170B9] rounded-full"></div>
              <span className="text-[#0170B9] font-bold text-sm uppercase tracking-wider" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '15px' }}>What We Do</span>
              <div className="w-3 h-3 bg-[#0170B9] rounded-full"></div>
            </div>
            <h2 className="text-4xl font-black text-[#3a3a3a] mb-6" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
              Leading Lubricant Solutions
              <span className="block text-[#0170B9]">Across West Africa</span>
            </h2>
            <p className="text-xl text-[#4B4F58] max-w-3xl mx-auto leading-relaxed" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '15px' }}>
              We specialize in distributing high-quality synthetic and mineral lubricants,
              serving diverse industries with reliable products and exceptional service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon
              return (
                <div key={index} className="group relative bg-white rounded-lg p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-200 overflow-hidden">
                  <div className="absolute inset-0 bg-[#0170B9] opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>

                  <div className="relative">
                    <div className="w-16 h-16 bg-[#0170B9] rounded-lg flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-8 h-8 text-white" />
                    </div>

                    <h3 className="text-xl font-bold text-[#3a3a3a] mb-4 group-hover:text-[#0170B9] transition-colors" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                      {service.title}
                    </h3>
                    <p className="text-[#4B4F58] mb-6 leading-relaxed" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '15px' }}>
                      {service.description}
                    </p>

                    <ul className="space-y-2">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-[#0170B9]" />
                          <span className="text-sm text-[#4B4F58] font-medium" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '15px' }}>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-16 text-center">
            <Link
              href="/business-divisions"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-[#0170B9] text-white font-semibold rounded-sm hover:bg-[#015aa0] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '15px', borderRadius: '2px' }}
            >
              <span>View All Services</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Quick About Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              radial-gradient(circle at 25px 25px, rgba(255,255,255,0.1) 2px, transparent 0),
              radial-gradient(circle at 75px 75px, rgba(255,255,255,0.05) 1px, transparent 0)
            `,
            backgroundSize: '100px 100px, 50px 50px'
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-black text-white mb-6" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                About <span className="text-orange-300">MOFAD Energy Solutions</span>
              </h2>
              <p className="text-white/90 leading-relaxed text-lg mb-8" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '15px' }}>
                Since our inception, MOFAD has grown tremendously, recording over a hundred percent in profits
                at the close of each business year. Our engagements with partners have been mutually beneficial,
                built on integrity and trust.
              </p>
              <Link
                href="/about"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-white text-[#0170B9] font-semibold rounded-sm hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl"
                style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '15px', borderRadius: '2px' }}
              >
                <span>Learn More About Us</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-6">
              {/* MOFAD Image Showcase */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden">
                <img
                  src="/mofad2.jpg"
                  alt="MOFAD Energy Solutions Team"
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                    Our Team & Operations
                  </h3>
                  <p className="text-white/80 leading-relaxed" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '15px' }}>
                    MOFAD Energy Solutions brings together experienced professionals dedicated to delivering innovative energy solutions and world-class service to our clients.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>Our Mission</h3>
                  <p className="text-white/80 leading-relaxed" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '15px' }}>
                    To provide oil and natural gas products to the Nigerian and West African markets
                    through innovation and best practices for sustainable business growth.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>Our Vision</h3>
                  <p className="text-white/80 leading-relaxed" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '15px' }}>
                    To be the leading independent oil and gas company in Nigeria through innovation
                    and operational excellence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners & Clients Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <span className="text-[#0170B9] font-bold text-sm uppercase tracking-wider" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '15px' }}>Our Partners</span>
              <div className="w-3 h-3 bg-[#0170B9] rounded-full"></div>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-[#3a3a3a] mb-6" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
              Trusted by <span className="text-[#0170B9]">Industry Leaders</span>
            </h2>
            <p className="text-lg text-[#4B4F58] max-w-3xl mx-auto leading-relaxed" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '15px' }}>
              MOFAD Energy Solutions is proud to partner with leading organizations in the energy, financial, and industrial sectors across Nigeria and West Africa.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 items-center justify-center">
            <div className="group bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 flex items-center justify-center h-24">
              <img
                src="/Nigerian_National_Petroleum_Company_logo.svg.png"
                alt="Nigerian National Petroleum Company"
                className="max-w-full max-h-full object-contain opacity-70 group-hover:opacity-100 transition-opacity duration-300"
              />
            </div>

            <div className="group bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 flex items-center justify-center h-24">
              <img
                src="/shell-2020.png"
                alt="Shell"
                className="max-w-full max-h-full object-contain opacity-70 group-hover:opacity-100 transition-opacity duration-300"
              />
            </div>

            <div className="group bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 flex items-center justify-center h-24">
              <img
                src="/castrol-logo-png_seeklogo-27069.png"
                alt="Castrol"
                className="max-w-full max-h-full object-contain opacity-70 group-hover:opacity-100 transition-opacity duration-300"
              />
            </div>

            <div className="group bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 flex items-center justify-center h-24">
              <img
                src="/eterna logo.png"
                alt="Eterna"
                className="max-w-full max-h-full object-contain opacity-70 group-hover:opacity-100 transition-opacity duration-300"
              />
            </div>

            <div className="group bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 flex items-center justify-center h-24">
              <img
                src="/uba logo.png"
                alt="UBA"
                className="max-w-full max-h-full object-contain opacity-70 group-hover:opacity-100 transition-opacity duration-300"
              />
            </div>
          </div>

          <div className="mt-16 text-center">
            <p className="text-lg text-[#4B4F58] mb-8" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '15px' }}>
              Join these industry leaders who trust MOFAD Energy Solutions
            </p>
            <Link
              href="/about"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-[#0170B9] text-white font-semibold rounded-sm hover:bg-[#015aa0] transition-all duration-300 shadow-lg hover:shadow-xl"
              style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '15px', borderRadius: '2px' }}
            >
              <span>Learn About Our Partnerships</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-gray-900 to-gray-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              radial-gradient(circle at 25px 25px, rgba(255,255,255,0.2) 2px, transparent 0),
              radial-gradient(circle at 75px 75px, rgba(255,255,255,0.1) 1px, transparent 0)
            `,
            backgroundSize: '100px 100px, 50px 50px'
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-black text-white mb-6" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
            Ready to Partner with MOFAD?
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '15px' }}>
            Join us in delivering premium lubricant solutions across West Africa.
            Experience quality, reliability, and exceptional service.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/business-divisions"
              className="px-8 py-4 bg-[#0170B9] text-white font-bold text-lg rounded-sm hover:bg-[#015aa0] transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
              style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '15px', borderRadius: '2px' }}
            >
              View Our Services
            </Link>
            <Link
              href="/gallery"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold text-lg rounded-sm hover:bg-white/20 transition-all duration-300"
              style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '15px', borderRadius: '2px' }}
            >
              View Gallery
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#eeeeee] text-[#3a3a3a] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-[#0170B9] rounded-lg flex items-center justify-center">
                  <Activity className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-[#3a3a3a]" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>MOFAD</h3>
                  <p className="text-sm text-[#4B4F58]" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>Energy Solutions</p>
                </div>
              </div>
              <p className="text-[#4B4F58] leading-relaxed" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '15px' }}>
                Nigeria&apos;s leading distributor of synthetic and mineral lubricants across West Africa.
              </p>
              <div className="text-sm text-[#4B4F58] space-y-2 mt-4" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '15px' }}>
                <div className="flex items-center space-x-2">
                  <span>📍</span>
                  <span>Aminu Kano Crescent, Wuse 2, Abuja</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>📧</span>
                  <span>mofadenergysolutions@gmail.com</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-bold mb-4 text-[#3a3a3a]" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/home" className="text-[#4B4F58] hover:text-[#0170B9] transition-colors" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '15px' }}>Home</Link></li>
                <li><Link href="/about" className="text-[#4B4F58] hover:text-[#0170B9] transition-colors" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '15px' }}>About Us</Link></li>
                <li><Link href="/business-divisions" className="text-[#4B4F58] hover:text-[#0170B9] transition-colors" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '15px' }}>Services</Link></li>
                <li><Link href="/gallery" className="text-[#4B4F58] hover:text-[#0170B9] transition-colors" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '15px' }}>Gallery</Link></li>
              </ul>
            </div>

            {/* Business */}
            <div>
              <h4 className="text-lg font-bold mb-4 text-[#3a3a3a]" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>Business</h4>
              <ul className="space-y-2">
                <li><span className="text-[#4B4F58]" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '15px' }}>Lubricant Distribution</span></li>
                <li><span className="text-[#4B4F58]" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '15px' }}>Industrial Solutions</span></li>
                <li><span className="text-[#4B4F58]" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '15px' }}>Automotive Products</span></li>
                <li><span className="text-[#4B4F58]" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '15px' }}>Technical Support</span></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-lg font-bold mb-4 text-[#3a3a3a]" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>Contact</h4>
              <ul className="space-y-2">
                <li><Link href="/auth/login" className="text-[#4B4F58] hover:text-[#0170B9] transition-colors" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '15px' }}>Staff Portal</Link></li>
                <li><Link href="/dashboard" className="text-[#4B4F58] hover:text-[#0170B9] transition-colors" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '15px' }}>ERP System</Link></li>
                <li><span className="text-[#4B4F58]" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '15px' }}>Customer Support</span></li>
                <li><span className="text-[#4B4F58]" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '15px' }}>Partnership Inquiries</span></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-300 mt-12 pt-8 text-center">
            <p className="text-[#4B4F58]" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '15px' }}>
              © 2024 MOFAD Energy Solutions Limited. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}