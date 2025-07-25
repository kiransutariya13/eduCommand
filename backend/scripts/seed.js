const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
require("dotenv").config()

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/bhavnagar-schools", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

// Define schemas (same as in server.js)
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

const User = mongoose.model("User", UserSchema)
const School = mongoose.model("School", SchoolSchema)

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({})
    await School.deleteMany({})

    // Create schools
    const schools = await School.insertMany([
      {
        name: "Bhavnagar Municipal Primary School No. 1",
        address: "Station Road, Bhavnagar - 364001",
        principalName: "Mrs. Priya Patel",
        contactNumber: "+91-278-2512345",
        email: "principal.bps1@bhavnagar.gov.in",
        establishedYear: 1985,
        totalStudents: 450,
        totalTeachers: 18,
      },
      {
        name: "Bhavnagar Municipal Primary School No. 2",
        address: "Crescent Circle, Bhavnagar - 364002",
        principalName: "Mr. Rajesh Shah",
        contactNumber: "+91-278-2523456",
        email: "principal.bps2@bhavnagar.gov.in",
        establishedYear: 1992,
        totalStudents: 380,
        totalTeachers: 15,
      },
      {
        name: "Bhavnagar Municipal Primary School No. 3",
        address: "Ghogha Circle, Bhavnagar - 364003",
        principalName: "Mrs. Kavita Joshi",
        contactNumber: "+91-278-2534567",
        email: "principal.bps3@bhavnagar.gov.in",
        establishedYear: 1988,
        totalStudents: 520,
        totalTeachers: 22,
      },
      {
        name: "Bhavnagar Municipal Secondary School No. 1",
        address: "Takhteshwar Road, Bhavnagar - 364001",
        principalName: "Dr. Amit Desai",
        contactNumber: "+91-278-2545678",
        email: "principal.bss1@bhavnagar.gov.in",
        establishedYear: 1975,
        totalStudents: 680,
        totalTeachers: 35,
      },
      {
        name: "Bhavnagar Municipal Secondary School No. 2",
        address: "Nilambag Palace Road, Bhavnagar - 364002",
        principalName: "Mrs. Sunita Mehta",
        contactNumber: "+91-278-2556789",
        email: "principal.bss2@bhavnagar.gov.in",
        establishedYear: 1980,
        totalStudents: 590,
        totalTeachers: 28,
      },
    ])

    console.log("Schools created:", schools.length)

    // Create admin user
    const adminPassword = await bcrypt.hash("admin123", 10)
    const admin = new User({
      fullName: "System Administrator",
      email: "admin@bhavnagar.gov.in",
      password: adminPassword,
      role: "admin",
    })
    await admin.save()

    // Create teacher users
    const teacherPassword = await bcrypt.hash("teacher123", 10)
    const teachers = [
      {
        fullName: "Mrs. Meera Patel",
        email: "meera.patel@bhavnagar.gov.in",
        password: teacherPassword,
        role: "teacher",
        schoolId: schools[0]._id,
      },
      {
        fullName: "Mr. Kiran Shah",
        email: "kiran.shah@bhavnagar.gov.in",
        password: teacherPassword,
        role: "teacher",
        schoolId: schools[1]._id,
      },
      {
        fullName: "Mrs. Nisha Joshi",
        email: "nisha.joshi@bhavnagar.gov.in",
        password: teacherPassword,
        role: "teacher",
        schoolId: schools[2]._id,
      },
      {
        fullName: "Dr. Vikram Desai",
        email: "vikram.desai@bhavnagar.gov.in",
        password: teacherPassword,
        role: "teacher",
        schoolId: schools[3]._id,
      },
      {
        fullName: "Mrs. Ritu Mehta",
        email: "ritu.mehta@bhavnagar.gov.in",
        password: teacherPassword,
        role: "teacher",
        schoolId: schools[4]._id,
      },
    ]

    await User.insertMany(teachers)

    console.log("Sample data seeded successfully!")
    console.log("Admin Login: admin@bhavnagar.gov.in / admin123")
    console.log("Teacher Login: meera.patel@bhavnagar.gov.in / teacher123")

    process.exit(0)
  } catch (error) {
    console.error("Error seeding data:", error)
    process.exit(1)
  }
}

seedData()
