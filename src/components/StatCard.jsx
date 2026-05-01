import { useEffect, useState, useRef } from 'react'

function useCounter(target, duration = 900) {
  const [value, setValue] = useState(0)
  const prevTarget = useRef(0)

  useEffect(() => {
    if (target === prevTarget.current) return
    prevTarget.current = target

    let start = null
    const from = value

    function tick(ts) {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(from + (target - from) * eased))
      if (progress < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }, [target]) // eslint-disable-line react-hooks/exhaustive-deps

  return value
}

const PALETTES = {
  green:  { icon: 'var(--g100)',  glow: 'var(--g400)' },
  lime:   { icon: '#f0fce4',      glow: 'var(--accent)' },
  blue:   { icon: '#dbeafe',      glow: '#93c5fd' },
  orange: { icon: '#ffedd5',      glow: '#fdba74' },
  purple: { icon: '#ede9fe',      glow: '#c4b5fd' },
}

export default function StatCard({ icon, value, label, trend, trendValue, color = 'green', suffix = '', delay = 0 }) {
  const count   = useCounter(typeof value === 'number' ? value : 0)
  const palette = PALETTES[color] || PALETTES.green

  return (
    <div className="stat-card" style={{ animationDelay: `${delay}ms` }}>
      <div className="stat-card-glow" style={{ background: palette.glow }} />

      <div className="stat-icon-wrap" style={{ background: palette.icon }}>
        {icon}
      </div>

      <div className="stat-value-wrap">
        <div className="stat-value">
          {typeof value === 'number' ? count : value}{suffix}
        </div>
        <div className="stat-label">{label}</div>
      </div>

      {trendValue !== undefined && (
        <div className={`stat-trend ${trend || 'neutral'}`}>
          {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '●'} {trendValue}
        </div>
      )}
    </div>
  )
}
