import mongoose from 'mongoose';
const panneSchema = new mongoose.Schema({
  equipement: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipement', required: true },
  description: { type: String, required: true },
  statut: { type: String, enum: ['En attente', 'En cours', 'Résolue'], default: 'En attente' },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  technicien: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
  dateCreation: { type: Date, default: Date.now }
});

const Panne = mongoose.model('Panne', panneSchema);
export default Panne;
