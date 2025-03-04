import mongoose, { Document, Schema } from "mongoose";

interface SubLevel {
  subLevelName: string;
};

interface TRLDocument extends Document {
  trlLevelNumber: number;
  trlLevelName: string;
  subLevels: SubLevel[];
};

const subLevelSchema = new Schema<SubLevel>({
  subLevelName: { type: String, required: true },
});

const trlSchema = new Schema<TRLDocument>({
  trlLevelNumber: { type: Number, required: true, unique: true },
  trlLevelName: { type: String, required: true },
  subLevels: [subLevelSchema],
});

const TRL = mongoose.model<TRLDocument>("TRL", trlSchema);

export default TRL;






// // // // // // ==============================JAVASCRIPT .JS FILE CODE=====================================


// import mongoose from "mongoose";

// const subLevelSchema = new mongoose.Schema({
//   subLevelName: { type: String, required: true },
// });

// const trlSchema = new mongoose.Schema({
//   trlLevelNumber: { type: Number, required: true, unique: true },
//   trlLevelName: { type: String, required: true },
//   subLevels: [subLevelSchema],
// });

// const TRL = mongoose.model("TRL", trlSchema);

// export default TRL;


