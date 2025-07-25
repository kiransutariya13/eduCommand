import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Circular from "@/models/Circular"
import { verifyToken } from "@/lib/jwt"

export async function GET() {
  try {
    await connectDB()

    const circulars = await Circular.find({ status: "active" })
      .populate("uploadedBy", "fullName")
      .sort({ issueDate: -1 })

    return NextResponse.json({ circulars })
  } catch (error) {
    console.error("Circulars fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const token = request.cookies.get("token")?.value

if (!token) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}

const decoded = verifyToken(token) as any

if (!decoded) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}

    const { title, content, circularNumber, issueDate, priority } = await request.json()

    if (!title || !content || !circularNumber || !issueDate) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Check if circular number already exists
    const existingCircular = await Circular.findOne({ circularNumber })
    if (existingCircular) {
      return NextResponse.json({ error: "Circular number already exists" }, { status: 400 })
    }

    const circular = new Circular({
      title,
      content,
      circularNumber,
      issueDate: new Date(issueDate),
      priority: priority || "medium",
      uploadedBy: decoded.userId,
    })

    await circular.save()
    await circular.populate("uploadedBy")

    return NextResponse.json({
      message: "Circular created successfully",
      circular,
    })
  } catch (error) {
    console.error("Circular creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
