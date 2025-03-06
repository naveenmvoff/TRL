import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },      // // // Need to work on this
    product: { type: String, required: [true, "Product name is required"] },
    productManagerID: {
      // type: String,
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productViewer: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
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
