import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reclamation: { type: mongoose.Schema.Types.ObjectId, ref: "Reclamation", required: true },
    message: { type: String, required: true },
    type: { 
      type: String, 
      enum: ["validation", "refus","Assignée"], 
      required: true 
    },
    lu: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
