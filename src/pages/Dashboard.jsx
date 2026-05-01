import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import StatCard from '../components/StatCard'

/* ── helpers ── */
const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const REGIONS      = ['Central','Northern','Eastern','Western','Southern']

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

const ACTION_COLORS = {
  enrolled: '#40916c', synced: '#52b788',
  updated: '#3b82f6', deleted: '#ef4444', sync_all: '#b7e053',
}
const ACTION_LABELS = {
  enrolled: 'Enrolled', synced: 'Synced',
  updated: 'Updated', deleted: 'Deleted', sync_all: 'Batch Sync',
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-label">{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: '#fff', fontWeight: 600 }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  )
}

/* ── Concentric circles for region data ── */
function ConcentricCircles({ data }) {
  if (!data.length) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:150, color:'var(--text-4)', fontSize:'.82rem' }}>
        No data yet
      </div>
    )
  }
  const sorted = [...data].sort((a, b) => b.count - a.count)
  const max    = sorted[0].count || 1
  const sizes  = [150, 118, 90, 66, 46]
  const opacities = [.12, .22, .34, .48, .65]

  return (
    <div style={{ position:'relative', width:154, height:154, flexShrink:0 }}>
      {sorted.slice(0,5).map((r, i) => {
        const size = sizes[i]
        const off  = (154 - size) / 2
        return (
          <div
            key={r.name}
            style={{
              position:'absolute',
              top:off, left:off,
              width:size, height:size,
              borderRadius:'50%',
              background:`rgba(64,145,108,${opacities[i]})`,
              display:'flex', alignItems:'center', justifyContent:'center',
              transition:'all .3s ease',
            }}
          >
            {i === sorted.slice(0,5).length - 1 && (
              <span style={{ fontWeight:800, fontSize:'.95rem', color:'var(--g800)' }}>
                {r.count}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ── Sparkline ── */
function Sparkline({ data, color = '#40916c' }) {
  return (
    <ResponsiveContainer width="100%" height={50}>
      <AreaChart data={data} margin={{ top:2, right:0, left:0, bottom:0 }}>
        <defs>
          <linearGradient id="spGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={color} stopOpacity={0.2} />
            <stop offset="95%" stopColor={color} stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill="url(#spGrad)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export default function Dashboard({ farmers, offlineFarmers, syncedFarmers, activity }) {
  const total   = farmers.length
  const synced  = syncedFarmers.length
  const offline = offlineFarmers.length
  const syncPct = total ? Math.round((synced / total) * 100) : 0

  const now = new Date()
  const dayNum  = now.getDate()
  const dayName = now.toLocaleDateString('en-GB', { weekday:'long' })
  const month   = now.toLocaleDateString('en-GB', { month:'long' })

  /* ── trend data (last 6 months) ── */
  const trendData = useMemo(() => {
    const months = [...Array(6)].map((_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
      return { name: MONTH_LABELS[d.getMonth()], Enrollments: 0, v: 0 }
    })
    farmers.forEach(f => {
      const d = new Date(f.enrolledAt)
      months.forEach(m => {
        if (m.name === MONTH_LABELS[d.getMonth()]) { m.Enrollments++; m.v++ }
      })
    })
    return months
  }, [farmers])

  /* ── region data ── */
  const regionData = useMemo(() =>
    REGIONS.map(r => ({ name: r, count: farmers.filter(f => f.region === r).length }))
      .filter(r => r.count > 0),
  [farmers])

  /* ── top regions for bar ── */
  const regionBarData = useMemo(() =>
    REGIONS.map(r => ({ name: r.slice(0,3), Farmers: farmers.filter(f => f.region === r).length })),
  [farmers])

  /* ── weekly ── */
  const thisWeek = useMemo(() => {
    const monday = new Date()
    monday.setDate(monday.getDate() - monday.getDay() + 1)
    monday.setHours(0,0,0,0)
    return farmers.filter(f => new Date(f.enrolledAt) >= monday).length
  }, [farmers])

  const totalArea = farmers.reduce((s, f) => s + f.plotSize, 0).toFixed(1)

  const recentActivity = activity.slice(0, 6)

  return (
    <div>
      {/* ════════════════════════════════
          ROW 1 — Date + Welcome + Quick pills
      ════════════════════════════════ */}
      <div className="bento" style={{ marginBottom: 14 }}>

        {/* Date widget */}
        <div className="b2" style={{ animationDelay:'0s' }}>
          <div className="date-widget card-3d">
            <div>
              <div className="date-big">{dayNum}</div>
              <div className="date-label">{dayName}, {month}</div>
            </div>
            <Link to="/farmers" className="date-btn">
              <span>+ Enroll Farmer</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* Welcome message */}
        <div className="b6" style={{ animationDelay:'0.05s' }}>
          <div className="welcome-card">
            <div className="welcome-eyebrow">🌿 HERVeg.05 Dashboard</div>
            <div className="welcome-title">
              Hey, Welcome back!<br />
              <span>small plots, big impact.</span>
            </div>
            <div className="welcome-sub">
              Track farmer enrollment, sync status, and regional coverage at a glance.
            </div>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginTop:14 }}>
              <div className="welcome-badge">
                <span className="badge-dot" />
                {total} Farmers Enrolled
              </div>
              {offline > 0 && (
                <div className="welcome-badge" style={{ borderColor:'#fde68a', background:'#fffbeb', color:'#92400e' }}>
                  ⚠ {offline} Pending Sync
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mini stat — this week */}
        <div className="b2" style={{ animationDelay:'0.1s' }}>
          <div className="mini-card card-3d" style={{ height:'100%' }}>
            <div className="mini-card-icon">📅</div>
            <div className="mini-card-value">{thisWeek}</div>
            <div className="mini-card-label">Enrolled this week</div>
            <div style={{ marginTop:'auto', paddingTop:10 }}>
              <Sparkline data={trendData.map(d => ({ v: d.v }))} />
            </div>
          </div>
        </div>

        {/* Mini stat — total area */}
        <div className="b2" style={{ animationDelay:'0.15s' }}>
          <div className="mini-card card-3d" style={{ height:'100%' }}>
            <div className="mini-card-icon">🌾</div>
            <div className="mini-card-value">{totalArea}</div>
            <div className="mini-card-label">Hectares covered</div>
            <div style={{ marginTop:'auto', paddingTop:10 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <div className="progress-track" style={{ flex:1, height:5 }}>
                  <div className="progress-fill" style={{ width:`${Math.min(parseFloat(totalArea)/10*100,100)}%` }} />
                </div>
                <span style={{ fontSize:'.72rem', fontWeight:700, color:'var(--g600)' }}>{totalArea}ha</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════
          ROW 2 — 4 Stat Cards
      ════════════════════════════════ */}
      <div className="stats-grid" style={{ marginBottom:14 }}>
        <StatCard icon="🧑‍🌾" value={total}   label="Total Enrolled"   color="green"  trend="up"      trendValue={`+${thisWeek} this week`} delay={0}   />
        <StatCard icon="✅"    value={synced}  label="Synced to Server" color="lime"   trend="up"      trendValue={`${syncPct}% rate`}       delay={50}  />
        <StatCard icon="📴"    value={offline} label="Pending Sync"     color="orange" trend={offline > 0 ? 'down' : 'neutral'} trendValue={offline > 0 ? 'Needs attention' : 'All clear'} delay={100} />
        <StatCard icon="🌿"    value={REGIONS.filter(r => farmers.some(f => f.region === r)).length} label="Active Regions" color="blue" trend="neutral" trendValue="of 5 regions" delay={150} />
      </div>

      {/* ════════════════════════════════
          ROW 3 — Charts + Sync Ring
      ════════════════════════════════ */}
      <div className="bento" style={{ marginBottom:14 }}>

        {/* Enrollment trend — large */}
        <div className="b7" style={{ animationDelay:'0.08s' }}>
          <div className="card" style={{ height:'100%' }}>
            <div className="card-header">
              <div className="card-title">
                <div className="card-title-icon">📈</div>
                Enrollment Trend
              </div>
              <span className="badge badge-green">6 months</span>
            </div>
            <div style={{ height:180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top:5, right:8, left:-22, bottom:0 }}>
                  <defs>
                    <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#40916c" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#40916c" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize:11, fill:'#6b8f7a' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize:11, fill:'#6b8f7a' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="Enrollments" stroke="#40916c" strokeWidth={2.5} fill="url(#trendGrad)" dot={{ fill:'#40916c', strokeWidth:0, r:3.5 }} activeDot={{ r:6, fill:'#40916c' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Sync progress ring */}
        <div className="b5" style={{ animationDelay:'0.13s' }}>
          <div className="card" style={{ height:'100%' }}>
            <div className="card-header">
              <div className="card-title">
                <div className="card-title-icon">📡</div>
                Sync Status
              </div>
              {offline > 0 && <Link to="/offline" className="btn btn-ghost btn-sm no-print">View →</Link>}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:20 }}>
              {/* SVG donut */}
              <div className="ring-wrap" style={{ flexShrink:0 }}>
                <svg width={100} height={100} viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="38" fill="none" stroke="var(--g50)" strokeWidth={9}/>
                  <circle
                    cx="50" cy="50" r="38"
                    fill="none" stroke="var(--g600)" strokeWidth={9}
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 38}`}
                    strokeDashoffset={`${2 * Math.PI * 38 * (1 - syncPct / 100)}`}
                    transform="rotate(-90 50 50)"
                    style={{ transition:'stroke-dashoffset 1s ease' }}
                  />
                </svg>
                <div className="ring-label">
                  <div className="ring-pct">{syncPct}%</div>
                  <div className="ring-sub">synced</div>
                </div>
              </div>
              <div style={{ flex:1 }}>
                {[
                  { label:'Synced',   value:synced,  color:'var(--g500)' },
                  { label:'Offline',  value:offline, color:'#f59e0b' },
                  { label:'Total',    value:total,   color:'var(--text-4)' },
                ].map(r => (
                  <div key={r.label} className="metric-row">
                    <span className="metric-label" style={{ display:'flex', alignItems:'center', gap:7 }}>
                      <span style={{ width:7, height:7, borderRadius:'50%', background:r.color, display:'inline-block' }}/>
                      {r.label}
                    </span>
                    <span className="metric-value">{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════
          ROW 4 — Activity + Region Concentric + Region Bar
      ════════════════════════════════ */}
      <div className="bento">

        {/* Activity feed */}
        <div className="b5" style={{ animationDelay:'0.1s' }}>
          <div className="card" style={{ height:'100%' }}>
            <div className="card-header">
              <div className="card-title">
                <div className="card-title-icon">🕒</div>
                Recent Activity
              </div>
            </div>
            {recentActivity.length === 0 ? (
              <div className="empty-state" style={{ padding:'28px 0' }}>
                <div className="empty-state-icon" style={{ fontSize:'2rem' }}>🌱</div>
                <h3>No activity yet</h3>
                <p>Enroll your first farmer to begin.</p>
                <Link to="/farmers" className="btn btn-primary btn-sm">+ Enroll</Link>
              </div>
            ) : (
              <div className="activity-feed">
                {recentActivity.map((a, i) => (
                  <div key={a.id} className="activity-item" style={{ animationDelay:`${i*35}ms` }}>
                    <div className="activity-dot" style={{ background: ACTION_COLORS[a.action] || 'var(--g400)' }} />
                    <div className="activity-content">
                      <div className="activity-text">
                        <span style={{ fontWeight:700 }}>{ACTION_LABELS[a.action] || a.action}</span>
                        {' '}· {a.farmerName}
                        {a.details && <span style={{ color:'var(--text-4)' }}> · {a.details}</span>}
                      </div>
                    </div>
                    <span className="activity-time">{timeAgo(a.timestamp)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Farmers by region — concentric circles (annual-profits style) */}
        <div className="b3" style={{ animationDelay:'0.15s' }}>
          <div className="card" style={{ height:'100%' }}>
            <div className="card-header">
              <div className="card-title">
                <div className="card-title-icon">🗺️</div>
                By Region
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:14, alignItems:'center' }}>
              <ConcentricCircles data={regionData} />
              <div style={{ width:'100%', display:'flex', flexDirection:'column', gap:5 }}>
                {regionData.slice(0, 4).map((r, i) => (
                  <div key={r.name} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:'.78rem' }}>
                    <span style={{ color:'var(--text-3)', fontWeight:500 }}>{r.name}</span>
                    <span style={{ fontWeight:800, color:'var(--text-1)' }}>{r.count}</span>
                  </div>
                ))}
                {regionData.length === 0 && (
                  <p style={{ textAlign:'center', color:'var(--text-4)', fontSize:'.8rem' }}>No data yet</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Region bar chart */}
        <div className="b4" style={{ animationDelay:'0.2s' }}>
          <div className="card" style={{ height:'100%' }}>
            <div className="card-header">
              <div className="card-title">
                <div className="card-title-icon">📊</div>
                Regional Breakdown
              </div>
              <Link to="/reports" className="btn btn-ghost btn-sm no-print">Reports →</Link>
            </div>
            <div style={{ height:160 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionBarData} margin={{ top:5, right:8, left:-22, bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize:11, fill:'#6b8f7a' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize:11, fill:'#6b8f7a' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Farmers" fill="#40916c" radius={[5,5,0,0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
