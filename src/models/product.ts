import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    product: { type: String, required: [true, "Product name is required"] },
    productManagerID: {
      type: String,
      // type: object,
      // required: [true, "Product manager is required"],
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

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);
export default Product;