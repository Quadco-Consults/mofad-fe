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
  Car,
  Target,
  Activity,
  DollarSign,
  Calendar,
  Clock,
  Award,
  ChevronRight,
  Menu,
  X,
  Play
} from 'lucide-react'

// Statistics data
const stats = [
  { number: '50+', label: 'Distribution Centers', description: 'Nationwide coverage' },
  { number: '10K+', label: 'Products Managed', description: 'Comprehensive inventory' },
  { number: '99.9%', label: 'System Uptime', description: 'Reliable operations' }
]

// Service offerings
const services = [
  {
    title: 'Inventory Management',
    description: 'Real-time tracking and optimization of petroleum products across all locations.',
    icon: Package,
    color: 'from-blue-500 to-cyan-500',
    features: ['Real-time tracking', 'Automated alerts', 'Predictive analytics']
  },
  {
    title: 'Distribution Network',
    description: 'Efficient supply chain management for substores and lubebay operations.',
    icon: Truck,
    color: 'from-emerald-500 to-teal-500',
    features: ['Route optimization', 'Fleet management', 'Delivery tracking']
  },
  {
    title: 'Financial Integration',
    description: 'SAGE-powered financial management with comprehensive reporting capabilities.',
    icon: BarChart3,
    color: 'from-amber-500 to-orange-500',
    features: ['SAGE integration', 'Real-time reports', 'Automated billing']
  },
  {
    title: 'Customer Portal',
    description: 'Dedicated platform for customer management and service delivery.',
    icon: Users,
    color: 'from-purple-500 to-violet-500',
    features: ['Self-service portal', 'Order tracking', '24/7 support']
  }
]

