import Link from 'next/link'
import { AnnouncementsList } from '@/components/AnnouncementsList'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">

      {/* Top Announcement Bar - Modernized */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white overflow-hidden relative">
        <div className="flex animate-marquee whitespace-nowrap py-3 text-sm">
          <span className="mx-4 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse"></span>
            Barangay Clearance: Mon-Fri 8AM-5PM
          </span>
          <span className="mx-4 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse"></span>
            Community Clean-Up Drive this Saturday
          </span>
          <span className="mx-4 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse"></span>
            Free WiFi at Barangay Hall
          </span>
          <span className="mx-4 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse"></span>
            Sr. San Roque Fiesta Coming Soon
          </span>
          <span className="mx-4 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse"></span>
            Barangay Clearance: Mon-Fri 8AM-5PM
          </span>
          <span className="mx-4 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse"></span>
            Community Clean-Up Drive this Saturday
          </span>
          <span className="mx-4 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse"></span>
            Free WiFi at Barangay Hall
          </span>
          <span className="mx-4 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse"></span>
            Sr. San Roque Fiesta Coming Soon
          </span>
          <span className="mx-4 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse"></span>
            Barangay Clearance: Mon-Fri 8AM-5PM
          </span>
          <span className="mx-4 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse"></span>
            Community Clean-Up Drive this Saturday
          </span>
          <span className="mx-4 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse"></span>
            Free WiFi at Barangay Hall
          </span>
          <span className="mx-4 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse"></span>
            Sr. San Roque Fiesta Coming Soon
          </span>
        </div>
      </div>

      {/* Modern Glassmorphic Header */}
      <header className="bg-white/70 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {/* Logo placeholder - you can add actual logo */}
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                BC
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  Barangay Catarman
                </h1>
                <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">
                  Digital Services Portal
                </p>
              </div>
            </div>

            <Link
              href="/login"
              className="group relative px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-medium overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/25 hover:-translate-y-0.5"
            >
              <span className="relative z-10">Staff Portal</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </div>
        </div>
      </header>

      {/* Modern Hero Section with Animated Background */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500"></div>
        
        {/* Animated background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Services Available 8AM - 5PM
          </div>
          
          <h2 className="text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
            Welcome to
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-200">
              Barangay Catarman
            </span>
          </h2>
          
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
            Experience fast, secure, and convenient barangay services from the comfort of your home.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/certificate-request"
              className="group px-8 py-4 bg-white text-indigo-600 rounded-2xl font-semibold hover:bg-gray-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Request Certificate
            </Link>

            <Link
              href="/certificate-status"
              className="group px-8 py-4 bg-white/20 backdrop-blur-md text-white border-2 border-white/30 rounded-2xl font-semibold hover:bg-white/30 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Track Status
            </Link>

            <Link
              href="/file-complaint"
              className="group px-8 py-4 bg-white/20 backdrop-blur-md text-white border-2 border-white/30 rounded-2xl font-semibold hover:bg-white/30 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              File Complaint
            </Link>
          </div>
        </div>
      </section>

      {/* Modern Services Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Our Services
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Access all barangay services digitally with just a few clicks
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Certificate Requests',
              desc: 'Request barangay certificates online and track status easily.',
              link: '/certificate-request',
              icon: '📄',
              color: 'from-blue-500 to-cyan-500',
            },
            {
              title: 'File Complaint',
              desc: 'Report concerns securely and confidentially.',
              link: '/file-complaint',
              icon: '📢',
              color: 'from-purple-500 to-pink-500',
            },
            {
              title: 'Track Status',
              desc: 'Monitor your request with your reference number.',
              link: '/certificate-status',
              icon: '📍',
              color: 'from-green-500 to-teal-500',
            },
            {
              title: 'Announcements',
              desc: 'Stay updated with latest barangay news.',
              link: '#announcements',
              icon: '📰',
              color: 'from-orange-500 to-red-500',
            },
          ].map((service, index) => (
            <Link
              key={index}
              href={service.link}
              className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
              
              <div className="relative">
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${service.color} text-white text-2xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {service.icon}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {service.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4">
                  {service.desc}
                </p>
                
                <div className="flex items-center text-indigo-600 font-medium text-sm group-hover:gap-2 transition-all duration-300">
                  <span>Learn More</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Modern Announcements Section */}
      <section id="announcements" className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
              Latest Updates
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Barangay Announcements
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Stay informed about important events and updates in our community
            </p>
          </div>
          
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <AnnouncementsList />
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              BC
            </div>
            <span className="text-xl font-semibold text-white">
              Barangay Catarman
            </span>
          </div>
          
          <p className="text-sm text-gray-400 mb-2">
            © {new Date().getFullYear()} Barangay Catarman Information System
          </p>
          <p className="text-xs text-gray-500">
            Powered by Digital Transformation Initiative
          </p>
        </div>
      </footer>
    </div>
  )
}
