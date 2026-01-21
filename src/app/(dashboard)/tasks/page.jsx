"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'
import useDashboardStats from '@/hooks/use-dashboard-stats'
import { Button } from '@/components/ui/button'

export default function TasksPage() {
  const [tasks, setTasks] = useState([])
  const [sortBy, setSortBy] = useState('urgency')
  const { stats } = useDashboardStats()
  const sampleStats = stats?.tasks || { open: 0, dueToday: 0, overdue: 0, completedThisMonth: 0 }

  const listItems = tasks.map((t) => ({ kind: 'task', ...t }))

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/tasks', { credentials: 'same-origin' })
        if (!res.ok) return
        const data = await res.json().catch(() => ({}))
        const list = Array.isArray(data?.tasks) ? data.tasks : []
        if (mounted) setTasks(list)
      } catch (e) {
        // ignore
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  async function toggleComplete(task) {
    const currentStatus = task?.status || 'TODO'
    const nextStatus = currentStatus === 'COMPLETED' ? 'TODO' : 'COMPLETED'

    // optimistic update
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t)))

    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      if (!res.ok) throw new Error('Failed to update task')
      const data = await res.json().catch(() => ({}))
      const updated = data?.task
      if (updated?.id) {
        setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
      }
    } catch (e) {
      // revert on failure
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)))
      window.alert(String(e?.message || e))
    }
  }

  async function deleteTask(id, title) {
    const ok = window.confirm(`Delete task "${title || 'this task'}"? This cannot be undone.`)
    if (!ok) return

    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE', credentials: 'same-origin' })
    } catch (e) {
      // ignore network errors; still remove locally
    }
    setTasks((prev) => prev.filter(t => t.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-teal-700 to-emerald-600 p-10 rounded-lg text-white flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Tasks & Follow-ups</h1>
          <p className="mt-2 text-white/80">Manage your donor engagement and follow-up tasks</p>
        </div>
        <div>
          <Link href="/tasks/new">
            <Button>New Task</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 shadow">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold">{sampleStats.open}</div>
              <div className="text-sm text-muted-foreground uppercase">Open Tasks</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{sampleStats.dueToday}</div>
              <div className="text-sm text-muted-foreground uppercase">Due Today</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{sampleStats.overdue}</div>
              <div className="text-sm text-muted-foreground uppercase">Overdue</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{sampleStats.completedThisMonth}</div>
              <div className="text-sm text-muted-foreground uppercase">Completed This Month</div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <div className="inline-flex items-center gap-2">
                <button onClick={() => setSortBy('urgency')} className={`px-4 py-2 rounded-md ${sortBy === 'urgency' ? 'bg-indigo-600 text-white' : 'bg-muted text-foreground'}`}>
                  🔥 Urgency
                </button>
                <button onClick={() => setSortBy('due')} className={`px-4 py-2 rounded-md ${sortBy === 'due' ? 'bg-indigo-600 text-white' : 'bg-muted text-foreground'}`}>
                  📅 Due Date
                </button>
                <button onClick={() => setSortBy('donor')} className={`px-4 py-2 rounded-md ${sortBy === 'donor' ? 'bg-indigo-600 text-white' : 'bg-muted text-foreground'}`}>
                  👤 Donor Name
                </button>
              </div>
            </div>
            <div>
              <button className="px-4 py-2 bg-card border rounded text-sm text-muted-foreground">Filter</button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {listItems.length ? listItems.map((item) => (
              <div key={item.id} className="bg-card border border-border p-4 rounded-xl shadow flex items-start gap-4">
              <div>
                <input type="checkbox" checked={Boolean(item.status === 'COMPLETED')} onChange={() => toggleComplete(item)} className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-medium">{item.title}</div>
                    <div className="text-sm text-muted-foreground">Assigned to: <span className="font-medium">{item.assignedUser ? `${item.assignedUser.firstName} ${item.assignedUser.lastName}` : (item.assignedTo || '—')}</span></div>
                    <div className="text-sm text-muted-foreground">Donor: <span className="font-medium">{item.donor ? `${item.donor.firstName} ${item.donor.lastName}` : (item.donorId || '—')}</span></div>
                    <div className="text-sm text-muted-foreground mt-1">Due: <span className="font-medium">{item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '—'}</span></div>
                    <div className="text-sm mt-1">Status: <strong>{item.status || 'TODO'}</strong></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`text-sm px-2 py-1 rounded-full ${item.priority === 'High' || item.priority === 'HIGH' || item.priority === 'URGENT' ? 'bg-red-100 text-red-700' : item.priority === 'Medium' || item.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 'bg-muted text-foreground'}`}>{String(item.priority || 'Low')}</div>
                    <div className="flex flex-col gap-2">
                      <button onClick={() => {/* placeholder edit */}} className="px-3 py-1 bg-blue-50 text-blue-700 rounded text-sm">Edit</button>
                      <button onClick={() => toggleComplete(item)} className="px-3 py-1 bg-green-50 text-green-700 rounded text-sm">Complete</button>
                      <button onClick={() => deleteTask(item.id, item.title)} className="px-3 py-1 bg-red-50 text-red-700 rounded text-sm">Delete</button>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mt-2">{item.description}</div>
              </div>
            </div>
          )) : (
            <div className="bg-card border border-border p-6 rounded-xl shadow text-muted-foreground">No tasks found</div>
          )}
        </div>
      </div>
    </div>
  )
}