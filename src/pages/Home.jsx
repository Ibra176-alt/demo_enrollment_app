import { Link } from 'react-router-dom'

function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const REGIONS = ['Central', 'Northern', 'Eastern', 'Western', 'Southern']

export default function Home({ farmers, offlineFarmers, syncedFarmers }) {
  const total   = farmers.length
  const synced  = syncedFarmers.length
  const offline = offlineFarmers.length
  const syncPct = total ? Math.round((synced / total) * 100) : 0

  const regionCounts = REGIONS.map(r => ({
    name: r,
    count: farmers.filter(f => f.region === r).length,
  }))

  const recent = [...farmers].slice(0, 5)

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of farmer enrollment for HERVeg.05</p>
      </div>

      {/* Stat cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon green">🧑‍🌾</div>
          <div>
            <div className="stat-value">{total}</div>
            <div className="stat-label">Total Farmers Enrolled</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">✅</div>
          <div>
            <div className="stat-value">{synced}</div>
            <div className="stat-label">Synced with Server</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow">📴</div>
          <div>
            <div className="stat-value">{offline}</div>
            <div className="stat-label">Pending Sync</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">📊</div>
          <div>
            <div className="stat-value">{syncPct}%</div>
            <div className="stat-label">Sync Rate</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Sync progress */}
        <div className="card">
          <div className="card-title">📡 Sync Progress</div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: 8 }}>
              <span>{synced} of {total} farmers synced</span>
              <span style={{ fontWeight: 600, color: 'var(--green-800)' }}>{syncPct}%</span>
            </div>
            <div className="progress-bar-wrap">
              <div className="progress-bar-fill" style={{ width: `${syncPct}%` }} />
            </div>
          </div>
          {offline > 0 ? (
            <p style={{ fontSize: '0.85rem', color: '#92400e', marginTop: 14 }}>
              ⚠️ {offline} farmer{offline !== 1 ? 's' : ''} not yet synced.{' '}
              <Link to="/offline" style={{ color: 'var(--green-800)', fontWeight: 600 }}>
                View offline farmers →
              </Link>
            </p>
          ) : total > 0 ? (
            <p style={{ fontSize: '0.85rem', color: '#065f46', marginTop: 14 }}>
              All farmers are synced with the server.
            </p>
          ) : (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: 14 }}>
              No farmers enrolled yet.{' '}
              <Link to="/farmers" style={{ color: 'var(--green-800)', fontWeight: 600 }}>
                Enroll a farmer →
              </Link>
            </p>
          )}
        </div>

        {/* By region */}
        <div className="card">
          <div className="card-title">🗺️ Farmers by Region</div>
          {regionCounts.every(r => r.count === 0) ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>No data yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {regionCounts.map(r => (
                <div key={r.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 4 }}>
                    <span style={{ fontWeight: 500 }}>{r.name}</span>
                    <span style={{ color: 'var(--text-light)' }}>{r.count}</span>
                  </div>
                  <div className="progress-bar-wrap" style={{ height: 6 }}>
                    <div
                      className="progress-bar-fill"
                      style={{ width: total ? `${(r.count / total) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent enrollments */}
      <div className="card">
        <div className="section-heading">
          <span>🕒 Recent Enrollments</span>
          <Link to="/farmers" className="btn btn-outline btn-sm">View All</Link>
        </div>
        {recent.length === 0 ? (
          <div className="empty-state" style={{ padding: '30px 20px' }}>
            <div className="icon">🌱</div>
            <p>No farmers enrolled yet</p>
            <small>Head to the Farmers page to get started.</small>
          </div>
        ) : (
          <ul className="activity-list">
            {recent.map(f => (
              <li key={f.id} className="activity-item">
                <div className={`activity-dot ${f.synced ? 'dot-green' : 'dot-yellow'}`} />
                <div>
                  <span style={{ fontWeight: 600 }}>{f.firstName} {f.lastName}</span>
                  <span style={{ color: 'var(--text-light)', fontSize: '0.8rem' }}> · {f.region} · Plot {f.plotSize} ha</span>
                </div>
                <span className={`badge ${f.synced ? 'badge-synced' : 'badge-offline'}`}>
                  {f.synced ? '✓ Synced' : '⏳ Offline'}
                </span>
                <span className="activity-meta">{timeAgo(f.enrolledAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
