import Link from 'next/link'

export const metadata = {
  title: 'About — DonorConnect',
  description: 'About DonorConnect and the mission behind it.',
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gray-50" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <div className="font-semibold text-gray-800">DonorConnect</div>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/" className="rounded-lg border border-gray-200 bg-white px-3 py-1 hover:bg-blue-50" style={{color: '#5B9FDF'}}>Home</Link>
            <Link href="/ai-policy" className="rounded-lg border border-gray-200 bg-white px-3 py-1 hover:bg-blue-50" style={{color: '#5B9FDF'}}>AI Policy</Link>
            <Link href="/about" className="rounded-lg border border-gray-200 bg-white px-3 py-1 hover:bg-blue-50" style={{color: '#5B9FDF'}}>About</Link>
            <Link href="/why-donorconnect" className="rounded-lg border border-gray-200 bg-white px-3 py-1 hover:bg-blue-50" style={{color: '#5B9FDF'}}>Why DonorConnect</Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-16 space-y-8">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-gray-800" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>About DonorConnect</h1>
          <p className="text-base text-gray-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>
            DonorConnect is built to help nonprofits improve donor retention—especially the critical first-to-second gift conversion.
          </p>
        </div>

        <div className="grid gap-4">
          <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-2 shadow-sm">
            <h2 className="text-base font-semibold text-gray-800" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Problem explained in your own words</h2>
            <p className="text-sm leading-6 text-gray-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>
              After a donor’s first gift, the next best follow-up often isn’t clear. Staff may have the data (donations, campaigns, notes),
              but it’s spread across tools or buried in reports. That makes follow-up inconsistent, and first-time donors can slip through.
            </p>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-2 shadow-sm">
            <h2 className="text-base font-semibold text-gray-800" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Why this problem matters for nonprofits</h2>
            <p className="text-sm leading-6 text-gray-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>
              Donor retention is one of the biggest levers for sustainable fundraising. Improving follow-up helps organizations raise more
              from the same community, reduce the cost of constantly acquiring new donors, and plan programs with more confidence.
            </p>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-2 shadow-sm">
            <h2 className="text-base font-semibold text-gray-800" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Who is affected by this problem</h2>
            <p className="text-sm leading-6 text-gray-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>
              Development directors, fundraisers, and volunteer coordinators are affected most—especially at small and mid-sized nonprofits where
              one person may manage data, communications, and donor stewardship. Donors are affected too when thank-yous and follow-ups are delayed.
            </p>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-2 shadow-sm">
            <h2 className="text-base font-semibold text-gray-800" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>What happens if the problem is not solved</h2>
            <p className="text-sm leading-6 text-gray-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>
              First-time donors are less likely to give again, revenue becomes less predictable, and staff spend more time replacing lapsed donors.
              Over time, missed stewardship can weaken relationships and reduce trust.
            </p>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-2 shadow-sm">
            <h2 className="text-base font-semibold text-gray-800" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>One concrete example of why your app is different from existing solutions</h2>
            <p className="text-sm leading-6 text-gray-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>
              DonorConnect doesn’t just store donor records—it surfaces retention-focused insights (like a donor’s risk level) and campaign trends
              so staff can quickly decide what to do next based on recent donation activity, instead of digging through spreadsheets or reports.
            </p>
          </section>
        </div>
      </div>

      <Link
        href="/login"
        className="fixed bottom-6 right-6 inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-medium text-white shadow-lg hover:opacity-90"
        style={{backgroundColor: '#5B9FDF', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}
        aria-label="Get started"
      >
        Get started
      </Link>
    </main>
  )
}
