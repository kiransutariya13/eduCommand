const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/bhavnagar-schools"

// Models
const SchoolSchema = new mongoose.Schema(
  {
    name: String,
    address: String,
    principalName: String,
    contactNumber: String,
    email: String,
    totalStudents: { type: Number, default: 0 },
    totalTeachers: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
)

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true },
    password: String,
    fullName: String,
    role: { type: String, enum: ["admin", "teacher"] },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School" },
    phone: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
)

const School = mongoose.model("School", SchoolSchema)
const User = mongoose.model("User", UserSchema)

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log("Connected to MongoDB")

    // Clear existing data
    await School.deleteMany({})
    await User.deleteMany({})
    console.log("Cleared existing data")

    // Create schools
    const schools = await School.insertMany([
      {
        name: "Bhavnagar Primary School 1",
        address: "Station Road, Bhavnagar",
        principalName: "Dr. Rajesh Patel",
        contactNumber: "9876543210",
        email: "bps1@bhavnagar.gov.in",
        totalStudents: 450,
        totalTeachers: 18,
      },
      {
        name: "Bhavnagar Primary School 2",
        address: "College Road, Bhavnagar",
        principalName: "Mrs. Priya Shah",
        contactNumber: "9876543211",
        email: "bps2@bhavnagar.gov.in",
        totalStudents: 380,
        totalTeachers: 15,
      },
      {
        name: "Bhavnagar High School 1",
        address: "Gandhi Chowk, Bhavnagar",
        principalName: "Mr. Kiran Modi",
        contactNumber: "9876543212",
        email: "bhs1@bhavnagar.gov.in",
        totalStudents: 650,
        totalTeachers: 25,
      },
      {
        name: "Bhavnagar High School 2",
        address: "Market Area, Bhavnagar",
        principalName: "Mrs. Sunita Joshi",
        contactNumber: "9876543213",
        email: "bhs2@bhavnagar.gov.in",
        totalStudents: 580,
        totalTeachers: 22,
      },
      {
        name: "Bhavnagar Secondary School",
        address: "New Area, Bhavnagar",
        principalName: "Dr. Amit Desai",
        contactNumber: "9876543214",
        email: "bss@bhavnagar.gov.in",
        totalStudents: 720,
        totalTeachers: 28,
      },
    ])

    console.log("Created schools:", schools.length)

    // Hash password
    const hashedPassword = await bcrypt.hash("admin123", 10)

    // Create users
    const users = await User.insertMany([
      {
        email: "admin@bhavnagar.gov.in",
        password: hashedPassword,
        fullName: "System Administrator",
        role: "admin",
        phone: "9876543200",
      },
      {
        email: "teacher1@bhavnagar.gov.in",
        password: hashedPassword,
        fullName: "Ramesh Kumar",
        role: "teacher",
        schoolId: schools[0]._id,
        phone: "9876543201",
      },
      {
        email: "teacher2@bhavnagar.gov.in",
        password: hashedPassword,
        fullName: "Meera Patel",
        role: "teacher",
        schoolId: schools[1]._id,
        phone: "9876543202",
      },
      {
        email: "teacher3@bhavnagar.gov.in",
        password: hashedPassword,
        fullName: "Suresh Joshi",
        role: "teacher",
        schoolId: schools[2]._id,
        phone: "9876543203",
      },
    ])

    console.log("Created users:", users.length)
    console.log("Database seeded successfully!")
  } catch (error) {
    console.error("Seeding error:", error)
  } finally {
    await mongoose.disconnect()
  }
}

seedDatabase()
