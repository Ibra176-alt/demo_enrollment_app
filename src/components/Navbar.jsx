import { NavLink, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/',        icon: '⊞',  label: 'Dashboard' },
  { to: '/farmers', icon: '🌿', label: 'Farmers'   },
  { to: '/offline', icon: '📴', label: 'Offline'   },
  { to: '/reports', icon: '📊', label: 'Reports'   },
]

function getToday() {
  return new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

export default function Navbar({ offlineCount }) {
  const { pathname } = useLocation()

  return (
    <>
      {/* ── Desktop top navbar ── */}
      <nav className="navbar">
        <NavLink to="/" className="navbar-brand">
          <div className="brand-icon">🌿</div>
          <div>
            <div className="brand-text-main">HERVeg.05</div>
            <div className="brand-text-sub">small plots, big impact.</div>
          </div>
        </NavLink>

        <ul className="nav-links">
          {NAV_ITEMS.map(({ to, icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                <span className="nav-icon">{icon}</span>
                <span>{label}</span>
                {label === 'Offline' && offlineCount > 0 && (
                  <span className="nav-badge">{offlineCount}</span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="navbar-right">
          <span className="navbar-date">{getToday()}</span>
        </div>
      </nav>

      {/* ── Mobile bottom navbar ── */}
      <nav className="bottom-nav">
        <div className="bottom-nav-inner">
          {NAV_ITEMS.map(({ to, icon, label }) => {
            const isActive = to === '/' ? pathname === '/' : pathname.startsWith(to)
            return (
              <NavLink
                key={to}
                to={to}
                className={`bottom-nav-item${isActive ? ' active' : ''}`}
              >
                {isActive && <span className="bottom-nav-dot" />}
                <span className="nav-icon">{icon}</span>
                <span>{label}</span>
                {label === 'Offline' && offlineCount > 0 && (
                  <span className="bottom-nav-badge">{offlineCount}</span>
                )}
              </NavLink>
            )
          })}
        </div>
      </nav>
    </>
  )
}
