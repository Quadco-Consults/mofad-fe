'use client'

import PublicNavigation from '@/components/PublicNavigation'
import Link from 'next/link'
import {
  Target,
  Award,
  TrendingUp,
  Building2,
  Users,
  Shield,
  CheckCircle,
  Activity,
  ArrowRight
} from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNavigation />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 to-blue-800 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              radial-gradient(circle at 25px 25px, rgba(255,255,255,0.1) 2px, transparent 0),
              radial-gradient(circle at 75px 75px, rgba(255,255,255,0.05) 1px, transparent 0)
            `,
            backgroundSize: '100px 100px, 50px 50px'
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-40">
          <div className="text-center">
            <h1 className="text-5xl lg:text-6xl font-black text-white leading-tight mb-6" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
              About <span className="text-orange-300">MOFAD Energy Solutions</span>
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '15px' }}>
              Nigeria&apos;s leading distributor of synthetic and mineral lubricants, built on a foundation of integrity,
              trust, and unwavering commitment to excellence in the oil and gas industry.
            </p>
          </div>
        </div>
      </section>

      {/* Mission, Vision & Goals Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-3 h-3 bg-[#0170B9] rounded-full"></div>
              <span className="text-[#0170B9] font-bold text-sm uppercase tracking-wider" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '15px' }}>Our Foundation</span>
              <div className="w-3 h-3 bg-[#0170B9] rounded-full"></div>
            </div>
            <h2 className="text-4xl font-black text-[#3a3a3a] mb-6" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
              Mission, Vision & Goals for
              <span className="block text-[#0170B9]">West Africa&apos;s Energy Future</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-[#3a3a3a] mb-4 flex items-center" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                  <Target className="w-6 h-6 text-[#0170B9] mr-3" />
                  Our Mission
                </h3>
                <p className="text-[#4B4F58] leading-relaxed text-lg" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '15px' }}>
                  To provide oil and natural gas products to the Nigerian and West African Oil and Gas Markets
                  through our innovations and development using best practices that provide sustainable business growth.
                </p>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-[#3a3a3a] mb-4 flex items-center" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                  <Award className="w-6 h-6 text-emerald-600 mr-3" />
                  Our Vision
                </h3>
                <p className="text-[#4B4F58] leading-relaxed text-lg" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '15px' }}>
                  To be an independent oil and gas company in Nigeria through Innovation and optimization.
                  We aim to keep our values as a standard and create strong financial returns for our shareholders,
                  employees, and partners by continually improving our operational and organizational performance.
                  We aim to be the best in the oil and gas industry.
                </p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-[#3a3a3a] mb-4 flex items-center" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                  <TrendingUp className="w-6 h-6 text-orange-600 mr-3" />
                  Our Goals
                </h3>
                <p className="text-[#4B4F58] leading-relaxed text-lg" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '15px' }}>
                  To offer a reliable, high-quality energy supply that is environmentally friendly and helps to improve
                  the well-being of people, promote the economic and social development of the communities in which we
                  have a presence, create sustainable value for shareholders, employees, customers and suppliers.
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-[#3a3a3a] mb-4 flex items-center" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                  <Building2 className="w-6 h-6 text-purple-600 mr-3" />
                  Our Mandate
                </h3>
                <p className="text-[#4B4F58] leading-relaxed text-lg" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '15px' }}>
                  The culture and principle of MOFAD Energy Solutions Limited is centered around integrity and trust built.
                  This foundational mandate guides every aspect of our operations and relationships.
                </p>
              </div>
            </div>

            <div className="space-y-8">
              {/* MOFAD Image Showcase */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <img
                  src="/mofad 1.jpg"
                  alt="MOFAD Energy Solutions Facility"
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h4 className="font-bold text-[#3a3a3a] mb-3 text-xl" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                    Our Operations
                  </h4>
                  <p className="text-[#4B4F58] leading-relaxed" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '15px' }}>
                    MOFAD Energy Solutions operates state-of-the-art facilities designed to deliver excellence in energy solutions and enterprise resource planning for our clients across Nigeria and West Africa.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-bold text-[#3a3a3a] mb-4 text-center text-xl" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>Relationships</h4>
                <p className="text-[#4B4F58] leading-relaxed" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '15px' }}>
                  At MOFAD Energy we value transparency, open and honest communication between our
                  staff, partners, and Board of directors. This always gives us a head start on all our achievable goals.
                  The relationship between us and our partners have always been very productive mostly due to the high
                  level of professionalism shown by both parties.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-bold text-[#3a3a3a] text-lg mb-3 text-center" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>Experience</h4>
                  <p className="text-[#4B4F58] leading-relaxed" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '15px' }}>
                    We believe the input and actions of our employees are vital to optimizing operations and capitalizing on opportunities.
                    We use our combined insights and perspectives to achieve excellence in operations. We also engage our staff in
                    professional training by exposing them to various workshops and seminars.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-bold text-[#3a3a3a] text-lg mb-3 text-center" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>Integrity</h4>
                  <p className="text-[#4B4F58] leading-relaxed" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '15px' }}>
                    Our team members always do the right thing with respect to safety, business, and protection of the environment.
                    We work to minimize and negate our environmental impact through proper planning and operational diligence.
                    We strongly believe in the reputation of our company as such, each member is trained and tasked to exhibit the
                    highest level of professionalism and adherence to the law.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-bold text-[#3a3a3a] text-lg mb-3 text-center" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>Growth</h4>
                  <p className="text-[#4B4F58] leading-relaxed" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '15px' }}>
                    We encourage an environment of innovation and organizational learning for the continued development of
                    the company and our employees. We believe the need for innovation in our industry goes beyond technology
                    to information management, communication, business practices, and how we build relationships.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-24 bg-[#F5F5F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-black text-[#3a3a3a] mb-6" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                Our <span className="text-[#0170B9]">Success Story</span>
              </h2>
              <div className="space-y-6">
                <p className="text-[#4B4F58] leading-relaxed text-lg" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '15px' }}>
                  At MOFAD, we have an advantage of a motivated team willing to go beyond and above to make sure our clients are happy.
                  Our after-sales services meet all standards - we prefer relationships which we eventually profit from.
                </p>
                <p className="text-[#4B4F58] leading-relaxed text-lg" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '15px' }}>
                  Since inception, MOFAD has grown tremendously in every business year - we have recorded
                  over a hundred percent in profits at close of business. Our engagements with our partners
                  have been mutually beneficial.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-[#3a3a3a] mb-4" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>Our Commitment</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-[#0170B9] mt-1" />
                    <div>
                      <h4 className="font-semibold text-[#3a3a3a]" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>Marketing Excellence</h4>
                      <p className="text-[#4B4F58] text-sm" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '15px' }}>As a marketing company we have pushed our partners&apos; brands, products and services</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-[#0170B9] mt-1" />
                    <div>
                      <h4 className="font-semibold text-[#3a3a3a]" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>Value Guarantee</h4>
                      <p className="text-[#4B4F58] text-sm" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '15px' }}>As you give us an opportunity to participate in business, we guarantee value at every contact</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-[#0170B9] mt-1" />
                    <div>
                      <h4 className="font-semibold text-[#3a3a3a]" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>Mutual Benefits</h4>
                      <p className="text-[#4B4F58] text-sm" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '15px' }}>Building lasting partnerships that create value for all stakeholders</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners & Clients Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-4xl font-bold text-[#3a3a3a] mb-4"
              style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
            >
              Our Strategic <span className="text-[#0170B9]">Partners</span>
            </h2>
            <p
              className="text-lg text-[#4B4F58] max-w-4xl mx-auto"
              style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
            >
              MOFAD Energy Solutions has built strong partnerships with leading organizations across the energy sector,
              financial institutions, and industrial companies throughout Nigeria and West Africa.
            </p>
          </div>

          <div className="mb-12">
            <h3
              className="text-xl font-semibold text-[#3a3a3a] text-center mb-8"
              style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
            >
              Trusted by Industry Leaders
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center h-20">
                <img
                  src="/Nigerian_National_Petroleum_Company_logo.svg.png"
                  alt="Nigerian National Petroleum Company"
                  className="max-w-full max-h-full object-contain opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center h-20">
                <img
                  src="/shell-2020.png"
                  alt="Shell"
                  className="max-w-full max-h-full object-contain opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center h-20">
                <img
                  src="/castrol-logo-png_seeklogo-27069.png"
                  alt="Castrol"
                  className="max-w-full max-h-full object-contain opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center h-20">
                <img
                  src="/eterna logo.png"
                  alt="Eterna"
                  className="max-w-full max-h-full object-contain opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center h-20">
                <img
                  src="/uba logo.png"
                  alt="UBA"
                  className="max-w-full max-h-full object-contain opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#0170B9] rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h4
                className="text-lg font-bold text-[#3a3a3a] mb-2"
                style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
              >
                Energy Sector
              </h4>
              <p
                className="text-[#4B4F58]"
                style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
              >
                Partnerships with major oil and gas companies for lubricant distribution and energy solutions
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#0170B9] rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h4
                className="text-lg font-bold text-[#3a3a3a] mb-2"
                style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
              >
                Financial Services
              </h4>
              <p
                className="text-[#4B4F58]"
                style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
              >
                Strategic financial partnerships enabling business growth and expansion across West Africa
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#0170B9] rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h4
                className="text-lg font-bold text-[#3a3a3a] mb-2"
                style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
              >
                Industrial Clients
              </h4>
              <p
                className="text-[#4B4F58]"
                style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
              >
                Long-term relationships with manufacturing and industrial companies requiring reliable energy solutions
              </p>
            </div>
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
            Ready to Work with Us?
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '15px' }}>
            Experience the MOFAD difference. Join our network of satisfied partners and customers
            across Nigeria and West Africa.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/business-divisions"
              className="px-8 py-4 bg-[#0170B9] text-white font-bold text-lg rounded-sm hover:bg-[#015aa0] transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
              style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '15px', borderRadius: '2px' }}
            >
              Explore Our Services
            </Link>
            <Link
              href="/gallery"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold text-lg rounded-sm hover:bg-white/20 transition-all duration-300"
              style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '15px', borderRadius: '2px' }}
            >
              View Our Work
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

            {/* Company Info */}
            <div>
              <h4 className="text-lg font-bold mb-4 text-[#3a3a3a]" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>Company Values</h4>
              <ul className="space-y-2">
                <li><span className="text-[#4B4F58]" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '15px' }}>Integrity</span></li>
                <li><span className="text-[#4B4F58]" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '15px' }}>Trust</span></li>
                <li><span className="text-[#4B4F58]" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '15px' }}>Innovation</span></li>
                <li><span className="text-[#4B4F58]" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '15px' }}>Excellence</span></li>
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