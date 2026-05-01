import { useState, useMemo } from 'react'
import Modal from '../components/Modal'

const REGIONS = ['Central','Northern','Eastern','Western','Southern']
const CROPS   = ['Tomatoes','Kale','Spinach','Onions','Carrots','Cabbages','Peppers','Beans','Maize','Other']
const GENDERS = ['Female','Male','Other']

const EMPTY = {
  firstName:'', lastName:'', phone:'', nationalId:'',
  region:'', village:'', plotSize:'', primaryCrop:'',
  gender:'', age:'', notes:'',
}

function initials(f, l) { return `${f?.[0]||''}${l?.[0]||''}`.toUpperCase() }

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })
}

function validate(form) {
  const e = {}
  if (!form.firstName.trim()) e.firstName = 'Required'
  if (!form.lastName.trim())  e.lastName  = 'Required'
  if (!form.phone.trim())     e.phone     = 'Required'
  if (!form.region)           e.region    = 'Select a region'
  if (!form.primaryCrop)      e.primaryCrop = 'Select a crop'
  if (!form.plotSize || isNaN(+form.plotSize) || +form.plotSize <= 0)
    e.plotSize = 'Enter a valid size'
  if (form.age && (isNaN(+form.age) || +form.age < 10 || +form.age > 120))
    e.age = 'Enter a valid age'
  return e
}

const AVATAR_COLORS = [
  ['#2d6a4f','#d8f3dc'],['#1b4332','#b7e4c7'],['#40916c','#f0faf3'],
  ['#52b788','#1b4332'],['#74c69d','#0d2b1e'],
]

function AvatarCircle({ name, idx }) {
  const [bg, fg] = AVATAR_COLORS[idx % AVATAR_COLORS.length]
  return (
    <div className="avatar" style={{ background: bg, color: fg }}>
      {name}
    </div>
  )
}

