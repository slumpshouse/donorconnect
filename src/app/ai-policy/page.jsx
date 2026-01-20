import Link from 'next/link'

export const metadata = {
  title: 'AI Policy & Safeguards — DonorConnect',
  description: 'How DonorConnect uses AI and the safeguards in place.',
}

export default function AiPolicyPage() {
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
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900">AI Policy &amp; Safeguards</h1>
        <p className="mt-3 text-gray-700">This page documents how AI is used in DonorConnect and the safeguards in place.</p>

        <div className="mt-10 grid gap-4">
          <section className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="text-base font-semibold text-gray-900">Short explanation of how you’re using AI responsibly</h2>
            <p className="mt-2 text-sm text-gray-700">
              In DonorConnect, AI is used to assist staff with prioritization and decision-making (like retention risk insights),
              but it does not automatically contact donors, change records, or complete tasks.
            </p>
            <p className="mt-2 text-sm text-gray-700">
              The Campaign Insights on the Dashboard (trending up/down and “what to do next”) are generated from donation totals and gift counts
              using deterministic calculations, so organizations get helpful guidance without relying on an external model.
            </p>
            <ul className="mt-3 list-disc pl-5 text-sm text-gray-700 space-y-2">
              <li><span className="font-medium">Human-in-the-loop:</span> staff review insights and decide what to do next.</li>
              <li><span className="font-medium">Non-automated actions:</span> AI outputs are suggestions only—no outreach is sent by AI.</li>
              <li><span className="font-medium">Data minimization:</span> only relevant donation history and basic donor context is used for insights.</li>
              <li><span className="font-medium">Transparency:</span> the app displays a short reason/explanation alongside the insight.</li>
              <li><span className="font-medium">Fail-safe behavior:</span> if optional AI enrichment is unavailable, the app falls back to deterministic rules.</li>
            </ul>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="text-base font-semibold text-gray-900">AI Model used and AI Policy Page</h2>
            <p className="mt-2 text-sm text-gray-700">
              The app can optionally use an LLM via an API key for enrichment, but it primarily relies on deterministic logic.
              This page documents the guardrails and intended use of AI features.
            </p>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="text-base font-semibold text-gray-900">Explain how you crafted prompts to generate the desired results</h2>
            <ul className="mt-3 list-disc pl-5 text-sm text-gray-700 space-y-2">
              <li>I only included the minimum context needed for the insight (donation recency, total gifts, total amount, and basic donor status).</li>
              <li>I asked for a short, structured output (a 1–2 sentence summary + a few bullet “reasons”) so it fits cleanly in the UI.</li>
              <li>I constrained tone and content to stewardship actions (follow-up ideas), not sensitive inferences about the donor.</li>
              <li>I added clear instructions to avoid making claims the data can’t support and to stick to what’s visible in the donor’s giving history.</li>
              <li>For Campaign Insights, I didn’t use prompts—those trends are calculated deterministically from donation totals and gift counts.</li>
            </ul>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="text-base font-semibold text-gray-900">How AI improves your solution</h2>
            <ul className="mt-3 list-disc pl-5 text-sm text-gray-700 space-y-2">
              <li>Highlights donors with higher retention risk so staff can prioritize outreach instead of guessing who needs follow-up.</li>
              <li>Explains “why” (based on donation history and recency) so decisions are faster and more consistent across the team.</li>
              <li>Adds Campaign Insights on the Dashboard (trending up/down + next steps) so staff can adjust fundraising strategy using recent results.</li>
            </ul>
          </section>
        </div>

        <div className="mt-10 flex gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}
