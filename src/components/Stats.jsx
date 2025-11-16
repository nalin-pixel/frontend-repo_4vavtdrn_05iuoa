import { useEffect, useRef } from 'react'
import { motion, useSpring, useTransform, AnimatePresence } from 'framer-motion'
import { CheckCircle2, CircleDashed, ListTodo } from 'lucide-react'

function Counter({ value }) {
  const spring = useSpring(0, { stiffness: 120, damping: 20 })
  const rounded = useTransform(spring, (v) => Math.round(v))

  useEffect(() => {
    spring.set(value)
  }, [value])

  return <motion.span className="tabular-nums">{rounded}</motion.span>
}

export default function Stats({ total, completed }) {
  const active = Math.max(0, total - completed)
  return (
    <div className="grid grid-cols-3 gap-3">
      {[{
        icon: <ListTodo className="h-4 w-4" />, label: 'Total', value: total,
        grad: 'from-indigo-400/40 to-violet-500/30'
      }, {
        icon: <CircleDashed className="h-4 w-4" />, label: 'Active', value: active,
        grad: 'from-amber-400/40 to-pink-500/30'
      }, {
        icon: <CheckCircle2 className="h-4 w-4" />, label: 'Done', value: completed,
        grad: 'from-emerald-400/40 to-cyan-500/30'
      }].map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${s.grad}`} />
          <div className="relative z-10 flex items-center gap-2 text-white">
            <div className="grid h-7 w-7 place-items-center rounded-xl bg-white/10 ring-1 ring-white/30">
              {s.icon}
            </div>
            <div className="ml-auto text-right">
              <div className="text-[10px] uppercase tracking-wide text-white/70">{s.label}</div>
              <div className="text-xl font-semibold"><Counter value={s.value} /></div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
