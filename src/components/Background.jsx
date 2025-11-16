import { useEffect, useRef } from 'react'
import Spline from '@splinetool/react-spline'

export default function Background() {
  const canvasRef = useRef(null)
  const particles = useRef([])
  const mouse = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationId

    const DPR = Math.min(window.devicePixelRatio || 1, 2)
    function setSize() {
      canvas.width = window.innerWidth * DPR
      canvas.height = window.innerHeight * DPR
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
    }
    setSize()

    // Create particles 50-100
    const count = Math.min(Math.max(Math.floor(window.innerWidth / 24), 50), 100)
    particles.current = Array.from({ length: count }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.25 * DPR,
      vy: (Math.random() - 0.5) * 0.25 * DPR,
      r: Math.random() * 1.5 * DPR + 0.5 * DPR,
      a: Math.random() * 0.6 + 0.2,
    }))

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Parallax pull to mouse
      const mx = mouse.current.x * DPR
      const my = mouse.current.y * DPR

      for (let i = 0; i < particles.current.length; i++) {
        const p = particles.current[i]
        // gentle attraction to mouse
        const dx = mx - p.x
        const dy = my - p.y
        const dist = Math.sqrt(dx*dx + dy*dy) || 1
        const force = Math.min(1 / dist, 0.02)
        p.vx += dx * force * 0.001
        p.vy += dy * force * 0.001

        p.x += p.vx
        p.y += p.vy

        // wrap around
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        // draw particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${p.a})`
        ctx.fill()
      }

      // connect nearby
      for (let i = 0; i < particles.current.length; i++) {
        for (let j = i + 1; j < particles.current.length; j++) {
          const p1 = particles.current[i]
          const p2 = particles.current[j]
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const dist = Math.sqrt(dx*dx + dy*dy)
          if (dist < 120 * DPR) {
            const alpha = 0.08 * (1 - dist / (120 * DPR))
            ctx.strokeStyle = `rgba(255,255,255,${alpha})`
            ctx.lineWidth = 1 * DPR
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
          }
        }
      }

      animationId = requestAnimationFrame(draw)
    }

    function onMouseMove(e) {
      mouse.current.x = e.clientX
      mouse.current.y = e.clientY
    }

    window.addEventListener('resize', setSize)
    window.addEventListener('mousemove', onMouseMove)
    draw()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', setSize)
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Gradient orbs */}
      <div className="pointer-events-none absolute -top-40 -left-20 h-[40rem] w-[40rem] rounded-full bg-gradient-to-br from-fuchsia-500/30 to-indigo-500/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-20 h-[40rem] w-[40rem] rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-40 h-[32rem] w-[32rem] rounded-full bg-gradient-to-br from-violet-500/30 to-fuchsia-500/10 blur-3xl" />

      {/* Spline Hero 3D object */}
      <div className="pointer-events-auto absolute top-0 left-0 right-0 h-[54vh]">
        <Spline scene="https://prod.spline.design/41MGRk-UDPKO-l6W/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>

      {/* Particle canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Soft vignette overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10" />
    </div>
  )
}