// Feature capabilities
const features = [
  {
    title: 'Real-Time Analytics',
    description: 'Comprehensive dashboards with live data insights for informed decision-making.',
    icon: TrendingUp
  },
  {
    title: 'Automated Workflows',
    description: 'Streamlined business processes with intelligent automation and approval flows.',
    icon: Zap
  },
  {
    title: 'SAGE Integration',
    description: 'Seamless financial data synchronization with enterprise-grade ERP capabilities.',
    icon: Database
  },
  {
    title: 'Secure & Compliant',
    description: 'Enterprise-level security with regulatory compliance and audit trails.',
    icon: Shield
  },
  {
    title: 'Mobile Optimized',
    description: 'Full functionality across all devices with responsive design architecture.',
    icon: Globe
  },
  {
    title: 'Performance Tracking',
    description: 'Advanced KPI monitoring with predictive analytics and trend analysis.',
    icon: Target
  }
]

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div>
                <h1 className="text-xl font-black text-gray-900">MOFAD</h1>
                <p className="text-xs text-gray-600 font-semibold">Enterprise ERP</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-700 hover:text-emerald-600 font-medium transition-colors">
                Features
              </Link>
              <Link href="#services" className="text-gray-700 hover:text-emerald-600 font-medium transition-colors">
                Services
              </Link>
              <Link href="#about" className="text-gray-700 hover:text-emerald-600 font-medium transition-colors">
                About
              </Link>
              <Link href="#contact" className="text-gray-700 hover:text-emerald-600 font-medium transition-colors">
                Contact
              </Link>
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-gray-700 hover:text-emerald-600 font-semibold transition-colors"
                >
                  Staff Login
                </Link>
                <Link
                  href="/dashboard"
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Dashboard
                </Link>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-700 hover:text-emerald-600"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="px-4 py-4 space-y-3">
              <Link href="#features" className="block py-2 text-gray-700 hover:text-emerald-600 font-medium">
                Features
              </Link>
              <Link href="#services" className="block py-2 text-gray-700 hover:text-emerald-600 font-medium">
                Services
              </Link>
              <Link href="#about" className="block py-2 text-gray-700 hover:text-emerald-600 font-medium">
                About
              </Link>
              <Link href="#contact" className="block py-2 text-gray-700 hover:text-emerald-600 font-medium">
                Contact
              </Link>
              <div className="pt-3 border-t border-gray-100 space-y-3">
                <Link
                  href="/auth/login"
                  className="block py-2 text-gray-700 font-semibold"
                >
                  Staff Login
                </Link>
                <Link
                  href="/dashboard"
                  className="block w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl text-center"
                >
                  Access Dashboard
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              radial-gradient(circle at 25px 25px, rgba(255,255,255,0.1) 2px, transparent 0),
              radial-gradient(circle at 75px 75px, rgba(255,255,255,0.05) 1px, transparent 0)
            `,
            backgroundSize: '100px 100px, 50px 50px'
          }}></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-orange-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-cyan-400/20 rounded-full blur-xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-3 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 shadow-lg w-fit">
                  <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
                  <span className="text-white/90 font-semibold text-sm">Enterprise ERP Solution</span>
                </div>

                <h1 className="text-5xl lg:text-6xl font-black text-white leading-tight">
                  Petroleum
                  <span className="block">
                    <span className="text-orange-300">Distribution</span>
                  </span>
                  <span className="block">Management System</span>
                </h1>

                <p className="text-xl text-white/90 font-medium leading-relaxed max-w-2xl">
                  Streamline your petroleum operations with our comprehensive ERP solution.
                  Manage inventory, distribution, financials, and customer relationships from a single, powerful platform.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/dashboard"
                  className="group flex items-center justify-center space-x-3 px-8 py-4 bg-white text-emerald-600 font-bold text-lg rounded-2xl hover:bg-gray-50 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <button className="group flex items-center justify-center space-x-3 px-8 py-4 bg-white/20 backdrop-blur-sm border border-white/30 text-white font-bold text-lg rounded-2xl hover:bg-white/30 transition-all duration-300">
                  <Play className="w-5 h-5" />
                  <span>Watch Demo</span>
                </button>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/20">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-black text-white mb-1">{stat.number}</div>
                    <div className="text-white/80 font-semibold text-sm mb-1">{stat.label}</div>
                    <div className="text-white/60 text-xs">{stat.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Element */}
            <div className="relative">
              <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
                {/* Mock Dashboard Preview */}
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-bold text-lg">Dashboard Preview</h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="text-white/80 text-sm">Live</span>
                    </div>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Total Revenue', value: '₦245M', trend: '+12%' },
                      { label: 'Active Orders', value: '1,247', trend: '+8%' },
                      { label: 'Inventory Health', value: '94%', trend: '+3%' },
                      { label: 'Customer Growth', value: '892', trend: '+15%' }
                    ].map((item, index) => (
                      <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                        <div className="text-white/70 text-xs font-medium mb-1">{item.label}</div>
                        <div className="text-white font-bold text-lg mb-1">{item.value}</div>
                        <div className="text-green-300 text-xs font-semibold">{item.trend}</div>
                      </div>
                    ))}
                  </div>

                  {/* Chart Preview */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-medium text-sm">Revenue Trend</span>
                      <TrendingUp className="w-4 h-4 text-green-300" />
                    </div>
                    <div className="h-20 flex items-end space-x-2">
                      {[40, 65, 45, 80, 60, 90, 75].map((height, index) => (
                        <div
                          key={index}
                          className="flex-1 bg-gradient-to-t from-green-400 to-cyan-400 rounded-t"
                          style={{ height: `${height}%` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span className="text-emerald-600 font-bold text-sm uppercase tracking-wider">Our Services</span>
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
            </div>
            <h2 className="text-4xl font-black text-gray-900 mb-6">
              Comprehensive ERP Solutions for
              <span className="block text-emerald-600">Petroleum Distribution</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Transform your business operations with our integrated platform designed specifically
              for petroleum distribution companies and retail networks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon
              return (
                <div key={index} className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 border border-gray-100 overflow-hidden">
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

                  <div className="relative">
                    {/* Icon */}
                    <div className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-emerald-600 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {service.description}
                    </p>

                    {/* Features */}
                    <ul className="space-y-2">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                          <span className="text-sm text-gray-600 font-medium">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Arrow */}
                    <div className="mt-6 flex items-center text-emerald-600 font-semibold text-sm">
                      <span>Learn more</span>
                      <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-orange-600 font-bold text-sm uppercase tracking-wider">Platform Features</span>
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            </div>
            <h2 className="text-4xl font-black text-gray-900 mb-6">
              Advanced Features for
              <span className="block text-orange-500">Modern Operations</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Leverage cutting-edge technology to optimize your business processes,
              improve efficiency, and drive sustainable growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="group bg-gray-50 hover:bg-white rounded-2xl p-8 transition-all duration-300 hover:shadow-xl border border-gray-100 hover:border-orange-200">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-gray-900 to-gray-800 relative overflow-hidden">
        {/* Background Pattern */}
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
          <h2 className="text-4xl font-black text-white mb-6">
            Ready to Transform Your Operations?
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Join leading petroleum distribution companies who trust MOFAD ERP
            to power their digital transformation and operational excellence.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold text-lg rounded-2xl hover:from-emerald-700 hover:to-green-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              Start Free Trial
            </Link>
            <Link
              href="#contact"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold text-lg rounded-2xl hover:bg-white/20 transition-all duration-300"
            >
              Schedule Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black">MOFAD</h3>
                  <p className="text-sm text-gray-400">Enterprise ERP</p>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Comprehensive ERP solution for petroleum distribution and retail operations.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-lg font-bold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link href="#features" className="text-gray-400 hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#services" className="text-gray-400 hover:text-white transition-colors">Services</Link></li>
                <li><Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-lg font-bold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link href="#about" className="text-gray-400 hover:text-white transition-colors">About</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="#contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Support</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-lg font-bold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">API Reference</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Status</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 MOFAD Enterprise ERP. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}