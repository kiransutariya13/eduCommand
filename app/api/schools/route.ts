import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import School from "@/models/School"

export async function GET() {
  try {
    await connectDB()

    const schools = await School.find({ isActive: true })
      .select("_id name address principalName contactNumber email totalStudents totalTeachers")
      .sort({ name: 1 })

    return NextResponse.json({ schools })
  } catch (error) {
    console.error("Schools fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
