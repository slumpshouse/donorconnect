import Link from 'next/link'

export const metadata = {
  title: 'Evidence / Rubric — DonorConnect',
  description: 'Evidence of implemented features and how they map to the project rubric.',
}

export default function EvidenceRubricPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold text-gray-800" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Evidence / Rubric</h1>
        <p className="mt-3 text-base text-gray-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>
          This page summarizes what is implemented in DonorConnect and where you can see it in the UI.
        </p>
      </div>

      <div className="grid gap-4">
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Direct links</h2>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <a
              href="https://github.com/slumpshouse/donorconnect.git"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-gray-200 bg-white p-4 hover:bg-blue-50"
            >
              <div className="text-sm font-medium text-gray-800" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>GitHub repository</div>
              <div className="mt-1 text-sm text-gray-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Source code for this project.</div>
            </a>
            <a
              href="https://trello.com/invite/b/694029dae306023b4ec7a13f/ATTI7181d72dc9dca10f1a62eefd67aab3da020A9181/bc2-trello-board"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-gray-200 bg-white p-4 hover:bg-blue-50"
            >
              <div className="text-sm font-medium text-gray-800" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Trello board</div>
              <div className="mt-1 text-sm text-gray-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Project planning and checklist.</div>
            </a>
            <a
              href="https://donorconnect-kappa.vercel.app/"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-gray-200 bg-white p-4 hover:bg-blue-50"
            >
              <div className="text-sm font-medium text-gray-800" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Vercel</div>
              <div className="mt-1 text-sm text-gray-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Live deployment.</div>
            </a>
            <a
              href="https://excalidraw.com/#json=QPCA95LqNIFJ8zFcvlU9M,1ek4LA-39AunX0Ll1jXBHw"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-gray-200 bg-white p-4 hover:bg-blue-50"
            >
              <div className="text-sm font-medium text-gray-800" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Wireframe</div>
              <div className="mt-1 text-sm text-gray-600" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Frame</div>
            </a>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>CCC.1.3 Evidence: Utilize conditionals</h2>
          <p className="mt-2 text-sm text-gray-700" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>
            I can use conditionals to check for and parse through information to determine the output of my program.
          </p>

          <div className="mt-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-blue-50"
              style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}
            >
              View where this is used
            </Link>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>TS.6.2 Evidence: Use AI responsibly</h2>
          <p className="mt-3 text-sm text-gray-700" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>
            I can consider bias, ethics, security, and data privacy when using and building AI systems.
          </p>

          <div className="mt-4">
            <Link
              href="/ai-policy"
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-blue-50"
              style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}
            >
              View where this is used
            </Link>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>TS.6.3 Evidence: Integrate AI tools</h2>
          <p className="mt-3 text-sm text-gray-700" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>
            I can use APIs and open-source AI models to create AI-powered solutions.
          </p>

          <div className="mt-4">
            <Link
              href="/tasks"
              className="inline-flex items-center justify-center rounded-md border border-border bg-muted px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/80"
            >
              View where this is used
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
