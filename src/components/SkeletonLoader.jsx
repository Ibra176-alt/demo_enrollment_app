export function SkeletonStats() {
  return (
    <div className="stats-grid">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="card" style={{ padding: 24 }}>
          <div className="skeleton" style={{ width: 48, height: 48, borderRadius: 12, marginBottom: 16 }} />
          <div className="skeleton skeleton-title" style={{ width: '60%' }} />
          <div className="skeleton skeleton-text"  style={{ width: '80%' }} />
        </div>
      ))}
    </div>
  )
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[...Array(rows)].map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '8px 0' }}>
          <div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton skeleton-text" style={{ width: `${55 + (i % 3) * 10}%` }} />
            <div className="skeleton skeleton-text" style={{ width: '40%', marginBottom: 0 }} />
          </div>
          <div className="skeleton" style={{ width: 70, height: 26, borderRadius: 99 }} />
        </div>
      ))}
    </div>
  )
}

export function SkeletonChart() {
  return (
    <div className="skeleton skeleton-card" />
  )
}
