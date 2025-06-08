import mongoose from "mongoose";
const reclamationSchema = new mongoose.Schema(
  {
    equipement: { type: mongoose.Schema.Types.ObjectId, ref: "Equipement", required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    technicien: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }, // Technicien optionnel au début
    description: { type: String, required: true },
    diagnosticPdf: {data: Buffer,contentType: String},
    statut: {
      type: String,
      enum: ["En attente", "Validée", "Refusée", "Assignée", "Traitée", "Résolue","En cours"], // Ajout du statut "Assignée"
      default: "En attente",
    },
    justification: {
    type: String,
    required: function() { return this.statut === "Refusée"; }
  },
  },
  { timestamps: true }
);

const Reclamation = mongoose.model("Reclamation", reclamationSchema);
export default Reclamation;
