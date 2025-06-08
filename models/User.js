import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["Administrateur", "Technicien", "Client"], default: "Client" },
  statut: { type: Boolean, default: true },
  
  phone: { 
    type: String, 
    required: function() { return this.role !== 'Administrateur'; } 
  },
  
  address: { 
    type: String, 
    required: function() { return this.role !== 'Administrateur'; } 
  },
  
  
  resetPasswordToken: { type: String }, 
  resetPasswordExpires: { type: Date }
});

// Export du modèle User
const User = mongoose.model('User', UserSchema);

export default User;
