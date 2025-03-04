import mongoose from "mongoose";
import TRL from "../models/trlMasterSchema.js";
import { defaultTrlLevels } from "../models/trlData.js";

const MONGO_URI = "mongodb://localhost:27017/trl"; // Adjust as needed

const seedTrlData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Database connected successfully");

    await TRL.deleteMany();
    console.log("🗑️ Old TRL data removed");

    await TRL.insertMany(defaultTrlLevels);
    console.log("✅ TRL master data seeded successfully");

    await mongoose.connection.close();
    console.log("🔗 Database connection closed");
  } catch (error) {
    console.error("❌ Error seeding TRL data:", error);
    mongoose.connection.close();
  }
};

seedTrlData();



// import mongoose from "mongoose";
// import TRL from "../models/trlMasterSchema.ts";
// import { defaultTrlLevels } from "../models/trlData.ts"

// const MONGO_URI = 'mongodb://localhost:27017/trl'; 

// const seedTrlData = async () => {
//   try {
//     await mongoose.connect(MONGO_URI);
//     console.log("Database connected successfully");

//     await TRL.deleteMany(); // Clear existing data
//     console.log("Old TRL data removed");

//     await TRL.insertMany(defaultTrlLevels);
//     console.log("TRL master data seeded successfully");

//     mongoose.connection.close();
//   } catch (error) {
//     console.error("Error seeding TRL data:", error);
//     mongoose.connection.close();
//   }
// };

// seedTrlData();
