import mongoose from "mongoose";
import { defaultTrlLevels } from "./trlData";

// Sub-level schema (for each TRL sub-level entry)
const SubLevelSchema = new mongoose.Schema({
  subLevelName: { type: String, required: true },
  description: { type: String, default: "" },
  status: { type: String, enum: ["completed", "in progress", "pending"], default: "to do" },
  documentationLink: { type: String, default: "" },
  otherNotes: { type: String, default: "" },
  demoRequired: { type: Boolean, default: false },
  demoStatus: { type: String, enum: ["completed", "pending"], default: "pending" },
  startDate: { type: Date },
  estimatedDate: { type: Date },
  extendedDate: { type: Date }
}, { _id: false });

// TRL Level schema (covers each of the 9 levels)
const TrlLevelSchema = new mongoose.Schema({
  trlLevelNumber: { type: Number, required: true },
  trlLevelName: { type: String, required: true },
}, { _id: false });

// Function to generate default TRL levels for new products
function buildTrlLevelsForNewProduct() {
  return defaultTrlLevels.map(level => ({
    trlLevelNumber: level.trlLevelNumber,
    trlLevelName: level.trlLevelName,
    status: "pending",
    subLevels: level.subLevels.map(sub => ({
      subLevelName: sub.subLevelName,
      description: "",
      status: "pending",
      documentationLink: "",
      otherNotes: "",
      demoRequired: false,
      demoStatus: "pending",
      startDate: null,
      estimatedDate: null,
      extendedDate: null
    }))
  }));
}

const ProductSchema = new mongoose.Schema(
  {
    product: { type: String, required: [true, "Product name is required"] },
    productManagerID: { type: String },
    productViewer: { type: Array },
    description: { type: String, required: [true, "Description is required"] },
    problemStatement: { type: String, required: [true, "Problem statement is required"] },
    solutionExpected: { type: String, required: [true, "Solution expected is required"] },
    trllevels: {
      type: [TrlLevelSchema],
      default: buildTrlLevelsForNewProduct  // <- Correct way to auto-populate TRL levels
    }
  },
  { timestamps: true }
);

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

export default Product;
