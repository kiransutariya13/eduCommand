"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Search, Filter, Calendar, Eye, AlertCircle } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"
import DashboardLayout from "@/components/dashboard-layout"

interface CircularData {
  _id: string
  title: string
  content: string
  circularNumber: string
  issueDate: string
  priority: string
  status: string
  uploadedBy: {
    _id: string
    fullName: string
  }
  createdAt: string
}

export default function CircularsPage() {
  const { user } = useAuth()
  const [circulars, setCirculars] = useState<CircularData[]>([])
  const [filteredCirculars, setFilteredCirculars] = useState<CircularData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPriority, setSelectedPriority] = useState("all")
  const [selectedMonth, setSelectedMonth] = useState("all")

  useEffect(() => {
    fetchCirculars()
  }, [])

  useEffect(() => {
    filterCirculars()
  }, [circulars, searchTerm, selectedPriority, selectedMonth])

  const fetchCirculars = async () => {
    try {
      const response = await fetch("/api/circulars")
      if (response.ok) {
        const data = await response.json()
        setCirculars(data.circulars)
      }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "destructive"
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const getPriorityIcon = (priority: string) => {
    if (priority === "urgent" || priority === "high") {
      return <AlertCircle className="h-4 w-4" />
    }
    return null
  }

  const getMonthName = (monthIndex: number) => {
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

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Official Circulars</h1>
            <p className="text-gray-600 mt-2">View all official circulars and announcements</p>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search circulars..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                    <SelectTrigger>
                      <SelectValue placeholder="All priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Month</label>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger>
                      <SelectValue placeholder="All months" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Months</SelectItem>
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {getMonthName(i)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Circulars List */}
          <div className="grid gap-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading circulars...</p>
              </div>
            ) : filteredCirculars.length > 0 ? (
              filteredCirculars.map((circular) => (
                <Card key={circular._id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-blue-600" />
                          {circular.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(circular.issueDate)}
                          </span>
                          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                            {circular.circularNumber}
                          </span>
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getPriorityColor(circular.priority)} className="flex items-center gap-1">
                          {getPriorityIcon(circular.priority)}
                          {circular.priority.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4 line-clamp-3">{circular.content}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">Issued by: {circular.uploadedBy.fullName}</div>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Read Full Circular
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No circulars found</h3>
                  <p className="text-gray-600">
                    {searchTerm || selectedPriority !== "all" || selectedMonth !== "all"
                      ? "Try adjusting your filters to see more circulars."
                      : "No circulars have been issued yet."}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
