import { useEffect, useState, useRef } from 'react'

function useCounter(target, duration = 850) {
  const [value, setValue] = useState(0)
  const prev = useRef(0)

  useEffect(() => {
    if (target === prev.current) return
    prev.current = target
    let start = null
    const from = value
    function tick(ts) {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      setValue(Math.round(from + (target - from) * (1 - Math.pow(1 - p, 3))))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target]) // eslint-disable-line

  return value
}

const PALETTES = {
  green:  { icon: 'var(--g50)',   glow: 'rgba(64,145,108,.5)'  },
  lime:   { icon: '#f0fce4',      glow: 'rgba(183,224,83,.5)'  },
  blue:   { icon: '#eff6ff',      glow: 'rgba(59,130,246,.4)'  },
  orange: { icon: '#fff7ed',      glow: 'rgba(245,158,11,.4)'  },
  purple: { icon: '#faf5ff',      glow: 'rgba(168,85,247,.4)'  },
}

export default function StatCard({ icon, value, label, trend, trendValue, color = 'green', suffix = '', delay = 0 }) {
  const count   = useCounter(typeof value === 'number' ? value : 0)
  const palette = PALETTES[color] || PALETTES.green

  return (
    <div className="stat-card" style={{ animationDelay:`${delay}ms` }}>
      <div className="stat-card-glow" style={{ background: palette.glow }} />

      <div className="stat-icon-wrap" style={{ background: palette.icon }}>
        <span role="img">{icon}</span>
      </div>

      <div>
        <div className="stat-value">
          {typeof value === 'number' ? count : value}{suffix}
        </div>
        <div className="stat-label">{label}</div>
      </div>

      {trendValue !== undefined && (
        <div className={`stat-trend ${trend || 'neutral'}`}>
          {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '·'} {trendValue}
        </div>
      )}
    </div>
  )
}
