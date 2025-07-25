import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Report from "@/models/Report"
import { verifyToken } from "@/lib/jwt"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const token = request.cookies.get("token")?.value
    const decoded = verifyToken(token) as any

    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let query = {}

    // If user is a teacher, only show reports from their school
    if (decoded.role === "teacher" && decoded.schoolId) {
      query = { schoolId: decoded.schoolId }
    }

    const reports = await Report.find(query)
      .populate("schoolId", "name")
      .populate("uploadedBy", "fullName")
      .sort({ createdAt: -1 })

    return NextResponse.json({ reports })
  } catch (error) {
    console.error("Reports fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const token = request.cookies.get("token")?.value
    const decoded = verifyToken(token) as any

    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, reportType, schoolId, academicYear, month, content } = await request.json()

    if (!title || !reportType || !academicYear || !content) {
      return NextResponse.json(
        { error: "Title, report type, academic year, and content are required" },
        { status: 400 },
      )
    }

    // Determine school ID based on user role
    let finalSchoolId = schoolId
    if (decoded.role === "teacher") {
      finalSchoolId = decoded.schoolId
    }

    if (!finalSchoolId) {
      return NextResponse.json({ error: "School ID is required" }, { status: 400 })
    }

    const report = new Report({
      title,
      reportType,
      schoolId: finalSchoolId,
      academicYear,
      month,
      content,
      uploadedBy: decoded.userId,
    })

    await report.save()
    await report.populate(["schoolId", "uploadedBy"])

    return NextResponse.json({
      message: "Report created successfully",
      report,
    })
  } catch (error) {
    console.error("Report creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
