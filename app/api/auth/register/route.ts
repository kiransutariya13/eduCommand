import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import School from "@/models/School"
import { signToken } from "@/lib/jwt"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { email, password, fullName, role, schoolId } = await request.json()

    if (!email || !password || !fullName || !role) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Validate school for teachers
    if (role === "teacher") {
      if (!schoolId) {
        return NextResponse.json({ error: "School is required for teachers" }, { status: 400 })
      }

      const school = await School.findById(schoolId)
      if (!school) {
        return NextResponse.json({ error: "Invalid school selected" }, { status: 400 })
      }
    }

    // Create new user
    const user = new User({
      email,
      password,
      fullName,
      role,
      schoolId: role === "teacher" ? schoolId : undefined,
    })

    await user.save()

    // Populate school data
    await user.populate("schoolId")

    // Generate JWT token
    const token = signToken({
      userId: user._id,
      email: user.email,
      role: user.role,
      schoolId: user.schoolId?._id,
    })

    const response = NextResponse.json({
      message: "Registration successful",
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        schoolId: user.schoolId?._id,
        schoolName: user.schoolId?.name,
      },
    })

    // Set HTTP-only cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
