import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb'; // Import the MongoDB connection function
import User from '@/models/user'; // Import the User model
import bcrypt from 'bcryptjs'; // Import bcrypt to compare passwords


export async function POST(req: Request) {
  // Parse request body (email and password)
  const { email, password } = await req.json();
  console.log(email, password); 

  if (!email || !password) {
    return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
  }

  try {
    // Connect to MongoDB
    await connectDB();

    // Find the user by email
    const user = await User.findOne({ email });
    console.log(user);

    // If user does not exist
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Check if the password matches (since you said you don't need encryption, just validating)
    const isPasswordMatch = await bcrypt.compare(password, user.password)
  
    if (!isPasswordMatch) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // If the user is an redirect to page based on the Role
    return NextResponse.json({ message: 'Login successful', role:user.role }, { status: 200 });
  } catch (error) {
    console.error('Server error', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
