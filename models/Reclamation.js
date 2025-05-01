import mongoose from "mongoose";

const reclamationSchema = new mongoose.Schema(
  {
    panne: { type: mongoose.Schema.Types.ObjectId, ref: "Panne", required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    description: { type: String, required: true },
    statut: {
      type: String,
      enum: ["En attente", "En cours", "Traitée", "Résolue"],
      default: "En attente",
    },
  },
  { timestamps: true }
);

const Reclamation = mongoose.model("Reclamation", reclamationSchema);
export default Reclamation;
