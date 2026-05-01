import Link from 'next/link';
import brgyhall from '@/images/brgyhall.png';

const missionItems = [
  {
    title: 'Vision',
    body: 'A progressive, safe, and sustainable Barangay Catarman with empowered citizens.',
  },
  {
    title: 'Mission',
    body: 'To deliver efficient services, ensure peace, promote livelihood, and protect the environment through good governance.',
  },
  {
    title: 'Goals',
    body: 'Strengthen governance, safety, economy, health, environment, and education.',
  },
  {
    title: 'Objectives',
    body: 'Provide transparent leadership, enhance security, create livelihood programs, improve health services, protect nature, and support education.',
  },
];

function MonoIcon({ path }: { path: string }) {
  return (
    <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-slate-700 bg-slate-900/70 text-slate-100">
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
      </svg>
    </span>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-sm font-bold text-slate-100">
              BC
            </div>
            <div>
              <p className="text-lg font-bold text-white">Barangay Catarman</p>
              <p className="text-[11px] uppercase tracking-wider text-slate-400">Digital Services Portal</p>
            </div>
          </div>
          <Link
            href="/announcements"
            className="inline-flex items-center gap-2 rounded-full border border-slate-600 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4a2 2 0 0 1-.6-1.4V10a6 6 0 1 0-12 0v4.2c0 .53-.21 1.04-.59 1.41L4 17h5m6 0a3 3 0 1 1-6 0m6 0H9" />
            </svg>
            View Announcements
          </Link>
        </div>
      </header>

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
        <div className="absolute inset-0 bg-slate-950/75" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-200">
              Services Available 8:00 AM - 5:00 PM
            </p>
            <h1 className="mt-6 text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
              Barangay Catarman Information System
            </h1>
            <p className="mt-5 text-base leading-7 text-slate-300 sm:text-lg">
              Access document requests, report incidents, and track updates quickly through a single modern portal.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <Link
                href="/certificate-request"
                className="inline-flex w-full items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
              >
                Request Document
              </Link>
              <Link
                href="/track-status"
                className="inline-flex w-full items-center justify-center rounded-xl border border-slate-500 bg-slate-900/85 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Track Status
              </Link>
              <Link
                href="/file-complaint"
                className="inline-flex w-full items-center justify-center rounded-xl border border-slate-500 bg-slate-900/85 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Submit Report/Incident
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              title: 'Request Document',
              desc: 'Apply for barangay documents with guided online forms and attachments.',
              link: '/certificate-request',
              icon: 'M4 5h16M4 12h16M4 19h10',
            },
            {
              title: 'Track Status',
              desc: 'Check whether your document or report is pending, approved, flagged, or released.',
              link: '/track-status',
              icon: 'M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm0-11v4l3 2',
            },
            {
              title: 'Submit Report/Incident',
              desc: 'File complaints or incident reports privately and securely with photo evidence.',
              link: '/file-complaint',
              icon: 'M10.3 3.3 1.8 18a2 2 0 0 0 1.7 3h16.9a2 2 0 0 0 1.7-3L13.7 3.3a2 2 0 0 0-3.4 0ZM12 9v4m0 4h.01',
            },
          ].map((item) => (
            <Link
              key={item.title}
              href={item.link}
              className="group rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-900"
            >
              <MonoIcon path={item.icon} />
              <h3 className="mt-4 text-xl font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-800 bg-slate-900/40 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Vision, Mission, Goals, and Objectives</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-400 sm:text-base">
              Our guiding principles for a safer, stronger, and more progressive Barangay Catarman.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {missionItems.map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
                <div className="mb-4 flex items-center gap-3">
                  <MonoIcon path="M12 17.3 18.2 21l-1.7-7L22 9.2l-7.2-.6L12 2 9.2 8.6 2 9.2 7.5 14 5.8 21z" />
                  <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                </div>
                <p className="text-sm leading-7 text-slate-300">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-800 bg-slate-950 py-10 text-slate-300">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <p className="text-sm">© {new Date().getFullYear()} Barangay Catarman Information System</p>
          <p className="mt-1 text-xs text-slate-500">Developed by Zer0ne from BSIT 3D</p>
          <Link
            href="/login"
            className="mt-5 inline-flex items-center justify-center rounded-full border border-slate-600 bg-slate-900 px-6 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
          >
            Staff Portal
          </Link>
        </div>
      </footer>
    </div>
  );
}
