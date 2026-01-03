'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  Users,
  Package,
  Truck,
  Shield,
  Globe,
  CheckCircle,
  TrendingUp,
  Zap,
  Database,
  Settings,
  FileText,
  Building2,
  Leaf,
  Target,
  Award,
  ChevronRight,
  Menu,
  X,
  Play,
  Star,
  Phone,
  Mail,
  MapPin
} from 'lucide-react'

// New Green Color Palette
const colors = {
  primary: '#22c55e', // Green-500
  primaryDark: '#16a34a', // Green-600
  primaryLight: '#86efac', // Green-300
  accent: '#059669', // Emerald-600
  accentLight: '#10b981', // Emerald-500
  earth: '#92400e', // Amber-800
  neutral: '#374151', // Gray-700
  lightGray: '#f9fafb', // Gray-50
  darkGray: '#1f2937' // Gray-800
}

// Statistics data
const stats = [
  { number: '15+', label: 'Distribution Centers', description: 'Nigeria & West Africa', icon: Building2 },
  { number: '500+', label: 'Energy Solutions', description: 'Delivered Successfully', icon: Zap },
  { number: '99.9%', label: 'Client Satisfaction', description: 'Proven Excellence', icon: Star },
  { number: '10+', label: 'Years Experience', description: 'Industry Leadership', icon: Award }
]

