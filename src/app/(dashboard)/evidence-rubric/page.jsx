import Link from 'next/link'

export const metadata = {
  title: 'Evidence / Rubric — DonorConnect',
  description: 'Evidence of implemented features and how they map to the project rubric.',
}

export default function EvidenceRubricPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Evidence / Rubric</h1>
        <p className="mt-3 text-muted-foreground">
          This page summarizes what is implemented in DonorConnect and where you can see it in the UI.
        </p>
      </div>

      <div className="grid gap-4">
        <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-base font-semibold text-foreground">Direct links</h2>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <a
              href="https://github.com/slumpshouse/donorconnect.git"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-border bg-card p-4 hover:bg-muted"
            >
              <div className="text-sm font-medium text-foreground">GitHub repository</div>
              <div className="mt-1 text-sm text-muted-foreground">Source code for this project.</div>
            </a>
            <a
              href="https://trello.com/invite/b/694029dae306023b4ec7a13f/ATTI7181d72dc9dca10f1a62eefd67aab3da020A9181/bc2-trello-board"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-border bg-card p-4 hover:bg-muted"
            >
              <div className="text-sm font-medium text-foreground">Trello board</div>
              <div className="mt-1 text-sm text-muted-foreground">Project planning and checklist.</div>
            </a>
            <a
              href="https://donorconnect-kappa.vercel.app/"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-border bg-card p-4 hover:bg-muted"
            >
              <div className="text-sm font-medium text-foreground">Vercel</div>
              <div className="mt-1 text-sm text-muted-foreground">Live deployment.</div>
            </a>
            <a
              href="https://excalidraw.com/#json=QPCA95LqNIFJ8zFcvlU9M,1ek4LA-39AunX0Ll1jXBHw"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-border bg-card p-4 hover:bg-muted"
            >
              <div className="text-sm font-medium text-foreground">Wireframe</div>
              <div className="mt-1 text-sm text-muted-foreground">Frame</div>
            </a>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-base font-semibold text-foreground">CCC.1.3 Evidence: Utilize conditionals</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            I can use conditionals to check for and parse through information to determine the output of my program.
          </p>

          <div className="mt-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-md border border-border bg-muted px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/80"
            >
              View where this is used
            </Link>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-base font-semibold text-foreground">TS.6.2 Evidence: Use AI responsibly</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            I can consider bias, ethics, security, and data privacy when using and building AI systems.
          </p>

          <div className="mt-4">
            <Link
              href="/ai-policy"
              className="inline-flex items-center justify-center rounded-md border border-border bg-muted px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/80"
            >
              View where this is used
            </Link>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-base font-semibold text-foreground">TS.6.3 Evidence: Integrate AI tools</h2>
          <p className="mt-3 text-sm text-muted-foreground">
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