export default function Farmers({ farmers, addFarmer, updateFarmer, deleteFarmer }) {
  const [showEnroll,  setShowEnroll]  = useState(false)
  const [editTarget,  setEditTarget]  = useState(null)
  const [deleteTarget,setDeleteTarget]= useState(null)
  const [form,        setForm]        = useState(EMPTY)
  const [errors,      setErrors]      = useState({})
  const [submitting,  setSubmitting]  = useState(false)
  const [successMsg,  setSuccessMsg]  = useState('')

  const [search,      setSearch]      = useState('')
  const [regionF,     setRegionF]     = useState('')
  const [cropF,       setCropF]       = useState('')
  const [statusF,     setStatusF]     = useState('')
  const [sortKey,     setSortKey]     = useState('enrolledAt')
  const [sortDir,     setSortDir]     = useState('desc')

  /* ── open edit ── */
  function openEdit(f) {
    setEditTarget(f)
    setForm({
      firstName: f.firstName, lastName: f.lastName, phone: f.phone,
      nationalId: f.nationalId||'', region: f.region, village: f.village||'',
      plotSize: String(f.plotSize), primaryCrop: f.primaryCrop,
      gender: f.gender||'', age: String(f.age||''), notes: f.notes||'',
    })
    setErrors({})
  }

  /* ── open enroll ── */
  function openEnroll() { setForm(EMPTY); setErrors({}); setShowEnroll(true) }

  /* ── close all ── */
  function closeAll() { setShowEnroll(false); setEditTarget(null); setDeleteTarget(null); setErrors({}) }

  /* ── handle field change ── */
  function handleChange(e) {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: value }))
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }))
  }

  /* ── submit enroll ── */
  async function handleEnroll(e) {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 500))
    addFarmer(form)
    setSuccessMsg(`${form.firstName} ${form.lastName} enrolled!`)
    setTimeout(() => setSuccessMsg(''), 4000)
    closeAll()
    setSubmitting(false)
  }

  /* ── submit edit ── */
  async function handleEdit(e) {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 400))
    updateFarmer(editTarget.id, form)
    setSuccessMsg(`${form.firstName} ${form.lastName} updated!`)
    setTimeout(() => setSuccessMsg(''), 3000)
    closeAll()
    setSubmitting(false)
  }

  /* ── confirm delete ── */
  async function handleDelete() {
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 300))
    deleteFarmer(deleteTarget.id)
    setSuccessMsg(`${deleteTarget.firstName} ${deleteTarget.lastName} removed.`)
    setTimeout(() => setSuccessMsg(''), 3000)
    closeAll()
    setSubmitting(false)
  }

  /* ── sort toggle ── */
  function handleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  /* ── filtered + sorted ── */
  const displayed = useMemo(() => {
    const q = search.toLowerCase()
    return farmers
      .filter(f => {
        const matchQ = !q || `${f.firstName} ${f.lastName}`.toLowerCase().includes(q)
          || f.phone.includes(q) || (f.nationalId||'').toLowerCase().includes(q)
          || (f.village||'').toLowerCase().includes(q)
        const matchR = !regionF || f.region === regionF
        const matchC = !cropF   || f.primaryCrop === cropF
        const matchS = !statusF || (statusF === 'synced' ? f.synced : !f.synced)
        return matchQ && matchR && matchC && matchS
      })
      .sort((a, b) => {
        let va = a[sortKey], vb = b[sortKey]
        if (typeof va === 'string') va = va.toLowerCase()
        if (typeof vb === 'string') vb = vb.toLowerCase()
        return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1)
      })
  }, [farmers, search, regionF, cropF, statusF, sortKey, sortDir])

  const SortTh = ({ label, field }) => (
    <th onClick={() => handleSort(field)} className={sortKey === field ? 'sorted' : ''}>
      {label}
      <span className="sort-icon">{sortKey === field ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}</span>
    </th>
  )

  const FormFields = () => (
    <div className="form-grid">
      <div className="form-group">
        <label>First Name <span className="required">*</span></label>
        <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="Grace" autoFocus />
        {errors.firstName && <span className="field-error">⚠ {errors.firstName}</span>}
      </div>
      <div className="form-group">
        <label>Last Name <span className="required">*</span></label>
        <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Nakato" />
        {errors.lastName && <span className="field-error">⚠ {errors.lastName}</span>}
      </div>
      <div className="form-group">
        <label>Phone <span className="required">*</span></label>
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="0701234567" />
        {errors.phone && <span className="field-error">⚠ {errors.phone}</span>}
      </div>
      <div className="form-group">
        <label>National ID</label>
        <input name="nationalId" value={form.nationalId} onChange={handleChange} placeholder="Optional" />
      </div>
      <div className="form-group">
        <label>Region <span className="required">*</span></label>
        <select name="region" value={form.region} onChange={handleChange}>
          <option value="">— Select —</option>
          {REGIONS.map(r => <option key={r}>{r}</option>)}
        </select>
        {errors.region && <span className="field-error">⚠ {errors.region}</span>}
      </div>
      <div className="form-group">
        <label>Village / Sub-county</label>
        <input name="village" value={form.village} onChange={handleChange} placeholder="e.g. Namugongo" />
      </div>
      <div className="form-group">
        <label>Plot Size (ha) <span className="required">*</span></label>
        <input name="plotSize" type="number" step="0.01" min="0.01" value={form.plotSize} onChange={handleChange} placeholder="0.5" />
        {errors.plotSize && <span className="field-error">⚠ {errors.plotSize}</span>}
      </div>
      <div className="form-group">
        <label>Primary Crop <span className="required">*</span></label>
        <select name="primaryCrop" value={form.primaryCrop} onChange={handleChange}>
          <option value="">— Select —</option>
          {CROPS.map(c => <option key={c}>{c}</option>)}
        </select>
        {errors.primaryCrop && <span className="field-error">⚠ {errors.primaryCrop}</span>}
      </div>
      <div className="form-group">
        <label>Gender</label>
        <select name="gender" value={form.gender} onChange={handleChange}>
          <option value="">— Optional —</option>
          {GENDERS.map(g => <option key={g}>{g}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label>Age</label>
        <input name="age" type="number" min="10" max="120" value={form.age} onChange={handleChange} placeholder="Optional" />
        {errors.age && <span className="field-error">⚠ {errors.age}</span>}
      </div>
      <div className="form-group full">
        <label>Notes</label>
        <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Additional information…" />
      </div>
    </div>
  )

  return (
    <div>
      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Farmers</h1>
          <p className="page-subtitle">
            {farmers.length} enrolled · {farmers.filter(f=>!f.synced).length} pending sync
          </p>
        </div>
        <button className="btn btn-primary no-print" onClick={openEnroll}>
          + Enroll Farmer
        </button>
      </div>

      {successMsg && (
        <div className="alert alert-success" style={{ marginBottom: 20 }}>✅ {successMsg}</div>
      )}

      {/* ── Filter Bar ── */}
      <div className="card" style={{ marginBottom: 20, padding: '16px 20px' }}>
        <div className="filter-bar" style={{ marginBottom: 0 }}>
          <div className="search-input-wrap">
            <span className="search-icon">🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, phone or ID…" />
          </div>
          <select value={regionF} onChange={e => setRegionF(e.target.value)} style={{ minWidth: 140 }}>
            <option value="">All Regions</option>
            {REGIONS.map(r => <option key={r}>{r}</option>)}
          </select>
          <select value={cropF} onChange={e => setCropF(e.target.value)} style={{ minWidth: 130 }}>
            <option value="">All Crops</option>
            {CROPS.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={statusF} onChange={e => setStatusF(e.target.value)} style={{ minWidth: 130 }}>
            <option value="">All Status</option>
            <option value="synced">Synced</option>
            <option value="offline">Offline</option>
          </select>
          {(search || regionF || cropF || statusF) && (
            <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setRegionF(''); setCropF(''); setStatusF('') }}>
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <div className="card-title-icon">👥</div>
            Enrolled Farmers
            <span className="badge badge-green">{displayed.length}</span>
          </div>
        </div>

        {displayed.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">{farmers.length === 0 ? '🌱' : '🔍'}</div>
            <h3>{farmers.length === 0 ? 'No farmers yet' : 'No results found'}</h3>
            <p>{farmers.length === 0 ? 'Enroll your first farmer to get started.' : 'Try adjusting your search or filters.'}</p>
            {farmers.length === 0 && (
              <button className="btn btn-primary btn-sm" onClick={openEnroll}>+ Enroll Farmer</button>
            )}
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <SortTh label="Name"      field="firstName" />
                  <SortTh label="Phone"     field="phone"     />
                  <SortTh label="Region"    field="region"    />
                  <th>Village</th>
                  <SortTh label="Plot (ha)" field="plotSize"  />
                  <SortTh label="Crop"      field="primaryCrop" />
                  <SortTh label="Enrolled"  field="enrolledAt"  />
                  <th>Status</th>
                  <th style={{ width: 90 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((f, idx) => (
                  <tr key={f.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <AvatarCircle name={initials(f.firstName, f.lastName)} idx={idx} />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{f.firstName} {f.lastName}</div>
                          {f.gender && <div style={{ fontSize: '0.72rem', color: 'var(--text-4)' }}>{f.gender}{f.age ? `, ${f.age}` : ''}</div>}
                        </div>
                      </div>
                    </td>
                    <td>{f.phone}</td>
                    <td>{f.region}</td>
                    <td style={{ color: 'var(--text-3)' }}>{f.village || '—'}</td>
                    <td style={{ fontWeight: 600 }}>{f.plotSize}</td>
                    <td>{f.primaryCrop}</td>
                    <td style={{ color: 'var(--text-3)', fontSize: '0.8rem' }}>{fmtDate(f.enrolledAt)}</td>
                    <td>
                      <span className={`badge ${f.synced ? 'badge-synced' : 'badge-offline'}`}>
                        {f.synced ? '✓ Synced' : '⏳ Offline'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="btn btn-ghost btn-xs"
                          onClick={() => openEdit(f)}
                          title="Edit"
                        >✏️</button>
                        <button
                          className="btn btn-danger btn-xs"
                          onClick={() => setDeleteTarget(f)}
                          title="Delete"
                        >🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Mobile FAB ── */}
      <button className="btn-fab no-print" onClick={openEnroll} title="Enroll Farmer">+</button>

      {/* ── Enroll Modal ── */}
      {showEnroll && (
        <Modal
          title="🌿 Enroll New Farmer"
          onClose={closeAll}
          size="lg"
          footer={
            <>
              <button className="btn btn-outline" onClick={closeAll} disabled={submitting}>Cancel</button>
              <button className="btn btn-primary" onClick={handleEnroll} disabled={submitting}>
                {submitting ? <><span className="spinner" /> Saving…</> : '💾 Save & Enroll'}
              </button>
            </>
          }
        >
          <form onSubmit={handleEnroll} noValidate><FormFields /></form>
        </Modal>
      )}

      {/* ── Edit Modal ── */}
      {editTarget && (
        <Modal
          title={`✏️ Edit — ${editTarget.firstName} ${editTarget.lastName}`}
          onClose={closeAll}
          size="lg"
          footer={
            <>
              <button className="btn btn-outline" onClick={closeAll} disabled={submitting}>Cancel</button>
              <button className="btn btn-primary" onClick={handleEdit} disabled={submitting}>
                {submitting ? <><span className="spinner" /> Saving…</> : '💾 Save Changes'}
              </button>
            </>
          }
        >
          <form onSubmit={handleEdit} noValidate><FormFields /></form>
        </Modal>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteTarget && (
        <Modal
          title="Delete Farmer"
          onClose={closeAll}
          size="sm"
          footer={
            <>
              <button className="btn btn-outline" onClick={closeAll} disabled={submitting}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={submitting}>
                {submitting ? <><span className="spinner spinner-dark" /> Deleting…</> : '🗑 Delete'}
              </button>
            </>
          }
        >
          <div className="alert alert-danger" style={{ marginBottom: 16 }}>
            <span>⚠️</span>
            <span>This action cannot be undone.</span>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-2)' }}>
            Remove <strong>{deleteTarget.firstName} {deleteTarget.lastName}</strong> from the enrollment list?
          </p>
        </Modal>
      )}
    </div>
  )
}
