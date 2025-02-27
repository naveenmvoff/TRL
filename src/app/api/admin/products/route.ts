import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/product";
import User from "@/models/user";


export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    console.log("Received Data:", body); // Debugging
    // console.log("MongoDB connection state:", (await import("mongoose")).default.connection.readyState);
   
    const newProduct = new Product(body);
    console.log("Product okay"); // Debugging

    await newProduct.validate(); // Validate input data before saving
    console.log("Product validated successfully"); // Debugging
    await newProduct.save();
    
    console.log("Product saved successfully"); // Debugging
    return NextResponse.json({ message: "Product created successfully!" }, { status: 201 });
  } catch (error: any) {
    console.error("Error saving product:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json({ errors: messages }, { status: 400 });
    }

    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}


export async function GET() {
  try {
    await connectDB();
    const products = await Product.find();

    const productManagerIDs = products.map((product) => product.productManagerID);
    console.log("productManagerIDs:", productManagerIDs);


    // const productManagers = await User.find({ productsIds: { $in: role:Product Manager} });
    // const productManagers = await User.find({
    //   _id: { $in: productManagerIDs }, // Match IDs
    //   // role: "Product Manager", // Filter by role
    // });

    // console.log("productManagers:", productManagers)

    // const productManagers = await User.find({ _id: { $in: role:Product Manager } });
    // console.log("Product Manager Name: ", productManagers);
    // return NextResponse.json({ products, productManagers }, { status: 200 });
    return NextResponse.json(products, { status: 200 }); 

  } catch (error) {
    console.error("Error fetching Products:", error);
    return NextResponse.json({ message: "Failed to fetch Products." }, { status: 500 });
  }
}



export async function DELETE(req: Request) {
  try {
    const { productID } = await req.json();

    if (!productID) {
      return NextResponse.json({ message: "Product ID is required." }, { status: 400 });
    }

    await connectDB();
    const deletedProduct = await Product.findByIdAndDelete(productID);

    if (!deletedProduct) {
      return NextResponse.json({ message: "Product not found." }, { status: 404 });
    }
      // return NextResponse.json({ message: "Product not found." }, { status: 404 });
    
    return NextResponse.json({ message: "Product deleted successfully." }, { status: 200 });


  } catch (error) {
    console.error("Error deleting Product:", error);
    return NextResponse.json({ message: "Failed to delete Product." }, { status: 500 });
  }
}


// export async function PUT(req: NextRequest) {
//   try {
//     await connectDB();
//     const body = await req.json(); // Parse request body

//     const productId = body._id; // Extract _id from request body

//     console.log("Received Product ID:", productId);
//     console.log("Request Body:", body);

//     if (!productId) {
//       return NextResponse.json({ success: false, message: "Product ID is required." }, { status: 400 });
//     }

//     // Ensure the product exists
//     const existingProduct = await Product.findById(productId);
//     if (!existingProduct) {
//       return NextResponse.json({ success: false, message: "Product not found in database." }, { status: 404 });
//     }

//     // Update the product
//     const updatedProduct = await Product.findByIdAndUpdate(productId, body, {
//       new: true,
//       runValidators: true,
//     });

//     if (!updatedProduct) {
//       return NextResponse.json({ success: false, message: "Failed to update product." }, { status: 500 });
//     }

//     return NextResponse.json({ success: true, product: updatedProduct }, { status: 200 });
//   } catch (error) {
//     console.error("Error updating product:", error);
//     return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
//   }
// }



export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json(); // Parse request body

    const productId = body._id; // Extract _id from request body

    console.log("Received Product ID:", productId);
    console.log("Request Body:", body);

    if (!productId) {
      return NextResponse.json({ success: false, message: "Product ID is required." }, { status: 400 });
    }

    // Ensure the product exists
    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      return NextResponse.json({ success: false, message: "Product not found in database." }, { status: 404 });
    }

    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(productId, body, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) {
      return NextResponse.json({ success: false, message: "Failed to update product." }, { status: 500 });
    }

    return NextResponse.json({ success: true, product: updatedProduct }, { status: 200 });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}



