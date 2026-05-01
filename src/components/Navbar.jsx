import { NavLink } from 'react-router-dom'

const LeafIcon = () => (
  <svg width="32" height="32" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 68C12 68 20 30 60 14C60 14 64 50 28 62" fill="#4ade80"/>
    <path d="M12 68C12 68 20 30 60 14" stroke="#d4ed5a" strokeWidth="3" strokeLinecap="round"/>
  </svg>
)

export default function Navbar({ offlineCount }) {
  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-brand">
        <LeafIcon />
        <div>
          <div className="navbar-title">HERVeg.05</div>
          <div className="navbar-subtitle">small plots, big impact.</div>
        </div>
      </NavLink>

      <ul className="nav-links">
        <li>
          <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
            <span>🏠</span>
            <span className="nav-label">Home</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/farmers" className={({ isActive }) => isActive ? 'active' : ''}>
            <span>🌿</span>
            <span className="nav-label">Farmers</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/offline" className={({ isActive }) => isActive ? 'active' : ''}>
            <span>📴</span>
            <span className="nav-label">Offline</span>
            {offlineCount > 0 && (
              <span className="nav-badge">{offlineCount}</span>
            )}
          </NavLink>
        </li>
      </ul>
    </nav>
  )
}
