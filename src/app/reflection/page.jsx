import Link from 'next/link'

export const metadata = {
  title: 'Reflection — DonorConnect',
  description: 'Project reflection: what worked, what changed, and what to improve next.',
}

export default function ReflectionPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold text-foreground">Reflection</h1>
        <p className="mt-3 text-muted-foreground">
          This reflection summarizes my experience while adding more onto my app.
        </p>

        <div className="mt-10 grid gap-4">
          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="text-base font-semibold text-foreground">What went well</h2>
            <ul className="mt-3 list-disc pl-5 text-sm text-muted-foreground space-y-2">
              <li>I think creating the rubric evidence and reflection pages went well. The CSS looked fine as it was, and it wasn’t hard to decide what content to include on those pages.</li>
            </ul>
          </section>

          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="text-base font-semibold text-foreground">What was challenging</h2>
            <ul className="mt-3 list-disc pl-5 text-sm text-muted-foreground space-y-2">
              <li>The CSS was challenging because after making the Home, About, and Why DonorConnect pages, I realized the design looked bland. It was hard to make the pages look good and match the rest of the app..</li>
            </ul>
          </section>

          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="text-base font-semibold text-foreground">What you learned about building real products</h2>
            <ul className="mt-3 list-disc pl-5 text-sm text-muted-foreground space-y-2">
              <li>
                I learned that building real products involve agreements and explainations, depending on what youre doing in that app. 
              </li>
            </ul>
          </section>

          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="text-base font-semibold text-foreground">How AI helped (or where it didn’t)</h2>
            <ul className="mt-3 list-disc pl-5 text-sm text-muted-foreground space-y-2">
              <li> I used AI to get ideas for how to integrate AI into my app. I started by explaining my app and its features to give ChatGPT context, then asked how AI could be integrated into it.</li>
            </ul>
          </section>
        </div>

        <div className="mt-10 flex gap-3">
         
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
