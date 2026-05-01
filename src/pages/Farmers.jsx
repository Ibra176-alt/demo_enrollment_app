import { useState } from 'react'

const REGIONS = ['Central', 'Northern', 'Eastern', 'Western', 'Southern']
const CROPS   = ['Tomatoes', 'Kale', 'Spinach', 'Onions', 'Carrots', 'Cabbages', 'Peppers', 'Other']

const EMPTY = {
  firstName: '', lastName: '', phone: '', nationalId: '',
  region: '', village: '', plotSize: '', primaryCrop: '', notes: '',
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export default function Farmers({ farmers, addFarmer, deleteFarmer }) {
  const [form, setForm]         = useState(EMPTY)
  const [errors, setErrors]     = useState({})
  const [success, setSuccess]   = useState('')
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch]     = useState('')
  const [regionFilter, setRegionFilter] = useState('')

  function validate() {
    const e = {}
    if (!form.firstName.trim()) e.firstName = 'Required'
    if (!form.lastName.trim())  e.lastName  = 'Required'
    if (!form.phone.trim())     e.phone     = 'Required'
    if (!form.region)           e.region    = 'Required'
    if (!form.plotSize || isNaN(form.plotSize) || Number(form.plotSize) <= 0)
      e.plotSize = 'Enter a valid size'
    if (!form.primaryCrop)      e.primaryCrop = 'Required'
    return e
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    addFarmer({ ...form, plotSize: Number(form.plotSize) })
    setForm(EMPTY)
    setErrors({})
    setSuccess(`${form.firstName} ${form.lastName} enrolled successfully!`)
    setTimeout(() => setSuccess(''), 4000)
    setShowForm(false)
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const filtered = farmers.filter(f => {
    const q = search.toLowerCase()
    const matchQ = !q ||
      `${f.firstName} ${f.lastName}`.toLowerCase().includes(q) ||
      f.phone.includes(q) ||
      (f.nationalId || '').toLowerCase().includes(q)
    const matchR = !regionFilter || f.region === regionFilter
    return matchQ && matchR
  })

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">Farmers</h1>
          <p className="page-subtitle">Enroll and manage participating farmers</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => { setShowForm(v => !v); setErrors({}); setForm(EMPTY) }}
        >
          {showForm ? '✕ Cancel' : '+ Enroll Farmer'}
        </button>
      </div>

      {/* Enrollment form */}
      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-title">🌿 New Farmer Enrollment</div>
          {success && <div className="alert alert-success">✅ {success}</div>}
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-grid">
              <div className="form-group">
                <label>First Name *</label>
                <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="e.g. Grace" />
                {errors.firstName && <span style={{ color: '#dc2626', fontSize: '0.78rem' }}>{errors.firstName}</span>}
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="e.g. Nakato" />
                {errors.lastName && <span style={{ color: '#dc2626', fontSize: '0.78rem' }}>{errors.lastName}</span>}
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="e.g. 0701234567" />
                {errors.phone && <span style={{ color: '#dc2626', fontSize: '0.78rem' }}>{errors.phone}</span>}
              </div>
              <div className="form-group">
                <label>National ID</label>
                <input name="nationalId" value={form.nationalId} onChange={handleChange} placeholder="Optional" />
              </div>
              <div className="form-group">
                <label>Region *</label>
                <select name="region" value={form.region} onChange={handleChange}>
                  <option value="">-- Select Region --</option>
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                {errors.region && <span style={{ color: '#dc2626', fontSize: '0.78rem' }}>{errors.region}</span>}
              </div>
              <div className="form-group">
                <label>Village / Sub-county</label>
                <input name="village" value={form.village} onChange={handleChange} placeholder="e.g. Namugongo" />
              </div>
              <div className="form-group">
                <label>Plot Size (hectares) *</label>
                <input name="plotSize" type="number" step="0.01" min="0.01" value={form.plotSize} onChange={handleChange} placeholder="e.g. 0.5" />
                {errors.plotSize && <span style={{ color: '#dc2626', fontSize: '0.78rem' }}>{errors.plotSize}</span>}
              </div>
              <div className="form-group">
                <label>Primary Crop *</label>
                <select name="primaryCrop" value={form.primaryCrop} onChange={handleChange}>
                  <option value="">-- Select Crop --</option>
                  {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.primaryCrop && <span style={{ color: '#dc2626', fontSize: '0.78rem' }}>{errors.primaryCrop}</span>}
              </div>
              <div className="form-group full-width">
                <label>Notes</label>
                <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Any additional information…" />
              </div>
            </div>
            <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
              <button type="submit" className="btn btn-primary">💾 Save &amp; Enroll</button>
              <button type="button" className="btn btn-secondary" onClick={() => { setForm(EMPTY); setErrors({}) }}>
                Clear
              </button>
            </div>
          </form>
        </div>
      )}

      {success && !showForm && (
        <div className="alert alert-success">✅ {success}</div>
      )}

      {/* Enrolled farmers table */}
      <div className="card">
        <div className="section-heading">
          <span>👥 Enrolled Farmers ({farmers.length})</span>
        </div>

        <div className="filter-bar">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Search by name, phone or ID…"
          />
          <select value={regionFilter} onChange={e => setRegionFilter(e.target.value)} style={{ maxWidth: 180 }}>
            <option value="">All Regions</option>
            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🌱</div>
            <p>{farmers.length === 0 ? 'No farmers enrolled yet' : 'No results found'}</p>
            <small>
              {farmers.length === 0
                ? 'Click "Enroll Farmer" to add the first farmer.'
                : 'Try adjusting your search or filters.'}
            </small>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Region</th>
                  <th>Plot (ha)</th>
                  <th>Crop</th>
                  <th>Enrolled</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(f => (
                  <tr key={f.id}>
                    <td style={{ fontWeight: 600 }}>{f.firstName} {f.lastName}</td>
                    <td>{f.phone}</td>
                    <td>{f.region}</td>
                    <td>{f.plotSize}</td>
                    <td>{f.primaryCrop}</td>
                    <td style={{ color: 'var(--text-light)', fontSize: '0.82rem' }}>{formatDate(f.enrolledAt)}</td>
                    <td>
                      <span className={`badge ${f.synced ? 'badge-synced' : 'badge-offline'}`}>
                        {f.synced ? '✓ Synced' : '⏳ Offline'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => {
                          if (confirm(`Remove ${f.firstName} ${f.lastName}?`)) deleteFarmer(f.id)
                        }}
                        title="Delete"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
