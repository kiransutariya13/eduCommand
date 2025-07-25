"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useToast } from "../contexts/ToastContext"
import DashboardLayout from "../components/DashboardLayout"
import axios from "axios"

const Upload = () => {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [activeTab, setActiveTab] = useState("activity")
  const [schools, setSchools] = useState([])
  const [loading, setLoading] = useState(false)

  // Activity form state with multiple images
  const [activityForm, setActivityForm] = useState({
    title: "",
    description: "",
    activityDate: "",
    schoolId: "",
    images: [],
  })

  // Circular form state with PDF
  const [circularForm, setCircularForm] = useState({
    title: "",
    content: "",
    circularNumber: "",
    issueDate: "",
    priority: "medium",
    pdfFile: null,
  })

  // Report form state with PDF
  const [reportForm, setReportForm] = useState({
    title: "",
    reportType: "",
    schoolId: "",
    academicYear: "",
    month: "",
    content: "",
    pdfFile: null,
  })

  // Preview states
  const [imagePreviews, setImagePreviews] = useState([])
  const [pdfPreview, setPdfPreview] = useState(null)

  useEffect(() => {
    if (user?.role === "admin") {
      fetchSchools()
    }
  }, [user])

  const fetchSchools = async () => {
    try {
      const response = await axios.get("/schools")
      setSchools(response.data)
    } catch (error) {
      console.error("Error fetching schools:", error)
    }
  }

  // Handle multiple image selection for activities
  const handleImageSelection = (e) => {
    const files = Array.from(e.target.files)

    if (files.length > 5) {
      addToast("Maximum 5 images allowed", "error")
      return
    }

    // Validate file types
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"]
    const invalidFiles = files.filter((file) => !validTypes.includes(file.type))

    if (invalidFiles.length > 0) {
      addToast("Only JPG, PNG, and GIF images are allowed", "error")
      return
    }

    // Validate file sizes (5MB per image)
    const oversizedFiles = files.filter((file) => file.size > 5 * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      addToast("Each image must be less than 5MB", "error")
      return
    }

    setActivityForm({ ...activityForm, images: files })

    // Create previews
    const previews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + " MB",
    }))

    setImagePreviews(previews)
  }

  // Handle PDF selection
  const handlePdfSelection = (e, formType) => {
    const file = e.target.files[0]

    if (!file) return

    if (file.type !== "application/pdf") {
      addToast("Only PDF files are allowed", "error")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      addToast("PDF file must be less than 10MB", "error")
      return
    }

    if (formType === "circular") {
      setCircularForm({ ...circularForm, pdfFile: file })
    } else if (formType === "report") {
      setReportForm({ ...reportForm, pdfFile: file })
    }

    setPdfPreview({
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + " MB",
      type: formType,
    })
  }

  // Remove image preview
  const removeImagePreview = (index) => {
    const newImages = [...activityForm.images]
    const newPreviews = [...imagePreviews]

    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(newPreviews[index].url)

    newImages.splice(index, 1)
    newPreviews.splice(index, 1)

    setActivityForm({ ...activityForm, images: newImages })
    setImagePreviews(newPreviews)
  }

  // Remove PDF preview
  const removePdfPreview = (formType) => {
    if (formType === "circular") {
      setCircularForm({ ...circularForm, pdfFile: null })
    } else if (formType === "report") {
      setReportForm({ ...reportForm, pdfFile: null })
    }
    setPdfPreview(null)
  }

  const handleActivitySubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("title", activityForm.title)
      formData.append("description", activityForm.description)
      formData.append("activityDate", activityForm.activityDate)

      if (user?.role === "admin") {
        formData.append("schoolId", activityForm.schoolId)
      }

      // Append multiple images
      activityForm.images.forEach((image, index) => {
        formData.append("images", image)
      })

      await axios.post("/activities", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      addToast("Activity uploaded successfully!", "success")

      // Reset form
      setActivityForm({
        title: "",
        description: "",
        activityDate: "",
        schoolId: "",
        images: [],
      })

      // Clean up previews
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url))
      setImagePreviews([])
    } catch (error) {
      addToast(error.response?.data?.error || "Failed to upload activity", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleCircularSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("title", circularForm.title)
      formData.append("content", circularForm.content)
      formData.append("circularNumber", circularForm.circularNumber)
      formData.append("issueDate", circularForm.issueDate)
      formData.append("priority", circularForm.priority)

      if (circularForm.pdfFile) {
        formData.append("pdfFile", circularForm.pdfFile)
      }

      await axios.post("/circulars", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      addToast("Circular uploaded successfully!", "success")

      // Reset form
      setCircularForm({
        title: "",
        content: "",
        circularNumber: "",
        issueDate: "",
        priority: "medium",
        pdfFile: null,
      })
      setPdfPreview(null)
    } catch (error) {
      addToast(error.response?.data?.error || "Failed to upload circular", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleReportSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("title", reportForm.title)
      formData.append("reportType", reportForm.reportType)

      if (user?.role === "admin") {
        formData.append("schoolId", reportForm.schoolId)
      }

      formData.append("academicYear", reportForm.academicYear)
      formData.append("month", reportForm.month)
      formData.append("content", reportForm.content)

      if (reportForm.pdfFile) {
        formData.append("pdfFile", reportForm.pdfFile)
      }

      await axios.post("/reports", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      addToast("Report uploaded successfully!", "success")

      // Reset form
      setReportForm({
        title: "",
        reportType: "",
        schoolId: "",
        academicYear: "",
        month: "",
        content: "",
        pdfFile: null,
      })
      setPdfPreview(null)
    } catch (error) {
      addToast(error.response?.data?.error || "Failed to upload report", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="upload-page">
        <div className="page-header">
          <h1>Upload Content</h1>
          <p>Upload activities with images, circulars and reports with PDF files</p>
        </div>

        <div className="upload-tabs">
          <div className="tab-buttons">
            <button
              className={`tab-button ${activeTab === "activity" ? "active" : ""}`}
              onClick={() => setActiveTab("activity")}
            >
              🎯 Activity (Images)
            </button>
            <button
              className={`tab-button ${activeTab === "circular" ? "active" : ""}`}
              onClick={() => setActiveTab("circular")}
            >
              📄 Circular (PDF)
            </button>
            <button
              className={`tab-button ${activeTab === "report" ? "active" : ""}`}
              onClick={() => setActiveTab("report")}
            >
              📊 Report (PDF)
            </button>
          </div>

          {/* Activity Upload with Images */}
          {activeTab === "activity" && (
            <div className="tab-content">
              <div className="upload-card">
                <div className="card-header">
                  <h2>🎯 Upload School Activity</h2>
                  <p>Record school activities and upload up to 5 images</p>
                </div>
                <form onSubmit={handleActivitySubmit} className="upload-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Activity Title</label>
                      <input
                        type="text"
                        value={activityForm.title}
                        onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                        placeholder="Enter activity title"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Activity Date</label>
                      <input
                        type="date"
                        value={activityForm.activityDate}
                        onChange={(e) => setActivityForm({ ...activityForm, activityDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {user?.role === "admin" && (
                    <div className="form-group">
                      <label>School</label>
                      <select
                        value={activityForm.schoolId}
                        onChange={(e) => setActivityForm({ ...activityForm, schoolId: e.target.value })}
                        required
                      >
                        <option value="">Select school</option>
                        {schools.map((school) => (
                          <option key={school._id} value={school._id}>
                            {school.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={activityForm.description}
                      onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                      placeholder="Describe the activity in detail..."
                      rows="4"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Upload Images (Max 5 images, 5MB each)</label>
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/jpg,image/png,image/gif"
                      onChange={handleImageSelection}
                      className="file-input"
                    />
                    <div className="file-info">
                      <small>Supported formats: JPG, PNG, GIF | Max size: 5MB per image</small>
                    </div>
                  </div>

                  {/* Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div className="file-previews">
                      <h4>Selected Images ({imagePreviews.length}/5)</h4>
                      <div className="image-previews">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="image-preview">
                            <img src={preview.url || "/placeholder.svg"} alt={`Preview ${index + 1}`} />
                            <div className="image-info">
                              <span className="image-name">{preview.name}</span>
                              <span className="image-size">{preview.size}</span>
                            </div>
                            <button type="button" className="remove-btn" onClick={() => removeImagePreview(index)}>
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? "Uploading..." : "Upload Activity"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Circular Upload with PDF */}
          {activeTab === "circular" && (
            <div className="tab-content">
              <div className="upload-card">
                <div className="card-header">
                  <h2>📄 Upload Circular</h2>
                  <p>Issue official circulars with optional PDF attachment</p>
                </div>
                <form onSubmit={handleCircularSubmit} className="upload-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Circular Title</label>
                      <input
                        type="text"
                        value={circularForm.title}
                        onChange={(e) => setCircularForm({ ...circularForm, title: e.target.value })}
                        placeholder="Enter circular title"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Circular Number</label>
                      <input
                        type="text"
                        value={circularForm.circularNumber}
                        onChange={(e) => setCircularForm({ ...circularForm, circularNumber: e.target.value })}
                        placeholder="e.g., BMC/EDU/2024/001"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Issue Date</label>
                      <input
                        type="date"
                        value={circularForm.issueDate}
                        onChange={(e) => setCircularForm({ ...circularForm, issueDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Priority</label>
                      <select
                        value={circularForm.priority}
                        onChange={(e) => setCircularForm({ ...circularForm, priority: e.target.value })}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Content</label>
                    <textarea
                      value={circularForm.content}
                      onChange={(e) => setCircularForm({ ...circularForm, content: e.target.value })}
                      placeholder="Enter the circular content..."
                      rows="6"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Upload PDF (Optional, Max 10MB)</label>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => handlePdfSelection(e, "circular")}
                      className="file-input"
                    />
                    <div className="file-info">
                      <small>Supported format: PDF | Max size: 10MB</small>
                    </div>
                  </div>

                  {/* PDF Preview */}
                  {pdfPreview && pdfPreview.type === "circular" && (
                    <div className="file-previews">
                      <h4>Selected PDF</h4>
                      <div className="pdf-preview">
                        <div className="pdf-icon">📄</div>
                        <div className="pdf-info">
                          <span className="pdf-name">{pdfPreview.name}</span>
                          <span className="pdf-size">{pdfPreview.size}</span>
                        </div>
                        <button type="button" className="remove-btn" onClick={() => removePdfPreview("circular")}>
                          ✕
                        </button>
                      </div>
                    </div>
                  )}

                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? "Uploading..." : "Upload Circular"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Report Upload with PDF */}
          {activeTab === "report" && (
            <div className="tab-content">
              <div className="upload-card">
                <div className="card-header">
                  <h2>📊 Upload Report</h2>
                  <p>Submit progress reports with optional PDF attachment</p>
                </div>
                <form onSubmit={handleReportSubmit} className="upload-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Report Title</label>
                      <input
                        type="text"
                        value={reportForm.title}
                        onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                        placeholder="Enter report title"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Report Type</label>
                      <select
                        value={reportForm.reportType}
                        onChange={(e) => setReportForm({ ...reportForm, reportType: e.target.value })}
                        required
                      >
                        <option value="">Select report type</option>
                        <option value="monthly">Monthly Report</option>
                        <option value="quarterly">Quarterly Report</option>
                        <option value="annual">Annual Report</option>
                        <option value="academic">Academic Report</option>
                        <option value="attendance">Attendance Report</option>
                        <option value="performance">Performance Report</option>
                      </select>
                    </div>
                  </div>

                  {user?.role === "admin" && (
                    <div className="form-group">
                      <label>School</label>
                      <select
                        value={reportForm.schoolId}
                        onChange={(e) => setReportForm({ ...reportForm, schoolId: e.target.value })}
                        required
                      >
                        <option value="">Select school</option>
                        {schools.map((school) => (
                          <option key={school._id} value={school._id}>
                            {school.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="form-row">
                    <div className="form-group">
                      <label>Academic Year</label>
                      <input
                        type="text"
                        value={reportForm.academicYear}
                        onChange={(e) => setReportForm({ ...reportForm, academicYear: e.target.value })}
                        placeholder="e.g., 2024-25"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Month</label>
                      <select
                        value={reportForm.month}
                        onChange={(e) => setReportForm({ ...reportForm, month: e.target.value })}
                        required
                      >
                        <option value="">Select month</option>
                        <option value="january">January</option>
                        <option value="february">February</option>
                        <option value="march">March</option>
                        <option value="april">April</option>
                        <option value="may">May</option>
                        <option value="june">June</option>
                        <option value="july">July</option>
                        <option value="august">August</option>
                        <option value="september">September</option>
                        <option value="october">October</option>
                        <option value="november">November</option>
                        <option value="december">December</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Report Content</label>
                    <textarea
                      value={reportForm.content}
                      onChange={(e) => setReportForm({ ...reportForm, content: e.target.value })}
                      placeholder="Enter the report details and findings..."
                      rows="6"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Upload PDF (Optional, Max 10MB)</label>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => handlePdfSelection(e, "report")}
                      className="file-input"
                    />
                    <div className="file-info">
                      <small>Supported format: PDF | Max size: 10MB</small>
                    </div>
                  </div>

                  {/* PDF Preview */}
                  {pdfPreview && pdfPreview.type === "report" && (
                    <div className="file-previews">
                      <h4>Selected PDF</h4>
                      <div className="pdf-preview">
                        <div className="pdf-icon">📄</div>
                        <div className="pdf-info">
                          <span className="pdf-name">{pdfPreview.name}</span>
                          <span className="pdf-size">{pdfPreview.size}</span>
                        </div>
                        <button type="button" className="remove-btn" onClick={() => removePdfPreview("report")}>
                          ✕
                        </button>
                      </div>
                    </div>
                  )}

                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? "Uploading..." : "Upload Report"}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Upload
