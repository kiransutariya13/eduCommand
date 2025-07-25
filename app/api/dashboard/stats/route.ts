import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import School from "@/models/School"
import User from "@/models/User"
import Activity from "@/models/Activity"
import Circular from "@/models/Circular"
import { verifyToken } from "@/lib/jwt"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const token = request.cookies.get("token")?.value
    const decoded = verifyToken(token) as any

    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get counts
    const [totalSchools, totalUsers, totalActivities, totalCirculars] = await Promise.all([
      School.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: true }),
      Activity.countDocuments(),
      Circular.countDocuments({ status: "active" }),
    ])

    // Get recent activities
    let activityQuery = {}
    if (decoded.role === "teacher" && decoded.schoolId) {
      activityQuery = { schoolId: decoded.schoolId }
    }

    const recentActivities = await Activity.find(activityQuery)
      .populate("schoolId", "name")
      .sort({ createdAt: -1 })
      .limit(5)

    // Get recent circulars
    const recentCirculars = await Circular.find({ status: "active" }).sort({ createdAt: -1 }).limit(5)

    return NextResponse.json({
      stats: {
        totalSchools,
        totalUsers,
        totalActivities,
        totalCirculars,
        recentActivities,
        recentCirculars,
      },
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
