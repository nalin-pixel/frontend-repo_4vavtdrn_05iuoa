import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Filter, Sparkles } from 'lucide-react'
import Background from './components/Background'
import TaskItem from './components/TaskItem'
import Stats from './components/Stats'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

const spring = {
  type: 'spring',
  stiffness: 400,
  damping: 28,
  mass: 0.8,
}

export default function App() {
  const [tasks, setTasks] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [priority, setPriority] = useState('medium')
  const [search, setSearch] = useState('')

  const inputRef = useRef(null)

  useEffect(() => {
    fetchTasks()
  }, [filter])

  async function fetchTasks() {
    setLoading(true)
    try {
      const url = new URL(`${API_BASE}/api/tasks`)
      if (filter !== 'all') url.searchParams.set('filter', filter)
      const res = await fetch(url.toString())
      const data = await res.json()
      setTasks(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function addTask(e) {
    e.preventDefault()
    if (!text.trim()) return
    const payload = { title: text.trim(), priority }
    setText('')
    try {
      const res = await fetch(`${API_BASE}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const created = await res.json()
      setTasks((prev) => [created, ...prev])
    } catch (e) {
      console.error(e)
    }
  }

  async function toggleTask(t) {
    try {
      const res = await fetch(`${API_BASE}/api/tasks/${t.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !t.completed }),
      })
      const updated = await res.json()
      setTasks((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
    } catch (e) { console.error(e) }
  }

  async function deleteTask(t) {
    try {
      await fetch(`${API_BASE}/api/tasks/${t.id}`, { method: 'DELETE' })
      setTasks((prev) => prev.filter((x) => x.id !== t.id))
    } catch (e) { console.error(e) }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return tasks.filter((t) => !q || t.title.toLowerCase().includes(q) || (t.notes || '').toLowerCase().includes(q))
  }, [tasks, search])

  const completedCount = tasks.filter((t) => t.completed).length

  return (
    <div className="relative min-h-screen bg-[radial-gradient(1200px_800px_at_10%_-10%,rgba(99,102,241,0.25),transparent),radial-gradient(1200px_800px_at_90%_110%,rgba(236,72,153,0.2),transparent)]">
      <Background />

      {/* Main layout */}
      <div className="relative z-10 mx-auto grid min-h-screen max-w-5xl grid-rows-[auto,1fr] gap-6 px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        {/* Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
          className="relative overflow-hidden rounded-3xl border border-white/25 bg-white/10 p-6 backdrop-blur-2xl shadow-[0_10px_60px_rgba(0,0,0,0.25)]"
          style={{
            backgroundImage:
              'linear-gradient(180deg, rgba(255,255,255,0.1), rgba(255,255,255,0.04))',
          }}
        >
          {/* Reflection */}
          <div className="pointer-events-none absolute inset-x-0 -top-24 h-48 bg-gradient-to-b from-white/30 via-white/10 to-transparent" />

          <div className="relative z-10 grid items-start gap-4 sm:grid-cols-[1fr,auto]">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90 ring-1 ring-white/30">
                <Sparkles className="h-3.5 w-3.5" /> Luxury Tasks
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Your day, designed to delight</h1>
              <p className="mt-1 max-w-prose text-sm text-white/80">A premium, glassmorphic task manager with fluid animations and satisfying micro-interactions.</p>
            </div>

            <form onSubmit={addTask} className="relative mt-2 flex items-center gap-2">
              <div className="group relative w-full sm:w-80">
                <input
                  ref={inputRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Add a task you’ll be proud to complete"
                  className="peer w-full rounded-2xl border border-white/25 bg-white/10 px-4 py-3 pr-24 text-white placeholder-white/50 outline-none backdrop-blur-xl ring-0 transition-all focus:border-white/40 focus:bg-white/15"
                />
                <label className="pointer-events-none absolute -top-2 left-3 inline-flex -translate-y-1/2 items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/80 opacity-0 ring-1 ring-white/30 transition-all peer-focus:opacity-100">
                  Task
                </label>
                <div className="pointer-events-none absolute inset-y-0 right-2 grid place-items-center text-white/70">
                  <Plus className="h-5 w-5" />
                </div>
              </div>
              <div className="relative">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="rounded-2xl border border-white/25 bg-white/10 px-3 py-3 pr-8 text-[13px] text-white backdrop-blur-xl"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-white/60">⌄</div>
              </div>
              <motion.button
                type="submit"
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                className="relative inline-flex items-center gap-2 overflow-hidden rounded-2xl border border-white/30 bg-gradient-to-br from-violet-500 to-fuchsia-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(139,92,246,0.4)]"
              >
                <span className="relative z-10">Add</span>
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 transition-opacity hover:opacity-100" />
              </motion.button>
            </form>
          </div>

          <div className="mt-4 grid items-center gap-3 sm:grid-cols-[1fr,auto]">
            <Stats total={tasks.length} completed={completedCount} />
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tasks..."
                className="w-full rounded-2xl border border-white/25 bg-white/10 py-2 pl-9 pr-4 text-sm text-white placeholder-white/60 backdrop-blur-xl sm:w-64"
              />
            </div>
            <div className="flex items-center gap-2">
              {['all','active','completed'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-full px-3 py-2 text-xs font-medium uppercase tracking-wide text-white/80 ring-1 ring-white/20 transition ${filter === f ? 'bg-white/20' : 'bg-white/10 hover:bg-white/15'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Task list */}
        <div className="grid gap-3">
          {loading ? (
            <div className="grid gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-2xl bg-white/10" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="grid place-items-center rounded-3xl border border-white/20 bg-white/10 p-12 text-center text-white/80 backdrop-blur-xl">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-3 opacity-80"><path d="M8 9h8M8 13h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><rect x="3" y="4" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" opacity=".7"/></svg>
              <div className="text-lg font-medium">Elegant calm.</div>
              <p className="text-sm">Add your first task and feel the flow.</p>
            </div>
          ) : (
            <ul className="grid gap-3">
              <AnimatePresence initial={false}>
                {filtered.map((t) => (
                  <TaskItem key={t.id} task={t} onToggle={toggleTask} onDelete={deleteTask} />
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
