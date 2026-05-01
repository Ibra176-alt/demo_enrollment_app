import { useState, useMemo } from 'react'

function fmtDateTime(iso) {
  return new Date(iso).toLocaleString('en-GB', {
    day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit',
  })
}

function initials(f, l) { return `${f?.[0]||''}${l?.[0]||''}`.toUpperCase() }

export default function OfflineFarmers({ offlineFarmers, syncFarmer, syncAll }) {
  const [syncing,    setSyncing]    = useState(null)
  const [syncingAll, setSyncingAll] = useState(false)
  const [synced,     setSynced]     = useState([])
  const [search,     setSearch]     = useState('')

  async function handleSyncOne(id, name) {
    setSyncing(id)
    await new Promise(r => setTimeout(r, 900))
    syncFarmer(id)
    setSynced(p => [...p, id])
    setSyncing(null)
  }

  async function handleSyncAll() {
    if (!offlineFarmers.length) return
    setSyncingAll(true)
    await new Promise(r => setTimeout(r, 1500))
    syncAll()
    setSyncingAll(false)
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return offlineFarmers.filter(f =>
      !q ||
      `${f.firstName} ${f.lastName}`.toLowerCase().includes(q) ||
      f.phone.includes(q) ||
      (f.region||'').toLowerCase().includes(q)
    )
  }, [offlineFarmers, search])

  const pct = offlineFarmers.length === 0 ? 100 : 0

  return (
    <div>
      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Offline Farmers</h1>
          <p className="page-subtitle">Enrolled locally — not yet synced with the server</p>
        </div>
        {offlineFarmers.length > 0 && (
          <button className="btn btn-primary no-print" onClick={handleSyncAll} disabled={syncingAll}>
            {syncingAll
              ? <><span className="spinner" /> Syncing all…</>
              : `📡 Sync All (${offlineFarmers.length})`
            }
          </button>
        )}
      </div>

      {/* ── Status Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { icon: '📴', label: 'Pending Sync',   value: offlineFarmers.length, color: '#fef3c7', text: '#92400e' },
          { icon: '📡', label: 'Sync Coverage',  value: `${pct}%`,             color: '#d1fae5', text: '#065f46' },
          { icon: '⚠️', label: 'Data at Risk',   value: offlineFarmers.length > 0 ? 'Yes' : 'None', color: offlineFarmers.length > 0 ? '#fee2e2' : '#d1fae5', text: offlineFarmers.length > 0 ? '#991b1b' : '#065f46' },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: 'center', padding: 20 }}>
            <div style={{ fontSize: '1.6rem', marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-1)' }}>{s.value}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Warning Banner ── */}
      {offlineFarmers.length > 0 && (
        <div className="alert alert-warning" style={{ marginBottom: 24 }}>
          <span style={{ fontSize: '1.1rem' }}>⚠️</span>
          <div>
            <strong>{offlineFarmers.length} farmer{offlineFarmers.length !== 1 ? 's' : ''}</strong> stored only on this device.
            {' '}Sync to prevent data loss on connectivity loss or device failure.
          </div>
        </div>
      )}

      {/* ── Main Card ── */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <div className="card-title-icon">📴</div>
            Unsynced Records
            {offlineFarmers.length > 0 && (
              <span className="badge badge-offline">{offlineFarmers.length} pending</span>
            )}
          </div>
        </div>

        {offlineFarmers.length > 0 && (
          <div className="filter-bar">
            <div className="search-input-wrap">
              <span className="search-icon">🔍</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, phone or region…"
              />
            </div>
          </div>
        )}

        {offlineFarmers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎉</div>
            <h3>All caught up!</h3>
            <p>Every farmer has been synced with the server.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state" style={{ padding: '32px 20px' }}>
            <div className="empty-state-icon">🔍</div>
            <h3>No results</h3>
            <p>Try a different search term.</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="table-wrapper" style={{ display: 'block' }}>
              <table>
                <thead>
                  <tr>
                    <th>Farmer</th>
                    <th>Phone</th>
                    <th>Region</th>
                    <th>Plot (ha)</th>
                    <th>Crop</th>
                    <th>Enrolled At</th>
                    <th style={{ width: 100 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((f) => {
                    const isSyncing = syncing === f.id
                    return (
                      <tr key={f.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div
                              className="avatar avatar-sm"
                              style={{ background: 'linear-gradient(135deg,#f59e0b,#fbbf24)', color: '#78350f' }}
                            >
                              {initials(f.firstName, f.lastName)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{f.firstName} {f.lastName}</div>
                              {f.village && <div style={{ fontSize: '0.72rem', color: 'var(--text-4)' }}>{f.village}</div>}
                            </div>
                          </div>
                        </td>
                        <td>{f.phone}</td>
                        <td>{f.region}</td>
                        <td style={{ fontWeight: 600 }}>{f.plotSize}</td>
                        <td>{f.primaryCrop}</td>
                        <td style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>{fmtDateTime(f.enrolledAt)}</td>
                        <td>
                          <button
                            className={`btn btn-primary btn-sm${isSyncing ? ' btn-loading' : ''}`}
                            onClick={() => handleSyncOne(f.id)}
                            disabled={isSyncing || syncingAll}
                          >
                            {isSyncing
                              ? <><span className="spinner" style={{ width: 13, height: 13 }} /> Syncing</>
                              : '📡 Sync'
                            }
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div style={{
              marginTop: 16, padding: '12px 16px',
              background: 'var(--g50)', borderRadius: 'var(--r-md)',
              fontSize: '0.8rem', color: 'var(--text-3)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              💡 <span>Sync individual farmers or use <strong>Sync All</strong> to upload all {offlineFarmers.length} pending records at once.</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
