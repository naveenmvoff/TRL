import { NextRequest, NextResponse } from "next/server";
import Product from "../../../../models/product";
import { connectDB } from "../../../../lib/mongodb"; // Make sure this connects to MongoDB
import mongoose from "mongoose";

// Utility function to validate and convert to ObjectId
const toObjectId = (id: string) => {
  if (mongoose.isValidObjectId(id)) {
    return new mongoose.Types.ObjectId(id);
  }
  throw new Error(`Invalid ObjectId: ${id}`);
};

// Utility function to validate array of ids
const toObjectIdArray = (ids: string[]) => {
  return ids
    .filter((id) => mongoose.isValidObjectId(id)) // Keep only valid IDs
    .map((id) => new mongoose.Types.ObjectId(id));
};

// GET - Fetch all products
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // const userID = req.nextUrl.searchParams.get("userID");
    const { searchParams } = new URL(req.url);
    const userID = searchParams.get("userID");
    console.log("userID================", userID);

    if (!userID) {
      return NextResponse.json(
        { success: false, message: "Missing userID in request" },
        { status: 400 }
      );
    }
    const products = await Product.find({ userID: userID });
    

    console.log("GET products:", products);

    return NextResponse.json({ success: true, products }, { status: 200 });
  } catch (error) {
    console.error("GET products error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST - Create a product
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    console.log("BODY :", body);
    const {
      product,
      productManagerID,
      productViewer,
      description,
      problemStatement,
      solutionExpected,
      userID,
    } = body;

    if (
      !product ||
      !description ||
      !problemStatement ||
      !solutionExpected ||
      !userID
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }


    // Convert IDs to ObjectId safely
    const managerObjectId = productManagerID ? toObjectId(productManagerID) : null;
    const viewerObjectIds = toObjectIdArray(productViewer || []);

    const newProduct = new Product({
      userID: userID, // Make sure you pass userId from session in request body
      product,
      productManagerID: managerObjectId,
      productViewer: viewerObjectIds,
      description,
      problemStatement,
      solutionExpected,
    });

    await newProduct.save();
    return NextResponse.json(
      { success: true, product: newProduct },
      { status: 201 }
    );
  } catch (err) {
    console.error("Product creation error:", err);
    return NextResponse.json(
      { success: false, message: "Product creation failed" },
      { status: 500 }
    );
  }
}

// PUT - Update product
export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    console.log("PUT body:", body);
    const {
      productId,
      product,
      productManagerID,
      productViewer,
      description,
      problemStatement,
      solutionExpected,
    } = body;
    console.log("productId", productId);

    if (!mongoose.isValidObjectId(productId)) {
      return NextResponse.json(
        { success: false, message: "Invalid productId" },
        { status: 400 }
      );
    }

    const existingProduct = await Product.findById(productId);

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    // const updatedProduct = await Product.findByIdAndUpdate(
    //   productId,
    //   {
    //     userID: existingProduct.userID, // Preserve userID
    //     product,
    //     productManagerID,
    //     productViewer,
    //     description,
    //     problemStatement,
    //     solutionExpected,
    //   },
    //   { new: true }
    // );

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        product,
        productManagerID: mongoose.isValidObjectId(productManagerID)
          ? new mongoose.Types.ObjectId(String(productManagerID))
          : existingProduct.productManagerID,
        // productViewer: productViewer
        //   ? const toObjectIdArray = (ids: string[]) => ids.map((id) => new mongoose.Types.ObjectId(String(id)));
        //   : existingProduct.productViewer,
        productViewer: productViewer
          ? productViewer.map(
              (id: string) => new mongoose.Types.ObjectId(String(id))
            )
          : existingProduct.productViewer,

        description,
        problemStatement,
        solutionExpected,
      },
      { new: true }
    )
      .populate("userID", "name email")
      .populate("productManagerID", "name email")
      .populate("productViewer", "name email");

    return NextResponse.json(
      { success: true, product: updatedProduct },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT update product error:", error);
    return NextResponse.json(
      { success: false, message: "Product update failed" },
      { status: 500 }
    );
  }
}
