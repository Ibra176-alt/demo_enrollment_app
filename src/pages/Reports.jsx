import { useMemo, useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line,
} from 'recharts'

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const REGIONS      = ['Central','Northern','Eastern','Western','Southern']
const GREEN_SHADES = ['#1b4332','#2d6a4f','#40916c','#52b788','#74c69d','#95d5b2','#b7e4c7','#d8f3dc']

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

/* ── export helpers ── */
function downloadCSV(farmers) {
  const headers = ['First Name','Last Name','Phone','National ID','Region','Village','Plot (ha)','Primary Crop','Gender','Age','Status','Enrolled At','Synced At','Notes']
  const rows = farmers.map(f => [
    f.firstName, f.lastName, f.phone, f.nationalId||'',
    f.region, f.village||'', f.plotSize, f.primaryCrop,
    f.gender||'', f.age||'',
    f.synced ? 'Synced' : 'Offline',
    new Date(f.enrolledAt).toLocaleDateString('en-GB'),
    f.syncedAt ? new Date(f.syncedAt).toLocaleDateString('en-GB') : '',
    (f.notes||'').replace(/"/g,'""'),
  ])
  const csv = [headers, ...rows]
    .map(row => row.map(v => `"${v}"`).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `HERVeg05_Farmers_${new Date().toISOString().slice(0,10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function downloadActivityCSV(activity) {
  const headers = ['Action','Farmer','Details','Timestamp']
  const rows = activity.map(a => [
    a.action, a.farmerName, a.details||'',
    new Date(a.timestamp).toLocaleString('en-GB'),
  ])
  const csv = [headers, ...rows]
    .map(row => row.map(v => `"${v}"`).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `HERVeg05_Activity_${new Date().toISOString().slice(0,10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function printReport() {
  window.print()
}

const ACTION_LABELS = { enrolled:'Enrolled', synced:'Synced', updated:'Updated', deleted:'Deleted', sync_all:'Batch Sync' }

export default function Reports({ farmers, activity }) {
  const [activeTab, setActiveTab] = useState('overview')

  /* ── computed data ── */
  const totalFarmers  = farmers.length
  const synced        = farmers.filter(f => f.synced).length
  const offline       = farmers.filter(f => !f.synced).length
  const avgPlot       = totalFarmers ? (farmers.reduce((s,f) => s + f.plotSize, 0) / totalFarmers).toFixed(2) : 0
  const totalArea     = farmers.reduce((s,f) => s + f.plotSize, 0).toFixed(1)

  const trendData = useMemo(() => {
    const now    = new Date()
    const months = [...Array(12)].map((_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1)
      return { month: MONTH_LABELS[d.getMonth()], year: d.getFullYear(), enrolled: 0, synced: 0 }
    })
    farmers.forEach(f => {
      const d = new Date(f.enrolledAt)
      months.forEach(m => {
        if (m.month === MONTH_LABELS[d.getMonth()] && m.year === d.getFullYear()) {
          m.enrolled++
          if (f.synced) m.synced++
        }
      })
    })
    return months.map(m => ({ name: m.month, Enrolled: m.enrolled, Synced: m.synced }))
  }, [farmers])

  const regionData = useMemo(() =>
    REGIONS.map(r => ({
      name: r,
      Farmers: farmers.filter(f => f.region === r).length,
      Synced:  farmers.filter(f => f.region === r && f.synced).length,
    })).filter(r => r.Farmers > 0),
  [farmers])

  const cropData = useMemo(() => {
    const map = {}
    farmers.forEach(f => { map[f.primaryCrop] = (map[f.primaryCrop] || 0) + 1 })
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a,b) => b.value - a.value)
  }, [farmers])

  const genderData = useMemo(() => {
    const map = { Female: 0, Male: 0, Other: 0, Unknown: 0 }
    farmers.forEach(f => { map[f.gender || 'Unknown']++ })
    return Object.entries(map).filter(([,v]) => v > 0).map(([name, value]) => ({ name, value }))
  }, [farmers])

  const TABS = ['overview','enrollment','region','activity']

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Data insights, trends and export options</p>
        </div>
      </div>

      {/* ── Export Bar ── */}
      <div className="export-bar no-print">
        <span className="export-label">Export:</span>
        <button className="btn btn-outline btn-sm" onClick={() => downloadCSV(farmers)}>
          📥 Farmers CSV
        </button>
        <button className="btn btn-outline btn-sm" onClick={() => downloadActivityCSV(activity)}>
          📥 Activity CSV
        </button>
        <button className="btn btn-outline btn-sm" onClick={printReport}>
          🖨️ Print / PDF
        </button>
        <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--text-4)' }}>
          {totalFarmers} farmers · {new Date().toLocaleDateString('en-GB')}
        </span>
      </div>

      {/* ── Summary Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Farmers',  value: totalFarmers, icon: '🧑‍🌾' },
          { label: 'Synced',         value: synced,        icon: '✅' },
          { label: 'Pending',        value: offline,       icon: '⏳' },
          { label: 'Total Area (ha)',value: totalArea,      icon: '🌾' },
          { label: 'Avg Plot (ha)',  value: avgPlot,        icon: '📐' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '16px 18px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.4rem' }}>{s.icon}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-1)', margin: '6px 0 2px' }}>{s.value}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Tab Bar ── */}
      <div className="no-print" style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button
            key={t}
            className={`btn btn-sm ${activeTab === t ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab(t)}
            style={{ textTransform: 'capitalize' }}
          >
            {t === 'overview' ? '📊 Overview' : t === 'enrollment' ? '📈 Enrollment' : t === 'region' ? '🗺️ Regions' : '📋 Activity'}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ── */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="grid-2">
            {/* Crop distribution */}
            <div className="card">
              <div className="card-header">
                <div className="card-title"><div className="card-title-icon">🌱</div>Crop Distribution</div>
              </div>
              {cropData.length === 0 ? (
                <div style={{ textAlign:'center', padding: '40px 0', color:'var(--text-4)' }}>No data</div>
              ) : (
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', height: 220 }}>
                  <ResponsiveContainer width="55%" height="100%">
                    <PieChart>
                      <Pie data={cropData} cx="50%" cy="50%" innerRadius={55} outerRadius={88} paddingAngle={3} dataKey="value">
                        {cropData.map((_, i) => <Cell key={i} fill={GREEN_SHADES[i % GREEN_SHADES.length]} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {cropData.slice(0,7).map((c, i) => (
                      <div key={c.name} style={{ display:'flex', alignItems:'center', gap:8, fontSize:'0.78rem' }}>
                        <div style={{ width:8, height:8, borderRadius:'50%', background:GREEN_SHADES[i%GREEN_SHADES.length], flexShrink:0 }} />
                        <span style={{ flex:1, color:'var(--text-2)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.name}</span>
                        <span style={{ fontWeight:700, color:'var(--text-1)' }}>{c.value}</span>
                        <span style={{ color:'var(--text-4)' }}>({Math.round(c.value/totalFarmers*100)}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Gender distribution */}
            <div className="card">
              <div className="card-header">
                <div className="card-title"><div className="card-title-icon">👥</div>Gender Breakdown</div>
              </div>
              {genderData.length === 0 ? (
                <div style={{ textAlign:'center', padding:'40px 0', color:'var(--text-4)' }}>No data</div>
              ) : (
                <div style={{ height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={genderData} margin={{ top:5, right:10, left:-20, bottom:0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize:12, fill:'#5a8068' }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize:12, fill:'#5a8068' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" name="Farmers" radius={[8,8,0,0]} maxBarSize={60}>
                        {genderData.map((_, i) => <Cell key={i} fill={GREEN_SHADES[i*2 % GREEN_SHADES.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Sync over time */}
          <div className="card">
            <div className="card-header">
              <div className="card-title"><div className="card-title-icon">📅</div>12-Month Overview</div>
            </div>
            <div className="chart-container" style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top:5, right:10, left:-20, bottom:0 }}>
                  <defs>
                    <linearGradient id="gr1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#40916c" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#40916c" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="gr2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#b7e053" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#b7e053" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize:11, fill:'#5a8068' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize:11, fill:'#5a8068' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:'0.8rem', paddingTop:8 }} />
                  <Area type="monotone" dataKey="Enrolled" stroke="#40916c" strokeWidth={2.5} fill="url(#gr1)" dot={false} activeDot={{ r:5 }} />
                  <Area type="monotone" dataKey="Synced"   stroke="#b7e053" strokeWidth={2.5} fill="url(#gr2)" dot={false} activeDot={{ r:5 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ── Enrollment Tab ── */}
      {activeTab === 'enrollment' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title"><div className="card-title-icon">📈</div>Monthly Enrollment Trend</div>
            </div>
            <div className="chart-container" style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top:5, right:20, left:-20, bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize:12, fill:'#5a8068' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize:12, fill:'#5a8068' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:'0.82rem' }} />
                  <Line type="monotone" dataKey="Enrolled" stroke="#40916c" strokeWidth={3} dot={{ r:5, fill:'#40916c', strokeWidth:0 }} activeDot={{ r:7 }} />
                  <Line type="monotone" dataKey="Synced"   stroke="#b7e053" strokeWidth={3} dot={{ r:5, fill:'#b7e053', strokeWidth:0 }} activeDot={{ r:7 }} strokeDasharray="5 3" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Data table */}
          <div className="card">
            <div className="card-header">
              <div className="card-title"><div className="card-title-icon">📋</div>Enrollment Table</div>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>Month</th><th>Enrolled</th><th>Synced</th><th>Pending</th><th>Sync Rate</th></tr>
                </thead>
                <tbody>
                  {trendData.filter(r => r.Enrolled > 0).map(r => (
                    <tr key={r.name}>
                      <td style={{ fontWeight:600 }}>{r.name}</td>
                      <td>{r.Enrolled}</td>
                      <td>{r.Synced}</td>
                      <td>{r.Enrolled - r.Synced}</td>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div className="progress-track" style={{ height:6, flex:1 }}>
                            <div className="progress-fill" style={{ width: r.Enrolled ? `${Math.round(r.Synced/r.Enrolled*100)}%` : '0%' }} />
                          </div>
                          <span style={{ fontSize:'0.78rem', fontWeight:700, color:'var(--g700)', minWidth:32 }}>
                            {r.Enrolled ? `${Math.round(r.Synced/r.Enrolled*100)}%` : '—'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {trendData.every(r => r.Enrolled === 0) && (
                    <tr><td colSpan={5} style={{ textAlign:'center', padding:'32px', color:'var(--text-4)' }}>No enrollment data yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Region Tab ── */}
      {activeTab === 'region' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title"><div className="card-title-icon">🗺️</div>Farmers by Region</div>
            </div>
            {regionData.length === 0 ? (
              <div style={{ textAlign:'center', padding:'60px 0', color:'var(--text-4)' }}>No regional data yet</div>
            ) : (
              <div className="chart-container" style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={regionData} margin={{ top:5, right:20, left:-20, bottom:0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize:12, fill:'#5a8068' }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize:12, fill:'#5a8068' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:'0.82rem' }} />
                    <Bar dataKey="Farmers" fill="#40916c" radius={[8,8,0,0]} maxBarSize={50} />
                    <Bar dataKey="Synced"  fill="#b7e053" radius={[8,8,0,0]} maxBarSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title"><div className="card-title-icon">📋</div>Regional Summary</div>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>Region</th><th>Total</th><th>Synced</th><th>Offline</th><th>% Synced</th><th>Total Area (ha)</th></tr>
                </thead>
                <tbody>
                  {REGIONS.map(r => {
                    const rFarmers = farmers.filter(f => f.region === r)
                    const rSynced  = rFarmers.filter(f => f.synced).length
                    const rArea    = rFarmers.reduce((s,f) => s+f.plotSize,0).toFixed(1)
                    const pct      = rFarmers.length ? Math.round(rSynced/rFarmers.length*100) : 0
                    return (
                      <tr key={r}>
                        <td style={{ fontWeight:600 }}>{r}</td>
                        <td>{rFarmers.length}</td>
                        <td>{rSynced}</td>
                        <td>{rFarmers.length - rSynced}</td>
                        <td>
                          {rFarmers.length > 0 ? (
                            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                              <div className="progress-track" style={{ height:6, flex:1 }}>
                                <div className="progress-fill" style={{ width:`${pct}%` }} />
                              </div>
                              <span style={{ fontSize:'0.78rem', fontWeight:700, color:'var(--g700)', minWidth:32 }}>{pct}%</span>
                            </div>
                          ) : '—'}
                        </td>
                        <td>{rFarmers.length > 0 ? rArea : '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Activity Tab ── */}
      {activeTab === 'activity' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title"><div className="card-title-icon">📋</div>Activity Log</div>
            <button className="btn btn-outline btn-sm no-print" onClick={() => downloadActivityCSV(activity)}>
              📥 Export CSV
            </button>
          </div>

          {activity.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <h3>No activity recorded</h3>
              <p>Actions will appear here as you use the app.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>Action</th><th>Farmer</th><th>Details</th><th>Timestamp</th></tr>
                </thead>
                <tbody>
                  {activity.slice(0, 100).map(a => (
                    <tr key={a.id}>
                      <td>
                        <span className={`badge ${
                          a.action === 'enrolled'  ? 'badge-green'    :
                          a.action === 'synced'    ? 'badge-synced'   :
                          a.action === 'sync_all'  ? 'badge-synced'   :
                          a.action === 'deleted'   ? 'badge-inactive' : 'badge-active'
                        }`}>
                          {ACTION_LABELS[a.action] || a.action}
                        </span>
                      </td>
                      <td style={{ fontWeight:600 }}>{a.farmerName}</td>
                      <td style={{ color:'var(--text-3)' }}>{a.details||'—'}</td>
                      <td style={{ fontSize:'0.78rem', color:'var(--text-4)' }}>
                        {new Date(a.timestamp).toLocaleString('en-GB', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
