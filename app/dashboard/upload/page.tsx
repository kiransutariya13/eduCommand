"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Activity, BarChart3 } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"
import DashboardLayout from "@/components/dashboard-layout"
import { useToast } from "@/hooks/use-toast"

interface School {
  _id: string
  name: string
}

export default function UploadPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(false)

  // Activity form state
  const [activityForm, setActivityForm] = useState({
    title: "",
    description: "",
    activityDate: "",
    schoolId: "",
  })

  // Circular form state
  const [circularForm, setCircularForm] = useState({
    title: "",
    content: "",
    circularNumber: "",
    issueDate: "",
    priority: "medium",
  })

  // Report form state
  const [reportForm, setReportForm] = useState({
    title: "",
    reportType: "",
    schoolId: "",
    academicYear: "",
    month: "",
    content: "",
  })

  useEffect(() => {
    fetchSchools()
  }, [])

  const fetchSchools = async () => {
    try {
      const response = await fetch("/api/schools")
      if (response.ok) {
        const data = await response.json()
        setSchools(data.schools)
      }
    } catch (error) {
      console.error("Error fetching schools:", error)
    }
  }

  const handleActivitySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: activityForm.title,
          description: activityForm.description,
          activityDate: activityForm.activityDate,
          schoolId: user?.role === "teacher" ? user.schoolId : activityForm.schoolId,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Activity uploaded successfully!",
        })

        setActivityForm({
          title: "",
          description: "",
          activityDate: "",
          schoolId: "",
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload activity. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCircularSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/circulars", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(circularForm),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Circular uploaded successfully!",
        })

        setCircularForm({
          title: "",
          content: "",
          circularNumber: "",
          issueDate: "",
          priority: "medium",
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload circular. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: reportForm.title,
          reportType: reportForm.reportType,
          schoolId: user?.role === "teacher" ? user.schoolId : reportForm.schoolId,
          academicYear: reportForm.academicYear,
          month: reportForm.month,
          content: reportForm.content,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Report uploaded successfully!",
        })

        setReportForm({
          title: "",
          reportType: "",
          schoolId: "",
          academicYear: "",
          month: "",
          content: "",
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Upload Content</h1>
            <p className="text-gray-600 mt-2">Upload activities, circulars, and reports to the system</p>
          </div>

          <Tabs defaultValue="activity" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="circular" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Circular
              </TabsTrigger>
              <TabsTrigger value="report" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Report
              </TabsTrigger>
            </TabsList>

            {/* Activity Upload */}
            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Upload School Activity
                  </CardTitle>
                  <CardDescription>Record and share school activities and events</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleActivitySubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="activity-title">Activity Title</Label>
                        <Input
                          id="activity-title"
                          placeholder="Enter activity title"
                          value={activityForm.title}
                          onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="activity-date">Activity Date</Label>
                        <Input
                          id="activity-date"
                          type="date"
                          value={activityForm.activityDate}
                          onChange={(e) => setActivityForm({ ...activityForm, activityDate: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    {user?.role === "admin" && (
                      <div className="space-y-2">
                        <Label htmlFor="activity-school">School</Label>
                        <Select
                          value={activityForm.schoolId}
                          onValueChange={(value) => setActivityForm({ ...activityForm, schoolId: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select school" />
                          </SelectTrigger>
                          <SelectContent>
                            {schools.map((school) => (
                              <SelectItem key={school._id} value={school._id}>
                                {school.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="activity-description">Description</Label>
                      <Textarea
                        id="activity-description"
                        placeholder="Describe the activity in detail..."
                        rows={4}
                        value={activityForm.description}
                        onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                        required
                      />
                    </div>

                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? "Uploading..." : "Upload Activity"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Circular Upload */}
            <TabsContent value="circular">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Upload Circular
                  </CardTitle>
                  <CardDescription>Issue official circulars and announcements</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCircularSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="circular-title">Circular Title</Label>
                        <Input
                          id="circular-title"
                          placeholder="Enter circular title"
                          value={circularForm.title}
                          onChange={(e) => setCircularForm({ ...circularForm, title: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="circular-number">Circular Number</Label>
                        <Input
                          id="circular-number"
                          placeholder="e.g., BMC/EDU/2024/001"
                          value={circularForm.circularNumber}
                          onChange={(e) => setCircularForm({ ...circularForm, circularNumber: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="circular-date">Issue Date</Label>
                        <Input
                          id="circular-date"
                          type="date"
                          value={circularForm.issueDate}
                          onChange={(e) => setCircularForm({ ...circularForm, issueDate: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="circular-priority">Priority</Label>
                        <Select
                          value={circularForm.priority}
                          onValueChange={(value) => setCircularForm({ ...circularForm, priority: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="circular-content">Content</Label>
                      <Textarea
                        id="circular-content"
                        placeholder="Enter the circular content..."
                        rows={6}
                        value={circularForm.content}
                        onChange={(e) => setCircularForm({ ...circularForm, content: e.target.value })}
                        required
                      />
                    </div>

                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? "Uploading..." : "Upload Circular"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Report Upload */}
            <TabsContent value="report">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Upload Report
                  </CardTitle>
                  <CardDescription>Submit progress reports and assessments</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleReportSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="report-title">Report Title</Label>
                        <Input
                          id="report-title"
                          placeholder="Enter report title"
                          value={reportForm.title}
                          onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="report-type">Report Type</Label>
                        <Select
                          value={reportForm.reportType}
                          onValueChange={(value) => setReportForm({ ...reportForm, reportType: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select report type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">Monthly Report</SelectItem>
                            <SelectItem value="quarterly">Quarterly Report</SelectItem>
                            <SelectItem value="annual">Annual Report</SelectItem>
                            <SelectItem value="academic">Academic Report</SelectItem>
                            <SelectItem value="attendance">Attendance Report</SelectItem>
                            <SelectItem value="performance">Performance Report</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {user?.role === "admin" && (
                      <div className="space-y-2">
                        <Label htmlFor="report-school">School</Label>
                        <Select
                          value={reportForm.schoolId}
                          onValueChange={(value) => setReportForm({ ...reportForm, schoolId: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select school" />
                          </SelectTrigger>
                          <SelectContent>
                            {schools.map((school) => (
                              <SelectItem key={school._id} value={school._id}>
                                {school.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="academic-year">Academic Year</Label>
                        <Input
                          id="academic-year"
                          placeholder="e.g., 2024-25"
                          value={reportForm.academicYear}
                          onChange={(e) => setReportForm({ ...reportForm, academicYear: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="report-month">Month</Label>
                        <Select
                          value={reportForm.month}
                          onValueChange={(value) => setReportForm({ ...reportForm, month: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select month" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="january">January</SelectItem>
                            <SelectItem value="february">February</SelectItem>
                            <SelectItem value="march">March</SelectItem>
                            <SelectItem value="april">April</SelectItem>
                            <SelectItem value="may">May</SelectItem>
                            <SelectItem value="june">June</SelectItem>
                            <SelectItem value="july">July</SelectItem>
                            <SelectItem value="august">August</SelectItem>
                            <SelectItem value="september">September</SelectItem>
                            <SelectItem value="october">October</SelectItem>
                            <SelectItem value="november">November</SelectItem>
                            <SelectItem value="december">December</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="report-content">Report Content</Label>
                      <Textarea
                        id="report-content"
                        placeholder="Enter the report details and findings..."
                        rows={6}
                        value={reportForm.content}
                        onChange={(e) => setReportForm({ ...reportForm, content: e.target.value })}
                        required
                      />
                    </div>

                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? "Uploading..." : "Upload Report"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
