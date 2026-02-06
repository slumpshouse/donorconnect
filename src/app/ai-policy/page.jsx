import Link from 'next/link'

export const metadata = {
  title: 'AI Policy & Safeguards — DonorConnect',
  description: 'How DonorConnect uses AI and the safeguards in place.',
}

export default function AiPolicyPage() {
  const systemFont = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'

  return (
    <main className="min-h-screen bg-background text-foreground" style={{ fontFamily: systemFont }}>
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
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: systemFont }}>AI Policy &amp; Safeguards</h1>
        <p className="mt-3 text-muted-foreground">This page documents how AI is used in DonorConnect and the safeguards in place.</p>

        <div className="mt-10 grid gap-4">
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-foreground" style={{ fontFamily: systemFont }}>Short explanation of how you’re using AI responsibly</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              In DonorConnect, AI is used to assist staff with donor outreach by generating draft messages (email or call scripts) that staff can review and send.
              The app does not automatically contact donors, change records, or complete tasks.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              The Campaign Insights on the Dashboard (trending up/down and “what to do next”) are generated from donation totals and gift counts using deterministic calculations.
              They do not call an external AI model.
            </p>
            <ul className="mt-3 list-disc pl-5 text-sm text-muted-foreground space-y-2">
              <li><span className="font-medium text-foreground">Human-in-the-loop:</span> staff review every draft and decide what to send (or not send).</li>
              <li><span className="font-medium text-foreground">Non-automated actions:</span> AI outputs are drafts and suggestions only—no outreach is sent automatically.</li>
              <li><span className="font-medium text-foreground">Access control:</span> only signed-in staff/admin users can generate drafts.</li>
              <li><span className="font-medium text-foreground">Data minimization:</span> the AI request uses only the donor’s name + email, totals (total gifts/amount), last gift date, and the last 3 donations (date/amount/campaign).</li>
              <li><span className="font-medium text-foreground">Prompt constraints:</span> prompts instruct the model to avoid inventing facts, avoid sensitive inferences, and avoid mentioning internal risk scores.</li>
              <li><span className="font-medium text-foreground">Transparency + fail-safe:</span> the UI labels whether a draft was AI-generated or a template fallback, and it falls back to a deterministic template if AI is unavailable.</li>
              <li><span className="font-medium text-foreground">No auto-saving:</span> drafts are generated on demand and shown in the UI for copying; they aren’t automatically written to the database.</li>
            </ul>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-gray-800" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>AI Model used and AI Policy Page</h2>
            <p className="mt-2 text-sm text-gray-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>
              The app can optionally use an external LLM (configured via an API key) to generate outreach drafts in the Donor profile.
              If the API key is missing or the AI request fails, the app shows a safe template-based fallback draft instead.
            </p>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-gray-800" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Explain how you crafted prompts to generate the desired results</h2>
            <ul className="mt-3 list-disc pl-5 text-sm text-gray-600 space-y-2" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>
              <li>I used a system instruction that tells the model to be conservative: don’t invent facts, don’t add personal details, and don’t claim outcomes.</li>
              <li>I send structured, minimal context: donor name + email, totals, last gift date, and the last 3 donations (date/amount/campaign).</li>
              <li>I explicitly tell the model not to mention internal risk scores and to avoid sensitive inferences.</li>
              <li>I require a predictable output format (title + subject/body or call bullets + 3 “next steps”) so the result fits cleanly in the UI.</li>
              <li>I keep the output short and professional (warm, grateful tone) to reduce the chance of hallucinations and keep it usable for staff.</li>
              <li>For Campaign Insights, I didn’t use prompts—those trends are calculated deterministically from donation totals and gift counts.</li>
            </ul>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-gray-800" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>How AI improves your solution</h2>
            <ul className="mt-3 list-disc pl-5 text-sm text-gray-600 space-y-2" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>
              <li>Generates outreach drafts (email or call scripts) so staff can follow up faster and more consistently.</li>
              <li>Provides a structured “next steps” checklist so staff can log the interaction and schedule follow-ups.</li>
              <li>Keeps staff in control: drafts are reviewable, editable, and never sent automatically.</li>
              <li>Adds Campaign Insights on the Dashboard (trending up/down + next steps) so staff can adjust fundraising strategy using recent results—without relying on an AI model.</li>
            </ul>
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
