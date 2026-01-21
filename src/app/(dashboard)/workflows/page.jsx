"use client"
import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const templates = [
  { id: 'first-time', title: 'First-time donor journey', description: 'Welcome and onboarding sequence for first-time donors.' },
  { id: 'second-gift', title: 'Second-gift follow-up', description: 'Encourage second gift with timely outreach and incentives.' },
  { id: 'lapsed', title: 'Lapsed donor re-engagement', description: 'Re-engage donors who have not given in 12+ months.' },
  { id: 'major-stewardship', title: 'Major donor stewardship', description: 'Personalized stewardship plan for major donors.' },
  { id: 'event-followup', title: 'Event follow-up', description: 'Post-event communications and thank-you sequences.' },
]

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = React.useState([
    {
      id: 'wf-donation-thankyou',
      name: 'Donation Thank-you',
      trigger: 'Donation received',
      conditions: ['Amount > $0'],
      actions: ['Send thank-you email', 'Add donor to recent-donors segment'],
      active: true,
    },
    {
      id: 'wf-new-donor-task',
      name: 'New Donor Follow-up',
      trigger: 'New donor created',
      conditions: [],
      actions: ['Create follow-up task for assigned staff'],
      active: true,
    },
    {
      id: 'wf-campaign-report',
      name: 'Campaign End Report',
      trigger: 'Campaign ended',
      conditions: ['Campaign goal reached OR End date passed'],
      actions: ['Generate performance report', 'Email report to team'],
      active: false,
    },
  ])

  function toggleActive(id) {
    setWorkflows((prev) => prev.map((w) => (w.id === id ? { ...w, active: !w.active } : w)))
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-teal-700 to-emerald-600 p-8 rounded-lg text-white flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Automation Workflows</h1>
          <p className="mt-2 text-white/80">Automate thank-yous, follow-ups, and donor journeys</p>
        </div>
        <div className="flex items-center gap-3">
          {/* New Workflow creation removed */}
        </div>
      </div>

      <div>
        {workflows.map((wf) => (
          <div key={wf.id} className="bg-card border border-border p-6 rounded-xl shadow mb-4">
            <div className="flex justify-between">
              <div>
                <h2 className="text-lg font-semibold">{wf.name}</h2>
                <div className="text-sm text-muted-foreground mt-1">Trigger: <span className="font-medium text-foreground">{wf.trigger}</span></div>
                {wf.conditions && wf.conditions.length > 0 && (
                  <div className="text-sm text-muted-foreground mt-2">Conditions: {wf.conditions.join('; ')}</div>
                )}

                <div className="mt-3">
                  <div className="text-sm text-muted-foreground">Actions:</div>
                  <ul className="list-disc ml-5 text-sm text-muted-foreground mt-1">
                    {wf.actions.map((a, i) => <li key={i}>{a}</li>)}
                  </ul>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${wf.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  {wf.active ? 'Active' : 'Inactive'}
                </div>
                <div className="flex gap-2">
                  <Link href={`/workflows/${wf.id}`}>
                    <Button variant="secondary">Edit</Button>
                  </Link>
                  <Button onClick={() => toggleActive(wf.id)}>{wf.active ? 'Turn Off' : 'Turn On'}</Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}