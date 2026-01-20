import Link from 'next/link'

export const metadata = {
  title: 'Why DonorConnect',
  description: 'Why donor retention matters and how DonorConnect helps.',
}

export default function WhyDonorConnectPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <div className="font-semibold text-gray-900">DonorConnect</div>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/" className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-gray-800 hover:bg-gray-100">Home</Link>
            <Link href="/ai-policy" className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-gray-800 hover:bg-gray-100">AI Policy</Link>
            <Link href="/about" className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-gray-800 hover:bg-gray-100">About</Link>
            <Link href="/why-donorconnect" className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-gray-800 hover:bg-gray-100">Why DonorConnect</Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-16 space-y-8">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-gray-900">Why DonorConnect</h1>
          <p className="text-gray-700">A quick overview of what DonorConnect is and how it works.</p>
        </div>

        <div className="grid gap-4">
          <section className="rounded-lg border border-gray-200 bg-white p-6 space-y-2">
            <h2 className="text-base font-semibold text-gray-900">Your solution idea (what your app does and why)</h2>
            <p className="text-sm leading-6 text-gray-700">
              DonorConnect is a donor retention platform that helps nonprofits follow up consistently after donations—especially after a first gift.
              It centralizes donor profiles and donation history so staff can quickly see what happened recently and who needs attention.
              The goal is to reduce missed gratitude moments, make outreach easier to prioritize, and turn scattered data into clear next steps.
            </p>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-6 space-y-2">
            <h2 className="text-base font-semibold text-gray-900">Key features and why you chose them</h2>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
              <li><span className="font-medium">Donor profiles + donation history:</span> makes it easy to see giving patterns and avoid missed follow-ups.</li>
              <li><span className="font-medium">Donation logging:</span> keeps records current so dashboards and donor pages reflect real activity.</li>
              <li><span className="font-medium">Retention risk insights:</span> helps staff prioritize donors who might lapse, using explainable signals from giving history.</li>
              <li><span className="font-medium">Campaign insights:</span> shows which campaigns are trending up/down based on recent totals and gift counts.</li>
              <li><span className="font-medium">Tasks:</span> turns follow-up into trackable work items so nothing slips through the cracks.</li>
              <li><span className="font-medium">Role-based access + organizations:</span> supports teams and keeps each organization’s data isolated.</li>
            </ul>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-6 space-y-2">
            <h2 className="text-base font-semibold text-gray-900">Challenges you expected and how you planned for them</h2>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
              <li><span className="font-medium">Data consistency:</span> I planned to store donors/donations in a structured database (PostgreSQL + Prisma) and keep donor metrics updated.</li>
              <li><span className="font-medium">Multi-user + tenant safety:</span> I used organizations as the tenant boundary so data is always scoped per org.</li>
              <li><span className="font-medium">Authentication:</span> I implemented cookie-based sessions to protect dashboard pages and API routes.</li>
              <li><span className="font-medium">Trustworthy insights:</span> AI features are explainable and human-in-the-loop, and the app falls back to deterministic logic when AI enrichment isn’t available.</li>
              <li><span className="font-medium">Keeping it MVP:</span> I focused on the core workflows (donors, donations, campaigns, tasks) before adding extra polish.</li>
            </ul>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-6 space-y-2">
            <h2 className="text-base font-semibold text-gray-900">Summary of your system (pages + data)</h2>
            <p className="text-sm leading-6 text-gray-700">
              The app includes public pages (Home, About, Why DonorConnect, AI Policy) and a protected dashboard area (Dashboard, Donors, Donations,
              Campaigns, Segments, Workflows, Tasks). Data is stored in PostgreSQL using Prisma models like Organization, User, Donor, Donation,
              Campaign, and Task. Dashboard views are built from Prisma queries (counts, aggregates, and recent activity) and are always filtered
              by the signed-in user’s organization.
            </p>
          </section>
        </div>
      </div>

      <Link
        href="/login"
        className="fixed bottom-6 right-6 inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow"
        aria-label="Get started"
      >
        Get started
      </Link>
    </main>
  )
}
