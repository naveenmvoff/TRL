import mongoose from "mongoose";

const TrlLevelSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "product",
    required: true,
  },
  trlLevelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TRL",
    required: true,
  },
  subLevelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TRL",
    required: true,
  },
  description: { type: String, default: "" },
  currentUpdate: { type: String, default: "" },
  status: {
    type: String,
    enum: ["completed", "progress", "pending", "to do"],
    default: "to do",
  },
  documentationLink: { type: String, default: "" },
  otherNotes: { type: String, default: "" },
  demoRequired: { type: Boolean, default: false },
  demoStatus: {
    type: String,
    enum: ["completed", "pending"],
    default: "pending",
  },
  startDate: { type: Date },
  estimatedDate: { type: Date },
  extendedDate: { type: Date },
});

const TrlLevelData =
  mongoose.models.LevelData || mongoose.model("LevelData", TrlLevelSchema);

export default TrlLevelData;
