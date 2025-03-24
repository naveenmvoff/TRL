import mongoose, { Document, Schema } from "mongoose";

interface SubLevel {
  subLevelName: string;
  subLevelNumber: number;
}

interface TRLDocument extends Document {
  trlLevelNumber: number;
  trlLevelName: string;
  subLevels: SubLevel[];
}

const subLevelSchema = new Schema<SubLevel>({
  subLevelName: { type: String, required: true },
  subLevelNumber: { type: Number, required: true },
});

const trlSchema = new Schema<TRLDocument>({
  trlLevelNumber: { type: Number, required: true, unique: true },
  trlLevelName: { type: String, required: true },
  subLevels: [subLevelSchema],
});

const TRL =
  mongoose.models.TRL || mongoose.model<TRLDocument>("TRL", trlSchema);

export default TRL;

// // // // // // // ==============================JAVASCRIPT .JS FILE CODE - when run this use the file extension as .js=====================================

// import mongoose from "mongoose";

// const subLevelSchema = new mongoose.Schema({
//   subLevelName: { type: String, required: true },
//   subLevelNumber: { type: Number, required: true },
// });

// const trlSchema = new mongoose.Schema({
//   trlLevelNumber: { type: Number, required: true, unique: true },
//   trlLevelName: { type: String, required: true },
//   subLevels: [subLevelSchema],
//   // startDate: { type: Date },
//   // estimatedDate: { type: Date },
//   // extendedDate: { type: Date },

// });

// const TRL = mongoose.model("TRL", trlSchema);

// export default TRL;