// Service offerings with better structure
const services = [
  {
    title: 'Energy Infrastructure',
    description: 'Complete energy solutions from planning to implementation, ensuring sustainable and efficient operations across Nigeria and West Africa.',
    icon: Zap,
    color: 'from-green-500 to-emerald-600',
    features: ['Power Generation', 'Grid Management', 'Renewable Integration', 'Energy Efficiency']
  },
  {
    title: 'Enterprise Resource Planning',
    description: 'Advanced ERP systems tailored for energy companies, streamlining operations and maximizing organizational efficiency.',
    icon: Database,
    color: 'from-emerald-500 to-green-600',
    features: ['System Integration', 'Process Automation', 'Real-time Analytics', 'Custom Development']
  },
  {
    title: 'Project Management',
    description: 'End-to-end project management services ensuring timely delivery and quality execution of complex energy projects.',
    icon: Settings,
    color: 'from-green-600 to-emerald-700',
    features: ['Project Planning', 'Risk Management', 'Quality Assurance', 'Stakeholder Coordination']
  }
]

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white shadow-lg border-b-2 border-green-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center">
              <img
                src="/modah_logo-removebg-preview.png"
                alt="MOFAD Energy Solutions"
                className="h-16 w-auto"
              />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#" className="text-gray-700 hover:text-green-600 font-semibold transition-colors text-lg">
                Home
              </Link>
              <Link href="#about" className="text-gray-700 hover:text-green-600 font-semibold transition-colors text-lg">
                About Us
              </Link>
              <Link href="#services" className="text-gray-700 hover:text-green-600 font-semibold transition-colors text-lg">
                Services
              </Link>
              <Link href="#partners" className="text-gray-700 hover:text-green-600 font-semibold transition-colors text-lg">
                Partners
              </Link>

              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/login"
                  className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  <Users className="w-5 h-5" />
                  <span>Staff Portal</span>
                </Link>
                <Link
                  href="/dashboard"
                  className="px-6 py-3 bg-white border-2 border-green-600 text-green-600 font-bold rounded-lg hover:bg-green-600 hover:text-white transition-all duration-300 shadow-lg"
                >
                  Dashboard
                </Link>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-700 hover:text-green-600"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-green-200">
            <div className="px-4 py-4 space-y-3">
              <Link href="#" className="block py-3 text-gray-700 hover:text-green-600 font-semibold text-lg">Home</Link>
              <Link href="#about" className="block py-3 text-gray-700 hover:text-green-600 font-semibold text-lg">About Us</Link>
              <Link href="#services" className="block py-3 text-gray-700 hover:text-green-600 font-semibold text-lg">Services</Link>
              <Link href="#partners" className="block py-3 text-gray-700 hover:text-green-600 font-semibold text-lg">Partners</Link>
              <div className="pt-4 space-y-3">
                <Link href="/auth/login" className="flex items-center justify-center w-full px-6 py-3 bg-green-600 text-white font-bold rounded-lg">Staff Portal</Link>
                <Link href="/dashboard" className="block w-full px-6 py-3 border-2 border-green-600 text-green-600 font-bold rounded-lg text-center">Dashboard</Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 py-24 lg:py-32 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='%23059669'%3e%3cpath d='m0 0 32 32 M32 0 0 32'/%3e%3c/svg%3e")`,
            backgroundSize: '32px 32px'
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                  <Leaf className="w-4 h-4 mr-2" />
                  Leading Energy Solutions Provider
                </div>

                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Powering Nigeria's <span className="text-green-600">Energy Future</span>
                </h1>

                <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                  MOFAD Energy Solutions Limited delivers comprehensive energy infrastructure,
                  advanced ERP systems, and professional project management services across Nigeria and West Africa.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/dashboard"
                  className="group flex items-center justify-center px-8 py-4 bg-green-600 text-white font-bold text-lg rounded-lg hover:bg-green-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
                >
                  <span>Explore Solutions</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="#about"
                  className="flex items-center justify-center px-8 py-4 bg-white border-2 border-green-600 text-green-600 font-bold text-lg rounded-lg hover:bg-green-50 transition-all duration-300 shadow-lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  <span>Learn More</span>
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-8">
                {stats.map((stat, index) => {
                  const Icon = stat.icon
                  return (
                    <div key={index} className="text-center">
                      <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{stat.number}</div>
                      <div className="text-sm text-gray-600 font-semibold">{stat.label}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
                <img
                  src="/mofad 1.jpg"
                  alt="MOFAD Energy Solutions Facility"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <h3 className="text-2xl font-bold text-white mb-2">State-of-the-Art Facilities</h3>
                  <p className="text-green-100">Leading energy infrastructure across Nigeria</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold mb-6">
              <Settings className="w-4 h-4 mr-2" />
              Our Expertise
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Comprehensive <span className="text-green-600">Energy Solutions</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From infrastructure development to enterprise software, we deliver integrated solutions
              that drive sustainable growth and operational excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon
              return (
                <div key={index} className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-green-200">
                  <div className={`w-16 h-16 bg-gradient-to-r ${service.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-green-600 transition-colors">
                    {service.title}
                  </h3>

                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {service.description}
                  </p>

                  <ul className="space-y-3">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700 font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6">
                    <Link href="#" className="inline-flex items-center text-green-600 font-semibold hover:text-green-700">
                      Learn More <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                  <Target className="w-4 h-4 mr-2" />
                  About MOFAD
                </div>

                <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
                  Driving <span className="text-green-600">Sustainable Growth</span> Since 2010
                </h2>

                <p className="text-lg text-gray-600 leading-relaxed">
                  MOFAD Energy Solutions Limited stands as Nigeria's premier provider of integrated energy solutions,
                  combining cutting-edge technology with deep industry expertise to deliver transformational results
                  for our clients across West Africa.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <h4 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                    <Target className="w-5 h-5 text-green-600 mr-2" />
                    Our Mission
                  </h4>
                  <p className="text-gray-600">
                    To provide innovative oil and natural gas solutions through best practices
                    that drive sustainable business growth across Nigeria and West Africa.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md">
                  <h4 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                    <Award className="w-5 h-5 text-green-600 mr-2" />
                    Our Vision
                  </h4>
                  <p className="text-gray-600">
                    To be the leading independent energy company in Nigeria through innovation,
                    operational excellence, and commitment to our stakeholders.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-gray-900">Proven Track Record</h4>
                    <p className="text-gray-600">Over 100% profit growth year-over-year with exceptional client satisfaction</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-gray-900">Strategic Partnerships</h4>
                    <p className="text-gray-600">Strong relationships with industry leaders including NNPC, Shell, and Castrol</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-gray-900">Professional Excellence</h4>
                    <p className="text-gray-600">Commitment to integrity, transparency, and the highest professional standards</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Image */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                <img
                  src="/mofad2.jpg"
                  alt="MOFAD Energy Solutions Team"
                  className="w-full h-[600px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-green-900/50 via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <h3 className="text-2xl font-bold text-white mb-2">Expert Team</h3>
                  <p className="text-green-100">Dedicated professionals committed to excellence</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section id="partners" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold mb-6">
              <Users className="w-4 h-4 mr-2" />
              Strategic Partnerships
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Trusted by <span className="text-green-600">Industry Leaders</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We collaborate with the most respected names in energy, finance, and industry
              to deliver exceptional value and innovation to our clients.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 items-center">
            {[
              { name: 'Nigerian National Petroleum Company', image: '/Nigerian_National_Petroleum_Company_logo.svg.png' },
              { name: 'Shell', image: '/shell-2020.png' },
              { name: 'Castrol', image: '/castrol-logo-png_seeklogo-27069.png' },
              { name: 'Eterna', image: '/eterna logo.png' },
              { name: 'United Bank for Africa', image: '/uba logo.png' },
            ].map((partner, index) => (
              <div key={index} className="group bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-green-200 flex items-center justify-center h-28">
                <img
                  src={partner.image}
                  alt={partner.name}
                  className="max-w-full max-h-full object-contain opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                />
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-lg text-gray-600 mb-8">
              Ready to join our network of successful partnerships?
            </p>
            <Link
              href="#contact"
              className="inline-flex items-center px-8 py-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <span>Partner With Us</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Energy Operations?
          </h2>
          <p className="text-xl text-green-100 mb-12 max-w-3xl mx-auto">
            Partner with MOFAD Energy Solutions and experience the difference that professional
            expertise and innovative technology can make for your business.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/dashboard"
              className="px-10 py-4 bg-white text-green-600 font-bold text-lg rounded-lg hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl"
            >
              Get Started Today
            </Link>
            <Link
              href="#contact"
              className="px-10 py-4 bg-transparent border-2 border-white text-white font-bold text-lg rounded-lg hover:bg-white hover:text-green-600 transition-all duration-300"
            >
              Contact Our Team
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="space-y-6">
              <img
                src="/modah_logo-removebg-preview.png"
                alt="MOFAD Energy Solutions"
                className="h-12 w-auto brightness-0 invert"
              />
              <p className="text-gray-300 leading-relaxed">
                Leading energy solutions provider committed to sustainable growth
                and operational excellence across Nigeria and West Africa.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-xl font-bold mb-6">Services</h3>
              <ul className="space-y-3">
                <li><Link href="#" className="text-gray-300 hover:text-green-400 transition-colors">Energy Infrastructure</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-green-400 transition-colors">ERP Solutions</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-green-400 transition-colors">Project Management</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-green-400 transition-colors">Consulting Services</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-xl font-bold mb-6">Company</h3>
              <ul className="space-y-3">
                <li><Link href="#about" className="text-gray-300 hover:text-green-400 transition-colors">About Us</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-green-400 transition-colors">Careers</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-green-400 transition-colors">News</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-green-400 transition-colors">Contact</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-xl font-bold mb-6">Contact</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">Lagos, Nigeria</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">+234 XXX XXX XXXX</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">info@mofadenergysolutions.com</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400">© 2024 MOFAD Energy Solutions Limited. All rights reserved.</p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <Link href="#" className="text-gray-400 hover:text-green-400 transition-colors">Privacy Policy</Link>
                <Link href="#" className="text-gray-400 hover:text-green-400 transition-colors">Terms of Service</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}