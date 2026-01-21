import Link from 'next/link'

export const metadata = {
  title: 'About — DonorConnect',
  description: 'About DonorConnect and the mission behind it.',
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <div className="font-semibold text-foreground">DonorConnect</div>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/" className="rounded-full border border-border bg-muted px-3 py-1 text-foreground hover:bg-muted/80">Home</Link>
            <Link href="/ai-policy" className="rounded-full border border-border bg-muted px-3 py-1 text-foreground hover:bg-muted/80">AI Policy</Link>
            <Link href="/about" className="rounded-full border border-border bg-muted px-3 py-1 text-foreground hover:bg-muted/80">About</Link>
            <Link href="/why-donorconnect" className="rounded-full border border-border bg-muted px-3 py-1 text-foreground hover:bg-muted/80">Why DonorConnect</Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-16 space-y-8">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-foreground">About DonorConnect</h1>
          <p className="text-muted-foreground">
            DonorConnect is built to help nonprofits improve donor retention—especially the critical first-to-second gift conversion.
          </p>
        </div>

        <div className="grid gap-4">
          <section className="rounded-lg border border-border bg-card p-6 space-y-2">
            <h2 className="text-base font-semibold text-foreground">Problem explained in your own words</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              After a donor’s first gift, the next best follow-up often isn’t clear. Staff may have the data (donations, campaigns, notes),
              but it’s spread across tools or buried in reports. That makes follow-up inconsistent, and first-time donors can slip through.
            </p>
          </section>

          <section className="rounded-lg border border-border bg-card p-6 space-y-2">
            <h2 className="text-base font-semibold text-foreground">Why this problem matters for nonprofits</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Donor retention is one of the biggest levers for sustainable fundraising. Improving follow-up helps organizations raise more
              from the same community, reduce the cost of constantly acquiring new donors, and plan programs with more confidence.
            </p>
          </section>

          <section className="rounded-lg border border-border bg-card p-6 space-y-2">
            <h2 className="text-base font-semibold text-foreground">Who is affected by this problem</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Development directors, fundraisers, and volunteer coordinators are affected most—especially at small and mid-sized nonprofits where
              one person may manage data, communications, and donor stewardship. Donors are affected too when thank-yous and follow-ups are delayed.
            </p>
          </section>

          <section className="rounded-lg border border-border bg-card p-6 space-y-2">
            <h2 className="text-base font-semibold text-foreground">What happens if the problem is not solved</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              First-time donors are less likely to give again, revenue becomes less predictable, and staff spend more time replacing lapsed donors.
              Over time, missed stewardship can weaken relationships and reduce trust.
            </p>
          </section>

          <section className="rounded-lg border border-border bg-card p-6 space-y-2">
            <h2 className="text-base font-semibold text-foreground">One concrete example of why your app is different from existing solutions</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              DonorConnect doesn’t just store donor records—it surfaces retention-focused insights (like a donor’s risk level) and campaign trends
              so staff can quickly decide what to do next based on recent donation activity, instead of digging through spreadsheets or reports.
            </p>
          </section>
        </div>
      </div>

      <Link
        href="/login"
        className="fixed bottom-6 right-6 inline-flex items-center justify-center rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-teal-500"
        aria-label="Get started"
      >
        Get started
      </Link>
    </main>
  )
}
