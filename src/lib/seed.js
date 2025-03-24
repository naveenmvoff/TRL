// /// seeding - package.json - "seed": "src/lib/seed.js"
import mongoose from "mongoose";
import TRL from "../models/trlMasterSchema.js";
import { defaultTrlLevels } from "../models/trlData.js";
import dotenv from 'dotenv';
dotenv.config();

const seedTrlData = async () => {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI not set in .env file");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI, { dbName: "trl" });
    console.log("✅ Database connected successfully");

    await TRL.deleteMany();
    console.log("🗑️ Old TRL data removed");

    await TRL.insertMany(defaultTrlLevels);
    console.log("✅ TRL master data seeded successfully");
  } catch (error) {
    console.error("❌ Error seeding TRL data:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔗 Database connection closed");
  }
};

seedTrlData();



// import mongoose from "mongoose";
// import TRL from "../models/trlMasterSchema.js";
// import { defaultTrlLevels } from "../models/trlData.js";
// import dotenv from 'dotenv';
// dotenv.config();

// const seedTrlData = async () => {
//   try {
//     await mongoose.connect(process.env.MONGODB_URI || "", {
//       dbName: "trl",
//     });
//     console.log("✅ Database connected successfully");

//     await TRL.deleteMany();
//     console.log("🗑️ Old TRL data removed");

//     await TRL.insertMany(defaultTrlLevels);
//     console.log("✅ TRL master data seeded successfully");

//     await mongoose.connection.close();
//     console.log("🔗 Database connection closed");
//   } catch (error) {
//     console.error("❌ Error seeding TRL data:", error);
//     mongoose.connection.close();
//   }
// };

// seedTrlData();
