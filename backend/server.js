const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
require("dotenv").config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use("/uploads", express.static("uploads"))

// Create uploads directories
const createUploadDirs = () => {
  const dirs = ["uploads/activities", "uploads/circulars", "uploads/reports"]

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  })
}

createUploadDirs()

// Multer configuration for different file types
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/activities/")
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  },
})

const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = req.baseUrl.includes("circulars") ? "uploads/circulars/" : "uploads/reports/"
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  },
})

const imageUpload = multer({
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true)
    } else {
      cb(new Error("Only image files are allowed!"), false)
    }
  },
})

const pdfUpload = multer({
  storage: pdfStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true)
    } else {
      cb(new Error("Only PDF files are allowed!"), false)
    }
  },
})

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/bhavnagar-schools", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

// Models
const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "teacher"], required: true },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School" },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
})

const SchoolSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  principalName: { type: String, required: true },
  contactNumber: { type: String, required: true },
  email: { type: String, required: true },
  establishedYear: { type: Number, required: true },
  totalStudents: { type: Number, default: 0 },
  totalTeachers: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
})

const ActivitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  activityDate: { type: Date, required: true },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  images: [
    {
      filename: String,
      originalName: String,
      path: String,
      size: Number,
      mimetype: String,
    },
  ],
  status: { type: String, enum: ["draft", "published"], default: "published" },
  createdAt: { type: Date, default: Date.now },
})

const CircularSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  circularNumber: { type: String, required: true, unique: true },
  issueDate: { type: Date, required: true },
  priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  pdfFile: {
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    mimetype: String,
  },
  status: { type: String, enum: ["draft", "published"], default: "published" },
  createdAt: { type: Date, default: Date.now },
})

const ReportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  reportType: { type: String, required: true },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
  academicYear: { type: String, required: true },
  month: { type: String, required: true },
  content: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  pdfFile: {
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    mimetype: String,
  },
  status: { type: String, enum: ["draft", "review", "published"], default: "published" },
  createdAt: { type: Date, default: Date.now },
})

const User = mongoose.model("User", UserSchema)
const School = mongoose.model("School", SchoolSchema)
const Activity = mongoose.model("Activity", ActivitySchema)
const Circular = mongoose.model("Circular", CircularSchema)
const Report = mongoose.model("Report", ReportSchema)

// Auth middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ error: "Access token required" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")
    const user = await User.findById(decoded.userId).populate("schoolId")
    if (!user) {
      return res.status(401).json({ error: "Invalid token" })
    }
    req.user = user
    next()
  } catch (error) {
    return res.status(403).json({ error: "Invalid token" })
  }
}

// Auth Routes
app.post("/api/auth/register", async (req, res) => {
  try {
    const { fullName, email, password, role, schoolId } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = new User({
      fullName,
      email,
      password,
      role,
      schoolId: role === "teacher" ? schoolId : undefined,
    })

    await user.save()
    res.status(201).json({ message: "User created successfully" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email }).populate("schoolId")
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" })
    }

    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(400).json({ error: "Invalid credentials" })
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || "your-secret-key", { expiresIn: "24h" })

    res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        schoolId: user.schoolId?._id,
        schoolName: user.schoolId?.name,
      },
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Schools Routes
app.get("/api/schools", authenticateToken, async (req, res) => {
  try {
    const schools = await School.find({ isActive: true })
    res.json(schools)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/schools", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" })
    }

    const school = new School(req.body)
    await school.save()
    res.status(201).json(school)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Activities Routes
