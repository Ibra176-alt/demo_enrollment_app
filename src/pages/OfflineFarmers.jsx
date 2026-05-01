import { useState } from 'react'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export default function OfflineFarmers({ offlineFarmers, syncFarmer, syncAll }) {
  const [syncing, setSyncing]     = useState(null)
  const [syncingAll, setSyncingAll] = useState(false)
  const [search, setSearch]       = useState('')

  async function handleSyncOne(id) {
    setSyncing(id)
    await new Promise(r => setTimeout(r, 900))
    syncFarmer(id)
    setSyncing(null)
  }

  async function handleSyncAll() {
    if (!offlineFarmers.length) return
    setSyncingAll(true)
    await new Promise(r => setTimeout(r, 1200))
    syncAll()
    setSyncingAll(false)
  }

  const filtered = offlineFarmers.filter(f => {
    const q = search.toLowerCase()
    return !q ||
      `${f.firstName} ${f.lastName}`.toLowerCase().includes(q) ||
      f.phone.includes(q) ||
      (f.region || '').toLowerCase().includes(q)
  })

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">Offline Farmers</h1>
          <p className="page-subtitle">Farmers enrolled locally but not yet synced with the server</p>
        </div>
        {offlineFarmers.length > 0 && (
          <button
            className="btn btn-primary"
            onClick={handleSyncAll}
            disabled={syncingAll}
          >
            {syncingAll ? '⏳ Syncing…' : `📡 Sync All (${offlineFarmers.length})`}
          </button>
        )}
      </div>

      {/* Info banner */}
      {offlineFarmers.length > 0 && (
        <div className="alert alert-error" style={{ background: '#fef3c7', borderColor: '#fcd34d', color: '#92400e', marginBottom: 20 }}>
          <span>⚠️</span>
          <span>
            <strong>{offlineFarmers.length} farmer{offlineFarmers.length !== 1 ? 's' : ''}</strong> pending sync.
            These records are stored locally only. Sync them to prevent data loss.
          </span>
        </div>
      )}

      <div className="card">
        <div className="section-heading">
          <span>📴 Unsynced Farmers ({offlineFarmers.length})</span>
        </div>

        {offlineFarmers.length > 0 && (
          <div className="filter-bar">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="🔍 Search by name, phone or region…"
            />
          </div>
        )}

        {offlineFarmers.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🎉</div>
            <p>All caught up!</p>
            <small>Every enrolled farmer has been synced with the server.</small>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state" style={{ padding: '30px 20px' }}>
            <div className="icon">🔍</div>
            <p>No results for that search</p>
            <small>Try a different name or phone number.</small>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Region</th>
                  <th>Village</th>
                  <th>Plot (ha)</th>
                  <th>Crop</th>
                  <th>Enrolled At</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(f => (
                  <tr key={f.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{f.firstName} {f.lastName}</div>
                      {f.nationalId && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>ID: {f.nationalId}</div>
                      )}
                    </td>
                    <td>{f.phone}</td>
                    <td>{f.region}</td>
                    <td>{f.village || <span style={{ color: 'var(--text-light)' }}>—</span>}</td>
                    <td>{f.plotSize}</td>
                    <td>{f.primaryCrop}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-light)', whiteSpace: 'nowrap' }}>
                      {formatDate(f.enrolledAt)}
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleSyncOne(f.id)}
                        disabled={syncing === f.id || syncingAll}
                      >
                        {syncing === f.id ? '⏳…' : '📡 Sync'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {offlineFarmers.length > 0 && (
          <div style={{
            marginTop: 16,
            padding: '12px 16px',
            background: 'var(--green-50)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.82rem',
            color: 'var(--text-light)',
          }}>
            💡 Tip: Sync individual farmers or use <strong>Sync All</strong> to upload all pending records at once.
          </div>
        )}
      </div>
    </div>
  )
}
