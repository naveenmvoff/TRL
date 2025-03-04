import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    }, // // // Need to work on this
    product: { type: String, required: [true, "Product name is required"] }, 
    productManagerID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    productViewer: {
      type: Array,
    },
    description: { type: String, required: [true, "Description is required"] },
    problemStatement: {
      type: String,
      required: [true, "Problem statement is required"],
    },
    solutionExpected: {
      type: String,
      required: [true, "Solution expected is required"],
    },
  },
  { timestamps: true }
);

const Product =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);
export default Product;
