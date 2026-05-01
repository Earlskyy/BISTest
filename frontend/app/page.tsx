import Image from 'next/image'
import Link from 'next/link'
import { AnnouncementsList } from '@/components/AnnouncementsList'
import brgyhall from '@/images/brgyhall.png'

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">

      {/* Top Announcement Bar - Modernized */}
      <div className="bg-slate-900 text-slate-100 overflow-hidden relative border-b border-slate-800">
        <div className="flex animate-marquee whitespace-nowrap py-3 text-sm">
          <span className="mx-4 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
            Barangay Clearance: Mon-Fri 8AM-5PM
          </span>
          <span className="mx-4 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
            Community Clean-Up Drive this Saturday
          </span>
          <span className="mx-4 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
            Free WiFi at Barangay Hall
          </span>
          <span className="mx-4 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
            Sr. San Roque Fiesta Coming Soon
          </span>
          <span className="mx-4 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
            Barangay Clearance: Mon-Fri 8AM-5PM
          </span>
          <span className="mx-4 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
            Community Clean-Up Drive this Saturday
          </span>
        </div>
      </div>

      {/* Modern Glassmorphic Header */}
      <header className="bg-slate-950/95 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-sky-500 rounded-xl flex items-center justify-center text-slate-950 font-bold text-xl shadow-lg shadow-cyan-500/20">
                BC
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Barangay Catarman
                </h1>
                <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">
                  Digital Services Portal
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Modern Hero Section with Background Image */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${brgyhall.src})`,
            backgroundSize: 'cover',
            backgroundPosition: 'right center',
            transform: 'scaleX(-1)',
          }}
        />

        <div className="absolute inset-0 bg-slate-950/80" />
        <div className="absolute left-0 top-1/2 h-[520px] w-[640px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_left,rgba(34,211,238,0.24),transparent_45%)] blur-3xl" />
        <div className="absolute left-0 top-0 h-full w-full bg-[radial-gradient(circle_at_top_left,rgba(15,23,42,0.98),transparent_35%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/75 px-4 py-2 text-sm text-slate-200 backdrop-blur">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_0_8px_rgba(34,211,238,0.15)]" />
              Services Available 8AM - 5PM
            </div>

            <h1 className="mt-6 text-5xl sm:text-6xl font-black tracking-tight leading-tight text-white">
              Barangay Catarman Information System
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-300/90 max-w-xl leading-8">
              Experience fast, secure, and convenient barangay services from the comfort of your home.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Population', value: '4,000+', accent: 'bg-cyan-500/10 text-cyan-200' },
                { label: 'Response Rate', value: '98%', accent: 'bg-sky-500/10 text-sky-200' },
                { label: 'Community Trust', value: '99%', accent: 'bg-emerald-500/10 text-emerald-200' },
              ].map((item, index) => (
                <div key={index} className={`rounded-3xl border border-slate-800 p-5 ${item.accent}`}>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-300">{item.label}</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/certificate-request" className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-8 py-4 text-sm font-semibold text-slate-950 shadow-2xl shadow-cyan-500/20 transition hover:shadow-cyan-500/30">
                Start Application
              </Link>
              <Link href="/track-status" className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 px-8 py-4 text-sm font-semibold text-white transition hover:bg-slate-800">
                Check Status
              </Link>
              <Link href="/file-complaint" className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 px-8 py-4 text-sm font-semibold text-white transition hover:bg-slate-800">
                File Report
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Service Hub Quick Actions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: 'Request Certificate',
              desc: 'Start your application with easy online forms.',
              link: '/certificate-request',
              icon: '📄',
              gradient: 'from-cyan-500 to-sky-500',
            },
            {
              title: 'Track Status',
              desc: 'Choose whether to track a document or report.',
              link: '/track-status',
              icon: '📍',
              gradient: 'from-blue-500 to-indigo-500',
            },
            {
              title: 'File Complaint',
              desc: 'Report concerns securely and confidentially.',
              link: '/file-complaint',
              icon: '📢',
              gradient: 'from-emerald-500 to-teal-500',
            },
          ].map((item, index) => (
            <Link
              key={index}
              href={item.link}
              className="group overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900/95 p-8 shadow-[0_28px_80px_-30px_rgba(15,23,42,0.9)] transition hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className={`mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${item.gradient} text-3xl text-white shadow-lg`}>{item.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-slate-400 mb-6">{item.desc}</p>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 transition group-hover:translate-x-1">
                Open
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Modern Services Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Our Services
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
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
              color: 'from-cyan-500 to-sky-500',
            },
            {
              title: 'File Complaint',
              desc: 'Report concerns securely and confidentially.',
              link: '/file-complaint',
              icon: '📢',
              color: 'from-emerald-500 to-teal-500',
            },
            {
              title: 'Track Status',
              desc: 'Monitor your request with your reference number.',
              link: '/track-status',
              icon: '📍',
              color: 'from-blue-500 to-indigo-500',
            },
            {
              title: 'Announcements',
              desc: 'Stay updated with latest barangay news.',
              link: '#announcements',
              icon: '📰',
              color: 'from-fuchsia-500 to-violet-500',
            },
          ].map((service, index) => (
            <Link
              key={index}
              href={service.link}
              className="group relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/95 p-6 shadow-[0_28px_80px_-30px_rgba(15,23,42,0.9)] hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              <div className="relative">
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${service.color} text-white text-2xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {service.icon}
                </div>

                <h3 className="text-xl font-bold text-white mb-2">
                  {service.title}
                </h3>

                <p className="text-slate-400 text-sm mb-4">
                  {service.desc}
                </p>

                <div className="flex items-center text-cyan-300 font-medium text-sm group-hover:gap-2 transition-all duration-300">
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
        <div className="absolute inset-0 bg-slate-950/95" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-slate-900/90 text-cyan-200 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
              Latest Updates
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Barangay Announcements
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Stay informed about important events and updates in our community
            </p>
          </div>

          <div className="bg-slate-900/95 rounded-3xl shadow-[0_30px_80px_-40px_rgba(15,23,42,0.8)] p-8">
            <AnnouncementsList />
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="bg-slate-950 text-slate-300 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex flex-col items-center justify-center gap-3 mb-6 sm:flex-row">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-sky-500 rounded-lg flex items-center justify-center text-slate-950 font-bold">
              BC
            </div>
            <span className="text-xl font-semibold text-white">
              Barangay Catarman
            </span>
          </div>

          <p className="text-sm text-slate-400 mb-2">
            © {new Date().getFullYear()} Barangay Catarman Information System
          </p>

          <p className="text-xs text-slate-500 mb-5">
            Developed by Zer0ne from BSIT 3D
          </p>

          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-2xl shadow-cyan-500/20 transition hover:shadow-cyan-500/30"
          >
            Staff Portal
          </Link>
        </div>
      </footer>
    </div>
  )
}
