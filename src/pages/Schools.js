"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useToast } from "../contexts/ToastContext"
import DashboardLayout from "../components/DashboardLayout"
import axios from "axios"

const Schools = () => {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [schools, setSchools] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    principalName: "",
    contactNumber: "",
    email: "",
    establishedYear: "",
    totalStudents: "",
    totalTeachers: "",
  })

  useEffect(() => {
    fetchSchools()
  }, [])

  const fetchSchools = async () => {
    try {
      const response = await axios.get("/schools")
      setSchools(response.data)
    } catch (error) {
      console.error("Error fetching schools:", error)
      addToast("Failed to fetch schools", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await axios.post("/schools", formData)
      addToast("School added successfully!", "success")
      setShowModal(false)
      setFormData({
        name: "",
        address: "",
        principalName: "",
        contactNumber: "",
        email: "",
        establishedYear: "",
        totalStudents: "",
        totalTeachers: "",
      })
      fetchSchools()
    } catch (error) {
      addToast(error.response?.data?.error || "Failed to add school", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
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
      <div className="schools-page">
        <div className="page-header">
          <h1>School Management</h1>
          <p>Manage all schools in the Bhavnagar Municipal Corporation system</p>
          <button className="add-btn" onClick={() => setShowModal(true)}>
            ➕ Add New School
          </button>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading schools...</p>
          </div>
        ) : (
          <div className="schools-grid">
            {schools.map((school) => (
              <div key={school._id} className="school-card">
                <div className="school-header">
                  <h3>🏫 {school.name}</h3>
                  <span className="established">Est. {school.establishedYear}</span>
                </div>
                <div className="school-details">
                  <p>
                    <strong>Principal:</strong> {school.principalName}
                  </p>
                  <p>
                    <strong>Address:</strong> {school.address}
                  </p>
                  <p>
                    <strong>Contact:</strong> {school.contactNumber}
                  </p>
                  <p>
                    <strong>Email:</strong> {school.email}
                  </p>
                  <div className="school-stats">
                    <div className="stat">
                      <span className="stat-number">{school.totalStudents}</span>
                      <span className="stat-label">Students</span>
                    </div>
                    <div className="stat">
                      <span className="stat-number">{school.totalTeachers}</span>
                      <span className="stat-label">Teachers</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add School Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Add New School</h2>
                <button className="close-btn" onClick={() => setShowModal(false)}>
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="school-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>School Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter school name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Established Year</label>
                    <input
                      type="number"
                      name="establishedYear"
                      value={formData.establishedYear}
                      onChange={handleChange}
                      placeholder="e.g., 1985"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter complete address"
                    rows="3"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Principal Name</label>
                    <input
                      type="text"
                      name="principalName"
                      value={formData.principalName}
                      onChange={handleChange}
                      placeholder="Enter principal's name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Contact Number</label>
                    <input
                      type="tel"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      placeholder="Enter contact number"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter school email"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Total Students</label>
                    <input
                      type="number"
                      name="totalStudents"
                      value={formData.totalStudents}
                      onChange={handleChange}
                      placeholder="Number of students"
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Total Teachers</label>
                    <input
                      type="number"
                      name="totalTeachers"
                      value={formData.totalTeachers}
                      onChange={handleChange}
                      placeholder="Number of teachers"
                      min="0"
                    />
                  </div>
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? "Adding..." : "Add School"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default Schools