app.get("/api/activities", authenticateToken, async (req, res) => {
  try {
    const query = {}
    if (req.user.role === "teacher") {
      query.schoolId = req.user.schoolId
    }

    const activities = await Activity.find(query)
      .populate("schoolId", "name")
      .populate("uploadedBy", "fullName")
      .sort({ createdAt: -1 })

    res.json(activities)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/activities", authenticateToken, imageUpload.array("images", 5), async (req, res) => {
  try {
    const { title, description, activityDate, schoolId } = req.body

    const activity = new Activity({
      title,
      description,
      activityDate,
      schoolId: req.user.role === "teacher" ? req.user.schoolId : schoolId,
      uploadedBy: req.user._id,
      images: req.files
        ? req.files.map((file) => ({
            filename: file.filename,
            originalName: file.originalname,
            path: file.path,
            size: file.size,
            mimetype: file.mimetype,
          }))
        : [],
    })

    await activity.save()
    await activity.populate("schoolId", "name")
    await activity.populate("uploadedBy", "fullName")

    res.status(201).json(activity)
  } catch (error) {
    // Clean up uploaded files on error
    if (req.files) {
      req.files.forEach((file) => {
        fs.unlink(file.path, (err) => {
          if (err) console.error("Error deleting file:", err)
        })
      })
    }
    res.status(500).json({ error: error.message })
  }
})

// Circulars Routes
app.get("/api/circulars", authenticateToken, async (req, res) => {
  try {
    const circulars = await Circular.find().populate("uploadedBy", "fullName").sort({ createdAt: -1 })

    res.json(circulars)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/circulars", authenticateToken, pdfUpload.single("pdfFile"), async (req, res) => {
  try {
    const { title, content, circularNumber, issueDate, priority } = req.body

    const circular = new Circular({
      title,
      content,
      circularNumber,
      issueDate,
      priority,
      uploadedBy: req.user._id,
      pdfFile: req.file
        ? {
            filename: req.file.filename,
            originalName: req.file.originalname,
            path: req.file.path,
            size: req.file.size,
            mimetype: req.file.mimetype,
          }
        : undefined,
    })

    await circular.save()
    await circular.populate("uploadedBy", "fullName")

    res.status(201).json(circular)
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting file:", err)
      })
    }
    res.status(500).json({ error: error.message })
  }
})

// Reports Routes
app.get("/api/reports", authenticateToken, async (req, res) => {
  try {
    const query = {}
    if (req.user.role === "teacher") {
      query.schoolId = req.user.schoolId
    }

    const reports = await Report.find(query)
      .populate("schoolId", "name")
      .populate("uploadedBy", "fullName")
      .sort({ createdAt: -1 })

    res.json(reports)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/reports", authenticateToken, pdfUpload.single("pdfFile"), async (req, res) => {
  try {
    const { title, reportType, schoolId, academicYear, month, content } = req.body

    const report = new Report({
      title,
      reportType,
      schoolId: req.user.role === "teacher" ? req.user.schoolId : schoolId,
      academicYear,
      month,
      content,
      uploadedBy: req.user._id,
      pdfFile: req.file
        ? {
            filename: req.file.filename,
            originalName: req.file.originalname,
            path: req.file.path,
            size: req.file.size,
            mimetype: req.file.mimetype,
          }
        : undefined,
    })

    await report.save()
    await report.populate("schoolId", "name")
    await report.populate("uploadedBy", "fullName")

    res.status(201).json(report)
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting file:", err)
      })
    }
    res.status(500).json({ error: error.message })
  }
})

// Download Routes
app.get("/api/download/activity-image/:activityId/:imageId", authenticateToken, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.activityId)
    if (!activity) {
      return res.status(404).json({ error: "Activity not found" })
    }

    const image = activity.images.id(req.params.imageId)
    if (!image) {
      return res.status(404).json({ error: "Image not found" })
    }

    const filePath = path.join(__dirname, image.path)
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" })
    }

    res.download(filePath, image.originalName)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get("/api/download/circular-pdf/:circularId", authenticateToken, async (req, res) => {
  try {
    const circular = await Circular.findById(req.params.circularId)
    if (!circular || !circular.pdfFile) {
      return res.status(404).json({ error: "PDF not found" })
    }

    const filePath = path.join(__dirname, circular.pdfFile.path)
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" })
    }

    res.download(filePath, circular.pdfFile.originalName)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get("/api/download/report-pdf/:reportId", authenticateToken, async (req, res) => {
  try {
    const report = await Report.findById(req.params.reportId)
    if (!report || !report.pdfFile) {
      return res.status(404).json({ error: "PDF not found" })
    }

    const filePath = path.join(__dirname, report.pdfFile.path)
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" })
    }

    res.download(filePath, report.pdfFile.originalName)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Dashboard Stats
app.get("/api/dashboard/stats", authenticateToken, async (req, res) => {
  try {
    let stats = {}

    if (req.user.role === "admin") {
      stats = {
        totalSchools: await School.countDocuments({ isActive: true }),
        totalUsers: await User.countDocuments({ isActive: true }),
        totalActivities: await Activity.countDocuments(),
        totalCirculars: await Circular.countDocuments(),
        totalReports: await Report.countDocuments(),
      }
    } else {
      stats = {
        schoolActivities: await Activity.countDocuments({ schoolId: req.user.schoolId }),
        totalCirculars: await Circular.countDocuments(),
        schoolReports: await Report.countDocuments({ schoolId: req.user.schoolId }),
      }
    }

    res.json(stats)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Users Routes (Admin only)
app.get("/api/users", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" })
    }

    const users = await User.find({ isActive: true })
      .populate("schoolId", "name")
      .select("-password")
      .sort({ createdAt: -1 })

    res.json(users)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
