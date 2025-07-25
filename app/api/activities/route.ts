import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdirSync, existsSync } from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"
import connectDB from "@/lib/mongodb"
import Activity from "@/models/Activity"

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const formData = await req.formData()

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const activityDate = formData.get("activityDate") as string
    const schoolId = formData.get("schoolId") as string
    const file = formData.get("file") as File | null

    let fileUrl = ""
    let fileName = ""

    if (file) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      fileName = `${uuidv4()}-${file.name}`
      const uploadDir = path.join(process.cwd(), "public", "uploads", "activities")

      if (!existsSync(uploadDir)) {
        mkdirSync(uploadDir, { recursive: true })
      }

      await writeFile(path.join(uploadDir, fileName), buffer, (err) => {
        if (err) throw err
      })

      fileUrl = `/uploads/activities/${fileName}`
    }

    const activity = new Activity({
      title,
      description,
      activityDate,
      schoolId,
      fileUrl,
      fileName,
    })

    await activity.save()

    return NextResponse.json({ message: "Activity created successfully", activity }, { status: 201 })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Failed to upload activity" }, { status: 500 })
  }
}

export async function GET() {
  try {
    await connectDB()
    const activities = await Activity.find().populate("schoolId")
    return NextResponse.json({ activities }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 })
  }
}
