"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import DashboardLayout from "../components/DashboardLayout"
import axios from "axios"

const Reports = () => {
  const { user } = useAuth()
  const [reports, setReports] = useState([])
  const [filteredReports, setFilteredReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSchool, setSelectedSchool] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [schools, setSchools] = useState([])
  const [selectedReport, setSelectedReport] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchReports()
    if (user?.role === "admin") {
      fetchSchools()
    }
  }, [user])

  useEffect(() => {
    filterReports()
  }, [reports, searchTerm, selectedSchool, selectedType, selectedStatus])

  const fetchReports = async () => {
    try {
      const response = await axios.get("/reports")
      setReports(response.data)
    } catch (error) {
      console.error("Error fetching reports:", error)
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

  const filterReports = () => {
    let filtered = reports

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (report) =>
          report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.schoolId?.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by school
    if (selectedSchool !== "all") {
      filtered = filtered.filter((report) => report.schoolId?._id === selectedSchool)
    }

    // Filter by type
    if (selectedType !== "all") {
      filtered = filtered.filter((report) => report.reportType === selectedType)
    }

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter((report) => report.status === selectedStatus)
    }

    setFilteredReports(filtered)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "published":
        return "status-published"
      case "draft":
        return "status-draft"
      case "review":
        return "status-review"
      default:
        return "status-draft"
    }
  }

  const getTypeColor = (type) => {
    const colors = {
      monthly: "type-monthly",
      quarterly: "type-quarterly",
      annual: "type-annual",
      academic: "type-academic",
      attendance: "type-attendance",
      performance: "type-performance",
    }
    return colors[type] || "type-default"
  }

  const openReportModal = (report) => {
    setSelectedReport(report)
    setShowModal(true)
  }

  const closeModal = () => {
    setSelectedReport(null)
    setShowModal(false)
  }

  const downloadPDF = async (reportId, originalName) => {
    try {
      const response = await axios.get(`/download/report-pdf/${reportId}`, {
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
          <p>Loading reports...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="reports-page">
        <div className="page-header">
          <h1>School Reports</h1>
          <p>View and manage all school reports and assessments with PDF downloads</p>
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
                  placeholder="Search reports..."
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
              <label>Report Type</label>
              <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                <option value="all">All Types</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annual">Annual</option>
                <option value="academic">Academic</option>
                <option value="attendance">Attendance</option>
                <option value="performance">Performance</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Status</label>
              <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="review">Under Review</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="reports-list">
          {filteredReports.length > 0 ? (
            filteredReports.map((report) => (
              <div key={report._id} className="report-card">
                <div className="card-header">
                  <div className="report-info">
                    <h3>📊 {report.title}</h3>
                    <div className="report-meta">
                      <span className="school-name">🏫 {report.schoolId?.name}</span>
                      <span className="report-period">
                        📅 {report.academicYear} - {report.month}
                      </span>
                      {report.pdfFile && <span className="pdf-indicator">📎 PDF Available</span>}
                    </div>
                  </div>
                  <div className="report-badges">
                    <span className={`type-badge ${getTypeColor(report.reportType)}`}>{report.reportType}</span>
                    <span className={`status-badge ${getStatusColor(report.status)}`}>{report.status}</span>
                  </div>
                </div>
                <div className="card-content">
                  <p className="report-content">{report.content}</p>
                  <div className="report-footer">
                    <span className="created-by">
                      Created by: {report.uploadedBy?.fullName} • {formatDate(report.createdAt)}
                    </span>
                    {report.pdfFile && (
                      <button
                        className="download-btn"
                        onClick={() => downloadPDF(report._id, report.pdfFile.originalName)}
                      >
                        📥 Download PDF
                      </button>
                    )}
                    <button className="view-btn" onClick={() => openReportModal(report)}>
                      👁️ View Report
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-data-card">
              <div className="no-data-icon">📊</div>
              <h3>No reports found</h3>
              <p>
                {searchTerm || selectedSchool !== "all" || selectedType !== "all" || selectedStatus !== "all"
                  ? "Try adjusting your filters to see more reports."
                  : "No reports have been uploaded yet."}
              </p>
            </div>
          )}
        </div>

        {/* Report Detail Modal */}
        {showModal && selectedReport && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{selectedReport.title}</h2>
                <button className="close-btn" onClick={closeModal}>
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <div className="report-details">
                  <div className="detail-row">
                    <strong>School:</strong> {selectedReport.schoolId?.name}
                  </div>
                  <div className="detail-row">
                    <strong>Report Type:</strong>
                    <span className={`type-badge ${getTypeColor(selectedReport.reportType)}`}>
                      {selectedReport.reportType}
                    </span>
                  </div>
                  <div className="detail-row">
                    <strong>Academic Year:</strong> {selectedReport.academicYear}
                  </div>
                  <div className="detail-row">
                    <strong>Month:</strong> {selectedReport.month}
                  </div>
                  <div className="detail-row">
                    <strong>Status:</strong>
                    <span className={`status-badge ${getStatusColor(selectedReport.status)}`}>
                      {selectedReport.status}
                    </span>
                  </div>
                  <div className="detail-row">
                    <strong>Created by:</strong> {selectedReport.uploadedBy?.fullName}
                  </div>
                  <div className="detail-row">
                    <strong>Created on:</strong> {formatDate(selectedReport.createdAt)}
                  </div>
                  <div className="detail-row">
                    <strong>Content:</strong>
                    <div className="full-content">{selectedReport.content}</div>
                  </div>

                  {selectedReport.pdfFile && (
                    <div className="detail-row">
                      <strong>Attachment:</strong>
                      <div className="pdf-attachment">
                        <div className="pdf-info">
                          <span className="pdf-icon">📄</span>
                          <span className="pdf-name">{selectedReport.pdfFile.originalName}</span>
                          <span className="pdf-size">{(selectedReport.pdfFile.size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                        <button
                          className="download-btn"
                          onClick={() => downloadPDF(selectedReport._id, selectedReport.pdfFile.originalName)}
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

export default Reports
