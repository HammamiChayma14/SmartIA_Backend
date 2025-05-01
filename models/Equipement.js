import mongoose from 'mongoose';

const equipementSchema = new mongoose.Schema({
  designation: { type: String, required: true }, 
  marque: { type: String, required: true }, 
  modele: {  type: String, required: true }, 
  numeroSerie: { type: String, required: true, unique: true 
  }, 
  statut: { type: String, enum: ['en service', 'en panne', 'en maintenance'],default: 'en service'}, 
  qrCodeData: { type: String, unique: true },
  localisation:{ type:String ,required:true}

},
 {
  timestamps: true 
});

const Equipement = mongoose.model('Equipement', equipementSchema);

export default Equipement;
