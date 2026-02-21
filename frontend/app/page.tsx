import Link from 'next/link'
import { AnnouncementsList } from '@/components/AnnouncementsList'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Top Running Announcement Bar */}
      <div className="bg-primary-700 text-white overflow-hidden relative">
        <div className="whitespace-nowrap animate-marquee py-2 text-sm font-medium">
          🚨 Barangay Clearance Processing: 8:00 AM – 5:00 PM | 
          📢 Community Clean-Up Drive this Saturday | 
          📶 Free WiFi Now Available at Barangay Hall | 
          🎉 Upcoming Sr. San Roque Fiesta Celebration | 
          🛠 Road Maintenance Along Juan Sitoy Street | 
          
        </div>
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Barangay Catarman
              </h1>
              <p className="text-sm text-gray-600">Information & Digital Services Portal</p>
            </div>

            <Link
              href="/login"
              className="px-5 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Staff Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-extrabold mb-6 leading-tight">
            Welcome to Barangay Catarman
          </h2>
          <p className="text-xl mb-10 text-primary-100">
            Fast, Secure, and Convenient Barangay Services Online.
          </p>

          <div className="flex flex-wrap justify-center gap-5">
            <Link
              href="/certificate-request"
              className="px-8 py-3 bg-white text-primary-700 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:scale-105"
            >
              Request Certificate
            </Link>

            <Link
              href="/certificate-status"
              className="px-8 py-3 bg-primary-500 text-white rounded-full font-semibold hover:bg-primary-400 transition-all duration-300 shadow-lg hover:scale-105"
            >
              Check Certificate Status
            </Link>

            <Link
              href="/file-complaint"
              className="px-8 py-3 bg-primary-500 text-white rounded-full font-semibold hover:bg-primary-400 transition-all duration-300 shadow-lg hover:scale-105"
            >
              File Complaint
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
          Available Services
        </h2>

        <div className="grid md:grid-cols-4 gap-8">
          {[
            {
              title: 'Certificate Requests',
              desc: 'Request barangay certificates online and track status easily.',
              link: '/certificate-request',
            },
            {
              title: 'File a Complaint',
              desc: 'Report concerns securely and confidentially.',
              link: '/file-complaint',
            },
            {
              title: 'View Status',
              desc: 'Track your certificate request using your reference number.',
              link: '/certificate-status',
            },
            {
              title: 'Announcements',
              desc: 'Stay updated with events and important information.',
              link: '#announcements',
            },
          ].map((service, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition duration-300 hover:-translate-y-2"
            >
              <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
              <p className="text-gray-600 mb-4">{service.desc}</p>
              <Link
                href={service.link}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Learn More →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Announcements Section */}
      <section
        id="announcements"
        className="bg-gray-100 py-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-red-900 mb-10 text-center">
           Latest Announcements 
          </h2>
          <AnnouncementsList />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>
            © {new Date().getFullYear()} Barangay Catarman Information System.
            All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}