"use client"
import { useEffect, useState } from 'react'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import useDashboardStats from '@/hooks/use-dashboard-stats'
import { Button } from '@/components/ui/button'

export default function TasksPage() {
  const [tasks, setTasks] = useState([])
  const [sortBy, setSortBy] = useState('urgency')
  const [showFilter, setShowFilter] = useState(false)
  const [filters, setFilters] = useState({ status: 'all', priority: 'all', donor: '' })
  const { stats } = useDashboardStats()
  const sampleStats = stats?.tasks || { open: 0, dueToday: 0, overdue: 0, completedThisMonth: 0 }

  function applyFiltersAndSort(list) {
    let out = Array.isArray(list) ? list.slice() : []

    // Filtering
    if (filters.status && filters.status !== 'all') {
      out = out.filter((t) => (t.status || 'TODO') === filters.status)
    }
    if (filters.priority && filters.priority !== 'all') {
      out = out.filter((t) => String(t.priority || '').toLowerCase() === String(filters.priority || '').toLowerCase())
    }
    if (filters.donor && String(filters.donor).trim() !== '') {
      const q = String(filters.donor).toLowerCase().trim()
      out = out.filter((t) => {
        const name = t.donor ? `${t.donor.firstName || ''} ${t.donor.lastName || ''}` : (t.donorId || '')
        return String(name).toLowerCase().includes(q)
      })
    }

    // Sorting
    out.sort((a, b) => {
      if (sortBy === 'due') {
        const da = a.dueDate ? new Date(a.dueDate).getTime() : 0
        const db = b.dueDate ? new Date(b.dueDate).getTime() : 0
        return da - db
      }
      if (sortBy === 'donor') {
        const na = a.donor ? `${a.donor.firstName || ''} ${a.donor.lastName || ''}` : (a.donorId || '')
        const nb = b.donor ? `${b.donor.firstName || ''} ${b.donor.lastName || ''}` : (b.donorId || '')
        return String(na).localeCompare(String(nb))
      }
      // urgency/priority default: High -> Low
      const score = (p) => {
        const val = String(p || '').toLowerCase()
        if (val === 'high' || val === 'high' || val === 'urgent') return 1
        if (val === 'medium') return 2
        return 3
      }
      return score(a.priority) - score(b.priority)
    })

    return out
  }

  const displayedTasks = applyFiltersAndSort(tasks)
  const listItems = displayedTasks.map((t) => ({ kind: 'task', ...t }))

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/tasks', { credentials: 'same-origin' })
        if (!res.ok) return
        const data = await res.json().catch(() => ({}))
        const list = Array.isArray(data?.tasks) ? data.tasks : []
        // Completed tasks should disappear from the active list.
        const active = list.filter((t) => (t?.status || 'TODO') !== 'COMPLETED')
        if (mounted) setTasks(active)
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
    if (nextStatus === 'COMPLETED') {
      setTasks((prev) => prev.filter((t) => t.id !== task.id))
    } else {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t)))
    }

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
        if ((updated.status || 'TODO') === 'COMPLETED') {
          setTasks((prev) => prev.filter((t) => t.id !== updated.id))
        } else {
          setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
        }
      }
    } catch (e) {
      // revert on failure
      if (nextStatus === 'COMPLETED') {
        setTasks((prev) => (prev.some((t) => t.id === task.id) ? prev : [task, ...prev]))
      } else {
        setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)))
      }
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col items-center justify-center rounded-lg bg-muted/20 p-4 text-center">
              <div className="text-3xl font-bold tabular-nums leading-none">{sampleStats.open}</div>
              <div className="mt-2 text-sm text-muted-foreground uppercase tracking-wide">Open Tasks</div>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg bg-muted/20 p-4 text-center">
              <div className="text-3xl font-bold tabular-nums leading-none">{sampleStats.dueToday}</div>
              <div className="mt-2 text-sm text-muted-foreground uppercase tracking-wide">Due Today</div>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg bg-muted/20 p-4 text-center">
              <div className="text-3xl font-bold tabular-nums leading-none">{sampleStats.overdue}</div>
              <div className="mt-2 text-sm text-muted-foreground uppercase tracking-wide">Overdue</div>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg bg-muted/20 p-4 text-center">
              <div className="text-3xl font-bold tabular-nums leading-none">{sampleStats.completedThisMonth}</div>
              <div className="mt-2 text-sm text-muted-foreground uppercase tracking-wide">Completed This Month</div>
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
              <button onClick={() => setShowFilter((s) => !s)} className="px-4 py-2 bg-card border rounded text-sm text-muted-foreground">Filter</button>
            </div>
          </div>
          {showFilter && (
            <div className="mt-4 p-4 bg-muted/10 border border-border rounded">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-sm text-muted-foreground block mb-1">Status</label>
                  <select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))} className="w-full p-2 rounded border bg-card">
                    <option value="all">All</option>
                    <option value="TODO">TODO</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground block mb-1">Priority</label>
                  <select value={filters.priority} onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))} className="w-full p-2 rounded border bg-card">
                    <option value="all">All</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-muted-foreground block mb-1">Donor</label>
                  <div className="flex gap-2">
                    <input value={filters.donor} onChange={(e) => setFilters((f) => ({ ...f, donor: e.target.value }))} placeholder="Search donor name or id" className="flex-1 p-2 rounded border bg-card" />
                    <button onClick={() => setFilters({ status: 'all', priority: 'all', donor: '' })} className="px-3 py-2 bg-card border rounded text-sm text-muted-foreground">Clear</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {listItems.length ? listItems.map((item) => (
              <div key={item.id} className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm flex items-start gap-6">
                <div className="pt-1">
                  <input type="checkbox" checked={Boolean(item.status === 'COMPLETED')} onChange={() => toggleComplete(item)} className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <div className="text-xl font-semibold text-gray-900 truncate">{item.title}</div>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                        <div>Assigned to: <span className="font-medium text-gray-900">{item.assignedUser ? `${item.assignedUser.firstName} ${item.assignedUser.lastName}` : (item.assignedTo || '—')}</span></div>
                        <div>Donor: <span className="font-medium text-gray-900">{item.donor ? `${item.donor.firstName} ${item.donor.lastName}` : '—'}</span></div>
                        <div>Due: <span className="font-medium text-gray-900">{item.dueDate ? formatDate(item.dueDate) : '—'}</span></div>
                      </div>
                      <div className="mt-3 text-sm text-gray-700">{item.description}</div>
                    </div>
                    <div className="ml-4 flex flex-col items-end gap-2">
                      <button onClick={() => {/* placeholder edit */}} className="px-3 py-1 bg-white border border-gray-200 text-sm rounded text-blue-600">Edit</button>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${String(item.priority).toLowerCase().startsWith('h') ? 'bg-red-100 text-red-700' : String(item.priority).toLowerCase().startsWith('m') ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-800'}`}>{String(item.priority || 'LOW')}</span>
                        <button onClick={() => toggleComplete(item)} className="px-3 py-1 bg-green-50 text-green-700 rounded text-sm">Complete</button>
                        <button onClick={() => deleteTask(item.id, item.title)} className="px-3 py-1 bg-red-50 text-red-700 rounded text-sm">Delete</button>
                      </div>
                    </div>
                  </div>
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