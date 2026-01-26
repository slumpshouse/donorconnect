// Home page (public). If authenticated, redirect to dashboard.
import Link from 'next/link'
import HomeSessionButton from '@/components/auth/home-session-client'

export default function HomePage() {
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
      <div className="mx-auto max-w-3xl px-6 py-14 sm:py-16">
        <section className="rounded-xl border border-border bg-card p-6 sm:p-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">DonorConnect</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            First-time donors often lapse because follow-up is hard to prioritize and data is scattered.
          </p>
          <p className="mt-2 text-lg text-muted-foreground">
            DonorConnect centralizes donor giving history and highlights retention risk so staff can focus outreach where it matters.
          </p>
        </section>

        <div className="mt-10 grid gap-4">
          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="text-base font-semibold text-foreground">Problem explained in your own words</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Nonprofit teams miss important oversight because donor information and follow-up work are hard to track.
              Thank-you calls can slip through the cracks, simple outreach questions can take hours to answer, and messy data (duplicates
              or inconsistent records) makes it even harder to trust reports.
            </p>
          </section>

          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="text-base font-semibold text-foreground">Why this problem matters for nonprofits</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Missed gratitude and slow follow-up can lead to lost donations and weaker relationships. When teams can’t quickly see who gave,
              when they gave, and what outreach is due, retention suffers and fundraising becomes less predictable.
            </p>
          </section>

          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="text-base font-semibold text-foreground">Who is affected by this problem</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Development directors, fundraisers, and volunteer coordinators are affected most—especially at smaller organizations where one
              person may manage donor data, acknowledgements, and reporting. Donors are affected too when thank-yous are delayed or outreach feels inconsistent.
            </p>
          </section>

          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="text-base font-semibold text-foreground">What happens if the problem is not solved</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Donors are more likely to lapse after the first gift, staff spend extra time cross-referencing spreadsheets, and data issues create
              reporting mistakes or duplicate outreach. Over time, that can damage trust and reduce the organization’s ability to fund its mission.
            </p>
          </section>

          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="text-base font-semibold text-foreground">One concrete example of why your app is different from existing solutions</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              DonorConnect is built around action, not just storage: it highlights retention risk and recent campaign performance on the dashboard
              so staff can quickly spot who needs a thank-you or follow-up and which campaigns are trending up or down—without digging through multiple reports.
            </p>
          </section>
        </div>

        <div className="mt-10">
          {/* Show dashboard link if already authenticated, otherwise show login */}
          <HomeSessionButton />
        </div>
      </div>

      {/* Floating "Get started" button removed (duplicate) */}
    </main>
  )
}
