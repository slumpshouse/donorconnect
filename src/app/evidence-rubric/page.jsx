import Link from 'next/link'

export const metadata = {
  title: 'Evidence / Rubric — DonorConnect',
  description: 'Evidence of implemented features and how they map to the project rubric.',
}

export default function EvidenceRubricPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold text-foreground">Evidence / Rubric</h1>
        <p className="mt-3 text-muted-foreground">
          This page summarizes what is implemented in DonorConnect and where you can see it in the UI.
        </p>

        <div className="mt-10 grid gap-4">
          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="text-base font-semibold text-foreground">Direct links</h2>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <a
                href="https://github.com/LaunchPadPhilly/donorconnect-bc2-slumpshouse"
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
              <Link href="/" className="rounded-lg border border-border bg-card p-4 hover:bg-muted">
                <div className="text-sm font-medium text-foreground">Vercel</div>
                <div className="mt-1 text-sm text-muted-foreground">Public landing page.</div>
              </Link>
              <a
                href="https://www.notion.so/Wireframe-2ea1dfdfca6780f08f08e14e5aba693d?source=copy_link"
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-border bg-card p-4 hover:bg-muted"
              >
                <div className="text-sm font-medium text-foreground">Wireframe</div>
                <div className="mt-1 text-sm text-muted-foreground">Product overview.</div>
              </a>
            </div>
          </section>

          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="text-base font-semibold text-foreground">CCC.1.3 Evidence</h2>
            <p className="mt-3 text-sm text-muted-foreground">CCC.1.3 Evidence: Utilize conditionals</p>
            <p className="mt-2 text-sm text-muted-foreground">
              I can use conditionals to check for and parse through information to determine the output of my program.
            </p>
          </section>

          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="text-base font-semibold text-foreground">TS.6.2 Evidence</h2>
            <p className="mt-3 text-sm text-muted-foreground">Add evidence notes/artifacts here.</p>
          </section>

          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="text-base font-semibold text-foreground">TS.6.3 Evidence</h2>
            <p className="mt-3 text-sm text-muted-foreground">Add evidence notes/artifacts here.</p>
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
