import mongoose from "mongoose";

const trlMasterSchema = new mongoose.Schema({
  trlLevelNumber: {
    type: Number,
    required: true,
  },
  trlLevelName: {
    type: String,
    required: true,
  },
  subLevels: [{
    subLevelName: {
      type: String,
      required: true
    }
  }]
}, {
  timestamps: true
});

const TrlMaster = mongoose.models.TrlMaster || mongoose.model('TrlMaster', trlMasterSchema);

export default TrlMaster;
