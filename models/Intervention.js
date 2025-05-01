import mongoose from "mongoose";

const interventionSchema = new mongoose.Schema({
  panne: { type: mongoose.Schema.Types.ObjectId, ref: "Panne", required: true },
  technicien: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  statut: { type: String, enum: ["Planifiée", "En cours", "Terminée"], default: "Planifiée" },
  actions: { type: String }, 
  piecesUtilisees: { 
  type: [String], 
  default: []
  },
  dateDebut: { type: Date, default: Date.now },
  dateFin: { type: Date } 
});

const Intervention = mongoose.model("Intervention", interventionSchema);
export default Intervention;
