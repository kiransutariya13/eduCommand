import mongoose from "mongoose"

const ReportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    reportType: {
      type: String,
      required: true,
      enum: ["monthly", "quarterly", "annual", "academic", "attendance", "performance"],
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
    },
    month: {
      type: String,
      enum: [
        "january",
        "february",
        "march",
        "april",
        "may",
        "june",
        "july",
        "august",
        "september",
        "october",
        "november",
        "december",
      ],
    },
    content: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileUrl: {
      type: String,
    },
    fileName: {
      type: String,
    },
    status: {
      type: String,
      enum: ["draft", "review", "published"],
      default: "draft",
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Report || mongoose.model("Report", ReportSchema)
