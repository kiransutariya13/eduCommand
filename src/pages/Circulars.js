"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "../components/DashboardLayout"
import axios from "axios"

const Circulars = () => {
  const [circulars, setCirculars] = useState([])
  const [filteredCirculars, setFilteredCirculars] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPriority, setSelectedPriority] = useState("all")
  const [selectedMonth, setSelectedMonth] = useState("all")
  const [selectedCircular, setSelectedCircular] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchCirculars()
  }, [])

  useEffect(() => {
    filterCirculars()
  }, [circulars, searchTerm, selectedPriority, selectedMonth])

  const fetchCirculars = async () => {
    try {
      const response = await axios.get("/circulars")
      setCirculars(response.data)
    } catch (error) {
      console.error("Error fetching circulars:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterCirculars = () => {
    let filtered = circulars

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (circular) =>
          circular.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          circular.circularNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          circular.content.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by priority
    if (selectedPriority !== "all") {
      filtered = filtered.filter((circular) => circular.priority === selectedPriority)
    }

    // Filter by month
    if (selectedMonth !== "all") {
      filtered = filtered.filter((circular) => {
        const circularMonth = new Date(circular.issueDate).getMonth()
        return circularMonth.toString() === selectedMonth
      })
    }

    setFilteredCirculars(filtered)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "priority-urgent"
      case "high":
        return "priority-high"
      case "medium":
        return "priority-medium"
      case "low":
        return "priority-low"
      default:
        return "priority-medium"
    }
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

  const openCircularModal = (circular) => {
    setSelectedCircular(circular)
    setShowModal(true)
  }

  const closeModal = () => {
    setSelectedCircular(null)
    setShowModal(false)
  }

  const downloadPDF = async (circularId, originalName) => {
    try {
      const response = await axios.get(`/download/circular-pdf/${circularId}`, {
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
      console.error("Error downloading PDF:", error)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading circulars...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="circulars-page">
        <div className="page-header">
          <h1>Official Circulars</h1>
          <p>View all official circulars and announcements with PDF downloads</p>
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
                  placeholder="Search circulars..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <span className="search-icon">🔍</span>
              </div>
            </div>

            <div className="filter-group">
              <label>Priority</label>
              <select value={selectedPriority} onChange={(e) => setSelectedPriority(e.target.value)}>
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

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

        {/* Circulars List */}
        <div className="circulars-list">
          {filteredCirculars.length > 0 ? (
            filteredCirculars.map((circular) => (
              <div key={circular._id} className="circular-card">
                <div className="card-header">
                  <div className="circular-info">
                    <h3>📄 {circular.title}</h3>
                    <div className="circular-meta">
                      <span className="circular-date">📅 {formatDate(circular.issueDate)}</span>
                      <span className="circular-number">{circular.circularNumber}</span>
                      {circular.pdfFile && <span className="pdf-indicator">📎 PDF Available</span>}
                    </div>
                  </div>
                  <div className="circular-badges">
                    <span className={`priority-badge ${getPriorityColor(circular.priority)}`}>
                      {circular.priority === "urgent" && "🚨"}
                      {circular.priority === "high" && "⚠️"}
                      {circular.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="card-content">
                  <p className="circular-content">{circular.content}</p>
                  <div className="circular-footer">
                    <span className="issued-by">Issued by: {circular.uploadedBy?.fullName}</span>
                    {circular.pdfFile && (
                      <button
                        className="download-btn"
                        onClick={() => downloadPDF(circular._id, circular.pdfFile.originalName)}
                      >
                        📥 Download PDF
                      </button>
                    )}
                    <button className="view-btn" onClick={() => openCircularModal(circular)}>
                      👁️ Read Full Circular
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-data-card">
              <div className="no-data-icon">📄</div>
              <h3>No circulars found</h3>
              <p>
                {searchTerm || selectedPriority !== "all" || selectedMonth !== "all"
                  ? "Try adjusting your filters to see more circulars."
                  : "No circulars have been issued yet."}
              </p>
            </div>
          )}
        </div>

        {/* Circular Detail Modal */}
        {showModal && selectedCircular && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{selectedCircular.title}</h2>
                <button className="close-btn" onClick={closeModal}>
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <div className="circular-details">
                  <div className="detail-row">
                    <strong>Circular Number:</strong> {selectedCircular.circularNumber}
                  </div>
                  <div className="detail-row">
                    <strong>Issue Date:</strong> {formatDate(selectedCircular.issueDate)}
                  </div>
                  <div className="detail-row">
                    <strong>Priority:</strong>
                    <span className={`priority-badge ${getPriorityColor(selectedCircular.priority)}`}>
                      {selectedCircular.priority.toUpperCase()}
                    </span>
                  </div>
                  <div className="detail-row">
                    <strong>Issued by:</strong> {selectedCircular.uploadedBy?.fullName}
                  </div>
                  <div className="detail-row">
                    <strong>Content:</strong>
                    <div className="full-content">{selectedCircular.content}</div>
                  </div>

                  {selectedCircular.pdfFile && (
                    <div className="detail-row">
                      <strong>Attachment:</strong>
                      <div className="pdf-attachment">
                        <div className="pdf-info">
                          <span className="pdf-icon">📄</span>
                          <span className="pdf-name">{selectedCircular.pdfFile.originalName}</span>
                          <span className="pdf-size">
                            {(selectedCircular.pdfFile.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                        <button
                          className="download-btn"
                          onClick={() => downloadPDF(selectedCircular._id, selectedCircular.pdfFile.originalName)}
                        >
                          📥 Download PDF
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default Circulars
