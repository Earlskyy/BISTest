import Link from 'next/link'
import { AnnouncementsList } from '@/components/AnnouncementsList'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Barangay Catarman Information System
              </h1>
              <p className="text-sm text-gray-600">Digital Services Portal</p>
            </div>
            <Link
              href="/login"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              Staff Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-4">Welcome to Barangay Catarman</h2>
          <p className="text-xl mb-8">Access government services online</p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/certificate-request"
              className="px-6 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Request Certificate
            </Link>
            <Link
              href="/certificate-status"
              className="px-6 py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-400 transition"
            >
              View Certificate Status
            </Link>
            <Link
              href="/file-complaint"
              className="px-6 py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-400 transition"
            >
              File a Complaint
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Available Services</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-2">Certificate Requests</h3>
            <p className="text-gray-600 mb-4">
              Request barangay certificates online. Upload required documents and track your request status.
            </p>
            <Link
              href="/certificate-request"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Request Now →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-2">File a Complaint</h3>
            <p className="text-gray-600 mb-4">
              Report incidents or concerns to the barangay. Your identity will be kept confidential.
            </p>
            <Link
              href="/file-complaint"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              File Complaint →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-2">View Certificate Status</h3>
            <p className="text-gray-600 mb-4">
              Track your certificate request using the reference number you received.
            </p>
            <Link
              href="/certificate-status"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Check Status →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-2">View Announcements</h3>
            <p className="text-gray-600 mb-4">
              Stay updated with barangay announcements, events, and important information.
            </p>
            <Link
              href="#announcements"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              View All →
            </Link>
          </div>
        </div>
      </section>

      {/* Announcements Section */}
      <section id="announcements" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Latest Announcements</h2>
        <AnnouncementsList />
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center">
            © {new Date().getFullYear()} Barangay Catarman Information System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
