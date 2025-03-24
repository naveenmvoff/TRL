// // seed the user - npm run seed-admin

import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "", {
      dbName: "trl",
    });
    console.log("✅ MongoDB connected");

    const existingAdmin = await User.findOne({
      email: "mvn.learning@gmail.com",
    });
    if (existingAdmin) {
      console.log("⚠️ Admin already exists");
      return;
    }

    const randomPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    const adminUser = new User({
      userID: null,
      name: "Admin 1",
      email: "mvn.learning@gmail.com",
      password: hashedPassword,
      role: "Admin",
      factory: null,
    });

    await adminUser.save();
    console.log("✅ Admin user seeded successfully");

    // Send credentials email
    await sendEmail(adminUser.email, adminUser.name, randomPassword);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("✅ MongoDB connection closed");
  }
};

// Generate Random Password
function generateRandomPassword(): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const base = "admin";
  return `${base}@${randomNum}`;
}

// Send Email using Nodemailer
async function sendEmail(to: string, userName: string, password: string) {
  try {
    console.log("📧 Sending email...");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "naveen.m.ihub@snsgroups.com", // Replace with your email
        pass: "ngwq brzo kchl swlw",          // App-specific password
      },
    });

    const mailOptions = {
      from: "naveen.m.ihub@snsgroups.com",
      to,
      subject: "Your Admin Account Credentials",
      html: `
        <p>Hello ${userName},</p>
        <p>Your Admin account has been created. Here are your login details:</p>
        <ul>
          <li><strong>Email:</strong> ${to}</li>
          <li><strong>Password:</strong> ${password}</li>
        </ul>
        <p>Please change your password after your first login.</p>
        <p>Best regards,<br />The Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully!");
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
}

seedAdmin();



// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import User from "../models/user";
// import bcrypt from "bcryptjs";

// dotenv.config();

// const seedAdmin = async () => {
//   try {
//     await mongoose.connect(process.env.MONGODB_URI || "", {
//       dbName: "trl",
//     });
//     console.log("✅ MongoDB connected");

//     const existingAdmin = await User.findOne({
//       email: "naveen.m.ihub@gmail.com",
//     });
//     if (existingAdmin) {
//       console.log("⚠️ Admin already exists");
//       return;
//     }

//     const hashedPassword = await bcrypt.hash("fsdfdsf,dhfjhjdhfsjfh", 10);

//     const adminUser = new User({
//       userID: null,
//       name: "Admin 1",
//       email: "naveen.m.ihub@gmail.com",
//       password: hashedPassword,
//       role: "Admin", // Now valid
//       factory: null,
//     });

//     await adminUser.save();
//     console.log("✅ Admin user seeded successfully");
//   } catch (error) {
//     console.error("❌ Seeding failed:", error);
//   } finally {
//     await mongoose.disconnect();
//     console.log("✅ MongoDB connection closed");
//   }
// };

// seedAdmin();