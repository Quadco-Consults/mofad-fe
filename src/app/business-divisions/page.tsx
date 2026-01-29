'use client'

import PublicNavigation from '@/components/PublicNavigation'
import {
  Building2,
  Zap,
  Settings,
  TrendingUp,
  Shield,
  Users,
  Database,
  BarChart3,
  CheckCircle,
  ArrowRight
} from 'lucide-react'

export default function BusinessDivisions() {
  const divisions = [
    {
      title: "Energy Solutions",
      icon: <Zap className="w-8 h-8" />,
      description: "Comprehensive energy infrastructure development and management solutions for industrial and commercial clients.",
      services: [
        "Power Generation Systems",
        "Energy Efficiency Consulting",
        "Renewable Energy Integration",
        "Grid Infrastructure Development"
      ],
      color: "bg-[#0170B9]"
    },
    {
      title: "ERP Systems",
      icon: <Database className="w-8 h-8" />,
      description: "Enterprise Resource Planning solutions tailored for energy companies and industrial organizations.",
      services: [
        "Custom ERP Development",
        "System Integration",
        "Process Automation",
        "Data Analytics & Reporting"
      ],
      color: "bg-[#059669]"
    },
    {
      title: "Project Management",
      icon: <Settings className="w-8 h-8" />,
      description: "End-to-end project management services for complex energy and infrastructure projects.",
      services: [
        "Project Planning & Execution",
        "Risk Management",
        "Quality Assurance",
        "Stakeholder Coordination"
      ],
      color: "bg-[#DC2626]"
    },
    {
      title: "Business Intelligence",
      icon: <BarChart3 className="w-8 h-8" />,
      description: "Advanced analytics and business intelligence solutions to drive informed decision-making.",
      services: [
        "Data Visualization",
        "Performance Analytics",
        "Predictive Modeling",
        "Strategic Reporting"
      ],
      color: "bg-[#7C3AED]"
    }
  ]

  const capabilities = [
    {
      title: "Technical Expertise",
      description: "Deep technical knowledge in energy systems and enterprise software solutions",
      icon: <Shield className="w-6 h-6 text-[#0170B9]" />
    },
    {
      title: "Industry Experience",
      description: "Extensive experience serving energy sector clients across Nigeria and West Africa",
      icon: <Building2 className="w-6 h-6 text-[#0170B9]" />
    },
    {
      title: "Proven Results",
      description: "Track record of delivering successful projects and measurable business outcomes",
      icon: <TrendingUp className="w-6 h-6 text-[#0170B9]" />
    },
    {
      title: "Client Focus",
      description: "Dedicated to understanding and exceeding client expectations in every engagement",
      icon: <Users className="w-6 h-6 text-[#0170B9]" />
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#0170B9] via-[#015aa0] to-[#014080] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1
              className="text-4xl md:text-5xl font-bold mb-6"
              style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
            >
              Our Business Divisions
            </h1>
            <p
              className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed"
              style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
            >
              Comprehensive solutions across energy, technology, and business intelligence to power your organization&apos;s success
            </p>
          </div>
        </div>
      </section>

      {/* Business Divisions Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-4xl font-bold text-[#3a3a3a] mb-4"
              style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
            >
              Core Service Areas
            </h2>
            <p
              className="text-lg text-[#4B4F58] max-w-3xl mx-auto"
              style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
            >
              We deliver specialized expertise across multiple business divisions to address the complex challenges facing modern energy organizations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {divisions.map((division, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
                <div className="p-8">
                  <div className="flex items-center mb-6">
                    <div className={`${division.color} text-white p-3 rounded-lg mr-4`}>
                      {division.icon}
                    </div>
                    <h3
                      className="text-2xl font-bold text-[#3a3a3a]"
                      style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                    >
                      {division.title}
                    </h3>
                  </div>

                  <p
                    className="text-[#4B4F58] mb-6 leading-relaxed"
                    style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                  >
                    {division.description}
                  </p>

                  <div className="space-y-3">
                    {division.services.map((service, serviceIndex) => (
                      <div key={serviceIndex} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span
                          className="text-[#4B4F58] font-medium"
                          style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                        >
                          {service}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Capabilities */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-4xl font-bold text-[#3a3a3a] mb-4"
              style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
            >
              Our Core Capabilities
            </h2>
            <p
              className="text-lg text-[#4B4F58] max-w-3xl mx-auto"
              style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
            >
              Built on a foundation of expertise, experience, and commitment to excellence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {capabilities.map((capability, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-gray-100">
                <div className="mb-4">
                  {capability.icon}
                </div>
                <h3
                  className="text-xl font-bold text-[#3a3a3a] mb-3"
                  style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                >
                  {capability.title}
                </h3>
                <p
                  className="text-[#4B4F58] leading-relaxed"
                  style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                >
                  {capability.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#0170B9] to-[#015aa0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2
            className="text-3xl md:text-4xl font-bold text-white mb-6"
            style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
          >
            Ready to Partner with MOFAD?
          </h2>
          <p
            className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto"
            style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
          >
            Let&apos;s discuss how our business divisions can contribute to your organization&apos;s growth and success
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              className="px-8 py-4 bg-white text-[#0170B9] font-semibold rounded-sm hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', borderRadius: '2px' }}
            >
              <span>Schedule Consultation</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-sm hover:bg-white hover:text-[#0170B9] transition-all duration-300"
              style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', borderRadius: '2px' }}
            >
              Download Brochure
            </button>
          </div>
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
                Our Services
              </h4>
              <ul className="space-y-2 text-gray-300">
                <li style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>Energy Infrastructure</li>
                <li style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>ERP Solutions</li>
                <li style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>Project Management</li>
                <li style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>Business Intelligence</li>
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