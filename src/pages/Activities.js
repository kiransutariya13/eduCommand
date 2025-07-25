"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import DashboardLayout from "../components/DashboardLayout"
import axios from "axios"

const Activities = () => {
  const { user } = useAuth()
  const [activities, setActivities] = useState([])
  const [filteredActivities, setFilteredActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSchool, setSelectedSchool] = useState("all")
  const [selectedMonth, setSelectedMonth] = useState("all")
  const [schools, setSchools] = useState([])
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchActivities()
    if (user?.role === "admin") {
      fetchSchools()
    }
  }, [user])

  useEffect(() => {
    filterActivities()
  }, [activities, searchTerm, selectedSchool, selectedMonth])

  const fetchActivities = async () => {
    try {
      const response = await axios.get("/activities")
      setActivities(response.data)
    } catch (error) {
      console.error("Error fetching activities:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSchools = async () => {
    try {
      const response = await axios.get("/schools")
      setSchools(response.data)
    } catch (error) {
      console.error("Error fetching schools:", error)
    }
  }

  const filterActivities = () => {
    let filtered = activities

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (activity) =>
          activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          activity.schoolId?.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by school
    if (selectedSchool !== "all") {
      filtered = filtered.filter((activity) => activity.schoolId?._id === selectedSchool)
    }

    // Filter by month
    if (selectedMonth !== "all") {
      filtered = filtered.filter((activity) => {
        const activityMonth = new Date(activity.activityDate).getMonth()
        return activityMonth.toString() === selectedMonth
      })
    }

    setFilteredActivities(filtered)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getMonthName = (monthIndex) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]
    return months[monthIndex]
  }

  const openActivityModal = (activity) => {
    setSelectedActivity(activity)
    setShowModal(true)
  }

  const closeModal = () => {
    setSelectedActivity(null)
    setShowModal(false)
  }

  const downloadImage = async (activityId, imageId, originalName) => {
    try {
      const response = await axios.get(`/download/activity-image/${activityId}/${imageId}`, {
        responseType: "blob",
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", originalName)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error downloading image:", error)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading activities...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="activities-page">
        <div className="page-header">
          <h1>School Activities</h1>
          <p>View and manage all school activities and events with images</p>
        </div>

        {/* Filters */}
        <div className="filters-card">
          <div className="card-header">
            <h2>🔍 Filters</h2>
          </div>
          <div className="filters-grid">
            <div className="filter-group">
              <label>Search</label>
              <div className="search-input">
                <input
                  type="text"
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <span className="search-icon">🔍</span>
              </div>
            </div>

            {user?.role === "admin" && (
              <div className="filter-group">
                <label>School</label>
                <select value={selectedSchool} onChange={(e) => setSelectedSchool(e.target.value)}>
                  <option value="all">All Schools</option>
                  {schools.map((school) => (
                    <option key={school._id} value={school._id}>
                      {school.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="filter-group">
              <label>Month</label>
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                <option value="all">All Months</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i.toString()}>
                    {getMonthName(i)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Activities List */}
        <div className="activities-list">
          {filteredActivities.length > 0 ? (
            filteredActivities.map((activity) => (
              <div key={activity._id} className="activity-card">
                <div className="card-header">
                  <div className="activity-info">
                    <h3>🎯 {activity.title}</h3>
                    <div className="activity-meta">
                      <span className="school-name">🏫 {activity.schoolId?.name}</span>
                      <span className="activity-date">📅 {formatDate(activity.activityDate)}</span>
                      {activity.images && activity.images.length > 0 && (
                        <span className="image-count">
                          🖼️ {activity.images.length} image{activity.images.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="activity-badge">{formatDate(activity.createdAt)}</div>
                </div>

                <div className="card-content">
                  <p className="activity-description">{activity.description}</p>

                  {/* Image Thumbnails */}
                  {activity.images && activity.images.length > 0 && (
                    <div className="image-thumbnails">
                      {activity.images.slice(0, 3).map((image, index) => (
                        <div key={image._id} className="thumbnail">
                          <img
                            src={`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/${image.path}`}
                            alt={`Activity ${index + 1}`}
                            onClick={() => openActivityModal(activity)}
                          />
                        </div>
                      ))}
                      {activity.images.length > 3 && (
                        <div className="more-images" onClick={() => openActivityModal(activity)}>
                          +{activity.images.length - 3} more
                        </div>
                      )}
                    </div>
                  )}

                  <div className="activity-footer">
                    <span className="uploaded-by">Uploaded by: {activity.uploadedBy?.fullName}</span>
                    <button className="view-btn" onClick={() => openActivityModal(activity)}>
                      👁️ View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-data-card">
              <div className="no-data-icon">🎯</div>
              <h3>No activities found</h3>
              <p>
                {searchTerm || selectedSchool !== "all" || selectedMonth !== "all"
                  ? "Try adjusting your filters to see more activities."
                  : "No activities have been uploaded yet."}
              </p>
            </div>
          )}
        </div>

        {/* Activity Detail Modal */}
        {showModal && selectedActivity && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{selectedActivity.title}</h2>
                <button className="close-btn" onClick={closeModal}>
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <div className="activity-details">
                  <div className="detail-row">
                    <strong>School:</strong> {selectedActivity.schoolId?.name}
                  </div>
                  <div className="detail-row">
                    <strong>Date:</strong> {formatDate(selectedActivity.activityDate)}
                  </div>
                  <div className="detail-row">
                    <strong>Uploaded by:</strong> {selectedActivity.uploadedBy?.fullName}
                  </div>
                  <div className="detail-row">
                    <strong>Description:</strong>
                    <p>{selectedActivity.description}</p>
                  </div>
                </div>

                {/* Full Image Gallery */}
                {selectedActivity.images && selectedActivity.images.length > 0 && (
                  <div className="image-gallery">
                    <h3>Images ({selectedActivity.images.length})</h3>
                    <div className="gallery-grid">
                      {selectedActivity.images.map((image, index) => (
                        <div key={image._id} className="gallery-item">
                          <img
                            src={`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/${image.path}`}
                            alt={`Activity image ${index + 1}`}
                          />
                          <div className="image-actions">
                            <span className="image-name">{image.originalName}</span>
                            <button
                              className="download-btn"
                              onClick={() => downloadImage(selectedActivity._id, image._id, image.originalName)}
                            >
                              📥 Download
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default Activities
