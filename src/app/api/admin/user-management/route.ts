import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";
import bcrypt from "bcryptjs"
import nodemailer from "nodemailer";

// Utility function to validate and convert to ObjectId
/*
const toObjectId = (id: string) => {
  if (mongoose.isValidObjectId(id)) {
    return new mongoose.Types.ObjectId(id);
  }
  throw new Error(`Invalid ObjectId: ${id}`);
};
*/

// Utility function to validate array of ids
/*
const toObjectIdArray = (ids: string[]) => {
  return ids
    .filter((id) => mongoose.isValidObjectId(id)) // Keep only valid IDs
    .map((id) => new mongoose.Types.ObjectId(id));
};
*/


// Create user in the database
export async function POST(req: Request) {
  try {
    const { name, email, role, factoryNumber, userID } = await req.json();
    console.log(name, email, role, factoryNumber, userID )

    if (!name || !email || !role) {
      return NextResponse.json(
        { message: "All fields (name, email, role) are required." },
        { status: 400 }
      );
    }

    await connectDB(); // Connect to MongoDB

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists." },
        { status: 409 }
      );
    }

    const randomPassword = generateRandomPassword(email);
    // console.log(randomPassword);
    const hashedPassword = await bcrypt.hash(randomPassword, 10); //Hash Password
    const isMatch = await bcrypt.compare(randomPassword, hashedPassword);
    console.log("Check Password: ",isMatch);

    // Create a new user
    const newUser = new User({
      userID,
      name,
      email,
      password: hashedPassword, // Placeholder password
      role,
      factory: factoryNumber || null,
    });

    await newUser.save(); // Save the new user to the database


    // Send the email with the generated password
    await sendEmail(email, name, randomPassword);




    return NextResponse.json(
      { message: "User created-successfully!", status:201},
    //   { message: "User created-successfully!", password: randomPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      // { message: "Internal Server Error!", error },
      { message: "Enter valid factory number", error },
      { status: 500 }
    );
  }
  function generateRandomPassword(email: string): string {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const emailPart = email.split("@")[0];
    const shuffledEmailPart = emailPart.split("").sort(() => 0.5 - Math.random()).join("");
    const password = `${shuffledEmailPart}@${randomNum}`;
    return password.substring(0, 12); // Limit password to 12 characters
  }






  async function sendEmail(to: string, userName: string, password: string) {
    try {
      console.log("sending Email");
      const transporter = nodemailer.createTransport({
        service: "gmail", // Use Gmail as an example
        auth: {
          user: "naveen.m.ihub@snsgroups.com", // Replace with your email
          pass: "ngwq brzo kchl swlw", // Replace with your email password or app-specific password
        },
      });

      // const mailOptions = {
      //   from: "naveen.m.ihub@snsgroups.com",
      //   to,
      //   subject: "Your New Account Credentials for MVP Tracker",
      //   html: `
      //     <p>Hello ${userName},</p>
      //     <p>Your account has been created successfully. Here are your login details:</p>
      //     <ul>
      //       <li><strong>Website:</strong> https://trl-two.vercel.app </li>
      //       <li><strong>Email:</strong> ${to}</li>
      //       <li><strong>Password:</strong> ${password}</li>
      //     </ul>
      //     <p>You couldn't change your password, so be sure to keep it safe!</p>
      //     <p>Best regards,<br />MVP Tracker</p>
      //   `,
      // };

      const mailOptions = {
        from: "naveen.m.ihub@snsgroups.com",
        to,
        subject: "Welcome to MVP Tracker – Your Account Credentials",
        html: `
          <p>Hello <strong>${userName}</strong>,</p>
          <p>Welcome to <strong>MVP Tracker</strong>! Your account has been created successfully, and you can now access the platform using the login details below:</p>
          
          <table style="border-collapse: collapse; width: 100%; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Website:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;"><a href="https://trl-two.vercel.app" target="_blank" style="color: #1a73e8; text-decoration: none;">https://trl-two.vercel.app</a></td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Email:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${to}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Password:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${password}</td>
            </tr>
          </table>
      
          <p><strong>Important:</strong> You cannot change your password at the moment, so please keep it secure and do not share it with anyone.</p>
      
          <p>If you encounter any issues or have any questions, feel free to reach out to our support team.</p>
      
          <p>We’re excited to have you on board and look forward to helping you track your progress efficiently!</p>
      
          <p>Best regards,<br />The MVP Tracker Team</p>
        `,
      };
      

      await transporter.sendMail(mailOptions);
      console.log("Email sent successfully!");
    } catch (error) {
      console.error("Error sending email:", error);
    }
  }



}

// Fetch all users in the database
export async function GET(req: NextRequest) {
  try {
    await connectDB(); // Connect to MongoDB

    const {searchParams} = new URL(req.url);
    const userID = searchParams.get("userID")

    if (!userID) {
      return NextResponse.json(
        {success: false, message: "Missing userID in request"},
        {status: 400}
    );
    }
    
    if (userID) {
      const users = await User.find({userID: userID})
      return NextResponse.json(users, { status: 200 });
    }else{
      const users = "No user found";
      return NextResponse.json(
        {users, message: "No user found"},
        {status: 200}
      )
    }

  } catch (error) {
    console.error("Error fetching users:", error);
    // return NextResponse.json({ message: "Failed to fetch users." }, { status: 500 });
    return NextResponse.json({ message: "No user found" }, { status: 500 });
  }
}


// Delete all users from the database
export async function DELETE(req: Request) {
  try {
    const { userId } = await req.json(); // Get user ID from the request body

    if (!userId) {
      return NextResponse.json({ message: "User ID is required." }, { status: 400 });
    }

    await connectDB(); // Connect to MongoDB
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "User deleted successfully." }, { status: 200 });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ message: "Failed to delete user." }, { status: 500 });
  }
}


// Updated user in the database
export async function PUT(req: Request) {
  try {
    const { userId, name, email, role, factoryNumber } = await req.json();

    if (!userId || !name || !email || !role) {
      return NextResponse.json(
        { message: "All fields (userId, name, email, role) are required." },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if email is already used by another user
    const existingUser = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUser) {
      return NextResponse.json(
        { message: "Email is already in use by another user." },
        { status: 409 }
      );
    }

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name,
        email,
        role,
        factory: factoryNumber || null,
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { message: "User not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "User updated successfully!", user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { message: "Failed to update user." },
      { status: 500 }
    );
  }
}