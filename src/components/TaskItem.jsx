import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Trash2, Star } from 'lucide-react'

export default function TaskItem({ task, onToggle, onDelete }) {
  const [pressing, setPressing] = useState(false)
  const rippleRef = useRef(null)

  const priorityColor = {
    low: 'from-emerald-400/20 to-emerald-500/10',
    medium: 'from-amber-400/20 to-amber-500/10',
    high: 'from-rose-400/20 to-rose-500/10',
  }[task.priority || 'medium']

  const handleClick = (e) => {
    // Ripple
    const el = rippleRef.current
    if (!el) return
    const circle = document.createElement('span')
    const diameter = Math.max(el.clientWidth, el.clientHeight)
    const radius = diameter / 2
    circle.style.width = circle.style.height = `${diameter}px`
    circle.style.left = `${e.clientX - el.getBoundingClientRect().left - radius}px`
    circle.style.top = `${e.clientY - el.getBoundingClientRect().top - radius}px`
    circle.className = 'absolute rounded-full bg-white/30 animate-[ripple_600ms_ease-out] pointer-events-none'
    el.appendChild(circle)
    setTimeout(() => circle.remove(), 650)

    onToggle(task)
  }

  return (
    <AnimatePresence>
      <motion.li
        layout
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, x: 60 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        className="relative group"
      >
        <div
          ref={rippleRef}
          onMouseDown={() => setPressing(true)}
          onMouseUp={() => setPressing(false)}
          onClick={handleClick}
          role="button"
          aria-pressed={task.completed}
          className={`relative overflow-hidden w-full cursor-pointer select-none rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl px-4 py-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25)] transition-all ${task.completed ? 'opacity-70' : 'hover:bg-white/15'} ${pressing ? 'scale-[0.995]' : ''}`}
          style={{
            willChange: 'transform, opacity',
            backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02)), radial-gradient(1200px 1200px at -20% -20%, rgba(255,255,255,0.25), rgba(255,255,255,0))`,
          }}
        >
          <div className={`absolute inset-0 bg-gradient-to-r ${priorityColor} opacity-50`} />
          <div className="relative z-10 flex items-start gap-3">
            <div className={`mt-1 grid h-6 w-6 place-items-center rounded-lg border border-white/30 bg-white/10 transition-all ${task.completed ? 'bg-emerald-400/30' : 'group-hover:bg-white/20'}`}>
              <motion.div
                initial={false}
                animate={{ scale: task.completed ? 1 : 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <Check className="h-4 w-4 text-white" />
              </motion.div>
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium tracking-wide ${task.completed ? 'line-through text-white/60' : 'text-white'} `}>
                {task.title}
              </p>
              <div className="mt-1 flex items-center gap-2 text-[11px] text-white/70">
                {task.priority && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5">
                    <Star className="h-3 w-3" /> {task.priority}
                  </span>
                )}
                {task.created_at && (
                  <span>{new Date(task.created_at).toLocaleString()}</span>
                )}
              </div>
            </div>
            <button
              aria-label="Delete task"
              onClick={(e) => { e.stopPropagation(); onDelete(task) }}
              className="rounded-lg border border-white/20 bg-white/10 p-2 opacity-0 transition-all hover:bg-white/20 group-hover:opacity-100"
            >
              <Trash2 className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>
      </motion.li>
    </AnimatePresence>
  )
}

/* ripple keyframes (global injection) */
const style = document.createElement('style')
style.innerHTML = `@keyframes ripple { from { transform: scale(0); opacity: .8 } to { transform: scale(1); opacity: 0 } }`
document.head.appendChild(style)
