"use client"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const isActive = (path) => {
    return location.pathname === path ? "active" : ""
  }

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>🏫 BMC Schools</h2>
          <p>Monitoring System</p>
        </div>

        <nav className="sidebar-nav">
          <Link to="/dashboard" className={`nav-item ${isActive("/dashboard")}`}>
            <span className="nav-icon">📊</span>
            Dashboard
          </Link>

          <Link to="/upload" className={`nav-item ${isActive("/upload")}`}>
            <span className="nav-icon">📤</span>
            Upload Content
          </Link>

          <Link to="/activities" className={`nav-item ${isActive("/activities")}`}>
            <span className="nav-icon">🎯</span>
            Activities
          </Link>

          <Link to="/circulars" className={`nav-item ${isActive("/circulars")}`}>
            <span className="nav-icon">📄</span>
            Circulars
          </Link>

          <Link to="/reports" className={`nav-item ${isActive("/reports")}`}>
            <span className="nav-icon">📈</span>
            Reports
          </Link>

          {user?.role === "admin" && (
            <>
              <Link to="/schools" className={`nav-item ${isActive("/schools")}`}>
                <span className="nav-icon">🏫</span>
                Schools
              </Link>

              <Link to="/users" className={`nav-item ${isActive("/users")}`}>
                <span className="nav-icon">👥</span>
                Users
              </Link>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.fullName?.charAt(0).toUpperCase()}</div>
            <div className="user-details">
              <p className="user-name">{user?.fullName}</p>
              <p className="user-role">{user?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            🚪 Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="content-wrapper">{children}</div>
      </main>
    </div>
  )
}

export default DashboardLayout
