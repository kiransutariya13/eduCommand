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

  
  // Circular form state
  const [circularForm, setCircularForm] = useState({
    title: "",
    content: "",
    circularNumber: "",
    issueDate: "",
    priority: "medium",
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

  
 const handleCircularSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)

  if (
    !circularForm.title.trim() ||
    !circularForm.content.trim() ||
    !circularForm.circularNumber.trim() ||
    !circularForm.issueDate
  ) {
    toast({
      title: "Error",
      description: "Please fill all required fields before submitting.",
      variant: "destructive",
    })
    setLoading(false)
    return
  }

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
      description: error.message || "Failed to upload circular. Please try again.",
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
            <p className="text-gray-600 mt-2">Upload  circulars to the system</p>
          </div>

          <Tabs defaultValue="circular" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="circular" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Circular
              </TabsTrigger>
              </TabsList>

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

                     </Tabs>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
