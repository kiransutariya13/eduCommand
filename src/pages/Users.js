"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import DashboardLayout from "../components/DashboardLayout"
import axios from "axios"

const Users = () => {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/users")
      setUsers(response.data)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getRoleColor = (role) => {
    return role === "admin" ? "role-admin" : "role-teacher"
  }

  if (user?.role !== "admin") {
    return (
      <DashboardLayout>
        <div className="access-denied">
          <h1>Access Denied</h1>
          <p>You don't have permission to view this page.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="users-page">
        <div className="page-header">
          <h1>User Management</h1>
          <p>Manage all users in the system</p>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading users...</p>
          </div>
        ) : (
          <div className="users-list">
            {users.map((userData) => (
              <div key={userData._id} className="user-card">
                <div className="user-avatar">{userData.fullName.charAt(0).toUpperCase()}</div>
                <div className="user-info">
                  <h3>{userData.fullName}</h3>
                  <p className="user-email">{userData.email}</p>
                  <span className={`role-badge ${getRoleColor(userData.role)}`}>{userData.role.toUpperCase()}</span>
                  {userData.schoolId && <p className="user-school">🏫 {userData.schoolId.name}</p>}
                  <p className="user-joined">Joined: {formatDate(userData.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default Users
