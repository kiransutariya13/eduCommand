"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import DashboardLayout from "../components/DashboardLayout"
import axios from "axios"

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await axios.get("/dashboard/stats")
      setStats(response.data)
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="dashboard-page">
        <div className="page-header">
          <h1>Welcome back, {user?.fullName}! 👋</h1>
          <p>Here's what's happening in the Bhavnagar school system today.</p>
        </div>

        <div className="stats-grid">
          {user?.role === "admin" ? (
            <>
              <div className="stat-card">
                <div className="stat-icon">🏫</div>
                <div className="stat-content">
                  <h3>{stats.totalSchools || 0}</h3>
                  <p>Total Schools</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <h3>{stats.totalUsers || 0}</h3>
                  <p>Total Users</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">🎯</div>
                <div className="stat-content">
                  <h3>{stats.totalActivities || 0}</h3>
                  <p>Total Activities</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">📄</div>
                <div className="stat-content">
                  <h3>{stats.totalCirculars || 0}</h3>
                  <p>Total Circulars</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <h3>{stats.totalReports || 0}</h3>
                  <p>Total Reports</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="stat-card">
                <div className="stat-icon">🎯</div>
                <div className="stat-content">
                  <h3>{stats.schoolActivities || 0}</h3>
                  <p>School Activities</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">📄</div>
                <div className="stat-content">
                  <h3>{stats.totalCirculars || 0}</h3>
                  <p>Available Circulars</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <h3>{stats.schoolReports || 0}</h3>
                  <p>School Reports</p>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="dashboard-content">
          <div className="welcome-card">
            <h2>🎯 Quick Actions</h2>
            <div className="quick-actions">
              <a href="/upload" className="action-btn">
                <span className="action-icon">📤</span>
                <div>
                  <h3>Upload Content</h3>
                  <p>Add new activities, circulars, or reports</p>
                </div>
              </a>

              <a href="/activities" className="action-btn">
                <span className="action-icon">🎯</span>
                <div>
                  <h3>View Activities</h3>
                  <p>Browse school activities and events</p>
                </div>
              </a>

              <a href="/circulars" className="action-btn">
                <span className="action-icon">📄</span>
                <div>
                  <h3>Read Circulars</h3>
                  <p>Check latest official announcements</p>
                </div>
              </a>

              <a href="/reports" className="action-btn">
                <span className="action-icon">📊</span>
                <div>
                  <h3>View Reports</h3>
                  <p>Access school performance reports</p>
                </div>
              </a>
            </div>
          </div>

          {user?.role === "teacher" && user?.schoolName && (
            <div className="school-info-card">
              <h2>🏫 Your School</h2>
              <div className="school-details">
                <h3>{user.schoolName}</h3>
                <p>You are logged in as a teacher for this school.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Dashboard
