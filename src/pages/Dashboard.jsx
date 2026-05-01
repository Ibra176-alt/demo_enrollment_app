import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import StatCard from '../components/StatCard'

/* ── helpers ── */
function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const REGIONS = ['Central','Northern','Eastern','Western','Southern']
const CROP_COLORS = ['#40916c','#52b788','#74c69d','#b7e4c7','#d8f3dc','#95d5b2','#2d6a4f','#1b4332']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-label">{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || 'white', fontWeight: 600 }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  )
}

/* ── activity dot color ── */
const ACTION_COLORS = {
  enrolled: '#40916c',
  synced:   '#52b788',
  updated:  '#3b82f6',
  deleted:  '#ef4444',
  sync_all: '#b7e053',
}

const ACTION_LABELS = {
  enrolled: 'Enrolled',
  synced:   'Synced',
  updated:  'Updated',
  deleted:  'Deleted',
  sync_all: 'Batch Sync',
}

export default function Dashboard({ farmers, offlineFarmers, syncedFarmers, activity }) {
  const total   = farmers.length
  const synced  = syncedFarmers.length
  const offline = offlineFarmers.length
  const syncPct = total ? Math.round((synced / total) * 100) : 0

  /* ── enrollment trend (last 6 months) ── */
  const trendData = useMemo(() => {
    const now   = new Date()
    const months = [...Array(6)].map((_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
      return { month: MONTH_LABELS[d.getMonth()], year: d.getFullYear(), count: 0 }
    })
    farmers.forEach(f => {
      const d = new Date(f.enrolledAt)
      months.forEach(m => {
        if (m.month === MONTH_LABELS[d.getMonth()] && m.year === d.getFullYear()) m.count++
      })
    })
    return months.map(m => ({ name: m.month, Enrollments: m.count }))
  }, [farmers])

  /* ── regional breakdown ── */
  const regionData = useMemo(() =>
    REGIONS.map(r => ({ name: r, Farmers: farmers.filter(f => f.region === r).length }))
      .filter(r => r.Farmers > 0),
  [farmers])

  /* ── crop distribution ── */
  const cropData = useMemo(() => {
    const map = {}
    farmers.forEach(f => { map[f.primaryCrop] = (map[f.primaryCrop] || 0) + 1 })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [farmers])

  /* ── weekly enrollments (this week vs last week) ── */
  const thisWeek = useMemo(() => {
    const monday = new Date()
    monday.setDate(monday.getDate() - monday.getDay() + 1)
    monday.setHours(0,0,0,0)
    return farmers.filter(f => new Date(f.enrolledAt) >= monday).length
  }, [farmers])

  const recentActivity = activity.slice(0, 8)

  return (
    <div>
      {/* ── Hero ── */}
      <div className="hero-banner">
        <div className="hero-greeting">
          Hey there 👋, welcome back to HERVeg.05
        </div>
        <div className="hero-sub">
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            {total} Farmers Enrolled
          </div>
          {offline > 0 && (
            <div className="hero-badge" style={{ borderColor: 'rgba(244,196,83,0.4)', color: '#fde68a' }}>
              ⚠ {offline} Pending Sync
            </div>
          )}
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="stats-grid">
        <StatCard icon="🧑‍🌾" value={total}   label="Total Enrolled"   color="green"  trend="up"      trendValue={`+${thisWeek} this week`} delay={0}   />
        <StatCard icon="✅"    value={synced}  label="Synced"           color="lime"   trend="up"      trendValue={`${syncPct}% rate`}       delay={60}  />
        <StatCard icon="📴"    value={offline} label="Pending Sync"     color="orange" trend={offline > 0 ? 'down' : 'neutral'} trendValue={offline > 0 ? 'Need attention' : 'All clear'} delay={120} />
        <StatCard icon="📅"    value={thisWeek}label="This Week"        color="blue"   trend="neutral" trendValue="new enrollments"          delay={180} />
      </div>

      {/* ── Charts Row 1 ── */}
      <div className="grid-2" style={{ marginBottom: 20 }}>
        {/* Enrollment Trend */}
        <div className="card" style={{ animationDelay: '0.1s' }}>
          <div className="card-header">
            <div className="card-title">
              <div className="card-title-icon">📈</div>
              Enrollment Trend
            </div>
            <span className="badge badge-green">6 months</span>
          </div>
          <div className="chart-container" style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="enrollGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#40916c" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#40916c" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#5a8068' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#5a8068' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="Enrollments" stroke="#40916c" strokeWidth={2.5} fill="url(#enrollGrad)" dot={{ fill: '#40916c', strokeWidth: 0, r: 4 }} activeDot={{ r: 6, fill: '#40916c' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Region Bar */}
        <div className="card" style={{ animationDelay: '0.15s' }}>
          <div className="card-header">
            <div className="card-title">
              <div className="card-title-icon">🗺️</div>
              Farmers by Region
            </div>
          </div>
          {regionData.length === 0 ? (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-4)', fontSize: '0.85rem' }}>
              No data yet
            </div>
          ) : (
            <div className="chart-container" style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#5a8068' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#5a8068' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Farmers" fill="#40916c" radius={[6,6,0,0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* ── Charts Row 2 ── */}
      <div className="grid-2" style={{ marginBottom: 20 }}>
        {/* Crop Distribution */}
        <div className="card" style={{ animationDelay: '0.2s' }}>
          <div className="card-header">
            <div className="card-title">
              <div className="card-title-icon">🌾</div>
              Crop Distribution
            </div>
          </div>
          {cropData.length === 0 ? (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-4)', fontSize: '0.85rem' }}>
              No data yet
            </div>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center' }}>
              <ResponsiveContainer width="50%" height="100%">
                <PieChart>
                  <Pie data={cropData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {cropData.map((_, i) => <Cell key={i} fill={CROP_COLORS[i % CROP_COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, padding: '0 8px' }}>
                {cropData.slice(0, 6).map((c, i) => (
                  <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: CROP_COLORS[i % CROP_COLORS.length], flexShrink: 0 }} />
                    <span style={{ color: 'var(--text-2)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</span>
                    <span style={{ color: 'var(--text-3)', fontWeight: 600 }}>{c.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sync Progress */}
        <div className="card" style={{ animationDelay: '0.25s' }}>
          <div className="card-header">
            <div className="card-title">
              <div className="card-title-icon">📡</div>
              Sync Status
            </div>
            {offline > 0 && (
              <Link to="/offline" className="btn btn-ghost btn-sm">View all →</Link>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 20 }}>
            {/* Donut */}
            <div className="ring-wrap" style={{ flexShrink: 0 }}>
              <svg width="110" height="110" viewBox="0 0 110 110">
                <circle cx="55" cy="55" r="44" fill="none" stroke="var(--g100)" strokeWidth="10" />
                <circle
                  cx="55" cy="55" r="44"
                  fill="none"
                  stroke="url(#ringGrad)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 44}`}
                  strokeDashoffset={`${2 * Math.PI * 44 * (1 - syncPct / 100)}`}
                  transform="rotate(-90 55 55)"
                  style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
                <defs>
                  <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%"   stopColor="#2d6a4f" />
                    <stop offset="100%" stopColor="#74c69d" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="ring-label">
                <div className="ring-pct">{syncPct}%</div>
                <div className="ring-sub">synced</div>
              </div>
            </div>

            <div style={{ flex: 1 }}>
              {[
                { label: 'Synced',   value: synced,  color: 'var(--g600)' },
                { label: 'Offline',  value: offline, color: '#f59e0b'     },
                { label: 'Total',    value: total,   color: 'var(--text-3)' },
              ].map(r => (
                <div key={r.label} className="metric-row">
                  <span className="metric-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: r.color, display: 'inline-block' }} />
                    {r.label}
                  </span>
                  <span className="metric-value">{r.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-3)', marginBottom: 6 }}>
              <span>Sync progress</span>
              <span style={{ fontWeight: 700, color: 'var(--g700)' }}>{synced}/{total}</span>
            </div>
            <div className="progress-track" style={{ height: 8 }}>
              <div className="progress-fill" style={{ width: `${syncPct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Activity Log ── */}
      <div className="card" style={{ animationDelay: '0.3s' }}>
        <div className="card-header">
          <div className="card-title">
            <div className="card-title-icon">🕒</div>
            Recent Activity
          </div>
          <Link to="/reports" className="btn btn-outline btn-sm no-print">View Reports →</Link>
        </div>

        {recentActivity.length === 0 ? (
          <div className="empty-state" style={{ padding: '32px 20px' }}>
            <div className="empty-state-icon">🌱</div>
            <h3>No activity yet</h3>
            <p>Enroll your first farmer to get started</p>
            <Link to="/farmers" className="btn btn-primary btn-sm">+ Enroll Farmer</Link>
          </div>
        ) : (
          <div className="activity-feed">
            {recentActivity.map((a, i) => (
              <div key={a.id} className="activity-item" style={{ animationDelay: `${i * 40}ms` }}>
                <div className="activity-dot" style={{ background: ACTION_COLORS[a.action] || 'var(--g500)' }} />
                <div className="activity-content">
                  <div className="activity-text">
                    <span style={{ fontWeight: 700 }}>{ACTION_LABELS[a.action] || a.action}</span>
                    {' '}· <span>{a.farmerName}</span>
                    {a.details && <span style={{ color: 'var(--text-4)' }}> · {a.details}</span>}
                  </div>
                </div>
                <span className="activity-time">{timeAgo(a.timestamp)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
